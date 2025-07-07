import { router } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    background: #fff !important;
  }
`;

interface Job {
  id: number;
  title: string;
  company: {
    name: string;
  };
  description?: string;
  location: string;
  type: string | { name: string };
  deadline?: string;
  department: string | { name: string };
}

interface Recommendation {
  vacancy: Job;
  score: number;
}

interface Props {
  jobs?: Job[];
  recommendations?: Recommendation[];
  companies?: string[];
  candidateMajor?: string;
}

const PageWrapper = styled.div`
  background: #fff;
  min-height: 100vh;
  padding-bottom: 40px;
`;

const JobHiringContainer = styled.div`
  margin: 0 auto;
`;

const HeroSection = styled.div`
  width: 100%;
  height: 500px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
              url('/images/team-celebration.png') center/cover no-repeat;
`;

const HeroContent = styled.div`
  color: white;
  z-index: 1;
`;

const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
`;

const HeroSubtitle = styled.p`
  font-size: 18px;
  opacity: 0.9;
`;

const ContentContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Title = styled.h2`
  color: #0088FF;
  font-size: 32px;
  font-weight: 600;
  text-align: left;
  margin: 40px 0 16px;
`;

const Underline = styled.div`
  width: 80px;
  height: 4px;
  background: #0088FF;
  border-radius: 2px;
  margin: 0 0 32px;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  margin-bottom: 24px;
`;

interface FilterButtonProps {
  $active?: boolean; // Gunakan $ prefix untuk transient prop
}

const FilterButton = styled.button<FilterButtonProps>`
  background: ${(props) => (props.$active ? '#0088FF' : '#fff')};
  color: ${(props) => (props.$active ? '#fff' : '#0088FF')};
  border: 1px solid #0088FF;
  border-radius: 20px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${(props) => (props.$active ? '#0077E6' : '#E6F4FF')};
  }
`;

const JobCard = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.07);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border: 1px solid #e5e7eb;
`;

const JobInfo = styled.div`
  flex: 1;
`;

const JobTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 700;
  color: #222;
`;

const Company = styled.p`
  margin: 0 0 12px 0;
  color: #222;
  font-weight: 700;
  font-size: 15px;
`;

const Description = styled.p`
  margin: 0 0 18px 0;
  color: #555;
  font-size: 15px;
`;

const JobDetails = styled.div`
  display: flex;
  flex-wrap: wrap;  // Mengganti flex-wrap menjadi nowrap
  align-items: center;
  gap: 16px;
  color: #657786;
  font-size: 14px;
  margin-bottom: 0;
  flex-direction: row;
  justify-content: flex-start;

  span {
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;  // Menambahkan white-space nowrap
  }
`;

const DetailButton = styled.button`
  background: #1DA1F2;
  color: #fff;
  border: none;
  padding: 10px 28px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  margin-left: 32px;
  transition: background 0.2s;

  &:hover {
    background: #1a91da;
  }
`;

// const ScoreBadge = styled.span`
//   background-color: #FFF8E1;
//   color: #FFA000;
//   padding: 4px 8px;
//   border-radius: 4px;
//   font-weight: 600;
//   display: inline-flex;
//   align-items: center;
// `;

