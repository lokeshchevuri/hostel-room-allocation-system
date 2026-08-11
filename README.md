# Hostel Room Allocation & Management System (MERN Stack)

A production-grade, full-stack college hostel administration system built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) for Computer Science department projects.

---

## 🌟 Key System Features

1. **Admin Security Portal**:
   - Secure Admin Login using JWT tokens and bcrypt password hashing.
   - **Student self-registration is disabled** — only authorized hostel administrators can enroll students and manage room allocations.
   - Pre-seeded default admin credentials (`admin` / `admin123`).

2. **Student Directory & Record Management**:
   - Complete record details: `Name`, `Roll Number`, `Department` (CST, CSE, ECE, ME, CE, IT), `Year of Study` (1-4), `Phone Number`.
   - Admin option to edit student records or **Delete Student Records** (e.g. upon graduation or vacating hostel), which **automatically deallocates the bed** and updates room availability.

3. **Room Management & Automated Status Updates**:
   - Room attributes: `Room Number`, `Capacity`, `Occupied Beds`, `Available Beds`, `Room Status`.
   - Automatic room status calculation:
     - 🟢 `Available`: All beds free
     - 🟠 `Partially Occupied`: Some beds allocated
     - 🔴 `Full`: All beds filled
   - View list of occupants inside any room with a single click.

4. **Interactive Room & Bed Allocation Wizard**:
   - Select pending unallocated student -> Select room by floor -> Choose specific bed number (`Bed #1`, `Bed #2`, etc.).
   - Includes **Vacate Room / Deallocate Bed Tool** to instantly free up bed capacity when a student leaves.

5. **Advanced Case-Insensitive Search & Multi-Filter Matrix**:
   - Ultra-fast case-insensitive search matching student names, roll numbers, room numbers, and phone numbers.
   - Multi-criteria filtering by:
     - **Hostel Floor**: Ground Floor, Floor 1, Floor 2, Floor 3, etc.
     - **Minimum Available Beds**: Rooms with $\ge 1$, $\ge 2$, or $\ge 3$ free beds.
     - **Department & Academic Year**.
     - **Room Status**: Available, Partially Occupied, Full.
   - Export filtered hostel records to **CSV** for college administrative reporting.

6. **Rich Visual Aesthetics**:
   - Dark & Light mode toggle with state persistence.
   - Vibrant glassmorphic card UI, animated background gradients, smooth tab transitions, and status badges.

---

## 📁 Project Directory Structure

```text
fsd_project/
├── backend/
│   ├── config/
│   │   └── db.js            # MongoDB Atlas connection handler
│   ├── middleware/
│   │   └── authMiddleware.js # JWT authentication middleware
│   ├── models/
│   │   ├── Admin.js         # Admin Mongoose model
│   │   ├── Student.js       # Student model with indexing
│   │   ├── Room.js          # Room model with auto-status calculation
│   │   └── Allocation.js    # Bed allocation links
│   ├── routes/
│   │   ├── authRoutes.js    # Login API
│   │   ├── studentRoutes.js # Student CRUD API
│   │   ├── roomRoutes.js    # Room CRUD & occupant API
│   │   ├── allocationRoutes.js # Allocation & Vacate API
│   │   └── statsRoutes.js   # Aggregate analytics API
│   ├── seed.js              # Database initial seeder script
│   └── server.js            # Express API server & static server
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar components
│   │   ├── context/         # AuthContext provider
│   │   ├── pages/           # Login, Dashboard, Students, Rooms, Allocation, Records pages
│   │   ├── App.jsx          # Root application component & toasts
│   │   └── index.css        # Glassmorphic CSS design system
│   ├── vite.config.js       # Vite configuration & API proxy
│   └── index.html           # Main HTML with Google Fonts
│
├── .env                     # MongoDB Atlas URI & secret key configuration
├── .env.example             # Template for deployment setup
├── package.json             # Root script runner (concurrently)
└── README.md
```

---

## 🚀 Quick Start Instructions

### 1. Configure MongoDB Atlas Connection String

Open the `.env` file in the root folder and paste your MongoDB Atlas cluster connection string:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hostel_db?retryWrites=true&w=majority
JWT_SECRET=super_secret_hostel_admin_key_2026
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 2. Seed Initial Demo Data

Run the database seeder to populate default rooms, sample students, and the admin account:

```bash
npm run seed
```

### 3. Run Application in Development Mode

Run both the Express backend server and React Vite frontend concurrently with a single command:

```bash
npm run dev
```

- **Frontend Portal**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **Admin Credentials**: `admin` / `admin123`

---

## 🛠️ Production Build & Deployment

To prepare the application for deployment (Render, Vercel, Railway, Heroku):

1. **Build Frontend**:
   ```bash
   npm run build
   ```
2. **Start Production Server**:
   ```bash
   npm start
   ```

---

## 🎓 Academic Context

Developed for 3rd Year Computer Science & Engineering (CSE/CST) Full-Stack Web Development Coursework.
