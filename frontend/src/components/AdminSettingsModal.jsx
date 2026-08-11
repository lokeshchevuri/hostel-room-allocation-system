import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Shield, Key, User, Lock, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function AdminSettingsModal({ isOpen, onClose, showToast }) {
  const { admin, token, login } = useContext(AuthContext);

  const [name, setName] = useState(admin?.name || '');
  const [username, setUsername] = useState(admin?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          username,
          currentPassword,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Update auth state with new token & admin object
        login(data.data, data.data.token);
        if (showToast) showToast('Admin credentials updated successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        onClose();
      } else {
        setError(data.message || 'Failed to update admin profile');
      }
    } catch (err) {
      console.error('Error updating admin profile:', err);
      setError('Server error updating credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: 'var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Shield size={24} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Admin Account Settings</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            background: 'var(--status-full-bg)',
            border: '1px solid var(--status-full)',
            color: 'var(--status-full)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          
          {/* Display Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              ADMIN DISPLAY NAME
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chief Warden Admin"
              className="input-control"
            />
          </div>

          {/* Admin Username */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              ADMIN USERNAME (FOR LOGIN)
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="New admin username"
                className="input-control"
                style={{ paddingLeft: '2.6rem' }}
              />
            </div>
          </div>

          <div style={{ borderTop: 'var(--glass-border)', paddingTop: '1rem', marginTop: '0.25rem' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-secondary)', marginBottom: '0.85rem' }}>
              PASSWORD MODIFICATION (OPTIONAL)
            </p>

            {/* Current Password */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                CURRENT PASSWORD (REQUIRED TO SAVE) *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="input-control"
                  style={{ paddingLeft: '2.6rem' }}
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                NEW PASSWORD (LEAVE BLANK TO KEEP UNCHANGED)
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="input-control"
                  style={{ paddingLeft: '2.6rem' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
