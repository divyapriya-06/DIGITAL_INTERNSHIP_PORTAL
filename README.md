# Digital Internship and Industry Collaboration Management Portal

A full-stack web platform connecting higher education institutions, students, and verified enterprise partners with AI-powered candidate matching, application tracking, and institutional recruitment oversight.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts
- **Backend**: Node.js, Express.js, Socket.IO (Real-time updates)
- **Database**: MongoDB (Mongoose ODM) with embedded in-memory fallback
- **Authentication**: JWT (JSON Web Tokens) & BcryptJS password hashing

---

## ✨ Key Features

### 🎓 Student Portal
- **Find Internships**: Multi-filter catalog (Domain, Work Mode, Location, Stipend, Top-N limiter).
- **AI Recommendation Engine**: Matched roles based on skills, profile competencies, and academic projects.
- **Application Pipeline Tracker**: Streamlined visual progression stepper (`Applied` → `Review` → `Shortlisted` → `Interviews` → `Offer`).
- **Upcoming Rounds**: Scheduled video interview details, timings, and direct meeting links.
- **Skill Demand & Analytics**: Industry market skill trends and personalized skill gap insights.

### 🏢 Industry Portal
- **Recruitment Console**: Post internship requisitions with vacancy targets (hidden from applicants).
- **AI Candidate Pool**: Reverse-matched student talent pool with expandable profile insights.
- **Recruitment Pipeline**: Manage applicants across screening, technical tests, live interviews, and HR rounds.
- **Vacancy Management**: Track private vacancy fulfillment (e.g. 8 of 8 positions filled).

### 👑 Institutional Admin Portal
- **Executive Dashboard**: Campus-wide placement analytics, verified partner ratios, and institutional KPIs.
- **Registered Students**: Student directory with status control (active / deactivated) and pagination.
- **Industry & Postings Oversight**: Approve corporate partner verification requests and oversee live postings.
- **Skill Demand Intelligence**: Market demand metrics across emerging technological domains.

---

## 🔑 Demo & Test Credentials

| Role | Portal URL | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Institutional Admin** | `/login` | `admin@gmail.com` | `admin123` | Full administrative control & verification |
| **Student** | `/login` | `anu@student.com` | `password123` | Anu Priya S (Live application pipeline) |
| **Industry Partner** | `/login` | `freshworks@careers.com` | `password123` | Freshworks Technologies (Chennai) |

*All other seeded student and industry accounts use `password123`.*

---

## 🛠️ Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB** *(Optional)*: Local MongoDB instance or MongoDB Atlas. If omitted, the portal automatically falls back to an embedded in-memory database.

---

### 1. Backend Setup

```bash
cd backend
npm install
npm run seed     # Optional: Pre-populates database with demo users and postings
npm run dev
```
The backend API server starts at **`http://localhost:5000`**.

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
The frontend application starts at **`http://localhost:5173`**.

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Backend API port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/internship_portal` | MongoDB connection string |
| `JWT_SECRET` | `super_secret_jwt_key_collab_portal_2026_academic_prod` | Token signing secret |
| `CLIENT_URL` | `http://localhost:5173` | Allowed frontend client URL |

---

## 📜 License

This project is open-source and available under the **MIT License**.
