import { usePage, Head, Link, useForm, router } from '@inertiajs/react';
import React from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';

interface JobDetailProps extends Record<string, unknown> {
    job: {
        id: number;
        title: string;
        company: { name: string };
        job_description: string;
        requirements: string[];
        benefits: string[];
        major_id?: number | null; // For backward compatibility
        major_name?: string | null; // For backward compatibility
        major_names?: string[]; // Array of major names
        major_ids?: number[]; // Array of major IDs
    };
    userMajor: number | null;
    isMajorMatched: boolean;
    canApply: boolean;
    applicationMessage: string;
    flash?: { success?: string; error?: string; };
}

const PageWrapper = styled.div`
    background-color: #f9f9f9;
`;

const ContentContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
`;

const HeroSection = styled.div`
    position: relative;
    height: 600px;
    background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
        url('/images/background.png');
    background-size: cover;
    background-position: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    text-align: center;
`;

const JobTitle = styled.h1`
    font-size: 2.5rem;
    margin-bottom: 10px;
    font-weight: bold;
`;

const CompanyTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: bold;
`;

const InfoSection = styled.section`
    margin: 30px 0;
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f0f0;
`;

const SectionHeading = styled.h3`
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: #1a73e8;
    font-weight: 600;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 8px;
`;

const JobDescription = styled.div`
    line-height: 1.8;
    margin-bottom: 20px;
    color: #444;
    font-size: 1rem;
    text-align: justify;
    
    p {
        margin-bottom: 12px;
    }
`;

const List = styled.ul`
    list-style-type: none;
    padding: 0;
    margin: 0;
`;

const ListItem = styled.li`
    margin-bottom: 12px;
    padding: 8px 0 8px 24px;
    position: relative;
    color: #333;
    line-height: 1.6;
    font-size: 0.95rem;

    &:before {
        content: "•";
        position: absolute;
        left: 0;
        color: #1a73e8;
        font-weight: bold;
        font-size: 1.2rem;
    }
`;

const ApplyButton = styled.button`
    background-color: #1a73e8;
    color: white;
    border: none;
    padding: 15px 150px;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    display: block;
    margin: 40px auto;

    &:hover {
        background-color: #1557b0;
    }
`;

const MajorWarning = styled.div`
    background-color: #fff3cd;
    color: #856404;
    padding: 16px;
    border-radius: 8px;
    margin: 20px 0;
    border-left: 5px solid #ffeeba;
    display: flex;
    align-items: center;
    gap: 12px;
`;

const WarningIcon = styled.span`
    font-size: 24px;
`;

const MajorMatch = styled.div`
    background-color: #d4edda;
    color: #155724;
    padding: 16px;
    border-radius: 8px;
    margin: 20px 0;
    border-left: 5px solid #c3e6cb;
    display: flex;
    align-items: center;
    gap: 12px;
`;

const MatchIcon = styled.span`
    font-size: 24px;
`;

const ApplicationAlert = styled.div`
    background-color: #f8d7da;
    color: #721c24;
    padding: 16px;
    border-radius: 8px;
    margin: 20px 0;
    border-left: 5px solid #f5c6cb;
    display: flex;
    align-items: center;
    gap: 12px;
`;

const ApplicationIcon = styled.span`
    font-size: 24px;
`;

