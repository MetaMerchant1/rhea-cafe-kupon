'use client';

import { useState, useEffect, useCallback } from 'react';
import PasswordGate from '@/components/PasswordGate';
import QRScanner from '@/components/QRScanner';
import { STAFF_PASSWORD } from '@/lib/utils';
import type { CouponStatus } from '@/lib/supabase';

interface Stats {
  total: number;
  used: number;
  expired: number;
  active: number;
}

interface CouponWithStatus {
  id: string;
  code: string;
  created_at: string;
  expires_at: string;
  is_used: boolean;
  used_at: string | null;
  status: CouponStatus;
}

interface SurveyResponse {
  id: string;
  service_rating: number;
  liked_drinks: boolean;
  suggestions: string;
  phone: string | null;
  created_at: string;
  coupons: { code: string } | null;
}

interface VerifyResult {
  valid: boolean;
  message: string;
  status: 'valid' | 'used' | 'expired' | 'not_found';
  coupon?: {
    code: string;
    created_at: string;
    expires_at: string;
  };
}

export default function AdminPage() {
  return (
    <PasswordGate storageKey="admin-auth">
      <AdminContent />
    </PasswordGate>
  );
}

function AdminContent() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [coupons, setCoupons] = useState<CouponWithStatus[]>([]);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'verify' | 'coupons' | 'surveys'>('verify');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Verify states
  const [manualCode, setManualCode] = useState('');
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMode, setVerifyMode] = useState<'manual' | 'qr'>('manual');

  const fetchData = useCallback(async () => {
    try {
      setError('');
      const response = await fetch('/api/coupons/stats', {
        headers: {
          'x-admin-password': STAFF_PASSWORD,
        },
      });

      if (!response.ok) {
        throw new Error('Veriler alinamadi');
      }

      const data = await response.json();
      setStats(data.stats);
      setCoupons(data.coupons);
      setSurveyResponses(data.surveyResponses || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Her 30 saniyede bir yenile
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const verifyCoupon = async (code: string) => {
    if (!code.trim()) return;

    setIsVerifying(true);
    setVerifyResult(null);

    try {
      const response = await fetch('/api/coupons/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const result = await response.json();
      setVerifyResult(result);

      // Basarili dogrulamada verileri yenile
      if (result.valid) {
        fetchData();
      }
    } catch (err) {
      setVerifyResult({
        valid: false,
        message: 'Dogrulama sirasinda hata olustu',
        status: 'not_found',
      });
    } finally {
      setIsVerifying(false);
      setManualCode('');
    }
  };

  const handleQRScan = (code: string) => {
    verifyCoupon(code);
  };

  const resetVerify = () => {
    setVerifyResult(null);
    setManualCode('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-coffee-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-500 mx-auto"></div>
          <p className="mt-4 text-coffee-700">Veriler yukleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-coffee-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-coffee-500 text-white rounded-xl hover:bg-coffee-600 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-coffee-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-coffee-800">Yonetim Paneli</h1>
            <p className="text-coffee-600">Kupon istatistikleri ve listesi</p>
          </div>
          <button
            onClick={fetchData}
            className="p-3 bg-white rounded-xl shadow hover:bg-coffee-50 transition-colors"
            title="Yenile"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-coffee-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Toplam"
              value={stats.total}
              color="bg-blue-100 text-blue-800"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
                  />
                </svg>
              }
            />
            <StatCard
              label="Aktif"
              value={stats.active}
              color="bg-green-100 text-green-800"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <StatCard
              label="Kullanildi"
              value={stats.used}
              color="bg-gray-100 text-gray-800"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              }
            />
            <StatCard
              label="Suresi Doldu"
              value={stats.expired}
              color="bg-red-100 text-red-800"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('verify')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'verify'
                ? 'bg-green-600 text-white'
                : 'bg-white text-coffee-700 hover:bg-coffee-100'
            }`}
          >
            Kupon Dogrula
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'coupons'
                ? 'bg-coffee-500 text-white'
                : 'bg-white text-coffee-700 hover:bg-coffee-100'
            }`}
          >
            Kuponlar
          </button>
          <button
            onClick={() => setActiveTab('surveys')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'surveys'
                ? 'bg-coffee-500 text-white'
                : 'bg-white text-coffee-700 hover:bg-coffee-100'
            }`}
          >
            Anket Yanitlari ({surveyResponses.length})
          </button>
        </div>

        {/* Verify Section */}
        {activeTab === 'verify' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-coffee-800 mb-6 text-center">
              Kupon Dogrulama
            </h2>

            {/* Verify Result */}
            {verifyResult && (
              <div className="mb-6">
                <div
                  className={`p-6 rounded-xl text-center ${
                    verifyResult.valid
                      ? 'bg-green-100 border-2 border-green-500'
                      : verifyResult.status === 'used'
                      ? 'bg-gray-100 border-2 border-gray-400'
                      : verifyResult.status === 'expired'
                      ? 'bg-orange-100 border-2 border-orange-400'
                      : 'bg-red-100 border-2 border-red-400'
                  }`}
                >
                  {/* Icon */}
                  <div className="flex justify-center mb-3">
                    {verifyResult.valid ? (
                      <svg className="w-16 h-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : verifyResult.status === 'used' ? (
                      <svg className="w-16 h-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : verifyResult.status === 'expired' ? (
                      <svg className="w-16 h-16 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>

                  {/* Message */}
                  <p className={`text-xl font-bold mb-2 ${
                    verifyResult.valid ? 'text-green-700' :
                    verifyResult.status === 'used' ? 'text-gray-700' :
                    verifyResult.status === 'expired' ? 'text-orange-700' : 'text-red-700'
                  }`}>
                    {verifyResult.message}
                  </p>

                  {/* Coupon Code */}
                  {verifyResult.coupon && (
                    <p className="font-mono text-lg text-gray-600 mb-2">
                      Kod: {verifyResult.coupon.code}
                    </p>
                  )}

                  {/* Success Animation */}
                  {verifyResult.valid && (
                    <p className="text-green-600 font-medium mt-2">
                      %10 indirim uygulayabilirsiniz!
                    </p>
                  )}
                </div>

                <button
                  onClick={resetVerify}
                  className="w-full mt-4 py-3 bg-coffee-500 text-white rounded-xl font-medium hover:bg-coffee-600 transition-colors"
                >
                  Yeni Dogrulama Yap
                </button>
              </div>
            )}

            {/* Verify Input */}
            {!verifyResult && (
              <>
                {/* Mode Toggle */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setVerifyMode('manual')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                      verifyMode === 'manual'
                        ? 'bg-coffee-500 text-white'
                        : 'bg-coffee-100 text-coffee-700'
                    }`}
                  >
                    Elle Gir
                  </button>
                  <button
                    onClick={() => setVerifyMode('qr')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                      verifyMode === 'qr'
                        ? 'bg-coffee-500 text-white'
                        : 'bg-coffee-100 text-coffee-700'
                    }`}
                  >
                    QR Tarat
                  </button>
                </div>

                {/* Manual Input */}
                {verifyMode === 'manual' && (
                  <div>
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && verifyCoupon(manualCode)}
                      placeholder="Kupon kodunu girin (orn: ABC123)"
                      className="w-full px-4 py-4 text-center text-2xl font-mono border-2 border-coffee-200 rounded-xl focus:border-coffee-500 focus:ring-2 focus:ring-coffee-200 outline-none uppercase tracking-widest"
                      maxLength={6}
                      autoFocus
                    />
                    <button
                      onClick={() => verifyCoupon(manualCode)}
                      disabled={!manualCode.trim() || isVerifying}
                      className="w-full mt-4 py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isVerifying ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Dogrulaniyor...
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Dogrula ve Kullan
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* QR Scanner */}
                {verifyMode === 'qr' && (
                  <div>
                    <QRScanner
                      onScan={handleQRScan}
                      onError={(err) => console.error('QR Error:', err)}
                    />
                    <p className="text-center text-sm text-gray-500 mt-4">
                      Musterinin telefonundaki QR kodu tarayin
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Coupons Table */}
        {activeTab === 'coupons' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-coffee-800">Son Kuponlar</h2>
            </div>

            {coupons.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Henuz kupon olusturulmamis</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-coffee-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-coffee-600 uppercase tracking-wider">
                        Kod
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-coffee-600 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-coffee-600 uppercase tracking-wider">
                        Olusturulma
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-coffee-600 uppercase tracking-wider">
                        Bitis
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {coupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-coffee-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono font-medium text-coffee-800">
                            {coupon.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={coupon.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(coupon.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(coupon.expires_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Survey Responses Table */}
        {activeTab === 'surveys' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-coffee-800">Anket Yanitlari</h2>
            </div>

            {surveyResponses.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Henuz anket yanitlanmamis</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-coffee-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-coffee-600 uppercase tracking-wider">
                        Puan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-coffee-600 uppercase tracking-wider">
                        Icecek
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-coffee-600 uppercase tracking-wider">
                        Oneri
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-coffee-600 uppercase tracking-wider">
                        Telefon
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-coffee-600 uppercase tracking-wider">
                        Kupon
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-coffee-600 uppercase tracking-wider">
                        Tarih
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {surveyResponses.map((response) => (
                      <tr key={response.id} className="hover:bg-coffee-50/50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill={star <= response.service_rating ? '#F59E0B' : '#E5E7EB'}
                                className="w-4 h-4"
                              >
                                <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                              </svg>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            response.liked_drinks
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {response.liked_drinks ? 'Evet' : 'Hayir'}
                          </span>
                        </td>
                        <td className="px-4 py-4 max-w-xs">
                          <p className="text-sm text-gray-700 truncate" title={response.suggestions}>
                            {response.suggestions}
                          </p>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {response.phone || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm text-coffee-700">
                            {response.coupons?.code || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(response.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-coffee-500">
          <p>Veriler her 30 saniyede bir otomatik guncellenir</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="opacity-75">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm opacity-75">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: CouponStatus }) {
  const config = {
    active: { label: 'Aktif', class: 'bg-green-100 text-green-800' },
    used: { label: 'Kullanildi', class: 'bg-gray-100 text-gray-800' },
    expired: { label: 'Suresi Doldu', class: 'bg-red-100 text-red-800' },
  };

  const { label, class: className } = config[status];

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{label}</span>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
