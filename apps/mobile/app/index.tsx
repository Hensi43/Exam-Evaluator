import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Button } from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/auth';
import { useEffect, useState } from 'react';
import { ClassesService, Classroom } from '../lib/api';

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

    const { token } = useAuth();
    const [classes, setClasses] = useState<Classroom[]>([]);

    useEffect(() => {
        if (token) {
            loadClasses();
        }
    }, [token]);

    const loadClasses = async () => {
        try {
            if (token) {
                const data = await ClassesService.getAll(token);
                setClasses(data);
            }
        } catch (e) {
            console.error("Failed to load classes", e);
        }
    };

    if (user) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    {/* Header Section */}
                    <View className="px-6 pt-4 pb-6 bg-white shadow-sm mb-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <View>
                                <Text className="text-gray-500 text-sm font-medium">Welcome back,</Text>
                                <Text className="text-2xl font-bold text-gray-900">{user.email?.split('@')[0]}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => useAuth.getState().logout()}
                                className="bg-gray-100 p-2 rounded-full"
                            >
                                <Text className="text-xs text-gray-600 px-2">Logout</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Quick Stats */}
                        <View className="flex-row gap-4 mt-2">
                            <View className="flex-1 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                <Text className="text-blue-600 font-bold text-xl">{classes.length}</Text>
                                <Text className="text-blue-400 text-xs">Active Classes</Text>
                            </View>
                            <View className="flex-1 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                                <Text className="text-purple-600 font-bold text-xl">
                                    {classes.length > 0
                                        ? Math.round(classes.reduce((acc, c) => acc + (c.average_score || 0), 0) / classes.length)
                                        : 0}%
                                </Text>
                                <Text className="text-purple-400 text-xs">Avg Score</Text>
                            </View>
                        </View>
                    </View>

                    {/* Main Action - Scan */}
                    <View className="px-6 mb-8">
                        <Text className="text-gray-900 font-bold text-lg mb-4">Quick Actions</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/scanner')}
                            className="bg-black rounded-3xl p-6 shadow-lg shadow-blue-500/30 flex-row items-center justify-between"
                            style={{ elevation: 5 }}
                        >
                            <View>
                                <Text className="text-white text-xl font-bold mb-1">Scan New Exam</Text>
                                <Text className="text-gray-400 text-sm">Use AI to grade instantly</Text>
                            </View>
                            <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                                <Text className="text-2xl">📸</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Classes List */}
                    <View className="px-6 pb-10">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-gray-900 font-bold text-lg">Your Classes</Text>
                            <TouchableOpacity onPress={() => router.push('/class/create')}>
                                <Text className="text-blue-600 font-semibold text-sm">+ Add Class</Text>
                            </TouchableOpacity>
                        </View>

                        {classes.length === 0 ? (
                            <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 items-center">
                                <Text className="text-4xl mb-4">📚</Text>
                                <Text className="text-gray-900 font-bold text-lg mb-2">No Classes Yet</Text>
                                <Text className="text-gray-400 text-center text-sm">Create your first class to start tracking student progress.</Text>
                            </View>
                        ) : (
                            <View className="gap-4">
                                {classes.map((cls) => (
                                    <TouchableOpacity
                                        key={cls.id}
                                        onPress={() => router.push(`/class/${cls.id}`)}
                                        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-row items-center justify-between"
                                    >
                                        <View className="flex-1">
                                            <Text className="font-bold text-gray-900 text-lg">{cls.name}</Text>
                                            <Text className="text-gray-500 text-sm">{cls.subject} • {cls.student_count || 0} Students</Text>
                                        </View>
                                        <View className="items-end">
                                            <Text className="font-bold text-blue-600 text-lg">{cls.average_score || 0}%</Text>
                                            <Text className="text-gray-400 text-xs">Average</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center p-6 relative">
            {/* Background Decoration */}
            <View className="absolute top-0 left-0 w-full h-64 bg-black rounded-b-3xl" />

            <View className="items-center mb-16 w-full z-10">
                <View className="w-28 h-28 bg-white rounded-3xl items-center justify-center mb-6 shadow-xl shadow-black/20" style={{ elevation: 10 }}>
                    <Text className="text-5xl">📝</Text>
                </View>
                <Text className="text-4xl font-extrabold text-gray-900 text-center mb-2 tracking-tight">
                    Exam<Text className="text-blue-600">Evaluator</Text>
                </Text>
                <Text className="text-gray-500 text-center text-lg px-8 leading-6">
                    Professional AI Grading for Teachers and Schools.
                </Text>
            </View>

            <View className="w-full gap-4 z-10">
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/login')}
                    className="bg-black py-4 rounded-2xl items-center shadow-lg shadow-black/30"
                >
                    <Text className="text-white font-bold text-lg">Sign In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/(auth)/register')}
                    className="bg-white py-4 rounded-2xl items-center border-2 border-gray-100"
                >
                    <Text className="text-gray-900 font-bold text-lg">Create Account</Text>
                </TouchableOpacity>
            </View>

            <View className="absolute bottom-10">
                <Text className="text-gray-300 text-xs">Powered by Gemini AI</Text>
            </View>
        </SafeAreaView>
    );
}
