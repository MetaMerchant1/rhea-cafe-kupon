'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/anasayfa.jpg"
          alt="Rhea Cafe"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="Rhea Cafe Logo"
            width={120}
            height={120}
            className="drop-shadow-2xl"
          />
        </div>

        {/* Glass Card */}
        <div className="w-full max-w-md">
          <div className="glass-card p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
              Rhea Cafe
            </h1>
            <p className="text-white/90 text-lg mb-6">
              Hosgeldiniz
            </p>

            <div className="space-y-4">
              {/* Anket Butonu */}
              <Link
                href="/anket"
                className="glass-button block w-full py-4 px-6 text-white font-semibold text-lg rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/30"
              >
                <span className="flex items-center justify-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                  Anketi Doldur ve Kazan
                </span>
              </Link>

              {/* Indirim Bilgisi */}
              <div className="glass-card-light p-4 rounded-2xl">
                <p className="text-white/90 text-sm">
                  Anketi tamamla, <strong className="text-white">%10 indirim</strong> kazan!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-white/60 text-sm">
          Rhea Cafe &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
