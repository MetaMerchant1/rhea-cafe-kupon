'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
    <div className="min-h-screen flex items-center justify-center bg-coffee-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-500 mx-auto"></div>
        <p className="mt-4 text-coffee-700 font-medium">Kuponunuz hazirlaniyor...</p>
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
      <div className="min-h-screen flex items-center justify-center bg-coffee-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-orange-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Bir Sorun Olustu</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/anket"
            className="block w-full py-4 bg-coffee-500 text-white rounded-xl font-semibold text-lg hover:bg-coffee-600 transition-colors"
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
    <div className="min-h-screen bg-coffee-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-coffee-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-10 h-10 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-coffee-800">Tebrikler!</h1>
          <p className="text-coffee-600 mt-2">
            Anketimizi tamamladiginiz icin tesekkur ederiz.
            <br />
            Indirim kuponunuz hazir!
          </p>
        </div>

        {/* Coupon Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* QR Code */}
          <div className="p-6 flex justify-center bg-gradient-to-b from-coffee-50 to-white">
            <QRCodeDisplay value={verificationUrl} size={280} />
          </div>

          {/* Coupon Code */}
          <div className="px-6 pb-6">
            <div className="bg-coffee-100 rounded-xl p-4 text-center">
              <p className="text-sm text-coffee-600 mb-1">Kupon Kodu</p>
              <p className="text-3xl font-mono font-bold text-coffee-800 tracking-wider">
                {coupon.code}
              </p>
            </div>
          </div>

          {/* Countdown */}
          <div className="px-6 pb-6">
            {isExpired ? (
              <div className="bg-red-100 border-2 border-red-300 rounded-xl p-6 text-center">
                <p className="text-red-700 font-bold text-xl">Suresi Doldu</p>
                <p className="text-red-600 mt-1">Bu kupon artik gecerli degil</p>
              </div>
            ) : (
              <CountdownTimer
                expiresAt={coupon.expires_at}
                onExpire={() => setIsExpired(true)}
              />
            )}
          </div>

          {/* Instructions */}
          <div className="bg-coffee-50 px-6 py-5">
            <h3 className="font-semibold text-coffee-800 mb-3">Nasil Kullanilir?</h3>
            <ol className="space-y-2 text-coffee-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="bg-coffee-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">
                  1
                </span>
                <span>Bu ekrani veya kupon kodunu kasaya gosterin</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-coffee-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">
                  2
                </span>
                <span>Personel QR kodu tarayacak veya kodu girecek</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-coffee-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">
                  3
                </span>
                <span>Indriminiz otomatik olarak uygulanacak</span>
              </li>
            </ol>
          </div>

          {/* Warning */}
          <div className="px-6 py-4 bg-orange-50 border-t border-orange-100">
            <p className="text-orange-700 text-sm text-center">
              <strong>Dikkat:</strong> Bu kupon tek kullanimliktir ve 6 saat icinde
              kullanilmalidir.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-coffee-500 text-sm mt-6">
          Rhea Cafe - Bizi tercih ettiginiz icin tesekkurler!
        </p>
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
