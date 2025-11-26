import { useEffect, useState } from 'react';
import { DESKTOP_BREAKPOINT } from '../constants/layout';

export function useIsDesktop(breakpoint: number = DESKTOP_BREAKPOINT): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth >= breakpoint : true),
  );

  useEffect(() => {
    const handler = () => setIsDesktop(typeof window !== 'undefined' && window.innerWidth >= breakpoint);
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);

  return isDesktop;
}
