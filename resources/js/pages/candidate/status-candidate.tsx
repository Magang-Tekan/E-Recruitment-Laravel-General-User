import { Head, usePage } from '@inertiajs/react';

// === Icons SVG ===
const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);

// Define the props interface for the component matching backend data structure
interface ApplicationHistoryItem {
    id: number;
    status_id: number;
    status_name: string;
    status_color: string;
    stage: string;
    score: number | null;
    notes: string | null;
    resource_url: string | null; // Interview URL atau meeting link
    scheduled_at: string | null;
    completed_at: string | null;
    processed_at: string;
    reviewed_by: string | null;
    reviewed_at: string | null;
    is_active: boolean;
    is_qualified: boolean;
    created_at: string;
}

interface Application {
    id: number;
    status_id: number;
    status_name: string;
    status_color: string;
    current_score: number | null;
    current_reviewer: string | null;
    job: {
        id: number;
        title: string;
        company: string;
        location: string;
        type: string;
    };
    applied_at: string;
    histories: ApplicationHistoryItem[];
}

interface ApplicationStatusPageProps {
    application: Application;
}

export default function StatusCandidatePage({ application }: ApplicationStatusPageProps) {
    // Get the auth user data from Inertia shared props
    const { auth } = usePage<{ auth: { user: { name: string } } }>().props;
    const user = auth?.user;

    // Get all histories sorted by created_at (ascending order - oldest first)
    const sortedHistories = [...application.histories].sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateA.getTime() - dateB.getTime(); // Ascending order (oldest first)
    });

    // Get current status from APPLICATION TABLE (PRIMARY) - SINKRON dengan application-history.tsx
    const currentStatus = application.status_name; // Dari applications.status
    const currentScore = application.current_score; // Dari application_history yang matching
    const currentReviewer = application.current_reviewer; // Dari application_history yang matching
    const statusColor = application.status_color; // Warna berdasarkan applications.status

    const formatDateOnly = (dateString: string | null | undefined) => {
        if (!dateString) return '';
        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const formatDateTime = (dateString: string | null | undefined) => {
        if (!dateString) return '';
        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Status Aplikasi" />

            {/* Custom Header for Candidate Pages */}
            <header className="fixed top-0 right-0 left-0 z-50 h-[80px] border-b border-gray-200 bg-white px-[20px] shadow">
                <div className="container mx-auto flex items-center justify-between px-6 py-4">
                    <div className="text-[20px] font-bold text-gray-800">MITRA KARYA GROUP</div>

                    <nav className="hidden space-x-[24px] text-[14px] font-medium md:flex">
                        <a href="/candidate/dashboard" className="text-gray-900 hover:text-blue-800">
                            Beranda
                        </a>
                        <a href="/candidate/profile" className="text-gray-900 hover:text-blue-600">
                            Profil
                        </a>
                        <a href="/candidate/jobs" className="text-gray-900 hover:text-blue-600">
                            Lowongan Pekerjaan
                        </a>
                        <a href="/candidate/application-history" className="text-gray-900 hover:text-blue-600">
                            Lamaran
                        </a>
                    </nav>
                    <div className="flex items-center gap-4">
                        {/* User menu can be added here */}
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ marginTop: '80px' }}>
                {/* Candidate Profile Section */}
                <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
                    <div className="flex items-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-6">
                            <span className="text-2xl font-semibold text-gray-600">
                                {user?.name?.charAt(0).toUpperCase() || 'Z'}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'Zayyan'}</h2>
                            <p className="text-gray-600 mt-1">Posisi yang dilamar: <span className="font-semibold">{application.job.title}</span></p>
                            <p className="text-gray-800 font-semibold">{application.job.company}</p>
                            <div className="flex items-center mt-2 space-x-4">
                                <span
                                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white"
                                    style={{ backgroundColor: statusColor }}
                                >
                                    <CalendarIcon />
                                    <span className="ml-1">Status: {currentStatus}</span>
                                </span>
                                {currentScore && (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                        Skor: {currentScore}/100
                                    </span>
                                )}
                                {currentReviewer && (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        Reviewer: {currentReviewer}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recruitment Timeline */}
                <div className="space-y-6">
                    <div className="flex items-center mb-6">
                        <BriefcaseIcon />
                        <h3 className="text-lg font-bold text-gray-900">Tahapan Rekrutmen</h3>
                    </div>

                    {/* Timeline */}
                    <div className="relative">
                        {sortedHistories.map((history, index) => {
                            const isActive = history.is_active;
                            const isCompleted = history.completed_at !== null || history.stage === 'accepted';
                            const isRejected = history.stage === 'rejected';

                            return (
                                <div key={history.id} className="relative flex items-start mb-6">
                                    {/* Timeline line */}
                                    {index < sortedHistories.length - 1 && (
                                        <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200"></div>
                                    )}

                                    {/* Circle marker */}
                                    <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                                        isCompleted ? 'bg-green-500 border-green-500' :
                                        isActive ? 'bg-blue-500 border-blue-500' :
                                        isRejected ? 'bg-red-500 border-red-500' :
                                        'bg-gray-300 border-gray-300'
                                    }`}>
                                        {isCompleted ? (
                                            <CheckIcon />
                                        ) : (
                                            <span className="text-xs font-bold text-white">{index + 1}</span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="ml-6 flex-1">
                                        <div className={`bg-white rounded-lg border p-4 ${
                                            isActive ? 'border-blue-200 shadow-md' :
                                            isCompleted ? 'border-green-200' :
                                            isRejected ? 'border-red-200' :
                                            'border-gray-200'
                                        }`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{history.status_name}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        {isActive ? `Tahap saat ini` :
                                                         isCompleted ? `Selesai pada ${formatDateOnly(history.completed_at || history.processed_at)}` :
                                                         `Menunggu tahap sebelumnya`}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {formatDateOnly(history.created_at)}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-medium text-white`}
                                                    style={{
                                                        backgroundColor:
                                                            // Badge orange "Menunggu" untuk psikotes yang sudah dikerjakan tapi belum di-review
                                                            (isActive && history.completed_at &&
                                                             (history.status_name.toLowerCase().includes('psikotes') ||
                                                              history.status_name.toLowerCase().includes('test') ||
                                                              history.status_name.toLowerCase().includes('psychological')) &&
                                                             !history.reviewed_by)
                                                            ? '#f97316' // Warna orange untuk "Menunggu"
                                                            : isCompleted
                                                                ? '#3b82f6' // Warna biru untuk "Selesai"
                                                                : isActive
                                                                    ? history.status_color
                                                                    : isRejected
                                                                        ? history.status_color
                                                                        : '#9ca3af' // Abu-abu untuk status lainnya
                                                    }}
                                                >
                                                    {/* Ubah teks badge sesuai kondisi */}
                                                    {(isActive && history.completed_at &&
                                                      (history.status_name.toLowerCase().includes('psikotes') ||
                                                       history.status_name.toLowerCase().includes('test') ||
                                                       history.status_name.toLowerCase().includes('psychological')) &&
                                                      !history.reviewed_by)
                                                        ? 'Menunggu' // Badge "Menunggu" untuk psikotes yang sudah dikerjakan tapi belum di-review
                                                        : isCompleted
                                                            ? 'Selesai'
                                                            : isActive
                                                                ? 'Aktif'
                                                                : isRejected
                                                                    ? 'Ditolak'
                                                                    : 'Menunggu'}
                                                </span>
                                            </div>

                                            {/* Stage Details - Show for active and completed stages */}
                                            {(isActive || isCompleted) && (
                                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                    <h5 className="font-medium text-gray-900 mb-3">Detail:</h5>

                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div className="flex items-center">
                                                            <CalendarIcon />
                                                            <div className="ml-2">
                                                                <p className="text-gray-500">Tanggal</p>
                                                                {/* Ubah text-gray-500 menjadi text-gray-900 */}
                                                                <p className="font-medium text-gray-900">
                                                                    {history.scheduled_at ? formatDateTime(history.scheduled_at) : formatDateTime(history.created_at)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center">
                                                            <MapPinIcon />
                                                            <div className="ml-2">
                                                                <p className="text-gray-500">Lokasi</p>
                                                                {/* Ubah text-gray-900 */}
                                                                <p className="font-medium text-gray-900">
                                                                    {history.status_name.toLowerCase().includes('psikotes') ||
                                                                     history.status_name.toLowerCase().includes('test') ||
                                                                     history.status_name.toLowerCase().includes('psychological') ?
                                                                     'Online via Web' : 
                                                                     (history.status_name.toLowerCase().includes('interview') ||
                                                                      history.status_name.toLowerCase().includes('wawancara')) ?
                                                                     (history.resource_url ? 'Online via Web' : 'Kantor Pusat') : 'Kantor Pusat'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center">
                                                            <ClockIcon />
                                                            <div className="ml-2">
                                                                <p className="text-gray-500">Durasi</p>
                                                                {/* Ubah text-gray-900 */}
                                                                <p className="font-medium text-gray-900">
                                                                    {history.status_name.toLowerCase().includes('psikotes') ||
                                                                     history.status_name.toLowerCase().includes('test') ||
                                                                     history.status_name.toLowerCase().includes('psychological') ?
                                                                     '120 Menit' : 
                                                                     (history.status_name.toLowerCase().includes('interview') ||
                                                                      history.status_name.toLowerCase().includes('wawancara')) ?
                                                                     '60 Menit' : '60 Menit'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {history.score && (
                                                            <div>
                                                                <p className="text-gray-500">Skor</p>
                                                                <p className="font-medium text-gray-900">{history.score}/100</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Reviewer info */}
                                                    {history.reviewed_by && (
                                                        <div className="mt-3">
                                                            <p className="text-gray-500 text-sm">Reviewer: <span className="font-medium">{history.reviewed_by}</span></p>
                                                        </div>
                                                    )}

                                                    {/* Stage-specific content for interview */}
                                                    {(history.status_name.toLowerCase().includes('interview') ||
                                                      history.status_name.toLowerCase().includes('wawancara')) && (
                                                        <div className="mt-4">
                                                            <h6 className="font-medium text-gray-900 mb-2">Informasi Wawancara:</h6>
                                                            
                                                            {/* Jam Interview */}
                                                            {history.scheduled_at && (
                                                                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                                    <h6 className="font-medium text-blue-800 mb-1">Jadwal Wawancara:</h6>
                                                                    <p className="text-blue-700 font-medium">
                                                                        {formatDateTime(history.scheduled_at)}
                                                                    </p>
                                                                    <p className="text-sm text-blue-600 mt-1">
                                                                        Pastikan Anda hadir tepat waktu
                                                                    </p>
                                                                </div>
                                                            )}
                                                            
                                                            {history.resource_url && (
                                                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                                    <h6 className="font-medium text-green-800 mb-2">Link Wawancara:</h6>
                                                                    <a 
                                                                        href={history.resource_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-green-600 hover:text-green-800 underline break-all"
                                                                    >
                                                                        {history.resource_url}
                                                                    </a>
                                                                    <p className="text-sm text-green-700 mt-2">
                                                                        Klik link di atas untuk mengakses ruang wawancara
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {!history.resource_url && (
                                                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                                    <p className="text-yellow-800 text-sm">
                                                                        Link wawancara akan diberikan segera. Mohon tunggu informasi lebih lanjut.
                                                                    </p>
                                                                </div>
                                                            )}

                                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                                                <h6 className="font-medium text-blue-900 mb-2">Tips Wawancara:</h6>
                                                                <ul className="text-sm text-blue-800 space-y-1">
                                                                    <li>• Pastikan koneksi internet stabil</li>
                                                                    <li>• Siapkan ruangan yang tenang dan pencahayaan yang baik</li>
                                                                    <li>• Berpakaian rapi dan profesional</li>
                                                                    <li>• Siapkan pertanyaan untuk interviewer</li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Stage-specific content for tests */}
                                                    {(history.status_name.toLowerCase().includes('psikotes') ||
                                                      history.status_name.toLowerCase().includes('test') ||
                                                      history.status_name.toLowerCase().includes('psychological')) && (
                                                        <div className="mt-4">
                                                            <h6 className="font-medium text-gray-900 mb-2">Jenis Tes:</h6>
                                                            <ul className="text-sm text-gray-600 space-y-1">
                                                                <li>• Tes Kepribadian MBTI & Kecerdasan Logika</li>
                                                            </ul>

                                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                                                <h6 className="font-medium text-blue-900 mb-2">Tips Mengikuti Tes:</h6>
                                                                <ul className="text-sm text-blue-800 space-y-1">
                                                                    <li>• Pastikan Anda memiliki koneksi internet yang stabil</li>
                                                                    <li>• Konsumsi sarapan untuk menjaga stamina dan konsentrasi</li>
                                                                    <li>• Jawablah pertanyaan dengan jujur sesuai dengan kepribadian Anda</li>
                                                                    <li>• Baca setiap soal dengan teliti, cermat, dan pahami isi dalam menjawab</li>
                                                                </ul>
                                                            </div>

                                                            <div className="mt-4 text-right">
                                                                {/* Button logic moved here without console.log in JSX */}
                                                                {(() => {
                                                                    // Debug info for troubleshooting
                                                                    console.log('Psychotest button debug:', {
                                                                        history_id: history.id,
                                                                        status_name: history.status_name,
                                                                        is_active: isActive,
                                                                        completed_at: history.completed_at,
                                                                        completed_at_type: typeof history.completed_at,
                                                                        completed_at_is_null: history.completed_at === null,
                                                                        notes: history.notes
                                                                    });

                                                                    return null; // Return null to not render anything for the debug
                                                                })()}

                                                                {/* Kondisi yang lebih sederhana dan jelas */}
                                                                {isActive ? (
                                                                    // Jika tahap aktif dan completed_at null atau empty string
                                                                    (!history.completed_at || history.completed_at === null || history.completed_at === '') ? (
                                                                        <a
                                                                            href={`/candidate/tests/psychotest/${application.id}`}
                                                                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                                                                            onClick={() => {
                                                                                console.log('Navigating to psychotest page', {
                                                                                    application_id: application.id,
                                                                                    url: `/candidate/tests/psychotest/${application.id}`
                                                                                });
                                                                            }}
                                                                        >
                                                                            Lanjut ke Persiapan Tes
                                                                        </a>
                                                                    ) : (
                                                                        // Jika sudah ada completed_at, berarti sudah dikerjakan
                                                                        <button
                                                                            disabled
                                                                            className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg opacity-90 cursor-not-allowed"
                                                                        >
                                                                            Sudah Dikerjakan
                                                                        </button>
                                                                    )
                                                                ) : null}
                                                            </div>

                                                            {/* Jika psikotes sudah dikerjakan, tampilkan catatan - HANYA TAMPILKAN DI SINI */}
                                                            {history.completed_at && history.notes && (
                                                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                                    <h6 className="font-medium text-yellow-800">Catatan Tim Rekrutmen:</h6>
                                                                    <p className="text-sm text-yellow-700 mt-1">
                                                                        {history.notes}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Recruiter notes */}
                                                    {history.notes &&
                                                      !(history.status_name.toLowerCase().includes('psikotes') ||
                                                        history.status_name.toLowerCase().includes('test') ||
                                                        history.status_name.toLowerCase().includes('psychological') &&
                                                        history.completed_at) && (
                                                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                            <p className="font-medium text-yellow-900">Catatan Tim Rekrutmen:</p>
                                                            <p className="text-sm text-yellow-800 mt-1">{history.notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Hanya tampilkan sebagai fallback jika tidak ada tombol dalam detail tahap */}
                    {sortedHistories.some(h =>
    h.is_active &&
    !h.completed_at &&
    (h.status_name.toLowerCase().includes('test') ||
     h.status_name.toLowerCase().includes('psikotes') ||
     h.status_name.toLowerCase().includes('psychological'))
) && (
    <div className="mt-6 text-center">
        <a
            href={`/candidate/tests/psychotest/${application.id}`}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 inline-block"
        >
            Mulai Mengerjakan
        </a>
    </div>
)}
                </div>
            </div>
        </div>
    );
}
