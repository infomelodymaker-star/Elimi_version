'use client';

import React, { useEffect } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, log only high level error info without leaking raw secrets or sensitive tokens
    console.error('Handled application error boundary [digest]:', error?.digest || 'standard');
  }, [error]);

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-[#111111] border border-[#333336] rounded-[28px] p-8 shadow-2xl">
        <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-[#1d1d1f] border border-[#333336] text-[#2997ff] flex items-center justify-center font-bold text-2xl">
          !
        </div>
        <h2 className="text-2xl font-bold text-[#f5f5f7] mb-2 tracking-tight">
          Une erreur temporaire est survenue
        </h2>
        <p className="text-sm text-[#86868b] mb-8 leading-relaxed">
          Le service a rencontré une interruption inattendue. Toutes vos données sont en sécurité.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-[#0071e3] text-white py-3.5 px-6 rounded-[36px] font-semibold hover:bg-[#0071e3]/90 transition-all text-sm shadow-sm active:scale-95"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="w-full bg-[#1d1d1f] text-[#f5f5f7] py-3.5 px-6 rounded-[36px] font-medium border border-[#333336] hover:bg-[#333336] transition-all text-sm text-center"
          >
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    </div>
  );
}
