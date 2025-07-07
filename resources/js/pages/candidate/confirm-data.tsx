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

interface ApiErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
      redirect?: string;
    };
  };
}

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
    // Pastikan profile sudah lengkap untuk requirement wajib
    if (!job_id || hasIncompleteRequired) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Belum Lengkap',
        text: 'Harap lengkapi data profil wajib terlebih dahulu.',
        confirmButtonColor: '#3085d6'
      });
      return false;
    }

    try {
      // Tampilkan loading state
      Swal.fire({
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

      Swal.close();

      // Jika berhasil, langsung redirect ke application-history
      if (response.data.success) {
        // Tampilkan pesan sukses dan langsung redirect
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: response.data.message || 'Lamaran berhasil dikirim! Anda akan dialihkan ke halaman riwayat lamaran.',
          confirmButtonColor: '#3085d6',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => {
          // Redirect ke halaman history
          window.location.href = '/candidate/application-history';
        });

        // Backup redirect jika SweetAlert gagal
        setTimeout(() => {
          window.location.href = '/candidate/application-history';
        }, 2500);
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Perhatian',
          text: response.data.message || 'Terjadi kesalahan saat mengirim lamaran.',
          confirmButtonColor: '#3085d6'
        });
      }
    } catch (error: unknown) {
      console.error('Error submitting application:', error);
      Swal.close();

      // Cek jika ada response dengan redirect dari backend
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as ApiErrorResponse;
        if (axiosError.response?.data?.redirect) {
          window.location.href = axiosError.response.data.redirect;
          return;
        }

        // Cek jika error 422 (Unprocessable Content) dengan pesan khusus
        if (axiosError.response?.status === 422) {
          const errorMessage = axiosError.response?.data?.message || 'Data profil belum lengkap.';
          Swal.fire({
            icon: 'warning',
            title: 'Data Belum Lengkap',
            text: errorMessage,
            confirmButtonColor: '#3085d6'
          });
          return;
        }

        // Error lainnya dengan response dari server
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: axiosError.response?.data?.message || 'Terjadi kesalahan saat mengirim lamaran. Silakan coba lagi.',
          confirmButtonColor: '#3085d6'
        });
      } else {
        // Error tanpa response (network error, dll)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
          confirmButtonColor: '#3085d6'
        });
      }
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
            <a href="/candidate/dashboard" className="text-gray-900 hover:text-blue-600">Dasbor</a>
            <a href="/candidate/profile" className="text-gray-900 hover:text-blue-600">Profil</a>
            <a href="/candidate/jobs" className="text-gray-900 hover:text-blue-600">Lowongan Pekerjaan</a>
            <a href="/candidate/application-history" className="text-gray-900 hover:text-blue-600">Lamaran</a>
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
          {!hasIncompleteRequired && job_id ? (
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
            <h4 className="mb-2 text-[16px] font-bold">MITRA KARYA GROUP</h4>
            <p className="mb-6 text-sm text-gray-700">
              Kami adalah perusahaan teknologi pintar yang senantiasa berkomitmen untuk memberikan dan meningkatkan kepuasan pelanggan
            </p>
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
            <h4 className="mb-2 text-[16px] font-bold">Perusahaan Kami</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>PT Mitra Karya Analitika</li>
              <li>PT Autentik Karya Analitika</li>
            </ul>
          </div>

          {/* Kolom 3 */}
          <div>
            <h4 className="mb-4 text-[16px] font-bold">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <i className="fas fa-phone mt-1 text-blue-600" />
                <div>+62 817 7055 5554</div>
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-envelope text-blue-600" />
                <span>info@mitrakarya.com</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-map-marker-alt mt-1 text-blue-600" />
                <span>Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ConfirmData;
