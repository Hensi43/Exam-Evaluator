import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { forwardRef } from 'react';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline';
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
}

export const Button = forwardRef<TouchableOpacity, ButtonProps>(({
    onPress,
    title,
    variant = 'primary',
    isLoading = false,
    disabled = false,
    className,
}, ref) => {
    const baseStyles = "h-12 rounded-xl flex-row items-center justify-center px-6";
    const variants = {
        primary: "bg-blue-600 active:bg-blue-700",
        secondary: "bg-gray-800 active:bg-gray-900",
        outline: "border-2 border-blue-600 bg-transparent active:bg-blue-50",
    };
    const textVariants = {
        primary: "text-white font-bold text-base",
        secondary: "text-white font-bold text-base",
        outline: "text-blue-600 font-bold text-base",
    };

    return (
        <TouchableOpacity
            ref={ref}
            onPress={onPress}
            disabled={disabled || isLoading}
            className={twMerge(
                baseStyles,
                variants[variant],
                (disabled || isLoading) && "opacity-50",
                className
            )}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'outline' ? '#2563EB' : 'white'} />
            ) : (
                <Text className={textVariants[variant]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
});
