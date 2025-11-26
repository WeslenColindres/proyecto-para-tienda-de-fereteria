import { useEffect, useState } from 'react';
import { DESKTOP_BREAKPOINT, TABLET_BREAKPOINT } from '@/shared/constants/layout';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export function useViewportMode() {
  const [mode, setMode] = useState<ViewportMode>('desktop');

  useEffect(() => {
    const onResize = () => {
      const width = window.innerWidth;
      const next: ViewportMode = width >= DESKTOP_BREAKPOINT ? 'desktop' : width >= TABLET_BREAKPOINT ? 'tablet' : 'mobile';
      setMode(next);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return mode;
}
