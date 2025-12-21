'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      // Kamera API'si var mi kontrol et
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage('Bu cihazda kamera desteklenmiyor');
        return false;
      }

      // Kamera izni iste
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      // Stream'i kapat (sadece izin kontrolu icin kullandik)
      stream.getTracks().forEach(track => track.stop());

      return true;
    } catch (err: any) {
      console.error('Camera permission error:', err);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Kamera izni reddedildi. Tarayici ayarlarindan izin verin.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('Kamera bulunamadi. Cihazinizda kamera var mi?');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setErrorMessage('Kamera baska bir uygulama tarafindan kullaniliyor.');
      } else if (err.name === 'OverconstrainedError') {
        setErrorMessage('Arka kamera bulunamadi, on kamera deneniyor...');
      } else {
        setErrorMessage(`Kamera hatasi: ${err.message || 'Bilinmeyen hata'}`);
      }

      return false;
    }
  };

  const startScanner = async () => {
    if (!containerRef.current) return;

    setIsLoading(true);
    setErrorMessage('');
    setHasPermission(null);

    // Once izin kontrolu yap
    const hasAccess = await requestCameraPermission();
    if (!hasAccess) {
      setIsLoading(false);
      setHasPermission(false);
      return;
    }

    try {
      const html5Qrcode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5Qrcode;

      // Arka kamerayi dene, yoksa herhangi bir kamera
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
      };

      try {
        await html5Qrcode.start(
          { facingMode: 'environment' },
          config,
          handleScanSuccess,
          () => {} // QR bulunamadi - sessizce devam
        );
      } catch (envError) {
        // Arka kamera yoksa on kamerayi dene
        console.log('Trying front camera...');
        await html5Qrcode.start(
          { facingMode: 'user' },
          config,
          handleScanSuccess,
          () => {}
        );
      }

      setIsScanning(true);
      setHasPermission(true);
    } catch (err: any) {
      console.error('Scanner start error:', err);
      setHasPermission(false);
      setErrorMessage(err.message || 'Kamera baslatilamadi');
      onError?.(err.message || 'Kamera erisimi saglanamadi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    // URL'den kodu cikart veya dogrudan kodu kullan
    let code = decodedText;
    try {
      const url = new URL(decodedText);
      const codeParam = url.searchParams.get('code');
      if (codeParam) {
        code = codeParam;
      }
    } catch {
      // URL degilse, dogrudan kodu kullan
    }
    onScan(code);
    stopScanner();
  };

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error('Stop scanner error:', err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        id="qr-reader"
        ref={containerRef}
        className={`rounded-xl overflow-hidden bg-gray-900 ${
          isScanning ? 'block' : 'hidden'
        }`}
        style={{ minHeight: isScanning ? '300px' : '0' }}
      />

      {!isScanning && !isLoading && (
        <button
          onClick={startScanner}
          className="w-full py-4 px-6 bg-coffee-500 text-white rounded-xl font-semibold text-lg hover:bg-coffee-600 transition-colors flex items-center justify-center gap-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
            />
          </svg>
          Kamerayi Ac ve Tarat
        </button>
      )}

      {isLoading && (
        <div className="w-full py-4 px-6 bg-coffee-300 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          Kamera aciliyor...
        </div>
      )}

      {isScanning && (
        <button
          onClick={stopScanner}
          className="w-full mt-4 py-3 px-6 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
        >
          Kamerayi Kapat
        </button>
      )}

      {hasPermission === false && errorMessage && (
        <div className="mt-4 p-4 bg-red-50 rounded-xl text-red-700 text-center">
          <p className="font-medium">Kamera Hatasi</p>
          <p className="text-sm mt-1">{errorMessage}</p>
          <button
            onClick={startScanner}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            Tekrar Dene
          </button>
        </div>
      )}

      {/* HTTPS uyarisi */}
      {typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-xl text-yellow-700 text-center text-sm">
          <p className="font-medium">Uyari: HTTPS gerekli</p>
          <p>Kamera erisimi icin HTTPS baglantisi gereklidir.</p>
        </div>
      )}
    </div>
  );
}
