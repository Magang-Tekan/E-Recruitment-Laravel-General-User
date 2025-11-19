import { usePage, Head, Link, router } from '@inertiajs/react';
import React from 'react';
import Swal from 'sweetalert2';
import { 
  ChevronRight, 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  GraduationCap, 
  Building2, 
  Briefcase, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Gift,
  Sparkles
} from 'lucide-react';

interface JobDetailProps extends Record<string, unknown> {
    job: {
        id: number;
        title: string;
        company: { name: string };
        job_description: string;
        requirements: string[];
        benefits: string[];
        major_id?: number | null;
        major_name?: string | null;
        major_names?: string[];
        major_ids?: number[];
        required_education?: string;
    };
    userMajor: number | null;
    isMajorMatched: boolean;
    userEducation?: string;
    educationMatched?: boolean;
    canApply: boolean;
    applicationMessage: string;
    flash?: { success?: string; error?: string; };
}

const JobDetailPage: React.FC = () => {
    const { job, userMajor, isMajorMatched, canApply, applicationMessage, flash, userEducation, educationMatched } = usePage<JobDetailProps>().props;

    // Helper function to parse job data (requirements/benefits)
    const parseArrayData = (data: string | string[] | null | undefined): string[] => {
        if (!data) return [];
        
        if (Array.isArray(data)) {
            return data;
        }
        
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [data];
            }
        }
        
        return [];
    };

    const requirements = parseArrayData(job?.requirements);
    const benefits = parseArrayData(job?.benefits);

    React.useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                title: 'Sukses!',
                text: flash.success,
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = '/candidate/application-history';
            });
        }

        if (flash?.error) {
            Swal.fire({
                title: 'Perhatian!',
                text: flash.error,
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        }
    }, [flash]);

    const handleApply = async () => {
        Swal.fire({
            title: 'Konfirmasi',
            text: 'Anda akan melamar pekerjaan ini. Lanjutkan?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Lamar Sekarang',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#6b7280'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    Swal.fire({
                        title: 'Memproses...',
                        text: 'Mohon tunggu sebentar',
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    router.post(`/candidate/apply/${job.id}`, {}, {
                        onSuccess: (data: any) => {
                            Swal.close();
                            
                            Swal.fire({
                                title: 'Berhasil!',
                                text: 'Lamaran Anda telah berhasil dikirim.',
                                icon: 'success',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#2563eb'
                            }).then(() => {
                                router.visit('/candidate/application-history');
                            });
                        },
                        onError: (errors: any) => {
                            Swal.close();
                            console.error('Apply error:', errors);

                            if (errors.message) {
                                Swal.fire({
                                    title: 'Perhatian',
                                    text: errors.message,
                                    icon: 'warning',
                                    confirmButtonText: 'OK',
                                    confirmButtonColor: '#2563eb'
                                });
                            } else {
                                Swal.fire({
                                    title: 'Error',
                                    text: 'Terjadi kesalahan saat melamar. Silakan coba lagi.',
                                    icon: 'error',
                                    confirmButtonText: 'OK',
                                    confirmButtonColor: '#dc2626'
                                });
                            }
                        }
                    });
                } catch (error: unknown) {
                    Swal.close();
                    console.error('Apply error:', error);
                    
                    Swal.fire({
                        title: 'Error',
                        text: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#dc2626'
                    });
                }
            }
        });
    };

    return (
        <>
            <Head title={`${job?.title || 'Detail Lowongan'} - Mitra Karya Group`} />
            <div className="min-h-screen bg-white">
                {/* Navbar for Candidate */}
                <header className="fixed top-0 right-0 left-0 z-50 h-[80px] border-b border-gray-200 bg-white/95 backdrop-blur-sm px-[20px] shadow-sm">
                    <div className="container mx-auto flex items-center justify-between px-6 py-4">
                        <Link href="/candidate/dashboard" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                            MITRA KARYA GROUP
                        </Link>
                        <nav className="hidden space-x-8 text-sm font-medium md:flex text-gray-700">
                            <Link href="/candidate/dashboard" className="hover:text-blue-600 transition-colors">Beranda</Link>
                            <Link href="/candidate/profile" className="hover:text-blue-600 transition-colors">Profil</Link>
                            <Link href="/candidate/jobs" className="hover:text-blue-600 transition-colors">Lowongan Pekerjaan</Link>
                            <Link href="/candidate/application-history" className="hover:text-blue-600 transition-colors">Lamaran</Link>
                        </nav>
                        <div className="flex items-center gap-4">
                            <Link 
                                href="/candidate/jobs"
                                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <ArrowRight className="h-4 w-4 rotate-180" />
                                Kembali
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section
                    className="relative flex min-h-[50vh] items-center justify-center bg-cover bg-center bg-fixed pt-[80px] text-white"
                    style={{ backgroundImage: "url('/images/1.PNG')" }}
                >
                    <div className="absolute inset-0 bg-blue-900/50"></div>
                    <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
                    <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
                        <div className="mb-4 inline-block rounded-full bg-white/20 px-2.5 py-1 backdrop-blur-sm shadow-lg">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-white drop-shadow-md">Detail Lowongan</span>
                        </div>
                        <h1 className="mb-3 text-2xl font-bold leading-tight text-white drop-shadow-lg md:text-3xl lg:text-4xl">
                            {job?.title || 'Lowongan Pekerjaan'}
                        </h1>
                        <div className="mb-4 flex items-center justify-center gap-2">
                            <div className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 backdrop-blur-sm shadow-lg">
                                <Building2 className="h-3.5 w-3.5 text-blue-200" />
                                <span className="text-xs font-semibold text-white">{job?.company?.name || 'Perusahaan'}</span>
                            </div>
                            {(job?.major_names && job.major_names.length > 0) || job?.major_name ? (
                                <div className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 backdrop-blur-sm shadow-lg">
                                    <GraduationCap className="h-3.5 w-3.5 text-blue-200" />
                                    <span className="text-xs font-semibold text-white">
                                        {job?.major_names && job.major_names.length > 0 
                                            ? job.major_names.join(', ')
                                            : job?.major_name || 'Jurusan'}
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </section>

                {/* Alert Section */}
                <section className="bg-white py-6 px-4">
                    <div className="mx-auto max-w-5xl">
                        {/* Major Match Alert */}
                        {userMajor === null ? (
                            <div className="mb-4 flex items-start gap-3 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                                <div className="flex-1">
                                    <h3 className="mb-1 text-sm font-semibold text-yellow-900">Data Jurusan Belum Lengkap</h3>
                                    <p className="text-xs text-yellow-800">
                                        Mohon lengkapi data pendidikan Anda terlebih dahulu untuk dapat melamar lowongan ini.
                                    </p>
                                    <Link 
                                        href="/candidate/profile"
                                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-yellow-700 hover:text-yellow-900 transition-colors"
                                    >
                                        Lengkapi Profil
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ) : isMajorMatched ? (
                            <div className="mb-4 flex items-start gap-3 rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
                                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                                <div className="flex-1">
                                    <h3 className="mb-1 text-sm font-semibold text-green-900">Jurusan Anda Cocok!</h3>
                                    <p className="text-xs text-green-800">
                                        Lowongan ini membutuhkan jurusan: <span className="font-semibold">
                                            {job?.major_names && job.major_names.length > 0 
                                                ? job.major_names.join(', ')
                                                : job?.major_name || 'Tidak ditentukan'}
                                        </span> yang sesuai dengan jurusan Anda.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-4 flex items-start gap-3 rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                                <XCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                                <div className="flex-1">
                                    <h3 className="mb-1 text-sm font-semibold text-red-900">Jurusan Tidak Sesuai</h3>
                                    <p className="text-xs text-red-800">
                                        Lowongan ini membutuhkan jurusan: <span className="font-semibold">
                                            {job?.major_names && job.major_names.length > 0 
                                                ? job.major_names.join(', ')
                                                : job?.major_name || 'Tidak ditentukan'}
                                        </span> yang tidak sesuai dengan jurusan Anda.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Application Status Alert */}
                        {!canApply && applicationMessage && (
                            <div className="mb-4 flex items-start gap-3 rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-600" />
                                <div className="flex-1">
                                    <h3 className="mb-1 text-sm font-semibold text-orange-900">Tidak Dapat Melamar</h3>
                                    <p className="text-xs text-orange-800">{applicationMessage}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Content Section */}
                <section className="bg-gradient-to-b from-gray-50 to-white py-12 px-4">
                    <div className="mx-auto max-w-5xl">
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-5">
                                {/* Job Description */}
                                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900">Deskripsi Pekerjaan</h2>
                                    </div>
                                    <div 
                                        className="prose prose-sm max-w-none text-sm text-gray-700 leading-relaxed"
                                        dangerouslySetInnerHTML={{ 
                                            __html: job?.job_description 
                                                ? job.job_description.replace(/\n/g, '<br />') 
                                                : '<p class="text-gray-500 italic text-sm">Deskripsi pekerjaan tidak tersedia.</p>'
                                        }} 
                                    />
                                </div>

                                {/* Requirements */}
                                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                                            <Briefcase className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900">Persyaratan</h2>
                                    </div>
                                    {requirements.length > 0 ? (
                                        <ul className="space-y-2.5">
                                            {requirements.map((requirement, index) => (
                                                <li key={index} className="flex items-start gap-2.5 text-sm text-gray-700">
                                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600"></span>
                                                    <span className="flex-1 leading-relaxed">{requirement}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">Persyaratan tidak tersedia.</p>
                                    )}
                                </div>

                                {/* Benefits */}
                                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                                            <Gift className="h-4 w-4 text-green-600" />
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900">Fasilitas & Tunjangan</h2>
                                    </div>
                                    {benefits.length > 0 ? (
                                        <ul className="space-y-2.5">
                                            {benefits.map((benefit, index) => (
                                                <li key={index} className="flex items-start gap-2.5 text-sm text-gray-700">
                                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-600"></span>
                                                    <span className="flex-1 leading-relaxed">{benefit}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">Fasilitas dan tunjangan tidak tersedia.</p>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar - Apply Button */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-5 shadow-lg">
                                    <div className="mb-5 text-center">
                                        <h3 className="mb-2 text-base font-bold text-gray-900">Tertarik dengan Posisi Ini?</h3>
                                        <p className="text-xs text-gray-600">
                                            Kirimkan lamaran Anda sekarang dan bergabunglah dengan tim profesional kami.
                                        </p>
                                    </div>
                                    
                                    <button
                                        onClick={handleApply}
                                        disabled={!isMajorMatched || !canApply}
                                        className={`group w-full rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 ${
                                            !isMajorMatched || !canApply
                                                ? 'cursor-not-allowed bg-gray-400'
                                                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl hover:scale-105 active:scale-95'
                                        }`}
                                    >
                                        {!isMajorMatched
                                            ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <XCircle className="h-4 w-4" />
                                                    Jurusan Tidak Sesuai
                                                </span>
                                            )
                                            : !canApply
                                                ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <AlertCircle className="h-4 w-4" />
                                                        Tidak Dapat Melamar
                                                    </span>
                                                )
                                                : (
                                                    <span className="flex items-center justify-center gap-2">
                                                        Lamar Sekarang
                                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                    </span>
                                                )
                                        }
                                    </button>

                                    {(!isMajorMatched || !canApply) && (
                                        <p className="mt-3 text-center text-[10px] text-gray-500">
                                            {!isMajorMatched
                                                ? 'Silakan periksa kesesuaian jurusan Anda dengan persyaratan lowongan.'
                                                : 'Anda sudah memiliki aplikasi aktif untuk periode ini.'}
                                        </p>
                                    )}

                                    {/* Quick Info */}
                                    <div className="mt-6 space-y-3 border-t border-gray-200 pt-5">
                                        <div className="flex items-center gap-2.5 text-xs text-gray-600">
                                            <Building2 className="h-3.5 w-3.5 text-blue-600" />
                                            <span className="font-medium">{job?.company?.name || 'Perusahaan'}</span>
                                        </div>
                                        {(job?.major_names && job.major_names.length > 0) || job?.major_name ? (
                                            <div className="flex items-center gap-2.5 text-xs text-gray-600">
                                                <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                                                <div className="flex flex-wrap gap-1.5">
                                                    {job?.major_names && job.major_names.length > 0 ? (
                                                        job.major_names.map((majorName, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-block rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700"
                                                            >
                                                                {majorName}
                                                            </span>
                                                        ))
                                                    ) : job?.major_name ? (
                                                        <span className="inline-block rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                                                            {job.major_name}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        ) : null}
                                        {job?.required_education && (
                                            <div className="flex items-center gap-2.5 text-xs text-gray-600">
                                                <Users className="h-3.5 w-3.5 text-blue-600" />
                                                <span>Pendidikan: {job.required_education}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 py-20 text-gray-300">
                    <div className="container mx-auto grid grid-cols-1 gap-12 px-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Kolom 1: About */}
                        <div className="lg:col-span-2">
                            <div className="mb-6">
                                <h3 className="mb-4 text-2xl font-bold text-white">MITRA KARYA GROUP</h3>
                                <p className="mb-4 max-w-md text-sm leading-relaxed text-gray-400">
                                    Ekosistem perusahaan teknologi terdepan yang menghadirkan solusi inovatif untuk transformasi digital Indonesia. 
                                    Kami berkomitmen membangun masa depan bersama melalui teknologi dan inovasi.
                                </p>
                                <p className="text-sm leading-relaxed text-gray-400">
                                    Menghubungkan talenta terbaik dengan peluang karier berkualitas di berbagai perusahaan terpercaya.
                                </p>
                            </div>
                            {/* Social Media Icons */}
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-400">Ikuti Kami:</span>
                                <div className="flex gap-3">
                                    <div className="relative group">
                                        <a 
                                            href="https://www.instagram.com/mikacares.id" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-all hover:bg-pink-500 hover:text-white"
                                            aria-label="Instagram"
                                        >
                                            <i className="fab fa-instagram text-lg"></i>
                                        </a>
                                        <div className="absolute bottom-full left-0 mb-2 bg-gray-800 shadow-xl rounded-lg p-2 hidden group-hover:block z-10 w-40 border border-gray-700">
                                            <a 
                                                href="https://www.instagram.com/mikacares.id" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="block py-2 px-3 text-sm hover:text-pink-500 hover:bg-gray-700 rounded transition-colors"
                                            >
                                                @mikacares.id
                                            </a>
                                            <a 
                                                href="https://www.instagram.com/autentik.co.id" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="block py-2 px-3 text-sm hover:text-pink-500 hover:bg-gray-700 rounded transition-colors"
                                            >
                                                @autentik.co.id
                                            </a>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <a 
                                            href="https://www.linkedin.com/company/pt-mitra-karya-analitika" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-all hover:bg-[#0A66C2] hover:text-white"
                                            aria-label="LinkedIn"
                                        >
                                            <i className="fab fa-linkedin-in text-lg"></i>
                                        </a>
                                        <div className="absolute bottom-full left-0 mb-2 bg-gray-800 shadow-xl rounded-lg p-3 hidden group-hover:block z-50 w-72 border border-gray-700">
                                            <div className="flex flex-col gap-2">
                                                <a 
                                                    href="https://www.linkedin.com/company/pt-mitra-karya-analitika" 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded-md transition-colors"
                                                >
                                                    <i className="fab fa-linkedin text-2xl text-[#0A66C2]"></i>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-white">PT Mitra Karya Analitika</span>
                                                        <span className="text-xs text-gray-400">Ikuti kami di LinkedIn</span>
                                                    </div>
                                                </a>
                                                <div className="border-t border-gray-700"></div>
                                                <a 
                                                    href="https://www.linkedin.com/company/pt-autentik-karya-analitika" 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded-md transition-colors"
                                                >
                                                    <i className="fab fa-linkedin text-2xl text-[#0A66C2]"></i>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-white">PT Autentik Karya Analitika</span>
                                                        <span className="text-xs text-gray-400">Ikuti kami di LinkedIn</span>
                                                    </div>
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <a 
                                        href="https://www.youtube.com/@mikacares" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-all hover:bg-red-600 hover:text-white"
                                        aria-label="YouTube"
                                    >
                                        <i className="fab fa-youtube text-lg"></i>
                                    </a>

                                    <a 
                                        href="https://wa.me/6281770555554" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-all hover:bg-green-500 hover:text-white"
                                        aria-label="WhatsApp"
                                    >
                                        <i className="fab fa-whatsapp text-lg"></i>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Kolom 2: Perusahaan Kami */}
                        <div>
                            <h4 className="mb-6 text-lg font-bold text-white">Perusahaan Kami</h4>
                            <ul className="space-y-3">
                                <li>
                                    <span className="text-sm text-gray-400 transition-colors hover:text-white">
                                        PT Mitra Karya Analitika
                                    </span>
                                </li>
                                <li>
                                    <span className="text-sm text-gray-400 transition-colors hover:text-white">
                                        PT Autentik Karya Analitika
                                    </span>
                                </li>
                            </ul>
                            <div className="mt-6">
                                <Link 
                                    href="/about-us" 
                                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Tentang Kami
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Kolom 3: Kontak */}
                        <div>
                            <h4 className="mb-6 text-lg font-bold text-white">Hubungi Kami</h4>
                            <ul className="space-y-4 text-sm">
                                <li className="flex items-start gap-3">
                                    <i className="fas fa-phone mt-1 text-blue-400 flex-shrink-0" />
                                    <div className="text-gray-400 leading-relaxed">
                                        Rudy Alfiansyah: 082137384029<br />
                                        Deden Dermawan: 081807700111
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fas fa-envelope mt-1 text-blue-400 flex-shrink-0" />
                                    <a 
                                        href="mailto:autentik.info@gmail.com"
                                        className="text-gray-400 hover:text-white transition-colors break-all"
                                    >
                                        autentik.info@gmail.com
                                    </a>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fas fa-map-marker-alt mt-1 text-blue-400 flex-shrink-0" />
                                    <span className="text-gray-400 leading-relaxed">
                                        Jl. Klipang Ruko Amsterdam No.9E, Sendangmulyo,<br />
                                        Kec. Tembalang, Kota Semarang, Jawa Tengah 50272
                                    </span>
                                </li>
                            </ul>
                            <div className="mt-6">
                                <Link 
                                    href="/contact" 
                                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Kirim Pesan
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bottom Bar */}
                    <div className="mt-16 border-t border-gray-700 pt-8">
                        <div className="container mx-auto px-6">
                            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                                <p className="text-sm text-gray-500">
                                    &copy; {new Date().getFullYear()} <span className="font-semibold text-white">Mitra Karya Group</span>. Hak cipta dilindungi.
                                </p>
                                <div className="flex gap-6 text-sm text-gray-500">
                                    <Link href="/candidate/dashboard" className="hover:text-white transition-colors">Beranda</Link>
                                    <Link href="/about-us" className="hover:text-white transition-colors">Tentang Kami</Link>
                                    <Link href="/candidate/jobs" className="hover:text-white transition-colors">Lowongan</Link>
                                    <Link href="/contact" className="hover:text-white transition-colors">Kontak</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default JobDetailPage;
