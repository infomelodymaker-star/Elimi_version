'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Listen to route changes
  useEffect(() => {
    // When pathname or searchParams change, smoothly finish the bar
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    let timer: NodeJS.Timeout | null = null;
    const raf = requestAnimationFrame(() => {
      setProgress(100);
      timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    });

    return () => {
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  // Intercept all internal link clicks
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const isTargetBlank = target.getAttribute('target') === '_blank';

      if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('javascript:') || isTargetBlank) {
        return;
      }

      // Check if external url
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) {
          return;
        }

        // If clicking on current path without changes, still show a quick pulse
        setVisible(true);
        setProgress(25);

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        // Smoothly animate the progress bar up to 90% while waiting for the next page to load
        let currentProgress = 25;
        intervalRef.current = setInterval(() => {
          currentProgress += Math.random() * 10;
          if (currentProgress > 90) currentProgress = 90;
          setProgress(currentProgress);
        }, 300);
      } catch {
        // Ignore invalid urls
      }
    };

    document.addEventListener('click', handleLinkClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleLinkClick, { capture: true });
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[4px] overflow-hidden bg-transparent"
      >
        <div
          className="h-full bg-gradient-to-r from-[#0D52FF] via-[#3b82f6] to-[#0D52FF] shadow-[0_0_12px_rgba(13,82,255,1),0_0_4px_rgba(13,82,255,0.8)] transition-all ease-out"
          style={{
            width: `${progress}%`,
            transitionDuration: progress === 100 ? '200ms' : '800ms',
            opacity: progress === 100 ? 0 : 1,
          }}
        />
      </div>
    </>
  );
}
