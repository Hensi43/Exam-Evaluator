import { api } from './auth';

export interface Classroom {
    id?: number;
    name: string;
    subject: string;
    teacher_id?: number;
    created_at?: string;
    student_count?: number;
    average_score?: number;
}

export interface Student {
    id?: number;
    name: string;
    roll_number: string;
    classroom_id?: number;
    average_score?: number;
}

export interface Assessment {
    id?: number;
    title: string;
    date: string;
    classroom_id: number;
}

export const ClassesService = {
    getAll: async (token: string): Promise<Classroom[]> => {
        return api.get('/classes/', token);
    },

    getById: async (token: string, id: number): Promise<Classroom> => {
        return api.get(`/classes/${id}`, token);
    },

    create: async (token: string, data: { name: string, subject: string }) => {
        return api.post('/classes/', data, token);
    },

    getStudents: async (token: string, classId: number): Promise<Student[]> => {
        return api.get(`/classes/${classId}/students`, token);
    },

    addStudent: async (token: string, classId: number, data: { name: string, roll_number: string }) => {
        return api.post(`/classes/${classId}/students`, data, token);
    }
};

export const AssessmentsService = {
    getByClassId: async (token: string, classId: number): Promise<Assessment[]> => {
        return api.get(`/assessments/?classroom_id=${classId}`, token);
    },

    create: async (token: string, data: { title: string, classroom_id: number, rubric_id?: number | null }) => {
        return api.post('/assessments/', data, token);
    },

    setReference: async (token: string, assessmentId: number, examId: number) => {
        return api.put(`/assessments/${assessmentId}/reference`, { reference_exam_id: examId }, token);
    }
};

export const RubricsService = {
    create: async (token: string, data: { title: string, criteria: { description: string, weight: number }[], handwriting_weight: number }) => {
        return api.post('/rubrics/', data, token);
    },
    getAll: async (token: string) => {
        return api.get('/rubrics/', token);
    }
};

export const ExamsService = {
    getByAssessment: async (token: string, assessmentId: number) => {
        // We need to implement this endpoint in backend or filter. 
        // For MVP, assume endpoint exists or we use a filter on /exams/
        // Actually, we don't have a specific /exams/ endpoint yet for listing.
        // Let's create one or use a placeholder if backend isn't ready. 
        // But I should update backend to support this too.
        return api.get(`/assessments/${assessmentId}/exams`, token);
    }
};
