import { Link, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';
import React from 'react';
import { Swiper as SwiperClass } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

interface WelcomeProps {
    vacancies: JobOpening[];
}

interface JobOpening {
    title: string;
    department: string;
    location: string;
    requirements: string[];
    benefits?: string[];
}

interface CompanySliderProps {
    title: string;
    description: string;
    images: string[];
    infoLink: string;
}

interface AboutUsData {
    id: number;
    company_id: number;
    vision: string;
    mission: string;
    created_at: string;
    updated_at: string;
    company?: {
        id: number;
        name: string;
    };
}

interface AboutUsProps {
    aboutUsData: {
        vision: string;
        mission: string;
    } | null;
    companies: {
        id: number;
        name: string;
        description: string;
    }[];
    contacts: {
        email: string;
        phone: string;
        address: string;
    } | null;
}

const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const CompanySlider: React.FC<CompanySliderProps> = ({ title, description, images, infoLink }) => {
    const [swiperInstance, setSwiperInstance] = React.useState<SwiperClass | null>(null);

    return (
        <div className="w-full bg-white py-12">
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-6 px-4 md:grid-cols-2">
                {/* KIRI: Teks */}
                <div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-800 !text-gray-800">{title}</h2>
                    <p className="mb-6 text-sm text-gray-600">{description}</p>
                    <div className="flex items-center gap-4">
                        <button onClick={() => swiperInstance?.slidePrev()} className="rounded-md bg-blue-500 px-3 py-2 text-white">
                            <ChevronLeft />
                        </button>
                        <button onClick={() => swiperInstance?.slideNext()} className="rounded-md bg-blue-500 px-3 py-2 text-white">
                            <ChevronRight />
                        </button>
                    </div>
                </div>

                {/* KANAN: Swiper */}
                <Swiper
                    modules={[Navigation]}
                    navigation={false}
                    spaceBetween={16}
                    slidesPerView={2}
                    className="w-full !pb-8"
                    onSwiper={(swiper) => setSwiperInstance(swiper)}
                >
                    {images && images.length > 0 ? (
                        images.map((image, index) => (
                            <SwiperSlide key={index}>
                                <img src={image} alt={`Slide ${index + 1}`} className="h-64 w-full rounded-xl object-cover" />
                            </SwiperSlide>
                        ))
                    ) : (
                        <SwiperSlide>
                            <div className="flex h-64 w-full items-center justify-center rounded-xl bg-gray-200">
                                <span className="text-gray-500">No Images Available</span>
                            </div>
                        </SwiperSlide>
                    )}
                </Swiper>
            </div>
            {/* TOMBOL DI TENGAH */}
            <div className="mt-8 flex justify-center">
                <a
                    href={infoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
                >
                    Company Info →
                </a>
            </div>
        </div>
    );
};

export default function AboutUs({ aboutUsData, companies, contacts }: AboutUsProps) {
    const { auth } = usePage<{ auth: { user: unknown } }>().props;

    return (
        <>
            {/* Navbar */}
            <header className="fixed top-0 right-0 left-0 z-[1000] h-[80px] border-b border-gray-200 bg-white px-[20px] shadow">
                <div className="container mx-auto flex items-center justify-between px-6 py-4">
                    <div className="text-[20px] font-bold text-gray-800">MITRA KARYA GROUP</div>
                    <nav className="hidden space-x-[24px] text-[14px] font-medium md:flex text-gray-800">
                        <Link href="/" className="hover:text-blue-600">Beranda</Link>
                        <Link href="/job-hiring-landing-page" className="hover:text-blue-600">Lowongan Pekerjaan</Link>
                        <Link href="/about-us" className="hover:text-blue-600">Tentang Kami</Link>
                        <Link href="/contact" className="hover:text-blue-600">Kontak</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-md border border-blue-600 px-[16px] py-[10px] text-[14px] font-medium text-blue-600 hover:bg-blue-50"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="text-sm font-medium text-blue-600 hover:underline">Masuk</Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-md bg-blue-600 px-[16px] py-[10px] text-[14px] text-white hover:bg-blue-700"
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
                id="about"
                className="relative flex h-[80vh] items-center justify-center bg-cover bg-center pt-[80px] text-white"
                style={{ backgroundImage: "url('/images/1.PNG')" }}
            >
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="relative z-10 px-6 text-center">
                    <h1 className="mb-4 text-5xl font-bold">TENTANG KAMI</h1>
                    <p className="mx-auto max-w-2xl text-lg mb-4">
                        Mitra Karya Group adalah perusahaan yang bergerak di bidang teknologi dan layanan inovatif, berkomitmen untuk memberikan solusi terbaik bagi pelanggan di seluruh Indonesia.
                    </p>
                    <p className="mx-auto max-w-2xl text-lg">
                        Kami percaya pada pentingnya inovasi, kualitas sumber daya manusia, dan kontribusi terhadap kemajuan teknologi untuk menciptakan nilai tambah bagi masyarakat dan mitra bisnis kami.
                    </p>
                </div>
            </section>

            {/* Tentang Kami Section */}
            <section className="relative bg-white pt-20 pb-20 text-gray-800">
                <div className="relative z-10 px-6 text-center">
                    <h1 className="mb-4 text-5xl font-bold text-blue-600">MITRA KARYA GROUP</h1>
                    {aboutUsData ? (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-2">Visi</h2>
                            <p className="mb-4">{aboutUsData.vision}</p>
                            <h2 className="text-2xl font-bold mb-2">Misi</h2>
                            <p>{aboutUsData.mission}</p>
                        </div>
                    ) : (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-2">Visi</h2>
                            <p className="mb-4">Loading vision...</p>
                            <h2 className="text-2xl font-bold mb-2">Misi</h2>
                            <p>Loading mission...</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Slider Section */}
            {companies.map(company => (
                <CompanySlider
                    key={company.id}
                    title={company.name}
                    description={company.description}
                    images={['/images/1.PNG', '/images/13.PNG', '/images/12.PNG', '/images/14.PNG', '/images/15.PNG']}
                    infoLink={company.id === 2 ? "https://mikacares.co.id/" : "https://autentik.co.id/"}
                />
            ))}

            {/* Footer */}
            <footer className="bg-[#f6fafe] py-16">
    <div className="container mx-auto grid grid-cols-1 gap-10 px-6 md:grid-cols-3">
        {/* Kolom 1 */}
        <div>
            {companies && companies.length > 0 ? (
                <>
                    <h4 className="mb-2 text-[16px] font-bold text-gray-900">{companies[0].name}</h4>
                    <p className="mb-6 text-sm text-gray-700">
                        {companies[0].description}
                    </p>
                </>
            ) : (
                <>
                    <h4 className="mb-2 text-[16px] font-bold text-gray-900">MITRA KARYA GROUP</h4>
                    <p className="mb-6 text-sm text-gray-700">
                        Kami adalah perusahaan teknologi pintar yang senantiasa berkomitmen untuk memberikan dan meningkatkan kepuasan pelanggan
                    </p>
                </>
            )}
            {/* Social Media Icons */}
            <div className="flex space-x-6 text-xl text-blue-600">
                {/* Instagram - Dropup untuk dua akun */}
                <div className="relative group">
                    <a href="#" className="group-hover:text-blue-800">
                        <i className="fab fa-instagram"></i>
                    </a>
                    <div className="absolute bottom-full left-0 mb-1 bg-white shadow-md rounded-md p-2 hidden group-hover:block z-10 w-40">
                        <a 
                            href="https://www.instagram.com/mikacares.id" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block py-1 px-2 text-sm hover:text-blue-800 hover:bg-gray-50"
                        >
                            @mikacares.id
                        </a>
                        <a 
                            href="https://www.instagram.com/autentik.co.id" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block py-1 px-2 text-sm hover:text-blue-800 hover:bg-gray-50"
                        >
                            @autentik.co.id
                        </a>
                    </div>
                </div>

                {/* LinkedIn - Dropup untuk dua perusahaan */}
                <div className="relative group">
                    <a href="#" className="group-hover:text-blue-800">
                        <i className="fab fa-linkedin-in"></i>
                    </a>
                    <div className="absolute bottom-8 left-0 mb-1 bg-white shadow-lg rounded-lg p-3 hidden group-hover:block z-50 w-72">
                        <div className="flex flex-col gap-3">
                            <a 
                                href="https://www.linkedin.com/company/pt-mitra-karya-analitika" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-md transition-colors"
                            >
                                <i className="fab fa-linkedin text-2xl text-[#0A66C2]"></i>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">PT Mitra Karya Analitika</span>
                                    <span className="text-xs text-gray-500">Follow us on LinkedIn</span>
                                </div>
                            </a>
                            <div className="border-t border-gray-100"></div>
                            <a 
                                href="https://www.linkedin.com/company/pt-autentik-karya-analitika" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-md transition-colors"
                            >
                                <i className="fab fa-linkedin text-2xl text-[#0A66C2]"></i>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">PT Autentik Karya Analitika</span>
                                    <span className="text-xs text-gray-500">Follow us on LinkedIn</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* YouTube */}
                <a href="https://www.youtube.com/@mikacares" target="_blank" rel="noopener noreferrer" className="hover:text-blue-800">
                    <i className="fab fa-youtube"></i>
                </a>

                {/* WhatsApp */}
                <a href="https://wa.me/6281770555554" target="_blank" rel="noopener noreferrer" className="hover:text-blue-800">
                    <i className="fab fa-whatsapp"></i>
                </a>
            </div>
        </div>

        {/* Kolom 2 */}
        <div>
            <h4 className="mb-2 text-[16px] font-bold text-gray-900">Perusahaan Kami</h4>
            <ul className="space-y-1 text-sm text-gray-700">
                {companies && companies.length > 0 ? (
                    companies.map((company) => (
                        <li key={company.id}>{company.name}</li>
                    ))
                ) : (
                    <li>Tidak ada perusahaan untuk ditampilkan</li>
                )}
            </ul>
        </div>

        {/* Kolom 3 */}
        <div>
            <h4 className="mb-4 text-[16px] font-bold text-gray-900">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-700">
                {contacts && (
                    <>
                        <li className="flex items-start gap-2">
                            <i className="fas fa-phone mt-1 text-blue-600" />
                            <div dangerouslySetInnerHTML={{ __html: contacts.phone }} />
                        </li>
                        <li className="flex items-center gap-2">
                            <i className="fas fa-envelope text-blue-600" />
                            <span>{contacts.email}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <i className="fas fa-map-marker-alt mt-1 text-blue-600" />
                            <span dangerouslySetInnerHTML={{ 
                                __html: contacts.address.replace(/\n/g, '<br />') 
                            }} />
                        </li>
                    </>
                )}
            </ul>
        </div>
    </div>
</footer>
        </>
    );
}

// Add proper TypeScript interface
interface AboutUsData {
    id: number;
    company_id: number;
    vision: string;
    mission: string;
    created_at: string;
    updated_at: string;
    company?: {
        id: number;
        name: string;
    };
}

interface AboutUsProps {
    aboutUs: AboutUsData[];
}

// Add prop types validation if needed
AboutUs.propTypes = {
    aboutUs: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            company_id: PropTypes.number.isRequired,
            vision: PropTypes.string.isRequired,
            mission: PropTypes.string.isRequired,
            created_at: PropTypes.string,
            updated_at: PropTypes.string,
            company: PropTypes.shape({
                id: PropTypes.number,
                name: PropTypes.string
            })
        })
    )
};
