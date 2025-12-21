'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  expiresAt: Date | string;
  onExpire?: () => void;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export default function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const expires = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
      const now = new Date();
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        total: diff,
      };
    };

    // Hemen hesapla
    setTimeLeft(calculateTimeLeft());

    // Her saniye guncelle
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const isExpired = timeLeft.total <= 0;
  const isUrgent = timeLeft.total <= 30 * 60 * 1000; // Son 30 dakika

  if (isExpired) {
    return (
      <div className="bg-red-100 border-2 border-red-300 rounded-xl p-6 text-center">
        <p className="text-red-700 font-bold text-xl">Suresi Doldu</p>
        <p className="text-red-600 mt-1">Bu kupon artik gecerli degil</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl p-6 text-center ${
        isUrgent ? 'bg-orange-100 border-2 border-orange-300' : 'bg-green-100 border-2 border-green-300'
      }`}
    >
      <p className={`text-sm font-medium mb-2 ${isUrgent ? 'text-orange-700' : 'text-green-700'}`}>
        Kalan Sure
      </p>
      <div className="flex items-center justify-center gap-2">
        <TimeBlock value={timeLeft.hours} label="saat" isUrgent={isUrgent} />
        <span className={`text-2xl font-bold ${isUrgent ? 'text-orange-600' : 'text-green-600'}`}>
          :
        </span>
        <TimeBlock value={timeLeft.minutes} label="dk" isUrgent={isUrgent} />
        <span className={`text-2xl font-bold ${isUrgent ? 'text-orange-600' : 'text-green-600'}`}>
          :
        </span>
        <TimeBlock value={timeLeft.seconds} label="sn" isUrgent={isUrgent} />
      </div>
      {isUrgent && (
        <p className="text-orange-600 mt-3 text-sm font-medium animate-pulse">
          Kuponunuz yakinda sona erecek!
        </p>
      )}
    </div>
  );
}

function TimeBlock({
  value,
  label,
  isUrgent,
}: {
  value: number;
  label: string;
  isUrgent: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={`text-3xl font-bold tabular-nums ${
          isUrgent ? 'text-orange-700' : 'text-green-700'
        }`}
      >
        {value.toString().padStart(2, '0')}
      </span>
      <span className={`text-xs ${isUrgent ? 'text-orange-600' : 'text-green-600'}`}>{label}</span>
    </div>
  );
}
