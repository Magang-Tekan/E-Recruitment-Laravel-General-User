import React from 'react';
import { usePage } from '@inertiajs/react';
import AdministrationPassed from './user/administration-passed';
import AssesmentOngoing from './user/assesment-ongoing';
import AssesmentPrep from './user/assesment-prep';
import InterviewPending from './user/interview-pending';


interface PageProps {
  application: {
    id: number;
    job_title: string;
    company_name: string;
    status: string;
    applied_date: string;
    assessment_id?: number; // ID assessment untuk psychotest
  };
  user: {
    name: string;
    profile_image?: string;
  };
  [key: string]: any; // Add index signature for Inertia PageProps compatibility
}

const CandidateStatus = () => {
  const { application, user } = usePage<PageProps>().props;
  
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <nav className="bg-white shadow-md px-11 py-4 relative flex items-center justify-between">
        <div className="text-xl font-bold text-gray-800">MITRA KARYA GROUP</div>

        <ul className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-6 text-gray-800 font-medium text-[16px]">
          <li><a href="/candidate/profile" className="hover:text-blue-600">Profil</a></li>
          <li><a href="/candidate/jobs" className="hover:text-blue-600">Lowongan Pekerjaan</a></li>
          <li><a href="/candidate/application-history" className="hover:text-blue-600">Lamaran</a></li>
        </ul>

        <img 
          src={user.profile_image || "../images/profileicon.png"} 
          alt="Profile Icon"
          className="w-6 h-6 object-cover rounded-full"
        />
      </nav>

      <div className="min-h-screen bg-[#f0f0f0] px-4 py-8">
        <div className="max-w-[1250px] mx-auto bg-[#f2f5fe] shadow-md rounded-2xl p-6">
          <div className="flex items-start space-x-6">
            <div className="py-3">
            <img
              src={user.profile_image || "../images/profileicon.png"}
              alt="Profile"
              className="w-[130px] h-[130px] rounded-full object-cover border-4 border-white shadow"
            />
            </div>

            <div>
              <h2 className="text-[30px] font-semibold text-gray-800">
                {user.name}
              </h2>
              <div className="space-y-1 mt-2">
                <div className="text-gray-800 font-normal text-[18px]">
                  Posisi yang dilamar : {application.job_title}
                </div>
                <div className="text-gray-800 font-medium text-[18px]">
                  {application.company_name}
                </div>
                <div className="inline-block px-4 py-1 rounded-lg bg-[#dee9fe] text-[#2b7fff] font-medium text-[14px] mt-2">
                  Lamaran : {application.applied_date}
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-gray-800 font-bold px-8 py-6 text-[25px]">
          Tahapan Rekrutmen
        </h2>

        <div className="flex">
          <div className="relative w-6 h- flex flex-col items-center">
            <div className="absolute top-0 left-22 transform h-[1170px] w-1 bg-gray-300 z-0"></div>
          </div>
        </div>

        <div className="ml-auto px-8 space-y-12">
          <AdministrationPassed />
          <AssesmentOngoing />
          <InterviewPending />
          {/* Teruskan assessment_id ke AssesmentPrep */}
          <AssesmentPrep assessmentId={application.assessment_id} />
        </div>
      </div>
    </div>
  );
};

export default CandidateStatus;
