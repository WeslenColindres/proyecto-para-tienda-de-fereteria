export type SidebarMenuItem = {
  id: string;
  label: string;
  icon: string;
  route?: string;
  badge?: string;
  children?: SidebarMenuItem[];
};

export type SidebarSection = {
  id: string;
  title: string;
  items: SidebarMenuItem[];
};

export type AppView = 'dashboard' | 'products' | 'suppliers' | 'customers' | 'sales' | 'reports' | 'users';

export type SidebarMenuMeta = {
  item: SidebarMenuItem;
  trail: string[];
  parentId?: string;
};

export type ThemeMode = 'light' | 'dark';
export type ColorPalette = 'actual' | 'legacy';

export type LayoutState = {
  sidebarExpanded: boolean;
  activeItem: string;
  openSections: string[];
  themeMode: ThemeMode;
  colorPalette: ColorPalette;
};
