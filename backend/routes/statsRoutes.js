const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Room = require('../models/Room');
const Allocation = require('../models/Allocation');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get aggregate hostel statistics and dashboard metrics
// @route   GET /api/stats
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const [totalStudents, allocatedStudents, rooms] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ isAllocated: true }),
      Room.find(),
    ]);

    const unallocatedStudents = totalStudents - allocatedStudents;
    const totalRooms = rooms.length;

    let totalCapacity = 0;
    let totalOccupied = 0;
    let availableRoomsCount = 0;
    let partialRoomsCount = 0;
    let fullRoomsCount = 0;

    const floorMap = {};

    rooms.forEach((room) => {
      totalCapacity += room.capacity;
      totalOccupied += room.occupied;

      if (room.status === 'Available') availableRoomsCount++;
      else if (room.status === 'Partially Occupied') partialRoomsCount++;
      else if (room.status === 'Full') fullRoomsCount++;

      const f = room.floor !== undefined ? room.floor : 0;
      if (!floorMap[f]) {
        floorMap[f] = {
          floor: f,
          floorLabel: f === 0 ? 'Ground Floor' : `Floor ${f}`,
          totalRooms: 0,
          capacity: 0,
          occupied: 0,
          available: 0,
        };
      }
      floorMap[f].totalRooms++;
      floorMap[f].capacity += room.capacity;
      floorMap[f].occupied += room.occupied;
      floorMap[f].available += room.available;
    });

    const totalAvailableBeds = Math.max(0, totalCapacity - totalOccupied);
    const occupancyRate = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : 0;

    const floorBreakdown = Object.values(floorMap).sort((a, b) => a.floor - b.floor);

    res.json({
      success: true,
      data: {
        totalStudents,
        allocatedStudents,
        unallocatedStudents,
        totalRooms,
        totalCapacity,
        totalOccupied,
        totalAvailableBeds,
        occupancyRate: parseFloat(occupancyRate),
        statusBreakdown: {
          available: availableRoomsCount,
          partiallyOccupied: partialRoomsCount,
          full: fullRoomsCount,
        },
        floorBreakdown,
      },
    });
  } catch (error) {
    console.error('Error calculating hostel stats:', error);
    res.status(500).json({ success: false, message: 'Server error generating statistics' });
  }
});

module.exports = router;
