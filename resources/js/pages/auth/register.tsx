import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type RegisterForm = {
    no_ektp: string;
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

interface RegisterProps {
    status?: string;
}

export default function Register({ status }: RegisterProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        no_ektp: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Head title="Daftar" />

            <header className="fixed top-0 left-0 right-0 bg-white py-4 px-4 sm:px-6 shadow z-10">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="font-bold text-lg sm:text-xl text-black ml-2 sm:ml-8">MITRA KARYA GROUP</div>
                    <div className="flex items-center gap-x-2 sm:gap-x-4">
                        <Link
                            href={route('login')}
                            className="px-2 sm:px-4 py-2 border-blue-500 text-blue-500 font-medium hover:bg-blue-50 transition text-sm sm:text-base"
                        >
                            Masuk
                        </Link>
                        <a
                            href="#"
                            className="px-2 sm:px-4 py-2 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 transition text-sm sm:text-base"
                        >
                            Daftar
                        </a>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center py-8 sm:py-12 px-4 pt-28 sm:pt-32">
                <div className="grid grid-cols-1 place-items-center w-full">
                    <div className="w-full max-w-3xl text-center mb-4 sm:mb-6">
                        <h1 className="text-blue-500 text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
                            Mulai Karier Impian Anda Hari Ini!
                        </h1>
                        <div className="max-w-xl mx-auto px-4 sm:px-0">
                        <p className="text-gray-600 text-sm">
                            Bergabunglah dengan ribuan profesional yang telah menemukan pekerjaan impian mereka.
                            Daftar sekarang dan temukan kesempatan terbaik untuk masa depan Anda!
                        </p>
                        </div>
                    </div>

                    <form className="flex flex-col gap-4 w-full max-w-sm sm:max-w-md px-4 sm:px-0" onSubmit={submit}>
                        <div className="space-y-3 sm:space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ektp" className="text-sm sm:text-base font-medium text-black">No E-KTP</Label>
                                <Input
                                    id="ektp"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    value={data.no_ektp}
                                    onChange={(e) => setData('no_ektp', e.target.value)}
                                    placeholder="Masukkan No E-KTP Anda"
                                    className="w-full bg-gray-100 text-black"
                                />
                                <InputError message={errors.no_ektp} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nama" className="text-sm sm:text-base font-medium text-black">Nama Lengkap</Label>
                                <Input
                                    id="nama"
                                    type="text"
                                    required
                                    tabIndex={2}
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Masukkan nama lengkap Anda"
                                    className="w-full bg-gray-100 text-black"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm sm:text-base font-medium text-black">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={3}
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Masukkan alamat email Anda"
                                    className="w-full bg-gray-100 text-black"
                                />
                                <InputError message={errors.email} />
                                <p className="text-xs text-gray-500">
                                    Anda akan menerima pemberituan pengumuman di alamat email yang didaftarkan.
                                    Pastikan menggunakan alamat email pribadi yang aktif.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm sm:text-base font-medium text-black">Kata Sandi</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Buat kata sandi Anda"
                                        className="w-full bg-gray-100 text-black pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                                <p className="text-xs text-gray-500">
                                    Kata sandi minimal terdiri 8 karakter, satu huruf kecil, satu huruf besar, satu angka
                                    dan satu spesial karakter.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation" className="text-sm sm:text-base font-medium text-black">Konfirmasi Kata Sandi</Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={showPasswordConfirm ? "text" : "password"}
                                        required
                                        tabIndex={5}
                                        autoComplete="new-password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Masukkan ulang kata sandi Anda"
                                        className="w-full bg-gray-100 text-black pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPasswordConfirm ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 sm:py-2 h-12 sm:h-10 mt-6 sm:mt-4 text-base sm:text-sm"
                                tabIndex={5}
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                Daftar
                            </Button>
                        </div>

                        <div className="text-center text-sm mt-6 sm:mt-4 font-medium">
                            <p className="text-gray-600">
                                Sudah mempunyai akun? <TextLink href={route('login')} className="text-blue-500 hover:text-blue-700 no-underline" tabIndex={6}>
                                    Masuk
                                </TextLink>
                            </p>
                        </div>
                    </form>

                    {status && (
                        <div className="mt-4 text-center text-sm font-medium text-green-600">
                            {status}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
