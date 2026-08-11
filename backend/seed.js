const path = require('path');
const dns = require('dns');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Fix Windows DNS SRV lookup issues for MongoDB Atlas by setting public DNS fallback
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  // fallback ignored
}

dotenv.config({ path: path.join(__dirname, '../.env') });

const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Room = require('./models/Room');
const Allocation = require('./models/Allocation');

const seedData = async () => {
  try {
    let connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel_db';
    if (connStr.includes('mongodb.net/?')) {
      connStr = connStr.replace('mongodb.net/?', 'mongodb.net/hostel_db?');
    } else if (connStr.endsWith('mongodb.net/')) {
      connStr = connStr + 'hostel_db';
    }

    console.log(`Connecting to MongoDB Atlas database for seeding...`);
    await mongoose.connect(connStr);
    console.log('MongoDB Connected!');

    console.log('Clearing existing data...');
    await Admin.deleteMany({});
    await Student.deleteMany({});
    await Room.deleteMany({});
    await Allocation.deleteMany({});

    // 1. Create Default Admin
    const admin = await Admin.create({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      name: 'Hostel Chief Warden',
      role: 'Admin',
    });
    console.log(`Admin created: username='${admin.username}', password='${process.env.ADMIN_PASSWORD || 'admin123'}'`);

    // 2. Create Sample Rooms across multiple floors
    const sampleRooms = [
      { roomNo: '101', floor: 1, capacity: 4 },
      { roomNo: '102', floor: 1, capacity: 4 },
      { roomNo: '103', floor: 1, capacity: 2 },
      { roomNo: '104', floor: 1, capacity: 3 },
      { roomNo: '201', floor: 2, capacity: 4 },
      { roomNo: '202', floor: 2, capacity: 4 },
      { roomNo: '203', floor: 2, capacity: 2 },
      { roomNo: '301', floor: 3, capacity: 4 },
      { roomNo: '302', floor: 3, capacity: 3 },
    ];

    const createdRooms = [];
    for (const r of sampleRooms) {
      const room = new Room({
        roomNo: r.roomNo,
        floor: r.floor,
        capacity: r.capacity,
        occupied: 0,
      });
      await room.save();
      createdRooms.push(room);
    }
    console.log(`Created ${createdRooms.length} rooms`);

    // 3. Create Sample Students
    const sampleStudentsData = [
      { name: 'Bindhu', rollNo: '23CST001', department: 'CST', year: 2, phone: '9876543210' },
      { name: 'Aarav Sharma', rollNo: '23CSE015', department: 'CSE', year: 2, phone: '9876543211' },
      { name: 'Ananya Verma', rollNo: '22ECE042', department: 'ECE', year: 3, phone: '9876543212' },
      { name: 'Rohan Gupta', rollNo: '24CST008', department: 'CST', year: 1, phone: '9876543213' },
      { name: 'Vikram Patel', rollNo: '21ME089', department: 'ME', year: 4, phone: '9876543214' },
      { name: 'Kavya Reddy', rollNo: '23CSE078', department: 'CSE', year: 2, phone: '9876543215' },
      { name: 'Rahul Kumar', rollNo: '22CE033', department: 'CE', year: 3, phone: '9876543216' },
      { name: 'Sneha Nair', rollNo: '24IT012', department: 'IT', year: 1, phone: '9876543217' },
    ];

    const createdStudents = [];
    for (const s of sampleStudentsData) {
      const student = await Student.create(s);
      createdStudents.push(student);
    }
    console.log(`Created ${createdStudents.length} students`);

    // 4. Allocate room 101 to Bindhu and Aarav
    const room101 = createdRooms.find((r) => r.roomNo === '101');
    const student1 = createdStudents.find((s) => s.rollNo === '23CST001');
    const student2 = createdStudents.find((s) => s.rollNo === '23CSE015');

    if (room101 && student1 && student2) {
      // Allocate Bindhu
      const alloc1 = await Allocation.create({
        student: student1._id,
        room: room101._id,
        studentRollNo: student1.rollNo,
        studentName: student1.name,
        roomNo: room101.roomNo,
        bedNo: 1,
        allocatedDate: new Date(),
      });
      student1.isAllocated = true;
      student1.allocatedRoom = room101._id;
      student1.allocatedRoomNo = room101.roomNo;
      student1.allocatedBedNo = 1;
      student1.allocatedDate = alloc1.allocatedDate;
      await student1.save();

      // Allocate Aarav
      const alloc2 = await Allocation.create({
        student: student2._id,
        room: room101._id,
        studentRollNo: student2.rollNo,
        studentName: student2.name,
        roomNo: room101.roomNo,
        bedNo: 2,
        allocatedDate: new Date(),
      });
      student2.isAllocated = true;
      student2.allocatedRoom = room101._id;
      student2.allocatedRoomNo = room101.roomNo;
      student2.allocatedBedNo = 2;
      student2.allocatedDate = alloc2.allocatedDate;
      await student2.save();

      room101.occupied = 2;
      await room101.save(); // status becomes 'Partially Occupied' automatically!
    }

    console.log('MongoDB Atlas Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
