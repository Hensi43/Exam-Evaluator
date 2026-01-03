import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScanService } from '../../lib/scan';
import { useAuth } from '../../lib/auth';

export default function Scanner() {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [photos, setPhotos] = useState<string[]>([]); // Batch state
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const params = useLocalSearchParams();
    const assessmentId = params.assessmentId ? Number(params.assessmentId) : null;

    const router = useRouter();
    const { token } = useAuth();
    const [showReview, setShowReview] = useState(false);

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center">
                <Text className="text-center pb-4">We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </SafeAreaView>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                skipProcessing: true
            });
            if (photo) {
                setPhotos(prev => [...prev, photo.uri]);
            }
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
        if (photos.length <= 1) setShowReview(false);
    };

    const uploadBatch = async () => {
        if (photos.length === 0 || !token) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            if (!assessmentId) {
                // Warning handled in UI or prior to this, but good to keep safe
            }

            let successCount = 0;
            // Upload sequentially to avoid overwhelming the server/device
            for (let i = 0; i < photos.length; i++) {
                try {
                    await ScanService.upload(token, photos[i], assessmentId || 0);
                    successCount++;
                    setUploadProgress(i + 1);
                } catch (e) {
                    console.error(`Failed to upload photo ${i}`, e);
                    // Continue with others? For now, yes.
                }
            }

            Alert.alert(
                "Batch Complete",
                `Successfully uploaded ${successCount} of ${photos.length} scans.`,
                [{ text: "Done", onPress: () => router.back() }]
            );

        } catch (e: any) {
            Alert.alert("Error", e.message || "Batch upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    // --- Review Screen (Batch) ---
    if (showReview) {
        return (
            <SafeAreaView className="flex-1 bg-black">
                <View className="px-6 py-4 flex-row justify-between items-center bg-gray-900 border-b border-gray-800">
                    <TouchableOpacity onPress={() => setShowReview(false)} disabled={isUploading}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white font-bold text-lg">Review Batch ({photos.length})</Text>
                    <View className="w-6" />
                </View>

                <ScrollView className="flex-1 p-4">
                    <View className="flex-row flex-wrap gap-2 justify-center">
                        {photos.map((uri, index) => (
                            <View key={index} className="relative w-[150px] h-[200px] bg-gray-800 rounded-lg overflow-hidden mb-2">
                                <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
                                <TouchableOpacity
                                    onPress={() => removePhoto(index)}
                                    className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                                    disabled={isUploading}
                                >
                                    <Ionicons name="close-circle" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </ScrollView>

                <View className="p-4 bg-gray-900 border-t border-gray-800">
                    <TouchableOpacity
                        onPress={uploadBatch}
                        disabled={isUploading}
                        className={`py-4 rounded-xl items-center flex-row justify-center gap-2 ${isUploading ? 'bg-gray-700' : 'bg-blue-600'}`}
                    >
                        {isUploading ? (
                            <>
                                <Text className="text-white font-bold">Uploading... ({uploadProgress}/{photos.length})</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="cloud-upload" size={20} color="white" />
                                <Text className="text-white font-bold text-lg">Upload All {photos.length} Scans</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // --- Camera Screen ---
    return (
        <View className="flex-1 justify-center bg-black">
            <CameraView style={styles.camera} ref={cameraRef} facing="back">
                <SafeAreaView className="flex-1 justify-between">
                    {/* Header */}
                    <View className="px-6 py-4 flex-row justify-between items-center bg-black/20">
                        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-black/40 rounded-full items-center justify-center">
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>

                        <View className="bg-black/40 px-4 py-2 rounded-full">
                            <Text className="text-white font-bold text-sm">
                                {assessmentId ? `Assessment #${assessmentId}` : 'Quick Scan'}
                            </Text>
                        </View>

                        <View className="w-10" />
                    </View>

                    {/* Controls */}
                    <View className="flex-row items-center justify-around pb-12 px-6">
                        {/* Batch Counter / Review Button */}
                        <TouchableOpacity
                            onPress={() => photos.length > 0 && setShowReview(true)}
                            className="items-center"
                        >
                            <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center border border-white/30">
                                <Text className="text-white font-bold text-lg">{photos.length}</Text>
                            </View>
                            <Text className="text-white text-xs mt-1 font-medium">Scanned</Text>
                        </TouchableOpacity>

                        {/* Shutter Button */}
                        <TouchableOpacity
                            onPress={takePicture}
                            className="w-20 h-20 bg-white rounded-full border-[6px] border-gray-300/50 items-center justify-center"
                        >
                            <View className="w-16 h-16 bg-white rounded-full border-2 border-black" />
                        </TouchableOpacity>

                        {/* Done Button */}
                        <TouchableOpacity
                            onPress={() => {
                                if (photos.length > 0) setShowReview(true);
                                else Alert.alert("Empty Batch", "Scan at least one paper first.");
                            }}
                            className="items-center"
                        >
                            <View className={`w-12 h-12 rounded-full items-center justify-center ${photos.length > 0 ? 'bg-blue-600' : 'bg-white/10'}`}>
                                <Ionicons name="checkmark" size={24} color={photos.length > 0 ? "white" : "rgba(255,255,255,0.3)"} />
                            </View>
                            <Text className={`text-xs mt-1 font-medium ${photos.length > 0 ? "text-blue-400" : "text-gray-500"}`}>Finish</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    camera: {
        flex: 1,
    },
});
