import type { SidebarSection } from '@/shared/types/layout';
import SidebarItem from '@/ui/molecules/SidebarItem/SidebarItem';

type SidebarProps = {
  sections: SidebarSection[];
  activeItem: string;
  openSections: string[];
  expanded: boolean;
  isDrawerOpen: boolean;
  onToggleSection: (sectionId: string) => void;
  onSelect: (itemId: string, parentId?: string) => void;
  onCloseDrawer: () => void;
};

const AppSidebar = ({
  sections,
  activeItem,
  openSections,
  expanded,
  isDrawerOpen,
  onToggleSection,
  onSelect,
  onCloseDrawer
}: SidebarProps) => {
  return (
    <aside className={`app-sidebar ${expanded ? '' : 'collapsed'} ${isDrawerOpen ? 'drawer-open' : ''}`} id="app-sidebar">
      <div className="sidebar-scroll">
        <div className="sidebar-drawer-header">
          <span>Menu principal</span>
          <button className="icon-button" id="sidebar-close" aria-label="Cerrar menu lateral" onClick={onCloseDrawer}>
            ✕
          </button>
        </div>
        <div className="sidebar-brand">
          <span className="logo-small">POS 360</span>
          <span className="sidebar-version">v2.1.3</span>
        </div>
        <div id="sidebar-menu">
          {sections.map((section) => (
            <section className="sidebar-section" key={section.id}>
              <div className="section-title">{section.title}</div>
              {section.items.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  activeItem={activeItem}
                  openSections={openSections}
                  onToggleSection={onToggleSection}
                  onSelect={onSelect}
                />
              ))}
            </section>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
