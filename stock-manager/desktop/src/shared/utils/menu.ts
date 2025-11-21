import type { SidebarMenuItem, SidebarMenuMeta, SidebarSection } from '../types/layout';
import { normalizeRoute } from './routes';

export type MenuIndex = {
  metaById: Map<string, SidebarMenuMeta>;
  routeToMenu: Map<string, string>;
};

export const buildMenuIndex = (sections: SidebarSection[]): MenuIndex => {
  const metaById = new Map<string, SidebarMenuMeta>();
  const routeToMenu = new Map<string, string>();

  const walk = (items: SidebarMenuItem[], trail: string[], parentId?: string) => {
    items.forEach((item) => {
      metaById.set(item.id, { item, trail: [...trail, item.label], parentId });
      if (item.route) {
        routeToMenu.set(normalizeRoute(item.route), item.id);
      }
      if (item.children?.length) {
        walk(item.children, [...trail, item.label], item.id);
      }
    });
  };

  sections.forEach((section) => walk(section.items, [section.title]));
  return { metaById, routeToMenu };
};
