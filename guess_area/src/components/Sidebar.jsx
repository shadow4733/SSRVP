import React from 'react';

const Sidebar = ({ position, children }) => {
  const sidebarClass = position === 'left' ? 'sidebar sidebar-left' : 'sidebar sidebar-right';
  return (
    <div className={sidebarClass}>
      {children}
    </div>
  );
};

export default Sidebar;