import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminSettingsModal from '../components/AdminSettingsModal';
import { Users, DoorClosed, CheckCircle2, Bed, Layers, UserPlus, Key, Settings, ShieldCheck } from 'lucide-react';

export default function Dashboard({ setActiveTab, showToast }) {
  const { admin, token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.message || 'Failed to load statistics');
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError('Connection error loading hostel statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading dashboard analytics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        <p>{error || 'Failed to load statistics'}</p>
        <button onClick={fetchStats} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Registered Students', value: stats.totalStudents, icon: Users, color: '#6366f1', subText: `${stats.allocatedStudents} Allocated | ${stats.unallocatedStudents} Pending` },
    { title: 'Total Hostel Rooms', value: stats.totalRooms, icon: DoorClosed, color: '#06b6d4', subText: `${stats.statusBreakdown.available} Available | ${stats.statusBreakdown.partiallyOccupied} Partial | ${stats.statusBreakdown.full} Full` },
    { title: 'Total Bed Capacity', value: stats.totalCapacity, icon: Bed, color: '#10b981', subText: `${stats.totalOccupied} Occupied Beds` },
    { title: 'Available Berths / Beds', value: stats.totalAvailableBeds, icon: CheckCircle2, color: '#f59e0b', subText: `${stats.occupancyRate}% Overall Occupancy` },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '20px',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem', color: '#ffffff' }}>
            Welcome, {admin?.name || 'Administrator'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Username: <strong style={{ color: 'var(--accent-secondary)' }}>@{admin?.username}</strong> • Real-time occupancy & hostel analytics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => setIsSettingsModalOpen(true)} className="btn btn-secondary btn-sm">
            <Settings size={16} />
            <span>Change Username / Password</span>
          </button>
          <button onClick={() => setActiveTab('students')} className="btn btn-primary btn-sm">
            <UserPlus size={16} />
            <span>Add Student</span>
          </button>
          <button onClick={() => setActiveTab('allocation')} className="btn btn-secondary btn-sm">
            <Key size={16} />
            <span>Allocate Room</span>
          </button>
        </div>
      </div>

      {/* Primary Statistic Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {card.title}
                </span>
                <div style={{
                  padding: '0.6rem',
                  borderRadius: '12px',
                  background: `${card.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={22} color={card.color} />
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '2.2rem', margin: '0 0 0.3rem 0', color: 'var(--text-main)' }}>
                  {card.value}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', margin: 0 }}>
                  {card.subText}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Occupancy Rate Bar & Room Status Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        {/* Occupancy Meter */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={20} color="var(--accent-primary)" />
            <span>Hostel Capacity & Occupancy Rate</span>
          </h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
              <span>Occupied Beds ({stats.totalOccupied} / {stats.totalCapacity})</span>
              <span style={{ color: 'var(--accent-secondary)' }}>{stats.occupancyRate}%</span>
            </div>
            <div style={{ width: '100%', height: '14px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, stats.occupancyRate)}%`,
                height: '100%',
                background: 'var(--accent-gradient)',
                borderRadius: '10px',
                transition: 'width 0.6s ease'
              }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem', borderTop: 'var(--glass-border)' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>ALLOCATED STUDENTS</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--status-available)' }}>{stats.allocatedStudents}</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>UNALLOCATED STUDENTS</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--status-full)' }}>{stats.unallocatedStudents}</span>
            </div>
          </div>
        </div>

        {/* Room Status Breakdown */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DoorClosed size={20} color="var(--accent-secondary)" />
            <span>Room Status Summary</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <span style={{ fontWeight: 600, color: 'var(--status-available)' }}>Fully Available Rooms</span>
              <span className="badge badge-available" style={{ fontSize: '0.95rem' }}>{stats.statusBreakdown.available} Rooms</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <span style={{ fontWeight: 600, color: 'var(--status-partial)' }}>Partially Occupied Rooms</span>
              <span className="badge badge-partial" style={{ fontSize: '0.95rem' }}>{stats.statusBreakdown.partiallyOccupied} Rooms</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <span style={{ fontWeight: 600, color: 'var(--status-full)' }}>Completely Full Rooms</span>
              <span className="badge badge-full" style={{ fontSize: '0.95rem' }}>{stats.statusBreakdown.full} Rooms</span>
            </div>
          </div>
        </div>

      </div>

      {/* Floor-wise Availability Table */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={20} color="var(--accent-primary)" />
          <span>Floor-wise Room & Bed Availability Breakdown</span>
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Floor</th>
                <th>Total Rooms</th>
                <th>Total Beds (Capacity)</th>
                <th>Occupied Beds</th>
                <th>Available Beds</th>
                <th>Availability Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.floorBreakdown.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No rooms configured yet</td>
                </tr>
              ) : (
                stats.floorBreakdown.map((floor) => (
                  <tr key={floor.floor}>
                    <td style={{ fontWeight: 600 }}>{floor.floorLabel}</td>
                    <td>{floor.totalRooms}</td>
                    <td>{floor.capacity}</td>
                    <td style={{ color: 'var(--status-full)', fontWeight: 600 }}>{floor.occupied}</td>
                    <td style={{ color: 'var(--status-available)', fontWeight: 700 }}>{floor.available} Beds</td>
                    <td>
                      {floor.available > 0 ? (
                        <span className="badge badge-available">{floor.available} Beds Free</span>
                      ) : (
                        <span className="badge badge-full">Floor Full</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Settings Modal */}
      <AdminSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        showToast={showToast}
      />

    </div>
  );
}
