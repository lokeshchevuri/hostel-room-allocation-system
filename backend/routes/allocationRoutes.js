const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Room = require('../models/Room');
const Allocation = require('../models/Allocation');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all active room allocations
// @route   GET /api/allocations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const allocations = await Allocation.find()
      .populate('student', 'name rollNo department year phone')
      .populate('room', 'roomNo floor capacity occupied available status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: allocations.length,
      data: allocations,
    });
  } catch (error) {
    console.error('Error fetching allocations:', error);
    res.status(500).json({ success: false, message: 'Server error fetching allocations' });
  }
});

// @desc    Allocate a student to a room and bed
// @route   POST /api/allocations
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { studentId, roomId, bedNo } = req.body;

    if (!studentId || !roomId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both studentId and roomId',
      });
    }

    // 1. Fetch Student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // 2. Fetch Room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // 3. Check room availability
    if (room.occupied >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Room ${room.roomNo} is full. No available beds.`,
      });
    }

    // 4. Determine or validate bed number
    const existingAllocationsInRoom = await Allocation.find({ room: room._id });
    const takenBedNumbers = existingAllocationsInRoom.map((a) => a.bedNo);

    let assignedBed = parseInt(bedNo, 10);

    if (assignedBed) {
      if (assignedBed < 1 || assignedBed > room.capacity) {
        return res.status(400).json({
          success: false,
          message: `Bed number must be between 1 and ${room.capacity}`,
        });
      }
      if (takenBedNumbers.includes(assignedBed)) {
        return res.status(400).json({
          success: false,
          message: `Bed #${assignedBed} in Room ${room.roomNo} is already occupied.`,
        });
      }
    } else {
      // Auto-assign first available bed number
      for (let b = 1; b <= room.capacity; b++) {
        if (!takenBedNumbers.includes(b)) {
          assignedBed = b;
          break;
        }
      }
    }

    // 5. If student was already allocated to another room, deallocate previous bed first
    if (student.isAllocated && student.allocatedRoom) {
      const prevRoom = await Room.findById(student.allocatedRoom);
      if (prevRoom) {
        prevRoom.occupied = Math.max(0, prevRoom.occupied - 1);
        await prevRoom.save();
      }
      await Allocation.deleteOne({ student: student._id });
    }

    // 6. Create Allocation record
    const allocation = await Allocation.create({
      student: student._id,
      room: room._id,
      studentRollNo: student.rollNo,
      studentName: student.name,
      roomNo: room.roomNo,
      bedNo: assignedBed,
      allocatedDate: new Date(),
    });

    // 7. Update Student record
    student.isAllocated = true;
    student.allocatedRoom = room._id;
    student.allocatedRoomNo = room.roomNo;
    student.allocatedBedNo = assignedBed;
    student.allocatedDate = allocation.allocatedDate;
    await student.save();

    // 8. Update Room occupied count (triggers pre-save hook for status update)
    room.occupied += 1;
    await room.save();

    res.status(201).json({
      success: true,
      message: `Student '${student.name}' (${student.rollNo}) successfully allocated to Room ${room.roomNo}, Bed #${assignedBed}`,
      data: allocation,
    });
  } catch (error) {
    console.error('Error allocating room:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during room allocation' });
  }
});

// @desc    Deallocate / Vacate student room
// @route   POST /api/allocations/vacate
// @access  Private
router.post('/vacate', protect, async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (!student.isAllocated || !student.allocatedRoom) {
      return res.status(400).json({
        success: false,
        message: `Student '${student.name}' is not currently allocated to any room`,
      });
    }

    const room = await Room.findById(student.allocatedRoom);
    if (room) {
      room.occupied = Math.max(0, room.occupied - 1);
      await room.save(); // Recalculates available and status automatically
    }

    await Allocation.deleteOne({ student: student._id });

    const prevRoomNo = student.allocatedRoomNo;

    // Reset student allocation status
    student.isAllocated = false;
    student.allocatedRoom = null;
    student.allocatedRoomNo = '';
    student.allocatedBedNo = null;
    student.allocatedDate = null;
    await student.save();

    res.json({
      success: true,
      message: `Student '${student.name}' (${student.rollNo}) has vacated Room ${prevRoomNo}. Space freed successfully.`,
    });
  } catch (error) {
    console.error('Error vacating room:', error);
    res.status(500).json({ success: false, message: 'Server error vacating room' });
  }
});

module.exports = router;
