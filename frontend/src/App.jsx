import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/StudentsPage';
import RoomsPage from './pages/RoomsPage';
import AllocationPage from './pages/AllocationPage';
import RecordsPage from './pages/RecordsPage';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const { admin, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('hostel_theme') || 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Toast notifications array
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hostel_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-muted)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(16, 185, 129, 0.2)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ fontWeight: 600 }}>Loading Hostel Allocation System...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <Login />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} showToast={showToast} />;
      case 'students':
        return <StudentsPage showToast={showToast} />;
      case 'rooms':
        return <RoomsPage showToast={showToast} />;
      case 'allocation':
        return <AllocationPage showToast={showToast} setActiveTab={setActiveTab} />;
      case 'records':
        return <RecordsPage showToast={showToast} />;
      default:
        return <Dashboard setActiveTab={setActiveTab} showToast={showToast} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar */}
      <Navbar currentTheme={theme} toggleTheme={toggleTheme} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} showToast={showToast} />

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '1.5rem 1rem', gap: '1.5rem', position: 'relative' }}>
        
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />

        {/* Content Area */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {renderActivePage()}
        </main>
      </div>

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
            {toast.type === 'success' ? (
              <CheckCircle2 size={20} color="var(--status-available)" />
            ) : (
              <AlertCircle size={20} color="var(--status-full)" />
            )}
            <span style={{ fontSize: '0.88rem', fontWeight: 500, flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: 0 }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
