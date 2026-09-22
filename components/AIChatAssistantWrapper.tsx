'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const AIChatAssistant = dynamic(() => import('@/components/AIChatAssistant'), {
  ssr: false,
});

export default function AIChatAssistantWrapper() {
  return <AIChatAssistant />;
}
