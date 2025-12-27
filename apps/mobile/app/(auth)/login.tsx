import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useState } from 'react';
import { useAuth, api } from '../../lib/auth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            // 1. Get Token
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await fetch('http://localhost:8000/auth/token', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Login failed');
            }

            // 2. Save Token
            await login(data.access_token, email);

            // 3. Navigate
            router.replace('/');
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white px-6 justify-center">
            <View className="mb-8">
                <Text className="text-3xl font-bold text-gray-900">Welcome Back</Text>
                <Text className="text-gray-500 mt-2">Sign in to continue evaluating exams.</Text>
            </View>

            <Input
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <Input
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <Button
                title="Sign In"
                onPress={handleLogin}
                isLoading={isLoading}
                className="mt-4"
            />

            <View className="flex-row justify-center mt-6">
                <Text className="text-gray-600">Don't have an account? </Text>
                <Link href="/(auth)/register" asChild>
                    <TouchableOpacity>
                        <Text className="text-blue-600 font-bold">Sign Up</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </SafeAreaView>
    );
}
