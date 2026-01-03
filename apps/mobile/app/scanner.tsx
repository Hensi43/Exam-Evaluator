import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated, Easing, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

export default function Scanner() {
    const [permission, requestPermission] = useCameraPermissions();
    const router = useRouter();
    const [isScanning, setIsScanning] = useState(false);
    // Simple pulse animation for the scanner line
    const scanLineAnim = useRef(new Animated.Value(0)).current;

    if (!permission) return <View />;

    if (!permission.granted) {
        return (
            <SafeAreaView className="flex-1 bg-black items-center justify-center p-6">
                <Text className="text-white text-center text-lg mb-6 font-medium">
                    We need access to your camera to grade exams.
                </Text>
                <TouchableOpacity
                    onPress={requestPermission}
                    className="bg-white px-8 py-3 rounded-full"
                >
                    <Text className="font-bold text-black">Allow Camera Access</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-6"
                >
                    <Text className="text-gray-400">Cancel</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const takePicture = async () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        setIsScanning(true);

        // Mock processing delay
        setTimeout(() => {
            setIsScanning(false);
            if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            router.back();
            // In real app: navigate to results screen or upload image
        }, 2000);
    };

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing="back">
                {/* Overlay UI */}
                <SafeAreaView style={styles.overlay}>

                    {/* Header Controls */}
                    <View className="flex-row justify-between items-center px-6 pt-2">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="bg-black/40 p-2 px-4 rounded-full backdrop-blur-md"
                        >
                            <Text className="text-white font-medium">Cancel</Text>
                        </TouchableOpacity>
                        <View className="bg-black/40 px-3 py-1 rounded-full">
                            <Text className="text-white text-xs font-bold tracking-widest uppercase">
                                Scan Mode
                            </Text>
                        </View>
                        <View className="w-16" /> {/* Spacer */}
                    </View>

                    {/* Framing Guide */}
                    <View className="flex-1 justify-center items-center">
                        <View className="w-[85%] h-[65%] border border-white/30 rounded-3xl relative overflow-hidden">
                            {/* Corner Markers */}
                            <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
                            <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
                            <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
                            <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />

                            {/* Scan Line Animation - Could be added here */}
                            {isScanning && (
                                <View className="absolute inset-0 bg-black/50 items-center justify-center">
                                    <Text className="text-white font-bold text-lg">Processing...</Text>
                                </View>
                            )}
                        </View>
                        <Text className="text-white/70 mt-6 font-medium bg-black/30 px-4 py-2 rounded-full overflow-hidden">
                            Align exam paper within frame
                        </Text>
                    </View>

                    {/* Bottom Controls */}
                    <View className="flex-row justify-center items-center pb-8">
                        <TouchableOpacity
                            onPress={takePicture}
                            disabled={isScanning}
                            activeOpacity={0.8}
                        >
                            <View className="w-20 h-20 rounded-full border-4 border-white items-center justify-center">
                                <View className={`w-16 h-16 rounded-full bg-white transition-all ${isScanning ? 'opacity-50 scale-90' : ''}`} />
                            </View>
                        </TouchableOpacity>
                    </View>

                </SafeAreaView>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    }
});
