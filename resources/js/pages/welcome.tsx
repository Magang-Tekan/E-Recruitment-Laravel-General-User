import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Contact {
    email: string;
    phone: string;
    address: string;
}

interface WelcomeProps {
    vacancies: JobOpening[];
    companies: Company[];
    footerCompanies: {
        id: number;
        name: string;
    }[];
    contacts: Contact | null;
}

interface JobOpening {
    id: number;
    title: string;
    company: {
        name: string;
        id: number | null;
    };
    description: string;
    location: string;
    type: string;
    department: string;
    endTime: string | null;
    deadline: string;
    isExpired: boolean;
    requirements: string[] | string;
    benefits: string[] | string;
    salary: string | null;
    major_id: number | null;
    major_name: string | null;
    created_at: string | null;
    updated_at: string | null;
}

// Definisi interface untuk Company
interface Company {
    id: number;
    name: string;
    description: string;
    logo: string;
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
}
    
const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

export default function Welcome(props: WelcomeProps) {
    // Get auth data from Inertia shared props
    const { auth } = usePage<SharedData>().props;

    // Debug logging
    console.log('Welcome props:', props);
    console.log('Companies data:', props.companies);

    const backgroundImages = [
        "/images/slider1.png",
        "/images/slider2.png",
        "/images/slider3.png",
        "/images/slider4.png",
    ];

    const benefitCards = [
        {
            title: "Lingkungan Kerja Profesional",
            description: "Kami menciptakan budaya kerja yang kolaboratif dan mendukung perkembangan karier setiap karyawan.",
            icon: "/images/benefit1.png"
        },
        {
            title: "Inovasi dan Teknologi",
            description: "Bergabunglah dengan tim yang selalu beradaptasi dengan teknologi terbaru dan menghadirkan solusi terbaik bagi pelanggan.",
            icon: "/images/benefit2.png"
        },
        {
            title: "Benefit Kompetitif",
            description: "Kami menawarkan kompensasi dan tunjangan yang menarik sesuai dengan kinerja dan kontribusi Anda.",
            icon: "/images/benefit3.png"
        },
        {
            title: "Kesempatan Berkembang",
            description: "Kami menyediakan pelatihan dan pengembangan berkelanjutan untuk meningkatkan keterampilan dan kompetensi Anda.",
            icon: "/images/benefit4.png"
        },
    ];

    const [bgIndex, setBgIndex] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false); // Add mobile menu state

    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % backgroundImages.length);
        }, 10000);
        return () => clearInterval(interval);
    }, [backgroundImages.length]);

    // Add click outside handler to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const dropdown = document.getElementById('profile-dropdown');
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileMenuButton = document.getElementById('mobile-menu-button');
            
            if (dropdown && !dropdown.contains(event.target as Node)) {
                setShowDropdown(false);
            }
            if (mobileMenu && !mobileMenu.contains(event.target as Node) && 
                mobileMenuButton && !mobileMenuButton.contains(event.target as Node)) {
                setShowMobileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Function to handle job detail navigation with authentication check
    const handleJobDetailClick = (jobId: number) => {
        if (!auth?.user) {
            // If user is not logged in, redirect to register page
            router.visit(route('register'));
        } else {
            // If user is logged in, navigate to job detail page
            router.visit(`/candidate/job/${jobId}`);
        }
    };

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=outfit:300,400,500,600" rel="stylesheet" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
            </Head>
            <div className="min-h-screen bg-white text-gray-900 pt-[60px] sm:pt-[80px]">
                {/* Navbar */}
                <header className="fixed top-0 right-0 left-0 z-50 h-[60px] sm:h-[80px] border-b border-gray-200 bg-white px-[12px] sm:px-[20px] shadow">
                    <div className="container mx-auto flex items-center justify-between px-2 sm:px-6 py-3 sm:py-4">
                        <div className="text-[16px] sm:text-[20px] font-bold text-gray-800">MITRA KARYA GROUP</div>

                        {/* Desktop Navigation */}
                        <nav className="hidden space-x-[16px] sm:space-x-[24px] text-[12px] sm:text-[14px] font-medium md:flex">
                            <Link href="/" className="hover:text-blue-600">
                                Beranda
                            </Link>
                            <Link href="/job-hiring-landing-page" className="hover:text-blue-600">
                                Lowongan Pekerjaan
                            </Link>
                            <Link href="/about-us" className="hover:text-blue-600">
                                Tentang Kami
                            </Link>
                            <Link href="/contact" className="hover:text-blue-600">
                                Kontak
                            </Link>
                        </nav>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden md:flex items-center gap-2 sm:gap-4">
                            {auth?.user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-[#0047FF] rounded-full flex items-center justify-center text-[#0047FF] hover:bg-blue-50"
                                    >
                                        <svg
                                            className="w-4 h-4 sm:w-5 sm:h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </button>
                                    {showDropdown && (
                                        <div
                                            id="profile-dropdown"
                                            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-md py-1 z-50 border border-gray-300"
                                        >
                                            <div className="px-4 py-2">
                                                <p className="text-sm font-medium text-gray-900">{auth.user.name}</p>
                                                <p className="text-sm text-gray-500">{auth.user.email}</p>
                                            </div>
                                            <Link
                                                href="/candidate/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Profil Saya
                                            </Link>
                                            <form method="POST" action="/logout">
                                                <input
                                                    type="hidden"
                                                    name="_token"
                                                    value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''}
                                                />
                                                <button
                                                    type="submit"
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Logout
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-xs sm:text-sm font-medium text-blue-600 hover:underline"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-md bg-blue-600 px-[12px] sm:px-[16px] py-[8px] sm:py-[10px] text-[12px] sm:text-[14px] text-white hover:bg-blue-700"
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                id="mobile-menu-button"
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 relative z-50"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {showMobileMenu ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Overlay */}
                    {showMobileMenu && (
                        <div className="md:hidden fixed inset-0 z-40 bg-transparent" 
                             onClick={() => setShowMobileMenu(false)} />
                    )}

                    {/* Mobile Menu Card - Slide from Right */}
                    <div
                        id="mobile-menu"
                        className={`md:hidden fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
                            showMobileMenu ? 'translate-x-0' : 'translate-x-full'
                        }`}
                    >
                        {/* Header with X button */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <span className="text-lg font-semibold text-gray-800">Menu</span>
                            <button
                                onClick={() => setShowMobileMenu(false)}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="px-4 py-4 space-y-4 overflow-y-auto h-full">
                            {/* Navigation Links */}
                            <div className="space-y-3">
                                <Link 
                                    href="/" 
                                    className="block text-gray-800 hover:text-blue-600 font-medium py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    Beranda
                                </Link>
                                <Link 
                                    href="/job-hiring-landing-page" 
                                    className="block text-gray-800 hover:text-blue-600 font-medium py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    Lowongan Pekerjaan
                                </Link>
                                <Link 
                                    href="/about-us" 
                                    className="block text-gray-800 hover:text-blue-600 font-medium py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    Tentang Kami
                                </Link>
                                <Link 
                                    href="/contact" 
                                    className="block text-gray-800 hover:text-blue-600 font-medium py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    Kontak
                                </Link>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200"></div>

                            {/* Auth Section */}
                            {auth?.user ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-lg">
                                        <div className="w-10 h-10 border-2 border-blue-500 rounded-full flex items-center justify-center text-blue-500">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{auth.user.name}</p>
                                            <p className="text-xs text-gray-500">{auth.user.email}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/candidate/profile"
                                        className="block text-gray-800 hover:text-blue-600 font-medium py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        Profil Saya
                                    </Link>
                                    <form method="POST" action="/logout">
                                        <input
                                            type="hidden"
                                            name="_token"
                                            value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''}
                                        />
                                        <button
                                            type="submit"
                                            className="block w-full text-left text-gray-800 hover:text-blue-600 font-medium py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                                            onClick={() => setShowMobileMenu(false)}
                                        >
                                            Logout
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Link
                                        href={route('login')}
                                        className="block w-full text-center py-3 px-4 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="block w-full text-center py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        Daftar
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative h-[800px] sm:h-[1200px] md:h-[1400px] pt-[80px] sm:pt-[128px] pb-[40px] sm:pb-[80px] text-center text-white">
                    {/* Background image slideshow */}
                    {backgroundImages.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === bgIndex ? 'z-0 opacity-100' : 'z-0 opacity-0'}`}
                            style={{ backgroundImage: `url(${img})` }}
                        />
                    ))}
                    {/* Black overlay */}
                    <div className="absolute inset-0 z-10 bg-black opacity-70" />
                    <div className="relative z-20 container mx-auto flex h-full flex-col items-center justify-center px-4 sm:px-6">
                        <h1 className="mb-[10px] sm:mb-[14px] text-[20px] sm:text-[28px] md:text-[44px] font-bold leading-tight text-white drop-shadow-lg">
                            Selamat Datang di E-Recruitment
                            <br />
                            Mitra Karya Group
                        </h1>
                        <p className="mb-[20px] sm:mb-[28px] text-[12px] sm:text-[15px] px-4 font-medium text-white drop-shadow-md">Temukan Karier Impian Anda Bersama Kami</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                            <Link href="/job-hiring-landing-page">
                                <Button
                                    className="rounded-md bg-blue-600 px-[20px] sm:px-[24px] py-[10px] sm:py-[12px] text-[14px] sm:text-[16px] text-white hover:bg-blue-700"
                                    onClick={() => scrollToSection('lowongan')}
                                >
                                    Lihat Lowongan
                                </Button>
                            </Link>
                            <Link href="/about-us">
                                <Button
                                    variant="outline"
                                    className="rounded-md border border-white px-[20px] sm:px-[24px] py-[10px] sm:py-[12px] text-[14px] sm:text-[16px] text-white hover:bg-white hover:text-blue-600"
                                >
                                    Tentang Kami
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Section Kenapa Bergabung dengan Ikon Gambar */}
                <section className="bg-white py-12 sm:py-20 text-left">
                    <div className="container mx-auto px-4 sm:px-6">
                        <h2 className="mb-[12px] sm:mb-[16px] text-center text-[20px] sm:text-[24px] md:text-[32px] font-bold">MENGAPA BERGABUNG DENGAN MITRA KARYA GROUP?</h2>
                        <p className="mx-auto mb-[32px] sm:mb-[48px] max-w-[672px] text-center text-[14px] sm:text-[16px] text-gray-600 px-4 sm:px-0">
                            Kami menawarkan lingkungan kerja yang mendukung, peluang pengembangan karier, serta benefit kompetitif.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
                            {benefitCards.map((card, index) => (
                                <div key={index} className="rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm h-full">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                                            <img src={card.icon} alt="" className="w-full h-full" />
                                        </div>

                                        <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-center">
                                            {card.title}
                                        </h3>

                                        <p className="text-xs sm:text-sm text-gray-600 text-center w-full overflow-hidden">
                                            {card.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                {/* Perusahaan Kami & Lowongan */}
                <section className="py-[60px] sm:py-[80px] text-center">
                    <div className="container mx-auto px-4 sm:px-6">
                        <h2 className="mb-[32px] sm:mb-[40px] text-[20px] sm:text-[24px] md:text-[32px] font-bold">Perusahaan Kami</h2>
                        <div className="mb-[32px] sm:mb-[40px] grid grid-cols-1 md:grid-cols-2 gap-[40px] sm:gap-[60px]">
                            {props.companies && props.companies.length > 0 ? (
                                props.companies.map((company) => (
                                        <div
                                            key={company.id}
                                            className="mx-auto flex w-full max-w-[400px] sm:max-w-[528px] items-start gap-3 sm:gap-4 text-left hover:shadow-lg transition-all duration-300 rounded-lg p-3 sm:p-4 border border-gray-200 bg-white"
                                        >
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={company.logo}
                                                    alt={company.name}
                                                    className="mt-1 h-[48px] w-[48px] sm:h-[60px] sm:w-[60px] object-contain rounded-full border border-gray-200"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = '/images/default-company-logo.png';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="mb-2 text-sm sm:text-base font-semibold text-gray-900">{company.name}</h3>
                                                <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-3">
                                                    {company.description || 'Deskripsi perusahaan tidak tersedia'}
                                                </p>
                                                
                                                {/* Contact Information */}
                                                <div className="space-y-1 mb-3">
                                                    {company.email && (
                                                        <div className="flex items-center text-xs text-gray-600">
                                                            <i className="fas fa-envelope mr-2 text-blue-600"></i>
                                                            <span>{company.email}</span>
                                                        </div>
                                                    )}
                                                    {company.phone && (
                                                        <div className="flex items-center text-xs text-gray-600">
                                                            <i className="fas fa-phone mr-2 text-blue-600"></i>
                                                            <span>{company.phone}</span>
                                                        </div>
                                                    )}
                                                    {company.address && (
                                                        <div className="flex items-start text-xs text-gray-600">
                                                            <i className="fas fa-map-marker-alt mr-2 mt-0.5 text-blue-600"></i>
                                                            <span className="line-clamp-2">{company.address}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {company.website && (
                                                    <a
                                                        href={company.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                                    >
                                                        <i className="fas fa-external-link-alt mr-1"></i>
                                                        Kunjungi Website
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="col-span-full text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <i className="fas fa-building text-4xl text-gray-300 mb-4"></i>
                                        <p className="text-lg font-medium">Tidak ada perusahaan untuk ditampilkan</p>
                                        <p className="text-sm text-gray-400">Silakan hubungi administrator untuk menambahkan data perusahaan</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <Link href="/about-us">
                            <Button className="rounded-md border border-blue-600 bg-white px-[20px] sm:px-[24px] py-[10px] sm:py-[12px] text-[14px] sm:text-[16px] text-blue-600 hover:bg-blue-50">
                                Tentang Kami →
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Lowongan Pekerjaan Section */}
                <section className="bg-[#f6fafe] py-[60px] sm:py-[80px] text-center">
                    <div className="container mx-auto px-4 sm:px-6">
                        <h2 className="mb-[12px] sm:mb-[16px] text-[20px] sm:text-[24px] md:text-[32px] font-bold">LOWONGAN PEKERJAAN TERSEDIA</h2>
                        <p className="mx-auto mb-[32px] sm:mb-[40px] max-w-[672px] text-[14px] sm:text-[16px] text-gray-600 px-4 sm:px-0">
                            Temukan posisi yang sesuai dengan minat dan keahlian Anda di PT Mitra Karya Analitika.
                            Kami membuka peluang karier di berbagai bidang.
                        </p>
                        <div className="mb-[32px] sm:mb-[40px] grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {props.vacancies && props.vacancies.length > 0 ? (
                                props.vacancies.map((job) => (
                                    <div
                                        key={job.id}
                                        className="mx-auto flex h-auto w-full max-w-[350px] sm:max-w-[400px] flex-col rounded-xl border border-gray-200 bg-white p-4 sm:p-6 text-left shadow-sm hover:shadow-md transition-shadow duration-300"
                                    >
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-base sm:text-lg font-semibold">{job.title}</h3>
                                                <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600">
                                                    {job.department}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                                                <span>{job.company.name}</span>
                                                <span>•</span>
                                                <span>{job.location}</span>
                                                <span>•</span>
                                                <span>{job.type}</span>
                                                {job.endTime && (
                                                    <>
                                                        <span>•</span>
                                                        <span className={job.isExpired ? 'text-red-600' : 'text-green-600'}>
                                                            {job.isExpired ? 'Sudah berakhir' : `Berakhir: ${new Date(job.endTime).toLocaleDateString('id-ID')}`}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            {job.description && (
                                                <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">
                                                    {job.description.length > 100
                                                        ? `${job.description.substring(0, 100)}...`
                                                        : job.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mb-3 sm:mb-4">
                                            {job.requirements && (
                                                <div>
                                                    <h4 className="text-xs sm:text-sm font-semibold mb-1">Persyaratan:</h4>
                                                    <ul className="list-disc list-inside text-xs sm:text-sm text-gray-600 space-y-1">
                                                        {(() => {
                                                            let reqArray: string[] = [];

                                                            if (Array.isArray(job.requirements)) {
                                                                reqArray = job.requirements;
                                                            } else if (typeof job.requirements === 'string') {
                                                                try {
                                                                    reqArray = JSON.parse(job.requirements);
                                                                } catch {
                                                                    reqArray = [job.requirements];
                                                                }
                                                            }

                                                            return reqArray.slice(0, 3).map((req, idx) => (
                                                                <li key={idx}>{req}</li>
                                                            ));
                                                        })()}
                                                        {(() => {
                                                            let reqArray: string[] = [];

                                                            if (Array.isArray(job.requirements)) {
                                                                reqArray = job.requirements;
                                                            } else if (typeof job.requirements === 'string') {
                                                                try {
                                                                    reqArray = JSON.parse(job.requirements);
                                                                } catch {
                                                                    reqArray = [job.requirements];
                                                                }
                                                            }

                                                            return reqArray.length > 3 ? (
                                                                <li className="text-blue-600">dan {reqArray.length - 3} lainnya...</li>
                                                            ) : null;
                                                        })()}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto">
                                            <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                                                <span className="rounded-full bg-gray-100 px-2 sm:px-3 py-1 text-xs text-gray-600">
                                                    {job.type}
                                                </span>
                                            </div>

                                            <Button
                                                className="w-full rounded bg-blue-600 py-2 text-xs sm:text-sm text-white hover:bg-blue-700"
                                                onClick={() => handleJobDetailClick(job.id)}
                                            >
                                                Lihat Detail
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center text-gray-500">
                                    Tidak ada lowongan pekerjaan saat ini
                                </div>
                            )}
                        </div>
                        <Link href="/job-hiring-landing-page">
                            <Button className="rounded-md bg-blue-100 px-4 sm:px-6 py-2 sm:py-3 text-[14px] sm:text-[16px] text-blue-600 hover:bg-blue-200">
                                Lihat Semua Lowongan →
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Cara Mendaftar */}
                <section className="bg-white py-[60px] sm:py-[80px] text-center">
                    <div className="relative container mx-auto px-4 sm:px-6">
                        <h2 className="mb-3 sm:mb-4 text-[20px] sm:text-[24px] md:text-[32px] font-bold">Cara Mendaftar</h2>
                        <p className="mx-auto mb-12 sm:mb-16 max-w-[768px] text-[14px] sm:text-[16px] text-gray-600 px-4 sm:px-0">
                            Mohon persiapkan terlebih dahulu seluruh data pribadi Anda termasuk pendidikan, pengalaman kerja, organisasi, serta data
                            penunjang lainnya
                        </p>

                        {/* Wrapper dengan garis horizontal */}
                        {/* Wrapper dengan garis horizontal dibatasi antara step 1 dan step 4 */}
                        <div className="relative grid grid-cols-1 items-start gap-6 sm:gap-10 md:grid-cols-4">
                            {/* Garis horizontal hanya antara step 1–4 */}
                            <div className="absolute top-[22px] right-[12.5%] left-[12.5%] z-0 hidden h-[2px] bg-gradient-to-r from-purple-400 to-violet-500 md:block" />

                            {[
                                {
                                    number: 1,
                                    title: 'Daftar & Buat Profil',
                                    desc: 'Klik tombol Daftar dan buat CV Anda dengan melengkapi bagian profil',
                                },
                                {
                                    number: 2,
                                    title: 'Cari Lowongan',
                                    desc: 'Temukan posisi yang sesuai dengan minat dan kualifikasi Anda.',
                                },
                                {
                                    number: 3,
                                    title: 'Kirim Lamaran',
                                    desc: 'Ajukan lamaran Anda secara online dengan mudah dan cepat.',
                                },
                                {
                                    number: 4,
                                    title: 'Proses Seleksi',
                                    desc: 'Jika memenuhi kriteria, tim HR kami akan menghubungi Anda untuk tahap seleksi lebih lanjut.',
                                },
                            ].map((step) => (
                                <div key={step.number} className="relative z-10 flex flex-col items-center px-2 text-center">
                                    <div className="mb-3 sm:mb-4 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-violet-500 font-bold text-white text-sm sm:text-base">
                                        {step.number}
                                    </div>
                                    <h3 className="mb-2 text-[14px] sm:text-[16px] font-semibold">{step.title}</h3>
                                    <p className="max-w-[240px] text-xs sm:text-sm text-gray-600">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-[60px] sm:py-[80px]">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="relative overflow-hidden rounded-[16px] sm:rounded-[24px] bg-black">
                            <img src="/images/siap-bergabung.png" alt="Bergabung" className="h-[250px] sm:h-[300px] w-full object-cover opacity-60" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 text-center text-white">
                                <h2 className="mb-3 sm:mb-4 text-[22px] sm:text-[28px] md:text-[36px] font-bold">Siap untuk Bergabung?</h2>
                                <p className="mb-4 sm:mb-6 max-w-[560px] text-[12px] sm:text-[14px] md:text-[16px] px-4 sm:px-0">
                                    Jangan lewatkan kesempatan untuk menjadi bagian dari tim PT Mitra Karya Analitika.
                                </p>
                                <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
                                    <Link href="/job-hiring-landing-page">
                                        <Button className="rounded-md bg-white px-4 sm:px-6 py-2 sm:py-3 text-[14px] sm:text-[16px] text-blue-600 hover:bg-blue-50">Lihat Lowongan</Button>
                                    </Link>
                                    <Link href="/about-us">
                                        <Button className="rounded-md bg-blue-600 px-4 sm:px-6 py-2 sm:py-3 text-[14px] sm:text-[16px] text-white hover:bg-blue-700">Tentang Kami</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-20 text-gray-300">
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
                                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-all hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white"
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
                                {props.footerCompanies && props.footerCompanies.length > 0 ? (
                                    props.footerCompanies.map((company) => (
                                        <li key={company.id}>
                                            <span className="text-sm text-gray-400 transition-colors hover:text-white">
                                                {company.name}
                                            </span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-sm text-gray-500">Tidak ada perusahaan untuk ditampilkan</li>
                                )}
                            </ul>
                            <div className="mt-6">
                                <Link 
                                    href="/job-hiring-landing-page" 
                                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Lihat Lowongan Pekerjaan
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Kolom 3: Kontak */}
                        <div>
                            <h4 className="mb-6 text-lg font-bold text-white">Hubungi Kami</h4>
                            <ul className="space-y-4 text-sm">
                                {props.contacts ? (
                                    <>
                                        <li className="flex items-start gap-3">
                                            <i className="fas fa-phone mt-1 text-blue-400 flex-shrink-0" />
                                            <div className="text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: props.contacts.phone }} />
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <i className="fas fa-envelope mt-1 text-blue-400 flex-shrink-0" />
                                            <a 
                                                href={`mailto:${props.contacts.email}`}
                                                className="text-gray-400 hover:text-white transition-colors break-all"
                                            >
                                                {props.contacts.email}
                                            </a>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <i className="fas fa-map-marker-alt mt-1 text-blue-400 flex-shrink-0" />
                                            <span className="text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ 
                                                __html: props.contacts.address.replace(/\n/g, '<br />') 
                                            }} />
                                        </li>
                                    </>
                                ) : (
                                    <li className="text-gray-500">Informasi kontak tidak tersedia</li>
                                )}
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
                                    <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
                                    <Link href="/about-us" className="hover:text-white transition-colors">Tentang Kami</Link>
                                    <Link href="/job-hiring-landing-page" className="hover:text-white transition-colors">Lowongan</Link>
                                    <Link href="/contact" className="hover:text-white transition-colors">Kontak</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
