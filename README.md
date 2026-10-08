# Digital Internship and Industry Collaboration Management Portal

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8.9-47a248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> A production-ready, full-stack academic and industry collaboration platform designed to bridge higher education institutions, students, and verified enterprise partners. Features dual-side AI/NLP matching, explainable recommendations, automated recruitment stage pipelines, institutional placement analytics, and native multilingual support.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Highlights & Architectural Innovations](#-key-highlights--architectural-innovations)
- [System Architecture & Tech Stack](#-system-architecture--tech-stack)
- [Role-Based Portals & Feature Tour](#-role-based-portals--feature-tour)
- [Default Seed Credentials](#-default-seed-credentials)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Environment Variables](#-environment-variables)
- [Complete REST API Reference](#-complete-rest-api-reference)
- [Project Directory Structure](#-project-directory-structure)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)
- [License](#-license)

---

## 🌐 Overview

The **Digital Internship and Industry Collaboration Management Portal** solves the gap between academic institutions and employers. Traditional internship processes suffer from fragmented communications, lack of transparency, manual candidate filtering, and unverifiable corporate partners.

This platform provides:
- **For Students**: Explainable AI match scores, instant resume parsing, real-time application timeline tracking, and skill gap roadmaps.
- **For Industry Partners**: Reverse candidate matching, multi-round recruitment management, candidate evaluation, and automated vacancy fulfillment.
- **For Institutional Administrators**: Centralized verification queue, real-time placement rate metrics, skill market demand heatmaps, and duplicate profile anomaly detection.

---

## 🌟 Key Highlights & Architectural Innovations

### 1. Dual-Side AI Recommendation Engine (Explainable AI)
- **Student Recommendation (`TF-IDF + Cosine Similarity + Weighted Scoring`)**:
  Calculates a composite match score between student profiles and available openings:
  $$\text{Score} = (W_{\text{skills}} \times S_{\text{skills}}) + (W_{\text{role}} \times S_{\text{role}}) + (W_{\text{semantic}} \times S_{\text{semantic}}) + (W_{\text{proj}} \times S_{\text{proj}}) + (W_{\text{exp}} \times S_{\text{exp}}) + (W_{\text{loc}} \times S_{\text{loc}}) + (W_{\text{dom}} \times S_{\text{dom}})$$
  - **Skills Match**: 40% (Direct matching & alias resolution e.g., `js` $\leftrightarrow$ `javascript`, `py` $\leftrightarrow$ `python`, `k8s` $\leftrightarrow$ `kubernetes`)
  - **Role Alignment**: 20%
  - **Semantic Resume / JD Match**: 15% (Cosine similarity on TF-IDF vectors)
  - **Academic Projects**: 10%
  - **Experience**: 5%
  - **Location Preference**: 5%
  - **Domain Alignment**: 5%
- **Reverse Candidate Matching (Industry Side)**:
  Companies can view candidate pools automatically scored and ranked against specific job criteria, with matched skills vs. missing skills breakdowns.
- **Explainable AI Modal ("Why this internship?")**:
  Transparent breakdown showing exact matched skill counts, role overlap, project relevance, and resume alignment score.

### 2. Resume NLP & Entity Extractor
- Ingests PDF (`pdf-parse`) and DOCX (`mammoth`) files directly from student uploads.
- Extracts and identifies programming languages, frameworks, developer tools, databases, cloud platforms, and educational backgrounds.
- Automatically enhances candidate profiles for higher matching accuracy.

### 3. Privacy-Preserving Vacancy Rule
- The exact number of openings/vacancies is strictly hidden from student-facing interfaces to prevent application bias and herd behavior.
- Only authorized Industry recruiters and Institutional Admins can see vacancy metrics.

### 4. Automatic Vacancy Fulfillment Lifecycle
- When candidate selections reach the `requiredCandidates` threshold, the posting automatically changes status to `FILLED`.
- `FILLED` postings immediately disappear from active student searches and recommendation feeds while maintaining historical analytics for auditing.

### 5. Real-Time Recruitment Pipeline
- Interactive multi-stage interview progression:
  $$\text{Applied} \longrightarrow \text{Under Review} \longrightarrow \text{Shortlisted} \longrightarrow \text{Round 1/2} \longrightarrow \text{Technical} \longrightarrow \text{HR} \longrightarrow \text{Selected / Rejected}$$
- Instant notifications and status badge updates powered by **Socket.IO**.
- Allows industries to schedule interview dates, interview modes (Online/In-person), and attach meeting links or venue details.

### 6. Industry Verification Workflow
- Newly registered companies cannot post internships until approved.
- Companies upload official verification proof (GST registration, Corporate Certificate, CIN).
- Institutional Admins review proof documents in an approval queue with one-click Approve / Reject with remarks.

### 7. Placement Analytics & Skill Gap Insights
- **Institutional Placement Metric**:
  $$\text{Placement Rate (\%)} = \left(\frac{\text{Selected Students}}{\text{Active Applicants}}\right) \times 100$$
- Aggregates dynamic industry market demand across all live postings.
- Identifies critical student skill gaps and provides targeted recommendations (*"Recommended Skills to Learn"*).

### 8. Duplicate Account Heuristic Detection
- Flags suspicious or duplicate student accounts by evaluating multiple identity markers:
  - Phone Number Match (+40 points)
  - Exact Full Name Match (+30 points)
  - College Name Match (+15 points)
  - Department Match (+10 points)
  - Graduation Year Match (+5 points)
- Accounts exceeding the threshold trigger a flag for administrative review and resolution.

### 9. Multilingual Localization
- Full localized interface supporting:
  - 🇬🇧 **English**
  - 🇮🇳 **Tamil (தமிழ்)**
  - 🇮🇳 **Hindi (हिन्दी)**
- Switch languages seamlessly with state persistence in `LanguageContext`.

### 10. Resilient Zero-Config In-Memory DB Fallback
- `backend/config/db.js` attempts connection to your local MongoDB (`process.env.MONGO_URI`).
- If local MongoDB is not running, the application automatically provisions an embedded **`MongoMemoryServer`** in-process, allowing the portal to run out-of-the-box without manual database setup.

---

## 🛠 System Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                               CLIENT TIER                              │
│         React 18 + Vite 6 + Tailwind CSS + Lucide Icons + Recharts     │
│                 LanguageContext (EN/TA/HI) | SocketContext             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST & WebSockets (Socket.IO)
┌───────────────────────────────────▼────────────────────────────────────┐
│                             BACKEND SERVICES                           │
│             Node.js (ES Modules) + Express 4.21 + Socket.IO            │
│  ┌───────────────────────┬──────────────────────┬────────────────────┐ │
│  │    Authentication     │  AI Recommendation   │   Recruitment      │ │
│  │   (JWT + BcryptJS)    │ (TF-IDF, NLP Parser) │  Stage Management  │ │
│  └───────────────────────┴──────────────────────┴────────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Mongoose 8.9 ODM
┌───────────────────────────────────▼────────────────────────────────────┐
│                              DATA LAYER                                │
│       MongoDB (Local or Cloud Atlas) OR Embedded MongoMemoryServer     │
└────────────────────────────────────────────────────────────────────────┘
```

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18, Vite 6, React Router DOM v6 |
| **Styling & UI** | Tailwind CSS, Lucide React icons |
| **Data Visualizations** | Recharts (Placement ratios, Skill demand distributions) |
| **Real-Time Layer** | Socket.IO Client / Socket.IO Server |
| **Backend Framework** | Node.js (ESM), Express.js 4.21 |
| **Document Processing** | `pdf-parse`, `mammoth` (DOCX), `multer` |
| **Database & ODM** | MongoDB, Mongoose 8.9, `mongodb-memory-server` |
| **Security & Auth** | JWT (`jsonwebtoken`), BcryptJS, Role-Based Access Control Middleware |

---

## 👥 Role-Based Portals & Feature Tour

### 🎓 1. Student Portal
- **Dashboard**: Quick metrics (Total Applied, Shortlisted, Interviews Scheduled, Offers).
- **Find Internships**: Multi-filter catalog (Domain, Work Mode, Stipend range, Location).
- **AI Recommended**: Top 10 ranked recommendations with match percentage and *"Why this internship?"* modal.
- **Application Tracker**: Step-by-step graphical timeline of each application stage.
- **Interview Rounds**: Upcoming interview dates, round names, and meeting links.
- **Skill Demand & Gaps**: Industry skill trends and personal missing skill roadmaps.
- **Resume Upload & Profile**: Auto-populates skills from uploaded PDF/DOCX resumes.
- **Reviews & Ratings**: Read and submit reviews on completed internships.

### 🏢 2. Industry Portal
- **Dashboard**: Active postings, received applicants, candidates in interview rounds, fulfilled vacancies.
- **Verification Portal**: Submit GSTIN, official website, and upload corporate incorporation proofs.
- **Internship Postings**: Create detailed postings (Stipend, Hidden Vacancies, Required Skills, Interview Rounds).
- **Application Management**: Review applicants, view student profiles and parsed resumes.
- **Stage Progression**: Advance candidates (`Applied` $\rightarrow$ `Shortlisted` $\rightarrow$ `Rounds` $\rightarrow$ `Selected`/`Rejected`).
- **AI Reverse Matching**: Discover best-matched candidates across the entire student base before they apply.
- **Recruitment Rounds**: Schedule interview slots, meeting links, and round notes.

### 👑 3. Institutional Administrator Portal
- **Executive Dashboard**: High-level institutional KPIs, Placement %, verified partners count.
- **Industry Verification Queue**: Inspect company profiles, view uploaded proofs, approve or reject with comments.
- **Student & Industry Management**: Search, monitor, activate, deactivate, or delete user accounts.
- **Internship & Application Oversight**: Monitor all postings across campus, override status if needed.
- **Placement & Market Analytics**: Track placement conversion percentages and departmental metrics.
- **Skill Demand Monitor**: Analyze market demand for emerging technologies across postings.
- **Duplicate Detection**: Review AI-flagged duplicate student accounts and resolve flags.
- **Feedback Management**: Review portal user feedback and bug submissions.

---

## 🔑 Default Seed Credentials

All seed accounts are initialized with pre-configured profiles, active applications, postings, and verification states.

### 👑 Institutional Administrator
| Role | Name | Email | Password | Access Details |
|---|---|---|---|---|
| **Admin** | Dr. S. Ramanathan | `admin@gmail.com` | `admin123` | Institutional dashboard, verification, analytics |

### 🏢 Partner Industries
| Company Name | Domain | Email | Password | Status |
|---|---|---|---|---|
| **Zoho Corporation** | SaaS / Cloud Software | `zoho@careers.com` | `password123` | Verified |
| **TCS** | IT Consulting & Services | `tcs@careers.com` | `password123` | Verified |
| **Apollo Hospitals** | Healthcare Tech | `apollo@careers.com` | `password123` | Verified |
| **Karur Vysya Bank** | Banking & Fintech | `kvbank@careers.com` | `password123` | Verified |
| **BYJU'S** | EdTech | `byjus@careers.com` | `password123` | Verified |
| **Ola Electric** | Clean Energy / EV | `ola@careers.com` | `password123` | Verified |
| **Sun TV Network** | Media & Broadcasting | `suntv@careers.com` | `password123` | Verified |
| **TAFE** | AgriTech & Manufacturing | `tafe@careers.com` | `password123` | Verified |
| **Delhivery** | Logistics & Supply Chain | `delhivery@careers.com` | `password123` | Verified |
| **Reliance Retail** | Retail & E-Commerce | `reliance@careers.com` | `password123` | Verified |
| **GreenStar AgriTech** | AgriTech Start-up | `greenstar@careers.com` | `password123` | **Pending Verification** |

### 🎓 Students
| Student Name | Specialization / Focus | Email | Password | Active Status |
|---|---|---|---|---|
| **Divya Priya S** | Full Stack Development | `divyapriya@student.com` | `password123` | Round 2 at Zoho |
| **Karthikeyan M** | AI & Machine Learning | `karthikeyan@student.com` | `password123` | Shortlisted at Apollo |
| **Anbazhagan R** | Cloud & DevOps | `anbazhagan@student.com` | `password123` | **Selected at TCS** |
| **Kavitha Lakshmi N** | Data Science & Analytics | `kavitha@student.com` | `password123` | Applied at Reliance |
| **Murugesan T** | Embedded Systems & IoT | `murugesan@student.com` | `password123` | Round 1 at Ola Electric |
| **Nithyashri P** | UI/UX & Product Design | `nithyashri@student.com` | `password123` | Applied at Sun TV |
| **Govindarajan S** | Financial Analytics | `govindarajan@student.com` | `password123` | Applied at KVB |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- *(Optional)* **MongoDB**: Local MongoDB instance or Atlas connection string. If omitted, the portal automatically uses the built-in embedded in-memory MongoDB.

---

### Step 1: Backend Setup

1. Open your terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. *(Optional)* Configure environment variables:
   A default fallback configuration is provided, or you can create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Pre-populate the database with demo accounts, postings, and applications:
   ```bash
   npm run seed
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run on **`http://localhost:5000`**.

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application will start at **`http://localhost:5173`**.

4. Open **`http://localhost:5173`** in your browser and log in with any seed credential from the table above.

---

## ⚙️ Environment Variables

The backend supports the following environment variables (defined in `backend/.env`):

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5000` | Port for the Express and Socket.IO server |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/internship_portal` | MongoDB connection URI (falls back to in-memory if unreachable) |
| `JWT_SECRET` | `your_jwt_secret_key_here` | Secret key used for signing JSON Web Tokens |
| `CLIENT_URL` | `http://localhost:5173` | Allowed origin for CORS and Socket.IO connections |

---

## 📡 Complete REST API Reference

### 1. Authentication & Account (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new Student or Industry account |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current authenticated user profile |
| `PUT` | `/api/auth/deactivate` | Authenticated | Deactivate the current user account |
| `DELETE` | `/api/auth/delete` | Authenticated | Delete the current user account |

### 2. Student Endpoints (`/api/student`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/student/dashboard` | Student | Retrieve student metrics, applications, and upcoming rounds |
| `GET` | `/api/student/profile` | Student | Get detailed student profile and parsed resume data |
| `PUT` | `/api/student/profile` | Student | Update student profile information |
| `POST` | `/api/student/resume` | Student | Upload PDF/DOCX resume; parses skills automatically |
| `DELETE`| `/api/student/resume` | Student | Remove uploaded resume and clear parsed attributes |
| `GET` | `/api/student/recommendations` | Student | Get Top 10 AI-ranked internships with explainable scores |
| `GET` | `/api/student/internships` | Student | Search and filter internships (Vacancies hidden) |
| `GET` | `/api/student/internships/:id`| Student | Get internship details |
| `POST` | `/api/student/apply/:id` | Student | Apply to an open internship posting |
| `GET` | `/api/student/applications` | Student | View all submitted applications with stage status |
| `DELETE`| `/api/student/applications/:id`| Student | Remove a rejected application from list |
| `GET` | `/api/student/skill-demand` | Student | Get industry skill demand and student skill gap breakdown |

### 3. Industry Endpoints (`/api/industry`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/industry/dashboard` | Industry | Recruiter dashboard metrics and active pipeline |
| `GET` | `/api/industry/profile` | Industry | Company profile information and verification status |
| `PUT` | `/api/industry/profile` | Industry | Update company description, website, and details |
| `POST` | `/api/industry/verification`| Industry | Upload GST / incorporation proof document |
| `POST` | `/api/industry/internships` | Verified Industry | Post an internship (vacancies hidden from students) |
| `GET` | `/api/industry/internships` | Industry | Get all postings created by the company |
| `PUT` | `/api/industry/internships/:id` | Industry | Update posting details or close an opening |
| `GET` | `/api/industry/applications` | Industry | View all applicants across company postings |
| `PUT` | `/api/industry/applications/:id/status` | Industry | Advance applicant stage or schedule round |
| `GET` | `/api/industry/ai-candidates/:internshipId` | Industry | AI reverse match candidates against posting criteria |
| `GET` | `/api/industry/candidates/search` | Industry | Search student talent pool by skills and criteria |

### 4. Admin Endpoints (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin | Institutional overview, placement rate, verification queue |
| `GET` | `/api/admin/verifications` | Admin | List pending industry verification requests |
| `PUT` | `/api/admin/verifications/:id` | Admin | Approve or reject company verification with remarks |
| `GET` | `/api/admin/students` | Admin | Retrieve all registered student profiles |
| `GET` | `/api/admin/industries` | Admin | Retrieve all registered industry profiles |
| `PUT` | `/api/admin/users/:id/status` | Admin | Activate, suspend, or update user account status |
| `DELETE`| `/api/admin/users/:id` | Admin | Delete a user account |
| `GET` | `/api/admin/internships` | Admin | View all internships across the institution |
| `PUT` | `/api/admin/internships/:id/status` | Admin | Override internship status (`OPEN`, `PAUSED`, `CLOSED`) |
| `GET` | `/api/admin/applications` | Admin | View all institution-wide applications |
| `GET` | `/api/admin/duplicate-flags`| Admin | View heuristic-flagged duplicate student accounts |
| `PUT` | `/api/admin/duplicate-flags/:id` | Admin | Resolve or dismiss duplicate account flags |
| `GET` | `/api/admin/analytics` | Admin | Institutional placement metrics, departmental breakdown |

### 5. Reviews, Notifications & Feedback
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reviews/companies` | Public | List verified companies available for review |
| `POST` | `/api/reviews` | Authenticated | Submit an internship experience review & star rating |
| `GET` | `/api/reviews/industry/:id` | Public | Get all reviews for a specific industry |
| `GET` | `/api/notifications` | Authenticated | Retrieve in-app real-time notifications |
| `PUT` | `/api/notifications/:id/read` | Authenticated | Mark a notification as read |
| `PUT` | `/api/notifications/read-all` | Authenticated | Mark all notifications as read |
| `POST` | `/api/feedback/portal` | Authenticated | Submit user feedback or report an issue |
| `GET` | `/api/feedback/portal` | Authenticated | View user feedback |
| `PUT` | `/api/feedback/portal/:id/status` | Admin | Update portal feedback ticket status |
| `GET` | `/api/health` | Public | System status and service health check |

---

## 📂 Project Directory Structure

```
COLLABRATION PORTAL/
├── backend/
│   ├── config/
│   │   └── db.js                       # MongoDB connection with MongoMemoryServer fallback
│   ├── controllers/
│   │   ├── adminController.js          # Verification queue, duplicates, placement metrics
│   │   ├── authController.js           # Registration, login, profile management, JWT
│   │   ├── industryController.js       # Postings, applicant tracking, reverse matching
│   │   ├── notificationController.js   # Notification retrieval and read state
│   │   ├── portalFeedbackController.js # Feedback submission and admin review
│   │   ├── reviewController.js         # Peer ratings and internship evaluations
│   │   └── studentController.js        # Search, recommendations, applications, skill gap
│   ├── middleware/
│   │   ├── authMiddleware.js           # JWT verification and bearer token decoding
│   │   ├── errorHandler.js             # Standardized HTTP error interceptor
│   │   ├── roleMiddleware.js           # Access control (admin, student, approved industry)
│   │   └── uploadMiddleware.js         # Multer configuration for resumes & proofs
│   ├── models/
│   │   ├── Application.js              # Application tracking, stage dates, interview rounds
│   │   ├── DuplicateFlag.js            # Anomaly & duplicate account detection records
│   │   ├── IndustryProfile.js          # Company details, verification documents, rating
│   │   ├── Internship.js               # Postings, private vacancy targets, required skills
│   │   ├── Notification.js             # User notification records
│   │   ├── PortalFeedback.js           # System bug reports and user feedback
│   │   ├── Review.js                   # 5-star rating and textual review model
│   │   ├── StudentProfile.js           # Academic profile, parsed resume entities, skills
│   │   └── User.js                     # Base user model with Bcrypt password hashing
│   ├── routes/
│   │   ├── adminRoutes.js              # Admin portal routes
│   │   ├── authRoutes.js               # Auth & profile routes
│   │   ├── industryRoutes.js           # Recruiter & posting routes
│   │   ├── notificationRoutes.js       # In-app notification routes
│   │   ├── portalFeedbackRoutes.js     # User feedback routes
│   │   ├── reviewRoutes.js             # Review and rating routes
│   │   └── studentRoutes.js            # Student portal routes
│   ├── seeds/
│   │   └── seed.js                     # Database reset & comprehensive seed script
│   ├── services/
│   │   ├── candidateMatchingEngine.js  # Industry reverse candidate matching
│   │   ├── duplicateDetector.js        # Duplicate student account detection heuristics
│   │   ├── recommendationEngine.js     # Multi-factor TF-IDF student recommendation
│   │   ├── resumeParser.js             # PDF/DOCX entity and technical skill parser
│   │   ├── skillDemandService.js       # Market demand aggregation & skill gap engine
│   │   ├── socketService.js            # Socket.IO connection & event broadcaster
│   │   └── textProcessor.js            # Tokenizer, stop words, TF-IDF vectorizer
│   ├── uploads/                        # Local directory for stored resumes & proofs
│   ├── .env.example                    # Template environment variables
│   ├── package.json                    # Backend dependencies & npm scripts
│   └── server.js                       # Express application & Socket.IO server entrypoint
│
└── frontend/
    ├── public/                         # Public static assets & favicons
    ├── src/
    │   ├── components/
    │   │   ├── admin/                  # VerificationReviewModal, DuplicateAccountCard
    │   │   ├── common/                 # Badge, Button, Modal, StatCard, Loader, EmptyState
    │   │   ├── industry/               # AICandidateCard, RoundScheduleModal
    │   │   ├── layout/                 # Navbar, Role Sidebar, Footer, MainLayout
    │   │   └── student/                # InternshipCard, ExplainableMatchModal, Timeline
    │   ├── context/
    │   │   ├── AuthContext.jsx         # User authentication, token storage, session state
    │   │   ├── LanguageContext.jsx     # i18n localization context (EN, TA, HI)
    │   │   └── SocketContext.jsx       # Socket.IO client connection & toast notifications
    │   ├── pages/
    │   │   ├── admin/                  # Admin Dashboard, Verifications, Analytics, Duplicates
    │   │   ├── industry/               # Recruiter Dashboard, Post Internship, AI Candidates
    │   │   ├── student/                # Student Dashboard, Recommended, Find, Applications
    │   │   ├── LandingPage.jsx         # Dual-sided entry & login/register portal
    │   │   └── SettingsPage.jsx        # Account settings & language preference selection
    │   ├── services/
    │   │   └── api.js                  # Axios instance with auth interceptors
    │   ├── utils/
    │   │   └── i18n.js                 # Translation dictionaries (English, Tamil, Hindi)
    │   ├── App.jsx                     # Application router with role-protected routes
    │   ├── index.css                   # Tailwind styles and global utility classes
    │   └── main.jsx                    # React entrypoint
    ├── index.html                      # HTML root template
    ├── package.json                    # Frontend dependencies & npm scripts
    ├── tailwind.config.js              # Tailwind CSS configuration
    └── vite.config.js                  # Vite bundler configuration
```

---

## ❓ Troubleshooting & FAQs

### Q: Do I need to have MongoDB installed locally?
**A:** No. If you have MongoDB installed and running on port `27017`, the backend connects to it. If it is not found, the backend automatically initializes an in-memory database using `mongodb-memory-server`.

### Q: Why do I see empty data when I first launch?
**A:** Run the seed command inside the `backend` folder to populate the database with realistic demo data:
```bash
cd backend
npm run seed
```

### Q: Why can't a newly registered industry post an internship?
**A:** Newly registered companies require administrator verification before they are allowed to create postings. Log in as Admin (`admin@gmail.com` / `admin123`), navigate to **Verifications**, review the company's uploaded documents, and click **Approve**.

### Q: Can students see how many vacancies an internship has?
**A:** No. By design, vacancy counts are strictly restricted to Industry recruiters and Institutional Admins to prevent applicant bias.

### Q: What file formats are supported for resume upload?
**A:** Resumes can be uploaded in `.pdf`, `.docx`, and `.doc` formats up to 10MB. The backend extracts text and maps matching programming languages and tools directly to the student profile.

---

## 📜 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute this platform for academic and commercial applications.
