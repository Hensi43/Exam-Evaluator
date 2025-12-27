import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useState } from 'react';
import { api } from '../../lib/auth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Register() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !password || !fullName) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/register', {
                email,
                password,
                full_name: fullName,
            });

            Alert.alert('Success', 'Account created! Please log in.', [
                { text: 'OK', onPress: () => router.replace('/(auth)/login') }
            ]);
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white px-6 justify-center">
            <View className="mb-8">
                <Text className="text-3xl font-bold text-gray-900">Create Account</Text>
                <Text className="text-gray-500 mt-2">Join us to start grading smarter.</Text>
            </View>

            <Input
                label="Full Name"
                placeholder="John Doe"
                value={fullName}
                onChangeText={setFullName}
            />

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
                title="Sign Up"
                onPress={handleRegister}
                isLoading={isLoading}
                className="mt-4"
            />

            <View className="flex-row justify-center mt-6">
                <Text className="text-gray-600">Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                    <TouchableOpacity>
                        <Text className="text-blue-600 font-bold">Sign In</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </SafeAreaView>
    );
}
