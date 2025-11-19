import { Link, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Users, Target, Award } from 'lucide-react';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { route } from 'ziggy-js';
import 'swiper/css';
import 'swiper/css/navigation';

interface AboutUsProps {
    aboutUsData: {
        vision: string;
        mission: string;
    } | null;
    companies: {
        id: number;
        name: string;
        description: string;
        website?: string;
        logo?: string;
        email?: string;
        phone?: string;
        address?: string;
    }[];
    contacts: {
        email: string;
        phone: string;
        address: string;
    } | null;
}

interface CompanyCarouselProps {
    companies: {
        id: number;
        name: string;
        description: string;
        website?: string;
        logo?: string;
    }[];
}

const CompanyCarousel: React.FC<CompanyCarouselProps> = ({ companies }) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    const currentCompany = useMemo(() => {
        if (!companies || companies.length === 0) {
            return null;
        }
        return companies[currentIndex] || companies[0];
    }, [currentIndex, companies]);

    const images = ['/images/1.PNG', '/images/13.PNG', '/images/12.PNG', '/images/14.PNG', '/images/15.PNG'];

    const handlePrev = () => {
        if (!companies || companies.length <= 1) return;
        setCurrentIndex((prev) => (prev === 0 ? companies.length - 1 : prev - 1));
    };

    const handleNext = () => {
        if (!companies || companies.length <= 1) return;
        setCurrentIndex((prev) => (prev === companies.length - 1 ? 0 : prev + 1));
    };

    if (!companies || companies.length === 0) {
        return null;
    }

    return (
        <section className="relative bg-gradient-to-b from-gray-50 to-white py-24 px-4">
            <div className="mx-auto max-w-7xl">
                {/* Section Header */}
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
                        Perusahaan Kami
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-gray-600">
                        Menghadirkan solusi inovatif melalui berbagai entitas bisnis yang terpercaya
                    </p>
                </div>

                <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
                    {/* Left: Company Info */}
                    <div className="space-y-8">
                        <div className="transition-all duration-500 ease-in-out">
                            <div className="mb-6 flex items-center gap-4">
                                {currentCompany?.logo && (
                                    <div className="flex-shrink-0">
                                        <img
                                            src={currentCompany.logo}
                                            alt={`${currentCompany.name} Logo`}
                                            className="h-16 w-16 object-contain"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/images/default-company-logo.png';
                                            }}
                                        />
                                    </div>
                                )}
                                <h3 className="text-3xl font-bold text-gray-900 md:text-4xl">
                                    {currentCompany?.name || 'Company Name'}
                                </h3>
                            </div>
                            <p className="text-lg leading-relaxed text-gray-700">
                                {currentCompany?.description || 'Company description'}
                            </p>
                        </div>

                        {/* Navigation */}
                        {companies && companies.length > 1 && (
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handlePrev}
                                    className="group flex h-14 w-14 items-center justify-center rounded-xl bg-white text-gray-700 shadow-md transition-all hover:bg-blue-600 hover:text-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    aria-label="Previous company"
                                >
                                    <ChevronLeft className="h-6 w-6 transition-transform group-hover:scale-110" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="group flex h-14 w-14 items-center justify-center rounded-xl bg-white text-gray-700 shadow-md transition-all hover:bg-blue-600 hover:text-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    aria-label="Next company"
                                >
                                    <ChevronRight className="h-6 w-6 transition-transform group-hover:scale-110" />
                                </button>
                                <div className="ml-4 flex gap-2">
                                    {companies.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentIndex(index)}
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                index === currentIndex
                                                    ? 'w-10 bg-blue-600 shadow-md'
                                                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                                            }`}
                                            aria-label={`Go to company ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Company Info Button */}
                        {currentCompany?.website && (
                            <a
                                href={currentCompany.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Kunjungi Website
                                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </a>
                        )}
                    </div>

                    {/* Right: Image Gallery */}
                    <div className="relative">
                        <Swiper
                            key={`company-${currentCompany?.id}-${currentIndex}`}
                            modules={[Navigation]}
                            spaceBetween={20}
                            slidesPerView={2}
                            className="w-full"
                            breakpoints={{
                                640: {
                                    slidesPerView: 2,
                                    spaceBetween: 20,
                                },
                                768: {
                                    slidesPerView: 2,
                                    spaceBetween: 20,
                                },
                            }}
                        >
                            {images && images.length > 0 ? (
                                images.map((image, index) => (
                                    <SwiperSlide key={index}>
                                        <div className="group relative overflow-hidden rounded-2xl shadow-xl">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10"></div>
                                            <img
                                                src={image}
                                                alt={`${currentCompany?.name} - Image ${index + 1}`}
                                                className="h-96 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/images/default-company-logo.png';
                                                }}
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))
                            ) : (
                                <SwiperSlide>
                                    <div className="flex h-96 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                                        <span className="text-gray-400">No Images Available</span>
                                    </div>
                                </SwiperSlide>
                            )}
                        </Swiper>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default function AboutUs({ aboutUsData, companies, contacts }: AboutUsProps) {
    interface AuthUser {
        name: string;
        email: string;
    }
    
    const { auth } = usePage<{ auth: { user: AuthUser } }>().props;
    const [showDropdown, setShowDropdown] = React.useState(false);

    return (
        <>
            {/* Navbar */}
            <header className="fixed top-0 right-0 left-0 z-[1000] h-[80px] border-b border-gray-200 bg-white/95 backdrop-blur-sm px-[20px] shadow-sm">
                <div className="container mx-auto flex items-center justify-between px-6 py-4">
                    <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                        MITRA KARYA GROUP
                    </Link>
                    <nav className="hidden space-x-8 text-sm font-medium md:flex text-gray-700">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Beranda</Link>
                        <Link href="/job-hiring-landing-page" className="hover:text-blue-600 transition-colors">Lowongan Pekerjaan</Link>
                        <Link href="/about-us" className="text-blue-600 font-semibold">Tentang Kami</Link>
                        <Link href="/contact" className="hover:text-blue-600 transition-colors">Kontak</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        {auth?.user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="w-10 h-10 border-2 border-blue-600 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                    <svg
                                        className="w-5 h-5"
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
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200"
                                        onBlur={() => setShowDropdown(false)}
                                    >
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">{auth.user.name}</p>
                                            <p className="text-sm text-gray-500">{auth.user.email}</p>
                                        </div>
                                        <Link
                                            href="/candidate/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                Logout
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link href={route('login')} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                                    Masuk
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
                                >
                                    Daftar
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section
                className="relative flex min-h-[90vh] items-center justify-center bg-cover bg-center bg-fixed pt-[80px] text-white"
                style={{ backgroundImage: "url('/images/1.PNG')" }}
            >
                <div className="absolute inset-0 bg-blue-900/50"></div>
                <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
                <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
                    <div className="mb-5 inline-block rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm shadow-lg">
                        <span className="text-xs font-semibold uppercase tracking-wider text-white drop-shadow-md">Tentang Kami</span>
                    </div>
                    <h1 className="mb-5 text-3xl font-bold leading-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl">
                        Membangun Masa Depan
                        <span className="block text-blue-200 drop-shadow-md">Bersama Inovasi</span>
                    </h1>
                    <p className="mx-auto mb-6 max-w-3xl text-sm font-medium leading-relaxed text-white drop-shadow-md md:text-base">
                        Mitra Karya Group adalah ekosistem perusahaan teknologi yang berkomitmen menghadirkan 
                        solusi inovatif dan transformasi digital untuk mendorong kemajuan bisnis di Indonesia.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 backdrop-blur-sm shadow-lg">
                            <Users className="h-4 w-4 text-blue-200" />
                            <span className="text-xs font-semibold text-white">Tim Profesional</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 backdrop-blur-sm shadow-lg">
                            <Target className="h-4 w-4 text-blue-200" />
                            <span className="text-xs font-semibold text-white">Berpengalaman</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 backdrop-blur-sm shadow-lg">
                            <Award className="h-4 w-4 text-blue-200" />
                            <span className="text-xs font-semibold text-white">Terpercaya</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Company Carousel Section */}
            {companies && companies.length > 0 && (
                <CompanyCarousel companies={companies} />
            )}

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
                            {companies && companies.length > 0 ? (
                                companies.map((company) => (
                                    <li key={company.id}>
                                        <a
                                            href={company.website || '#'}
                                            target={company.website ? '_blank' : undefined}
                                            rel={company.website ? 'noopener noreferrer' : undefined}
                                            className="group flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
                                        >
                                            <span>{company.name}</span>
                                            {company.website && (
                                                <i className="fas fa-external-link-alt text-xs opacity-0 transition-opacity group-hover:opacity-100"></i>
                                            )}
                                        </a>
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
                            {contacts ? (
                                <>
                                    <li className="flex items-start gap-3">
                                        <i className="fas fa-phone mt-1 text-blue-400 flex-shrink-0" />
                                        <div className="text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: contacts.phone }} />
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <i className="fas fa-envelope mt-1 text-blue-400 flex-shrink-0" />
                                        <a 
                                            href={`mailto:${contacts.email}`}
                                            className="text-gray-400 hover:text-white transition-colors break-all"
                                        >
                                            {contacts.email}
                                        </a>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <i className="fas fa-map-marker-alt mt-1 text-blue-400 flex-shrink-0" />
                                        <span className="text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ 
                                            __html: contacts.address.replace(/\n/g, '<br />') 
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
        </>
    );
}
