import { View, Text, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Button } from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/auth';
import { useEffect } from 'react';

export default function Welcome() {
    const router = useRouter();
    const { user, loadToken, isLoading } = useAuth();

    useEffect(() => {
        loadToken();
    }, []);

    useEffect(() => {
        if (!isLoading && user) {
            // If logged in, maybe redirect to a dashboard?
            // For now, we show the dashboard view in this file or redirect to (app)/home
        }
    }, [user, isLoading]);

    if (user) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center p-6">
                <Text className="text-2xl font-bold text-gray-900 mb-2">Hello, {user.email}</Text>
                <Text className="text-gray-500 mb-8">You are logged in.</Text>

                <View className="w-full gap-4">
                    <Button title="Scan New Exam" onPress={() => console.log('Scan')} />
                    <Button title="Logout" variant="outline" onPress={() => useAuth.getState().logout()} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
            <View className="items-center mb-12">
                <View className="w-24 h-24 bg-blue-100 rounded-3xl items-center justify-center mb-6">
                    <Text className="text-4xl">📝</Text>
                </View>
                <Text className="text-3xl font-bold text-gray-900 text-center">Exam Evaluator</Text>
                <Text className="text-gray-500 text-center mt-3 text-lg px-4">
                    Grade physical exams instantly using the power of AI.
                </Text>
            </View>

            <View className="w-full gap-4">
                <Button
                    title="Sign In"
                    onPress={() => router.push('/(auth)/login')}
                />
                <Button
                    title="Create Account"
                    variant="outline"
                    onPress={() => router.push('/(auth)/register')}
                />
            </View>
        </SafeAreaView>
    );
}
