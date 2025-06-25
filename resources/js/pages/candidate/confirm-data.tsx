import { faInstagram, faLinkedin, faWhatsapp, faXTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faMapMarkerAlt, faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link, usePage } from "@inertiajs/react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

type Completeness = {
  profile: boolean;
  education: boolean;
  skills: boolean;
  work_experience: boolean;
  organization: boolean;
  achievements: boolean;
  social_media: boolean;
  additional_data: boolean;
  overall_complete: boolean;
};

type PageProps = {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
    } | null;
  };
  completeness: Completeness;
  job_id?: string;
  flash?: {
    warning?: string;
    success?: string;
    error?: string;
  };
};

const ConfirmData = () => {
  const { completeness, job_id, flash } = usePage<PageProps>().props;
  const [showAlert, setShowAlert] = useState<boolean>(!!flash?.warning);

  useEffect(() => {
    if (flash?.warning) {
      setShowAlert(true);

      // Auto-hide alert after 5 seconds
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [flash?.warning]);

  const sections = [
    {
      title: "Data Pribadi",
      isComplete: completeness?.profile,
      isRequired: true
    },
    {
      title: "Pendidikan",
      isComplete: completeness?.education,
      isRequired: true
    },
    {
      title: "Skills/Kemampuan",
      isComplete: completeness?.skills,
      isRequired: true
    },
    {
      title: "Pengalaman Kerja",
      isComplete: completeness?.work_experience,
      isOptional: true
    },
    {
      title: "Organisasi",
      isComplete: completeness?.organization,
      isOptional: true
    },
    {
      title: "Prestasi",
      isComplete: completeness?.achievements,
      isOptional: true
    },
    {
      title: "Social Media",
      isComplete: completeness?.social_media,
      isOptional: true
    },
    {
      title: "Data Tambahan",
      isComplete: completeness?.additional_data,
      isOptional: true
    }
  ];

  // Cek apakah ada data wajib yang belum lengkap
  const hasIncompleteRequired = sections.some(section =>
    section.isRequired && !section.isComplete
  );

  // Fungsi untuk mendapatkan warna ikon
  const getIconColor = (isComplete: boolean, isOptional: boolean) => {
    if (isComplete) return "text-green-500"; // Sudah terisi = hijau
    if (isOptional) return "text-yellow-500"; // Opsional belum terisi = kuning
    return "text-red-500"; // Wajib belum terisi = merah
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Head title="Konfirmasi Data" />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-[80px] border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto flex h-full items-center justify-between px-6">
          <div className="text-[20px] font-bold text-black">MITRA KARYA GROUP</div>
          <nav className="hidden space-x-[24px] text-[14px] font-medium md:flex">
            <Link href="/profile" className="text-black hover:text-blue-600">Profil</Link>
            <Link href="/candidate/jobs" className="text-black hover:text-blue-600">Lowongan Pekerjaan</Link>
            <Link href="/candidate/application-history" className="text-black hover:text-blue-600">Lamaran</Link>
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

        {/* Flash Message */}
        {showAlert && flash?.warning && (
          <div className="mb-6 rounded border border-yellow-400 bg-yellow-50 px-4 py-3 text-center text-sm text-yellow-800">
            {flash.warning}
          </div>
        )}

        {/* Status Kelengkapan Data */}
        {hasIncompleteRequired ? (
          <div className="mb-6 rounded border border-red-500 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            Harap lengkapi profil Anda terlebih lanjut untuk melamar pekerjaan ini.
          </div>
        ) : (
          <div className="mb-6 rounded border border-green-500 bg-green-50 px-4 py-3 text-center text-sm text-green-700">
            Data profil wajib Anda sudah lengkap! Anda dapat melanjutkan proses lamaran.
          </div>
        )}

        {/* All Sections without dropdown */}
        <div className="space-y-3 mb-6">
          {sections.map((section, idx) => {
            const isComplete = section.isComplete;
            const isOptional = section.isOptional || false;
            const Icon = isComplete ? CheckCircle : AlertCircle;
            const iconColor = getIconColor(isComplete, isOptional);

            return (
              <div
                key={idx}
                className="flex items-center w-full px-4 py-3 text-left bg-white border border-gray-200 rounded-md shadow-sm"
              >
                <div className="flex items-center gap-2 flex-1">
                  <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
                  {/* Menggunakan style inline untuk memastikan warna teks konsisten */}
                  <span className="text-sm" style={{ color: '#000000' }}>
                    {section.title}
                    {isOptional && (
                      <span className="ml-2 text-xs text-gray-500">(Opsional)</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lengkapi Profile Button */}
        <div className="text-center mb-6">
          <Link
            href="/profile"
            className="px-8 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded font-medium"
          >
            Lengkapi Profile
          </Link>
        </div>

        {/* Submit Button */}
        <div className="text-center mt-6">
          {completeness?.overall_complete && job_id ? (
            <Link
              href={`/candidate/apply/${job_id}`}
              method="post"
              as="button"
              className="px-8 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded font-medium mb-10"
              data-job-id={job_id}
            >
              Lamar Sekarang
            </Link>
          ) : job_id ? (
            <div className="space-y-4">
              <button
                disabled
                className="px-8 py-2 border border-blue-300 text-blue-800 bg-blue-50 rounded font-medium opacity-60 cursor-not-allowed"
              >
                Lamar Sekarang
              </button>
            </div>
          ) : (
            <Link
              href="/candidate/jobs"
              className="px-8 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded font-medium mb-10"
            >
              Kembali ke Daftar Lowongan
            </Link>
          )}
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
