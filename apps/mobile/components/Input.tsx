import { TextInput, View, Text, TextInputProps } from 'react-native';
import { forwardRef } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    className?: string;
}

export const Input = forwardRef<TextInput, InputProps>(({
    label,
    error,
    className,
    ...props
}, ref) => {
    return (
        <View className={twMerge("w-full mb-4", className)}>
            {label && (
                <Text className="mb-2 text-sm font-semibold text-gray-700 ml-1">
                    {label}
                </Text>
            )}
            <TextInput
                ref={ref}
                placeholderTextColor="#9CA3AF"
                className={clsx(
                    "h-12 w-full rounded-xl border px-4 bg-white text-gray-900 text-base",
                    error ? "border-red-500" : "border-gray-200 focus:border-blue-500"
                )}
                {...props}
            />
            {error && (
                <Text className="mt-1 ml-1 text-xs text-red-500 font-medium">
                    {error}
                </Text>
            )}
        </View>
    );
});
