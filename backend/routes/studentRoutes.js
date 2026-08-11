const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Room = require('../models/Room');
const Allocation = require('../models/Allocation');
const { protect } = require('../middleware/authMiddleware');

// Helper to escape regex special characters for case-insensitive search
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// @desc    Get all students with advanced case-insensitive filters
// @route   GET /api/students
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search, department, year, allocationStatus, roomNo } = req.query;
    const query = {};

    // Advanced search filter (Case-insensitive)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
      query.$or = [
        { name: searchRegex },
        { rollNo: searchRegex },
        { department: searchRegex },
        { phone: searchRegex },
        { allocatedRoomNo: searchRegex },
      ];
    }

    // Filter by Department (Case-insensitive)
    if (department && department !== 'ALL') {
      query.department = new RegExp(`^${escapeRegex(department.trim())}$`, 'i');
    }

    // Filter by Year
    if (year && year !== 'ALL') {
      query.year = parseInt(year, 10);
    }

    // Filter by Allocation Status
    if (allocationStatus === 'allocated') {
      query.isAllocated = true;
    } else if (allocationStatus === 'unallocated') {
      query.isAllocated = false;
    }

    // Filter by specific Room Number (Case-insensitive)
    if (roomNo) {
      query.allocatedRoomNo = new RegExp(`^${escapeRegex(roomNo.trim())}$`, 'i');
    }

    const students = await Student.find(query)
      .populate('allocatedRoom', 'roomNo floor capacity status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Server error fetching students' });
  }
});

// @desc    Get single student details
// @route   GET /api/students/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('allocatedRoom');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching student' });
  }
});

// @desc    Add new student (Admin only)
// @route   POST /api/students
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, rollNo, department, year, phone } = req.body;

    if (!name || !rollNo || !department || !year || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, rollNo, department, year, phone',
      });
    }

    // Case-insensitive duplicate check for Roll Number
    const existingStudent = await Student.findOne({
      rollNo: new RegExp(`^${escapeRegex(rollNo.trim())}$`, 'i'),
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: `Student with Roll Number '${rollNo}' already exists`,
      });
    }

    const student = await Student.create({
      name: name.trim(),
      rollNo: rollNo.trim().toUpperCase(),
      department: department.trim().toUpperCase(),
      year: parseInt(year, 10),
      phone: phone.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: student,
    });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error adding student' });
  }
});

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, rollNo, department, year, phone } = req.body;
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    // Check roll number uniqueness if changed
    if (rollNo && rollNo.toUpperCase() !== student.rollNo) {
      const duplicate = await Student.findOne({
        rollNo: new RegExp(`^${escapeRegex(rollNo.trim())}$`, 'i'),
        _id: { $ne: student._id },
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Roll Number '${rollNo}' is already assigned to another student`,
        });
      }
    }

    student.name = name ? name.trim() : student.name;
    student.rollNo = rollNo ? rollNo.trim().toUpperCase() : student.rollNo;
    student.department = department ? department.trim().toUpperCase() : student.department;
    student.year = year ? parseInt(year, 10) : student.year;
    student.phone = phone ? phone.trim() : student.phone;

    await student.save();

    res.json({
      success: true,
      message: 'Student record updated successfully',
      data: student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error updating student' });
  }
});

// @desc    Delete student record (Graduated / Vacated) and free room bed
// @route   DELETE /api/students/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    // If student was allocated a room, deallocate & update room status automatically
    if (student.isAllocated && student.allocatedRoom) {
      const room = await Room.findById(student.allocatedRoom);
      if (room) {
        room.occupied = Math.max(0, room.occupied - 1);
        await room.save(); // Save triggers pre-save hook to recalculate available & status!
      }
      // Remove allocation record
      await Allocation.deleteOne({ student: student._id });
    }

    await Student.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Student record deleted and room space deallocated successfully',
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, message: 'Server error deleting student record' });
  }
});

module.exports = router;
