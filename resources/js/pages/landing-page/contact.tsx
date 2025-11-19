import React from 'react';
import { type SharedData } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { ChevronRight, Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { route } from 'ziggy-js';
import Swal from 'sweetalert2';

interface Contact {
    id: number;
    email: string;
    phone: string;
    address: string;
}

interface PageProps {
    contacts: Contact[];
    companies?: {
        id: number;
        name: string;
        description: string;
    }[];
}

export default function ContactPage({ contacts, companies }: PageProps) {
  const { auth } = usePage<SharedData>().props as SharedData;
  const [showDropdown, setShowDropdown] = React.useState(false);

  return (
    <>
      <Head title="Kontak" />
      <div className="min-h-screen bg-white text-gray-900">
        <header className="fixed top-0 right-0 left-0 z-50 h-[80px] border-b border-gray-200 bg-white/95 backdrop-blur-sm px-[20px] shadow-sm">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              MITRA KARYA GROUP
            </Link>
            <nav className="hidden space-x-8 text-sm font-medium md:flex text-gray-700">
              <Link href="/" className="hover:text-blue-600 transition-colors">Beranda</Link>
              <Link href="/job-hiring-landing-page" className="hover:text-blue-600 transition-colors">Lowongan Pekerjaan</Link>
              <Link href="/about-us" className="hover:text-blue-600 transition-colors">Tentang Kami</Link>
              <Link href="/contact" className="text-blue-600 font-semibold">Kontak</Link>
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
        <section className="relative flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-50 pt-[100px] pb-20">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
            <div className="mb-3 inline-block rounded-full bg-blue-100 px-3 py-1.5">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Hubungi Kami</span>
            </div>
            <h1 className="mb-5 text-3xl font-bold text-gray-900 drop-shadow-sm md:text-4xl lg:text-5xl">
              Mari Berbicara
              <span className="block text-blue-700 drop-shadow-sm">Bersama Kami</span>
            </h1>
            <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-gray-700 md:text-base">
              Kami siap membantu menjawab pertanyaan Anda. Tim kami akan merespons secepat mungkin.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-white py-16 px-4">
          <div className="mx-auto max-w-2xl">
            {/* Contact Form */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
              <div className="mb-6 text-center">
                <div className="mb-3 inline-flex items-center justify-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Kirim Pesan</h2>
                </div>
                <p className="text-base text-gray-600">
                  Isi formulir di bawah ini dan kami akan menghubungi Anda secepat mungkin.
                </p>
              </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      
                      const form = e.currentTarget;
                      const formData = new FormData(form);
                      
                      router.post('/contact/submit', {
                        name: formData.get('name') as string,
                        email: formData.get('email') as string,
                        message: formData.get('message') as string,
                      }, {
                        onSuccess: () => {
                          Swal.fire({
                            icon: 'success',
                            title: 'Pesan Berhasil Dikirim!',
                            text: 'Terima kasih telah menghubungi kami. Kami akan merespons secepat mungkin.',
                            showConfirmButton: false,
                            timer: 2000
                          });
                          form.reset();
                        },
                        onError: () => {
                          Swal.fire({
                            icon: 'error',
                            title: 'Terjadi Kesalahan',
                            text: 'Silakan coba lagi atau hubungi kami melalui email/telepon.',
                            confirmButtonText: 'Tutup'
                          });
                        }
                      });
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        placeholder="Masukkan nama lengkap Anda"
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        placeholder="nama@email.com"
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Pesan <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        placeholder="Tuliskan pesan Anda di sini..."
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="group w-full rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <span className="flex items-center justify-center gap-2">
                        Kirim Pesan
                        <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </button>
                  </form>
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
                        {companies && companies.length > 0 ? (
                            companies.map((company) => (
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
                        {contacts && contacts.length > 0 ? (
                            <>
                                <li className="flex items-start gap-3">
                                    <i className="fas fa-phone mt-1 text-blue-400 flex-shrink-0" />
                                    <div className="text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: contacts[0].phone }} />
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fas fa-envelope mt-1 text-blue-400 flex-shrink-0" />
                                    <a 
                                        href={`mailto:${contacts[0].email}`}
                                        className="text-gray-400 hover:text-white transition-colors break-all"
                                    >
                                        {contacts[0].email}
                                    </a>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fas fa-map-marker-alt mt-1 text-blue-400 flex-shrink-0" />
                                    <span className="text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ 
                                        __html: contacts[0].address.replace(/\n/g, '<br />') 
                                    }} />
                                </li>
                            </>
                        ) : (
                            <>
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
                            </>
                        )}
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
