import { View, Text, Alert, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuth, api } from '../../lib/auth';
import { AppConfig } from '../../lib/config';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: AppConfig.googleClientId,
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            handleGoogleLogin(id_token);
        }
    }, [response]);

    const handleGoogleLogin = async (token: string) => {
        setIsLoading(true);
        try {
            // DEMO MODE CHECK
            if (AppConfig.isDemoMode && token === AppConfig.mockGoogleToken) {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                await login(AppConfig.mockJwtToken, AppConfig.demoUserEmail);
                router.replace('/');
                return;
            }

            const data = await api.post('/auth/google', { token });
            await login(data.access_token, "google-user@example.com");
            router.replace('/');
        } catch (error: any) {
            Alert.alert('Google Login Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const onGooglePress = () => {
        if (AppConfig.isDemoMode) {
            // Demo Mode Logic
            handleGoogleLogin(AppConfig.mockGoogleToken);
        } else {
            promptAsync();
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const data = await api.login(formData);
            await login(data.access_token, email);
            router.replace('/');
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white px-8 justify-center">
            {/* Header */}
            <View className="mb-10">
                <Text className="text-4xl font-extrabold text-gray-900 tracking-tight">Welcome Back.</Text>
                <Text className="text-gray-500 mt-2 text-lg">You've been missed!</Text>
            </View>

            {/* Google Sign In - Hero Button */}
            <TouchableOpacity
                onPress={onGooglePress}
                className="flex-row items-center justify-center bg-black py-4 rounded-2xl shadow-lg shadow-black/20 mb-8"
            >
                {/* Mock Google Icon or Text */}
                <Text className="text-white font-bold text-lg">Continue with Google</Text>
            </TouchableOpacity>

            <View className="flex-row items-center mb-8">
                <View className="flex-1 h-[1px] bg-gray-200" />
                <Text className="mx-4 text-gray-400 font-medium">OR</Text>
                <View className="flex-1 h-[1px] bg-gray-200" />
            </View>

            <View className="gap-5">
                <Input
                    label="Email"
                    placeholder="name@example.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <View>
                    <Input
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <TouchableOpacity className="self-end mt-2">
                        <Text className="text-gray-400 text-xs font-semibold">Forgot Password?</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={isLoading}
                    className={`py-4 rounded-2xl items-center justify-center border border-gray-200 ${isLoading ? 'bg-gray-50' : 'bg-white'}`}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text className="text-gray-900 font-bold text-lg">Log In</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-10">
                <Text className="text-gray-500 text-base">Don't have an account? </Text>
                <Link href="/(auth)/register" asChild>
                    <TouchableOpacity>
                        <Text className="text-black font-bold text-base">Register</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </SafeAreaView>
    );
}
