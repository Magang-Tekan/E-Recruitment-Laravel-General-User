// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, RefreshCw, LogOut } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-white">
            <Head title="Verifikasi Email" />
            
            <header className="py-3 sm:py-4 px-4 sm:px-6 shadow-sm bg-white/80 backdrop-blur-sm">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="font-bold text-lg sm:text-xl text-black ml-2 sm:ml-8">MITRA KARYA GROUP</div>
                </div>
            </header>
            
            <main className="flex-grow flex items-center justify-center py-8 sm:py-12 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-blue-100/50">
                        <div className="flex justify-center mb-4 sm:mb-6">
                            <div className="bg-blue-100 rounded-full p-3 sm:p-4 animate-pulse">
                                <Mail className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500" />
                            </div>
                        </div>

                        <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                            <h1 className="text-blue-500 text-2xl sm:text-3xl font-bold">Verifikasi Email Anda</h1>
                            <div className="space-y-2">
                                <p className="text-gray-600 text-sm sm:text-base">
                                    Kami telah mengirim email verifikasi ke alamat email Anda.
                                </p>
                                <p className="text-gray-600 text-xs sm:text-sm">
                                    Periksa folder inbox atau spam Anda, lalu klik tautan verifikasi yang ada di email.
                                </p>
                            </div>
                        </div>

                        {status === 'verification-link-sent' && (
                            <div className="mb-4 sm:mb-6 text-center animate-fadeIn">
                                <div className="bg-green-50 border border-green-100 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    <p className="text-xs sm:text-sm font-medium">Link verifikasi baru telah dikirim ke email Anda</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4 sm:space-y-6">
                            <Button 
                                disabled={processing} 
                                type="submit"
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 h-11 sm:h-12 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                {processing ? (
                                    <LoaderCircle className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
                                )}
                                Kirim Ulang Email Verifikasi
                            </Button>

                            <div className="text-center pt-3 sm:pt-4 border-t border-gray-100">
                                <TextLink 
                                    href={route('logout')} 
                                    method="post" 
                                    className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 font-medium no-underline inline-flex items-center gap-2 transition-colors"
                                >
                                    <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                                    Keluar
                                </TextLink>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
