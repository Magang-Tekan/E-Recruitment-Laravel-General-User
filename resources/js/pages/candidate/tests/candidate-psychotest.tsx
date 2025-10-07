import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import Swal from 'sweetalert2';

interface Choice {
    id: number;
    text: string;
    is_correct?: boolean; // Optional karena mungkin tidak diekspos ke frontend
}

interface Question {
    id: number;
    question: string;
    question_type: string;
    options: Choice[];
}

interface Assessment {
    id: number; // application_id
    question_pack_id: number;
    title: string;
    description: string;
    duration: number; // in minutes
    opens_at?: string;
    closes_at?: string;
    formatted_opens_at?: string;
    formatted_closes_at?: string;
}

interface TestInfo {
    title: string;
    type: string;
    duration: number;
    totalQuestions: number;
    instructions: string;
}

type PageProps = InertiaPageProps & {
    questions: Question[];
    assessment: Assessment;
    userAnswers: Record<number, string>;
};

export default function CandidatePsychotest() {
    const { questions = [], assessment, userAnswers: initialUserAnswers = {} } = usePage<PageProps>().props;
    
    // State management
    const [currentPhase, setCurrentPhase] = useState<'start' | 'test' | 'complete'>('start');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>(initialUserAnswers || {});
    const [rulesAccepted, setRulesAccepted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [testStarted, setTestStarted] = useState(false);
    const [markedQuestions, setMarkedQuestions] = useState(Array(questions.length).fill(false));
    const [testCompleted, setTestCompleted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Pindahkan countdown state ke level atas
    const [countdown, setCountdown] = useState(8);
    
    // Anti-cheating states
    const [cheatingWarnings, setCheatingWarnings] = useState(0);
    const [showCheatingModal, setShowCheatingModal] = useState(false);
    const [isTabVisible, setIsTabVisible] = useState(true);
    const [modalJustClosed, setModalJustClosed] = useState(false);

    // Create test info from assessment
    const testInfo: TestInfo = {
        title: assessment?.title || 'Psychotest',
        type: 'Logic',
        duration: assessment?.duration || 60,
        totalQuestions: questions.length,
        instructions: assessment?.description || 'Pilih jawaban yang paling sesuai dengan diri Anda. Tidak ada jawaban benar atau salah. Jawablah dengan jujur dan spontan.'
    };

    // Timer effect
    useEffect(() => {
        if (testStarted && timeLeft > 0 && currentPhase === 'test') {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && testStarted && currentPhase === 'test') {
            handleCompleteTest();
        }
    }, [timeLeft, testStarted, currentPhase]);

    // Countdown effect - pindahkan ke luar conditional render
    useEffect(() => {
        if (currentPhase === 'complete') {
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
            return () => clearInterval(timer);
        }
    }, [currentPhase]);

    // Anti-cheating detection effects
    useEffect(() => {
        if (currentPhase !== 'test') return;

        const handleVisibilityChange = () => {
            if (document.hidden && !showCheatingModal && !modalJustClosed) {
                // Tab became hidden (user switched tab or minimized window)
                // Only trigger if modal is not currently showing and wasn't just closed
                setIsTabVisible(false);
                handleCheatingDetected();
            } else {
                // Tab became visible again
                setIsTabVisible(true);
            }
        };

        const handleBlur = () => {
            // Window lost focus (user clicked outside or switched app)
            // Only trigger if modal is not currently showing, wasn't just closed, and test is active
            if (currentPhase === 'test' && !showCheatingModal && !modalJustClosed) {
                handleCheatingDetected();
            }
        };

        const handleFocus = () => {
            // Window gained focus back
            setIsTabVisible(true);
        };

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        // Cleanup event listeners
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [currentPhase, cheatingWarnings, showCheatingModal, modalJustClosed]);

    // Disable certain browser shortcuts during test
    useEffect(() => {
        if (currentPhase !== 'test') return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Disable common shortcuts that could be used for cheating
            if (
                e.ctrlKey && (e.key === 't' || e.key === 'n' || e.key === 'w') || // New tab, new window, close tab
                e.key === 'F12' || // Developer tools
                (e.ctrlKey && e.shiftKey && e.key === 'I') || // Developer tools
                (e.ctrlKey && e.shiftKey && e.key === 'J') || // Console
                (e.ctrlKey && e.key === 'u') || // View source
                e.altKey && e.key === 'Tab' // Alt+Tab
            ) {
                e.preventDefault();
                e.stopPropagation();
                // Show warning for attempt to use shortcuts
                handleCheatingDetected();
                return false;
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [currentPhase, cheatingWarnings]);

    // Prevent browser back button after test completion
    useEffect(() => {
        if (currentPhase === 'complete' || testCompleted) {
            // Push a dummy state to prevent going back to test page
            const preventBack = () => {
                window.history.pushState(null, '', window.location.href);
            };
            
            // Add state to history
            window.history.pushState(null, '', window.location.href);
            
            // Listen for popstate (back button)
            const handlePopState = (e: PopStateEvent) => {
                e.preventDefault();
                window.history.pushState(null, '', window.location.href);
                
                // Show alert if user tries to go back
                alert('Anda tidak dapat kembali ke halaman ujian setelah selesai mengerjakan.');
            };
            
            window.addEventListener('popstate', handlePopState);
            
            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [currentPhase, testCompleted]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartTest = () => {
        // Konfirmasi sebelum memulai tes
        Swal.fire({
            title: 'Konfirmasi Memulai Ujian',
            html: `
                <div class="text-left">
                    <p class="mb-3">Anda akan memulai ujian dengan ketentuan:</p>
                    <ul class="text-sm text-gray-600 space-y-1">
                        <li>• Durasi: <strong>${testInfo?.duration || 60} menit</strong></li>
                        <li>• Jumlah soal: <strong>${questions.length} soal</strong></li>
                        <li>• Tidak dapat mengerjakan ulang setelah submit</li>
                        <li>• Sistem akan memantau aktivitas browser</li>
                    </ul>
                    <p class="mt-3 text-red-600 font-medium">Pastikan koneksi internet stabil dan tidak ada gangguan!</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Mulai Ujian',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#3B82F6',
            cancelButtonColor: '#6B7280'
        }).then((result) => {
            if (result.isConfirmed) {
                setTestStarted(true);
                setTimeLeft((testInfo?.duration || 60) * 60); // Convert minutes to seconds
                setCurrentPhase('test');
                
                // Toast notifikasi singkat
                Swal.fire({
                    title: 'Ujian Dimulai!',
                    text: 'Waktu sudah berjalan. Selamat mengerjakan!',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            }
        });
    };

    const handleAnswerChange = (questionId: number, choiceId: string) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: choiceId
        }));
    };

    const handlePreviousQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handleMarkQuestion = () => {
        const newMarked = [...markedQuestions];
        newMarked[currentQuestion] = !newMarked[currentQuestion];
        setMarkedQuestions(newMarked);
    };

    const goToQuestion = (index: number) => {
        setCurrentQuestion(index);
    };

    // Anti-cheating functions
    const handleCheatingDetected = () => {
        if (currentPhase !== 'test') return; // Only during active test
        
        const newWarningCount = cheatingWarnings + 1;
        setCheatingWarnings(newWarningCount);
        
        if (newWarningCount === 1) {
            // First warning - show modal
            setShowCheatingModal(true);
        } else if (newWarningCount >= 2) {
            // Second time - auto reject
            handleAutoReject();
        }
    };

    const handleAutoReject = async () => {
        setIsSubmitting(true);
        setCurrentPhase('complete');
        setTestCompleted(true);
        setCountdown(8);
        
        try {
            // Submit with cheating flag
            router.post('/candidate/tests/psychotest/submit', {
                application_id: assessment?.id,
                answers: userAnswers,
                is_cheating: true,
                cheating_reason: 'Membuka tab baru atau beralih ke aplikasi lain selama ujian'
            }, {
                onSuccess: (data) => {
                    console.log("Auto-rejected due to cheating:", data);
                    setTimeout(() => {
                        router.visit(`/candidate/application/${assessment?.id}/status`);
                    }, 8000);
                },
                onError: (errors) => {
                    console.error('Failed to submit cheating rejection:', errors);
                    alert('Terjadi kesalahan sistem. Ujian telah dihentikan karena pelanggaran.');
                    setTimeout(() => {
                        router.visit(`/candidate/application/${assessment?.id}/status`);
                    }, 3000);
                }
            });
        } catch (error) {
            console.error('Error auto-rejecting:', error);
            alert('Terjadi kesalahan sistem. Ujian telah dihentikan karena pelanggaran.');
            setTimeout(() => {
                router.visit(`/candidate/application/${assessment?.id}/status`);
            }, 3000);
        }
    };

    const closeCheatingModal = () => {
        setShowCheatingModal(false);
        setModalJustClosed(true);
        
        // Clear the flag after 2 seconds to allow normal detection to resume
        setTimeout(() => {
            setModalJustClosed(false);
        }, 2000);
    };

    // Anti-Cheating Modal Component
    const AntiCheatingModal = () => {
        if (!showCheatingModal) return null;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-2xl">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-red-600 mb-4">⚠️ Peringatan Kecurangan</h3>
                        <p className="text-gray-700 mb-6 leading-relaxed">
                            Kami mendeteksi bahwa Anda membuka tab baru atau beralih ke aplikasi lain selama ujian. 
                            <br /><br />
                            <strong className="text-red-600">Ini adalah peringatan pertama.</strong>
                            <br /><br />
                            Jika terdeteksi lagi, ujian akan otomatis berakhir dan Anda akan dinyatakan tidak lulus.
                        </p>
                        <button
                            onClick={closeCheatingModal}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-medium transition-colors"
                        >
                            Saya Mengerti, Lanjutkan Ujian
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handleCompleteTest = async () => {
        try {
            // Validasi
            if (Object.keys(userAnswers).length === 0) {
                alert('Mohon jawab setidaknya satu pertanyaan sebelum menyelesaikan tes.');
                return;
            }

            const answeredCount = Object.keys(userAnswers).length;
            const unansweredCount = questions.length - answeredCount;
            
            // Konfirmasi sebelum submit dengan informasi yang lebih jelas
            let confirmMessage = `Anda telah menjawab ${answeredCount} dari ${questions.length} pertanyaan.`;
            
            if (unansweredCount > 0) {
                confirmMessage += `\n\n${unansweredCount} pertanyaan belum dijawab. `;
                confirmMessage += 'Untuk hasil yang lebih akurat, disarankan untuk menjawab semua pertanyaan. ';
            }
            
            confirmMessage += '\n\nApakah Anda yakin ingin menyelesaikan tes ini? Jawaban tidak dapat diubah setelah diserahkan.';

            const confirmSubmit = window.confirm(confirmMessage);

            if (!confirmSubmit) {
                return;
            }

            setIsSubmitting(true);
            setCurrentPhase('complete');
            setTestCompleted(true);
            setCountdown(8);
            
            console.log("Submitting data:", {
                application_id: assessment?.id,
                answers: userAnswers
            });
            
            try {
                // Gunakan router.post() dari Inertia.js
                router.post('/candidate/tests/psychotest/submit', {
                    application_id: assessment?.id,
                    answers: userAnswers
                }, {
                    onSuccess: (data) => {
                        console.log("Server response:", data);
                        
                        // Tampilkan pesan sukses sebentar
                        setTimeout(() => {
                            // Redirect ke halaman status aplikasi spesifik
                            router.visit(`/candidate/application/${assessment?.id}/status`);
                        }, 8000); // 8 detik delay untuk menampilkan pesan completion
                    },
                    onError: (errors) => {
                        console.error('Failed to submit psychotest:', errors);
                        alert('Gagal menyimpan hasil tes: ' + (errors.message || 'Unknown error'));
                        setCurrentPhase('test');
                        setTestCompleted(false);
                        setIsSubmitting(false);
                    }
                });
            } catch (error) {
                console.error('Error submitting psychotest:', error);
                alert('Terjadi kesalahan saat mengirim data. Silakan coba lagi.');
                setCurrentPhase('test');
                setTestCompleted(false);
                setIsSubmitting(false);
            }
        } catch (error) {
        console.error('Error in handleCompleteTest:', error);
        alert('Terjadi kesalahan. Silakan coba lagi.');
        setCurrentPhase('test');
        setTestCompleted(false);
        setIsSubmitting(false);
        }
    };

    const handleBackToDashboard = () => {
        router.visit(`/candidate/application/${assessment?.id}/status`);
    };

    const getQuestionStatus = (index: number) => {
        const questionId = questions[index]?.id;
        if (userAnswers[questionId]) {
            return markedQuestions[index] ? 'answered-marked' : 'answered';
        }
        return markedQuestions[index] ? 'unmarked-marked' : 'unanswered';
    };

    const getAnsweredCount = () => {
        return Object.keys(userAnswers).length;
    };

    const getUnansweredCount = () => {
        return questions.length - getAnsweredCount();
    };

    const getMarkedCount = () => {
        return markedQuestions.filter(Boolean).length;
    };

    // Phase 1: Start Screen
    if (currentPhase === 'start') {
        return (
            <>
                <Head title={assessment?.title || 'Tes Psikotes'} />
                <div className="min-h-screen bg-white">
                {/* Header */}
                <div className="bg-white relative">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex items-center py-4">
                            {/* Logo dihilangkan */}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-6xl ml-0 md:ml-40 px-6 py-16">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{assessment?.title || 'Tes Psikotes'}</h2>
                        <p className="text-gray-600 mb-12 leading-relaxed text-justify">
                            {assessment?.description || 'Tes ini di rancang untuk membantu Anda untuk memahami kepribadian Anda lebih dalam. Hasil tes ini akan memberikan wawasan tentang kekuatan, kelemahan, dan preferensi Anda dalam berbagai situasi.'}
                        </p>

                        <div className="mb-12">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Informasi Tes</h3>
                            <div className="space-y-4">
                                <div className="flex">
                                    <span className="w-32 text-gray-700 font-medium">Tipe</span>
                                    <span className="text-gray-900 font-medium">{testInfo?.type || 'Logic'}</span>
                                </div>
                                {assessment?.formatted_opens_at && (
                                    <div className="flex">
                                        <span className="w-32 text-gray-700 font-medium">Open at</span>
                                        <span className="text-gray-900 font-medium">{assessment.formatted_opens_at}</span>
                                    </div>
                                )}
                                {assessment?.formatted_closes_at && (
                                    <div className="flex">
                                        <span className="w-32 text-gray-700 font-medium">Close at</span>
                                        <span className="text-gray-900 font-medium">{assessment.formatted_closes_at}</span>
                                    </div>
                                )}
                                <div className="flex">
                                    <span className="w-32 text-gray-700 font-medium">Durasi</span>
                                    <span className="text-gray-900 font-medium">{testInfo?.duration || 60} menit</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 text-gray-700 font-medium">Jumlah Soal</span>
                                    <span className="text-gray-900 font-medium">{testInfo?.totalQuestions || questions.length} Soal</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 text-gray-700 font-medium">Intruksi</span>
                                    <span className="text-gray-900 font-medium text-justify">
                                        {testInfo?.instructions || 'Pilih jawaban yang paling sesuai dengan diri Anda. Tidak ada jawaban benar atau salah. Jawablah dengan jujur dan spontan.'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Peraturan Ujian */}
                        <div className="mb-12">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Peraturan dan Ketentuan Ujian</h3>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <i className="fas fa-exclamation-triangle text-yellow-600 text-lg mt-1"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-yellow-800 mb-2">Penting untuk Diperhatikan!</h4>
                                        <p className="text-yellow-700 text-sm">
                                            Silakan baca dengan seksama peraturan di bawah ini sebelum memulai ujian.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="border-l-4 border-blue-500 pl-4">
                                    <h5 className="font-semibold text-gray-900 mb-2">📝 Aturan Mengerjakan Soal</h5>
                                    <ul className="text-gray-700 text-sm space-y-1">
                                        <li>• Bacalah setiap soal dengan teliti sebelum menjawab</li>
                                        <li>• Pilih jawaban yang paling sesuai dengan diri Anda</li>
                                        <li>• Tidak ada jawaban yang benar atau salah</li>
                                        <li>• Jawablah dengan jujur dan spontan</li>
                                        <li>• Pastikan semua soal telah dijawab sebelum mengakhiri tes</li>
                                    </ul>
                                </div>
                                
                                <div className="border-l-4 border-red-500 pl-4">
                                    <h5 className="font-semibold text-gray-900 mb-2">🚫 Larangan Selama Ujian</h5>
                                    <ul className="text-gray-700 text-sm space-y-1">
                                        <li>• <strong>Dilarang</strong> membuka tab atau aplikasi lain</li>
                                        <li>• <strong>Dilarang</strong> menggunakan bantuan orang lain</li>
                                        <li>• <strong>Dilarang</strong> menyalin atau membagikan soal</li>
                                        <li>• <strong>Dilarang</strong> menggunakan alat bantu seperti kalkulator/internet</li>
                                        <li>• <strong>Dilarang</strong> meninggalkan halaman ujian (akan terdeteksi sistem)</li>
                                    </ul>
                                </div>
                                
                                <div className="border-l-4 border-green-500 pl-4">
                                    <h5 className="font-semibold text-gray-900 mb-2">⏰ Manajemen Waktu</h5>
                                    <ul className="text-gray-700 text-sm space-y-1">
                                        <li>• Waktu ujian: <strong>{testInfo?.duration || 60} menit</strong></li>
                                        <li>• Timer akan berjalan otomatis setelah ujian dimulai</li>
                                        <li>• Ujian akan berakhir otomatis jika waktu habis</li>
                                        <li>• Gunakan fitur "Tandai" untuk soal yang ingin ditinjau ulang</li>
                                        <li>• Simpan jawaban secara berkala dengan navigasi antar soal</li>
                                    </ul>
                                </div>
                                
                                <div className="border-l-4 border-purple-500 pl-4">
                                    <h5 className="font-semibold text-gray-900 mb-2">🔒 Keamanan Sistem</h5>
                                    <ul className="text-gray-700 text-sm space-y-1">
                                        <li>• Sistem akan memantau aktivitas browser Anda</li>
                                        <li>• Peringatan akan muncul jika terdeteksi pelanggaran</li>
                                        <li>• Ujian dapat dibatalkan jika melanggar peraturan</li>
                                        <li>• Jawaban tersimpan otomatis untuk mencegah kehilangan data</li>
                                        <li>• Setelah submit, Anda tidak dapat mengerjakan ulang</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Checkbox Persetujuan */}
                        <div className="mb-8">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rulesAccepted}
                                        onChange={(e) => setRulesAccepted(e.target.checked)}
                                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Saya telah membaca dan memahami seluruh peraturan dan ketentuan ujian di atas. 
                                        Saya bersedia mengikuti ujian dengan jujur dan bertanggung jawab atas jawaban yang diberikan.
                                    </span>
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={handleStartTest}
                            disabled={!rulesAccepted}
                            className={`px-8 py-3 rounded font-medium transition-colors text-sm ${
                                rulesAccepted 
                                    ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {rulesAccepted ? 'Mulai Tes' : 'Baca dan Setujui Peraturan Terlebih Dahulu'}
                        </button>
                    </div>
                </div>
                
                {/* Anti-Cheating Modal */}
                <AntiCheatingModal />
                </div>
            </>
        );
    }

    // Phase 2: Test Screen
    if (currentPhase === 'test' && questions.length > 0) {
        const currentQuestionData = questions[currentQuestion];
        const currentAnswer = currentQuestionData ? userAnswers[currentQuestionData.id] : '';

        return (
            <>
                <Head title={`${assessment?.title || 'Tes Psikotes'} - Soal ${currentQuestion + 1}`} />
                <div className="min-h-screen bg-white">
                {/* Header */}
                <div className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex items-center justify-between py-4">
                            <h1 className="text-xl font-medium text-slate-900">PT Mitra Karya Analitika</h1>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 rounded-full px-3 py-1.5 bg-slate-100 text-slate-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-mono text-sm font-medium">{formatTime(timeLeft)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reminder Peraturan */}
                <div className="max-w-7xl mx-auto px-4 mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <i className="fas fa-info-circle text-blue-600"></i>
                            <span className="text-sm text-blue-800">
                                <strong>Perhatian:</strong> Jangan berpindah tab atau aplikasi lain. Sistem sedang memantau aktivitas Anda.
                            </span>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl w-full mx-auto px-4 py-8 flex gap-4 justify-center">
                    {/* Main Question Area */}
                    <div className="flex-1 max-w-3xl">
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
                            {/* Question Header */}
                            <div className="bg-blue-500 text-white px-8 py-5 rounded-t-lg">
                                <h3 className="text-lg font-bold">Soal {currentQuestion + 1} dari {questions.length}</h3>
                            </div>
                            {/* Question Content */}
                            <div className="px-4 py-6">
                                <p className="text-gray-900 mb-6 text-lg leading-relaxed">
                                    {currentQuestionData?.question}
                                </p>
                                {/* Answer Options */}
                                <div className="space-y-3">
                                    {currentQuestionData?.options.map((option) => (
                                        <label
                                            key={option.id}
                                            className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                                                userAnswers[currentQuestionData.id] === option.id.toString() 
                                                    ? 'border-blue-500 bg-blue-50' 
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${currentQuestionData.id}`}
                                                value={option.id}
                                                checked={userAnswers[currentQuestionData.id] === option.id.toString()}
                                                onChange={() => handleAnswerChange(currentQuestionData.id, option.id.toString())}
                                                className="mt-1 mr-3 text-blue-500 w-5 h-5"
                                            />
                                            <span className="text-gray-900 text-base leading-relaxed">{option.text}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {/* Navigation */}
                            <div className="flex justify-between items-center px-8 py-5 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                                <button
                                    onClick={handlePreviousQuestion}
                                    disabled={currentQuestion === 0}
                                    className="text-base text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2"
                                >
                                    Sebelumnya
                                </button>
                                <button 
                                    onClick={handleMarkQuestion}
                                    className="text-base text-gray-600 hover:text-gray-800 flex items-center px-5 py-2"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                                    </svg>
                                    {markedQuestions[currentQuestion] ? 'Hapus Tanda' : 'Tandai Soal'}
                                </button>
                                <button
                                    onClick={handleNextQuestion}
                                    disabled={currentQuestion === questions.length - 1}
                                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-2 rounded text-base font-bold transition-colors"
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Question Navigator Sidebar */}
                    <div className="w-96">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
                            {/* Question Grid */}
                            <div className="grid grid-cols-3 gap-x-6 gap-y-4 mb-8 justify-items-center">
                                {questions.map((_, index) => {
                                    const status = getQuestionStatus(index);
                                    
                                    let bgColor, textColor, borderColor;
                                    if (status === 'answered') {
                                        bgColor = 'bg-green-500';
                                        textColor = 'text-white';
                                        borderColor = 'border-green-500';
                                    } else if (status === 'answered-marked' || status === 'unmarked-marked') {
                                        bgColor = 'bg-orange-400';
                                        textColor = 'text-white';
                                        borderColor = 'border-orange-400';
                                    } else {
                                        bgColor = index === currentQuestion ? 'bg-blue-100' : 'bg-gray-100';
                                        textColor = 'text-gray-700';
                                        borderColor = index === currentQuestion ? 'border-blue-400' : 'border-gray-200';
                                    }
                                    
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => goToQuestion(index)}
                                            className={`w-14 h-14 rounded text-lg font-bold border-2 transition-colors ${bgColor} ${textColor} ${borderColor} hover:border-gray-300`}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>
                            {/* Legend */}
                            <div className="space-y-4 mb-8 text-base">
                                <div className="flex items-center">
                                    <div className="w-5 h-5 bg-green-500 rounded mr-3"></div>
                                    <span className="text-gray-700">Dijawab</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-5 h-5 bg-orange-400 rounded mr-3"></div>
                                    <span className="text-gray-700">Ditandai</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-5 h-5 bg-gray-100 border border-gray-300 rounded mr-3"></div>
                                    <span className="text-gray-700">Belum Dijawab</span>
                                </div>
                            </div>
                            {/* Status Summary */}
                            <div className="border-t border-gray-200 pt-8 bg-gray-50 rounded p-6 -mx-2 mt-4">
                                <h4 className="font-bold text-gray-900 mb-4 text-center text-lg">Status Pengerjaan</h4>
                                <div className="space-y-3 text-base">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Dijawab :</span>
                                        <span className="font-bold text-gray-900">{getAnsweredCount()} dari {questions.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ditandai :</span>
                                        <span className="font-bold text-gray-900">{getMarkedCount()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Belum Dijawab :</span>
                                        <span className="font-bold text-gray-900">{getUnansweredCount()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCompleteTest}
                                    className="w-full mt-8 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded font-bold text-lg transition-colors"
                                >
                                    Akhiri Tes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Anti-Cheating Modal */}
                <AntiCheatingModal />
                </div>
            </>
        );
    }

    // Phase 3: Completion Screen
    if (currentPhase === 'complete' || testCompleted) {
        // HAPUS useState di sini dan gunakan state yang sudah didefinisikan di atas
        // const [countdown, setCountdown] = useState(3); <-- INI YANG MENYEBABKAN ERROR
        
        // Hapus juga useEffect karena sudah dipindahkan ke level atas
        
        return (
            <>
                <Head title={`${assessment?.title || 'Tes Psikotes'} - Selesai`} />
                <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center max-w-2xl px-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Psychotest Berhasil Diselesaikan!
                    </h2>
                    <p className="text-gray-600 mb-8 text-sm">
                        Terima kasih telah menyelesaikan tes psikologi. Hasil tes Anda telah disimpan dan akan segera diproses oleh tim rekrutmen.
                    </p>
                    
                    {countdown > 0 && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-800 text-sm">
                                Anda akan diarahkan ke halaman status aplikasi dalam {countdown} detik...
                            </p>
                        </div>
                    )}
                    
                    <div className="w-full max-w-2xl mb-8" style={{ textAlign: 'left', marginLeft: 0 }}>
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Langkah selanjutnya</h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-green-600 text-sm font-bold">✓</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">Analisis Hasil</h4>
                                    <p className="text-gray-600 text-sm">Hasil tes Anda akan dianalisis oleh tim ahli kami dalam 1-2 hari kerja.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-600 text-sm font-bold">2</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">Notifikasi Email</h4>
                                    <p className="text-gray-600 text-sm">Anda akan menerima notifikasi melalui email setelah hasil tes siap.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-600 text-sm font-bold">3</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">Tahap Selanjutnya</h4>
                                    <p className="text-gray-600 text-sm">Pantau status aplikasi Anda untuk mengetahui perkembangan tahap selanjutnya.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleBackToDashboard}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded font-medium transition-colors text-sm"
                    >
                        Lihat Status Aplikasi
                    </button>
                </div>
                
                {/* Anti-Cheating Modal */}
                <AntiCheatingModal />
                </div>
            </>
        );
    }
    
    // Loading or error state
    return (
        <>
            <Head title={assessment?.title || 'Tes Psikotes'} />
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat tes...</p>
                </div>
            </div>
        </>
    );
}
