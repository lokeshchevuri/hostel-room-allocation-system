const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Student = require('../models/Student');
const Allocation = require('../models/Allocation');
const { protect } = require('../middleware/authMiddleware');

const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// @desc    Get all rooms with advanced floor, availability, and bed filters
// @route   GET /api/rooms
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search, floor, status, minAvailableBeds, maxCapacity } = req.query;
    const query = {};

    // Case-insensitive search by Room Number, Status, or Occupant Student Name/RollNo
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
      
      // Find room IDs where occupant student matches name or roll number
      const matchingAllocations = await Allocation.find({
        $or: [
          { studentName: searchRegex },
          { studentRollNo: searchRegex }
        ]
      }).select('room');
      
      const matchingRoomIdsFromOccupants = matchingAllocations.map(a => a.room);

      query.$or = [
        { roomNo: searchRegex },
        { status: searchRegex },
        { _id: { $in: matchingRoomIdsFromOccupants } }
      ];
    }

    // Filter by Floor (Numeric)
    if (floor !== undefined && floor !== '' && floor !== 'ALL') {
      query.floor = parseInt(floor, 10);
    }

    // Filter by Room Status (Available, Partially Occupied, Full) - Case-insensitive
    if (status && status !== 'ALL') {
      query.status = new RegExp(`^${escapeRegex(status.trim())}$`, 'i');
    }

    // Filter by Minimum Available Beds (e.g. rooms with at least 2 beds available)
    if (minAvailableBeds !== undefined && minAvailableBeds !== '' && minAvailableBeds !== 'ALL') {
      query.available = { $gte: parseInt(minAvailableBeds, 10) };
    }

    // Filter by Max Capacity
    if (maxCapacity && maxCapacity !== 'ALL') {
      query.capacity = { $gte: parseInt(maxCapacity, 10) };
    }

    const rooms = await Room.find(query).sort({ floor: 1, roomNo: 1 });

    // Fetch occupants for each room for rich frontend display
    const roomIds = rooms.map((r) => r._id);
    const allocations = await Allocation.find({ room: { $in: roomIds } })
      .populate('student', 'name rollNo department year phone')
      .sort({ bedNo: 1 });

    // Map occupants into rooms
    const roomsWithOccupants = rooms.map((room) => {
      const roomObj = room.toObject();
      roomObj.occupants = allocations
        .filter((a) => a.room.toString() === room._id.toString())
        .map((a) => ({
          allocationId: a._id,
          bedNo: a.bedNo,
          studentId: a.student ? a.student._id : null,
          studentName: a.studentName || (a.student ? a.student.name : 'Unknown'),
          rollNo: a.studentRollNo || (a.student ? a.student.rollNo : 'Unknown'),
          department: a.student ? a.student.department : '',
          year: a.student ? a.student.year : '',
          phone: a.student ? a.student.phone : '',
          allocatedDate: a.allocatedDate,
        }));
      return roomObj;
    });

    res.json({
      success: true,
      count: roomsWithOccupants.length,
      data: roomsWithOccupants,
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ success: false, message: 'Server error fetching rooms' });
  }
});

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const allocations = await Allocation.find({ room: room._id }).populate('student');

    res.json({
      success: true,
      data: {
        ...room.toObject(),
        occupants: allocations,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching room details' });
  }
});

// @desc    Add new room (Admin only)
// @route   POST /api/rooms
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { roomNo, capacity, floor } = req.body;

    if (!roomNo || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide room number and room capacity',
      });
    }

    // Case-insensitive duplicate room check
    const existingRoom = await Room.findOne({
      roomNo: new RegExp(`^${escapeRegex(roomNo.trim())}$`, 'i'),
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Room number '${roomNo}' already exists`,
      });
    }

    // Determine floor: if explicit provided use it, otherwise derive from room number
    let roomFloor = parseInt(floor, 10);
    if (isNaN(roomFloor)) {
      const numPart = parseInt(roomNo.replace(/\D/g, ''), 10);
      roomFloor = !isNaN(numPart) && numPart >= 100 ? Math.floor(numPart / 100) : 0;
    }

    const room = new Room({
      roomNo: roomNo.trim().toUpperCase(),
      capacity: parseInt(capacity, 10),
      floor: roomFloor,
      occupied: 0,
    });

    await room.save(); // pre-save hook handles available & status automatically

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room,
    });
  } catch (error) {
    console.error('Error adding room:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating room' });
  }
});

// @desc    Update room details (e.g. capacity or floor)
// @route   PUT /api/rooms/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { capacity, floor, status } = req.body;
    let room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (capacity !== undefined) {
      const newCapacity = parseInt(capacity, 10);
      if (newCapacity < room.occupied) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce capacity below currently occupied beds (${room.occupied})`,
        });
      }
      room.capacity = newCapacity;
    }

    if (floor !== undefined) {
      room.floor = parseInt(floor, 10);
    }

    await room.save(); // recalculates available & status

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: room,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error updating room' });
  }
});

// @desc    Delete a room (Must have 0 occupied beds)
// @route   DELETE /api/rooms/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.occupied > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete room '${room.roomNo}' while it has ${room.occupied} occupied bed(s). Deallocate students first.`,
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Room '${room.roomNo}' deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ success: false, message: 'Server error deleting room' });
  }
});

module.exports = router;
