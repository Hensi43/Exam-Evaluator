import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useAuth } from '../../../../lib/auth';
import { AssessmentsService } from '../../../../lib/api';
import { Input } from '../../../../components/Input';
import { Button } from '../../../../components/Button';

export default function CreateAssessment() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { token } = useAuth();
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!title) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }

        if (!token || !id) return;

        setIsLoading(true);
        try {
            await AssessmentsService.create(token, {
                title,
                classroom_id: Number(id)
            });
            Alert.alert('Success', 'Assessment created successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create assessment');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100 mb-6">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
                    <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>
                <Text className="font-bold text-xl">New Assessment</Text>
            </View>

            <View className="px-6 flex-1">
                <Text className="text-gray-500 mb-6">
                    Create a new assessment batch (e.g. "Mid-Term Exam") to start scanning papers.
                </Text>

                <View className="gap-4">
                    <Input
                        label="Assessment Title"
                        placeholder="e.g. Unit Test 1"
                        value={title}
                        onChangeText={setTitle}
                        autoCapitalize="sentences"
                    />
                </View>
            </View>

            <View className="p-6 border-t border-gray-100">
                <Button
                    title="Create Assessment"
                    onPress={handleCreate}
                    isLoading={isLoading}
                />
            </View>
        </SafeAreaView>
    );
}
