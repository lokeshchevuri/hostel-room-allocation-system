import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Search, Download, Filter, RefreshCw, CheckCircle2, DoorClosed, Users, Layers, Bed, Phone, ArrowUpRight } from 'lucide-react';

export default function RecordsPage({ showToast }) {
  const { token } = useContext(AuthContext);

  // Search & Multi-Filter Query States (Case-insensitive)
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState('ALL');
  const [minFreeBeds, setMinFreeBeds] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [roomStatusFilter, setRoomStatusFilter] = useState('ALL');

  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      setLoading(true);

      // 1. Fetch Rooms with filters
      const roomParams = new URLSearchParams();
      if (searchTerm) roomParams.append('search', searchTerm);
      if (floorFilter !== 'ALL') roomParams.append('floor', floorFilter);
      if (minFreeBeds !== 'ALL') roomParams.append('minAvailableBeds', minFreeBeds);
      if (roomStatusFilter !== 'ALL') roomParams.append('status', roomStatusFilter);

      const resRooms = await fetch(`/api/rooms?${roomParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataRooms = await resRooms.json();

      // 2. Fetch Students with filters
      const studentParams = new URLSearchParams();
      if (searchTerm) studentParams.append('search', searchTerm);
      if (departmentFilter !== 'ALL') studentParams.append('department', departmentFilter);
      if (yearFilter !== 'ALL') studentParams.append('year', yearFilter);

      const resStudents = await fetch(`/api/students?${studentParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataStudents = await resStudents.json();

      if (dataRooms.success) setRooms(dataRooms.data);
      if (dataStudents.success) setStudents(dataStudents.data);

    } catch (err) {
      console.error('Error loading hostel records:', err);
      if (showToast) showToast('Error fetching records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, floorFilter, minFreeBeds, departmentFilter, yearFilter, roomStatusFilter, token]);

  // Aggregate Metrics derived from current filter results
  const totalMatchingRooms = rooms.length;
  const totalFreeBedsInMatches = rooms.reduce((sum, r) => sum + r.available, 0);
  const totalMatchingStudents = students.length;

  // Export CSV Handler
  const handleExportCSV = () => {
    if (students.length === 0) {
      if (showToast) showToast('No records available to export', 'error');
      return;
    }

    const headers = ['Roll Number', 'Student Name', 'Department', 'Year', 'Phone', 'Allocated Status', 'Room Number', 'Bed Number'];
    const rows = students.map((s) => [
      `"${s.rollNo}"`,
      `"${s.name}"`,
      `"${s.department}"`,
      s.year,
      `"${s.phone}"`,
      s.isAllocated ? 'Allocated' : 'Unallocated',
      `"${s.allocatedRoomNo || 'N/A'}"`,
      s.allocatedBedNo || 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hostel_Records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) showToast('Hostel records exported to CSV successfully!', 'success');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Header & Export */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Search size={26} color="var(--accent-secondary)" />
            <span>Advanced Multi-Criteria Records Finder</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>
            Instant case-insensitive lookup across students, room numbers, floor-wise berths, and bed counts.
          </p>
        </div>

        <button onClick={handleExportCSV} className="btn btn-secondary">
          <Download size={18} />
          <span>Export Filtered CSV Report</span>
        </button>
      </div>

      {/* Metric Summary Cards for Active Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
            <DoorClosed size={24} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>MATCHING ROOMS</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalMatchingRooms}</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-available)' }}>
            <Bed size={24} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>AVAILABLE FREE BEDS</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-available)' }}>{totalFreeBedsInMatches}</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-secondary)' }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>FILTERED STUDENTS</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalMatchingStudents}</span>
          </div>
        </div>
      </div>

      {/* Advanced Filter Control Matrix */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
          <Filter size={18} color="var(--accent-primary)" />
          <span>Multi-Criteria Search & Filter Options (Case-Insensitive)</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          
          {/* Universal Search Box */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              SEARCH TERM (STUDENT NAME, ROLL NO, ROOM NO, PHONE)
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type name, 23CST001, room 101, or phone..."
                className="input-control"
                style={{ paddingLeft: '2.6rem' }}
              />
            </div>
          </div>

          {/* Floor Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              HOSTEL FLOOR
            </label>
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="input-control select-control"
            >
              <option value="ALL">All Floors</option>
              <option value="0">Ground Floor</option>
              <option value="1">1st Floor</option>
              <option value="2">2nd Floor</option>
              <option value="3">3rd Floor</option>
            </select>
          </div>

          {/* Available Beds Count Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              MIN AVAILABLE BEDS
            </label>
            <select
              value={minFreeBeds}
              onChange={(e) => setMinFreeBeds(e.target.value)}
              className="input-control select-control"
            >
              <option value="ALL">Any Availability</option>
              <option value="1">≥ 1 Free Bed</option>
              <option value="2">≥ 2 Free Beds</option>
              <option value="3">≥ 3 Free Beds</option>
              <option value="4">Full Empty Room</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              DEPARTMENT
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="input-control select-control"
            >
              <option value="ALL">All Departments</option>
              <option value="CST">CST</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
              <option value="IT">IT</option>
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              ACADEMIC YEAR
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="input-control select-control"
            >
              <option value="ALL">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          {/* Room Status Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              ROOM STATUS
            </label>
            <select
              value={roomStatusFilter}
              onChange={(e) => setRoomStatusFilter(e.target.value)}
              className="input-control select-control"
            >
              <option value="ALL">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Partially Occupied">Partially Occupied</option>
              <option value="Full">Full</option>
            </select>
          </div>

        </div>
      </div>

      {/* Filtered Rooms Breakdown List */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <DoorClosed size={20} color="var(--accent-secondary)" />
          <span>Filtered Hostel Rooms & Current Occupants ({rooms.length})</span>
        </h3>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Querying hostel database...</p>
        ) : rooms.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No rooms matched your criteria.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {rooms.map((room) => (
              <div key={room._id} style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', border: 'var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>Room {room.roomNo}</span>
                  <span className={`badge ${room.status === 'Available' ? 'badge-available' : room.status === 'Partially Occupied' ? 'badge-partial' : 'badge-full'}`}>
                    {room.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Floor {room.floor} • Capacity: {room.capacity} Beds • <strong style={{ color: 'var(--status-available)' }}>{room.available} Free Berths</strong>
                </p>

                <div style={{ paddingTop: '0.75rem', borderTop: 'var(--glass-border)' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', marginBottom: '0.4rem' }}>
                    OCCUPANTS ({room.occupants?.length || 0}):
                  </span>
                  {(!room.occupants || room.occupants.length === 0) ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Room is currently empty</span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {room.occupants.map((occ) => (
                        <div key={occ.allocationId} style={{ fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.03)', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>
                          <span><strong>Bed #{occ.bedNo}:</strong> {occ.studentName} ({occ.rollNo})</span>
                          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{occ.department}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
