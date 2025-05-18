import React from "react";
import { ChevronRight, AlertCircle } from "lucide-react";
import { Head, Link, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faXTwitter, faLinkedin, faYoutube, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faPhone, faEnvelope, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';

type User = {
  id: number;
  name: string;
  email: string;
};

type PageProps = {
  auth: {
    user: User | null;
  };
};

const ConfirmData = () => {
  const { props } = usePage<PageProps>();
  const auth = props.auth;
  const sections = [
    "Data Pribadi",
    "Pendidikan",
    "Pengalaman Kerja",
    "Organisasi",
    "Prestasi",
    "Social Media",
    "Data Tambahan",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Head title="Konfirmasi Data" />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-[80px] border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto flex h-full items-center justify-between px-6">
          <div className="text-[20px] font-bold text-black">MITRA KARYA GROUP</div>
          <nav className="hidden space-x-[24px] text-[14px] font-medium md:flex">
            <Link href="/dashboard" className="text-black hover:text-blue-600">Dasbor</Link>
            <Link href="/profile" className="text-black hover:text-blue-600">Profil</Link>
            <Link href="/lowongan" className="text-black hover:text-blue-600">Lowongan Pekerjaan</Link>
            <Link href="/lamaran" className="text-black hover:text-blue-600">Lamaran</Link>
          </nav>
        <div className="flex items-center">
            <a href="#" className="block w-[40px] h-[40px]">
                <img
                    src="/images/profile-icon.png"
                    alt="User Profile"
                    className="w-full h-full object-cover"
                />
            </a>
        </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 pt-[100px] px-4 max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-600 text-center mb-2">
          Konfirmasi Kelengkapan Data
        </h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Sebelum melamar pekerjaan ini, pastikan Anda telah melengkapi data pada profil Anda
        </p>

        {/* Checklist Sections */}
        <div className="space-y-3">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center border border-gray-300 rounded-md px-4 py-3 bg-white shadow-sm"
            >
              <div className="flex items-center gap-2 text-sm text-black">
                <ChevronRight className="w-4 h-4 text-gray-600" />
                <span>{section}</span>
              </div>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          ))}
        </div>

        {/* Warning Alert */}
        <div className="mt-6 rounded border border-red-500 bg-red-50 px-4 py-2 text-center text-sm text-red-700">
          Harap lengkapi profil Anda terlebih lanjut untuk melamar pekerjaan ini.
        </div>

        {/* Submit Button */}
        <div className="text-center mt-6">
          <button
            className="px-8 py-2 border border-blue-300 text-blue-800 bg-blue-50 hover:bg-blue-100 rounded font-medium mb-10"
            disabled
          >
            Lamar
          </button>
        </div>
      </main>

{/* Footer */}
<footer className="bg-[#f6fafe] py-16">
    <div className="container mx-auto grid grid-cols-1 gap-10 px-6 md:grid-cols-3">
        {/* Kolom 1 */}
        <div>
            <h4 className="mb-2 text-[16px] font-bold text-black">PT MITRA KARYA ANALITIKA</h4>
            <p className="mb-6 text-sm text-gray-700">
                Kami adalah perusahaan teknologi pintar yang senantiasa berkomitmen untuk memberikan dan meningkatkan kepuasan pelanggan
            </p>
            <div className="flex space-x-4 text-xl text-blue-600">
                <a href="#"><FontAwesomeIcon icon={faInstagram} /></a>
                <a href="#"><FontAwesomeIcon icon={faXTwitter} /></a>
                <a href="#"><FontAwesomeIcon icon={faLinkedin} /></a>
                <a href="#"><FontAwesomeIcon icon={faYoutube} /></a>
                <a href="#"><FontAwesomeIcon icon={faWhatsapp} /></a>
            </div>
        </div>

        {/* Kolom 2 */}
        <div>
            <h4 className="mb-2 text-[16px] font-bold text-black">Perusahaan Kami</h4>
            <ul className="space-y-1 text-sm text-gray-700">
                <li>PT MITRA KARYA ANALITIKA</li>
                <li>PT AUTENTIK KARYA ANALITIKA</li>
            </ul>
        </div>

        {/* Kolom 3 */}
        <div>
            <h4 className="mb-4 text-[16px] font-bold text-black">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                    <FontAwesomeIcon icon={faPhone} className="mt-1 text-blue-600" />
                    <div>
                        Rudy Alfiansyah: 082137384029
                        <br />
                        Deden Dermawan: 081807700111
                    </div>
                </li>
                <li className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faEnvelope} className="text-blue-600" />
                    <span>autentik.info@gmail.com</span>
                </li>
                <li className="flex items-start gap-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-1 text-blue-600" />
                    <span>
                        Jl. Klipang Ruko Amsterdam No.9E, Sendangmulyo,
                        <br />
                        Kec. Tembalang, Kota Semarang, Jawa Tengah 50272
                    </span>
                </li>
            </ul>
        </div>
    </div>
</footer>

    </div>
  );
};

export default ConfirmData;
