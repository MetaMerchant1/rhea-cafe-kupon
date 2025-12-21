'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export default function QRCodeDisplay({ value, size = 300 }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(value, {
          width: size,
          margin: 2,
          color: {
            dark: '#6F4E37', // Coffee brown
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M',
        });
        setQrDataUrl(url);
        setError('');
      } catch (err) {
        console.error('QR code generation error:', err);
        setError('QR kod olusturulamadi');
      }
    };

    if (value) {
      generateQR();
    }
  }, [value, size]);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-red-50 rounded-lg p-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!qrDataUrl) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg animate-pulse"
        style={{ width: size, height: size }}
      >
        <div className="text-gray-400">Yukleniyor...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-xl shadow-lg">
        <img
          src={qrDataUrl}
          alt="QR Kod"
          width={size}
          height={size}
          className="rounded-lg"
        />
      </div>
      <p className="mt-2 text-sm text-gray-500">
        QR kodu tarat veya asagidaki kodu kullan
      </p>
    </div>
  );
}
