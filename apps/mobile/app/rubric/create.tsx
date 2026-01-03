import { View, Text, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { RubricsService } from '../../lib/api';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export default function CreateRubric() {
    const router = useRouter();
    const { token } = useAuth();

    const [title, setTitle] = useState('');
    const [handwritingWeight, setHandwritingWeight] = useState('10'); // Default 10%
    const [criteria, setCriteria] = useState<{ description: string, weight: string }[]>([
        { description: '', weight: '' }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const addCriterion = () => {
        setCriteria([...criteria, { description: '', weight: '' }]);
    };

    const removeCriterion = (index: number) => {
        const newCriteria = [...criteria];
        newCriteria.splice(index, 1);
        setCriteria(newCriteria);
    };

    const updateCriterion = (index: number, field: 'description' | 'weight', value: string) => {
        const newCriteria = [...criteria];
        newCriteria[index][field] = value;
        setCriteria(newCriteria);
    };

    const handleCreate = async () => {
        if (!title) {
            Alert.alert('Error', 'Please enter a rubric title');
            return;
        }

        const validCriteria = criteria.filter(c => c.description && c.weight);
        if (validCriteria.length === 0) {
            Alert.alert('Error', 'Please add at least one criterion');
            return;
        }

        const hWeight = parseFloat(handwritingWeight) || 0;
        const totalWeight = validCriteria.reduce((sum, c) => sum + (parseFloat(c.weight) || 0), 0) + hWeight;

        if (Math.abs(totalWeight - 100) > 1) { // 1% tolerance
            Alert.alert('Weight Error', `Total weight (Criteria + Handwriting) is ${totalWeight}%. It should be 100%.`);
            return;
        }

        if (!token) return;

        setIsLoading(true);
        try {
            await RubricsService.create(token, {
                title,
                criteria: validCriteria.map(c => ({
                    description: c.description,
                    weight: parseFloat(c.weight) || 0
                })),
                handwriting_weight: hWeight
            });

            Alert.alert('Success', 'Rubric created successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create rubric');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100 mb-2">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
                    <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>
                <Text className="font-bold text-xl">New Grading Rubric</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
                <Input
                    label="Rubric Title"
                    placeholder="e.g. Science Fair Standard"
                    value={title}
                    onChangeText={setTitle}
                />

                <View className="my-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <Text className="font-bold text-gray-900 mb-2">Handwriting Policy</Text>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-gray-500 text-sm flex-1 mr-4">
                            Percentage of total score dedicated to handwriting legibility.
                        </Text>
                        <View className="w-20">
                            <Input
                                placeholder="%"
                                value={handwritingWeight}
                                onChangeText={setHandwritingWeight}
                                keyboardType="numeric"
                                className="mb-0 h-10 text-center"
                            />
                        </View>
                    </View>
                </View>

                <View className="mb-4 flex-row justify-between items-center">
                    <Text className="font-bold text-lg">Criteria</Text>
                    <TouchableOpacity onPress={addCriterion}>
                        <Text className="text-blue-600 font-bold">+ Add Item</Text>
                    </TouchableOpacity>
                </View>

                <View className="gap-3 pb-8">
                    {criteria.map((item, index) => (
                        <View key={index} className="flex-row gap-2 items-start">
                            <View className="flex-1">
                                <Input
                                    placeholder="Criterion Description"
                                    value={item.description}
                                    onChangeText={(text) => updateCriterion(index, 'description', text)}
                                    className="mb-0"
                                />
                            </View>
                            <View className="w-20">
                                <Input
                                    placeholder="%"
                                    value={item.weight}
                                    onChangeText={(text) => updateCriterion(index, 'weight', text)}
                                    keyboardType="numeric"
                                    className="mb-0 text-center"
                                />
                            </View>
                            {criteria.length > 1 && (
                                <TouchableOpacity onPress={() => removeCriterion(index)} className="mt-3">
                                    <Ionicons name="trash-outline" size={20} color="red" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>

            </ScrollView>

            <View className="p-6 border-t border-gray-100">
                <Button
                    title="Save Rubric"
                    onPress={handleCreate}
                    isLoading={isLoading}
                />
            </View>
        </SafeAreaView>
    );
}
