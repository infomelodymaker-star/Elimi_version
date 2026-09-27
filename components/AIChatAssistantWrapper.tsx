'use client';

import React, { useState, useEffect } from 'react';
import AIChatAssistant from '@/components/AIChatAssistant';

export default function AIChatAssistantWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <AIChatAssistant />;
}

