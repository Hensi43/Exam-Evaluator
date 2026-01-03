import { Platform } from 'react-native';

export const AppConfig = {
    // Feature Flags
    isDemoMode: true, // Set to false for production

    // Auth Constants
    googleClientId: 'YOUR_GOOGLE_CLIENT_ID_HERE', // TODO: Replace with env var in real app
    mockGoogleToken: 'mock-google-token',
    mockJwtToken: 'mock-jwt-token',
    demoUserEmail: 'demo-user@gmail.com',

    // API Configuration
    apiUrl: Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000',
};
