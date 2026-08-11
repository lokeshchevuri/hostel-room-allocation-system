const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNo: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    floor: {
      type: Number,
      required: true,
      default: 1,
      index: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Room capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [10, 'Capacity cannot exceed 10'],
    },
    occupied: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    available: {
      type: Number,
      default: function () {
        return this.capacity - this.occupied;
      },
      index: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Partially Occupied', 'Full'],
      default: 'Available',
      index: true,
    },
  },
  { timestamps: true }
);

// Pre-validate hook to calculate floor, available beds, and status automatically
roomSchema.pre('save', function (next) {
  // Update available beds
  this.available = Math.max(0, this.capacity - this.occupied);

  // Update room status automatically
  if (this.occupied === 0) {
    this.status = 'Available';
  } else if (this.occupied >= this.capacity) {
    this.status = 'Full';
  } else {
    this.status = 'Partially Occupied';
  }

  // Derive floor if not specified explicitly (e.g., Room 101 -> Floor 1, Room 204 -> Floor 2)
  if (!this.floor || this.isModified('roomNo')) {
    const numericPart = parseInt(this.roomNo.replace(/\D/g, ''), 10);
    if (!isNaN(numericPart)) {
      if (numericPart >= 100) {
        this.floor = Math.floor(numericPart / 100);
      } else {
        this.floor = 0; // Ground floor
      }
    }
  }

  next();
});

// Text index for fast search
roomSchema.index({ roomNo: 'text', status: 'text' });

module.exports = mongoose.model('Room', roomSchema);
