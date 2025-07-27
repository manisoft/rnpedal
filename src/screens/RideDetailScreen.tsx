import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { supabase } from '../services/supabase';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

interface Props {
    navigation: StackNavigationProp<any>;
    route: RouteProp<any>;
}

const RideDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { rideId } = route.params;
    const [ride, setRide] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (rideId === 'new') {
            setRide(null);
            setLoading(false);
            return;
        }
        const fetchRide = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('rides')
                .select('*')
                .eq('id', rideId)
                .single();
            setRide(data);
            setLoading(false);
        };
        fetchRide();
    }, [rideId]);

    const getRouteCoordinates = (routeData: any): { latitude: number; longitude: number }[] => {
        if (!routeData || !routeData.geometry || !routeData.geometry.coordinates) return [];
        return routeData.geometry.coordinates
            .filter((coord: number[]) => Array.isArray(coord) && coord.length === 2 && Number.isFinite(coord[0]) && Number.isFinite(coord[1]))
            .map((coord: number[]) => ({ latitude: coord[1], longitude: coord[0] }));
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator />
            ) : ride ? (
                <>
                    <Text style={styles.title}>{ride.title || 'Untitled Ride'}</Text>
                    <Text>{new Date(ride.start_time).toLocaleString()}</Text>
                    <Text>{(ride.distance / 1000).toFixed(1)} km</Text>
                    <MapView
                        style={styles.map}
                        provider={PROVIDER_DEFAULT}
                        initialRegion={{
                            latitude: getRouteCoordinates(ride.route_data)[0]?.latitude || 0,
                            longitude: getRouteCoordinates(ride.route_data)[0]?.longitude || 0,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                        customMapStyle={[]}
                    >
                        <Polyline
                            coordinates={getRouteCoordinates(ride.route_data)}
                            strokeColor="#007FFF"
                            strokeWidth={4}
                        />
                    </MapView>
                </>
            ) : (
                <Text>No ride found.</Text>
            )}
            <Button title="Back" onPress={() => navigation.goBack()} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
    map: { width: '100%', height: 300, marginVertical: 16 },
});

export default RideDetailScreen;
