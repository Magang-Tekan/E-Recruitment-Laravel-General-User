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
} from "react-icons/fa";

export default function ContactPerson() {
  return (
    <div className="font-sans text-gray-800 bg-white min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-50 flex justify-between items-center p-6 shadow-md bg-white">
        <div className="text-lg font-bold">MITRA KARYA GROUP</div>
        <nav className="space-x-6 text-sm">
          <a href="/" className="hover:text-blue-600">
            Beranda
          </a>
          <a href="/about" className="hover:text-blue-600">
            Tentang Kami
          </a>
          <a href="/job-hiring" className="hover:text-blue-600">
            Lowongan Pekerjaan
          </a>
          <a href="/contact-person" className="text-blue-600 font-semibold">
            Kontak
          </a>
        </nav>
        <div className="space-x-4 text-sm">
          <button className="text-blue-600">Masuk</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-[10px]">
            Daftar
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-20 bg-white">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">
          Hubungi Kami
        </h1>
        <p className="text-gray-600 text-sm">
          Let us know how we can help.
        </p>
      </section>

      {/* Contact Options */}
      <section className="flex justify-center gap-8 px-4 pb-32 mb-40 flex-wrap max-w-screen-lg mx-auto bg-white">
        {/* Chat to support */}
        <div className="border border-blue-400 rounded-lg p-6 w-[300px] h-[312px] text-left hover:shadow-md bg-white flex flex-col justify-center">
          <div className="flex justify-left mb-6">
            <div className="border border-blue-400 rounded-lg w-14 h-14 flex items-center justify-center">
              <FaRegCommentDots className="text-blue-400 text-2xl" />
            </div>
          </div>
          <h3 className="font-bold text-lg mb-1">Chat to support</h3>
          <p className="text-gray-600 text-sm mb-4">were here to help</p>
          <a
            href="mailto:autentik.info@gmail.com"
            className="text-black text-sm underline"
          >
            autentik.info@gmail.com
          </a>
        </div>
        {/* Visit us */}
        <div className="border border-blue-400 rounded-lg p-6 w-[300px] h-[312px] text-left hover:shadow-md bg-white flex flex-col justify-center">
          <div className="flex justify-left mb-6">
            <div className="border border-blue-400 rounded-lg w-14 h-14 flex items-center justify-center">
              <FaMapMarkerAlt className="text-blue-400 text-2xl" />
            </div>
          </div>
          <h3 className="font-bold text-lg mb-1">Visit us</h3>
          <p className="text-gray-600 text-sm mb-4">Visit our office</p>
          <a
            href="https://maps.app.goo.gl/6Qn5k6K7w8v8v8"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black text-sm underline"
          >
            View on Google Maps
          </a>
        </div>
        {/* Call us */}
        <div className="border border-blue-400 rounded-lg p-6 w-[300px] h-[312px] text-left hover:shadow-md bg-white flex flex-col justify-center">
          <div className="flex justify-left mb-6">
            <div className="border border-blue-400 rounded-lg w-14 h-14 flex items-center justify-center">
              <FaPhoneAlt className="text-blue-400 text-2xl" />
            </div>
          </div>
          <h3 className="font-bold text-lg mb-1">Call us</h3>
          <p className="text-gray-600 text-sm mb-4">Mon-Fri from 8am to 5pm</p>
          <a
            href="tel:+6281807700111"
            className="text-black text-sm underline"
          >
            +62 81-807-700-111
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[rgba(56,179,248,0.05)] w-full text-sm text-gray-600 px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-screen-lg mx-auto items-start">
          {/* Kolom 1 */}
          <div className="text-center md:text-left flex flex-col">
            <h4 className="font-semibold text-black mb-2">
              MITRA KARYA GROUP 
            </h4>
            <p>
              Kami adalah perusahaan teknologi pintar yang senantiasa berkomitmen
              untuk memantau dan meningkatkan kepuasan pelanggan
            </p>
            <div className="mt-4 flex justify-center md:justify-start space-x-3 text-blue-600 text-lg">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-800"
              >
                <FaTwitter />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-600"
              >
                <FaInstagram />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-700"
              >
                <FaLinkedinIn />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-600"
              >
                <FaYoutube />
              </a>
              <a
                href="https://wa.me/6281237368111"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-600"
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>
          {/* Kolom 2 */}
          <div className="text-left flex flex-col">
            <h4 className="font-semibold text-black mb-2 pl-12">Perusahaan Kami</h4>
            <ul className="space-y-1 flex items-start flex-col pl-12">
              <li>PT MITRA KARYA ANALITIKA</li>
              <li>PT AUTENTIK KARYA ANALITIKA</li>
            </ul>
          </div>
          {/* Kolom 3 */}
          <div className="text-left flex flex-col">
            <h4 className="font-semibold text-black mb-2 pl-12">Contact</h4>
            <ul className="space-y-1 pl-12">
              <li className="flex items-center gap-2 justify-start">
                <FaPhoneAlt className="text-blue-600" />
                <span>Rudy Alfiansyah:</span>
                <a
                  href="tel:082137384029"
                  className="text-blue-600 hover:underline"
                >
                  082137384029
                </a>
              </li>
              <li className="flex items-center gap-2 pl-5.5 justify-start">
                <span>Deden Dermawan:</span>
                <a
                  href="tel:081807700111"
                  className="text-blue-600 hover:underline"
                >
                  081807700111
                </a>
              </li>
              <li className="flex items-center gap-2 justify-start">
                <FaEnvelope className="text-blue-600" />
                <a
                  href="mailto:autentik.info@gmail.com"
                  className="text-black-600 hover:underline"
                >
                  autentik.info@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2 pl-1 justify-start">
                <FaMapMarkerAlt className="text-blue-600 text-2xl" />
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  href="https://maps.app.goo.gl/6Qn5k6K7w8v8v8v8"
                >
                  Jl. Klipang Ruko Amsterdam No. 9E, Sendangmulyo, Kec. Tembalang, Kota Semarang, Jawa Tengah 50272
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