const JobHiring: React.FC<Props> = ({ jobs = [], recommendations: initialRecommendations = [], companies = [], candidateMajor }) => {
  const [recommendations] = useState<Recommendation[]>(initialRecommendations || []);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(jobs || []);

  useEffect(() => {
    // Set CSRF token for all AJAX requests
    const token = document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
      axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
    }
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredJobs(jobs || []);
    } else {
      setFilteredJobs((jobs || []).filter(job => job?.company?.name === activeFilter));
    }
  }, [activeFilter, jobs]);

  const filterJobs = (filter: string) => {
    setActiveFilter(filter);
  };

  // Function untuk navigasi dengan CSRF yang aman
  const navigateToJobDetail = (jobId: number) => {
    // Pastikan token CSRF tersedia sebelum navigasi
    const token = document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
      axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
    }

    router.visit(`/candidate/job/${jobId}`);
  };

  // Hilangkan duplikat nama perusahaan
  const uniqueCompanies = Array.from(new Set(companies || []));

  return (
    <>
      <GlobalStyle />
      {/* Custom Header for Candidate Pages */}
      <header className="fixed top-0 right-0 left-0 z-50 h-[80px] border-b border-gray-200 bg-white px-[20px] shadow">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="text-[20px] font-bold text-gray-800">MITRA KARYA GROUP</div>

          <nav className="hidden space-x-[24px] text-[14px] font-medium md:flex">
            <a href="/candidate/dashboard" className="text-gray-900 hover:text-blue-600">
              Dasbor
            </a>
            <a href="/candidate/profile" className="text-gray-900 hover:text-blue-600">
              Profil
            </a>
            <a href="/candidate/jobs" className="text-gray-900 hover:text-blue-600">
              Lowongan Pekerjaan
            </a>
            <a href="/candidate/application-history" className="text-gray-900 hover:text-blue-600">
              Lamaran
            </a>
          </nav>
          <div className="flex items-center gap-4">
            {/* User menu can be added here */}
          </div>
        </div>
      </header>
      <PageWrapper>
        <JobHiringContainer>
          <HeroSection>
            <HeroContent>
              <HeroTitle>Bergabunglah Bersama Kami</HeroTitle>
              <HeroSubtitle>
                Telusuri berbagai peluang karir dan berkembang bersama PT Mitra Karya Analitika
              </HeroSubtitle>
            </HeroContent>
          </HeroSection>
          <ContentContainer>
            {/* Rekomendasi Section */}
            <Title>Rekomendasi Pekerjaan Untuk Anda</Title>
            <Underline />
            {candidateMajor && (
              <Description>
                Berdasarkan jurusan Anda: <b>{candidateMajor}</b>
              </Description>
            )}
            {(recommendations || []).length === 0 ? (
              <JobCard>
                <JobInfo>
                  <JobTitle>Tidak ada rekomendasi yang cocok.</JobTitle>
                  <Description>
                    Belum ada lowongan yang sesuai dengan jurusan Anda saat ini.
                  </Description>
                </JobInfo>
              </JobCard>
            ) : (
              recommendations.map(({ vacancy }) => (
                <JobCard key={vacancy.id}>
                  <JobInfo>
                    <JobTitle>{vacancy.title}</JobTitle>
                    <Company>{vacancy.company?.name || 'Unknown Company'}</Company>
                    <Description>{vacancy.description || 'No description available'}</Description>
                    <JobDetails>
                      <span>🏢 {vacancy.location || 'No location'}</span>
                      <span>🕒 {typeof vacancy.type === 'object' ? vacancy.type?.name : vacancy.type}</span>
                      <span>📅 {vacancy.deadline || 'Open'}</span>
                      <span>👥 {typeof vacancy.department === 'object' ? vacancy.department?.name : vacancy.department}</span>
                      {/* <ScoreBadge>⭐ Score: {score}</ScoreBadge> */}
                    </JobDetails>
                  </JobInfo>
                  <DetailButton onClick={() => navigateToJobDetail(vacancy.id)}>
                    Lihat Detail
                  </DetailButton>
                </JobCard>
              ))
            )}

            {/* Semua Lowongan Section */}
            <Title>Open Positions</Title>
            <Underline />
            <FilterContainer>
              {/* PERBAIKAN: Gunakan $active sebagai pengganti active */}
              <FilterButton
                $active={activeFilter === 'all'}
                onClick={() => filterJobs('all')}
              >
                View All
              </FilterButton>
              {uniqueCompanies.map((company) => (
                <FilterButton
                  key={company}
                  $active={activeFilter === company}
                  onClick={() => filterJobs(company)}
                >
                  {company}
                </FilterButton>
              ))}
            </FilterContainer>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <JobCard key={job.id}>
                  <JobInfo>
                    <JobTitle>{job.title}</JobTitle>
                    <Company>{job.company?.name || 'Unknown Company'}</Company>
                    <Description>{job.description || 'No description available'}</Description>
                    <JobDetails>
                      <span>🏢 {job.location || 'No location'}</span>
                      <span>🕒 {typeof job.type === 'object' ? job.type?.name : job.type}</span>
                      <span>📅 {job.deadline || 'Open'}</span>
                      <span>👥 {typeof job.department === 'object' ? job.department?.name : job.department}</span>
                    </JobDetails>
                  </JobInfo>
                  {/* PERBAIKAN: Gunakan navigateToJobDetail untuk handling navigasi */}
                  <DetailButton onClick={() => navigateToJobDetail(job.id)}>
                    Lihat Detail
                  </DetailButton>
                </JobCard>
              ))
            ) : (
              <JobCard>
                <JobInfo>
                  <JobTitle>Tidak ada lowongan tersedia</JobTitle>
                  <Description>
                    Saat ini tidak ada lowongan pekerjaan yang tersedia.
                  </Description>
                </JobInfo>
              </JobCard>
            )}
          </ContentContainer>
        </JobHiringContainer>
      </PageWrapper>
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
    </>
  );
};

export default JobHiring;
