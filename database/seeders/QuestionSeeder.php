<?php

namespace Database\Seeders;

use App\Models\Question;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Tes Kemampuan Logika
        $logicQuestions = [
            [
                'question_text' => 'Jika 3 + 7 = 10 dan 5 × 2 = 10, maka 9 - ? = 5',
                'options' => ['4', '5', '3', '6']
            ],
            [
                'question_text' => 'Manakah dari pilihan berikut yang menyambung pola: 2, 4, 8, 16, ...',
                'options' => ['32', '24', '20', '18']
            ],
            [
                'question_text' => 'Jika semua bunga adalah merah, dan semua bunga mawar, maka pernyataan mana yang benar?',
                'options' => [
                    'Semua mawar adalah merah',
                    'Beberapa mawar tidak merah',
                    'Semua yang merah adalah mawar',
                    'Tidak ada bunga yang merah'
                ]
            ],
            [
                'question_text' => 'Ana lebih tinggi dari Budi. Clara lebih pendek dari Budi. Dani lebih tinggi dari Ana. Siapa yang paling tinggi?',
                'options' => ['Dani', 'Ana', 'Budi', 'Clara']
            ],
            [
                'question_text' => 'Jika ABCDE adalah 12345, maka EDCBA adalah...',
                'options' => ['54321', '12345', '51423', '15243']
            ],
        ];

        // 2. Tes Bahasa Inggris
        $englishQuestions = [
            [
                'question_text' => 'Write a paragraph about your career goals in English (minimum 150 words).',
                'options' => []
            ],
            [
                'question_text' => 'Translate the following text into English: "Perusahaan kami berkomitmen untuk memberikan pelayanan terbaik kepada seluruh pelanggan."',
                'options' => []
            ],
            [
                'question_text' => 'Correct this sentence: "I have went to the office yesterday and submited my report."',
                'options' => []
            ],
        ];

        // 3. Tes Kemampuan Teknis Programmer
        $technicalQuestions = [
            [
                'question_text' => 'Write a function that checks if a string is a palindrome.',
                'options' => []
            ],
            [
                'question_text' => 'Create a simple API endpoint that returns a list of users using Laravel.',
                'options' => []
            ],
            [
                'question_text' => 'Design a simple database schema for an e-commerce application with users, products, and orders.',
                'options' => []
            ],
        ];

        // 4. Tes Kepribadian
        $personalityQuestions = [
            [
                'question_text' => 'Bagaimana Anda biasanya bereaksi terhadap kritik?',
                'options' => [
                    'Saya menerima dengan terbuka dan menggunakannya untuk perbaikan',
                    'Saya cenderung defensif dan merasa tidak nyaman',
                    'Saya mengabaikannya dan melanjutkan pekerjaan saya',
                    'Saya mencari validasi dari orang lain untuk memastikan kritik itu tidak benar'
                ]
            ],
            [
                'question_text' => 'Ketika menghadapi deadline yang ketat, apa yang biasanya Anda lakukan?',
                'options' => [
                    'Saya membuat rencana detail dan mengikutinya dengan disiplin',
                    'Saya bekerja secepat mungkin dan memprioritaskan tugas penting',
                    'Saya meminta bantuan dari rekan untuk menyelesaikan tepat waktu',
                    'Saya bekerja lembur untuk memastikan semuanya selesai'
                ]
            ],
            [
                'question_text' => 'Bagaimana perasaan Anda tentang perubahan mendadak dalam rencana kerja?',
                'options' => [
                    'Saya menyukainya karena memberi tantangan baru',
                    'Saya merasa stres tapi bisa beradaptasi',
                    'Saya lebih suka stabilitas dan perencanaan yang matang',
                    'Saya menerima perubahan jika ada alasan yang valid'
                ]
            ],
            [
                'question_text' => 'Dalam tim kerja, peran apa yang paling sering Anda ambil?',
                'options' => [
                    'Pemimpin yang mengatur strategi dan arah',
                    'Anggota yang berkontribusi aktif dalam diskusi',
                    'Mediator yang menjaga harmoni dan menyelesaikan konflik',
                    'Eksekutor yang memastikan pekerjaan selesai dengan baik'
                ]
            ],
            [
                'question_text' => 'Bagaimana Anda menangani kegagalan dalam proyek penting?',
                'options' => [
                    'Saya menganalisis penyebabnya dan belajar dari kesalahan',
                    'Saya merasa kecewa tapi segera mencari solusi',
                    'Saya mencari dukungan dari rekan atau mentor',
                    'Saya mengambil tanggung jawab penuh dan berusaha memperbaikinya'
                ]
            ],
        ];

        // 5. Tes Kemampuan Analitis
        $analyticalQuestions = [
            [
                'question_text' => 'Studi Kasus: Perusahaan XYZ mengalami penurunan penjualan sebesar 20% dalam dua kuartal terakhir. Sebagai konsultan, identifikasi tiga penyebab potensial dan berikan rekomendasi untuk meningkatkan penjualan.',
                'options' => []
            ],
            [
                'question_text' => 'Analisis data berikut dan buat kesimpulan tentang tren penjualan produk: [Tabel data penjualan bulanan selama 12 bulan terakhir]',
                'options' => []
            ],
            [
                'question_text' => 'Perusahaan mempertimbangkan untuk meluncurkan produk baru dengan biaya pengembangan Rp 500 juta. Berdasarkan proyeksi pendapatan Rp 200 juta per tahun selama 5 tahun, apakah investasi ini layak? Jelaskan analisis Anda.',
                'options' => []
            ],
        ];

        // Menggabungkan semua pertanyaan
        $allQuestions = [
            1 => $logicQuestions,        // assessment_id = 1
            2 => $englishQuestions,      // assessment_id = 2
            3 => $technicalQuestions,    // assessment_id = 3
            4 => $personalityQuestions,  // assessment_id = 4
            5 => $analyticalQuestions,   // assessment_id = 5
        ];

        // Menyisipkan data pertanyaan ke database
        $questionCount = 0;
        foreach ($allQuestions as $assessmentId => $questions) {
            foreach ($questions as $question) {
                Question::create([
                    'assessment_id' => $assessmentId,
                    'question_text' => $question['question_text'],
                    'options' => $question['options']
                    // Menghilangkan field question_type karena tidak ada dalam tabel
                ]);
                $questionCount++;
            }
        }

        $this->command->info("Berhasil menambahkan $questionCount pertanyaan untuk semua jenis assessments.");
    }
}
