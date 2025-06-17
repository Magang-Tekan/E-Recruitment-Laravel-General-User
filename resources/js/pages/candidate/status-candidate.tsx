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

// Define the props interface for the component
interface ApplicationStatusProps {
    application: {
        id: number;
        user: {
            name: string;
            email: string;
        };
        job: {
            id: number;
            title: string;
            company: string;
            department: string;
            location: string;
            type: string;
            requirements: string[];
            benefits: string[];
            description: string;
        };
        current_stage: {
            id: number;
            name: string;
            description: string;
        };
        stages: Array<{
            id: number;
            name: string;
            description: string;
            is_current: boolean;
            is_completed: boolean;
            is_future: boolean;
        }>;
        history: Array<{
            id: number;
            stage: string;
            notes: string;
            status: string;
            date: string;
        }>;
        applied_at: string;
        updated_at: string;
    };
}

// === Komponen Halaman Status Kandidat ===
// Seluruh UI dan logika digabungkan dalam satu komponen.
export default function StatusCandidatePage({ application }: ApplicationStatusProps) {
    // Find the current stage to display more details
    const currentStage = application.stages.find(stage => stage.is_current);

    // Helper function to get appropriate status badge
    const getStatusBadge = (stage: {
        is_completed: boolean;
        is_current: boolean;
    }) => {
        if (stage.is_completed) {
            return <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-300 px-3 py-1 rounded-full">Selesai</span>;
        } else if (stage.is_current) {
            return <span className="text-xs font-bold text-blue-700 bg-blue-100 border border-blue-300 px-3 py-1 rounded-full">Terjadwal</span>;
        } else {
            return null; // No badge for future stages
        }
    };

    // Format date helper
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '';

        // Basic formatting, can be enhanced with date-fns if needed
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">

                <header className="flex justify-between items-center py-4 border-b border-gray-200">
                    <h1 className="text-lg font-bold text-gray-800">MITRA KARYA GROUP</h1>
                    <nav className="hidden sm:flex items-center space-x-6 text-sm font-medium text-gray-600">
                        <a href="/candidate/profile" className="hover:text-blue-600">Profil</a>
                        <a href="/candidate/jobs" className="hover:text-blue-600">Lowongan Pekerjaan</a>
                        <a href="/candidate/application-history" className="hover:text-blue-600">Lamaran</a>
                    </nav>
                     <div className="sm:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </div>
                </header>

                <main className="mt-8">
                    {/* --- Informasi Pelamar --- */}
                    <section className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-center space-x-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold flex-shrink-0">
                            {application.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{application.user.name}</h2>
                            <p className="text-gray-600 mt-1">Posisi yang dilamar: <span className="font-semibold">{application.job.title}</span></p>
                            <p className="text-gray-700 font-semibold">{application.job.company}</p>
                            <a href={`/candidate/application/${application.id}/status`} className="text-blue-600 text-sm font-semibold mt-2 inline-block hover:underline">
                                Lihat detail lamaran Anda
                            </a>
                        </div>
                    </section>

                    {/* --- Tahapan Rekrutmen --- */}
                    <section className="mt-10">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <BriefcaseIcon />
                            Tahapan Rekrutmen
                        </h3>

                        <div className="space-y-4">
                            {/* Map through all stages */}
                            {application.stages.map((stage) => (
                                <div key={stage.id} className={`bg-white border ${stage.is_current ? 'border-2 border-blue-500' : 'border-gray-200'} rounded-xl p-5 shadow-sm ${stage.is_future ? 'opacity-60' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-800">{stage.name}</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {stage.is_completed ? `Telah selesai pada ${formatDate(application.history.find(h => h.stage === stage.name)?.date || application.updated_at)}` :
                                                 stage.is_current ? `Dijadwalkan pada ${formatDate(application.updated_at)}` :
                                                 'Menunggu penyelesaian tahap sebelumnya'}
                                            </p>
                                        </div>
                                        {getStatusBadge(stage)}
                                    </div>

                                    {/* Show details only for current stage */}
                                    {stage.is_current && (
                                        <>
                                            <div className="border-t-2 border-blue-500 border-dashed mx-1 mt-4 pt-4"></div>
                                            <div className="p-5">
                                                <p className="font-semibold text-gray-700">Detail:</p>
                                                
                                                {/* Different content based on stage name */}
                                                {stage.name === 'Administrasi' ? (
                                                    <>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-3 text-sm">
                                                            <div>
                                                                <p className="text-gray-500">Tanggal Pengajuan</p>
                                                                <p className="font-semibold text-gray-800">{formatDate(application.applied_at)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Status Terakhir</p>
                                                                <p className="font-semibold text-gray-800">{formatDate(application.updated_at)}</p>
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
                                                            <p className="text-blue-700 mt-1">Lamaran Anda sedang dalam proses peninjauan oleh tim rekrutmen kami. Kami akan menghubungi Anda setelah proses seleksi administrasi selesai.</p>
                                                        </div>
                                                    </>
                                                ) : stage.name === 'Psikotest' ? (
                                                    <>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-3 text-sm">
                                                            <div>
                                                                <p className="text-gray-500">Tanggal & Waktu</p>
                                                                <p className="font-semibold text-gray-800">{formatDate(application.updated_at)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Lokasi</p>
                                                                <p className="font-semibold text-gray-800">Online (via link tes)</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Jenis Tes</p>
                                                                <p className="font-semibold text-gray-800">Tes Kepribadian (MBTI) & Kemampuan Logika</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Durasi</p>
                                                                <p className="font-semibold text-gray-800">120 Menit</p>
                                                            </div>
                                                        </div>

                                                        <p className="font-semibold text-gray-700 mt-6">Tips Mengikuti Tes:</p>
                                                        <ul className="list-disc list-outside pl-5 mt-2 space-y-1 text-sm text-gray-600">
                                                            <li>Pastikan Anda istirahat, berada di tempat yang cukup sebelum mengikuti tes.</li>
                                                            <li>Pastikan koneksi internet stabil agar tes berjalan lancar.</li>
                                                            <li>Gunakan laptop atau PC dengan browser Google Chrome versi terbaru.</li>
                                                            <li>Cari waktu serta lokasi yang sepi, tidak berisik, dan pencahayaan cukup agar lebih fokus.</li>
                                                        </ul>

                                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm">
                                                            <p className="font-bold text-blue-800">Pesan dari Tim Rekrutmen:</p>
                                                            <p className="text-blue-700 mt-1">Selamat, Anda telah mencapai tahap ini dalam proses rekrutmen. Berfokuslah pada kemampuan Anda dan tunjukkan antusiasme Anda. Semoga sukses.</p>
                                                        </div>
                                                        
                                                        <div className="text-right mt-4">
                                                            <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                                                                Lanjut ke Persiapan Tes &rarr;
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : stage.name === 'Wawancara' ? (
                                                    <>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-3 text-sm">
                                                            <div>
                                                                <p className="text-gray-500">Tanggal & Waktu</p>
                                                                <p className="font-semibold text-gray-800">{formatDate(application.updated_at)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Lokasi</p>
                                                                <p className="font-semibold text-gray-800">{application.job.location} (Offline)</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Jenis Wawancara</p>
                                                                <p className="font-semibold text-gray-800">Wawancara dengan HR dan User</p>
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
                                                            <p className="text-blue-700 mt-1">Selamat telah lolos tahap seleksi sebelumnya! Kami tunggu kehadiran Anda pada jadwal wawancara yang telah ditentukan.</p>
                                                        </div>
                                                        
                                                        <div className="text-right mt-4">
                                                            <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                                                                Konfirmasi Kehadiran &rarr;
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    // Default content for other stages (Hired/Rejected)
                                                    <>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-3 text-sm">
                                                            <div>
                                                                <p className="text-gray-500">Tanggal</p>
                                                                <p className="font-semibold text-gray-800">{formatDate(application.updated_at)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Status</p>
                                                                <p className="font-semibold text-gray-800">{stage.name}</p>
                                                            </div>
                                                        </div>

                                                        <div className={`${stage.name === 'Hired' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4 mt-6 text-sm`}>
                                                            <p className={`font-bold ${stage.name === 'Hired' ? 'text-green-800' : 'text-red-800'}`}>Pesan dari Tim Rekrutmen:</p>
                                                            <p className={`mt-1 ${stage.name === 'Hired' ? 'text-green-700' : 'text-red-700'}`}>
                                                                {stage.name === 'Hired' 
                                                                    ? 'Selamat! Anda telah berhasil melewati seluruh proses seleksi. Tim kami akan menghubungi Anda segera untuk informasi selanjutnya mengenai penawaran kerja.' 
                                                                    : 'Terima kasih atas partisipasi Anda dalam proses rekrutmen kami. Sayangnya, kami telah memutuskan untuk melanjutkan dengan kandidat lain yang lebih sesuai dengan kebutuhan posisi saat ini.'}
                                                            </p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* --- Job Details Section --- */}
                    <section className="mt-12 bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-800">Detail Lowongan</h3>
                        <p className="text-gray-600 mt-2">{application.job.description}</p>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                            <div>
                                <h4 className="font-semibold text-gray-800 text-lg border-b pb-2 mb-4">Persyaratan</h4>
                                <ul className="list-disc list-outside pl-5 space-y-2 text-sm text-gray-700">
                                    {application.job.requirements && application.job.requirements.length > 0 ? (
                                        application.job.requirements.map((req, index) => (
                                            <li key={index}>{req}</li>
                                        ))
                                    ) : (
                                        <li>Tidak ada persyaratan spesifik yang dicantumkan</li>
                                    )}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 text-lg border-b pb-2 mb-4">Keuntungan</h4>
                                <ul className="list-disc list-outside pl-5 space-y-2 text-sm text-gray-700">
                                    {application.job.benefits && application.job.benefits.length > 0 ? (
                                        application.job.benefits.map((benefit, index) => (
                                            <li key={index}>{benefit}</li>
                                        ))
                                    ) : (
                                        <li>Tidak ada keuntungan spesifik yang dicantumkan</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </section>
                    
                    {/* --- Persiapan Tes --- */}
                    {currentStage && currentStage.name !== 'Administrasi' && currentStage.name !== 'Hired' && currentStage.name !== 'Rejected' && (
                        <section className="mt-8 bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-800">Persiapan {currentStage.name}</h3>
                            
                            {currentStage.name === 'Psikotest' ? (
                                <>
                                    <p className="text-sm text-gray-600 mt-2">Beberapa hal yang perlu dipersiapkan sebelum tes.</p>
                                    <p className="text-sm text-gray-600 mt-2">Tes psikotes akan menilai kemampuan kognitif dan kepribadian Anda untuk memastikan kecocokan dengan posisi dan budaya perusahaan. Kami menyarankan agar Anda:</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-800 border-b pb-2">Sebelum Hari Tes</h4>
                                            <ul className="mt-4 space-y-3 text-sm text-gray-700">
                                                <li className="flex items-start"><CheckIcon /> Lakukan penelitian mendalam mengenai perusahaan serta posisi yang dilamar.</li>
                                                <li className="flex items-start"><CheckIcon /> Persiapkan berkas dan data yang diperlukan, seperti KTP, CV, dan ijazah.</li>
                                                <li className="flex items-start"><CheckIcon /> Latih diri dengan mengerjakan contoh soal-soal tes serupa.</li>
                                                <li className="flex items-start"><CheckIcon /> Istirahat yang cukup sebelum hari tes.</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 border-b pb-2">Saat Hari Tes</h4>
                                            <ul className="mt-4 space-y-3 text-sm text-gray-700">
                                                <li className="flex items-start"><CheckIcon /> Masuk ke portal tes 30 menit sebelum jadwal yang ditentukan.</li>
                                                <li className="flex items-start"><CheckIcon /> Pastikan koneksi internet dalam kondisi stabil.</li>
                                                <li className="flex items-start"><CheckIcon /> Gunakan laptop atau PC dengan browser Chrome versi terbaru.</li>
                                                <li className="flex items-start"><CheckIcon /> Pilih ruangan yang tenang dan bebas dari gangguan.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8 text-sm text-yellow-800 italic">
                                        <p>"Kejujuran adalah nilai inti dalam perusahaan kami, mohon menjawab pertanyaan tes secara jujur. Jawaban yang tidak hanya mencerminkan keinginan perusahaan, tetapi juga kesesuaian dengan nilai-nilai dan budaya perusahaan, adalah apa yang akan kami hargai. Dengan menjawab jujur, Anda menunjukkan integritas personal Anda."</p>
                                        <p className="font-semibold text-right mt-2 not-italic">- Tim Rekrutmen</p>
                                    </div>
                                </>
                            ) : currentStage.name === 'Wawancara' ? (
                                <>
                                    <p className="text-sm text-gray-600 mt-2">Beberapa hal yang perlu dipersiapkan sebelum wawancara.</p>
                                    <p className="text-sm text-gray-600 mt-2">Wawancara ini akan menilai kesesuaian Anda dengan posisi dan budaya perusahaan. Kami menyarankan agar Anda:</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-800 border-b pb-2">Persiapan Wawancara</h4>
                                            <ul className="mt-4 space-y-3 text-sm text-gray-700">
                                                <li className="flex items-start"><CheckIcon /> Teliti kembali deskripsi pekerjaan dan persyaratannya.</li>
                                                <li className="flex items-start"><CheckIcon /> Pelajari profil perusahaan, visi, misi, dan nilai-nilai.</li>
                                                <li className="flex items-start"><CheckIcon /> Siapkan jawaban untuk pertanyaan umum wawancara.</li>
                                                <li className="flex items-start"><CheckIcon /> Siapkan pertanyaan yang akan Anda tanyakan ke pewawancara.</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 border-b pb-2">Saat Wawancara</h4>
                                            <ul className="mt-4 space-y-3 text-sm text-gray-700">
                                                <li className="flex items-start"><CheckIcon /> Datang 15-30 menit sebelum jadwal wawancara.</li>
                                                <li className="flex items-start"><CheckIcon /> Berpakaian formal dan rapi sesuai dengan budaya perusahaan.</li>
                                                <li className="flex items-start"><CheckIcon /> Bawa salinan CV, portofolio, dan dokumen lainnya.</li>
                                                <li className="flex items-start"><CheckIcon /> Berikan jawaban yang jujur, jelas, dan terstruktur.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8 text-sm">
                                        <p className="font-bold text-blue-800">Pertanyaan yang mungkin ditanyakan:</p>
                                        <ul className="list-disc list-inside mt-2 space-y-1 text-blue-700">
                                            <li>Ceritakan tentang diri Anda dan pengalaman kerja Anda</li>
                                            <li>Mengapa Anda tertarik bekerja di perusahaan kami?</li>
                                            <li>Apa kekuatan dan kelemahan Anda?</li>
                                            <li>Bagaimana Anda menangani konflik atau tekanan dalam pekerjaan?</li>
                                            <li>Dimana Anda melihat diri Anda dalam 5 tahun ke depan?</li>
                                        </ul>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-600 mt-2">Beberapa hal yang perlu dipersiapkan untuk tahap ini.</p>
                                    <p className="text-sm text-gray-600 mt-2">Tahap {currentStage.name.toLowerCase()} ini penting untuk menilai kesesuaian Anda dengan posisi. Berikut beberapa tips yang kami sarankan:</p>

                                    <ul className="mt-4 space-y-3 text-sm text-gray-700">
                                        <li className="flex items-start"><CheckIcon /> Pastikan semua dokumen pendukung sudah dipersiapkan dengan lengkap.</li>
                                        <li className="flex items-start"><CheckIcon /> Ikuti semua instruksi yang diberikan secara seksama.</li>
                                        <li className="flex items-start"><CheckIcon /> Jangan ragu untuk bertanya jika ada hal yang tidak jelas.</li>
                                        <li className="flex items-start"><CheckIcon /> Tunjukkan kemampuan terbaik Anda dalam tahap ini.</li>
                                    </ul>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8 text-sm">
                                        <p className="font-bold text-blue-800">Pesan dari Tim Rekrutmen:</p>
                                        <p className="text-blue-700 mt-1">Kami menghargai keseriusan dan profesionalisme Anda dalam mengikuti proses seleksi ini. Semoga sukses!</p>
                                    </div>
                                </>
                            )}
                        </section>
                    )}

                    {/* Action button based on current stage */}
                    {currentStage && (
                        <footer className="mt-8 py-6 border-t border-gray-200 flex justify-end">
                            {currentStage.name === 'Psikotest' && (
                                <button className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform transform hover:scale-105">
                                    Mulai Mengerjakan
                                </button>
                            )}
                            
                            {currentStage.name === 'Wawancara' && (
                                <button className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-transform transform hover:scale-105">
                                    Konfirmasi Kehadiran
                                </button>
                            )}
                            
                            {currentStage.name === 'Administrasi' && (
                                <button className="bg-gray-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-transform transform hover:scale-105">
                                    Kembali ke Daftar Lamaran
                                </button>
                            )}
                            
                            {(currentStage.name === 'Hired' || currentStage.name === 'Rejected') && (
                                <button className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform transform hover:scale-105">
                                    Lihat Lowongan Lainnya
                                </button>
                            )}
                        </footer>
                    )}
                </main>
            </div>
        </div>
    );
}
