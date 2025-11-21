import { useEffect, useState } from 'react';
import { DESKTOP_BREAKPOINT, TABLET_BREAKPOINT } from '../constants/layout';

export const useViewport = (sidebarExpanded: boolean) => {
  const [viewport, setViewport] = useState({ isMobile: false, isTablet: false });

  useEffect(() => {
    const handle = () => {
      const width = window.innerWidth;
      const isMobile = width < TABLET_BREAKPOINT;
      const isTablet = !isMobile && width < DESKTOP_BREAKPOINT;
      setViewport({ isMobile, isTablet });

      const sidebar = document.getElementById('app-sidebar');
      const shouldCollapse = !isMobile && (isTablet || (!sidebarExpanded && width >= DESKTOP_BREAKPOINT));
      if (sidebar) sidebar.classList.toggle('collapsed', shouldCollapse);
      document.body.classList.toggle('sidebar-collapsed', shouldCollapse);
      document.body.classList.toggle('sidebar-tablet', isTablet);
      document.body.classList.toggle('sidebar-mobile', isMobile);
    };

    handle();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, [sidebarExpanded]);

  return viewport;
};
