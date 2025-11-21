import { useMemo } from 'react';

export const useDesktopInfo = () => {
  return useMemo(() => {
    const bridge = window.desktop;
    return {
      platform: bridge?.app.platform ?? 'unknown',
      versions: bridge?.app.versions ?? {}
    };
  }, []);
};
