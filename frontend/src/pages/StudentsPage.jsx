import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, Search, UserPlus, Trash2, Edit, Filter, Phone, BookOpen, Calendar, CheckCircle, XCircle, AlertTriangle, Building } from 'lucide-react';

export default function StudentsPage({ showToast }) {
  const { token } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state (Case-insensitive matching)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [allocationStatus, setAllocationStatus] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    department: 'CST',
    year: '2',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirmation Modal
  const [deleteId, setDeleteId] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (selectedDept !== 'ALL') queryParams.append('department', selectedDept);
      if (selectedYear !== 'ALL') queryParams.append('year', selectedYear);
      if (allocationStatus !== 'ALL') queryParams.append('allocationStatus', allocationStatus);

      const res = await fetch(`/api/students?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      if (showToast) showToast('Failed to connect to student database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300); // 300ms debounce for ultra-smooth typing search
    return () => clearTimeout(timer);
  }, [searchTerm, selectedDept, selectedYear, allocationStatus, token]);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      rollNo: '',
      department: 'CST',
      year: '2',
      phone: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      rollNo: student.rollNo,
      department: student.department,
      year: student.year.toString(),
      phone: student.phone,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const url = editingStudent ? `/api/students/${editingStudent._id}` : '/api/students';
      const method = editingStudent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        if (showToast) showToast(data.message || 'Student saved successfully!', 'success');
        setIsModalOpen(false);
        fetchStudents();
      } else {
        setFormError(data.message || 'Failed to save student record');
      }
    } catch (err) {
      console.error('Error submitting student:', err);
      setFormError('Server error while saving student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/students/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast('Student record deleted and room bed freed!', 'success');
        setDeleteId(null);
        fetchStudents();
      } else {
        if (showToast) showToast(data.message || 'Failed to delete student', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      if (showToast) showToast('Server error deleting record', 'error');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users size={26} color="var(--accent-primary)" />
            <span>Student Directory & Records</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>
            Admin-only management for hostel student registration and academic details.
          </p>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <UserPlus size={18} />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Advanced Case-Insensitive Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          
          {/* Instant Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Name, Roll No, Phone..."
              className="input-control"
              style={{ paddingLeft: '2.6rem' }}
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="input-control select-control"
            >
              <option value="ALL">All Departments</option>
              <option value="CST">CST (Comp Sci & Tech)</option>
              <option value="CSE">CSE (Computer Science)</option>
              <option value="ECE">ECE (Electronics)</option>
              <option value="ME">ME (Mechanical)</option>
              <option value="CE">CE (Civil)</option>
              <option value="IT">IT (Info Tech)</option>
            </select>
          </div>

          {/* Academic Year Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="input-control select-control"
            >
              <option value="ALL">All Academic Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          {/* Allocation Status Filter */}
          <div>
            <select
              value={allocationStatus}
              onChange={(e) => setAllocationStatus(e.target.value)}
              className="input-control select-control"
            >
              <option value="ALL">All Allocation Status</option>
              <option value="allocated">Allocated to Room</option>
              <option value="unallocated">Unallocated / Pending</option>
            </select>
          </div>

        </div>
      </div>

      {/* Student Records Data Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Year</th>
                <th>Phone Number</th>
                <th>Room Allocation</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Filtering student records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No student records match the selected filters.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>
                      {student.rollNo}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {student.name}
                    </td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: 'var(--accent-primary)',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        {student.department}
                      </span>
                    </td>
                    <td>Year {student.year}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                        <Phone size={14} />
                        <span>{student.phone}</span>
                      </div>
                    </td>
                    <td>
                      {student.isAllocated ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CheckCircle size={16} color="var(--status-available)" />
                          <span style={{ fontWeight: 600, color: 'var(--status-available)' }}>
                            Room {student.allocatedRoomNo} (Bed #{student.allocatedBedNo})
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <XCircle size={16} color="var(--text-subtle)" />
                          <span style={{ color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                            Unallocated
                          </span>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEditModal(student)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Student Record"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(student._id)}
                          className="btn btn-danger btn-sm"
                          title="Delete Student Record (Vacate / Graduation)"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>
              {editingStudent ? 'Edit Student Details' : 'Add New Student Record'}
            </h3>

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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  STUDENT NAME *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="student name"
                  className="input-control"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  ROLL NUMBER *
                </label>
                <input
                  type="text"
                  required
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  placeholder="e.g. 23CST001"
                  className="input-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    DEPARTMENT *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="input-control select-control"
                  >
                    <option value="CST">CST</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="ME">ME</option>
                    <option value="CE">CE</option>
                    <option value="IT">IT</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    YEAR OF STUDY *
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="input-control select-control"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  PHONE NUMBER *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="input-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Saving...' : (editingStudent ? 'Update Record' : 'Add Student')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Delete Student Record?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you want to delete this student record? If allocated to a hostel room, the bed space will automatically be freed.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button onClick={() => setDeleteId(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                Delete & Free Bed
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
