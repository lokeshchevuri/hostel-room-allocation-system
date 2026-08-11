import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DoorClosed, Search, Plus, Trash2, Layers, CheckCircle2, AlertCircle, Users, Bed, Sliders } from 'lucide-react';

export default function RoomsPage({ showToast }) {
  const { token } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State (Case-insensitive)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [minAvailableBeds, setMinAvailableBeds] = useState('ALL');

  // Add Room Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    roomNo: '',
    capacity: '4',
    floor: '1',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Selected Room Occupants Modal
  const [activeOccupantRoom, setActiveOccupantRoom] = useState(null);

  // Delete Room Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteFilterFloor, setDeleteFilterFloor] = useState('ALL');
  const [selectedDeleteRoomId, setSelectedDeleteRoomId] = useState('');
  const [adminAuthPassword, setAdminAuthPassword] = useState('');
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState('');

  const filteredDeleteRooms = rooms.filter((r) => {
    if (deleteFilterFloor === 'ALL') return true;
    return r.floor === parseInt(deleteFilterFloor, 10);
  });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (selectedFloor !== 'ALL') queryParams.append('floor', selectedFloor);
      if (selectedStatus !== 'ALL') queryParams.append('status', selectedStatus);
      if (minAvailableBeds !== 'ALL') queryParams.append('minAvailableBeds', minAvailableBeds);

      const res = await fetch(`/api/rooms?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRooms(data.data);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      if (showToast) showToast('Failed to connect to room database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRooms();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedFloor, selectedStatus, minAvailableBeds, token]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        if (showToast) showToast(`Room ${formData.roomNo} created successfully!`, 'success');
        setIsModalOpen(false);
        setFormData({ roomNo: '', capacity: '4', floor: '1' });
        fetchRooms();
      } else {
        setFormError(data.message || 'Failed to add room');
      }
    } catch (err) {
      console.error('Error creating room:', err);
      setFormError('Server error creating room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoom = async (roomId, roomNo, occupied) => {
    if (occupied > 0) {
      if (showToast) showToast(`Cannot delete Room ${roomNo} while occupied by students`, 'error');
      return;
    }

    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        if (showToast) showToast(`Room ${roomNo} deleted successfully`, 'success');
        fetchRooms();
      } else {
        if (showToast) showToast(data.message || 'Failed to delete room', 'error');
      }
    } catch (err) {
      console.error('Error deleting room:', err);
      if (showToast) showToast('Server error deleting room', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return <span className="badge badge-available">Available</span>;
      case 'Partially Occupied':
        return <span className="badge badge-partial">Partially Occupied</span>;
      case 'Full':
        return <span className="badge badge-full">Full</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <DoorClosed size={26} color="var(--accent-secondary)" />
            <span>Hostel Room Directory & Status</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>
            Floor-wise capacity tracking, available berths, and occupied room status.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Add New Room</span>
          </button>
          <button onClick={() => { setIsDeleteModalOpen(true); setDeleteModalError(''); }} className="btn btn-danger">
            <Trash2 size={18} />
            <span>Delete Room</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          
          {/* Room Number / Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Room No or Status..."
              className="input-control"
              style={{ paddingLeft: '2.6rem' }}
            />
          </div>

          {/* Floor Selector Filter */}
          <div>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="input-control select-control"
            >
              <option value="ALL">All Floors</option>
              <option value="0">Ground Floor</option>
              <option value="1">1st Floor</option>
              <option value="2">2nd Floor</option>
              <option value="3">3rd Floor</option>
              <option value="4">4th Floor</option>
            </select>
          </div>

          {/* Room Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-control select-control"
            >
              <option value="ALL">All Room Statuses</option>
              <option value="Available">Available Only</option>
              <option value="Partially Occupied">Partially Occupied</option>
              <option value="Full">Full Only</option>
            </select>
          </div>

          {/* Available Beds Count Filter */}
          <div>
            <select
              value={minAvailableBeds}
              onChange={(e) => setMinAvailableBeds(e.target.value)}
              className="input-control select-control"
            >
              <option value="ALL">Min Free Beds: Any</option>
              <option value="1">At least 1 Bed Free</option>
              <option value="2">At least 2 Beds Free</option>
              <option value="3">At least 3 Beds Free</option>
              <option value="4">Entire Empty Room (4 Beds)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Room Cards Grid View */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading room statuses...
        </div>
      ) : rooms.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No rooms found matching the current search parameters.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
          {rooms.map((room) => {
            const occupancyPercentage = Math.round((room.occupied / room.capacity) * 100);
            return (
              <div key={room._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  
                  {/* Top Row: Room No & Status Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Room {room.roomNo}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', background: 'var(--bg-card-hover)', padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        {room.floor === 0 ? 'Ground' : `Floor ${room.floor}`}
                      </span>
                    </div>
                    {getStatusBadge(room.status)}
                  </div>

                  {/* Bed Breakdown Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', padding: '0.85rem', background: 'var(--input-bg)', borderRadius: '10px', marginBottom: '1rem', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>CAPACITY</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{room.capacity}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>OCCUPIED</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--status-full)' }}>{room.occupied}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>FREE BEDS</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--status-available)' }}>{room.available}</span>
                    </div>
                  </div>

                  {/* Visual Occupancy Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${occupancyPercentage}%`,
                        height: '100%',
                        background: room.status === 'Full' ? 'var(--status-full)' : (room.status === 'Partially Occupied' ? 'var(--status-partial)' : 'var(--status-available)'),
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>

                </div>

                {/* Bottom Row Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '0.85rem', borderTop: 'var(--glass-border)' }}>
                  <button
                    onClick={() => setActiveOccupantRoom(room)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.85rem', width: '100%', justifyContent: 'center' }}
                  >
                    <Users size={15} />
                    <span>View Occupants ({room.occupants?.length || 0})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Room Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Add New Hostel Room</h3>

            {formError && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  ROOM NUMBER * (e.g. 101, 102, 205, 301)
                </label>
                <input
                  type="text"
                  required
                  value={formData.roomNo}
                  onChange={(e) => {
                    const val = e.target.value;
                    const numPart = parseInt(val.replace(/\D/g, ''), 10);
                    const derivedFloor = !isNaN(numPart) && numPart >= 100 ? Math.floor(numPart / 100).toString() : '0';
                    setFormData({ ...formData, roomNo: val, floor: derivedFloor });
                  }}
                  placeholder="e.g. 101"
                  className="input-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    TOTAL CAPACITY (BEDS) *
                  </label>
                  <select
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="input-control select-control"
                  >
                    <option value="1">1 Bed (Single)</option>
                    <option value="2">2 Beds (Double)</option>
                    <option value="3">3 Beds (Triple)</option>
                    <option value="4">4 Beds (Quad)</option>
                    <option value="6">6 Beds (Dormitory)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    FLOOR NUMBER *
                  </label>
                  <select
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="input-control select-control"
                  >
                    <option value="0">Ground Floor</option>
                    <option value="1">Floor 1</option>
                    <option value="2">Floor 2</option>
                    <option value="3">Floor 3</option>
                    <option value="4">Floor 4</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Occupants Dialog */}
      {activeOccupantRoom && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Occupants of Room {activeOccupantRoom.roomNo}</span>
              {getStatusBadge(activeOccupantRoom.status)}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Floor {activeOccupantRoom.floor} • Capacity: {activeOccupantRoom.capacity} Beds ({activeOccupantRoom.available} Free)
            </p>

            {activeOccupantRoom.occupants.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--input-bg)', borderRadius: '12px', border: 'var(--glass-border)', color: 'var(--text-muted)' }}>
                No students currently allocated to this room.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeOccupantRoom.occupants.map((occ) => (
                  <div key={occ.allocationId} style={{ padding: '0.85rem 1rem', background: 'var(--input-bg)', borderRadius: '10px', border: 'var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>Bed #{occ.bedNo}</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{occ.studentName}</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Roll No: {occ.rollNo} • Dept: {occ.department} (Yr {occ.year})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setActiveOccupantRoom(null)} className="btn btn-secondary btn-sm">
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Room Modal with Floor Filter & Admin Password Authorization */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>Delete Hostel Room</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Select floor to auto-filter rooms, choose an unoccupied room, and authorize with admin password.
            </p>

            {deleteModalError && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'var(--status-full-bg)',
                border: '1px solid var(--status-full)',
                color: 'var(--status-full)',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}>
                {deleteModalError}
              </div>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!selectedDeleteRoomId) {
                setDeleteModalError('Please select a room to delete');
                return;
              }
              if (!adminAuthPassword || adminAuthPassword.trim() === '') {
                setDeleteModalError('Please enter admin password to authorize deletion');
                return;
              }
              const targetRoom = rooms.find(r => r._id === selectedDeleteRoomId);
              if (!targetRoom) return;
              if (targetRoom.occupied > 0) {
                setDeleteModalError(`Cannot delete Room ${targetRoom.roomNo} because it currently has ${targetRoom.occupied} occupied beds.`);
                return;
              }
              setDeletingRoom(true);
              await handleDeleteRoom(targetRoom._id, targetRoom.roomNo, targetRoom.occupied);
              setDeletingRoom(false);
              setIsDeleteModalOpen(false);
              setSelectedDeleteRoomId('');
              setAdminAuthPassword('');
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              {/* Step 1: Select Floor */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '0.03em' }}>
                  1. SELECT FLOOR TO FILTER ROOMS
                </label>
                <select
                  value={deleteFilterFloor}
                  onChange={(e) => {
                    setDeleteFilterFloor(e.target.value);
                    setSelectedDeleteRoomId('');
                    setDeleteModalError('');
                  }}
                  className="input-control select-control"
                >
                  <option value="ALL">All Floors ({rooms.length} Rooms)</option>
                  <option value="0">Ground Floor</option>
                  <option value="1">1st Floor</option>
                  <option value="2">2nd Floor</option>
                  <option value="3">3rd Floor</option>
                  <option value="4">4th Floor</option>
                </select>
              </div>

              {/* Step 2: Auto-filtered Rooms List Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '0.03em' }}>
                  2. SELECT ROOM TO DELETE *
                </label>
                <select
                  required
                  value={selectedDeleteRoomId}
                  onChange={(e) => { setSelectedDeleteRoomId(e.target.value); setDeleteModalError(''); }}
                  className="input-control select-control"
                >
                  <option value="">-- Choose Room ({filteredDeleteRooms.length} rooms available on this floor) --</option>
                  {filteredDeleteRooms.map((r) => (
                    <option key={r._id} value={r._id} disabled={r.occupied > 0}>
                      Room {r.roomNo} (Floor {r.floor}) — {r.capacity} Beds ({r.occupied > 0 ? `Occupied: ${r.occupied} beds` : 'Unoccupied - Ready to delete'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Admin Password Authorization */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '0.03em' }}>
                  3. ENTER ADMIN PASSWORD *
                </label>
                <input
                  type="password"
                  required
                  value={adminAuthPassword}
                  onChange={(e) => { setAdminAuthPassword(e.target.value); setDeleteModalError(''); }}
                  placeholder="Enter your admin password"
                  className="input-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => { setIsDeleteModalOpen(false); setAdminAuthPassword(''); }} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={deletingRoom || !selectedDeleteRoomId || !adminAuthPassword} className="btn btn-danger">
                  {deletingRoom ? 'Deleting...' : 'Authorize & Delete Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
