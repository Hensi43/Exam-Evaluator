import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

interface CameraProps {
    onCapture: (file: File) => void;
    onClose: () => void;
}

export default function Camera({ onCapture, onClose }: CameraProps) {
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setImgSrc(imageSrc);
        }
    }, [webcamRef]);

    const retake = () => setImgSrc(null);

    const confirm = async () => {
        if (imgSrc) {
            const res = await fetch(imgSrc);
            const blob = await res.blob();
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            onCapture(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-gray-900 rounded-lg overflow-hidden relative">
                {!imgSrc ? (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "environment" }}
                        className="w-full"
                    />
                ) : (
                    <img src={imgSrc} alt="captured" className="w-full" />
                )}

                <div className="p-4 flex gap-4 justify-center bg-gray-800">
                    {!imgSrc ? (
                        <button onClick={capture} className="bg-white text-black px-6 py-2 rounded-full font-bold hover:scale-105 transition">
                            Capture
                        </button>
                    ) : (
                        <>
                            <button onClick={retake} className="text-white px-4 py-2 hover:underline">Retake</button>
                            <button onClick={confirm} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold">Use Photo</button>
                        </>
                    )}
                    <button onClick={onClose} className="absolute top-2 right-2 text-white bg-black/50 rounded-full p-2 w-8 h-8 flex items-center justify-center">✕</button>
                </div>
            </div>
        </div>
    );
}
