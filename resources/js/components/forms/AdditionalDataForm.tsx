import React, { ChangeEvent, useEffect, useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import TwoColumnForm from './TwoColumnForm';

interface DataTambahanFormProps {
    onTambahSkills: () => void;
    onTambahKursus: () => void;
    onTambahSertifikasi: () => void;
    onTambahBahasa: () => void;
    onNext?: () => void;
}

interface DataTambahanFormState {
    activeForm: string | null;
    editingId: number | null; // Tambahkan untuk track ID yang sedang diedit
    formData: {
        [key: string]: {
            name: string;
            file: File | null;
        };
    };
}

interface SavedDataItem {
    id: number;
    skill_name?: string;
    course_name?: string;
    certification_name?: string;
    language_name?: string;
    certificate_file?: string;
    name?: string;
    file_path?: string;
}

const DataTambahanForm: React.FC<DataTambahanFormProps> = ({
    onTambahSkills,
    onTambahKursus,
    onTambahSertifikasi,
    onTambahBahasa,
   
    onNext
}) => {
    const [state, setState] = useState<DataTambahanFormState>({
        activeForm: null,
        editingId: null,
        formData: {}
    });

    const [savedData, setSavedData] = useState<{
        skills: SavedDataItem[];
        kursus: SavedDataItem[];
        sertifikasi: SavedDataItem[];
        bahasa: SavedDataItem[];
       
    }>({
        skills: [],
        kursus: [],
        sertifikasi: [],
        bahasa: [],
       
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Load existing data when component mounts
    useEffect(() => {
        fetchSkillsData();
        fetchCoursesData();
        fetchCertificationsData();
        fetchLanguagesData(); // Uncomment ini
       
    }, []);

    // Fetch functions
    const fetchSkillsData = async () => {
        try {
            router.get('/candidate/skills', {}, {
                onSuccess: (page: any) => {
                    if (page.props?.success) {
                        setSavedData(prev => ({
                            ...prev,
                            skills: page.props.data || []
                        }));
                    }
                },
                onError: (error: any) => {
                    console.error('Error fetching skills:', error);
                }
            });
        } catch (error) {
            console.error('Error fetching skills:', error);
        }
    };

    const fetchCoursesData = async () => {
        try {
            router.get('/candidate/courses', {}, {
                onSuccess: (page: any) => {
                    if (page.props?.success) {
                        setSavedData(prev => ({
                            ...prev,
                            kursus: page.props.data || []
                        }));
                    }
                },
                onError: (error: any) => {
                    console.error('Error fetching courses:', error);
                }
            });
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchCertificationsData = async () => {
        try {
            console.log('Fetching certifications...'); // Debug log
            router.get('/candidate/certifications', {}, {
                onSuccess: (page: any) => {
                    console.log('Certifications response:', page.props); // Debug log
                    
                    if (page.props?.success) {
                        setSavedData(prev => ({
                            ...prev,
                            sertifikasi: page.props.data || []
                        }));
                    }
                },
                onError: (error: any) => {
                    console.error('Error fetching certifications:', error);
                }
            });
        } catch (error) {
            console.error('Error fetching certifications:', error);
        }
    };

    const fetchLanguagesData = async () => {
        try {
            router.get('/candidate/languages', {}, {
                onSuccess: (page: any) => {
                    if (page.props?.success) {
                        setSavedData(prev => ({
                            ...prev,
                            bahasa: page.props.data || []
                        }));
                    }
                },
                onError: (error: any) => {
                    console.error('Error fetching languages:', error);
                }
            });
        } catch (error) {
            console.error('Error fetching languages:', error);
        }
    };


    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setState(prev => ({
            ...prev,
            formData: {
                ...prev.formData,
                [state.activeForm!]: {
                    ...prev.formData[state.activeForm!],
                    name: value
                }
            }
        }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setState(prev => ({
            ...prev,
            formData: {
                ...prev.formData,
                [state.activeForm!]: {
                    ...prev.formData[state.activeForm!],
                    file
                }
            }
        }));
    };

    // Function untuk edit skill
    const handleEditSkill = (skill: SavedDataItem) => {
        setState(prev => ({
            ...prev,
            activeForm: 'skills',
            editingId: skill.id,
            formData: {
                ...prev.formData,
                skills: {
                    name: skill.skill_name || '',
                    file: null // File akan tetap null karena kita tidak bisa pre-fill file input
                }
            }
        }));
    };

    const handleSkillSubmit = async () => {
        const skillData = state.formData.skills;
        if (!skillData?.name) {
            setMessage({
                type: 'error',
                text: 'Nama skill harus diisi'
            });
            return;
        }

        setLoading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('skill_name', skillData.name);
        if (skillData.file) {
            formData.append('certificate_file', skillData.file);
        }

        try {
            if (state.editingId) {
                // Update existing skill using router.put()
                router.put(`/candidate/skills/${state.editingId}`, formData, {
                    onSuccess: (page: any) => {
                        if (page.props?.success) {
                            // Update existing skill in saved data
                            setSavedData(prev => ({
                                ...prev,
                                skills: prev.skills.map(skill => 
                                    skill.id === state.editingId ? page.props.data : skill
                                )
                            }));
                            setMessage({
                                type: 'success',
                                text: 'Skill berhasil diupdate!'
                            });

                            // Reset form and go back
                            setState(prev => ({
                                ...prev,
                                activeForm: null,
                                editingId: null,
                                formData: {
                                    ...prev.formData,
                                    skills: { name: '', file: null }
                                }
                            }));

                            setTimeout(() => {
                                setMessage(null);
                            }, 3000);
                        }
                    },
                    onError: (error: any) => {
                        console.error('Error updating skill:', error);
                        setMessage({
                            type: 'error',
                            text: error?.message || 'Gagal mengupdate skill'
                        });
                    },
                    onFinish: () => {
                        setLoading(false);
                    }
                });
            } else {
                // Create new skill using router.post()
                router.post('/candidate/skills', formData, {
                    onSuccess: (page: any) => {
                        if (page.props?.success) {
                            // Add new skill to saved data
                            setSavedData(prev => ({
                                ...prev,
                                skills: [...prev.skills, page.props.data]
                            }));
                            setMessage({
                                type: 'success',
                                text: 'Skill berhasil disimpan!'
                            });

                            // Reset form and go back
                            setState(prev => ({
                                ...prev,
                                activeForm: null,
                                editingId: null,
                                formData: {
                                    ...prev.formData,
                                    skills: { name: '', file: null }
                                }
                            }));

                            setTimeout(() => {
                                setMessage(null);
                            }, 3000);
                        }
                    },
                    onError: (error: any) => {
                        console.error('Error saving skill:', error);
                        setMessage({
                            type: 'error',
                            text: error?.message || 'Gagal menyimpan skill'
                        });
                    },
                    onFinish: () => {
                        setLoading(false);
                    }
                });
            }
        } catch (error: any) {
            console.error('Error saving skill:', error);
            setMessage({
                type: 'error',
                text: 'Gagal menyimpan skill'
            });
            setLoading(false);
        }
    };

    const handleDeleteSkill = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus skill ini?')) {
            return;
        }

        setLoading(true);

        try {
            // Use router.delete()
            router.delete(`/candidate/skills/${id}`, {
                onSuccess: (page: any) => {
                    if (page.props?.success) {
                        setSavedData(prev => ({
                            ...prev,
                            skills: prev.skills.filter(skill => skill.id !== id)
                        }));
                        setMessage({
                            type: 'success',
                            text: 'Skill berhasil dihapus!'
                        });

                        setTimeout(() => {
                            setMessage(null);
                        }, 3000);
                    }
                },
                onError: (error: any) => {
                    console.error('Error deleting skill:', error);
                    setMessage({
                        type: 'error',
                        text: error?.message || 'Gagal menghapus skill'
                    });
                },
                onFinish: () => {
                    setLoading(false);
                }
            });
        } catch (error: any) {
            console.error('Error deleting skill:', error);
            setMessage({
                type: 'error',
                text: 'Gagal menghapus skill'
            });
            setLoading(false);
        }
    };

    // Course handlers
    const handleEditCourse = (course: SavedDataItem) => {
        setState(prev => ({
            ...prev,
            activeForm: 'kursus',
            editingId: course.id,
            formData: {
                ...prev.formData,
                kursus: {
                    name: course.course_name || '',
                    file: null
                }
            }
        }));
    };

    const handleCourseSubmit = async () => {
        const courseData = state.formData.kursus;
        if (!courseData?.name) {
            setMessage({
                type: 'error',
                text: 'Nama kursus harus diisi'
            });
            return;
        }

        setLoading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('course_name', courseData.name);
        if (courseData.file) {
            formData.append('certificate_file', courseData.file);
        }

        try {
            if (state.editingId) {
                router.put(`/candidate/courses/${state.editingId}`, formData, {
                    onSuccess: (page: any) => {
                        if (page.props?.success) {
                            setSavedData(prev => ({
                                ...prev,
                                kursus: prev.kursus.map(course => 
                                    course.id === state.editingId ? page.props.data : course
                                )
                            }));
                            setMessage({
                                type: 'success',
                                text: 'Kursus berhasil diupdate!'
                            });

                            setState(prev => ({
                                ...prev,
                                activeForm: null,
                                editingId: null,
                                formData: {
                                    ...prev.formData,
                                    kursus: { name: '', file: null }
                                }
                            }));

                            setTimeout(() => {
                                setMessage(null);
                            }, 3000);
                        }
                    },
                    onError: (error: any) => {
                        console.error('Error updating course:', error);
                        setMessage({
                            type: 'error',
                            text: error?.message || 'Gagal mengupdate kursus'
                        });
                    },
                    onFinish: () => {
                        setLoading(false);
                    }
                });
            } else {
                router.post('/candidate/courses', formData, {
                    onSuccess: (page: any) => {
                        if (page.props?.success) {
                            setSavedData(prev => ({
                                ...prev,
                                kursus: [...prev.kursus, page.props.data]
                            }));
                            setMessage({
                                type: 'success',
                                text: 'Kursus berhasil disimpan!'
                            });

                            setState(prev => ({
                                ...prev,
                                activeForm: null,
                                editingId: null,
                                formData: {
                                    ...prev.formData,
                                    kursus: { name: '', file: null }
                                }
                            }));

                            setTimeout(() => {
                                setMessage(null);
                            }, 3000);
                        }
                    },
                    onError: (error: any) => {
                        console.error('Error saving course:', error);
                        setMessage({
                            type: 'error',
                            text: error?.message || 'Gagal menyimpan kursus'
                        });
                    },
                    onFinish: () => {
                        setLoading(false);
                    }
                });
            }
        } catch (error: any) {
            console.error('Error saving course:', error);
            setMessage({
                type: 'error',
                text: 'Gagal menyimpan kursus'
            });
            setLoading(false);
        }
    };

    const handleDeleteCourse = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus kursus ini?')) {
            return;
        }

        setLoading(true);

        try {
            router.delete(`/candidate/courses/${id}`, {
                onSuccess: (page: any) => {
                    if (page.props?.success) {
                        setSavedData(prev => ({
                            ...prev,
                            kursus: prev.kursus.filter(course => course.id !== id)
                        }));
                        setMessage({
                            type: 'success',
                            text: 'Kursus berhasil dihapus!'
                        });

                        setTimeout(() => {
                            setMessage(null);
                        }, 3000);
                    }
                },
                onError: (error: any) => {
                    console.error('Error deleting course:', error);
                    setMessage({
                        type: 'error',
                        text: error?.message || 'Gagal menghapus kursus'
                    });
                },
                onFinish: () => {
                    setLoading(false);
                }
            });
        } catch (error: any) {
            console.error('Error deleting course:', error);
            setMessage({
                type: 'error',
                text: 'Gagal menghapus kursus'
            });
            setLoading(false);
        }
    };

    // Certification handlers
    const handleEditCertification = (certification: SavedDataItem) => {
        setState(prev => ({
            ...prev,
            activeForm: 'sertifikasi',
            editingId: certification.id,
            formData: {
                ...prev.formData,
                sertifikasi: {
                    name: certification.certification_name || '',
                    file: null
                }
            }
        }));
    };

    const handleCertificationSubmit = async () => {
        const certificationData = state.formData.sertifikasi;
        if (!certificationData?.name) {
            setMessage({
                type: 'error',
                text: 'Nama sertifikasi harus diisi'
            });
            return;
        }

        setLoading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('certification_name', certificationData.name);
        if (certificationData.file) {
            formData.append('certificate_file', certificationData.file);
        }

        try {
            if (state.editingId) {
                router.put(`/candidate/certifications/${state.editingId}`, formData, {
                    onSuccess: (page: any) => {
                        if (page.props?.success) {
                            setState(prev => ({
                                ...prev,
                                activeForm: null,
                                editingId: null,
                                formData: {
                                    ...prev.formData,
                                    sertifikasi: { name: '', file: null }
                                }
                            }));

                            setMessage({
                                type: 'success',
                                text: 'Sertifikasi berhasil diupdate!'
                            });

                            fetchCertificationsData();

                            setTimeout(() => {
                                setMessage(null);
                            }, 3000);
                        }
                    },
                    onError: (error: any) => {
                        console.error('Error updating certification:', error);
                        setMessage({
                            type: 'error',
                            text: error?.message || 'Gagal mengupdate sertifikasi'
                        });
                    },
                    onFinish: () => {
                        setLoading(false);
                    }
                });
            } else {
                router.post('/candidate/certifications', formData, {
                    onSuccess: (page: any) => {
                        if (page.props?.success) {
                            setState(prev => ({
                                ...prev,
                                activeForm: null,
                                editingId: null,
                                formData: {
                                    ...prev.formData,
                                    sertifikasi: { name: '', file: null }
                                }
                            }));

                            setMessage({
                                type: 'success',
                                text: 'Sertifikasi berhasil disimpan!'
                            });

                            fetchCertificationsData();

                            setTimeout(() => {
                                setMessage(null);
                            }, 3000);
                        }
                    },
                    onError: (error: any) => {
                        console.error('Error saving certification:', error);
                        setMessage({
                            type: 'error',
                            text: error?.message || 'Gagal menyimpan sertifikasi'
                        });
                    },
                    onFinish: () => {
                        setLoading(false);
                    }
                });
            }
        } catch (error: any) {
            console.error('Error saving certification:', error);
            setMessage({
                type: 'error',
                text: 'Gagal menyimpan sertifikasi'
            });
            setLoading(false);
        }
    };

    const handleDeleteCertification = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus sertifikasi ini?')) {
            return;
        }

        setLoading(true);

        try {
            router.delete(`/candidate/certifications/${id}`, {
                onSuccess: (page: any) => {
                    if (page.props?.success) {
                        setSavedData(prev => ({
                            ...prev,
                            sertifikasi: prev.sertifikasi.filter(cert => cert.id !== id)
                        }));
                        setMessage({
                            type: 'success',
                            text: 'Sertifikasi berhasil dihapus!'
                        });

                        setTimeout(() => {
                            setMessage(null);
                        }, 3000);
                    }
                },
                onError: (error: any) => {
                    console.error('Error deleting certification:', error);
                    setMessage({
                        type: 'error',
                        text: error?.message || 'Gagal menghapus sertifikasi'
                    });
                },
                onFinish: () => {
                    setLoading(false);
                }
            });
        } catch (error: any) {
            console.error('Error deleting certification:', error);
            setMessage({
                type: 'error',
                text: 'Gagal menghapus sertifikasi'
            });
            setLoading(false);
        }
    };

    // Language handlers
    const handleEditLanguage = (language: SavedDataItem) => {
        setState(prev => ({
            ...prev,
            activeForm: 'bahasa',
            editingId: language.id,
            formData: {
                ...prev.formData,
                bahasa: {
                    name: language.language_name || '',
                    file: null
                }
            }
        }));
    };

    const handleLanguageSubmit = async () => {
        const languageData = state.formData.bahasa;
        if (!languageData?.name) {
            setMessage({
                type: 'error',
                text: 'Nama bahasa harus diisi'
            });
            return;
        }

        setLoading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('language_name', languageData.name);
        if (languageData.file) {
            formData.append('certificate_file', languageData.file);
        }

        try {
            if (state.editingId) {
                router.put(`/candidate/languages/${state.editingId}`, formData, {
                    onSuccess: (page: any) => {
                        if (page.props?.success) {
                            setState(prev => ({
                                ...prev,
                                activeForm: null,
                                editingId: null,
                                formData: {
                                    ...prev.formData,
                                    bahasa: { name: '', file: null }
                                }
                            }));

                            setMessage({
                                type: 'success',
                                text: 'Bahasa berhasil diupdate!'
                            });

                            fetchLanguagesData();

                            setTimeout(() => {
                                setMessage(null);
                            }, 3000);
                        }
                    },
                    onError: (error: any) => {
                        console.error('Error updating language:', error);
                        setMessage({
                            type: 'error',
                            text: error?.message || 'Gagal mengupdate bahasa'
                        });
                    },
                    onFinish: () => {
                        setLoading(false);
                    }
                });
            } else {
                router.post('/candidate/languages', formData, {
                    onSuccess: (page: any) => {
                        if (page.props?.success) {
                            setState(prev => ({
                                ...prev,
                                activeForm: null,
                                editingId: null,
                                formData: {
                                    ...prev.formData,
                                    bahasa: { name: '', file: null }
                                }
                            }));

                            setMessage({
                                type: 'success',
                                text: 'Bahasa berhasil disimpan!'
                            });

                            fetchLanguagesData();

                            setTimeout(() => {
                                setMessage(null);
                            }, 3000);
                        }
                    },
                    onError: (error: any) => {
                        console.error('Error saving language:', error);
                        setMessage({
                            type: 'error',
                            text: error?.message || 'Gagal menyimpan bahasa'
                        });
                    },
                    onFinish: () => {
                        setLoading(false);
                    }
                });
            }
        } catch (error: any) {
            console.error('Error saving language:', error);
            setMessage({
                type: 'error',
                text: 'Gagal menyimpan bahasa'
            });
            setLoading(false);
        }
    };

    const handleDeleteLanguage = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus bahasa ini?')) {
            return;
        }

        setLoading(true);

        try {
            router.delete(`/candidate/languages/${id}`, {
                onSuccess: (page: any) => {
                    if (page.props?.success) {
                        setSavedData(prev => ({
                            ...prev,
                            bahasa: prev.bahasa.filter(lang => lang.id !== id)
                        }));
                        setMessage({
                            type: 'success',
                            text: 'Bahasa berhasil dihapus!'
                        });

                        setTimeout(() => {
                            setMessage(null);
                        }, 3000);
                    }
                },
                onError: (error: any) => {
                    console.error('Error deleting language:', error);
                    setMessage({
                        type: 'error',
                        text: error?.message || 'Gagal menghapus bahasa'
                    });
                },
                onFinish: () => {
                    setLoading(false);
                }
            });
        } catch (error: any) {
            console.error('Error deleting language:', error);
            setMessage({
                type: 'error',
                text: 'Gagal menghapus bahasa'
            });
            setLoading(false);
        }
    };

    
    // Forms
    if (state.activeForm === 'skills') {
        return (
            <div className="bg-white rounded-lg shadow-sm">
                {message && (
                    <div
                        className={`p-4 mb-4 rounded ${
                            message.type === 'success' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {message.text}
                    </div>
                )}
                
                <TwoColumnForm
                    title={state.editingId ? "Edit Skills/Kemampuan" : "Skills/Kemampuan"}
                    inputLabel="Nama Skill"
                    inputName="skillName"
                    inputValue={state.formData.skills?.name || ''}
                    inputPlaceholder="Masukkan nama skill"
                    fileLabel="Upload Sertifikat Skill"
                    fileName="skillFile"
                    onInputChange={handleInputChange}
                    onFileChange={handleFileChange}
                    onBack={() => setState(prev => ({ 
                        ...prev, 
                        activeForm: null, 
                        editingId: null,
                        formData: {
                            ...prev.formData,
                            skills: { name: '', file: null }
                        }
                    }))}
                    hideSubmitButton={false}
                    onSubmit={handleSkillSubmit}
                    loading={loading}
                    submitButtonText={state.editingId ? "Update" : "Save & Next"}
                />
            </div>
        );
    }

    if (state.activeForm === 'kursus') {
        return (
            <div className="bg-white rounded-lg shadow-sm">
                {/* Notification Message */}
                {message && (
                    <div
                        className={`p-4 mb-4 rounded ${
                            message.type === 'success' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {message.text}
                    </div>
                )}
                
                <TwoColumnForm
                    title={state.editingId ? "Edit Kursus atau Training" : "Kursus atau Training"}
                    inputLabel="Nama Kursus"
                    inputName="kursusName"
                    inputValue={state.formData.kursus?.name || ''}
                    inputPlaceholder="Masukkan nama kursus"
                    fileLabel="Upload Sertifikat Kursus"
                    fileName="kursusFile"
                    onInputChange={handleInputChange}
                    onFileChange={handleFileChange}
                    onBack={() => setState(prev => ({ 
                        ...prev, 
                        activeForm: null, 
                        editingId: null,
                        formData: {
                            ...prev.formData,
                            kursus: { name: '', file: null }
                        }
                    }))}
                    hideSubmitButton={false}
                    onSubmit={handleCourseSubmit}
                    loading={loading}
                    submitButtonText={state.editingId ? "Update" : "Save & Next"}
                />
            </div>
        );
    }

    if (state.activeForm === 'sertifikasi') {
        return (
            <div className="bg-white rounded-lg shadow-sm">
                {/* Notification Message */}
                {message && (
                    <div
                        className={`p-4 mb-4 rounded ${
                            message.type === 'success' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {message.text}
                    </div>
                )}
                
                <TwoColumnForm
                    title={state.editingId ? "Edit Sertifikasi" : "Sertifikasi"}
                    inputLabel="Nama Sertifikasi"
                    inputName="sertifikasiName"
                    inputValue={state.formData.sertifikasi?.name || ''}
                    inputPlaceholder="Masukkan nama sertifikasi"
                    fileLabel="Upload Sertifikat"
                    fileName="sertifikasiFile"
                    onInputChange={handleInputChange}
                    onFileChange={handleFileChange}
                    onBack={() => setState(prev => ({ 
                        ...prev, 
                        activeForm: null, 
                        editingId: null,
                        formData: {
                            ...prev.formData,
                            sertifikasi: { name: '', file: null }
                        }
                    }))}
                    hideSubmitButton={false}
                    onSubmit={handleCertificationSubmit}
                    loading={loading}
                    submitButtonText={state.editingId ? "Update" : "Save & Next"}
                />
            </div>
        );
    }

    if (state.activeForm === 'bahasa') {
        return (
            <div className="bg-white rounded-lg shadow-sm">
                {message && (
                    <div
                        className={`p-4 mb-4 rounded ${
                            message.type === 'success' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {message.text}
                    </div>
                )}
                
                <TwoColumnForm
                    title={state.editingId ? "Edit Kemampuan Bahasa" : "Kemampuan Bahasa"}
                    inputLabel="Nama Bahasa"
                    inputName="bahasaName"
                    inputValue={state.formData.bahasa?.name || ''}
                    inputPlaceholder="Masukkan nama bahasa"
                    fileLabel="Upload Sertifikat Bahasa"
                    fileName="bahasaFile"
                    onInputChange={handleInputChange}
                    onFileChange={handleFileChange}
                    onBack={() => setState(prev => ({ 
                        ...prev, 
                        activeForm: null, 
                        editingId: null,
                        formData: {
                            ...prev.formData,
                            bahasa: { name: '', file: null }
                        }
                    }))}
                    hideSubmitButton={false}
                    onSubmit={handleLanguageSubmit}
                    loading={loading}
                    submitButtonText={state.editingId ? "Update" : "Save & Next"}
                />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6">
            {/* Notification Message */}
            {message && (
                <div
                    className={`p-4 mb-4 rounded ${
                        message.type === 'success' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                    }`}
                >
                    {message.text}
                </div>
            )}

            <div className="mb-6 border-b pb-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-blue-600">Data Tambahan</h2>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                    Lengkapi data tambahan di bawah ini
                </p>
            </div>

            <div className="space-y-6">
                {/* Skills section - existing */}
                <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Skills/Kemampuan</h3>
                    <p className="text-sm text-gray-600 mb-4">Skills apa yang Anda miliki?</p>
                    
                    {savedData.skills.map((skill) => (
                        <div key={skill.id} className="border rounded-lg p-4 mb-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-medium text-black">{skill.skill_name}</h4>
                                    {skill.certificate_file && (
                                        <p className="text-sm text-gray-600">
                                            <a 
                                                href={`/storage/${skill.certificate_file}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                Lihat Sertifikat
                                            </a>
                                        </p>
                                    )}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditSkill(skill)}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                        disabled={loading}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSkill(skill.id)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                        disabled={loading}
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <button
                        type="button"
                        onClick={() => setState(prev => ({ ...prev, activeForm: 'skills' }))}
                        className="text-blue-600 text-sm hover:text-blue-700"
                    >
                        + Tambah Skills
                    </button>
                </section>

                {/* Courses section */}
                <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Kursus atau Training</h3>
                    <p className="text-sm text-gray-600 mb-4">Apakah Anda memiliki riwayat kursus yang pernah diikuti?</p>
                    
                    {savedData.kursus.map((course) => (
                        <div key={course.id} className="border rounded-lg p-4 mb-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-medium text-black">{course.course_name}</h4>
                                    {course.certificate_file && (
                                        <p className="text-sm text-gray-600">
                                            <a 
                                                href={`/storage/${course.certificate_file}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                Lihat Sertifikat
                                            </a>
                                        </p>
                                    )}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditCourse(course)}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                        disabled={loading}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCourse(course.id)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                        disabled={loading}
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <button
                        type="button"
                        onClick={() => setState(prev => ({ ...prev, activeForm: 'kursus' }))}
                        className="text-blue-600 text-sm hover:text-blue-700"
                    >
                        + Tambah Kursus atau Training
                    </button>
                </section>

                {/* Certifications section - HAPUS DUPLIKAT, HANYA SISAKAN SATU */}
                <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Sertifikasi</h3>
                    <p className="text-sm text-gray-600 mb-4">Apakah Anda memiliki sertifikasi sebelumnya?</p>
                    
                    {savedData.sertifikasi && savedData.sertifikasi.length > 0 ? (
                        savedData.sertifikasi.map((certification) => (
                            <div key={certification.id} className="border rounded-lg p-4 mb-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-black">{certification.certification_name}</h4>
                                        {certification.certificate_file && (
                                            <p className="text-sm text-gray-600">
                                                <a 
                                                    href={`/storage/${certification.certificate_file}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Lihat Sertifikat
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditCertification(certification)}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                            disabled={loading}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCertification(certification.id)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                            disabled={loading}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 italic">Belum ada data sertifikasi</p>
                    )}
                    
                    <button
                        type="button"
                        onClick={() => setState(prev => ({ ...prev, activeForm: 'sertifikasi' }))}
                        className="text-blue-600 text-sm hover:text-blue-700"
                    >
                        + Tambah Sertifikasi
                    </button>
                </section>

                {/* Languages section - TAMBAHKAN INI */}
                <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Kemampuan Bahasa</h3>
                    <p className="text-sm text-gray-600 mb-4">Bahasa apa saja yang Anda kuasai?</p>
                    
                    {savedData.bahasa && savedData.bahasa.length > 0 ? (
                        savedData.bahasa.map((language) => (
                            <div key={language.id} className="border rounded-lg p-4 mb-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-black">{language.language_name}</h4>
                                        {language.certificate_file && (
                                            <p className="text-sm text-gray-600">
                                                <a 
                                                    href={`/storage/${language.certificate_file}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Lihat Sertifikat
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditLanguage(language)}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                            disabled={loading}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLanguage(language.id)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                            disabled={loading}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 italic">Belum ada data bahasa</p>
                    )}
                    
                    <button
                        type="button"
                        onClick={() => setState(prev => ({ ...prev, activeForm: 'bahasa' }))}
                        className="text-blue-600 text-sm hover:text-blue-700"
                    >
                        + Tambah Bahasa
                    </button>
                </section>

              
            </div>
        </div>
    );
};

export default DataTambahanForm;