import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../components/AuthProvider';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

interface Props {
    navigation: StackNavigationProp<any>;
    route: RouteProp<any>;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const { signIn, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        try {
            await signIn(email, password);
            // navigation.replace('Dashboard');
            // Navigation will be handled by auth state
        } catch (err: any) {
            setError(err.message || 'Login failed');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            {loading ? (
                <ActivityIndicator />
            ) : (
                <Button title="Login" onPress={handleLogin} />
            )}
            <Button title="Sign Up" onPress={() => navigation.navigate('Signup')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 12, marginBottom: 12 },
    error: { color: 'red', marginBottom: 12 },
});

export default LoginScreen;
