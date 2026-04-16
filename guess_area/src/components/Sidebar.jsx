import React from 'react';

/**
 * Универсальная боковая панель слева или справа.
 * @param {{position: 'left'|'right', children: React.ReactNode}} props Пропсы компонента.
 * @returns {JSX.Element}
 */
const Sidebar = ({ position, children }) => {
  const sidebarClass = position === 'left' ? 'sidebar sidebar-left' : 'sidebar sidebar-right';
  return (
    <div className={sidebarClass}>
      {children}
    </div>
  );
};

export default Sidebar;
