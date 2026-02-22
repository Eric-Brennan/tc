import { useState, useEffect } from 'react';

const MOBILE_VIEW_KEY = 'therapyconnect-mobile-view';

/**
 * Hook to detect both real mobile viewport AND mobile simulation toggle.
 * Listens for viewport changes via matchMedia, for the 'mobile-simulation'
 * class on <html> via MutationObserver, and checks localStorage for the
 * persisted mobile simulation setting (so it works on pages that don't
 * render MobileViewToggle, like VideoSession).
 */
export function useIsMobileView() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    const simulated =
      document.documentElement.classList.contains('mobile-simulation') ||
      localStorage.getItem(MOBILE_VIEW_KEY) === 'true';
    return window.innerWidth < 768 || simulated;
  });

  useEffect(() => {
    const checkMobile = () => {
      const simulated =
        document.documentElement.classList.contains('mobile-simulation') ||
        localStorage.getItem(MOBILE_VIEW_KEY) === 'true';
      setIsMobile(window.innerWidth < 768 || simulated);
    };

    // Listen for viewport changes
    const mql = window.matchMedia('(max-width: 767px)');
    mql.addEventListener('change', checkMobile);

    // Listen for simulation class changes via MutationObserver
    const observer = new MutationObserver(checkMobile);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Listen for localStorage changes from other tabs/windows
    const handleStorage = (e: StorageEvent) => {
      if (e.key === MOBILE_VIEW_KEY) checkMobile();
    };
    window.addEventListener('storage', handleStorage);

    checkMobile();
    return () => {
      mql.removeEventListener('change', checkMobile);
      observer.disconnect();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return isMobile;
}