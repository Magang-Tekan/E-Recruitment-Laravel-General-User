import React from "react";
import {
  FaInstagram,
  FaLinkedinIn,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaYoutube,
  FaTwitter,
  FaRegCommentDots,
  FaLinkedin,
  FaXing,
  FaXbox,
  FaTwitterSquare,
} from "react-icons/fa";

const ContactPerson: React.FC = () => {
  return (
    <div className="font-sans text-gray-800 bg-white min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-50 flex justify-between items-center p-6 shadow-md bg-white">
        <div className="text-lg font-bold">MITRA KARYA GROUP</div>
        <nav className="space-x-6 text-sm">
          <a href="/" className="hover:text-blue-600">Beranda</a>
          <a href="/about" className="hover:text-blue-600">Tentang Kami</a>
          <a href="/job-hiring" className="hover:text-blue-600">Lowongan Pekerjaan</a>
          <a href="/contact-person" className="text-blue-600 font-semibold">Kontak</a>
        </nav>
        <div className="space-x-4 text-sm">
          <button className="text-blue-600">Masuk</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-[10px]">Daftar</button>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center py-16 bg-white">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">Hubungi Kami</h1>
        <p className="text-gray-600 text-sm">Let us know how we can help.</p>
      </section>

      {/* Form & Contact Cards */}
      <section className="max-w-screen-lg mx-auto px-6 mb-52 flex flex-col lg:flex-row gap-12">
        {/* Form */}
        <form className="flex flex-col w-full lg:w-1/2">
          <label className="text-left text-sm font-medium mb-1">Nama Lengkap</label>
          <input
            type="text"
            placeholder="Masukkan nama lengkap Anda"
            className="px-4 py-3 rounded-md bg-gray-100 mb-6" // mb-6 untuk jarak lebih jauh ke Email
          />
          <label className="text-left text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="Masukkan email Anda"
            className="px-4 py-3 rounded-md bg-gray-100 mb-6"
          />
          <label className="text-left text-sm font-medium mb-1">Pesan</label>
          <textarea
            placeholder="Masukkan pesan Anda"
            className="px-4 py-3 rounded-md bg-gray-100 h-28 resize-none mb-6"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md mt-2"
          >
            Kirim
          </button>
        </form>

        {/* Contact Cards */}
        <div className="flex flex-col gap-6 w-full lg:w-1/2">
          {/* Single Bubble with All Contact Options */}
          <div className="border border-blue-400 rounded-lg p-6 bg-white hover:shadow-md ml-16 mt-3 w-[481px] max-w-md min-h-[397px]">
            <div className="flex flex-col gap-10 pt-6">
              {/* Chat to support */}
              <div className="flex items-center">
                <div className="border border-blue-400 rounded-lg w-17 h-17 flex items-center justify-center mr-4">
                  <FaRegCommentDots className="text-blue-400 text-2xl" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Chat to support</p>
                  <p className="text-sm text-black">We're here to help</p>
                  <a href="mailto:autentik.info@gmail.com" className="underline text-sm">
                    autentik.info@gmail.com
                  </a>
                </div>
              </div>
              {/* Visit us */}
              <div className="flex items-center">
                <div className="border border-blue-400 rounded-lg w-17 h-17 flex items-center justify-center mr-4">
                  <FaMapMarkerAlt className="text-blue-400 text-2xl" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Visit us</p>
                  <p className="text-sm text-black">Visit our office</p>
                  <a
                    href="https://maps.app.goo.gl/5PPfwMiAQQs6HbW37"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-sm"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>
              {/* Call us */}
              <div className="flex items-center">
                <div className="border border-blue-400 rounded-lg w-17 h-17 flex items-center justify-center mr-4">
                  <FaPhoneAlt className="text-blue-400 text-2xl" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Call us</p>
                  <p className="text-sm text-black">Mon-Fri from 8am to 5pm</p>
                  <a href="tel:+6281807700111" className="underline text-sm">
                    +62 81-807-700-111
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[rgba(56,179,248,0.05)] text-sm text-gray-600 px-6 py-10 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-screen-lg mx-auto items-start text-center">
          {/* Column 1 */}
          <div className="text-center md:text-left flex flex-col">
            <h4 className="font-semibold text-black mb-2">MITRA KARYA GROUP</h4>
            <p className="text-justify">
              Kami adalah perusahaan teknologi pintar yang senantiasa berkomitmen untuk memberikan dan meningkatkan kepuasan pelanggan
            </p>
            <div className="mt-4 flex justify-center md:justify-start space-x-3 text-blue-600 text-lg">
              <FaTwitter />
              <FaInstagram />
              <FaLinkedinIn />
              <FaYoutube />
              <FaWhatsapp />
            </div>
          </div>

          {/* Column 2 */}
          <div className="text-left flex flex-col">
            <h4 className="font-semibold text-black mb-2 pl-20">Perusahaan Kami</h4>
            <ul className="pl-20 space-y-1">
              <li>PT MITRA KARYA ANALITIKA</li>
              <li>PT AUTENTIK KARYA ANALITIKA</li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="text-left flex flex-col">
            <h4 className="font-semibold text-black mb-2 pl-12">Contact</h4>
            <ul className="pl-12 space-y-1">
              <li className="flex items-center gap-2">
                <FaPhoneAlt className="text-blue-600" />
                Rudy: <a href="tel:082137384029" className="text-blue-600 hover:underline">082137384029</a>
              </li>
              <li className="flex items-center gap-2 pl-5.5">
                Deden: <a href="tel:081807700111" className="text-blue-600 hover:underline">081807700111</a>
              </li>
              <li className="flex items-center gap-2 mt-2">
                <FaEnvelope className="text-blue-600" />
                <a href="mailto:autentik.info@gmail.com" className="hover:underline">autentik.info@gmail.com</a>
              </li>
              <li className="flex items-start gap-2 mt-2 ml-2 ">
                <FaMapMarkerAlt className="text-blue-600 text-xl -ml-1" />
                <a
                  href="https://maps.app.goo.gl/5PPfwMiAQQs6HbW37"
                  className="hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                <p className="text-justify">
                  Jl. Klipang Ruko Amsterdam No. 9E, Sendangmulyo, Kec. Tembalang, Kota Semarang, Jawa Tengah 50272
                </p>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPerson;
