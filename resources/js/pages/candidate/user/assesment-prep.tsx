import React from "react";
import { Link } from "@inertiajs/react";

interface AssessmentPrepProps {
  assessmentId?: number; // ID tes psikotest
}

const AssesmentPrep: React.FC<AssessmentPrepProps> = ({ assessmentId = 1 }) => {
  return (
    <div className="relative flex gap-4">
      <div className="flex-none relative">
        <div className="relative bg-white text-center text-[20px] font-bold flex items-center justify-center w-[60px] h-[60px] rounded-full border-4 border-[#e9eaeb] z-10">
          4
        </div>
        <div className="w-1 h-full absolute top-0 left-1/2 transform -translate-x-1/2 bg-gray-300 z-0"></div>
      </div>
      <div className="flex-1">
        <div className="ml-4">
          <div className="mb-1">
            <h4 className="text-xl font-bold text-gray-700">
              Persiapan Tes Psikotes
            </h4>
          </div>
          <div className="mb-4 text-[16px] text-gray-600">
            <p>
              Silahkan klik tombol di bawah untuk memulai tes psikotes Anda.
            </p>
            <p>
              Pastikan Anda memiliki koneksi internet yang stabil dan waktu yang
              tenang untuk mengerjakan.
            </p>
          </div>

          <div className="mt-4">
            <Link
              href={`/candidate/tests/psychotest/${assessmentId}`}
              className="inline-flex items-center font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 px-4 py-2 transition"
            >
              Lanjut Persiapan Test
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssesmentPrep;