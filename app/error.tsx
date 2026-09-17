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
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.06)]">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#E0EBFF] text-[#0B57FF] flex items-center justify-center font-bold text-xl">
          !
        </div>
        <h2 className="text-2xl font-bold text-[#0F172A] mb-2 tracking-tight">
          Something went wrong
        </h2>
        <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
          {error.message || 'An unexpected error occurred while loading this view.'}
        </p>
        <button
          onClick={() => reset()}
          className="w-full bg-[#0B57FF] text-white py-3 px-6 rounded-full font-semibold hover:bg-[#0B57FF]/90 transition-all text-sm shadow-sm"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
