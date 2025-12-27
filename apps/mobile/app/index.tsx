import { Text, View } from 'react-native';

export default function Home() {
    return (
        <View className="flex-1 items-center justify-center bg-gray-100">
            <Text className="text-2xl font-bold text-blue-600">Exam Evaluator Mobile</Text>
            <Text className="mt-2 text-gray-600">Scan your exams with AI</Text>
        </View>
    );
}
