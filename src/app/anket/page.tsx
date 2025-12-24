'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AnketPage() {
  const router = useRouter();
  const [serviceRating, setServiceRating] = useState<number>(0);
  const [likedDrinks, setLikedDrinks] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validasyon
    if (serviceRating === 0) {
      setError('Lutfen hizmet kalitesini puanlayin');
      return;
    }

    if (likedDrinks === null) {
      setError('Lutfen icecek tercihinizi belirtin');
      return;
    }

    if (!suggestions.trim()) {
      setError('Lutfen onerinizi yazin');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_rating: serviceRating,
          liked_drinks: likedDrinks,
          suggestions: suggestions.trim(),
          phone: phone.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata olustu');
      }

      // Kupon sayfasina yonlendir
      router.push(`/generate?code=${data.coupon.code}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 8) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 z-0" style={{ top: '20px' }}>
        <Image
          src="/anasayfa.jpg"
          alt="Rhea Cafe"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen py-8 px-4">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">Geri Bildirim Anketi</h1>
        </header>

        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
            {/* Baslik */}
            <div className="text-center mb-2">
              <p className="text-white/90">
                Anketi tamamlayarak <strong className="text-white">%10 indirim kuponu</strong> kazanin!
              </p>
            </div>

            {/* Soru 1: Hizmet Puani */}
            <div>
              <label className="block text-white font-medium mb-3">
                Hizmet kalitesini nasil degerlendirirsiniz?
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setServiceRating(star)}
                    className="p-2 transition-transform hover:scale-110 active:scale-95"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={star <= serviceRating ? '#F59E0B' : 'rgba(255,255,255,0.3)'}
                      stroke={star <= serviceRating ? '#F59E0B' : 'rgba(255,255,255,0.5)'}
                      strokeWidth={1}
                      className="w-10 h-10 drop-shadow-lg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      />
                    </svg>
                  </button>
                ))}
              </div>
              {serviceRating > 0 && (
                <p className="text-center text-sm text-white/80 mt-2">
                  {serviceRating === 1 && 'Cok Kotu'}
                  {serviceRating === 2 && 'Kotu'}
                  {serviceRating === 3 && 'Orta'}
                  {serviceRating === 4 && 'Iyi'}
                  {serviceRating === 5 && 'Mukemmel'}
                </p>
              )}
            </div>

            {/* Soru 2: Icecekler */}
            <div>
              <label className="block text-white font-medium mb-3">
                Iceceklerimizi begendiniz mi?
              </label>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setLikedDrinks(true)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                    likedDrinks === true
                      ? 'bg-green-500/80 text-white border-2 border-green-400 shadow-lg shadow-green-500/30'
                      : 'glass-button text-white hover:bg-white/30'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                  </svg>
                  Evet
                </button>
                <button
                  type="button"
                  onClick={() => setLikedDrinks(false)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                    likedDrinks === false
                      ? 'bg-red-500/80 text-white border-2 border-red-400 shadow-lg shadow-red-500/30'
                      : 'glass-button text-white hover:bg-white/30'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" />
                  </svg>
                  Hayir
                </button>
              </div>
            </div>

            {/* Soru 3: Oneriler */}
            <div>
              <label className="block text-white font-medium mb-2">
                Onerileriniz nelerdir?
              </label>
              <textarea
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                placeholder="Goruslerinizi bizimle paylasin..."
                rows={3}
                className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none resize-none text-gray-800 placeholder-gray-500"
              />
            </div>

            {/* Soru 4: Telefon (Opsiyonel) */}
            <div>
              <label className="block text-white font-medium mb-2">
                Telefon Numaraniz <span className="text-white/60 font-normal">(Opsiyonel)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="5XX XXX XX XX"
                className="w-full px-4 py-3 glass-input rounded-xl focus:outline-none text-gray-800 placeholder-gray-500"
              />
            </div>

            {/* Hata Mesaji */}
            {error && (
              <div className="p-3 bg-red-500/80 backdrop-blur-sm border border-red-400 rounded-xl text-white text-sm text-center">
                {error}
              </div>
            )}

            {/* Gonder Butonu */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Gonderiliyor...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                  Gonder ve Kuponumu Al
                </>
              )}
            </button>
          </form>

          {/* Bilgi */}
          <p className="text-center text-white/70 text-sm mt-6">
            Geri bildiriminiz bizim icin cok degerli!
          </p>
        </div>

        {/* Footer */}
        <footer className="text-center py-6 text-white/50 text-sm">
          Rhea Cafe &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
