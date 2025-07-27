import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../components/AuthProvider';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

interface Props {
    navigation: StackNavigationProp<any>;
    route: RouteProp<any>;
}

const SignupScreen: React.FC<Props> = ({ navigation }) => {
    const { signUp, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async () => {
        try {
            await signUp(email, password);
            // navigation.replace('Dashboard');
            // Navigation will be handled by auth state
        } catch (err: any) {
            setError(err.message || 'Signup failed');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>
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
                <Button title="Sign Up" onPress={handleSignup} />
            )}
            <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 12, marginBottom: 12 },
    error: { color: 'red', marginBottom: 12 },
});

export default SignupScreen;
