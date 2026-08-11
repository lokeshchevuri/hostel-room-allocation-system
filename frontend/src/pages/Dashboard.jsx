import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, DoorClosed, CheckCircle2, Bed, Layers, UserPlus, Key, LayoutDashboard } from 'lucide-react';

export default function Dashboard({ setActiveTab, showToast }) {
  const { admin, token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        <p>Loading hostel statistics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--status-full)' }}>
        <p>{error || 'Failed to load statistics'}</p>
        <button onClick={fetchStats} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Registered Students', value: stats.totalStudents, icon: Users, color: 'var(--accent-primary)', subText: `${stats.allocatedStudents} Allocated | ${stats.unallocatedStudents} Unallocated` },
    { title: 'Total Hostel Rooms', value: stats.totalRooms, icon: DoorClosed, color: 'var(--accent-secondary)', subText: `${stats.statusBreakdown.available} Available | ${stats.statusBreakdown.partiallyOccupied} Partial | ${stats.statusBreakdown.full} Full` },
    { title: 'Total Bed Capacity', value: stats.totalCapacity, icon: Bed, color: 'var(--status-available)', subText: `${stats.totalOccupied} Occupied Beds` },
    { title: 'Available Free Beds', value: stats.totalAvailableBeds, icon: CheckCircle2, color: 'var(--status-partial)', subText: `${stats.occupancyRate}% Overall Occupancy` },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Dashboard Sub-Header Navigation Bar */}
      <div className="glass-panel" style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            padding: '0.5rem',
            borderRadius: '10px',
            background: 'var(--accent-glow)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <LayoutDashboard size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
              Hostel Overview
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', margin: 0 }}>
              Live occupancy statistics & room allocation status
            </p>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="glass-panel" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {card.title}
                </span>
                <div style={{
                  padding: '0.5rem',
                  borderRadius: '10px',
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={20} color={card.color} />
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '2rem', margin: '0 0 0.2rem 0', color: 'var(--text-main)', fontWeight: 700 }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* Occupancy Meter */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Layers size={18} color="var(--accent-primary)" />
            <span>Hostel Capacity & Occupancy Rate</span>
          </h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--text-main)' }}>Occupied Beds ({stats.totalOccupied} / {stats.totalCapacity})</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{stats.occupancyRate}%</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, stats.occupancyRate)}%`,
                height: '100%',
                background: 'var(--accent-primary)',
                borderRadius: '10px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)' }}>ALLOCATED STUDENTS</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--status-available)' }}>{stats.allocatedStudents}</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)' }}>UNALLOCATED STUDENTS</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--status-full)' }}>{stats.unallocatedStudents}</span>
            </div>
          </div>
        </div>

        {/* Room Status Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <DoorClosed size={18} color="var(--accent-secondary)" />
            <span>Room Status Summary</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--status-available-bg)', borderRadius: '10px', border: '1px solid var(--status-available)' }}>
              <span style={{ fontWeight: 600, color: 'var(--status-available)', fontSize: '0.9rem' }}>Fully Available Rooms</span>
              <span className="badge badge-available">{stats.statusBreakdown.available} Rooms</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--status-partial-bg)', borderRadius: '10px', border: '1px solid var(--status-partial)' }}>
              <span style={{ fontWeight: 600, color: 'var(--status-partial)', fontSize: '0.9rem' }}>Partially Occupied Rooms</span>
              <span className="badge badge-partial">{stats.statusBreakdown.partiallyOccupied} Rooms</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--status-full-bg)', borderRadius: '10px', border: '1px solid var(--status-full)' }}>
              <span style={{ fontWeight: 600, color: 'var(--status-full)', fontSize: '0.9rem' }}>Completely Full Rooms</span>
              <span className="badge badge-full">{stats.statusBreakdown.full} Rooms</span>
            </div>
          </div>
        </div>

      </div>

      {/* Floor-wise Availability Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
          <Layers size={18} color="var(--accent-primary)" />
          <span>Floor-wise Room & Bed Availability Breakdown</span>
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Floor</th>
                <th>Total Rooms</th>
                <th>Total Beds</th>
                <th>Occupied Beds</th>
                <th>Available Beds</th>
                <th>Status</th>
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
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{floor.floorLabel}</td>
                    <td>{floor.totalRooms}</td>
                    <td>{floor.capacity}</td>
                    <td style={{ color: 'var(--status-full)', fontWeight: 600 }}>{floor.occupied}</td>
                    <td style={{ color: 'var(--status-available)', fontWeight: 700 }}>{floor.available} Free</td>
                    <td>
                      {floor.available > 0 ? (
                        <span className="badge badge-available">{floor.available} Free</span>
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

    </div>
  );
}
