import { usePage } from '@inertiajs/react';
import axios from 'axios';
import React from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';

interface JobDetailProps {
    job: {
        id: number;
        title: string;
        company: { name: string };
        job_description: string;
        requirements: string[];
        benefits: string[];
        major_id: number;
        major_name: string | null;
    };
    userMajor: number | null;
    isMajorMatched: boolean;
    canApply: boolean;
    applicationMessage: string;
    flash?: { success?: string; error?: string; };
}

interface ApiErrorResponse {
    response?: {
        status?: number;
        data?: {
            message?: string;
            redirect?: string;
        };
    };
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
    margin: 40px 0;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionHeading = styled.h3`
    font-size: 1.8rem;
    margin-bottom: 20px;
    color: #222;
`;

const JobDescription = styled.p`
    line-height: 1.6;
    margin-bottom: 15px;
    color: #333;
`;

const List = styled.ul`
    list-style-type: none;
    padding: 0;
`;

const ListItem = styled.li`
    margin-bottom: 10px;
    padding-left: 20px;
    position: relative;
    color: #222;

    &:before {
        content: "•";
        position: absolute;
        left: 0;
        color: #1a73e8;
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
                            Swal.showLoading();
                        }
                    });

                    const response = await axios.post(`/candidate/apply/${job.id}`, {}, {
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    });

                    Swal.close();

                    if (response.data.success) {
                        Swal.fire({
                            title: 'Berhasil!',
                            text: response.data.message,
                            icon: 'success',
                            confirmButtonText: 'OK'
                        }).then(() => {
                            // Redirect ke halaman application history
                            window.location.href = response.data.redirect || '/candidate/application-history';
                        });
                    } else {
                        Swal.fire({
                            title: 'Perhatian',
                            text: response.data.message,
                            icon: 'warning',
                            confirmButtonText: 'OK'
                        });
                    }
                } catch (error: unknown) {
                    Swal.close();
                    console.error('Apply error:', error);
                    
                    // Check if error response contains redirect
                    if (error instanceof Error && 'response' in error) {
                        const axiosError = error as ApiErrorResponse;
                        if (axiosError.response?.data?.redirect) {
                            window.location.href = axiosError.response.data.redirect;
                            return;
                        }

                        // Handle different error statuses
                        if (axiosError.response?.status === 422) {
                            const errorMessage = axiosError.response?.data?.message || 'Data profil belum lengkap.';
                            Swal.fire({
                                title: 'Data Belum Lengkap',
                                text: errorMessage,
                                icon: 'warning',
                                confirmButtonText: 'OK'
                            });
                        } else {
                            Swal.fire({
                                title: 'Error',
                                text: axiosError.response?.data?.message || 'Terjadi kesalahan saat melamar. Silakan coba lagi.',
                                icon: 'error',
                                confirmButtonText: 'OK'
                            });
                        }
                    } else {
                        Swal.fire({
                            title: 'Error',
                            text: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    }
                }
            }
        });
    };

    return (
        <>
            <Header />
            <PageWrapper>
                <HeroSection>
                    <JobTitle>{job?.title}</JobTitle>
                    <CompanyTitle>{job?.company?.name}</CompanyTitle>
                </HeroSection>
                <ContentContainer>
                    {/* Tampilkan peringatan kesesuaian jurusan */}
                    {userMajor === null ? (
                        <MajorWarning>
                            <WarningIcon>⚠️</WarningIcon>
                            <div>
                                <strong>Data jurusan belum lengkap!</strong> Mohon lengkapi data pendidikan Anda terlebih dahulu
                                untuk dapat melamar lowongan ini.
                            </div>
                        </MajorWarning>
                    ) : isMajorMatched ? (
                        <MajorMatch>
                            <MatchIcon>✓</MatchIcon>
                            <div>
                                <strong>Jurusan Anda cocok!</strong> Lowongan ini membutuhkan jurusan {job?.major_name}
                                yang sesuai dengan jurusan Anda.
                            </div>
                        </MajorMatch>
                    ) : (
                        <MajorWarning>
                            <WarningIcon>⚠️</WarningIcon>
                            <div>
                                <strong>Jurusan tidak sesuai!</strong> Lowongan ini membutuhkan jurusan {job?.major_name}
                                yang tidak sesuai dengan jurusan Anda.
                            </div>
                        </MajorWarning>
                    )}

                    {/* Tampilkan pesan status aplikasi */}
                    {!canApply && applicationMessage && (
                        <ApplicationAlert>
                            <ApplicationIcon>🚫</ApplicationIcon>
                            <div>
                                <strong>Tidak dapat melamar!</strong> {applicationMessage}
                            </div>
                        </ApplicationAlert>
                    )}

                    <InfoSection>
                        <SectionHeading>Job Description</SectionHeading>
                        <JobDescription>{job?.job_description}</JobDescription>
                    </InfoSection>
                    <InfoSection>
                        <SectionHeading>Requirements</SectionHeading>
                        <List>
                            {job?.requirements?.map((requirement, index) => (
                                <ListItem key={index}>{requirement}</ListItem>
                            ))}
                        </List>
                    </InfoSection>
                    <InfoSection>
                        <SectionHeading>Benefits</SectionHeading>
                        <List>
                            {job?.benefits?.map((benefit, index) => (
                                <ListItem key={index}>{benefit}</ListItem>
                            ))}
                        </List>
                    </InfoSection>

                    {/* Button Apply dengan kondisi */}
                    <ApplyButton
                        onClick={handleApply}
                        disabled={!isMajorMatched || !canApply}
                        style={{
                            backgroundColor: (!isMajorMatched || !canApply) ? '#cccccc' : '#1a73e8',
                            cursor: (!isMajorMatched || !canApply) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {!isMajorMatched 
                            ? 'Tidak Dapat Apply (Jurusan Tidak Sesuai)' 
                            : !canApply 
                                ? 'Tidak Dapat Apply (Sudah Pernah Melamar)' 
                                : 'Lamar Sekarang'
                        }
                    </ApplyButton>
                </ContentContainer>
            </PageWrapper>
            <Footer />
        </>
    );
};

export default JobDetailPage;
