import { useEffect, useState } from 'react';
import type { MenuIndex } from '../utils/menu';
import { normalizeRoute } from '../utils/routes';

export const useRouteSync = (activeItem: string, setActive: (id: string) => void, index: MenuIndex) => {
  const [suppressHash, setSuppressHash] = useState(false);

  useEffect(() => {
    const onHashChange = () => {
      if (suppressHash) return;
      const route = normalizeRoute(window.location.hash.replace(/^#/, '') || '/dashboard');
      const target = index.routeToMenu.get(route);
      if (target) setActive(target);
    };
    window.addEventListener('hashchange', onHashChange);

    const initialRoute = normalizeRoute(window.location.hash.replace(/^#/, ''));
    const initialTarget = index.routeToMenu.get(initialRoute);
    if (initialTarget) setActive(initialTarget);

    return () => window.removeEventListener('hashchange', onHashChange);
  }, [index.routeToMenu, setActive, suppressHash]);

  useEffect(() => {
    const meta = index.metaById.get(activeItem);
    if (!meta?.item.route) return;
    setSuppressHash(true);
    window.location.hash = `#${normalizeRoute(meta.item.route)}`;
    setTimeout(() => setSuppressHash(false), 0);
  }, [activeItem, index.metaById]);
};
