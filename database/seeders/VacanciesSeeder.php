<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Company;
use App\Models\User;
use App\Models\Vacancies;
use App\Models\QuestionPack;
use App\Models\Department; // Import model yang benar
use App\Models\MasterMajor;
use App\Models\VacancyType;
use App\Models\EducationLevel;
use Illuminate\Database\Seeder;

class VacanciesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get required data
        $user = User::where('role', UserRole::HR->value)->first() ?? User::factory()->create(['role' => UserRole::HR->value]);
        $companies = Company::all();
        $questionPacks = QuestionPack::all();
        $departments = Department::all(); // Ubah dari Departments ke Department
        $majors = MasterMajor::all();
        $vacancyTypes = VacancyType::all();
        $educationLevels = EducationLevel::all();

        // Check if dependencies exist
        if ($companies->isEmpty()) {
            $this->command->info('No companies found. Running CompanySeeder first.');
            $this->call(CompaniesSeeder::class);
            $companies = Company::all();
        }

        if ($questionPacks->isEmpty()) {
            $this->command->info('No question packs found. Running QuestionPackSeeder first.');
            $this->call(QuestionPackSeeder::class);
            $questionPacks = QuestionPack::all();
        }

        if ($departments->isEmpty()) {
            $this->command->info('No departments found. Running DepartmentSeeder first.');
            $this->call(DepartmentSeeder::class); // Ubah nama seeder
            $departments = Department::all(); // Ubah model
        }

        if ($majors->isEmpty()) {
            $this->command->info('No majors found. Running MasterMajorSeeder first.');
            $this->call(MasterMajorSeeder::class);
            $majors = MasterMajor::all();
        }

        if ($vacancyTypes->isEmpty()) {
            $this->command->info('No vacancy types found. Running VacancyTypeSeeder first.');
            $this->call(VacanciesTypesSeeder::class);
            $vacancyTypes = VacancyType::all();
        }

        if ($educationLevels->isEmpty()) {
            $this->command->info('No education levels found. Running EducationLevelSeeder first.');
            $this->call(EducationLevelSeeder::class);
            $educationLevels = EducationLevel::all();
        }

        // Indonesian job vacancies data dengan education level mapping
        $vacanciesData = [
            [
                'title' => 'Software Engineer',
                'job_description' => 'Posisi Software Engineer bertanggung jawab untuk merancang, mengembangkan, dan memelihara aplikasi perangkat lunak sesuai dengan kebutuhan bisnis. Anda akan bekerja dalam tim pengembangan yang dinamis, menggunakan teknologi terkini untuk menciptakan solusi inovatif. Posisi ini memerlukan kemampuan problem-solving yang kuat dan ketertarikan untuk terus belajar teknologi baru.',
                'department' => 'Teknologi Informasi',
                'major' => 'Teknik Informatika',
                'vacancy_type' => 'Full Time',
                'education_level' => 'D4/S1', // Tambahan
                'location' => 'Jakarta',
                'salary' => 'Rp. 8.000.000 - 15.000.000',
                'requirements' => [
                    'Lulusan S1 Teknik Informatika atau Ilmu Komputer',
                    'Pengalaman minimal 2 tahun dalam pengembangan software',
                    'Menguasai bahasa pemrograman Java, Python, atau JavaScript',
                    'Familiar dengan framework seperti Spring, React, atau Angular',
                    'Memiliki kemampuan problem solving yang baik',
                    'Mampu bekerja dalam tim dan komunikatif'
                ],
                'benefits' => [
                    'Gaji kompetitif sesuai pengalaman',
                    'Asuransi kesehatan keluarga',
                    'Tunjangan transport dan makan',
                    'Program training dan sertifikasi',
                    'Flexible working hours',
                    'Annual bonus dan THR'
                ]
            ],
            [
                'title' => 'Digital Marketing Specialist',
                'job_description' => 'Digital Marketing Specialist akan bertanggung jawab untuk merencanakan dan melaksanakan strategi pemasaran digital yang efektif. Anda akan mengelola kampanye iklan online, media sosial, email marketing, dan konten untuk meningkatkan brand awareness dan lead generation. Posisi ini memerlukan kreativitas dan kemampuan analitis untuk mengoptimalkan kampanye digital.',
                'department' => 'Pemasaran',
                'major' => 'Ilmu Komunikasi',
                'vacancy_type' => 'Full Time',
                'education_level' => 'D4/S1', // Tambahan
                'location' => 'Bandung',
                'salary' => 'Rp. 5.000.000 - 9.000.000',
                'requirements' => [
                    'Lulusan S1 Marketing, Komunikasi, atau bidang terkait',
                    'Pengalaman minimal 1 tahun di digital marketing',
                    'Menguasai Google Ads, Facebook Ads, Instagram Ads',
                    'Familiar dengan SEO/SEM dan Google Analytics',
                    'Kreatif dan up-to-date dengan tren digital',
                    'Kemampuan analisis data yang baik'
                ],
                'benefits' => [
                    'Gaji pokok + komisi performance',
                    'BPJS Kesehatan dan Ketenagakerjaan',
                    'Tunjangan pulsa dan internet',
                    'Pelatihan digital marketing berkala',
                    'Kesempatan mengikuti seminar dan workshop',
                    'Career development program'
                ]
            ],
            [
                'title' => 'Financial Analyst',
                'job_description' => 'Sebagai Financial Analyst, Anda akan menganalisis data keuangan, membuat laporan, dan memberikan rekomendasi untuk pengambilan keputusan bisnis. Tanggung jawab termasuk melakukan analisis biaya, forecasting, budgeting, dan evaluasi kinerja finansial. Posisi ini memerlukan ketelitian tinggi dan kemampuan analitis yang kuat.',
                'department' => 'Keuangan dan Akuntansi',
                'major' => 'Akuntansi',
                'vacancy_type' => 'Full Time',
                'education_level' => 'D4/S1', // Tambahan
                'location' => 'Surabaya',
                'salary' => 'Rp. 6.000.000 - 10.000.000',
                'requirements' => [
                    'Lulusan S1 Akuntansi, Keuangan, atau Ekonomi',
                    'Pengalaman 1-3 tahun di bidang finance/accounting',
                    'Menguasai Microsoft Excel tingkat advanced',
                    'Familiar dengan software akuntansi (SAP, Oracle, dll)',
                    'Memiliki sertifikasi Brevet A/B (nilai plus)',
                    'Detail oriented dan analytical thinking'
                ],
                'benefits' => [
                    'Gaji kompetitif',
                    'Asuransi kesehatan keluarga',
                    'Tunjangan makan dan transport',
                    'Program sertifikasi profesi',
                    'Bonus tahunan',
                    'Jenjang karir yang jelas'
                ]
            ],
            [
                'title' => 'Human Resources Generalist',
                'job_description' => 'HR Generalist akan mengelola berbagai aspek sumber daya manusia termasuk rekrutmen, onboarding, administrasi kepegawaian, dan employee relation. Anda akan bekerja sama dengan tim manajemen untuk mengembangkan dan mengimplementasikan kebijakan HR yang efektif serta memastikan kepatuhan terhadap regulasi ketenagakerjaan.',
                'department' => 'Sumber Daya Manusia',
                'major' => 'Psikologi',
                'vacancy_type' => 'Full Time',
                'education_level' => 'D4/S1', // Tambahan
                'location' => 'Yogyakarta',
                'salary' => 'Rp. 4.500.000 - 7.500.000',
                'requirements' => [
                    'Lulusan S1 Psikologi, Manajemen SDM, atau bidang terkait',
                    'Pengalaman minimal 2 tahun di bidang HR',
                    'Memahami employment law dan regulasi ketenagakerjaan',
                    'Menguasai proses recruitment dan selection',
                    'Kemampuan komunikasi dan interpersonal yang baik',
                    'Familiar dengan HRIS dan payroll system'
                ],
                'benefits' => [
                    'Gaji pokok kompetitif',
                    'BPJS Kesehatan dan Ketenagakerjaan',
                    'Tunjangan kesehatan keluarga',
                    'Program pelatihan HR',
                    'Flexible working arrangement',
                    'THR dan bonus kinerja'
                ]
            ],
            [
                'title' => 'Data Analyst',
                'job_description' => 'Sebagai Data Analyst, Anda akan mengumpulkan, mengolah, dan menganalisis data untuk memberikan insight bisnis yang berharga. Anda akan bekerja dengan dataset besar, membuat visualisasi data, dan menyediakan laporan yang membantu pengambilan keputusan. Posisi ini memerlukan kemampuan teknis dan analitis yang kuat.',
                'department' => 'Data Analytics',
                'major' => 'Statistika',
                'vacancy_type' => 'Full Time',
                'education_level' => 'D4/S1', // Tambahan
                'location' => 'Jakarta',
                'salary' => 'Rp. 7.000.000 - 12.000.000',
                'requirements' => [
                    'Lulusan S1 Statistika, Matematika, atau Teknik Informatika',
                    'Pengalaman minimal 1 tahun dalam data analysis',
                    'Menguasai SQL, Python, R, atau tools analytics lainnya',
                    'Familiar dengan data visualization tools (Tableau, Power BI)',
                    'Kemampuan statistical analysis dan machine learning',
                    'Critical thinking dan problem solving'
                ],
                'benefits' => [
                    'Gaji kompetitif',
                    'Asuransi kesehatan premium',
                    'Learning budget untuk course online',
                    'Remote working flexibility',
                    'Stock option program',
                    'Annual company retreat'
                ]
            ],
            [
                'title' => 'Project Manager',
                'job_description' => 'Project Manager bertanggung jawab untuk merencanakan, melaksanakan, dan menyelesaikan proyek sesuai dengan timeline dan budget yang ditentukan. Anda akan memimpin tim proyek, mengelola risiko, berkomunikasi dengan stakeholders, dan memastikan kualitas deliverables. Posisi ini memerlukan kemampuan kepemimpinan dan manajemen yang baik.',
                'department' => 'Project Management',
                'major' => 'Teknik Industri',
                'vacancy_type' => 'Full Time',
                'education_level' => 'S2', // Tambahan - level lebih tinggi untuk manager
                'location' => 'Medan',
                'salary' => 'Rp. 9.000.000 - 16.000.000',
                'requirements' => [
                    'Lulusan S1 Teknik Industri, Manajemen, atau bidang terkait',
                    'Pengalaman minimal 3 tahun sebagai Project Manager',
                    'Memiliki sertifikasi PMP atau Prince2 (nilai plus)',
                    'Menguasai project management tools (MS Project, Jira, Trello)',
                    'Leadership dan team management skills',
                    'Kemampuan komunikasi dan negosiasi yang excellent'
                ],
                'benefits' => [
                    'Gaji pokok tinggi + project bonus',
                    'Asuransi kesehatan keluarga premium',
                    'Tunjangan jabatan dan representasi',
                    'Program leadership development',
                    'Car allowance',
                    'Profit sharing program'
                ]
            ],
            [
                'title' => 'UI/UX Designer',
                'job_description' => 'UI/UX Designer akan merancang antarmuka dan pengalaman pengguna yang intuitif dan menarik untuk aplikasi dan website. Anda akan melakukan riset pengguna, membuat wireframe, prototype, dan desain visual yang mempertimbangkan aspek user-centered design. Posisi ini memerlukan kreativitas dan pemahaman tentang perilaku pengguna.',
                'department' => 'Design',
                'major' => 'Desain Komunikasi Visual',
                'vacancy_type' => 'Full Time',
                'education_level' => 'D3', // Tambahan - bisa D3 untuk designer
                'location' => 'Bali',
                'salary' => 'Rp. 6.000.000 - 11.000.000',
                'requirements' => [
                    'Lulusan S1 DKV, Desain Produk, atau bidang terkait',
                    'Portfolio yang menunjukkan kemampuan UI/UX design',
                    'Menguasai Figma, Sketch, Adobe XD, dan Photoshop',
                    'Pemahaman user research dan usability testing',
                    'Up-to-date dengan design trends dan best practices',
                    'Kemampuan presentasi dan storytelling'
                ],
                'benefits' => [
                    'Gaji kompetitif',
                    'Creative workspace environment',
                    'Allowance untuk design tools dan software',
                    'Konferensi dan workshop design',
                    'Flexible working hours',
                    'Unlimited creative freedom'
                ]
            ],
            [
                'title' => 'Sales Executive',
                'job_description' => 'Sales Executive bertanggung jawab untuk mencapai target penjualan melalui akuisisi klien baru dan pengembangan klien yang ada. Anda akan melakukan presentasi produk, negosiasi, dan membangun hubungan jangka panjang dengan klien. Posisi ini memerlukan kemampuan komunikasi, persuasi, dan negosiasi yang baik.',
                'department' => 'Sales',
                'major' => 'Manajemen',
                'vacancy_type' => 'Full Time',
                'education_level' => 'D4/S1', // Tambahan
                'location' => 'Semarang',
                'salary' => 'Rp. 4.000.000 - 8.000.000',
                'requirements' => [
                    'Lulusan S1 semua jurusan, diutamakan Manajemen atau Marketing',
                    'Pengalaman sales minimal 1 tahun (fresh graduate welcome)',
                    'Target oriented dan result driven',
                    'Kemampuan komunikasi dan presentasi yang baik',
                    'Memiliki kendaraan dan SIM A',
                    'Bersedia melakukan perjalanan dinas'
                ],
                'benefits' => [
                    'Gaji pokok + komisi tanpa batas',
                    'Tunjangan BBM dan maintenance kendaraan',
                    'Incentive trip untuk top performer',
                    'Career advancement yang cepat',
                    'Sales training intensif',
                    'Bonus achievement bulanan'
                ]
            ],
            [
                'title' => 'Content Creator',
                'job_description' => 'Content Creator akan menghasilkan konten kreatif dan menarik untuk platform digital perusahaan. Anda akan membuat konten video, foto, artikel, dan posting media sosial yang sesuai dengan brand voice dan strategi pemasaran. Posisi ini memerlukan kreativitas, kemampuan storytelling, dan pemahaman tentang tren digital.',
                'department' => 'Content Management',
                'major' => 'Ilmu Komunikasi',
                'vacancy_type' => 'Part Time',
                'education_level' => 'SMA/SMK', // Tambahan - bisa SMA untuk content creator
                'location' => 'Remote',
                'salary' => 'Rp. 3.000.000 - 6.000.000',
                'requirements' => [
                    'Lulusan SMA/S1 semua jurusan',
                    'Portfolio content creation (video, foto, tulisan)',
                    'Menguasai aplikasi editing (Canva, Adobe, Capcut)',
                    'Pemahaman social media trends dan algoritma',
                    'Kreatif, inovatif, dan storytelling skills',
                    'Kemampuan riset dan copywriting'
                ],
                'benefits' => [
                    'Flexible working time',
                    'Work from anywhere',
                    'Creative freedom',
                    'Performance based salary',
                    'Access to premium design tools',
                    'Networking opportunities'
                ]
            ],
            [
                'title' => 'Customer Service Representative',
                'job_description' => 'Customer Service Representative bertanggung jawab untuk memberikan pelayanan yang excellent kepada pelanggan melalui berbagai saluran komunikasi. Anda akan menangani pertanyaan, keluhan, dan permintaan pelanggan dengan profesional dan efisien. Posisi ini memerlukan kesabaran, empati, dan kemampuan komunikasi yang baik.',
                'department' => 'Customer Service',
                'major' => 'Ilmu Komunikasi',
                'vacancy_type' => 'Full Time',
                'education_level' => 'D3', // Tambahan
                'location' => 'Jakarta',
                'salary' => 'Rp. 3.500.000 - 5.500.000',
                'requirements' => [
                    'Lulusan D3/S1 semua jurusan',
                    'Fresh graduate atau pengalaman customer service',
                    'Kemampuan komunikasi yang excellent',
                    'Sabar, empati, dan problem solving skills',
                    'Familiar dengan CRM system',
                    'Shift kerja dan multitasking'
                ],
                'benefits' => [
                    'Gaji pokok + tunjangan shift',
                    'BPJS Kesehatan dan Ketenagakerjaan',
                    'Meal allowance',
                    'Customer service training',
                    'Performance bonus',
                    'Career development program'
                ]
            ]
        ];

        // Create vacancies
        foreach ($vacanciesData as $vacancyData) {
            $department = $departments->where('name', $vacancyData['department'])->first();
            $major = $majors->where('name', $vacancyData['major'])->first();
            $vacancyType = $vacancyTypes->where('name', $vacancyData['vacancy_type'])->first();
            $educationLevel = $educationLevels->where('name', $vacancyData['education_level'])->first();
            $company = $companies->random();
            $questionPack = $questionPacks->random();

            // Fallback if specific data not found
            if (!$department) $department = $departments->random();
            if (!$major) $major = $majors->random();
            if (!$vacancyType) $vacancyType = $vacancyTypes->random();
            if (!$educationLevel) $educationLevel = $educationLevels->random();

            Vacancies::create([
                'title' => $vacancyData['title'],
                'job_description' => $vacancyData['job_description'],
                'department_id' => $department->id,
                'major_id' => $major->id,
                'vacancy_type_id' => $vacancyType->id,
                'education_level_id' => $educationLevel->id,
                'location' => $vacancyData['location'],
                'salary' => $vacancyData['salary'],
                'requirements' => $vacancyData['requirements'], // Tidak perlu json_encode jika cast sudah array
                'benefits' => $vacancyData['benefits'], // Tidak perlu json_encode jika cast sudah array
                'user_id' => $user->id,
                'company_id' => $company->id,
                'question_pack_id' => $questionPack->id,
            ]);
        }

        $this->command->info('Successfully created ' . count($vacanciesData) . ' vacancies with Indonesian data including education levels.');
    }
}
