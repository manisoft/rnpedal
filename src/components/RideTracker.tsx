import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, StyleSheet, Platform, AppState, Alert, PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { getMapStyleUrl } from '../utils/theme';
import MapView, { Polyline, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';

interface RideTrackerProps {
    userId: string;
    onRideEnd: (rideId: string) => void;
}

const RideTracker: React.FC<RideTrackerProps> = ({ userId, onRideEnd }) => {
    const [tracking, setTracking] = useState(false);
    const [positions, setPositions] = useState<{ latitude: number; longitude: number; timestamp: number }[]>([]);
    const [rideId, setRideId] = useState<string | null>(null);
    const watchId = useRef<number | null>(null);

    const requestLocationPermissions = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            ]);
            return (
                granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED &&
                granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED &&
                granted[PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
            );
        } else if (Platform.OS === 'ios') {
            Alert.alert(
                'Background Location',
                'To keep tracking your ride in the background, please allow "Always" location access when prompted.'
            );
        }
        return true;
    };

    useEffect(() => {
        let appStateSubscription: any;
        if (tracking) {
            requestLocationPermissions().then(granted => {
                if (granted) {
                    startLocationWatch();
                    appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
                } else {
                    Alert.alert('Permission Denied', 'Location permissions are required to track your ride.');
                    setTracking(false);
                }
            });
        } else {
            stopLocationWatch();
            if (appStateSubscription) appStateSubscription.remove();
        }
        return () => {
            stopLocationWatch();
            if (appStateSubscription) appStateSubscription.remove();
        };
        // eslint-disable-next-line
    }, [tracking]);

    const startLocationWatch = () => {
        watchId.current = Geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setPositions(prev => [...prev, { latitude, longitude, timestamp: pos.timestamp }]);
            },
            (error) => {
                Alert.alert('Location Error', error.message);
            },
            {
                enableHighAccuracy: true,
                distanceFilter: Platform.OS === 'ios' ? 5 : 2,
                interval: Platform.OS === 'ios' ? 3000 : 2000,
                fastestInterval: Platform.OS === 'ios' ? 2000 : 1000,
                showsBackgroundLocationIndicator: Platform.OS === 'ios',
                forceRequestLocation: true,
            }
        );
    };

    const stopLocationWatch = () => {
        if (watchId.current !== null) {
            Geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
    };

    const handleAppStateChange = (nextAppState: string) => {
        if (Platform.OS === 'android') {
            if (nextAppState === 'background') {
                stopLocationWatch();
                watchId.current = Geolocation.watchPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;
                        setPositions(prev => [...prev, { latitude, longitude, timestamp: pos.timestamp }]);
                    },
                    (error) => {
                        Alert.alert('Location Error', error.message);
                    },
                    {
                        enableHighAccuracy: false,
                        distanceFilter: 10,
                        interval: 10000,
                        fastestInterval: 5000,
                        showsBackgroundLocationIndicator: true,
                        forceRequestLocation: true,
                    }
                );
            } else if (nextAppState === 'active') {
                stopLocationWatch();
                startLocationWatch();
            }
        } else if (Platform.OS === 'ios') {
            if (nextAppState === 'background') {
                Alert.alert(
                    'Background Tracking',
                    'Your ride is being tracked in the background. For best results, keep the app open.'
                );
            }
        }
    };

    const handleStartRide = async () => {
        setTracking(true);
        setPositions([]);
        setRideId(null);
    };

    const handleEndRide = async () => {
        setTracking(false);
        const routeGeoJSON = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: positions.map(p => [p.longitude, p.latitude]),
            },
        };
        const { data, error } = await supabase
            .from('rides')
            .insert({
                user_id: userId,
                start_time: new Date(positions[0]?.timestamp || Date.now()).toISOString(),
                end_time: new Date(positions[positions.length - 1]?.timestamp || Date.now()).toISOString(),
                distance: 0,
                route_data: routeGeoJSON,
                is_live: false,
            })
            .select();
        if (error) {
            Alert.alert('Error saving ride', error.message);
        } else {
            setRideId(data[0]?.id || null);
            onRideEnd(data[0]?.id || '');
        }
        setPositions([]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{tracking ? 'Tracking Ride...' : 'Ready to Start Ride'}</Text>
            <Button title={tracking ? 'End Ride' : 'Start Ride'} onPress={tracking ? handleEndRide : handleStartRide} />
            <Text>Points: {positions.length}</Text>
            {positions.length > 0 && (
                <MapView
                    style={styles.map}
                    provider={PROVIDER_DEFAULT}
                    initialRegion={{
                        latitude: positions[0].latitude,
                        longitude: positions[0].longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    region={positions.length > 0 ? {
                        latitude: positions[positions.length - 1].latitude,
                        longitude: positions[positions.length - 1].longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    } : undefined}
                >
                    <UrlTile
                        urlTemplate={getMapStyleUrl()}
                        maximumZ={19}
                        flipY={false}
                    />
                    <Polyline
                        coordinates={positions.map(p => ({ latitude: p.latitude, longitude: p.longitude }))}
                        strokeColor="#007FFF"
                        strokeWidth={4}
                    />
                </MapView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    map: { width: '100%', height: 300, marginVertical: 16 },
});

export default RideTracker;
