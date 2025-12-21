'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanner = async () => {
    if (!containerRef.current) return;

    try {
      const html5Qrcode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5Qrcode;

      await html5Qrcode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
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
        },
        () => {
          // QR kod bulunamadi - sessizce devam et
        }
      );

      setIsScanning(true);
      setHasPermission(true);
    } catch (err: any) {
      console.error('Scanner error:', err);
      setHasPermission(false);
      onError?.(err.message || 'Kamera erisimi saglanamadi');
    }
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

      {!isScanning && (
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

      {isScanning && (
        <button
          onClick={stopScanner}
          className="w-full mt-4 py-3 px-6 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
        >
          Kamerayi Kapat
        </button>
      )}

      {hasPermission === false && (
        <div className="mt-4 p-4 bg-red-50 rounded-xl text-red-700 text-center">
          <p className="font-medium">Kamera erisimi reddedildi</p>
          <p className="text-sm mt-1">
            Lutfen tarayici ayarlarindan kamera iznini aktif edin
          </p>
        </div>
      )}
    </div>
  );
}
