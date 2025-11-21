import { useEffect, useState } from 'react';
import { SIDEBAR_STATE_KEY } from '../constants/layout';
import type { LayoutState } from '../types/layout';

const defaultState: LayoutState = {
  sidebarExpanded: true,
  activeItem: 'dashboard',
  openSections: ['ventas', 'productos', 'proveedores', 'clientes', 'informes', 'usuarios'],
  themeMode: 'light',
  colorPalette: 'actual'
};

const loadLayoutState = (): LayoutState => {
  try {
    const raw = localStorage.getItem(SIDEBAR_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LayoutState>;
      return { ...defaultState, ...parsed };
    }
  } catch {
    // ignore corrupted storage and fallback to defaults
  }
  return defaultState;
};

export const useLayoutState = () => {
  const [layout, setLayout] = useState<LayoutState>(() => loadLayoutState());

  useEffect(() => {
    document.body.setAttribute('data-theme-mode', layout.themeMode);
    document.body.setAttribute('data-theme-palette', layout.colorPalette);
    try {
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(layout));
    } catch {
      // ignore storage failures
    }
  }, [layout]);

  return { layout, setLayout };
};
