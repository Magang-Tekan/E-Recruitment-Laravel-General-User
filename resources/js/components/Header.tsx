import { Link, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { SharedData } from '@/types';

const Header = () => {
    const { auth } = usePage<SharedData>().props;
    const [showDropdown, setShowDropdown] = useState(false);

    // Add click outside handler to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const dropdown = document.getElementById('profile-dropdown');
            if (dropdown && !dropdown.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="fixed top-0 right-0 left-0 z-50 h-[80px] border-b border-gray-200 bg-white px-[20px] shadow">
            <div className="container mx-auto flex items-center justify-between px-6 py-4">
                <div className="text-[20px] font-bold text-gray-800">MITRA KARYA GROUP</div>

                <nav className="hidden space-x-[24px] text-[14px] font-medium md:flex">
                    <Link href="/" className="text-gray-900 hover:text-blue-600">
                        Beranda
                    </Link>
                    <Link href="/job-hiring-landing-page" className="text-gray-900 hover:text-blue-600">
                        Lowongan Pekerjaan
                    </Link>
                    <Link href="/about-us" className="text-gray-900 hover:text-blue-600">
                        Tentang Kami
                    </Link>
                    <Link href="/contact" className="text-gray-900 hover:text-blue-600">
                        Kontak
                    </Link>
                </nav>
                
                <div className="flex items-center gap-4">
                    {auth?.user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="w-10 h-10 border-2 border-[#0047FF] rounded-full flex items-center justify-center text-[#0047FF] hover:bg-blue-50"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </button>
                            {showDropdown && (
                                <div
                                    id="profile-dropdown"
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-md py-1 z-50 border border-gray-300"
                                    onBlur={() => setShowDropdown(false)}
                                >
                                    <div className="px-4 py-2">
                                        <p className="text-sm font-medium text-gray-900">{auth.user.name}</p>
                                        <p className="text-sm text-gray-500">{auth.user.email}</p>
                                    </div>
                                    <Link
                                        href="/candidate/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Profil Saya
                                    </Link>
                                    <form method="POST" action="/logout">
                                        <input
                                            type="hidden"
                                            name="_token"
                                            value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''}
                                        />
                                        <button
                                            type="submit"
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="text-sm font-medium text-blue-600 hover:underline"
                            >
                                Masuk
                            </Link>
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
    );
};

export default Header;
