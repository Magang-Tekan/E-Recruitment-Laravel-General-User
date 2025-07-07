import { Link } from '@inertiajs/react';
import { format, isValid, parseISO } from 'date-fns';
import { id } from 'date-fns/locale/id'; // Tambahkan locale indonesia
import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

// Style components
const GlobalStyle = createGlobalStyle`
  body {
    background: #fff !important;
  }

  h1, h2, h3, h4, h5, h6 {
    overflow-wrap: break-word;
    word-wrap: break-word;
    hyphens: auto;
    max-width: 100%;
  }
`;

const PageWrapper = styled.div`
    padding: 40px 0;
    min-height: 80vh;
`;

const ContentContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    width: 100%;
    box-sizing: border-box;

    @media (max-width: 1250px) {
        max-width: 95%;
    }

    @media (max-width: 768px) {
        padding: 15px;
    }
`;

const PageTitleWrapper = styled.div`
    width: 100%;
    margin-bottom: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
`;

const PageTitle = styled.h1`
    font-size: clamp(1.5rem, 5vw, 2rem);
    color: #000000; /* Ubah warna teks menjadi hitam */
    font-weight: 700; /* Tambah ketebalan font */
    margin: 0;
    padding: 0;
`;

const AppTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
`;

const TableHead = styled.thead`
    background-color: #f8f9fa;
    border-bottom: 2px solid #dee2e6;

    th {
        padding: 12px 15px;
        text-align: left;
        font-weight: bold;
        color: #000000; /* Ubah warna teks header menjadi hitam */
    }
`;

const TableBody = styled.tbody`
    tr:nth-child(even) {
        background-color: #f8f9fa;
    }

    tr:hover {
        background-color: #f1f1f1;
    }

    td {
        padding: 12px 15px;
        border-bottom: 1px solid #dee2e6;
        color: #000000; /* Ubah warna teks menjadi hitam */
        font-weight: 500; /* Tambahkan font weight agar lebih terlihat */
    }

    .status-badge-cell {
        cursor: default; /* Override cursor untuk cell status */
        pointer-events: auto; /* Tetap menangkap event tapi akan di-cancel */
    }
`;

const StatusBadge = styled.span<{ color: string }>`
    display: inline-block;
    padding: 6px 12px;
    border-radius: 50px;
    font-size: 0.875rem;
    font-weight: 600;
    background-color: ${props => props.color || '#6c757d'};
    color: white;
    text-align: center;
    min-width: 100px;
    cursor: default; /* Set cursor default untuk menunjukkan tidak bisa diklik */
    pointer-events: none; /* Mencegah interaksi mouse */
    user-select: none; /* Mencegah seleksi teks */
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 50px 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
    margin: 30px 0;

    h3 {
        color: #000000; /* Ubah warna teks menjadi hitam */
        font-weight: 600;
    }

    p {
        color: #000000; /* Ubah warna teks menjadi hitam */
        font-weight: 500;
    }
`;

const EmptyStateIcon = styled.div`
    font-size: 5rem;
    margin-bottom: 20px;
    color: #6c757d;
`;

const ApplyLink = styled(Link)`
    display: inline-block;
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #1a73e8;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    font-weight: 500;

    &:hover {
        background-color: #1557b0;
        color: white;
    }
`;

const ErrorBanner = styled.div`
    padding: 15px;
    margin: 20px 0;
    background-color: #f8d7da;
    color: #721c24;
    border-radius: 8px;
    border-left: 5px solid #f5c6cb;
`;

// Function helper untuk format tanggal
const formatDate = (dateString: string) => {
    try {
        const date = parseISO(dateString);
        if (isValid(date)) {
            return format(date, 'dd MMM yyyy', { locale: id });
        }
        return dateString;
    } catch {
        return dateString;
    }
};

interface Application {
    id: number;
    status_id: number;
    status_name: string;
    status_color: string;
    stage_info?: string;
    job: {
        id: number;
        title: string;
        company: string;
        location: string;
        type: string;
    };
    applied_at: string;
    updated_at: string;
    history: {
        id: number;
        is_qualified: boolean | null;
        created_at: string;
    };
    current_score?: number; // Add this property to fix the error
}

interface ApplicationHistoryProps {
    applications: Application[];
    error?: string;
}

