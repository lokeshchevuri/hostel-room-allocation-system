import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminSettingsModal from './AdminSettingsModal';
import { Building2, LogOut, ShieldCheck, Sun, Moon, Settings } from 'lucide-react';

export default function Navbar({ currentTheme, toggleTheme, showToast }) {
  const { admin, logout } = useContext(AuthContext);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: 'var(--glass-border)',
        padding: '0.8rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              background: 'var(--accent-primary)',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Building2 size={22} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                HOSTEL ALLOCATION SYSTEM
              </h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', margin: 0, fontWeight: 500 }}>
                Campus Administration Portal
              </p>
            </div>
          </div>

          {/* Admin Profile & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0 }}
              title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {currentTheme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#2563eb" />}
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
