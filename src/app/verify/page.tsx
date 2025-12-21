'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PasswordGate from '@/components/PasswordGate';
import QRScanner from '@/components/QRScanner';
import type { VerifyResult } from '@/app/api/coupons/verify/route';

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-coffee-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-500"></div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <PasswordGate storageKey="verify-auth">
      <Suspense fallback={<LoadingState />}>
        <VerifyContent />
      </Suspense>
    </PasswordGate>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(true);

  // URL'den gelen kodu kontrol et
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setManualCode(codeFromUrl.toUpperCase());
      verifyCode(codeFromUrl);
    }
  }, [searchParams]);

  const verifyCode = async (code: string) => {
    if (!code.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/coupons/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data: VerifyResult = await response.json();
      setResult(data);
    } catch (err) {
      setResult({
        valid: false,
        message: 'Baglanti hatasi. Lutfen tekrar deneyin.',
        status: 'not_found',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = (code: string) => {
    setManualCode(code.toUpperCase());
    verifyCode(code);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCode(manualCode);
  };

  const resetVerification = () => {
    setResult(null);
    setManualCode('');
    setShowScanner(true);
  };

  return (
    <div className="min-h-screen bg-coffee-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-coffee-800">Kupon Dogrulama</h1>
          <p className="text-coffee-600 mt-1">QR kodu tarayin veya kodu girin</p>
        </div>

        {/* Result Display */}
        {result && (
          <div className="mb-6">
            <ResultCard result={result} />
            <button
              onClick={resetVerification}
              className="w-full mt-4 py-3 bg-coffee-500 text-white rounded-xl font-medium hover:bg-coffee-600 transition-colors"
            >
              Yeni Kupon Dogrula
            </button>
          </div>
        )}

        {/* Verification Interface */}
        {!result && (
          <div className="space-y-6">
            {/* Tab Toggle */}
            <div className="flex bg-white rounded-xl p-1 shadow">
              <button
                onClick={() => setShowScanner(true)}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  showScanner
                    ? 'bg-coffee-500 text-white'
                    : 'text-coffee-600 hover:bg-coffee-50'
                }`}
              >
                QR Tara
              </button>
              <button
                onClick={() => setShowScanner(false)}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  !showScanner
                    ? 'bg-coffee-500 text-white'
                    : 'text-coffee-600 hover:bg-coffee-50'
                }`}
              >
                Kod Gir
              </button>
            </div>

            {/* Scanner */}
            {showScanner && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <QRScanner onScan={handleScan} />
              </div>
            )}

            {/* Manual Input */}
            {!showScanner && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="code"
                      className="block text-sm font-medium text-coffee-700 mb-2"
                    >
                      Kupon Kodu
                    </label>
                    <input
                      type="text"
                      id="code"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-4 border-2 border-coffee-200 rounded-xl focus:border-coffee-500 focus:outline-none transition-colors text-2xl font-mono text-center tracking-widest uppercase"
                      placeholder="ABCD1234"
                      maxLength={8}
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || manualCode.length < 8}
                    className="w-full py-4 bg-coffee-500 text-white rounded-xl font-semibold text-lg hover:bg-coffee-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Dogrulaniyor...
                      </span>
                    ) : (
                      'Dogrula'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-500 mx-auto"></div>
              <p className="mt-4 text-coffee-700 font-medium">Kupon dogrulaniyor...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: VerifyResult }) {
  const isValid = result.valid;
  const isUsed = result.status === 'used';
  const isExpired = result.status === 'expired';

  return (
    <div
      className={`rounded-2xl shadow-xl overflow-hidden ${
        isValid
          ? 'bg-green-50 border-2 border-green-300'
          : isUsed
          ? 'bg-gray-50 border-2 border-gray-300'
          : 'bg-red-50 border-2 border-red-300'
      }`}
    >
      <div className="p-8 text-center">
        {/* Icon */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isValid ? 'bg-green-100' : isUsed ? 'bg-gray-100' : 'bg-red-100'
          }`}
        >
          {isValid ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-10 h-10 text-green-600"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : isUsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-10 h-10 text-gray-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-10 h-10 text-red-600"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        {/* Status */}
        <h2
          className={`text-2xl font-bold mb-2 ${
            isValid ? 'text-green-700' : isUsed ? 'text-gray-700' : 'text-red-700'
          }`}
        >
          {isValid ? 'GECERLI KUPON' : isUsed ? 'KULLANILMIS' : 'GECERSIZ'}
        </h2>

        {/* Message */}
        <p className={`${isValid ? 'text-green-600' : isUsed ? 'text-gray-600' : 'text-red-600'}`}>
          {result.message}
        </p>

        {/* Coupon Code */}
        {result.coupon && (
          <div className="mt-4 p-3 bg-white/50 rounded-lg">
            <p className="text-sm text-gray-500">Kupon Kodu</p>
            <p className="font-mono font-bold text-lg">{result.coupon.code}</p>
          </div>
        )}

        {/* Action for valid coupon */}
        {isValid && (
          <div className="mt-6 p-4 bg-green-100 rounded-xl">
            <p className="text-green-800 font-semibold text-lg">
              Indirimi uygulayabilirsiniz!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
