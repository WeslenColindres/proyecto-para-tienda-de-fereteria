import { useEffect, useRef } from 'react';
import type { MenuIndex } from '../utils/menu';
import { normalizeRoute } from '../utils/routes';

export const useRouteSync = (
  activeItem: string,
  setActive: (id: string) => void,
  index: MenuIndex,
) => {
  const ignoreNextHashChange = useRef(false);

  // 1) Escuchar cambios en el hash y sincronizar -> activeItem
  useEffect(() => {
    if (typeof window === 'undefined') return; // por si algún día hay SSR

    const handleHashChange = () => {
      // Ignorar el cambio si lo provocamos nosotros mismos
      if (ignoreNextHashChange.current) {
        ignoreNextHashChange.current = false;
        return;
      }

      const route = normalizeRoute(window.location.hash.replace(/^#/, '') || '/dashboard');
      const target = index.routeToMenu.get(route);
      if (target) {
        setActive(target);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    // Ruta inicial
    const initialRoute = normalizeRoute(window.location.hash.replace(/^#/, '') || '/dashboard');
    const initialTarget = index.routeToMenu.get(initialRoute);
    if (initialTarget) {
      setActive(initialTarget);
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [index, setActive]);

  // 2) Escuchar cambios en activeItem y actualizar hash
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const meta = index.metaById.get(activeItem);
    if (!meta?.item.route) return;

    const nextHash = `#${normalizeRoute(meta.item.route)}`;

    // Evitar escribir el mismo hash innecesariamente
    if (window.location.hash === nextHash) return;

    ignoreNextHashChange.current = true;
    window.location.hash = nextHash;
  }, [activeItem, index]);
};
