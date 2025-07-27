import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

export interface AuthContextType {
    user: any;
    session: any;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const sessionData = await AsyncStorage.getItem('session');
            if (sessionData) {
                setSession(JSON.parse(sessionData));
                setUser(JSON.parse(sessionData)?.user ?? null);
            }
            setLoading(false);
        };
        init();
    }, []);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) {
            throw (error.message || 'Login failed');
        }
        if (!data.session || !data.user) {
            throw 'Invalid login response from server.';
        }
        setSession(data.session);
        setUser(data.user);
        await AsyncStorage.setItem('session', JSON.stringify(data.session));
    };

    const signUp = async (email: string, password: string) => {
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({ email, password });
        setLoading(false);
        if (error) {
            throw (error.message || 'Signup failed');
        }
        if (!data.session || !data.user) {
            throw 'Invalid signup response from server.';
        }
        setSession(data.session);
        setUser(data.user);
        await AsyncStorage.setItem('session', JSON.stringify(data.session));
    };

    const signOut = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        await AsyncStorage.removeItem('session');
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
