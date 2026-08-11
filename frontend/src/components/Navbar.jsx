import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminSettingsModal from './AdminSettingsModal';
import { Building2, LogOut, ShieldCheck, Sun, Moon, Settings, Menu, X } from 'lucide-react';

export default function Navbar({ currentTheme, toggleTheme, isSidebarOpen, toggleSidebar, showToast }) {
  const { admin, logout } = useContext(AuthContext);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: 'var(--glass-border)',
        padding: '0.8rem 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Brand Header with Sidebar Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            
            {/* Sidebar Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: '10px', width: '38px', height: '38px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title={isSidebarOpen ? "Collapse Sidebar" : "Open Sidebar Menu"}
            >
              {isSidebarOpen ? <X size={20} color="var(--accent-primary)" /> : <Menu size={20} color="var(--accent-primary)" />}
            </button>

            <div style={{
              background: 'var(--accent-gradient)',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px var(--accent-glow)'
            }}>
              <Building2 size={22} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                HOSTEL ALLOCATION SYSTEM
              </h1>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', margin: 0, fontWeight: 500 }}>
                Campus Administration Portal
              </p>
            </div>
          </div>

          {/* Admin Profile & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0 }}
              title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {currentTheme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#10b981" />}
            </button>

            {/* Admin Profile & Account Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.4rem 0.9rem',
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="Click to Change Admin Username / Password"
            >
              <ShieldCheck size={18} color="var(--accent-primary)" />
              <div style={{ textAlign: 'left' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {admin?.name || 'Chief Warden'}
                </span>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                  @{admin?.username || 'admin'} • Settings
                </span>
              </div>
              <Settings size={15} color="var(--text-subtle)" style={{ marginLeft: '0.2rem' }} />
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="btn btn-danger btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* Admin Settings Dialog */}
      <AdminSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        showToast={showToast}
      />
    </>
  );
}
