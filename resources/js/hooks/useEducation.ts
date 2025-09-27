import { Head, Link, useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Education {
    id?: number;
    education_level: string;
    faculty: string;
    major_id: string;
    major?: string;
    institution_name: string;
    gpa: string;
    year_in: string;
    year_out: string;
    [key: string]: any;
}

export const useEducation = () => {
    const [education, setEducation] = useState<Education | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEducation = async () => {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching education data...');

        try {
            const response = await axios.get('/api/candidate/education');
            console.log('✅ Education data received:', response.data.data);
            setEducation(response.data.data || null);
            setLoading(false);
        } catch (error: any) {
            console.error('❌ Error fetching education:', error);
            if (error.response?.status === 404 || !error.response?.data) {
                // No education data found - this is OK
                setEducation(null);
                setError(null);
            } else {
                setError('Gagal memuat data pendidikan');
            }
            setLoading(false);
        }
    };

    const updateEducation = async (data: any, onSuccess?: () => void) => {
        setLoading(true);

        console.log('🔄 Updating education data...');

        router.post('/api/candidate/education', data, {
            onSuccess: (page: any) => {
                const result = page.props.data || page.props;
                console.log('✅ Education data updated:', result);
                setEducation(result.data || result);

                if (onSuccess) {
                    onSuccess();
                }
                setLoading(false);
                return result;
            },
            onError: (errors: any) => {
                console.error('❌ Error updating education:', errors);
                setLoading(false);
                throw new Error(errors.message || 'Failed to update education');
            }
        });
    };

    const refreshEducation = async () => {
        console.log('🔄 Force refreshing education...');
        await fetchEducation();
    };

    useEffect(() => {
        fetchEducation();
    }, []);

    return {
        education,
        loading,
        updateEducation,
        refreshEducation
    };
};
