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

// Define the props interface for the component
interface ApplicationStatusPageProps {
    application: {
        id: number;
        status_id: number;
        job: {
            id: number;
            title: string;
            company: string;
            location: string;
            type: string;
        };
        applied_at: string;
        histories: Array<{
            id: number;
            status_id: number;
            status_name: string;
            status_color: string;
            stage: string;
            score: number | null;
            notes: string | null;
            scheduled_at: string | null;
            completed_at: string | null;
            processed_at: string;
            reviewed_by: string | null;
            reviewed_at: string | null;
            is_active: boolean;
            is_qualified: boolean;
            created_at: string;
        }>;
    };
}

export default function StatusCandidatePage({ application }: ApplicationStatusPageProps) {
    // Get the auth user data from Inertia shared props
    const { auth } = usePage<{ auth: { user: { name: string } } }>().props;
    const user = auth?.user;

    // Get all histories sorted by processed_at/created_at
    const sortedHistories = [...application.histories].sort((a, b) => {
        const dateA = new Date(a.processed_at || a.created_at);
        const dateB = new Date(b.processed_at || b.created_at);
        return dateA.getTime() - dateB.getTime(); // Ascending order (oldest first)
    });

    const formatDateOnly = (dateString: string | null | undefined) => {
        if (!dateString) return '';
        const options: Intl.DateTimeFormatOptions = { 
            day: 'numeric',
            month: 'short', 
            year: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Status Aplikasi" />
            
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">MITRA KARYA GROUP</h1>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <a href="#" className="hover:text-gray-900">Dashboard</a>
                            <a href="#" className="hover:text-gray-900">Profil</a>
                            <a href="#" className="hover:text-gray-900">Lowongan Pekerjaan</a>
                            <a href="#" className="hover:text-gray-900">Lamaran</a>
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    <CalendarIcon />
                                    <span className="ml-1">Lamaran: {formatDateOnly(application.applied_at)}</span>
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                    Lolos Seleksi Administrasi
                                </span>
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
                            const isCompleted = history.completed_at !== null || history.stage === 'accepted';
                            const isActive = history.is_active;
                            const isRejected = history.stage === 'rejected';
                            const isAccepted = history.stage === 'accepted';
                            
                            return (
                                <div key={history.id} className="relative flex items-start mb-6">
                                    {/* Timeline line */}
                                    {index < sortedHistories.length - 1 && (
                                        <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200"></div>
                                    )}
                                    
                                    {/* Circle marker */}
                                    <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                                        isCompleted || isAccepted ? 'bg-green-500 border-green-500' :
                                        isActive ? 'bg-blue-500 border-blue-500' :
                                        isRejected ? 'bg-red-500 border-red-500' :
                                        'bg-gray-300 border-gray-300'
                                    }`}>
                                        {isCompleted || isAccepted ? (
                                            <CheckIcon />
                                        ) : (
                                            <span className="text-xs font-bold text-white">{index + 1}</span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="ml-6 flex-1">
                                        <div className={`bg-white rounded-lg border p-4 ${
                                            isActive ? 'border-blue-200 shadow-md' : 
                                            isCompleted || isAccepted ? 'border-green-200' :
                                            isRejected ? 'border-red-200' :
                                            'border-gray-200'
                                        }`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{history.status_name}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        {isActive ? `Dijadwalkan pada ${formatDateOnly(history.scheduled_at || history.processed_at)}` :
                                                         isCompleted ? `Telah selesai pada ${formatDateOnly(history.completed_at || history.processed_at)}` :
                                                         `Menunggu penyelesaian tahap sebelumnya`}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    isCompleted || isAccepted ? 'bg-green-100 text-green-800' :
                                                    isActive ? 'bg-blue-100 text-blue-800' :
                                                    isRejected ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {isCompleted || isAccepted ? 'Selesai' :
                                                     isActive ? 'Terjadwal' :
                                                     isRejected ? 'Ditolak' :
                                                     'Menunggu'}
                                                </span>
                                            </div>

                                            {/* Stage Details - Show for active and completed stages */}
                                            {(isActive || isCompleted || isAccepted) && (
                                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                    <h5 className="font-medium text-gray-900 mb-3">Detail:</h5>
                                                    
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div className="flex items-center">
                                                            <CalendarIcon />
                                                            <div className="ml-2">
                                                                <p className="text-gray-500">Tanggal & Waktu</p>
                                                                <p className="font-medium">{formatDateOnly(history.scheduled_at || history.processed_at)}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center">
                                                            <MapPinIcon />
                                                            <div className="ml-2">
                                                                <p className="text-gray-500">Lokasi</p>
                                                                <p className="font-medium">
                                                                    {history.status_name.toLowerCase().includes('psikotes') || history.status_name.toLowerCase().includes('psikologi') ? 
                                                                     'Online via Web' : 'Kantor Pusat'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center">
                                                            <ClockIcon />
                                                            <div className="ml-2">
                                                                <p className="text-gray-500">Durasi</p>
                                                                <p className="font-medium">
                                                                    {history.status_name.toLowerCase().includes('psikotes') || history.status_name.toLowerCase().includes('psikologi') ? 
                                                                     '120 Menit' : '60 Menit'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        {history.score && (
                                                            <div>
                                                                <p className="text-gray-500">Skor</p>
                                                                <p className="font-medium">{history.score}/100</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Stage-specific content */}
                                                    {history.status_name.toLowerCase().includes('psikotes') || history.status_name.toLowerCase().includes('psikologi') ? (
                                                        <div className="mt-4">
                                                            <h6 className="font-medium text-gray-900 mb-2">Jenis Tes:</h6>
                                                            <ul className="text-sm text-gray-600 space-y-1">
                                                                <li>• Tes Kepribadian MBTI & Kecerdasan Logika</li>
                                                            </ul>
                                                            
                                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                                                <h6 className="font-medium text-blue-900 mb-2">Tips Mengikuti Tes:</h6>
                                                                <ul className="text-sm text-blue-800 space-y-1">
                                                                    <li>• Pastikan Anda memilih jawaban yang cukup sebelum mengikuti tes</li>
                                                                    <li>• Konsumsi sarapan untuk menjaga stamina dan konsentrasi</li>
                                                                    <li>• Jawablah pertanyaan dengan jujur sesuai dengan kepribadian Anda</li>
                                                                    <li>• Baca setiap soal dengan teliti, cermat, dan pahami isi dalam menjawab</li>
                                                                </ul>
                                                            </div>
                                                            
                                                            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                                                                <p className="font-medium text-blue-900">Pesan dari Tim Rekrutmen:</p>
                                                                <p className="text-sm text-blue-800 mt-1">
                                                                    "Kami senang Anda telah mencapai tahap ini dalam proses rekrutmen. Percayalah pada kemampuan Anda dan tunjukkan potensi terbaik Anda. Semoga sukses!"
                                                                </p>
                                                            </div>
                                                            
                                                            {isActive && (
                                                                <div className="mt-4 text-right">
                                                                    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                                                                        Lanjut ke Persiapan Tes
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : null}

                                                    {/* Recruiter notes */}
                                                    {history.notes && (
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
                </div>

                {/* Test Preparation Section */}
                <div className="mt-12 bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Persiapan Tes Psikotes</h3>
                    <p className="text-gray-600 mb-6">Beberapa hal yang perlu dipersiapkan sebelum tes</p>
                    
                    <p className="text-sm text-gray-700 mb-6">
                        Tes psikotes akan menilai kemampuan kognitif dan kepribadian Anda untuk memastikan kesesuaian dengan posisi dan budaya perusahaan. Kami menyarankan agar Anda:
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Sebelum Hari Tes</h4>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start">
                                    <CheckIcon />
                                    <span className="ml-2">Lakukan penelitian mendalam mengenai perusahaan serta posisi yang dituju</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckIcon />
                                    <span className="ml-2">Persiapkan seluruh dokumen yang diperlukan, seperti KTP, CV, dan lainnya</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckIcon />
                                    <span className="ml-2">Latih diri dengan mengerjakan contoh soal psikotes umum</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Saat Hari Tes</h4>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start">
                                    <CheckIcon />
                                    <span className="ml-2">Masuk ke sesi wawancara 30 menit sebelum jadwal yang ditentukan</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckIcon />
                                    <span className="ml-2">Siapkan perangkat dengan kamera dan mikrofon yang berfungsi dengan baik</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckIcon />
                                    <span className="ml-2">Pastikan koneksi internet dalam kondisi stabil</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckIcon />
                                    <span className="ml-2">Pilih ruangan yang tenang dan bebas dari gangguan</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                            <span className="font-medium">- Tim Rekrutmen</span>
                        </p>
                        <p className="text-sm text-green-700 mt-2">
                            "Ingatlah bahwa tes ini adalah kesempatan untuk menunjukkan potensi terbaik Anda. Kami mencari kandidat yang tidak hanya memiliki keterampilan teknis yang tepat, tetapi juga kesesuaian dengan nilai-nilai dan budaya perusahaan. Jatuhkan diri Anda secara dan jawablah dengan jujur. Kami sangat menantikan untuk melihat lebih banyak tentang Anda!"
                        </p>
                    </div>

                    <div className="mt-6 text-center">
                        <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                            Mulai Mengerjakan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
