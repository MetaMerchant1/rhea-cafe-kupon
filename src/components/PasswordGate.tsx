'use client';

import { useState, useEffect } from 'react';
import { verifyPassword } from '@/lib/utils';

interface PasswordGateProps {
  children: React.ReactNode;
  storageKey?: string;
}

export default function PasswordGate({ children, storageKey = 'staff-auth' }: PasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Sayfa yuklendiginde session kontrolu
  useEffect(() => {
    const savedAuth = sessionStorage.getItem(storageKey);
    if (savedAuth === 'authenticated') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [storageKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (verifyPassword(password)) {
      setIsAuthenticated(true);
      sessionStorage.setItem(storageKey, 'authenticated');
    } else {
      setError('Yanlis sifre');
      setPassword('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-coffee-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-coffee-50 p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-coffee-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-coffee-800">Personel Girisi</h1>
            <p className="text-coffee-600 mt-1">Bu alan personel icin ayrilmistir</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-coffee-700 mb-2">
                Sifre
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-coffee-200 rounded-xl focus:border-coffee-500 focus:outline-none transition-colors text-lg"
                placeholder="Sifrenizi girin"
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-coffee-500 text-white rounded-xl font-semibold text-lg hover:bg-coffee-600 transition-colors"
            >
              Giris Yap
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
