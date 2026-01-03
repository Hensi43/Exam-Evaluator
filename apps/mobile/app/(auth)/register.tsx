import { View, Text, Alert, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useState } from 'react';
import { api } from '../../lib/auth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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
        <SafeAreaView className="flex-1 bg-white">
            {/* Back Button */}
            <View className="px-6 pt-2">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-8 pt-8" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="mb-10">
                    <Text className="text-4xl font-extrabold text-gray-900 tracking-tight">Join Us.</Text>
                    <Text className="text-gray-500 mt-2 text-lg">Create a teacher account to start grading.</Text>
                </View>

                {/* Form */}
                <View className="gap-5 mb-8">
                    <Input
                        label="Full Name"
                        placeholder="John Doe"
                        value={fullName}
                        onChangeText={setFullName}
                        icon={<Ionicons name="person-outline" size={20} color="gray" />}
                    />

                    <Input
                        label="Email Address"
                        placeholder="teacher@school.edu"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        icon={<Ionicons name="mail-outline" size={20} color="gray" />}
                    />

                    <Input
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        icon={<Ionicons name="lock-closed-outline" size={20} color="gray" />}
                    />
                </View>

                {/* Terms Text */}
                <Text className="text-gray-400 text-xs text-center mb-6 px-4">
                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                </Text>

                {/* Main Action */}
                <TouchableOpacity
                    onPress={handleRegister}
                    disabled={isLoading}
                    className={`py-4 rounded-2xl items-center shadow-lg shadow-blue-500/30 mb-8 ${isLoading ? 'bg-gray-100' : 'bg-black'}`}
                >
                    <Text className={`font-bold text-lg ${isLoading ? 'text-gray-400' : 'text-white'}`}>
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Text>
                </TouchableOpacity>

                {/* Footer Link */}
                <View className="flex-row justify-center pb-10">
                    <Text className="text-gray-500 text-base">Already have an account? </Text>
                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity>
                            <Text className="text-black font-bold text-base">Sign In</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
