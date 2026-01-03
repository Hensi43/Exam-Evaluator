import { TextInput, View, Text, TextInputProps } from 'react-native';
import { forwardRef } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    className?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(({
    label,
    error,
    className,
    icon,
    ...props
}, ref) => {
    return (
        <View className={twMerge("w-full mb-4", className)}>
            {label && (
                <Text className="mb-2 text-sm font-semibold text-gray-700 ml-1">
                    {label}
                </Text>
            )}
            <View className={clsx(
                "flex-row items-center h-12 w-full rounded-xl border bg-white px-3 relative z-10", // z-10 to ensure it's above other elements if needed
                error ? "border-red-500" : "border-gray-200 focus:border-blue-500"
            )}>
                {icon && (
                    <View className="mr-3">
                        {icon}
                    </View>
                )}
                <TextInput
                    ref={ref}
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-gray-900 text-base h-full"
                    {...props}
                />
            </View>
            {error && (
                <Text className="mt-1 ml-1 text-xs text-red-500 font-medium">
                    {error}
                </Text>
            )}
        </View>
    );
});
