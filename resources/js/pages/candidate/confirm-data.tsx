import { faInstagram, faLinkedin, faWhatsapp, faXTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faMapMarkerAlt, faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link, usePage } from "@inertiajs/react";
import axios from 'axios';
import { AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';

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
  const { completeness: initialCompleteness, job_id, flash } = usePage<PageProps>().props;
  const [showAlert, setShowAlert] = useState<boolean>(!!flash?.warning);
  const [localCompleteness, setLocalCompleteness] = useState<Completeness>(initialCompleteness);

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

  // Update useEffect untuk mengecek data saat komponen dimount
  useEffect(() => {
    const checkCompleteness = async () => {
      try {
        const response = await axios.get('/candidate/applicant-completeness');
        console.log('Completeness response:', response.data); // Untuk debugging

        // Update localCompleteness jika ada data baru
        if (response.data.success && response.data.completeness) {
          setLocalCompleteness(response.data.completeness);
        }
      } catch (error) {
        console.error('Error checking completeness:', error);
      }
    };

    checkCompleteness();
  }, []);

  // Tambahkan fungsi untuk refresh data
  const refreshCompleteness = async () => {
    try {
      const response = await axios.get('/candidate/applicant-completeness');
      console.log('Fresh completeness data:', response.data);

      // Update state completeness jika diperlukan
      if (response.data.success) {
        setLocalCompleteness(response.data.completeness);
      }
    } catch (error) {
      console.error('Error refreshing completeness data:', error);
    }
  };

  // Panggil saat komponen dimount
  useEffect(() => {
    refreshCompleteness();
  }, []);

  const sections = [
    {
      title: "Data Pribadi",
      isComplete: localCompleteness?.profile,
      isRequired: true
    },
    {
      title: "Pendidikan",
      isComplete: localCompleteness?.education,
      isRequired: true
    },
    {
      title: "Skills/Kemampuan",
      isComplete: localCompleteness?.skills,
      isRequired: true
    },
    {
      title: "Pengalaman Kerja",
      isComplete: localCompleteness?.work_experience,
      isOptional: true
    },
    {
      title: "Organisasi",
      isComplete: localCompleteness?.organization,
      isOptional: true
    },
    {
      title: "Prestasi",
      isComplete: localCompleteness?.achievements,
      isOptional: true
    },
    {
      title: "Social Media",
      isComplete: localCompleteness?.social_media,
      isOptional: true
    },
    {
      title: "Data Tambahan",
      isComplete: localCompleteness?.additional_data,
      isOptional: true
    }
  ];

  // Log untuk debugging
  console.log('Initial completeness from props:', initialCompleteness);
  console.log('Local completeness state:', localCompleteness);

  // Update pengecekan required sections
  const requiredSections = sections.filter(section => section.isRequired);
  const hasIncompleteRequired = requiredSections.some(section => !section.isComplete);

  // Fungsi untuk mendapatkan warna ikon
  const getIconColor = (isComplete: boolean, isOptional: boolean) => {
    if (isComplete) return "text-green-500"; // Sudah terisi = hijau
    if (isOptional) return "text-yellow-500"; // Opsional belum terisi = kuning
    return "text-red-500"; // Wajib belum terisi = merah
  };

  // Fungsi untuk mengirim aplikasi secara langsung
  const handleApplyNow = async () => {
    if (!job_id || hasIncompleteRequired || !localCompleteness?.overall_complete) {
      return false; // Jangan lanjutkan jika ada data yang belum lengkap
    }

    try {
      // Tampilkan loading state
      const loadingToast = Swal.fire({
        title: 'Memproses Lamaran',
        html: 'Mohon tunggu sebentar...',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Kirim aplikasi ke backend
      const response = await axios.post(`/candidate/apply/${job_id}`, {}, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      loadingToast.close();

      if (response.data.success) {
        // Tampilkan pesan sukses
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: response.data.message || 'Lamaran berhasil dikirim! Anda dapat melihat status lamaran pada menu "Lamaran".',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          // Redirect ke halaman history
          window.location.href = '/candidate/application-history';
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Perhatian',
          text: response.data.message || 'Terjadi kesalahan saat mengirim lamaran.',
          confirmButtonColor: '#3085d6'
        });
      }
    } catch (error) {
      console.error('Error submitting application:', error);

      // Cek jika ada response dengan redirect
      if (error.response && error.response.data && error.response.data.redirect) {
        window.location.href = error.response.data.redirect;
        return;
      }

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Terjadi kesalahan saat mengirim lamaran. Silakan coba lagi.',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  // Log untuk debugging status sections
  console.log('Sections status:', sections.map(s => ({
    title: s.title,
    isComplete: s.isComplete,
    isRequired: s.isRequired
  })));
  console.log('Has incomplete required:', hasIncompleteRequired);

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
          {localCompleteness?.overall_complete && job_id ? (
            <button
              onClick={handleApplyNow}
              className="px-8 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded font-medium mb-10"
              data-job-id={job_id}
            >
              Lamar Sekarang
            </button>
          ) : job_id ? (
            <div className="space-y-4">
              <button
                disabled
                className="px-8 py-2 border border-blue-300 text-blue-800 bg-blue-50 rounded font-medium opacity-60 cursor-not-allowed"
              >
                Lamar Sekarang
              </button>
              <p className="text-sm text-gray-500">
                Lengkapi profil Anda terlebih dahulu untuk melamar pekerjaan ini.
              </p>
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
