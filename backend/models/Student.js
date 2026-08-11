const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      index: true,
    },
    rollNo: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 1,
      max: 4,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    isAllocated: {
      type: Boolean,
      default: false,
      index: true,
    },
    allocatedRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    allocatedRoomNo: {
      type: String,
      default: '',
      index: true,
    },
    allocatedBedNo: {
      type: Number,
      default: null,
    },
    allocatedDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Text index for ultra-fast multi-field case-insensitive search
studentSchema.index({ name: 'text', rollNo: 'text', department: 'text', phone: 'text' });

module.exports = mongoose.model('Student', studentSchema);
