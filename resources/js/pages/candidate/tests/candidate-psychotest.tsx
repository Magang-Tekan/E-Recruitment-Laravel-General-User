import React, { useState, useEffect, useRef } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import Swal from 'sweetalert2';
import { useExamSecurity } from '../../../hooks/useExamSecurity';

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
    userAnswers: Record<number, string | { text: string; type: string }>;
};

export default function CandidatePsychotest() {
    const { questions = [], assessment, userAnswers: initialUserAnswers = {} } = usePage<PageProps>().props;
    
    // State management
    const [currentPhase, setCurrentPhase] = useState<'start' | 'test' | 'complete'>('start');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    // Support both multiple choice (string = choice_id) and essay (object with text)
    const [userAnswers, setUserAnswers] = useState<Record<number, string | { text: string; type: string }>>(initialUserAnswers || {});
    const [rulesAccepted, setRulesAccepted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [testStarted, setTestStarted] = useState(false);
    const [markedQuestions, setMarkedQuestions] = useState(Array(questions.length).fill(false));
    const [testCompleted, setTestCompleted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Pindahkan countdown state ke level atas
    const [countdown, setCountdown] = useState(8);
    
    // Anti-cheating states
    const [cheatingWarnings, setCheatingWarnings] = useState(0);
    const [showCheatingModal, setShowCheatingModal] = useState(false);
    const [, setIsTabVisible] = useState(true);
    const [modalJustClosed, setModalJustClosed] = useState(false);

    // Exam security (copy/paste/PrintScreen) violations
    const [securityViolations, setSecurityViolations] = useState(0);
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [lastBlockedAction, setLastBlockedAction] = useState<string>('');

    const registerSecurityViolation = (action: string) => {
        // Saat sudah submit / complete, jangan ganggu UI
        if (currentPhase !== 'test' || testCompleted) return;

        setLastBlockedAction(action);
        setShowSecurityModal(true);
        setSecurityViolations((prev) => prev + 1);
    };

    // Blokir copy/paste/cut/klik kanan hanya saat kandidat benar-benar sedang mengerjakan ujian
    useExamSecurity(currentPhase === 'test', {
        onBlockedAction: (action) => {
            registerSecurityViolation(action);
        },
    });

    // Deteksi PrintScreen (best-effort; tidak selalu bisa dicegah di semua OS/browser)
    useEffect(() => {
        if (currentPhase !== 'test' || testCompleted) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Banyak browser expose sebagai 'PrintScreen'; sebagian sebagai keyCode 44
            const key = (e.key || '').toLowerCase();
            const keyCode = (e as unknown as { keyCode?: number }).keyCode;
            const isPrintScreen = key === 'printscreen' || keyCode === 44;

            if (isPrintScreen) {
                e.preventDefault();
                e.stopPropagation();
                registerSecurityViolation('printscreen');
                // Tidak ada cara standar untuk memastikan screenshot gagal,
                // tapi kita bisa berusaha mengosongkan clipboard (best-effort)
                if (navigator.clipboard?.writeText) {
                    navigator.clipboard.writeText('').catch(() => undefined);
                }
                return false;
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [currentPhase, testCompleted]);

    // Auto-fail setelah 3 kali pelanggaran selama ujian
    useEffect(() => {
        if (currentPhase !== 'test' || testCompleted) return;
        if (securityViolations < 3) return;

        // Tutup modal keamanan, lalu paksa selesaikan ujian
        setShowSecurityModal(false);

        Swal.fire({
            title: 'Ujian Dihentikan',
            html: `
                <div class="text-left">
                    <p class="mb-2">Kami mendeteksi pelanggaran aturan ujian sebanyak <strong>${securityViolations} kali</strong>.</p>
                    <p class="text-red-600 font-semibold">Sesuai aturan, ujian Anda dihentikan dan dinyatakan tidak lulus.</p>
                </div>
            `,
            icon: 'error',
            confirmButtonText: 'Mengerti',
            confirmButtonColor: '#EF4444',
            allowOutsideClick: false,
            allowEscapeKey: false,
        }).then(() => {
            // gunakan flow submit yang sudah ada. Kita paksa complete tanpa konfirmasi.
            // isTimeUp=true supaya skip konfirmasi.
            handleCompleteTest(true);
        });
    }, [securityViolations, currentPhase, testCompleted]);

    const closeSecurityModal = () => {
        setShowSecurityModal(false);
    };

    const SecurityViolationModal = () => {
        if (!showSecurityModal) return null;

        const remaining = Math.max(0, 3 - securityViolations);
        const actionLabel = (() => {
            if (lastBlockedAction === 'printscreen') return 'Print Screen / Screenshot';
            if (lastBlockedAction === 'paste' || lastBlockedAction === 'ctrl+v') return 'Paste';
            if (lastBlockedAction === 'copy' || lastBlockedAction === 'ctrl+c') return 'Copy';
            if (lastBlockedAction === 'cut' || lastBlockedAction === 'ctrl+x') return 'Cut';
            if (lastBlockedAction === 'contextmenu') return 'Klik kanan';
            return lastBlockedAction || 'Aksi terlarang';
        })();

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-2xl">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-orange-600 mb-2">Dilarang Copy / Paste</h3>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                            Sistem mendeteksi percobaan: <strong>{actionLabel}</strong>.<br />
                            Selama ujian, copy/paste/screenshot tidak diperbolehkan.
                        </p>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-5 text-sm text-orange-800">
                            Pelanggaran: <strong>{securityViolations}/3</strong>. Sisa kesempatan: <strong>{remaining}</strong>.
                        </div>
                        <button
                            onClick={closeSecurityModal}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded font-medium transition-colors"
                        >
                            Saya Mengerti
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    
    // Ref to track current answer for immediate access (to handle last question bug)
    const currentAnswerRef = useRef<string | { text: string; type: string } | null>(null);

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
            // Waktu habis - submit otomatis meskipun belum ada jawaban
            handleCompleteTest(true);
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

    // Sync ref dengan jawaban saat ini ketika berpindah soal
    useEffect(() => {
        if (currentPhase === 'test' && questions.length > 0) {
            const currentQuestionData = questions[currentQuestion];
            if (currentQuestionData) {
                const currentAnswer = userAnswers[currentQuestionData.id];
                currentAnswerRef.current = currentAnswer || null;
            }
        }
    }, [currentQuestion, currentPhase, questions, userAnswers]);

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
        currentAnswerRef.current = choiceId;
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: choiceId
        }));
    };

    const handleEssayAnswerChange = (questionId: number, answerText: string) => {
        const essayAnswer = {
            text: answerText,
            type: 'essay'
        };
        currentAnswerRef.current = essayAnswer;
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: essayAnswer
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
        
        // Format answers for submission
        const formattedAnswers: Record<number, string | { text: string; type: string }> = {};
        Object.keys(userAnswers).forEach(key => {
            const questionId = parseInt(key);
            const answer = userAnswers[questionId];
            formattedAnswers[questionId] = answer;
        });
        
        try {
            // Submit with cheating flag
            router.post('/candidate/tests/psychotest/submit', {
                application_id: assessment?.id,
                answers: formattedAnswers,
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

    const handleCompleteTest = async (isTimeUp: boolean = false) => {
        try {
            // FIX: Pastikan jawaban untuk soal terakhir tersimpan sebelum submit
            // Ini mengatasi bug dimana jawaban terakhir tidak terkirim jika user langsung klik "Akhiri Tes"
            const currentQuestionData = questions[currentQuestion];
            const finalAnswers = { ...userAnswers };
            
            // Pastikan jawaban terakhir tersimpan jika ada di ref tapi belum di state
            if (currentQuestionData && currentAnswerRef.current) {
                const currentQuestionId = currentQuestionData.id;
                // Simpan jawaban saat ini ke finalAnswers
                finalAnswers[currentQuestionId] = currentAnswerRef.current;
                // Update state juga untuk konsistensi
                setUserAnswers(finalAnswers);
            }

            // Validasi: User harus menjawab setidaknya satu soal sebelum mengakhiri test
            // Kecuali jika waktu habis (isTimeUp = true)
            const answeredCount = Object.keys(finalAnswers).filter(key => {
                const answer = finalAnswers[parseInt(key)];
                return answer && (typeof answer === 'string' || (typeof answer === 'object' && answer.text && answer.text.trim() !== ''));
            }).length;

            if (!isTimeUp && answeredCount === 0) {
                alert('Mohon jawab setidaknya satu pertanyaan sebelum menyelesaikan tes.');
                return;
            }

            const unansweredCount = questions.length - answeredCount;
            const completionPercentage = Math.round((answeredCount / questions.length) * 100);
            
            // Konfirmasi sebelum submit dengan informasi yang lebih jelas
            // Skip konfirmasi jika waktu habis (auto-submit)
            if (!isTimeUp) {
                // Redesign modal konfirmasi dengan SweetAlert2
                const result = await Swal.fire({
                    title: 'Konfirmasi Mengakhiri Tes',
                    html: `
                        <div class="text-left space-y-4">
                            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 class="font-semibold text-blue-900 mb-3 flex items-center">
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    Status Pengerjaan
                                </h3>
                                <div class="space-y-2">
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-700">Total Soal:</span>
                                        <span class="font-bold text-gray-900">${questions.length} soal</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-700">Sudah Dijawab:</span>
                                        <span class="font-bold text-green-600">${answeredCount} soal</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-700">Belum Dijawab:</span>
                                        <span class="font-bold ${unansweredCount > 0 ? 'text-orange-600' : 'text-gray-600'}">${unansweredCount} soal</span>
                                    </div>
                                    <div class="mt-3">
                                        <div class="flex justify-between items-center mb-1">
                                            <span class="text-xs text-gray-600">Progress</span>
                                            <span class="text-xs font-semibold text-gray-700">${completionPercentage}%</span>
                                        </div>
                                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                                            <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style="width: ${completionPercentage}%"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            ${unansweredCount > 0 ? `
                                <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <div class="flex items-start">
                                        <svg class="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                        </svg>
                                        <div>
                                            <p class="text-sm font-medium text-orange-800 mb-1">Perhatian!</p>
                                            <p class="text-xs text-orange-700">
                                                Anda masih memiliki <strong>${unansweredCount} soal</strong> yang belum dijawab. 
                                                Untuk hasil yang lebih akurat, disarankan untuk menjawab semua pertanyaan.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ` : `
                                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div class="flex items-center">
                                        <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        <p class="text-sm text-green-800 font-medium">Semua soal telah dijawab. Bagus!</p>
                                    </div>
                                </div>
                            `}
                            
                            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div class="flex items-start">
                                    <svg class="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                    </svg>
                                    <div>
                                        <p class="text-sm font-semibold text-red-800 mb-1">Peringatan Penting</p>
                                        <p class="text-xs text-red-700">
                                            Setelah Anda mengakhiri tes, jawaban tidak dapat diubah atau dikerjakan ulang. 
                                            Pastikan Anda telah memeriksa semua jawaban sebelum melanjutkan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <p class="text-center text-sm text-gray-600 font-medium">
                                Apakah Anda yakin ingin mengakhiri tes ini?
                            </p>
                        </div>
                    `,
                    icon: 'question',
                    iconColor: '#3B82F6',
                    showCancelButton: true,
                    confirmButtonText: '<i class="fas fa-check-circle mr-2"></i>Ya, Akhiri Tes',
                    cancelButtonText: '<i class="fas fa-times-circle mr-2"></i>Batal',
                    confirmButtonColor: '#EF4444',
                    cancelButtonColor: '#6B7280',
                    reverseButtons: true,
                    focusCancel: true,
                    customClass: {
                        popup: 'rounded-lg',
                        title: 'text-xl font-bold text-gray-900',
                        confirmButton: 'px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all',
                        cancelButton: 'px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all'
                    },
                    buttonsStyling: true,
                    allowOutsideClick: false,
                    allowEscapeKey: true
                });

                if (!result.isConfirmed) {
                    return;
                }
            } else {
                // Jika waktu habis, tampilkan notifikasi dengan SweetAlert2
                await Swal.fire({
                    title: 'Waktu Pengerjaan Habis',
                    html: `
                        <div class="text-center space-y-3">
                            <div class="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                                <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <p class="text-gray-700">
                                Waktu pengerjaan tes telah habis. Tes akan otomatis diselesaikan dan jawaban Anda akan dikirim.
                            </p>
                            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                                <p class="text-sm text-blue-800">
                                    <strong>Status:</strong> ${answeredCount} dari ${questions.length} soal telah dijawab
                                </p>
                            </div>
                        </div>
                    `,
                    icon: 'info',
                    iconColor: '#F59E0B',
                    confirmButtonText: 'Mengerti',
                    confirmButtonColor: '#3B82F6',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    timer: 3000,
                    timerProgressBar: true
                });
            }

            setIsSubmitting(true);
            setCurrentPhase('complete');
            setTestCompleted(true);
            setCountdown(8);
            
            // Format answers for submission: MC as choice_id string, Essay as object with text
            const formattedAnswers: Record<number, string | { text: string; type: string }> = {};
            Object.keys(finalAnswers).forEach(key => {
                const questionId = parseInt(key);
                const answer = finalAnswers[questionId];
                // Keep the format as is - backend should handle both string (MC) and object (essay)
                formattedAnswers[questionId] = answer;
            });
            
            console.log("Submitting data:", {
                application_id: assessment?.id,
                answers: formattedAnswers
            });
            
            try {
                // Gunakan router.post() dari Inertia.js
                router.post('/candidate/tests/psychotest/submit', {
                    application_id: assessment?.id,
                    answers: formattedAnswers
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
        const answer = userAnswers[questionId];
        // Check if answer exists (either string for MC or object with text for essay)
        const hasAnswer = answer && (typeof answer === 'string' || (typeof answer === 'object' && answer.text && answer.text.trim() !== ''));
        if (hasAnswer) {
            return markedQuestions[index] ? 'answered-marked' : 'answered';
        }
        return markedQuestions[index] ? 'unmarked-marked' : 'unanswered';
    };

    const getAnsweredCount = () => {
        return Object.keys(userAnswers).filter(key => {
            const answer = userAnswers[parseInt(key)];
            // Count as answered if it's a string (MC) or object with non-empty text (essay)
            return answer && (typeof answer === 'string' || (typeof answer === 'object' && answer.text && answer.text.trim() !== ''));
        }).length;
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
                {/* Security Violation Modal (copy/paste/printscreen) */}
                <SecurityViolationModal />
                </div>
            </>
        );
    }

    // Phase 2: Test Screen
    if (currentPhase === 'test' && questions.length > 0) {
        const currentQuestionData = questions[currentQuestion];
        const currentAnswer = currentQuestionData ? userAnswers[currentQuestionData.id] : '';
        const isEssay = currentQuestionData?.question_type === 'essay';
        const currentEssayAnswer = isEssay && typeof currentAnswer === 'object' && currentAnswer?.text ? currentAnswer.text : '';
        const currentMCAnswer = !isEssay && typeof currentAnswer === 'string' ? currentAnswer : '';

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
                            <div className="bg-blue-500 text-white px-8 py-5 rounded-t-lg flex items-center justify-between">
                                <h3 className="text-lg font-bold">Soal {currentQuestion + 1} dari {questions.length}</h3>
                                {isEssay && (
                                    <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                                        Essay
                                    </span>
                                )}
                                {!isEssay && (
                                    <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                                        Pilihan Ganda
                                    </span>
                                )}
                            </div>
                            {/* Question Content */}
                            <div className="px-4 py-6">
                                <p className="text-gray-900 mb-6 text-lg leading-relaxed">
                                    {currentQuestionData?.question}
                                </p>
                                
                                {/* Answer Options - Multiple Choice */}
                                {!isEssay && (
                                    <div className="space-y-3">
                                        {currentQuestionData?.options && currentQuestionData.options.length > 0 ? (
                                            currentQuestionData.options.map((option) => (
                                                <label
                                                    key={option.id}
                                                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                                                        currentMCAnswer === option.id.toString() 
                                                            ? 'border-blue-500 bg-blue-50' 
                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${currentQuestionData.id}`}
                                                        value={option.id}
                                                        checked={currentMCAnswer === option.id.toString()}
                                                        onChange={() => handleAnswerChange(currentQuestionData.id, option.id.toString())}
                                                        className="mt-1 mr-3 text-blue-500 w-5 h-5"
                                                    />
                                                    <span className="text-gray-900 text-base leading-relaxed">{option.text}</span>
                                                </label>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-sm italic">Tidak ada pilihan jawaban tersedia</p>
                                        )}
                                    </div>
                                )}

                                {/* Answer Input - Essay */}
                                {isEssay && (
                                    <div className="space-y-3">
                                        <textarea
                                            value={currentEssayAnswer}
                                            onChange={(e) => handleEssayAnswerChange(currentQuestionData.id, e.target.value)}
                                            placeholder="Tulis jawaban Anda di sini..."
                                            className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base leading-relaxed resize-y"
                                            rows={8}
                                        />
                                        <p className="text-sm text-gray-500">
                                            {currentEssayAnswer.length > 0 ? `${currentEssayAnswer.length} karakter` : 'Jawaban belum diisi'}
                                        </p>
                                    </div>
                                )}
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
                                    onClick={() => handleCompleteTest(false)}
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
                {/* Security Violation Modal (copy/paste/printscreen) */}
                <SecurityViolationModal />
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
                {/* Security Violation Modal (copy/paste/printscreen) */}
                <SecurityViolationModal />
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
