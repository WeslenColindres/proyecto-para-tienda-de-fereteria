import type { SidebarMenuItem } from '@/shared/types/layout';

type SidebarItemProps = {
  item: SidebarMenuItem;
  activeItem: string;
  openSections: string[];
  onToggleSection: (sectionId: string) => void;
  onSelect: (itemId: string, parentId?: string) => void;
};

const SidebarItem = ({
  item,
  activeItem,
  openSections,
  onToggleSection,
  onSelect,
}: SidebarItemProps) => {
  const isOpen = item.children?.length ? openSections.includes(item.id) : false;
  const isActive = activeItem === item.id;

  return (
    <div className={`menu-item-wrapper ${isOpen ? 'open' : ''}`} data-wrapper-id={item.id}>
      <button
        className={`menu-item ${isActive ? 'active' : ''} ${item.children?.length ? 'has-children' : ''}`}
        data-item-id={item.id}
        title={item.label}
        onClick={() => {
          if (item.children?.length) {
            onToggleSection(item.id);
          } else {
            onSelect(item.id);
          }
        }}
      >
        <span className="menu-icon">{item.icon}</span>
        <div className='contenedor-lebel-alert-menu'>
          <span className="menu-label">{item.label}</span>
          {item.badge ? <span className="badge">{item.badge}</span> : null}
        </div>
        {item.children?.length ? <span className="chevron">{isOpen ? '>' : '>'}</span> : null}
      </button>

      {item.children?.length ? (
        <div className="submenu">
          {item.children.map((child) => (
            <div className="submenu-item" key={child.id}>
              <SidebarItem
                item={child}
                activeItem={activeItem}
                openSections={openSections}
                onToggleSection={onToggleSection}
                onSelect={(id) => onSelect(id, item.id)}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default SidebarItem;
