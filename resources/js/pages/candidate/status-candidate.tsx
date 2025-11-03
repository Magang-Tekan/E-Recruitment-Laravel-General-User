import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

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

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

// Modal component untuk pemberitahuan jadwal ujian
const TestScheduleModal = ({ isOpen, onClose, scheduling, completedAt }: { 
    isOpen: boolean; 
    onClose: () => void; 
    scheduling: PsychotestScheduling | null;
    completedAt?: string | null;
}) => {
    console.log('TestScheduleModal render:', { isOpen, scheduling, completedAt });
    
    if (!isOpen) return null;
    
    if (!scheduling) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <InfoIcon />
                            <h3 className="text-lg font-semibold text-gray-900 ml-2">Informasi Jadwal Ujian</h3>
                        </div>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XIcon />
                        </button>
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            Informasi jadwal ujian belum tersedia. Silakan hubungi tim rekrutmen untuk informasi lebih lanjut.
                        </p>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                        >
                            Mengerti
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <InfoIcon />
                        <h3 className="text-lg font-semibold text-gray-900 ml-2">Informasi Jadwal Ujian</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XIcon />
                    </button>
                </div>

                <div className="space-y-4">
                    {scheduling.is_upcoming && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center mb-2">
                                <ClockIcon />
                                <h4 className="font-medium text-blue-800 ml-2">Ujian Belum Dimulai</h4>
                            </div>
                            <p className="text-sm text-blue-700">
                                Ujian akan dimulai pada <strong>{scheduling.formatted_opens_at}</strong>
                            </p>
                            {scheduling.time_until_start && (
                                <p className="text-xs text-blue-600 mt-1">
                                    Tinggal {scheduling.time_until_start} lagi
                                </p>
                            )}
                        </div>
                    )}

                    {scheduling.is_available && !completedAt && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center mb-2">
                                <CheckIcon />
                                <h4 className="font-medium text-green-800 ml-2">Ujian Tersedia</h4>
                            </div>
                            <p className="text-sm text-green-700">
                                Anda dapat mengerjakan ujian sampai <strong>{scheduling.formatted_closes_at}</strong>
                            </p>
                            {scheduling.time_until_end && (
                                <p className="text-xs text-green-600 mt-1">
                                    Waktu tersisa: {scheduling.time_until_end}
                                </p>
                            )}
                        </div>
                    )}

                    {scheduling.is_expired && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center mb-2">
                                <ClockIcon />
                                <h4 className="font-medium text-red-800 ml-2">Ujian Sudah Berakhir</h4>
                            </div>
                            <p className="text-sm text-red-700">
                                Ujian telah berakhir pada <strong>{scheduling.formatted_closes_at}</strong>
                            </p>
                        </div>
                    )}

                    {/* Informasi kapan user terakhir mengerjakan */}
                    {completedAt && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center mb-2">
                                <CheckIcon />
                                <h4 className="font-medium text-blue-800 ml-2">Status Pengerjaan</h4>
                            </div>
                            <p className="text-sm text-blue-700">
                                Anda telah menyelesaikan ujian pada:
                            </p>
                            <p className="text-sm text-blue-900 font-semibold mt-1">
                                {formatDateTime(completedAt)}
                            </p>
                            <p className="text-xs text-blue-600 mt-2">
                                Hasil ujian sedang dalam proses review oleh tim rekrutmen.
                            </p>
                        </div>
                    )}

                    <div className="border-t pt-4">
                        <h5 className="font-semibold text-gray-900 mb-3">Informasi Jadwal Ujian:</h5>
                        <div className="space-y-3">
                            {/* Kapan Bisa Mulai Mengerjakan */}
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-start">
                                    <CalendarIcon />
                                    <div className="ml-2 flex-1">
                                        <p className="text-xs text-green-700 font-medium mb-1">
                                            Kapan Bisa Mulai Mengerjakan:
                                        </p>
                                        <p className="text-sm font-semibold text-green-900">
                                            {scheduling.formatted_opens_at}
                                        </p>
                                        {scheduling.is_upcoming && scheduling.time_until_start && (
                                            <p className="text-xs text-green-600 mt-1">
                                                Tinggal {scheduling.time_until_start} lagi
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Kapan Terakhir Bisa Mengerjakan */}
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start">
                                    <ClockIcon />
                                    <div className="ml-2 flex-1">
                                        <p className="text-xs text-red-700 font-medium mb-1">
                                            Kapan Terakhir Bisa Mengerjakan:
                                        </p>
                                        <p className="text-sm font-semibold text-red-900">
                                            {scheduling.formatted_closes_at}
                                        </p>
                                        {scheduling.is_available && scheduling.time_until_end && (
                                            <p className="text-xs text-red-600 mt-1">
                                                Tersisa {scheduling.time_until_end}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Durasi Pengerjaan */}
                            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <span className="text-sm text-blue-700 font-medium">Durasi Pengerjaan:</span>
                                <span className="text-sm font-semibold text-blue-900">{scheduling.duration_minutes} menit</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                    >
                        Mengerti
                    </button>
                </div>
            </div>
        </div>
    );
};

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

