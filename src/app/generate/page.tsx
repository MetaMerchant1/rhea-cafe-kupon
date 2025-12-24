'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import CountdownTimer from '@/components/CountdownTimer';
import { getVerificationUrl } from '@/lib/utils';

interface CouponData {
  id: string;
  code: string;
  created_at: string;
  expires_at: string;
}

function LoadingState() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/anasayfa.jpg"
          alt="Rhea Cafe"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
        <p className="mt-4 text-white font-medium">Kuponunuz hazirlaniyor...</p>
      </div>
    </div>
  );
}

function GenerateContent() {
  const searchParams = useSearchParams();
  const [coupon, setCoupon] = useState<CouponData | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const code = searchParams.get('code');

        // Kod yoksa ankete yonlendir
        if (!code) {
          setError('Kupon kodu bulunamadi. Lutfen anketi tamamlayin.');
          setIsLoading(false);
          return;
        }

        // Kupon bilgisini API'den al
        const response = await fetch(`/api/coupons/info?code=${code}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Kupon bulunamadi');
        }

        setCoupon(data.coupon);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupon();
  }, [searchParams]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        {/* Background */}
        <div className="fixed inset-0 z-0">
          <Image
            src="/anasayfa.jpg"
            alt="Rhea Cafe"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 glass-card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-500/80 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Bir Sorun Olustu</h1>
          <p className="text-white/80 mb-6">{error}</p>
          <a
            href="/anket"
            className="block w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-orange-600 transition-colors"
          >
            Ankete Git
          </a>
        </div>
      </div>
    );
  }

  if (!coupon) return null;

  const verificationUrl = getVerificationUrl(coupon.code);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/anasayfa.jpg"
          alt="Rhea Cafe"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen py-8 px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.png"
                alt="Rhea Cafe Logo"
                width={80}
                height={80}
                className="drop-shadow-2xl"
              />
            </div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Tebrikler!</h1>
            <p className="text-white/90 mt-2">
              Indirim kuponunuz hazir!
            </p>
          </div>

          {/* Coupon Card */}
          <div className="glass-card overflow-hidden">
            {/* QR Code */}
            <div className="p-6 flex justify-center bg-white/10">
              <div className="bg-white rounded-2xl p-4">
                <QRCodeDisplay value={verificationUrl} size={240} />
              </div>
            </div>

            {/* Coupon Code */}
            <div className="px-6 pb-6 pt-2">
              <div className="glass-card-light rounded-xl p-4 text-center">
                <p className="text-sm text-white/70 mb-1">Kupon Kodu</p>
                <p className="text-3xl font-mono font-bold text-white tracking-wider">
                  {coupon.code}
                </p>
              </div>
            </div>

            {/* Countdown */}
            <div className="px-6 pb-6">
              {isExpired ? (
                <div className="bg-red-500/80 backdrop-blur-sm border border-red-400 rounded-xl p-6 text-center">
                  <p className="text-white font-bold text-xl">Suresi Doldu</p>
                  <p className="text-white/80 mt-1">Bu kupon artik gecerli degil</p>
                </div>
              ) : (
                <CountdownTimer
                  expiresAt={coupon.expires_at}
                  onExpire={() => setIsExpired(true)}
                />
              )}
            </div>

            {/* Instructions */}
            <div className="glass-card-light mx-6 mb-6 rounded-xl px-5 py-4">
              <h3 className="font-semibold text-white mb-3">Nasil Kullanilir?</h3>
              <ol className="space-y-2 text-white/90 text-sm">
                <li className="flex items-start gap-2">
                  <span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    1
                  </span>
                  <span>Bu ekrani veya kupon kodunu kasaya gosterin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    2
                  </span>
                  <span>Personel QR kodu tarayacak veya kodu girecek</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    3
                  </span>
                  <span>%10 indriminiz otomatik uygulanacak</span>
                </li>
              </ol>
            </div>

            {/* Warning */}
            <div className="px-6 pb-6">
              <div className="bg-orange-500/30 backdrop-blur-sm border border-orange-400/50 rounded-xl p-4">
                <p className="text-white text-sm text-center">
                  <strong>Dikkat:</strong> Bu kupon tek kullanimliktir ve 6 saat icinde kullanilmalidir.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-white/60 text-sm mt-6">
            Rhea Cafe - Bizi tercih ettiginiz icin tesekkurler!
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <GenerateContent />
    </Suspense>
  );
}
