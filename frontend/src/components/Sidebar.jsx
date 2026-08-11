import React from 'react';
import { LayoutDashboard, Users, DoorClosed, Key, Search, HelpCircle } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'rooms', label: 'Rooms', icon: DoorClosed },
    { id: 'allocation', label: 'Room Allocation', icon: Key },
    { id: 'records', label: 'Advanced Search', icon: Search },
  ];

  return (
    <aside className="glass-panel" style={{ width: '250px', flexShrink: 0, padding: '1.5rem 1rem', height: 'calc(100vh - 75px)', position: 'sticky', top: '75px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)', padding: '0 0.75rem 0.75rem', letterSpacing: '0.05em' }}>
          Navigation Menu
        </p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
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
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? 'var(--accent-gradient)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 14px var(--accent-glow)' : 'none',
                }}
              >
                <Icon size={19} color={isActive ? '#ffffff' : 'var(--text-muted)'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* College Info Footer */}
      {/* <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: 'var(--glass-border)' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <HelpCircle size={14} color="var(--accent-secondary)" />
          <span>CSE Department Project</span>
        </p>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', margin: '0.2rem 0 0 0' }}>
          Real-world Hostel Allocation
        </p>
      </div> */}
    </aside>
  );
}
