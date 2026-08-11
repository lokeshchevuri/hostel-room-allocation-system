import React from 'react';
import { LayoutDashboard, Users, DoorClosed, Key, Search } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isSidebarOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'rooms', label: 'Rooms', icon: DoorClosed },
    { id: 'allocation', label: 'Room Allocation', icon: Key },
    { id: 'records', label: 'Advanced Search', icon: Search },
  ];

  return (
    <aside
      className={`glass-panel sidebar-container ${isSidebarOpen ? 'open' : ''}`}
      style={{
        width: isSidebarOpen ? '250px' : '0px',
        opacity: isSidebarOpen ? 1 : 0,
        pointerEvents: isSidebarOpen ? 'auto' : 'none',
        overflow: 'hidden',
        flexShrink: 0,
        padding: isSidebarOpen ? '1.5rem 0.85rem' : '0px',
        height: 'calc(100vh - 85px)',
        position: 'sticky',
        top: '75px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        whiteSpace: 'nowrap'
      }}
    >
      <div>
        <p style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: 'var(--text-subtle)',
          padding: '0 0.75rem 0.75rem',
          letterSpacing: '0.06em'
        }}>
          Navigation Menu
        </p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? 'var(--accent-gradient)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 4px 12px var(--accent-glow)' : 'none',
                }}
              >
                <Icon size={18} color={isActive ? '#ffffff' : 'var(--text-subtle)'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
