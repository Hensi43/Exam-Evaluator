import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useAuth } from '../../../../lib/auth';
import { ClassesService } from '../../../../lib/api';
import { Input } from '../../../../components/Input';
import { Button } from '../../../../components/Button';

export default function AddStudent() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { token } = useAuth();

    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAdd = async () => {
        if (!name || !rollNumber) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!token || !id) return;

        setIsLoading(true);
        try {
            await ClassesService.addStudent(token, Number(id), {
                name,
                roll_number: rollNumber
            });
            Alert.alert('Success', 'Student added successfully', [
                {
                    text: 'Add Another', onPress: () => {
                        setName('');
                        setRollNumber('');
                    }
                },
                { text: 'Done', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to add student');
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
                <Text className="font-bold text-xl">Add Student</Text>
            </View>

            <View className="px-6 flex-1">
                <Text className="text-gray-500 mb-6">
                    Enter the student's details to add them to this class.
                </Text>

                <View className="gap-4">
                    <Input
                        label="Full Name"
                        placeholder="e.g. Jane Doe"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />

                    <Input
                        label="Roll Number / ID"
                        placeholder="e.g. 101"
                        value={rollNumber}
                        onChangeText={setRollNumber}
                        autoCapitalize="none"
                    />
                </View>
            </View>

            <View className="p-6 border-t border-gray-100">
                <Button
                    title="Add Student"
                    onPress={handleAdd}
                    isLoading={isLoading}
                />
            </View>
        </SafeAreaView>
    );
}
