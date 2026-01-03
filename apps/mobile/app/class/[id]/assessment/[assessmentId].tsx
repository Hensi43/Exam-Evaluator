import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../../lib/auth';
import { ExamsService } from '../../../../lib/api';

export default function AssessmentDetail() {
    const { id, assessmentId } = useLocalSearchParams(); // id is classId
    const router = useRouter();
    const { token } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [exams, setExams] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const assessmentTitle = "Assessment Results";

    const loadData = useCallback(async () => {
        if (!token || !assessmentId) return;
        try {
            const data = await ExamsService.getByAssessment(token, Number(assessmentId));
            setExams(data);
        } catch (e) {
            console.error("Failed to load exams", e);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [token, assessmentId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between bg-white border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="font-bold text-lg">{assessmentTitle}</Text>
                    <Text className="text-gray-500 text-xs">Exams & Grading</Text>
                </View>
                <View className="w-8" />
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {exams.length === 0 && !isLoading ? (
                    <View className="p-6 items-center justify-center h-64">
                        <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
                            <Ionicons name="documents-outline" size={32} color="gray" />
                        </View>
                        <Text className="text-gray-500 text-center">
                            No submissions scanned yet. Tap the + button to start scanning exams.
                        </Text>
                    </View>
                ) : (
                    <View className="p-4 gap-3">
                        {exams.map((exam) => (
                            <View key={exam.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-row justify-between items-center">
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-900 text-lg">
                                        {exam.title || `Submission #${exam.id}`}
                                    </Text>
                                    <Text className="text-gray-500 text-xs">
                                        Student ID: {exam.student_id ? exam.student_id : 'Unknown'}
                                    </Text>
                                    <Text className="text-gray-400 text-xs">
                                        {new Date(exam.created_at).toLocaleString()}
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <Text className={`font-bold text-xl ${exam.score >= 90 ? 'text-green-600' : exam.score >= 70 ? 'text-blue-600' : 'text-orange-600'}`}>
                                        {exam.score}%
                                    </Text>
                                    <Text className="text-xs text-gray-400">Score</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* FAB to Scan */}
            <View className="absolute bottom-6 right-6">
                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: '/scanner',
                        params: { assessmentId: assessmentId }
                    })}
                    className="w-16 h-16 bg-black rounded-full items-center justify-center shadow-lg shadow-black/30"
                >
                    <Ionicons name="camera" size={32} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
