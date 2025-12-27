import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

interface User {
    email: string;
    full_name?: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isLoading: boolean;
    login: (token: string, email: string) => Promise<void>;
    logout: () => Promise<void>;
    loadToken: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
    token: null,
    user: null,
    isLoading: true,
    login: async (token: string, email: string) => {
        await AsyncStorage.setItem('user_token', token);
        await AsyncStorage.setItem('user_email', email);
        set({ token, user: { email }, isLoading: false });
    },
    logout: async () => {
        await AsyncStorage.removeItem('user_token');
        await AsyncStorage.removeItem('user_email');
        set({ token: null, user: null, isLoading: false });
    },
    loadToken: async () => {
        try {
            const token = await AsyncStorage.getItem('user_token');
            const email = await AsyncStorage.getItem('user_email');
            if (token && email) {
                set({ token, user: { email }, isLoading: false });
            } else {
                set({ token: null, user: null, isLoading: false });
            }
        } catch (e) {
            set({ token: null, user: null, isLoading: false });
        }
    },
}));

export const api = {
    post: async (endpoint: string, body: any) => {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'API Error');
            return data;
        } catch (error: any) {
            throw new Error(error.message || 'Network Error');
        }
    },
    get: async (endpoint: string, token: string) => {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'API Error');
            return data;
        } catch (error: any) {
            throw new Error(error.message || 'Network Error');
        }
    }
};
