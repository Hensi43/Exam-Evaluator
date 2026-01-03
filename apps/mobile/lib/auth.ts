import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig } from './config';

const API_URL = AppConfig.apiUrl;

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
    login: async (formData: FormData) => {
        try {
            const response = await fetch(`${API_URL}/auth/token`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Login failed');
            return data;
        } catch (error: any) {
            throw new Error(error.message || 'Network Error');
        }
    },
    post: async (endpoint: string, body: any, token?: string) => {
        try {
            const headers: any = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers,
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
    },
    put: async (endpoint: string, body: any, token: string) => {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'API Error');
            return data;
        } catch (error: any) {
            throw new Error(error.message || 'Network Error');
        }
    }
};