const ApplicationHistory: React.FC<ApplicationHistoryProps> = ({ applications = [], error = '' }) => {
    const [isLoading, setIsLoading] = useState(false);
    // No need to create a separate state for applicationList, use the props directly
    const applicationList = applications;
    const [errorMessage, setErrorMessage] = useState(error);

    // Fungsi refresh data yang lebih aman
    const refreshData = () => {
        setIsLoading(true);

        // Gunakan fetch yang lebih sederhana
        fetch(window.location.href)
            .then(response => response.text())
            .then(() => {
                // Halaman di-reload tanpa menggunakan router.reload()
                window.location.reload();
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error refreshing data:', error);
                setIsLoading(false);
                setErrorMessage('Gagal memuat data. Silakan coba lagi.');
            });
    };

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
                <ContentContainer>
                    <PageTitleWrapper>
                        <PageTitle style={{ marginTop: '80px' }}>Riwayat Lamaran</PageTitle>
                    </PageTitleWrapper>

                    <RefreshButton onClick={refreshData} disabled={isLoading}>
                        {isLoading && <LoadingSpinner />}
                        {isLoading ? 'Memuat...' : 'Refresh Data'}
                    </RefreshButton>

                    {errorMessage && (
                        <ErrorBanner>
                            <strong>Error:</strong> {errorMessage}
                        </ErrorBanner>
                    )}

                    {applicationList && applicationList.length > 0 ? (
                        <AppTable>
                            <TableHead>
                                <tr>
                                    <th>Posisi</th>
                                    <th>Perusahaan</th>
                                    <th>Lokasi</th>
                                    <th>Tipe</th>
                                    <th>Tanggal Apply</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </TableHead>
                            <TableBody>
                                {applicationList.map((app) => (
                                    <tr key={app.id} onClick={(e) => {
                                        // Periksa apakah klik terjadi pada StatusBadge atau parent-nya
                                        if ((e.target as HTMLElement).closest('.status-badge-cell') ||
                                            (e.target as HTMLElement).tagName === 'BUTTON' ||
                                            (e.target as HTMLElement).tagName === 'A') {
                                            e.stopPropagation(); // Hentikan propagasi jika klik pada cell status atau link
                                            return;
                                        }
                                        // Navigate to status page
                                        window.location.href = `/candidate/application/${app.id}/status`;
                                    }} style={{ cursor: 'pointer' }}>
                                        <td>{app.job.title}</td>
                                        <td>{app.job.company}</td>
                                        <td>{app.job.location}</td>
                                        <td>{app.job.type}</td>
                                        <td>{formatDate(app.applied_at)}</td>
                                        <td className="status-badge-cell" onClick={(e) => e.stopPropagation()}>
                                            <StatusBadge color={app.status_color}>
                                                {app.status_name}
                                            </StatusBadge>
                                            {app.stage_info && (
                                                <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#6c757d' }}>
                                                    {app.stage_info}
                                                </div>
                                            )}
                                            {app.current_score && (
                                                <div style={{ fontSize: '0.75rem', marginTop: '2px', color: '#495057' }}>
                                                    Skor: {app.current_score}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <Link
                                                href={`/candidate/application/${app.id}/status`}
                                                style={{
                                                    backgroundColor: '#1a73e8',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '500',
                                                    textDecoration: 'none',
                                                    display: 'inline-block'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#1557b0';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#1a73e8';
                                                }}
                                            >
                                                Lihat Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </TableBody>
                        </AppTable>
                    ) : (
                        <EmptyState>
                            <EmptyStateIcon>📋</EmptyStateIcon>
                            <h3>Belum Ada Lamaran</h3>
                            <p>Anda belum pernah mengajukan lamaran pekerjaan.</p>
                            <ApplyLink href="/candidate/jobs">Cari Lowongan</ApplyLink>
                        </EmptyState>
                    )}
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

// Tambahkan style untuk RefreshButton
const RefreshButton = styled.button<{ disabled: boolean }>`
    background-color: ${props => props.disabled ? '#cccccc' : '#1a73e8'};
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    font-size: 14px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: ${props => props.disabled ? '#cccccc' : '#1557b0'};
    }
`;

// Tambahkan component loading spinner
const LoadingSpinner = styled.div`
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-right: 8px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 3px solid white;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Modal components have been removed as we're now using page navigation instead

export default ApplicationHistory;