const JobDetailPage: React.FC = () => {
    const { job, userMajor, isMajorMatched, canApply, applicationMessage, flash } = usePage<JobDetailProps>().props;

// Helper function to parse job data (requirements/benefits)
const parseArrayData = (data: string | string[] | null | undefined): string[] => {
    if (!data) return [];
    
    // If it's already an array, return it
    if (Array.isArray(data)) {
        return data;
    }
    
    // If it's a string, try to parse as JSON
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [data]; // If parsing fails, return as single item array
        }
    }
    
    return [];
};    // Parse requirements and benefits
    const requirements = parseArrayData(job?.requirements);
    const benefits = parseArrayData(job?.benefits);

    React.useEffect(() => {
        // Tampilkan flash messages dari backend
        if (flash?.success) {
            Swal.fire({
                title: 'Sukses!',
                text: flash.success,
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                // Update URL untuk application history
                window.location.href = '/candidate/application-history';
            });
        }

        if (flash?.error) {
            Swal.fire({
                title: 'Perhatian!',
                text: flash.error,
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        }
    }, [flash]);

    const handleApply = async () => {
        Swal.fire({
            title: 'Konfirmasi',
            text: 'Anda akan melamar pekerjaan ini. Lanjutkan?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Lamar Sekarang',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Tampilkan loading
                    Swal.fire({
                        title: 'Memproses...',
                        text: 'Mohon tunggu sebentar',
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        didOpen: () => {
                            Swal.showLoading(Swal.getDenyButton());
                        }
                    });

                    // Gunakan router.post() dari Inertia.js
                    router.post(`/candidate/apply/${job.id}`, {}, {
                        onSuccess: (data: any) => {
                            Swal.close();
                            
                            Swal.fire({
                                title: 'Berhasil!',
                                text: 'Lamaran Anda telah berhasil dikirim.',
                                icon: 'success',
                                confirmButtonText: 'OK'
                            }).then(() => {
                                // Redirect ke halaman application history
                                router.visit('/candidate/application-history');
                            });
                        },
                        onError: (errors: any) => {
                            Swal.close();
                            console.error('Apply error:', errors);

                            // Handle different error cases
                            if (errors.message) {
                                Swal.fire({
                                    title: 'Perhatian',
                                    text: errors.message,
                                    icon: 'warning',
                                    confirmButtonText: 'OK'
                                });
                            } else {
                                Swal.fire({
                                    title: 'Error',
                                    text: 'Terjadi kesalahan saat melamar. Silakan coba lagi.',
                                    icon: 'error',
                                    confirmButtonText: 'OK'
                                });
                            }
                        }
                    });
                } catch (error: unknown) {
                    Swal.close();
                    console.error('Apply error:', error);
                    
                    Swal.fire({
                        title: 'Error',
                        text: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            }
        });
    };

    return (
        <>
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
                <HeroSection>
                    <JobTitle>{job?.title}</JobTitle>
                    <CompanyTitle>{job?.company?.name}</CompanyTitle>
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <i className="fas fa-graduation-cap text-blue-500"></i>
                            <span>Pendidikan Minimal</span>
                        </div>
                        {/* Display Multiple Majors */}
                        {(job?.major_names && job.major_names.length > 0) || job?.major_name ? (
                            <div className="flex flex-wrap items-center gap-2">
                                <i className="fas fa-book text-green-500"></i>
                                <div className="flex flex-wrap gap-2">
                                    {job?.major_names && job.major_names.length > 0 ? (
                                        job.major_names.map((majorName, index) => (
                                            <span 
                                                key={index}
                                                className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium"
                                            >
                                                {majorName}
                                            </span>
                                        ))
                                    ) : job?.major_name ? (
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                                            {job.major_name}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        ) : null}
                        <div className="flex items-center gap-1">
                            <i className="fas fa-building text-purple-500"></i>
                            <span>{job?.company?.name}</span>
                        </div>
                    </div>
                </HeroSection>
                <ContentContainer>
                    {/* Tampilkan peringatan kesesuaian jurusan */}
                    {userMajor === null ? (
                        <MajorWarning>
                            <WarningIcon>⚠️</WarningIcon>
                            <div>
                                <strong>Data jurusan belum lengkap!</strong>
                                <p className="mt-1 text-sm">Mohon lengkapi data pendidikan Anda terlebih dahulu untuk dapat melamar lowongan ini.</p>
                            </div>
                        </MajorWarning>
                    ) : isMajorMatched ? (
                        <MajorMatch>
                            <MatchIcon>✅</MatchIcon>
                            <div>
                                <strong>Jurusan Anda cocok!</strong>
                                <p className="mt-1 text-sm">
                                    Lowongan ini membutuhkan jurusan: {
                                        job?.major_names && job.major_names.length > 0 
                                            ? job.major_names.join(', ')
                                            : job?.major_name || 'Tidak ditentukan'
                                    } yang sesuai dengan jurusan Anda.
                                </p>
                            </div>
                        </MajorMatch>
                    ) : (
                        <MajorWarning>
                            <WarningIcon>❌</WarningIcon>
                            <div>
                                <strong>Jurusan tidak sesuai!</strong>
                                <p className="mt-1 text-sm">
                                    Lowongan ini membutuhkan jurusan: {
                                        job?.major_names && job.major_names.length > 0 
                                            ? job.major_names.join(', ')
                                            : job?.major_name || 'Tidak ditentukan'
                                    } yang tidak sesuai dengan jurusan Anda.
                                </p>
                            </div>
                        </MajorWarning>
                    )}

                    {/* Tampilkan pesan status aplikasi */}
                    {!canApply && applicationMessage && (
                        <ApplicationAlert>
                            <ApplicationIcon>🚫</ApplicationIcon>
                            <div>
                                <strong>Tidak dapat melamar!</strong>
                                <p className="mt-1 text-sm">{applicationMessage}</p>
                            </div>
                        </ApplicationAlert>
                    )}

                    <InfoSection>
                        <SectionHeading>📋 Deskripsi Pekerjaan</SectionHeading>
                        <JobDescription>
                            {job?.job_description ? (
                                <div dangerouslySetInnerHTML={{ 
                                    __html: job.job_description.replace(/\n/g, '<br />') 
                                }} />
                            ) : (
                                <p className="text-gray-500 italic">Deskripsi pekerjaan tidak tersedia.</p>
                            )}
                        </JobDescription>
                    </InfoSection>
                    
                    <InfoSection>
                        <SectionHeading>📌 Persyaratan</SectionHeading>
                        {requirements.length > 0 ? (
                            <List>
                                {requirements.map((requirement, index) => (
                                    <ListItem key={index}>
                                        <span className="font-medium">•</span> {requirement}
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <p className="text-gray-500 italic">
                                Persyaratan tidak tersedia.
                            </p>
                        )}
                    </InfoSection>
                    
                    <InfoSection>
                        <SectionHeading>🎁 Fasilitas & Tunjangan</SectionHeading>
                        {benefits.length > 0 ? (
                            <List>
                                {benefits.map((benefit, index) => (
                                    <ListItem key={index}>
                                        <span className="font-medium">•</span> {benefit}
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <p className="text-gray-500 italic">
                                Fasilitas dan tunjangan tidak tersedia.
                            </p>
                        )}
                    </InfoSection>

                    {/* Button Apply dengan kondisi dan styling yang lebih baik */}
                    <div className="mt-8 text-center">
                        <ApplyButton
                            onClick={handleApply}
                            disabled={!isMajorMatched || !canApply}
                            style={{
                                backgroundColor: (!isMajorMatched || !canApply) ? '#e5e7eb' : '#1d4ed8',
                                color: (!isMajorMatched || !canApply) ? '#6b7280' : 'white',
                                cursor: (!isMajorMatched || !canApply) ? 'not-allowed' : 'pointer',
                                boxShadow: (!isMajorMatched || !canApply) ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            {!isMajorMatched
                                ? '❌ Tidak Dapat Apply - Jurusan Tidak Sesuai'
                                : !canApply
                                    ? '🚫 Tidak Dapat Apply - Sudah Pernah Melamar'
                                    : '📝 Lamar Sekarang'
                            }
                        </ApplyButton>
                        
                        {(!isMajorMatched || !canApply) && (
                            <p className="mt-3 text-sm text-gray-500 italic">
                                {!isMajorMatched
                                    ? 'Silakan periksa kesesuaian jurusan Anda dengan persyaratan lowongan.'
                                    : 'Anda sudah memiliki aplikasi aktif untuk periode ini.'
                                }
                            </p>
                        )}
                    </div>
                </ContentContainer>
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

export default JobDetailPage;
