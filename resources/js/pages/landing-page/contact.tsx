import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
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

export default function ContactPage() {
  const { auth, contacts = [] } = usePage<SharedData>().props as SharedData;

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
                <Link
                  href={route('dashboard')}
                  className="rounded-md border border-blue-600 px-[16px] py-[10px] text-[14px] font-medium text-blue-600 hover:bg-blue-50"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href={route('login')} className="text-sm font-medium text-blue-600 hover:underline">Masuk</Link>
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
                {contacts.length > 0 ? (
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
                <StyledForm>
                  <StyledLabel>Nama Lengkap</StyledLabel>
                  <StyledInput
                    type="text"
                    placeholder="Masukkan nama lengkap Anda"
                  />
                  <StyledLabel>Email</StyledLabel>
                  <StyledInput
                    type="email"
                    placeholder="Masukkan email Anda"
                  />
                  <StyledLabel>Pesan</StyledLabel>
                  <StyledTextarea
                    placeholder="Masukkan pesan Anda"
                  />
                  <SubmitButton type="submit">Kirim</SubmitButton>
                </StyledForm>
              </FormContainer>
            </CardContainer>
          </ContactContainer>
        </PageWrapper>
         {/* Footer */}
         <footer className="bg-[#f6fafe] py-16 mt-20">
                    <div className="container mx-auto grid grid-cols-1 gap-10 px-6 md:grid-cols-3">
                        {/* Kolom 1 */}
                        <div>
                            <h4 className="mb-2 text-[16px] font-bold">MITRA KARYA GROUP</h4>
                            <p className="mb-6 text-sm text-gray-700">
                                Kami adalah perusahaan teknologi pintar yang senantiasa berkomitmen untuk memberikan dan meningkatkan kepuasan
                                pelanggan
                            </p>
                            <div className="flex space-x-4 text-xl text-blue-600">
                                <a href="#">
                                    <FaInstagram />
                                </a>
                                <a href="#">
                                    <FaTwitter />
                                </a>
                                <a href="#">
                                    <FaLinkedinIn />
                                </a>
                                <a href="#">
                                    <FaYoutube />
                                </a>
                                <a href="#">
                                    <FaWhatsapp />
                                </a>
                            </div>
                        </div>

                        {/* Kolom 2 */}
                        <div>
                            <h4 className="mb-2 text-[16px] font-bold">Perusahaan Kami</h4>
                            <ul className="space-y-1 text-sm text-gray-700">
                                <li>PT MITRA KARYA ANALITIKA</li>
                                <li>PT AUTENTIK KARYA ANALITIKA</li>
                            </ul>
                        </div>

                        {/* Kolom 3 */}
                        <div>
                            <h4 className="mb-4 text-[16px] font-bold">Contact</h4>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <FaPhoneAlt className="mt-1 text-blue-600" />
                                    <div>
                                        Rudy Alfiansyah: <a href="tel:082137384029" className="text-blue-600 hover:underline">082137384029</a>
                                        <br />
                                        Deden Dermawan: <a href="tel:081807700111" className="text-blue-600 hover:underline">081807700111</a>
                                    </div>
                                </li>
                                <li className="flex items-center gap-2">
                                    <FaEnvelope className="text-blue-600" />
                                    <a href="mailto:autentik.info@gmail.com" className="hover:underline">autentik.info@gmail.com</a>
                                </li>
                                <li className="flex items-start gap-2">
                                    <FaMapMarkerAlt className="mt-1 text-blue-600" />
                                    <a href="https://maps.app.goo.gl/5PPfwMiAQQs6HbW37"
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="hover:underline">
                                        Jl. Klipang Ruko Amsterdam No.9E, Sendangmulyo,
                                        <br />
                                        Kec. Tembalang, Kota Semarang, Jawa Tengah 50272
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </footer>
      </div>
    </>
  );
}
