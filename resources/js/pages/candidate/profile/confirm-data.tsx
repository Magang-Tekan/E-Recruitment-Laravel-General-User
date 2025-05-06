import React from "react";
import { ChevronDown, AlertCircle } from "lucide-react";

const ConfirmData = () => {
  const sections = [
    "Data Pribadi",
    "Pendidikan",
    "Pengalaman Kerja",
    "Organisasi",
    "Prestasi",
    "Social Media",
    "Data Tambahan",
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Header */}
      <header className="border-b p-4 flex justify-between items-center">
        <h1 className="font-bold text-sm">MITRA KARYA GROUP</h1>
        <nav className="flex gap-6 text-sm text-gray-700">
          <a href="#">Dasbor</a>
          <a href="#">Profil</a>
          <a href="#">Lowongan Pekerjaan</a>
          <a href="#">Lamaran</a>
        </nav>
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
          <span className="text-sm font-semibold">U</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-2">
          Konfirmasi Kelengkapan Data
        </h2>
        <p className="text-center text-gray-600 mb-6 text-sm">
          Sebelum melamar pekerjaan, pastikan Anda telah melengkapi data profil Anda
        </p>

        <div className="space-y-3">
          {sections.map((section, idx) => (
            <div key={idx} className="border rounded-md px-4 py-3 flex justify-between items-center bg-white shadow-sm">
              <div className="flex items-center gap-2">
                <ChevronDown className="w-4 h-4 text-gray-500" />
                <span>{section}</span>
              </div>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          ))}
        </div>

        {/* Alert */}
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mt-6 text-sm">
          Harap lengkapi profil Anda terlebih dahulu untuk melamar pekerjaan ini.
        </div>

        {/* Button */}
        <div className="text-center mt-6">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-8 rounded">
            Lamar
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-50 text-sm text-gray-600 p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <strong>PT MITRA KARYA ANALITIKA</strong>
            <p>Konsultan pengembangan strategi SDM dan assessment center.</p>
          </div>
          <div>
            <p><strong>Perusahaan Kami</strong></p>
            <p>PT MITRA KARYA ANALITIKA</p>
            <p>PT AKHLAK ANALITIKA</p>
          </div>
          <div>
            <p><strong>Contact</strong></p>
            <p>Email: admin@mka.co.id</p>
            <p>Telepon: 0817-0705-8955</p>
            <p>Jl. Amarta No. 6, Surakarta</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ConfirmData;