interface PsychotestScheduling {
    opens_at: string;
    closes_at: string;
    duration_minutes: number;
    is_available: boolean;
    is_upcoming: boolean;
    is_expired: boolean;
    time_until_start: string | null;
    time_until_end: string | null;
    formatted_opens_at: string;
    formatted_closes_at: string;
}

interface Application {
    id: number;
    status_id: number;
    status_name: string;
    status_color: string;
    current_score: number | null;
    current_reviewer: string | null;
    psychotest_scheduling: PsychotestScheduling | null;
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

    // State untuk modal
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    // Get psychotest history untuk mendapatkan completed_at
    const psychotestHistory = application.histories.find(h => 
        h.is_active && 
        (h.status_name.toLowerCase().includes('psikotes') ||
         h.status_name.toLowerCase().includes('test') ||
         h.status_name.toLowerCase().includes('tes') ||  // Added: untuk "Tes Teknis"
         h.status_name.toLowerCase().includes('psychological'))
    );

    console.log('StatusCandidatePage state:', {
        showScheduleModal,
        psychotestScheduling: application.psychotest_scheduling,
        psychotestHistory,
        completedAt: psychotestHistory?.completed_at
    });

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

                                            {/* Stage Details - Show for ALL stages (active, completed, and pending) */}
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
                                                      history.status_name.toLowerCase().includes('tes') ||  // Added: untuk "Tes Teknis"
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

