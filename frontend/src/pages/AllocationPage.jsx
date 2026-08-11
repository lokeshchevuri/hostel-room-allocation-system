import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Key, UserCheck, DoorOpen, Bed, LogOut, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function AllocationPage({ showToast, setActiveTab }) {
  const { token } = useContext(AuthContext);
  
  // Active Tab within Allocation Page: 'allocate' or 'vacate'
  const [allocationMode, setAllocationMode] = useState('allocate');

  // Data lists
  const [unallocatedStudents, setUnallocatedStudents] = useState([]);
  const [allocatedStudents, setAllocatedStudents] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form selections for Allocation
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedNo, setSelectedBedNo] = useState('');
  const [floorFilter, setFloorFilter] = useState('ALL');

  // Vacate Form Selection
  const [vacateStudentId, setVacateStudentId] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch unallocated students
      const resUnalloc = await fetch('/api/students?allocationStatus=unallocated', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataUnalloc = await resUnalloc.json();
      if (dataUnalloc.success) setUnallocatedStudents(dataUnalloc.data);

      // 2. Fetch allocated students (for vacate tab)
      const resAlloc = await fetch('/api/students?allocationStatus=allocated', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataAlloc = await resAlloc.json();
      if (dataAlloc.success) setAllocatedStudents(dataAlloc.data);

      // 3. Fetch rooms with available beds
      const queryRooms = floorFilter !== 'ALL' ? `?floor=${floorFilter}` : '';
      const resRooms = await fetch(`/api/rooms${queryRooms}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataRooms = await resRooms.json();
      if (dataRooms.success) {
        // Filter rooms that have at least 1 free bed
        setAvailableRooms(dataRooms.data.filter((r) => r.available > 0));
      }

    } catch (err) {
      console.error('Error fetching allocation data:', err);
      if (showToast) showToast('Error loading allocation resources', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [floorFilter, token]);

  // Selected room details to compute available bed numbers
  const selectedRoomObj = availableRooms.find((r) => r._id === selectedRoomId);

  const getAvailableBedNumbers = () => {
    if (!selectedRoomObj) return [];
    const takenBeds = (selectedRoomObj.occupants || []).map((o) => o.bedNo);
    const freeBeds = [];
    for (let b = 1; b <= selectedRoomObj.capacity; b++) {
      if (!takenBeds.includes(b)) {
        freeBeds.push(b);
      }
    }
    return freeBeds;
  };

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedRoomId) {
      if (showToast) showToast('Please select both a student and a room', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/allocations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: selectedStudentId,
          roomId: selectedRoomId,
          bedNo: selectedBedNo ? parseInt(selectedBedNo, 10) : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (showToast) showToast(data.message || 'Room allocated successfully!', 'success');
        setSelectedStudentId('');
        setSelectedRoomId('');
        setSelectedBedNo('');
        fetchData();
      } else {
        if (showToast) showToast(data.message || 'Failed to allocate room', 'error');
      }
    } catch (err) {
      console.error('Allocation submission error:', err);
      if (showToast) showToast('Server error during room allocation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVacateSubmit = async (e) => {
    e.preventDefault();
    if (!vacateStudentId) {
      if (showToast) showToast('Please select a student to vacate', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/allocations/vacate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ studentId: vacateStudentId }),
      });

      const data = await res.json();

      if (data.success) {
        if (showToast) showToast(data.message || 'Room vacated and bed space updated!', 'success');
        setVacateStudentId('');
        fetchData();
      } else {
        if (showToast) showToast(data.message || 'Failed to vacate room', 'error');
      }
    } catch (err) {
      console.error('Vacate error:', err);
      if (showToast) showToast('Server error vacating room', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.6rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Key size={26} color="var(--accent-primary)" />
          <span>Hostel Room & Bed Allocation Portal</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>
          Assign unallocated students to available floor rooms or process hostel vacate requests.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => setAllocationMode('allocate')}
          className={`btn ${allocationMode === 'allocate' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <UserCheck size={18} />
          <span>Allocate Room & Bed</span>
        </button>
        <button
          onClick={() => setAllocationMode('vacate')}
          className={`btn ${allocationMode === 'vacate' ? 'btn-danger' : 'btn-secondary'}`}
        >
          <LogOut size={18} />
          <span>Vacate Room / Deallocate Bed</span>
        </button>
      </div>

      {allocationMode === 'allocate' ? (
        /* Allocate Room Workflow Form */
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '750px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DoorOpen size={20} color="var(--accent-secondary)" />
            <span>Assign Student to Available Room</span>
          </h3>

          <form onSubmit={handleAllocateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Step 1: Select Student */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.4rem' }}>
                STEP 1: SELECT UNALLOCATED STUDENT *
              </label>
              {unallocatedStudents.length === 0 ? (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--status-available)', fontSize: '0.88rem' }}>
                  All registered students are currently allocated to hostel rooms!
                </div>
              ) : (
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="input-control select-control"
                >
                  <option value="">-- Choose Student ({unallocatedStudents.length} Pending) --</option>
                  {unallocatedStudents.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.rollNo}) - Dept: {s.department}, Year {s.year}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Step 2: Select Room by Floor */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                  STEP 2: SELECT AVAILABLE HOSTEL ROOM *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Floor Filter:</span>
                  <select
                    value={floorFilter}
                    onChange={(e) => setFloorFilter(e.target.value)}
                    style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', background: 'var(--bg-surface)', border: 'var(--border-color)', color: 'var(--text-main)' }}
                  >
                    <option value="ALL">All Floors</option>
                    <option value="0">Ground Floor</option>
                    <option value="1">1st Floor</option>
                    <option value="2">2nd Floor</option>
                    <option value="3">3rd Floor</option>
                  </select>
                </div>
              </div>

              {availableRooms.length === 0 ? (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '0.88rem' }}>
                  No available rooms found for the selected floor filter. Please add rooms or free beds.
                </div>
              ) : (
                <select
                  required
                  value={selectedRoomId}
                  onChange={(e) => {
                    setSelectedRoomId(e.target.value);
                    setSelectedBedNo('');
                  }}
                  className="input-control select-control"
                >
                  <option value="">-- Choose Room ({availableRooms.length} Available) --</option>
                  {availableRooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      Room {r.roomNo} (Floor {r.floor}) • {r.available} of {r.capacity} Beds Free [{r.status}]
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Step 3: Select Bed Number */}
            {selectedRoomObj && (
              <div className="animate-fade-in" style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '12px', border: 'var(--glass-border)' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--status-available)', marginBottom: '0.6rem' }}>
                  STEP 3: CHOOSE BED NUMBER IN ROOM {selectedRoomObj.roomNo}
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {getAvailableBedNumbers().map((bedNum) => (
                    <button
                      key={bedNum}
                      type="button"
                      onClick={() => setSelectedBedNo(bedNum.toString())}
                      style={{
                        padding: '0.6rem 1.25rem',
                        borderRadius: '10px',
                        border: selectedBedNo === bedNum.toString() ? '2px solid var(--status-available)' : '1px solid var(--border-color)',
                        background: selectedBedNo === bedNum.toString() ? 'var(--status-available-bg)' : 'var(--bg-surface)',
                        color: selectedBedNo === bedNum.toString() ? 'var(--status-available)' : 'var(--text-main)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Bed size={16} />
                      <span>Bed #{bedNum}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || unallocatedStudents.length === 0 || availableRooms.length === 0}
              className="btn btn-primary"
              style={{ padding: '0.85rem', marginTop: '1rem' }}
            >
              {submitting ? 'Processing Allocation...' : 'Confirm Room Allocation'}
            </button>
          </form>
        </div>
      ) : (
        /* Vacate Room Workflow Form */
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '750px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
            <LogOut size={20} />
            <span>Process Student Hostel Vacate / Deallocate Bed</span>
          </h3>

          <form onSubmit={handleVacateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                SELECT ALLOCATED STUDENT TO VACATE *
              </label>
              {allocatedStudents.length === 0 ? (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  No students currently occupy hostel rooms.
                </div>
              ) : (
                <select
                  required
                  value={vacateStudentId}
                  onChange={(e) => setVacateStudentId(e.target.value)}
                  className="input-control select-control"
                >
                  <option value="">-- Choose Allocated Student ({allocatedStudents.length} Occupying) --</option>
                  {allocatedStudents.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.rollNo}) — Currently in Room {s.allocatedRoomNo} (Bed #{s.allocatedBedNo})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || allocatedStudents.length === 0}
              className="btn btn-danger"
              style={{ padding: '0.85rem', marginTop: '1rem' }}
            >
              {submitting ? 'Processing Vacate...' : 'Deallocate Student & Free Bed Space'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
