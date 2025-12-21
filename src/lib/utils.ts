// Kupon kodu olusturma - 8 karakter, buyuk harf ve rakamlar
export function generateCouponCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Karistirilan karakterler cikarildi (0, O, I, 1)
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// 6 saat sonraki zamani hesapla
export function getExpiryTime(): Date {
  const now = new Date();
  return new Date(now.getTime() + 6 * 60 * 60 * 1000);
}

// Kalan sureyi formatla
export function formatTimeRemaining(expiresAt: Date): string {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) {
    return 'Suresi doldu';
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours} saat ${minutes} dakika`;
  } else if (minutes > 0) {
    return `${minutes} dakika ${seconds} saniye`;
  } else {
    return `${seconds} saniye`;
  }
}

// Tarih formatla (Turkce)
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Dogrulama URL'si olustur
export function getVerificationUrl(code: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base}/verify?code=${code}`;
}

// Basit sifre kontrolu
export const STAFF_PASSWORD = 'cafe2024';

export function verifyPassword(password: string): boolean {
  return password === STAFF_PASSWORD;
}

// Kupon durumu metni
export function getStatusText(status: 'active' | 'used' | 'expired'): string {
  switch (status) {
    case 'active':
      return 'Aktif';
    case 'used':
      return 'Kullanildi';
    case 'expired':
      return 'Suresi Doldu';
    default:
      return 'Bilinmiyor';
  }
}

// Kupon durumu rengi
export function getStatusColor(status: 'active' | 'used' | 'expired'): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'used':
      return 'bg-gray-100 text-gray-800';
    case 'expired':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
