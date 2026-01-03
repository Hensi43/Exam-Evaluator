import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { ClassesService } from '../../lib/api';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export default function CreateClass() {
    const router = useRouter();
    const { token } = useAuth();
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!name || !subject) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!token) return;

        setIsLoading(true);
        try {
            await ClassesService.create(token, { name, subject });
            Alert.alert('Success', 'Class created successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create class');
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
                <Text className="font-bold text-xl">Create New Class</Text>
            </View>

            <View className="px-6 flex-1">
                <Text className="text-gray-500 mb-6">
                    Add a new class to organize exams and track student progress.
                </Text>

                <View className="gap-4">
                    <Input
                        label="Class Name"
                        placeholder="e.g. Grade 10-A"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />

                    <Input
                        label="Subject"
                        placeholder="e.g. Mathematics"
                        value={subject}
                        onChangeText={setSubject}
                        autoCapitalize="words"
                    />
                </View>
            </View>

            <View className="p-6 border-t border-gray-100">
                <Button
                    title="Create Class"
                    onPress={handleCreate}
                    isLoading={isLoading}
                />
            </View>
        </SafeAreaView>
    );
}
