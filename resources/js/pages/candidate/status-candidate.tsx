import { Link, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
// Update the import path to the correct location or ensure the file exists
import UserLayout from '../../layouts/UserLayout'; // Verify the file path or adjust it accordingly

// === Ikon SVG ===
// Definisi semua ikon yang digunakan di dalam satu file.
const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2 text-gray-700">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-3 flex-shrink-0">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);

const DurationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect>
        <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
);

const DocumentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
        <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/>
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
            is_qualified: boolean;
            created_at: string;
            notes: string;
        }>;
        // Add any other necessary fields
    };
}

// Breadcrumb data
const breadcrumbs = [
    { name: 'Dashboard', href: '/candidate' },
    { name: 'Application Status', href: '#' },
];

export default function StatusCandidatePage({ application }: ApplicationStatusPageProps) {
    // Get the auth user data from Inertia shared props
    const { auth } = usePage<any>().props;
    const user = auth?.user;
    
    // Get the latest history entry
    const latestHistory = application.histories[0];
    
    // Define recruitment stages
    const stages = [
        { id: 1, name: 'Administrasi', status_id: 1 },
        { id: 2, name: 'Psikotest', status_id: 2 },
        { id: 3, name: 'Interview HR', status_id: 3 },
        { id: 4, name: 'Interview User', status_id: 4 },
        { id: 5, name: 'Medical Checkup', status_id: 5 },
    ];
    
    // Determine stage statuses
    const stagesWithStatus = stages.map(stage => {
        const stageHistory = application.histories.find(h => h.status_id === stage.status_id);
        
        return {
            ...stage,
            is_completed: stageHistory?.is_qualified,
            is_current: stage.status_id === application.status_id,
            is_future: stage.status_id > application.status_id,
            history: stageHistory,
        };
    });
    
    // Find current stage
    const currentStage = stagesWithStatus.find(stage => stage.is_current);

    // Helper function to get appropriate status badge
    const getStatusBadge = (stage: any) => {
        if (stage.is_completed) {
            return <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-300 px-3 py-1 rounded-full">Selesai</span>;
        } else if (stage.is_current) {
            return <span className="text-xs font-bold text-blue-700 bg-blue-100 border border-blue-300 px-3 py-1 rounded-full">Terjadwal</span>;
        } else {
            return <span className="text-xs font-bold text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">Menunggu</span>;
        }
    };

    // Format date helper
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '';
        
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    return (
        <UserLayout breadcrumbs={breadcrumbs}>
            <Head title="Status Aplikasi" />
            <div className="space-y-8">
                <main className="mt-8">
                    {/* --- Informasi Pelamar --- */}
                    <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex flex-col ml-2">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center mr-6">
                                    <div className="text-2xl font-semibold text-blue-600">
                                        {user?.name?.charAt(0).toUpperCase() || 'C'}
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{user?.name || 'Candidate'}</h2>
                                    <p className="text-gray-600 mt-1">Posisi yang dilamar: <span className="font-semibold">{application.job.title}</span></p>
                                    <p className="text-gray-700 font-semibold mt-1">{application.job.company}</p>
                                </div>
                            </div>
                            <div className="flex mt-3">
                                <div className="flex items-center text-xs text-blue-600 font-medium bg-blue-50 rounded-md px-3 py-1 mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-blue-500">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    Lamaran: {formatDate(application.applied_at)}
                                </div>
                                {latestHistory && (
                                    <div className="flex items-center text-xs text-green-600 font-medium bg-green-50 rounded-md px-3 py-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-green-500">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        {latestHistory.status_name}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* --- Tahapan Rekrutmen --- */}
                    <section className="mt-10">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                            <BriefcaseIcon />
                            Tahapan Rekrutmen
                        </h3>

                        <div className="relative">
                            {/* Map through all stages */}
                            {stagesWithStatus.map((stage, index) => (
                                <div key={stage.id} className="relative">
                                    {/* Timeline Line */}
                                    {index < stagesWithStatus.length - 1 && (
                                        <div className="absolute left-[18px] top-10 bottom-0 w-1 bg-gray-200"></div>
                                    )}

                                    <div className="flex mb-8">
                                        {/* Circle Marker */}
                                        <div className="relative z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mr-4 bg-white border border-gray-200">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                                stage.is_completed ? 'bg-green-500 text-white' :
                                                stage.is_current ? 'bg-blue-500 text-white' :
                                                'bg-gray-300 text-white'
                                            }`}>
                                                {stage.is_completed ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                ) : (
                                                    <span className="text-xs font-bold">{index + 1}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Stage Content */}
                                        <div className={`flex-1 ${stage.is_current ? 'bg-white border-2 border-blue-500' : 'bg-white border border-gray-200'} rounded-xl p-5 shadow-sm ${stage.is_future ? 'opacity-80' : ''}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <div>
                                                    <h4 className="font-bold text-gray-800">{stage.name}</h4>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {stage.is_completed ? `Telah selesai pada ${formatDate(stage.history?.created_at || application.applied_at)}` :
                                                        stage.is_current ? `Dijadwalkan pada ${formatDate(stage.history?.created_at || application.applied_at)}` :
                                                        'Menunggu penyelesaian tahap sebelumnya'}
                                                    </p>
                                                </div>
                                                {getStatusBadge(stage)}
                                            </div>

                                            {/* Show details only for current stage */}
                                            {stage.is_current && stage.history && (
                                                <>
                                                    <div className="border-t border-blue-200 border-dashed mx-1 mt-4 pt-4"></div>
                                                    <div className="p-4">
                                                        <p className="font-semibold text-gray-700">Detail:</p>

                                                        {/* Different content based on stage name */}
                                                        {stage.name === 'Administrasi' && (
                                                            <>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-3 text-sm">
                                                                    <div>
                                                                        <p className="text-gray-500">Tanggal Pengajuan</p>
                                                                        <p className="font-semibold text-gray-800">{formatDate(application.applied_at)}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-500">Status Terakhir</p>
                                                                        <p className="font-semibold text-gray-800">{formatDate(latestHistory?.created_at)}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-500">Perusahaan</p>
                                                                        <p className="font-semibold text-gray-800">{application.job.company}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-500">Lokasi</p>
                                                                        <p className="font-semibold text-gray-800">{application.job.location}</p>
                                                                    </div>
                                                                </div>

                                                                <p className="font-semibold text-gray-700 mt-6">Dokumen yang Diperiksa:</p>
                                                                <ul className="list-disc list-outside pl-5 mt-2 space-y-1 text-sm text-gray-600">
                                                                    <li>CV dan Surat Lamaran</li>
                                                                    <li>Ijazah dan Transkrip Nilai</li>
                                                                    <li>Portofolio (jika ada)</li>
                                                                    <li>Sertifikat Kompetensi (jika ada)</li>
                                                                </ul>

                                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm">
                                                                    <p className="font-bold text-blue-800">Pesan dari Tim Rekrutmen:</p>
                                                                    <p className="text-blue-700 mt-1">{stage.history.notes || "Lamaran Anda sedang dalam proses review."}</p>
                                                                </div>
                                                            </>
                                                        )}
                                                        
                                                        {stage.name === 'Psikotest' && (
                                                            <>
                                                                <div className="bg-blue-50 rounded-lg p-5 mt-3">
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                        <div>
                                                                            <div className="flex items-center">
                                                                                <ClockIcon />
                                                                                <p className="text-gray-700">Tanggal & Waktu</p>
                                                                            </div>
                                                                            <p className="font-semibold text-gray-800 ml-7">{formatDate(stage.history.created_at)}</p>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center">
                                                                                <LocationIcon />
                                                                                <p className="text-gray-700">Lokasi</p>
                                                                            </div>
                                                                            <p className="font-semibold text-gray-800 ml-7">Online via Web</p>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center">
                                                                                <DocumentIcon />
                                                                                <p className="text-gray-700">Jenis Tes</p>
                                                                            </div>
                                                                            <p className="font-semibold text-gray-800 ml-7">Tes Kepribadian MBTI & Kecerdasan Logika</p>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center">
                                                                                <DurationIcon />
                                                                                <p className="text-gray-700">Durasi</p>
                                                                            </div>
                                                                            <p className="font-semibold text-gray-800 ml-7">120 Menit</p>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <p className="font-semibold text-gray-700 mt-6">Tips Mengikuti Tes:</p>
                                                                <ul className="pl-5 mt-2 space-y-1 text-sm text-gray-600">
                                                                    <li>• Pastikan Anda memiliki waktu istirahat yang cukup sebelum mengikuti tes</li>
                                                                    <li>• Konsumsi sarapan untuk menjaga stamina dan konsentrasi</li>
                                                                    <li>• Jawablah setiap pertanyaan dengan jujur sesuai dengan kepribadian Anda</li>
                                                                    <li>• Tetap percaya diri dalam menjawab</li>
                                                                </ul>

                                                                <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mt-6">
                                                                    <p className="font-bold text-blue-800">Pesan dari Tim Rekrutmen:</p>
                                                                    <p className="text-blue-700 mt-1">{stage.history.notes || "Kami senang Anda telah mencapai tahap ini dalam proses rekrutmen. Percayalah pada kemampuan Anda dan tunjukkan potensi terbaik Anda. Semoga sukses!"}</p>
                                                                </div>

                                                                <div className="text-right mt-4">
                                                                    {/* Link to psychotest */}
                                                                    <Link 
                                                                        href={`/candidate/tests/psychotest`}
                                                                        className="inline-block text-white bg-blue-500 hover:bg-blue-600 font-medium rounded-full px-6 py-2 text-sm transition-colors"
                                                                    >
                                                                        Lanjut ke Persiapan Tes
                                                                    </Link>
                                                                </div>
                                                            </>
                                                        )}
                                                        
                                                        {(stage.name === 'Interview HR' || stage.name === 'Interview User') && (
                                                            <>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-3 text-sm">
                                                                    <div>
                                                                        <p className="text-gray-500">Tanggal & Waktu</p>
                                                                        <p className="font-semibold text-gray-800">{formatDate(stage.history.created_at)}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-500">Lokasi</p>
                                                                        <p className="font-semibold text-gray-800">{application.job.location} (Offline)</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-500">Jenis Wawancara</p>
                                                                        <p className="font-semibold text-gray-800">{stage.name}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-500">Durasi</p>
                                                                        <p className="font-semibold text-gray-800">45-60 Menit</p>
                                                                    </div>
                                                                </div>

                                                                <p className="font-semibold text-gray-700 mt-6">Persiapan Wawancara:</p>
                                                                <ul className="list-disc list-outside pl-5 mt-2 space-y-1 text-sm text-gray-600">
                                                                    <li>Pelajari kembali deskripsi pekerjaan dan profil perusahaan.</li>
                                                                    <li>Siapkan jawaban untuk pertanyaan umum wawancara.</li>
                                                                    <li>Datang 15-30 menit sebelum jadwal yang ditentukan.</li>
                                                                    <li>Berpakaian formal dan rapi sesuai dengan budaya perusahaan.</li>
                                                                </ul>

                                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm">
                                                                    <p className="font-bold text-blue-800">Pesan dari Tim Rekrutmen:</p>
                                                                    <p className="text-blue-700 mt-1">{stage.history.notes || "Selamat telah lolos tahap seleksi sebelumnya! Kami tunggu kehadiran Anda pada jadwal wawancara yang telah ditentukan."}</p>
                                                                </div>

                                                                <div className="text-right mt-4">
                                                                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                                                                        Konfirmasi Kehadiran &rarr;
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                        
                                                        {!['Administrasi', 'Psikotest', 'Interview HR', 'Interview User'].includes(stage.name) && (
                                                            <>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-3 text-sm">
                                                                    <div>
                                                                        <p className="text-gray-500">Tanggal</p>
                                                                        <p className="font-semibold text-gray-800">{formatDate(stage.history?.created_at)}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-500">Status</p>
                                                                        <p className="font-semibold text-gray-800">{stage.name}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm">
                                                                    <p className="font-bold text-blue-800">Pesan dari Tim Rekrutmen:</p>
                                                                    <p className="text-blue-700 mt-1">
                                                                        {stage.history?.notes || "Kami sedang memproses tahap ini. Mohon tunggu informasi selanjutnya dari kami melalui email atau halaman ini."}
                                                                    </p>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* --- Persiapan Tes --- */}
                    {currentStage && currentStage.name === 'Psikotest' && (
                        <section className="mt-8 bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-800">Persiapan Tes Psikotes</h3>
                            <p className="text-sm text-gray-600 mt-2">Beberapa hal yang perlu dipersiapkan sebelum tes</p>

                            <p className="text-sm text-gray-600 mt-4">Tes psikotes akan menilai kemampuan kognitif dan kepribadian Anda untuk memastikan kecocokan dengan posisi dan budaya perusahaan. Kami menyarankan agar Anda:</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-800">Sebelum Hari Tes</h4>
                                    <ul className="mt-4 space-y-3 text-sm text-gray-700">
                                        <li className="flex items-start"><CheckIcon /> Lakukan penelitian mendalam mengenai perusahaan serta posisi yang dilamar.</li>
                                        <li className="flex items-start"><CheckIcon /> Persiapkan seluruh dokumen yang diperlukan, seperti KTP, CV, dan lainnya.</li>
                                        <li className="flex items-start"><CheckIcon /> Latih diri dengan mengerjakan contoh soal psikotes umum.</li>
                                    </ul>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-800">Saat Hari Tes</h4>
                                    <ul className="mt-4 space-y-3 text-sm text-gray-700">
                                        <li className="flex items-start"><CheckIcon /> Masuk ke sistem 30 menit sebelum jadwal yang ditentukan.</li>
                                        <li className="flex items-start"><CheckIcon /> Siapkan perangkat dengan kamera dan mikrofon yang berfungsi dengan baik.</li>
                                        <li className="flex items-start"><CheckIcon /> Pastikan koneksi internet dalam kondisi stabil.</li>
                                        <li className="flex items-start"><CheckIcon /> Pilih ruangan yang tenang dan bebas dari gangguan.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8 text-sm text-green-800">
                                <p className="italic">"Ingatlah bahwa tes ini adalah kesempatan untuk menunjukkan potensi terbaik Anda. Kami mencari kandidat yang tidak hanya memiliki keterampilan teknis yang tepat, tetapi juga kecocokan dengan nilai-nilai dan budaya perusahaan. Jadilah diri Anda sendiri dan jawab dengan jujur. Kami sangat menantikan untuk melihat bakat Anda!"</p>
                                <p className="font-semibold text-right mt-2">- Tim Rekrutmen</p>
                            </div>

                            <div className="flex justify-center mt-6">
                                <Link 
                                    href={`/candidate/tests/psychotest`}
                                    className="bg-blue-600 text-white font-medium py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform transform hover:scale-105"
                                >
                                    Mulai Mengerjakan
                                </Link>
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </UserLayout>
    );
}
