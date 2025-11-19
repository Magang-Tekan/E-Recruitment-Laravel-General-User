import React, { useEffect, useCallback, useState } from 'react';
import { ChevronRight, MapPin, Clock, Calendar, Users, GraduationCap, Building2, Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import { SharedData } from '@/types';
import { Link, usePage, router, Head } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Job {
  id: number;
  title: string;
  company: {
    name: string;
    id: number | null;
  };
  description?: string;
  location: string;
  type: string | { name: string };
  deadline?: string;
  department: string | { name: string };
  requirements?: string[] | string;
  benefits?: string[] | string;
  salary?: string | null;
  major_id?: number | null;
  major_name?: string | null;
  major_names?: string[];
  major_ids?: number[];
  endTime?: string | null;
  isExpired?: boolean;
}

interface Recommendation {
  vacancy: Job;
  score: number;
}

interface Company {
  id: number;
  name: string;
  description: string;
}

interface Contact {
  email: string;
  phone: string;
  address: string;
}

interface Props {
  jobs?: Job[];
  recommendations?: Recommendation[];
  companies?: Company[];
  footerCompanies?: {
    id: number;
    name: string;
  }[];
  candidateMajor?: string;
  contacts?: Contact | null;
}

const JobHiring: React.FC<Props> = ({ 
  jobs = [], 
  recommendations: initialRecommendations = [], 
  companies = [],
  footerCompanies = [],
  contacts = null,
  candidateMajor 
}) => {
  const [recommendations] = useState<Recommendation[]>(initialRecommendations || []);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(jobs || []);
  const { auth } = usePage<SharedData>().props;

  // Get unique company names for filter
  const uniqueCompanyNames = Array.from(new Set((companies || []).map(company => company.name)));

  const filterJobs = useCallback((company: string) => {
    setActiveFilter(company);

    // Update URL with company filter
    const url = new URL(window.location.href);
    if (company === 'all') {
      url.searchParams.delete('company');
    } else {
      url.searchParams.set('company', company);
    }
    window.history.pushState({}, '', url.toString());

    // Filter jobs
    if (company === 'all') {
      setFilteredJobs(jobs || []);
    } else {
      const filtered = (jobs || []).filter(job => {
        const companyName = typeof job.company === 'object' ? job.company?.name : job.company;
        return companyName === company;
      });
      setFilteredJobs(filtered);
    }
  }, [jobs]);

  // Add effect to handle initial filter from URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const companyFilter = urlParams.get('company');
    if (companyFilter) {
      filterJobs(companyFilter);
    }
  }, [filterJobs]);

  // Function to handle job detail navigation
  const handleJobDetailClick = (jobId: number) => {
    try {
      router.visit(route('candidate.job.detail', { id: jobId }));
    } catch (error) {
      router.visit(`/candidate/job/${jobId}`);
    }
  };

  // Helper function to parse job data
  const parseJobData = (data: any): string[] => {
    if (Array.isArray(data)) {
      return data;
    } else if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return [data];
      }
    }
    return [];
  };

  // Helper function to get job type
  const getJobType = (type: string | { name: string }): string => {
    return typeof type === 'object' ? type?.name || 'Unknown' : type || 'Unknown';
  };

  // Helper function to get department
  const getDepartment = (department: string | { name: string }): string => {
    return typeof department === 'object' ? department?.name || 'Unknown' : department || 'Unknown';
  };

  // Helper function to render job card
  const renderJobCard = (job: Job, isRecommendation: boolean = false) => {
    const reqArray = parseJobData(job.requirements);
    const jobType = getJobType(job.type);
    const department = getDepartment(job.department);
    const companyName = typeof job.company === 'object' ? job.company?.name : job.company || 'Unknown Company';
    const isExpired = job.isExpired || false;

    return (
      <div
        key={job.id}
        className={`group relative overflow-hidden rounded-2xl bg-white transition-all duration-300 ${
          isExpired
            ? 'border border-gray-200 opacity-60'
            : 'border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-xl'
        }`}
      >
        {/* Top accent bar */}
        {!isExpired && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600"></div>
        )}
        
        <div className="p-6">
          <div className="space-y-5">
            {/* Header Section: Title, Company, Badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="mb-2 text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {job.title}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                    <Building2 className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 truncate">{companyName}</span>
                </div>
              </div>
              {isExpired && (
                <span className="flex-shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-600">
                  Berakhir
                </span>
              )}
              {isRecommendation && !isExpired && (
                <span className="flex-shrink-0 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Rekomendasi
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed text-gray-600 line-clamp-2">
              {job.description && job.description.length > 120
                ? `${job.description.substring(0, 120)}...`
                : job.description || 'Deskripsi tidak tersedia'}
            </p>

            {/* Requirements & Majors Section */}
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Requirements Preview */}
              {reqArray.length > 0 && (
                <div className="flex-1 rounded-lg border border-gray-200 bg-white p-3 min-w-0">
                  <h4 className="mb-2 text-xs font-semibold text-gray-900">Persyaratan</h4>
                  <ul className="space-y-1.5">
                    {reqArray.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600"></span>
                        <span className="break-words">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Major Tags */}
              {(job.major_names && job.major_names.length > 0) || job.major_name ? (
                <div className="flex-shrink-0 rounded-lg border border-gray-200 bg-white p-3 sm:w-48">
                  <div className="mb-2 flex items-center gap-2">
                    <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                    <h4 className="text-xs font-semibold text-gray-900">Jurusan</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.major_names && job.major_names.length > 0 ? (
                      job.major_names.slice(0, 2).map((majorName, index) => (
                        <span
                          key={index}
                          className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                        >
                          {majorName}
                        </span>
                      ))
                    ) : job.major_name ? (
                      <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {job.major_name}
                      </span>
                    ) : null}
                    {job.major_names && job.major_names.length > 2 && (
                      <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        +{job.major_names.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Job Details Grid */}
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 sm:grid-cols-4">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 truncate">Lokasi</p>
                  <p className="text-xs font-medium text-gray-900 truncate">{job.location || 'Tidak tersedia'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                  <Clock className="h-3.5 w-3.5 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 truncate">Tipe</p>
                  <p className="text-xs font-medium text-gray-900 truncate">{jobType}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100">
                  <Users className="h-3.5 w-3.5 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 truncate">Departemen</p>
                  <p className="text-xs font-medium text-gray-900 truncate">{department}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100">
                  <Calendar className="h-3.5 w-3.5 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 truncate">Deadline</p>
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {job.deadline || job.endTime
                      ? job.isExpired
                        ? 'Berakhir'
                        : job.endTime
                        ? new Date(job.endTime).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })
                        : job.deadline
                      : 'Terbuka'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Section: Button */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isExpired) {
                    handleJobDetailClick(job.id);
                  }
                }}
                disabled={isExpired}
                className={`group/btn flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 sm:w-auto ${
                  isExpired
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl hover:scale-105 active:scale-95'
                }`}
              >
                {isExpired ? (
                  'Lowongan Berakhir'
                ) : (
                  <>
                    Lihat Detail
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head title="Lowongan Pekerjaan" />
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
              <Link href="/candidate/jobs" className="text-blue-600 font-semibold">Lowongan Pekerjaan</Link>
              <Link href="/candidate/application-history" className="hover:text-blue-600 transition-colors">Lamaran</Link>
            </nav>
            <div className="flex items-center gap-4">
              {auth?.user && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-semibold">
                      {auth.user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
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
              <span className="text-xs font-semibold uppercase tracking-wider text-white drop-shadow-md">Lowongan Pekerjaan</span>
            </div>
            <h1 className="mb-5 text-3xl font-bold leading-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl">
              Temukan Karier Impian Anda
              <span className="block text-blue-200 drop-shadow-md">Bersama Kami</span>
            </h1>
            <p className="mx-auto mb-6 max-w-3xl text-sm font-medium leading-relaxed text-white drop-shadow-md md:text-base">
              Bergabunglah dengan tim profesional dan berkembang bersama perusahaan teknologi terdepan. 
              Jelajahi berbagai peluang karier yang sesuai dengan passion dan keahlian Anda.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 backdrop-blur-sm shadow-lg">
                <Briefcase className="h-4 w-4 text-blue-200" />
                <span className="text-xs font-semibold text-white">Berbagai Posisi Terbuka</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 backdrop-blur-sm shadow-lg">
                <Building2 className="h-4 w-4 text-blue-200" />
                <span className="text-xs font-semibold text-white">Perusahaan Terpercaya</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 backdrop-blur-sm shadow-lg">
                <Users className="h-4 w-4 text-blue-200" />
                <span className="text-xs font-semibold text-white">Tim Profesional</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-4">
            <div className="mx-auto max-w-5xl">
              <div className="mb-12 text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2">
                  <Sparkles className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-700">Rekomendasi Untuk Anda</span>
                </div>
                <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
                  Rekomendasi Pekerjaan
                </h2>
                {candidateMajor && (
                  <p className="mx-auto max-w-2xl text-lg text-gray-600">
                    Berdasarkan jurusan Anda: <span className="font-semibold text-blue-600">{candidateMajor}</span>
                  </p>
                )}
              </div>

              <div className="space-y-4">
                {recommendations.map(({ vacancy }) => renderJobCard(vacancy, true))}
              </div>
            </div>
          </section>
        )}

        {/* All Jobs Section */}
        <section className={`bg-white py-20 px-4 ${recommendations.length > 0 ? '' : 'pt-20'}`}>
          <div className="mx-auto max-w-5xl">
            {/* Section Header */}
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
                Semua Lowongan
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                Pilih posisi yang sesuai dengan keahlian dan minat Anda. Setiap peluang adalah langkah menuju karier yang lebih baik.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => filterJobs('all')}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  activeFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                Semua Lowongan
              </button>
              {uniqueCompanyNames.map((companyName) => (
                <button
                  key={companyName}
                  onClick={() => filterJobs(companyName)}
                  className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    activeFilter === companyName
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {companyName}
                </button>
              ))}
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {filteredJobs.length === 0 ? (
                <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-gray-200">
                  <Briefcase className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">Tidak Ada Lowongan Tersedia</h3>
                  <p className="text-gray-600">
                    Saat ini tidak ada lowongan yang sesuai dengan filter yang dipilih. Coba pilih filter lain atau kunjungi kembali nanti.
                  </p>
                </div>
              ) : (
                filteredJobs.map((job) => renderJobCard(job, false))
              )}
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
                {footerCompanies && footerCompanies.length > 0 ? (
                  footerCompanies.map((company) => (
                    <li key={company.id}>
                      <span className="text-sm text-gray-400 transition-colors hover:text-white">
                        {company.name}
                      </span>
                    </li>
                  ))
                ) : (
                  <>
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

            {/* Kolom 3: Kontak */}
            <div>
              <h4 className="mb-6 text-lg font-bold text-white">Hubungi Kami</h4>
              <ul className="space-y-4 text-sm">
                {contacts ? (
                  <>
                    <li className="flex items-start gap-3">
                      <i className="fas fa-phone mt-1 text-blue-400 flex-shrink-0" />
                      <div 
                        className="text-gray-400 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: contacts.phone }}
                      />
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
                      <span 
                        className="text-gray-400 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: contacts.address.replace(/\n/g, '<br />') }}
                      />
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

export default JobHiring;
