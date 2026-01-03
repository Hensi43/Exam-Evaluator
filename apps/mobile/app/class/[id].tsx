import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../lib/auth';
import { ClassesService, AssessmentsService, Classroom, Student, Assessment } from '../../lib/api';

export default function ClassDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { token } = useAuth();

    const [classData, setClassData] = useState<Classroom | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        if (!token || !id) return;
        try {
            const classId = Number(id);
            const [cls, stus, asses] = await Promise.all([
                ClassesService.getById(token, classId),
                ClassesService.getStudents(token, classId),
                AssessmentsService.getByClassId(token, classId)
            ]);
            setClassData(cls);
            setStudents(stus);
            setAssessments(asses);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [token, id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (isLoading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    if (!classData && !isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
                <Text>Class not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-blue-600">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between bg-white border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="font-bold text-lg">{classData?.name}</Text>
                    <Text className="text-gray-500 text-xs">{classData?.subject}</Text>
                </View>
                <TouchableOpacity className="p-2 -mr-2">
                    <Ionicons name="settings-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Stats Overview */}
                <View className="p-6 flex-row gap-4">
                    <View className="flex-1 bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-600/20">
                        <Text className="text-blue-100 text-xs font-bold uppercase mb-1">Class Average</Text>
                        <Text className="text-white text-3xl font-bold">{classData?.average_score || 0}%</Text>
                    </View>
                    <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Students</Text>
                        <Text className="text-gray-900 text-3xl font-bold">{classData?.student_count || 0}</Text>
                    </View>
                </View>

                {/* Assessments */}
                <View className="px-6 mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-gray-900">Assessments</Text>
                        <TouchableOpacity onPress={() => router.push(`/class/${id}/assessment/create`)}>
                            <Text className="text-blue-600 font-semibold">+ New</Text>
                        </TouchableOpacity>
                    </View>

                    {assessments.length === 0 ? (
                        <View className="p-4 bg-white rounded-2xl border border-gray-100 items-center">
                            <Text className="text-gray-400">No assessments yet</Text>
                        </View>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                            {assessments.map((assessment) => (
                                <TouchableOpacity
                                    key={assessment.id}
                                    className="mr-4 w-40 h-40 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm justify-between"
                                    onPress={() => router.push(`/class/${id}/assessment/${assessment.id}`)}
                                >
                                    <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center">
                                        <Text className="text-xl">📝</Text>
                                    </View>
                                    <View>
                                        <Text className="font-bold text-gray-900" numberOfLines={1}>{assessment.title}</Text>
                                        <Text className="text-gray-500 text-xs">{new Date(assessment.date).toLocaleDateString()}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Student List */}
                <View className="px-6 pb-24">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Students</Text>
                    {students.length === 0 ? (
                        <View className="p-4 bg-white rounded-2xl border border-gray-100 items-center">
                            <Text className="text-gray-400">No students enrolled</Text>
                        </View>
                    ) : (
                        students.map((s, i) => (
                            <View key={i} className="flex-row items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-3">
                                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4">
                                    <Text className="font-bold text-gray-500">{s.name[0]}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-900">{s.name}</Text>
                                    <Text className="text-gray-500 text-xs">Roll: {s.roll_number}</Text>
                                </View>
                                <View>
                                    <Text className={`font-bold ${(s.average_score || 0) >= 90 ? 'text-green-600' : (s.average_score || 0) >= 70 ? 'text-blue-600' : 'text-orange-600'}`}>
                                        {s.average_score || 0}%
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* FAB */}
            <View className="absolute bottom-6 right-6">
                <TouchableOpacity
                    onPress={() => router.push('/scanner')}
                    className="w-16 h-16 bg-black rounded-full items-center justify-center shadow-lg shadow-black/30"
                >
                    <Ionicons name="add" size={32} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
