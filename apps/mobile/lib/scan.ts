
import { api, API_URL } from './api';

export const ScanService = {
    upload: async (token: string, fileUri: string, assessmentId: number, studentId?: number) => {
        const formData = new FormData();

        // React Native specific file handling for FormData
        const filename = fileUri.split('/').pop() || 'scan.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        // @ts-ignore: FormData expects Blob but RN accepts an object with uri, name, type
        formData.append('file', { uri: fileUri, name: filename, type });
        if (assessmentId) formData.append('assessment_id', String(assessmentId));
        if (studentId) formData.append('student_id', String(studentId));

        const response = await fetch(`${API_URL}/scan/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Upload failed');
        return data;
    }
};
