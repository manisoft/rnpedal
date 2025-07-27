import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../services/supabase';
import RideTracker from '../components/RideTracker';
import { StackNavigationProp } from '@react-navigation/stack';

interface Ride {
    id: string;
    title: string;
    start_time: string;
    distance: number;
    route_data: any;
}

interface Props {
    navigation: StackNavigationProp<any>;
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
    const { user, signOut } = useAuth();
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRides = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('rides')
                .select('*')
                .eq('user_id', user?.id)
                .order('start_time', { ascending: false });
            if (error) {
                setRides([]);
            } else {
                setRides(data || []);
            }
            setLoading(false);
        };
        fetchRides();
    }, [user]);

    const handleRideEnd = (rideId: string) => {
        navigation.navigate('RideDetail', { rideId });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dashboard</Text>
            <Button title="Sign Out" onPress={signOut} />
            <RideTracker userId={user?.id} onRideEnd={handleRideEnd} />
            {loading ? (
                <ActivityIndicator />
            ) : (
                <FlatList
                    data={rides}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.rideCard}>
                            <Text style={styles.rideTitle}>{item.title || 'Untitled Ride'}</Text>
                            <Text>{new Date(item.start_time).toLocaleString()}</Text>
                            <Text>{(item.distance / 1000).toFixed(1)} km</Text>
                            <Button title="View" onPress={() => navigation.navigate('RideDetail', { rideId: item.id })} />
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
    rideCard: { padding: 16, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12 },
    rideTitle: { fontSize: 18, fontWeight: 'bold' },
});

export default DashboardScreen;