                                                            {/* Psychotest Scheduling Information */}
                                                            {application.psychotest_scheduling && (
                                                                <div className="mt-4">
                                                                    <h6 className="font-medium text-gray-900 mb-2">Jadwal Ujian:</h6>
                                                                    
                                                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                                                                        <div className="flex justify-between text-sm">
                                                                            <span className="text-gray-600">Mulai:</span>
                                                                            <span className="font-medium text-gray-900">
                                                                                {application.psychotest_scheduling.formatted_opens_at}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between text-sm">
                                                                            <span className="text-gray-600">Berakhir:</span>
                                                                            <span className="font-medium text-gray-900">
                                                                                {application.psychotest_scheduling.formatted_closes_at}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between text-sm">
                                                                            <span className="text-gray-600">Durasi:</span>
                                                                            <span className="font-medium text-gray-900">
                                                                                {application.psychotest_scheduling.duration_minutes} menit
                                                                            </span>
                                                                        </div>
                                                                        
                                                                        {application.psychotest_scheduling.is_upcoming && application.psychotest_scheduling.time_until_start && (
                                                                            <div className="pt-2 border-t border-gray-300">
                                                                                <p className="text-xs text-orange-600 font-medium">
                                                                                    🕒 Mulai dalam {application.psychotest_scheduling.time_until_start}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {application.psychotest_scheduling.is_available && (
                                                                            <div className="pt-2 border-t border-gray-300">
                                                                                <p className="text-xs text-green-600 font-medium">
                                                                                    ✅ Ujian sedang berlangsung
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {application.psychotest_scheduling.is_expired && (
                                                                            <div className="pt-2 border-t border-gray-300">
                                                                                <p className="text-xs text-red-600 font-medium">
                                                                                    ❌ Ujian sudah berakhir
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Psychotest Scheduling Notification */}
                                                            {application.psychotest_scheduling && (
                                                                <div className="mt-4">
                                                                    {application.psychotest_scheduling.is_upcoming && (
                                                                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                                            <div className="flex items-start">
                                                                                <ClockIcon />
                                                                                <div className="ml-2">
                                                                                    <h6 className="font-medium text-yellow-800">Tes Belum Tersedia</h6>
                                                                                    <p className="text-sm text-yellow-700 mt-1">
                                                                                        Tes psikologi akan tersedia pada <strong>{application.psychotest_scheduling.formatted_opens_at}</strong>
                                                                                    </p>
                                                                                    {application.psychotest_scheduling.time_until_start && (
                                                                                        <p className="text-xs text-yellow-600 mt-1">
                                                                                            Waktu tersisa: {application.psychotest_scheduling.time_until_start}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {application.psychotest_scheduling.is_available && (
                                                                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                                            <div className="flex items-start">
                                                                                <CheckIcon />
                                                                                <div className="ml-2 flex-1">
                                                                                    <h6 className="font-medium text-green-800">Tes Tersedia</h6>
                                                                                    <p className="text-sm text-green-700 mt-1">
                                                                                        Tes psikologi tersedia sampai <strong>{application.psychotest_scheduling.formatted_closes_at}</strong>
                                                                                    </p>
                                                                                    <p className="text-sm text-green-600 mt-1">
                                                                                        Durasi: {application.psychotest_scheduling.duration_minutes} menit
                                                                                    </p>
                                                                                    {application.psychotest_scheduling.time_until_end && (
                                                                                        <p className="text-xs text-green-600 mt-1">
                                                                                            Waktu tersisa: {application.psychotest_scheduling.time_until_end}
                                                                                        </p>
                                                                                    )}
                                                                                    
                                                                                    {/* Tombol Mulai Mengerjakan - tampil jika belum completed */}
                                                                                    {!history.completed_at && (
                                                                                        <div className="mt-3">
                                                                                            <a
                                                                                                href={`/candidate/tests/psychotest/${application.id}`}
                                                                                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                                                                                                onClick={(e) => {
                                                                                                    e.preventDefault();
                                                                                                    window.location.href = `/candidate/tests/psychotest/${application.id}`;
                                                                                                }}
                                                                                            >
                                                                                                🚀 Mulai Mengerjakan
                                                                                            </a>
                                                                                        </div>
                                                                                    )}
                                                                                    
                                                                                    {/* Pesan jika sudah completed */}
                                                                                    {history.completed_at && (
                                                                                        <div className="mt-3 p-2 bg-blue-100 rounded border border-blue-200">
                                                                                            <p className="text-sm font-semibold text-blue-800">
                                                                                                ✅ Anda sudah menyelesaikan tes ini
                                                                                            </p>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {application.psychotest_scheduling.is_expired && (
                                                                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                                                            <div className="flex items-start">
                                                                                <ClockIcon />
                                                                                <div className="ml-2">
                                                                                    <h6 className="font-medium text-red-800">Tes Sudah Berakhir</h6>
                                                                                    <p className="text-sm text-red-700 mt-1">
                                                                                        Periode tes psikologi telah berakhir pada <strong>{application.psychotest_scheduling.formatted_closes_at}</strong>
                                                                                    </p>
                                                                                    <p className="text-xs text-red-600 mt-1">
                                                                                        Silakan hubungi tim rekrutmen untuk informasi lebih lanjut.
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                         
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
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Render Modal untuk Informasi Jadwal */}
            <TestScheduleModal 
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                scheduling={application.psychotest_scheduling}
                completedAt={psychotestHistory?.completed_at || null}
            />
        </div>
    );
}
