import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Contact {
    email: string;
    phone: string;
    address: string;
}

interface WelcomeProps {
    vacancies: JobOpening[];
    companies: Company[];
    contacts: Contact | null;
}

interface JobOpening {
    id: number;
    title: string;
    company: {
        name: string;
    };
    department: string;
    location: string;
    type: string;
    benefits: string[];
    requirements: string[];
    endTime: string | null;  // Added for deadline
    isExpired: boolean;      // Added for expired status
}

// Definisi interface untuk Company
interface Company {
    id: number;
    name: string;
    description: string;
    logo: string;
}

const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

export default function Welcome(props: WelcomeProps) {
    // Destructure companies dari props
    const { vacancies, companies } = props;
    const { auth } = usePage<SharedData>().props;

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

    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % backgroundImages.length);
        }, 10000);
        return () => clearInterval(interval);
    }, [backgroundImages.length]);

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=outfit:300,400,500,600" rel="stylesheet" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
            </Head>
            <div className="min-h-screen bg-white text-gray-900">
                {/* Navbar */}
                <header className="fixed top-0 right-0 left-0 z-50 h-[80px] border-b border-gray-200 bg-white px-[20px] shadow">
                    <div className="container mx-auto flex items-center justify-between px-6 py-4">
                        <div className="text-[20px] font-bold text-gray-800">MITRA KARYA GROUP</div>

                        <nav className="hidden space-x-[24px] text-[14px] font-medium md:flex">
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
                <section className="relative h-[1400px] pt-[128px] pb-[80px] text-center text-white">
                    {/* Background image slideshow */}
                    {backgroundImages.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === bgIndex ? 'z-0 opacity-100' : 'z-0 opacity-0'}`}
                            style={{ backgroundImage: `url(${img})` }}
                        />
                    ))}
                    {/* Black overlay */}
                    <div className="absolute inset-0 z-10 bg-black opacity-60" />
                    <div className="relative z-20 container mx-auto flex h-full flex-col items-center justify-center px-6">
                        <h1 className="mb-[16px] text-[36px] font-bold md:text-[56px]">
                            Selamat Datang di E-Recruitment
                            <br />
                            Mitra Karya Group
                        </h1>
                        <p className="mb-[32px] text-[18px]">Temukan Karier Impian Anda Bersama Kami</p>
                        <div className="flex justify-center gap-4">
                            <Link href="/job-hiring-landing-page">
                                <Button
                                    className="rounded-md bg-blue-600 px-[24px] py-[12px] text-white hover:bg-blue-700"
                                    onClick={() => scrollToSection('lowongan')}
                                >
                                    Lihat Lowongan
                                </Button>
                            </Link>
                            <Link href="/about-us">
                                <Button
                                    variant="outline"
                                    className="rounded-md border border-white px-[24px] py-[12px] text-white hover:bg-white hover:text-blue-600"
                                >
                                    Tentang Kami
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Section Kenapa Bergabung dengan Ikon Gambar */}
                <section className="bg-white py-20 text-left">
                    <div className="container mx-auto px-6">
                        <h2 className="mb-[16px] text-center text-[24px] font-bold md:text-[32px]">MENGAPA BERGABUNG DENGAN MITRA KARYA GROUP?</h2>
                        <p className="mx-auto mb-[48px] max-w-[672px] text-center text-[16px] text-gray-600">
                            Kami menawarkan lingkungan kerja yang mendukung, peluang pengembangan karier, serta benefit kompetitif.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {benefitCards.map((card, index) => (
                                <div key={index} className="rounded-lg border border-gray-200 p-6 shadow-sm h-full">
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                            <img src={card.icon} alt="" className="w-full h-full" />
                                        </div>
                                        
                                        <h3 className="text-lg font-semibold mb-3 text-center">
                                            {card.title}
                                        </h3>
                                        
                                        <p className="text-sm text-gray-600 text-center w-full overflow-hidden">
                                            {card.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                {/* Perusahaan Kami & Lowongan */}
                <section className="py-[80px] text-center">
                    <div className="container mx-auto px-6">
                        <h2 className="mb-[40px] text-[24px] font-bold md:text-[32px]">Perusahaan Kami</h2>
                        <div className="mb-[40px] flex flex-col justify-center gap-[60px] md:flex-row">
                            {props.companies && props.companies.length > 0 ? (
                                props.companies.map((company) => (
                                    <div 
                                        key={company.id} 
                                        className="mx-auto flex w-[528px] items-start gap-4 text-left hover:shadow-lg transition-all duration-300 rounded-lg p-4"
                                    >
                                        <img 
                                            src={company.logo}
                                            alt={company.name}
                                            className="mt-1 h-[60px] w-[60px] object-contain" 
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/images/default-company-logo.png';
                                                console.log('Image failed to load:', company.logo);
                                            }}
                                        />
                                        <div>
                                            <h3 className="mb-1 font-semibold">{company.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                {company.description}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500">
                                    Tidak ada perusahaan untuk ditampilkan
                                </div>
                            )}
                        </div>
                        <Link href="/about-us">
                            <Button className="rounded-md border border-blue-600 bg-white px-[24px] py-[12px] text-blue-600 hover:bg-blue-50">
                                Tentang Kami →
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Lowongan Pekerjaan Section */}
                <section className="bg-[#f6fafe] py-[80px] text-center">
                    <div className="container mx-auto px-6">
                        <h2 className="mb-[16px] text-[24px] font-bold md:text-[32px]">LOWONGAN PEKERJAAN TERSEDIA</h2>
                        <p className="mx-auto mb-[40px] max-w-[672px] text-[16px] text-gray-600">
                            Temukan posisi yang sesuai dengan minat dan keahlian Anda di PT Mitra Karya Analitika. 
                            Kami membuka peluang karier di berbagai bidang.
                        </p>
                        <div className="mb-[40px] grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {props.vacancies && props.vacancies.length > 0 ? (
                                props.vacancies.map((job) => (
                                    <div
                                        key={job.id}
                                        className="mx-auto flex h-auto w-full max-w-[400px] flex-col rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm hover:shadow-md transition-shadow duration-300"
                                    >
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-semibold">{job.title}</h3>
                                                <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600">
                                                    {job.department}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                                <span>{job.company.name}</span>
                                                <span>•</span>
                                                <span>{job.location}</span>
                                                {job.endTime && (
                                                    <>
                                                        <span>•</span>
                                                        <span className={job.isExpired ? 'text-red-600' : 'text-green-600'}>
                                                            Lamar sebelum: {job.endTime}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="mb-4">
                                            {job.requirements && (
                                                <div>
                                                    <h4 className="text-sm font-semibold mb-1">Persyaratan:</h4>
                                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                                        {Array.isArray(job.requirements) 
                                                            ? job.requirements.slice(0, 3).map((req, idx) => (
                                                                <li key={idx}>{req}</li>
                                                            ))
                                                            : typeof job.requirements === 'string'
                                                                ? JSON.parse(job.requirements).slice(0, 3).map((req: string, idx: number) => (
                                                                    <li key={idx}>{req}</li>
                                                                ))
                                                                : <li>No requirements specified</li>
                                                        }
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto">
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                                                    {job.type}
                                                </span>
                                            </div>
                                            
                                            <Link href={`/jobs/${job.id}`}>
                                                <Button className="w-full rounded bg-blue-600 py-2 text-sm text-white hover:bg-blue-700">
                                                    Lihat Detail
                                                </Button>
                                            </Link>
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
                            <Button className="rounded-md bg-blue-100 px-6 py-3 text-blue-600 hover:bg-blue-200">
                                Lihat Semua Lowongan →
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Cara Mendaftar */}
                <section className="bg-white py-[80px] text-center">
                    <div className="relative container mx-auto px-6">
                        <h2 className="mb-4 text-[24px] font-bold md:text-[32px]">Cara Mendaftar</h2>
                        <p className="mx-auto mb-16 max-w-[768px] text-[16px] text-gray-600">
                            Mohon persiapkan terlebih dahulu seluruh data pribadi Anda termasuk pendidikan, pengalaman kerja, organisasi, serta data
                            penunjang lainnya
                        </p>

                        {/* Wrapper dengan garis horizontal */}
                        {/* Wrapper dengan garis horizontal dibatasi antara step 1 dan step 4 */}
                        <div className="relative grid grid-cols-1 items-start gap-10 md:grid-cols-4">
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
                                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-violet-500 font-bold text-white">
                                        {step.number}
                                    </div>
                                    <h3 className="mb-2 text-[16px] font-semibold">{step.title}</h3>
                                    <p className="max-w-[240px] text-sm text-gray-600">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-[80px]">
                    <div className="container mx-auto px-6">
                        <div className="relative overflow-hidden rounded-[24px] bg-black">
                            <img src="/images/siap-bergabung.png" alt="Bergabung" className="h-[300x] w-full object-cover opacity-60" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
                                <h2 className="mb-4 text-[28px] font-bold md:text-[36px]">Siap untuk Bergabung?</h2>
                                <p className="mb-6 max-w-[560px] text-[14px] md:text-[16px]">
                                    Jangan lewatkan kesempatan untuk menjadi bagian dari tim PT Mitra Karya Analitika.
                                </p>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <Link href="/job-hiring-landing-page">
                                        <Button className="rounded-md bg-white px-6 py-3 text-blue-600 hover:bg-blue-50">Lihat Lowongan</Button>
                                    </Link>
                                    <Link href="/about-us">
                                        <Button className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">Tentang Kami</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-[#f6fafe] py-16">
                    <div className="container mx-auto grid grid-cols-1 gap-10 px-6 md:grid-cols-3">
                        {/* Kolom 1 */}
                        <div>
                            {props.companies && props.companies.length > 0 ? (
                                <>
                                    <h4 className="mb-2 text-[16px] font-bold">{props.companies[0].name}</h4>
                                    <p className="mb-6 text-sm text-gray-700">
                                        {props.companies[0].description}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h4 className="mb-2 text-[16px] font-bold">MITRA KARYA GROUP</h4>
                                    <p className="mb-6 text-sm text-gray-700">
                                        Kami adalah perusahaan teknologi pintar yang senantiasa berkomitmen untuk memberikan dan meningkatkan kepuasan pelanggan
                                    </p>
                                </>
                            )}
                            <div className="flex space-x-6 text-xl text-blue-600">
                                {/* Instagram - Dropdown untuk dua akun */}
                                <div className="relative group">
                                    <a href="#" className="group-hover:text-blue-800">
                                        <i className="fab fa-instagram"></i>
                                    </a>
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white shadow-md rounded-md p-2 hidden group-hover:block z-10 w-48">
                                        <a href="https://www.instagram.com/mikacares.id" target="_blank" rel="noopener noreferrer" 
                                           className="block py-1 hover:text-blue-800">
                                            @mikacares.id
                                        </a>
                                        <a href="https://www.instagram.com/autentik.co.id" target="_blank" rel="noopener noreferrer"
                                           className="block py-1 hover:text-blue-800">
                                            @autentik.co.id
                                        </a>
                                    </div>
                                </div>

                                {/* LinkedIn - Dropdown untuk dua perusahaan */}
                                <div className="relative group">
                                    <a href="#" className="group-hover:text-blue-800">
                                        <i className="fab fa-linkedin-in"></i>
                                    </a>
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white shadow-md rounded-md p-2 hidden group-hover:block z-10 w-64">
                                        <a href="https://www.linkedin.com/company/pt-mitra-karya-analitika" target="_blank" rel="noopener noreferrer" 
                                           className="block py-1 hover:text-blue-800">
                                            PT Mitra Karya Analitika
                                        </a>
                                        <a href="https://www.linkedin.com/company/pt-autentik-karya-analitika" target="_blank" rel="noopener noreferrer"
                                           className="block py-1 hover:text-blue-800">
                                            PT Autentik Karya Analitika
                                        </a>
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
                            <h4 className="mb-2 text-[16px] font-bold">Perusahaan Kami</h4>
                            <ul className="space-y-1 text-sm text-gray-700">
                                {props.companies && props.companies.length > 0 ? (
                                    props.companies.map((company) => (
                                        <li key={company.id}>{company.name}</li>
                                    ))
                                ) : (
                                    <li>Tidak ada perusahaan untuk ditampilkan</li>
                                )}
                            </ul>
                        </div>

                        {/* Kolom 3 */}
                        <div>
                            <h4 className="mb-4 text-[16px] font-bold">Contact</h4>
                            <ul className="space-y-2 text-sm text-gray-700">
                                {props.contacts && (
                                    <>
                                        <li className="flex items-start gap-2">
                                            <i className="fas fa-phone mt-1 text-blue-600" />
                                            <div dangerouslySetInnerHTML={{ __html: props.contacts.phone }} />
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <i className="fas fa-envelope text-blue-600" />
                                            <span>{props.contacts.email}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fas fa-map-marker-alt mt-1 text-blue-600" />
                                            <span dangerouslySetInnerHTML={{ 
                                                __html: props.contacts.address.replace(/\n/g, '<br />') 
                                            }} />
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
