import React from 'react';
import { type SharedData } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    FaEnvelope,
    FaInstagram,
    FaLinkedinIn,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaRegCommentDots,
    FaTwitter,
    FaWhatsapp,
    FaYoutube,
} from "react-icons/fa";
import styled from 'styled-components';
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

  const PageWrapper = styled.div`
    background: #fff;
    min-height: 100vh;
    padding-top: 100px;
    padding-bottom: 40px;
  `;

  const Title = styled.h2`
    color: #1DA1F2;
    font-size: 40px;
    font-weight: 800;
    margin-bottom: 8px;
    text-align: center;
  `;

  const Subtitle = styled.p`
    color: #666;
    font-size: 14px;
    text-align: center;
    margin-bottom: 32px;
  `;

  const ContactContainer = styled.div`
    max-width: 1200px;
    width: 100%;
    padding: 0 20px;
    margin: 0 auto;
  `;

  const CardContainer = styled.div`
    display: flex;
    flex-direction: column-reverse;
    justify-content: center;
    gap: 20px;
    margin-top: 40px;

    @media (min-width: 1024px) {
      flex-direction: row;
      flex-wrap: nowrap;
    }
  `;

  const Card = styled.div`
    border: 1px solid #1DA1F2;
    border-radius: 8px;
    padding: 24px;
    min-width: 300px;
    height: 312px;
    text-align: left;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  `;

  const FormContainer = styled.div`
    flex: 1;
    padding: 20px;
  `;

  const StyledForm = styled.form`
    flex-direction: column;
    width: 100%;
    display: flex;
  `;

  const StyledInput = styled.input`
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    background: #f3f4f6;
    margin-bottom: 1.5rem;
    border: none;
    &:focus {
      outline: 2px solid #1DA1F2;
    }
  `;

  const StyledTextarea = styled.textarea`
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    background: #f3f4f6;
    margin-bottom: 1.5rem;
    border: none;
    resize: none;
    height: 7rem;
    &:focus {
      outline: 2px solid #1DA1F2;
    }
  `;

  const StyledLabel = styled.label`
    text-align: left;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
  `;

  const SubmitButton = styled.button`
    background: #1DA1F2;
    color: white;
    font-weight: 600;
    padding: 0.75rem;
    border-radius: 0.375rem;
    margin-top: 0.5rem;
    cursor: pointer;
    &:hover {
      background: #0d8ecf;
    }
  `;

  const CardIconWrapper = styled.div`
    border: 1px solid #1DA1F2;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 16px;
    font-size: 20px;
    color: #1DA1F2;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const CardTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: #000;
    margin-bottom: 4px;
  `;

  const CardText = styled.p`
    font-size: 14px;
    color: #555;
    margin: 0 0 4px 0;
  `;

  const IconImage = styled.img`
    width:40px;
    height: 40px;
  `;

  const ContactInfoCard = styled.div`
    border: 1px solid #1DA1F2;
    border-radius: 8px;
    padding: 24px;
    width: 100%;
    max-width: 480px;
    height: 407.5px;
    margin: 0 auto;
    padding-left: 48px; // geser isi ke kanan
    padding-top: 55px; // geser isi ke bawah

    @media (min-width: 1024px) {
      margin: 0;
    }
  `;

  const ContactInfoItem = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 32px;
    &:last-child {
      margin-bottom: 0;
    }
  `;

  const ContactIconWrapper = styled.div`
    border: 1px solid #1DA1F2;
    border-radius: 8px;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    flex-shrink: 0;
  `;

  const ContactTextWrapper = styled.div`
    display: flex;
    flex-direction: column;
  `;

  // Add Alert component
  const Alert = ({ type, message }: { type: 'success' | 'error'; message: string }) => (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className={`px-4 py-3 rounded-lg shadow-lg ${
            type === 'success' ? 'bg-green-100 text-green-700 border border-green-400'
            : 'bg-red-100 text-red-700 border border-red-400'
        }`}>
            <div className="flex items-center">
                {type === 'success' ? (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                )}
                <span>{message}</span>
            </div>
        </div>
    </div>
  );

  return (
    <>
      <Head title="Kontak" />
      <div className="min-h-screen bg-white text-gray-900">
        <header className="fixed top-0 right-0 left-0 z-50 h-[80px] border-b border-gray-200 bg-white px-[20px] shadow">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <div className="text-[20px] font-bold text-gray-800">MITRA KARYA GROUP</div>
            <nav className="hidden space-x-[24px] text-[14px] font-medium md:flex">
              <Link href="/" className="hover:text-blue-600">Beranda</Link>
              <Link href="/job-hiring-landing-page" className="hover:text-blue-600">Lowongan Pekerjaan</Link>
              <Link href="/about-us" className="hover:text-blue-600">Tentang Kami</Link>
              <Link href="/contact" className="hover:text-blue-600">Kontak</Link>
            </nav>
            <div className="flex items-center gap-4">
                {auth?.user ? (
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)} // Add this state
                            className="w-10 h-10 border-2 border-[#0047FF] rounded-full flex items-center justify-center text-[#0047FF] hover:bg-blue-50"
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
                                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-md py-1 z-50 border border-gray-300"
                                onBlur={() => setShowDropdown(false)}
                            >
                                <div className="px-4 py-2">
                                    <p className="text-sm font-medium text-gray-900">{auth.user.name}</p>
                                    <p className="text-sm text-gray-500">{auth.user.email}</p>
                                </div>
                                <Link
                                    href="/candidate/profile"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <Link href={route('login')} className="text-sm font-medium text-blue-600 hover:underline">
                            Masuk
                        </Link>
                        <Link
                            href={route('register')}
                            className="rounded-md bg-blue-600 px-[16px] py-[10px] text-[14px] text-white hover:bg-blue-700"
                        >
                            Daftar
                        </Link>
                    </>
                )}
            </div>
          </div>
        </header>

        <PageWrapper>
          <ContactContainer>
            <Title>Hubungi Kami</Title>
            <Subtitle>Let us know how we can help.</Subtitle>

            <CardContainer>
              {/* Bubble di kiri */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                {contacts && contacts.length > 0 ? (
                  contacts.map((contact: { id: number; email: string; phone: string; address: string }) => (
                    <Card key={contact.id} style={{ width: '100%', maxWidth: 480 }}>
                      <CardIconWrapper>
                        <IconImage src="/images/chat-to-support.png" alt="Chat Icon" />
                      </CardIconWrapper>
                      <CardTitle>Email</CardTitle>
                      <CardText>{contact.email}</CardText>
                      <CardTitle>Phone</CardTitle>
                      <CardText>{contact.phone}</CardText>
                      <CardTitle>Address</CardTitle>
                      <CardText>{contact.address}</CardText>
                    </Card>
                  ))
                ) : (
                  <ContactInfoCard style={{ width: '100%', maxWidth: 480, marginTop: 25 }}>
                    <ContactInfoItem>
                      <ContactIconWrapper>
                        <FaRegCommentDots className="text-[#1DA1F2] text-2xl" />
                      </ContactIconWrapper>
                      <ContactTextWrapper>
                        <CardTitle>Chat to support</CardTitle>
                        <CardText>We're here to help</CardText>
                        <a href="mailto:autentik.info@gmail.com" className="underline text-sm">
                          autentik.info@gmail.com
                        </a>
                      </ContactTextWrapper>
                    </ContactInfoItem>

                    <ContactInfoItem>
                      <ContactIconWrapper>
                        <FaMapMarkerAlt className="text-[#1DA1F2] text-2xl" />
                      </ContactIconWrapper>
                      <ContactTextWrapper>
                        <CardTitle>Visit us</CardTitle>
                        <CardText>Visit our office</CardText>
                        <a
                          href="https://maps.app.goo.gl/5PPfwMiAQQs6HbW37"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-sm"
                        >
                          View on Google Maps
                        </a>
                      </ContactTextWrapper>
                    </ContactInfoItem>

                    <ContactInfoItem>
                      <ContactIconWrapper>
                        <FaPhoneAlt className="text-[#1DA1F2] text-2xl" />
                      </ContactIconWrapper>
                      <ContactTextWrapper>
                        <CardTitle>Call us</CardTitle>
                        <CardText>Mon-Fri from 8am to 5pm</CardText>
                        <a href="tel:+6281807700111" className="underline text-sm">
                          +62 81-807-700-111
                        </a>
                      </ContactTextWrapper>
                    </ContactInfoItem>
                  </ContactInfoCard>
                )}
              </div>

              {/* Form di kanan, ukurannya sama */}
              <FormContainer style={{ maxWidth: 480, width: '100%' }}>
                <StyledForm
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
                          title: 'Pesan berhasil dikirim!',
                          showConfirmButton: false,
                          timer: 1500
                        });
                        form.reset();
                      },
                      onError: () => {
                        Swal.fire({
                          icon: 'error',
                          title: 'Terjadi kesalahan',
                          text: 'Silakan coba lagi.',
                          confirmButtonText: 'Tutup'
                        });
                      }
                    });
                  }}
                >
                  <StyledLabel>Nama Lengkap</StyledLabel>
                  <StyledInput
                    type="text"
                    name="name"
                    placeholder="Masukkan nama lengkap Anda"
                    required
                  />
                  <StyledLabel>Email</StyledLabel>
                  <StyledInput
                    type="email"
                    name="email"
                    placeholder="Masukkan email Anda"
                    required
                  />
                  <StyledLabel>Pesan</StyledLabel>
                  <StyledTextarea
                    name="message"
                    placeholder="Masukkan pesan Anda"
                    required
                  />
                  <SubmitButton type="submit">Kirim</SubmitButton>
                </StyledForm>
              </FormContainer>
            </CardContainer>
          </ContactContainer>
        </PageWrapper>
         {/* Footer */}
         <footer className="bg-[#f6fafe] py-16">
    <div className="container mx-auto grid grid-cols-1 gap-10 px-6 md:grid-cols-3">
        {/* Kolom 1 */}
        <div>
            {companies && companies.length > 0 ? (
                <>
                    <h4 className="mb-2 text-[16px] font-bold text-gray-900">{companies[0].name}</h4>
                    <p className="mb-6 text-sm text-gray-700">
                        {companies[0].description}
                    </p>
                </>
            ) : (
                <>
                    <h4 className="mb-2 text-[16px] font-bold text-gray-900">MITRA KARYA GROUP</h4>
                    <p className="mb-6 text-sm text-gray-700">
                        Kami adalah perusahaan teknologi pintar yang senantiasa berkomitmen untuk memberikan dan meningkatkan kepuasan pelanggan
                    </p>
                </>
            )}
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
            <h4 className="mb-2 text-[16px] font-bold text-gray-900">Perusahaan Kami</h4>
            <ul className="space-y-1 text-sm text-gray-700">
                {companies && companies.length > 0 ? (
                    companies.map((company) => (
                        <li key={company.id}>{company.name}</li>
                    ))
                ) : (
                    <li>Tidak ada perusahaan untuk ditampilkan</li>
                )}
            </ul>
        </div>

        {/* Kolom 3 */}
        <div>
            <h4 className="mb-4 text-[16px] font-bold text-gray-900">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                    <i className="fas fa-phone mt-1 text-blue-600" />
                    <div>
                        Rudy Alfiansyah: 082137384029
                        <br />
                        Deden Dermawan: 081807700111
                    </div>
                </li>
                <li className="flex items-center gap-2">
                    <i className="fas fa-envelope text-blue-600" />
                    <span>autentik.info@gmail.com</span>
                </li>
                <li className="flex items-start gap-2">
                    <i className="fas fa-map-marker-alt mt-1 text-blue-600" />
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
    </>
  );
}
