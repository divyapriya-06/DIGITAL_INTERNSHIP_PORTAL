import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import IndustryProfile from '../models/IndustryProfile.js';
import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import DuplicateFlag from '../models/DuplicateFlag.js';
import { calculateStudentInternshipMatch } from '../services/recommendationEngine.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('🌱 Dropping existing database/collections cleanly...');

    try {
      await mongoose.connection.db.dropDatabase();
      console.log('✨ Database dropped cleanly');
    } catch (e) {
      console.log('Note on dropDatabase:', e.message);
    }

    // =========================================================
    // 👑 ADMIN
    // =========================================================
    console.log('👑 Seeding Admin...');
    const adminUser = await User.create({
      name: 'Dr. S. Ramanathan (Chief Admin)',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin',
      phone: '+919876543210',
      isProfileComplete: true,
    });

    // =========================================================
    // 🏢 INDUSTRIES — 10 diverse domains
    // =========================================================
    console.log('🏢 Seeding Industries across diverse domains...');
    const now = new Date();
    const oneMonthAhead   = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAhead  = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const threeWeeksAhead = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

    // 1. Zoho Corporation — SaaS / IT
    const zohoUser = await User.create({
      name: 'Zoho Corporation',
      email: 'zoho@careers.com',
      password: 'password123',
      role: 'industry',
      phone: '+914467447000',
      isProfileComplete: true,
    });
    const zohoProfile = await IndustryProfile.create({
      user: zohoUser._id,
      companyName: 'Zoho Corporation',
      officialEmail: 'zoho@careers.com',
      contactPerson: 'Vigneshwaran K',
      phone: '+914467447000',
      website: 'https://www.zoho.com',
      companyDescription: 'Zoho Corporation is a leading Indian multinational technology company that makes computer software and web-based business tools, serving over 100 million users globally from its headquarters in Chennai.',
      industryType: 'SaaS & Enterprise Apps',
      companyLocation: 'Chennai',
      verificationStatus: 'APPROVED',
      averageRating: 4.7,
      totalReviews: 15,
    });

    // 2. TCS — IT Consulting
    const tcsUser = await User.create({
      name: 'Tata Consultancy Services',
      email: 'tcs@careers.com',
      password: 'password123',
      role: 'industry',
      phone: '+914424356789',
      isProfileComplete: true,
    });
    const tcsProfile = await IndustryProfile.create({
      user: tcsUser._id,
      companyName: 'Tata Consultancy Services (TCS)',
      officialEmail: 'tcs@careers.com',
      contactPerson: 'Preethi Jayaram',
      phone: '+914424356789',
      website: 'https://www.tcs.com',
      companyDescription: 'TCS is an Indian multinational information technology services and consulting company headquartered in Mumbai, with a large presence across Tamil Nadu.',
      industryType: 'IT Consulting & Services',
      companyLocation: 'Chennai',
      verificationStatus: 'APPROVED',
      averageRating: 4.5,
      totalReviews: 18,
    });

    // 3. Apollo Hospitals — Healthcare
    const apolloUser = await User.create({
      name: 'Apollo Hospitals',
      email: 'apollo@careers.com',
      password: 'password123',
      role: 'industry',
      phone: '+914428296000',
      isProfileComplete: true,
    });
    const apolloProfile = await IndustryProfile.create({
      user: apolloUser._id,
      companyName: 'Apollo Hospitals Group',
      officialEmail: 'apollo@careers.com',
      contactPerson: 'Dr. Meenakshi Sundaram',
      phone: '+914428296000',
      website: 'https://www.apollohospitals.com',
      companyDescription: "Apollo Hospitals is Asia's largest integrated healthcare organisation, pioneering digital health, AI diagnostics, genomics, and robotic surgery across 70+ hospitals in India.",
      industryType: 'Healthcare & Medical Technology',
      companyLocation: 'Chennai',
      verificationStatus: 'APPROVED',
      averageRating: 4.6,
      totalReviews: 10,
    });

    // 4. Karur Vysya Bank — Finance / Fintech
    const kvbUser = await User.create({
      name: 'Karur Vysya Bank',
      email: 'kvbank@careers.com',
      password: 'password123',
      role: 'industry',
      phone: '+914324269999',
      isProfileComplete: true,
    });
    const kvbProfile = await IndustryProfile.create({
      user: kvbUser._id,
      companyName: 'Karur Vysya Bank (KVB)',
      officialEmail: 'kvbank@careers.com',
      contactPerson: 'Suresh Balakrishnan',
      phone: '+914324269999',
      website: 'https://www.kvb.co.in',
      companyDescription: 'Karur Vysya Bank, headquartered in Karur, Tamil Nadu, is a leading private sector bank offering digital banking, corporate finance, fintech integrations, and wealth management services.',
      industryType: 'Banking & Financial Services',
      companyLocation: 'Karur',
      verificationStatus: 'APPROVED',
      averageRating: 4.3,
      totalReviews: 7,
    });

    // 5. BYJU'S — EdTech
    const byjusUser = await User.create({
      name: "BYJU'S Think & Learn",
      email: 'byjus@careers.com',
      password: 'password123',
      role: 'industry',
      phone: '+918040969696',
      isProfileComplete: true,
    });
    const byjusProfile = await IndustryProfile.create({
      user: byjusUser._id,
      companyName: "BYJU'S - Think & Learn Pvt. Ltd.",
      officialEmail: 'byjus@careers.com',
      contactPerson: 'Karthikeyan Narayanan',
      phone: '+918040969696',
      website: 'https://byjus.com',
      companyDescription: "BYJU'S is the world's most valued EdTech company, creating personalized adaptive learning experiences for K-12 and competitive exam students using AI-driven content and gamification.",
      industryType: 'Education Technology',
      companyLocation: 'Bangalore',
      verificationStatus: 'APPROVED',
      averageRating: 4.2,
      totalReviews: 11,
    });

    // 6. Ola Electric — EV / Clean Energy
    const olaUser = await User.create({
      name: 'Ola Electric Mobility',
      email: 'ola@careers.com',
      password: 'password123',
      role: 'industry',
      phone: '+918067452000',
      isProfileComplete: true,
    });
    const olaProfile = await IndustryProfile.create({
      user: olaUser._id,
      companyName: 'Ola Electric Mobility Pvt. Ltd.',
      officialEmail: 'ola@careers.com',
      contactPerson: 'Ramachandran Pillai',
      phone: '+918067452000',
      website: 'https://olaelectric.com',
      companyDescription: "Ola Electric, headquartered in Hosur, Tamil Nadu, is India's largest electric vehicle manufacturer building futuristic EVs, battery packs, charging ecosystems, and ADAS software.",
      industryType: 'Electric Vehicles & Clean Energy',
      companyLocation: 'Hosur',
      verificationStatus: 'APPROVED',
      averageRating: 4.4,
      totalReviews: 8,
    });

    // 7. Sun TV Network — Media & Entertainment
    const suntvUser = await User.create({
      name: 'Sun TV Network',
      email: 'suntv@careers.com',
      password: 'password123',
      role: 'industry',
      phone: '+914428431000',
      isProfileComplete: true,
    });
    const suntvProfile = await IndustryProfile.create({
      user: suntvUser._id,
      companyName: 'Sun TV Network Ltd.',
      officialEmail: 'suntv@careers.com',
      contactPerson: 'Deepa Muthukrishnan',
      phone: '+914428431000',
      website: 'https://www.suntv.in',
      companyDescription: "Sun TV Network is Asia's largest television network and a prominent Tamil media conglomerate operating 33 channels in 4 languages, OTT platform SunNXT, FM Radio, and Film Production.",
      industryType: 'Media & Entertainment',
      companyLocation: 'Chennai',
      verificationStatus: 'APPROVED',
      averageRating: 4.1,
      totalReviews: 6,
    });

    // 8. TAFE — Manufacturing & AgriTech
    const tafeUser = await User.create({
      name: 'TAFE Tractors',
      email: 'tafe@careers.com',
      password: 'password123',
      role: 'industry',
      phone: '+914422205000',
      isProfileComplete: true,
    });
    const tafeProfile = await IndustryProfile.create({
      user: tafeUser._id,
      companyName: 'TAFE — Tractors and Farm Equipment Ltd.',
      officialEmail: 'tafe@careers.com',
      contactPerson: 'Selvakumar Arumugam',
      phone: '+914422205000',
      website: 'https://www.tafe.com',
      companyDescription: 'TAFE is the third largest tractor manufacturer in the world, headquartered in Chennai. TAFE integrates IoT, precision agriculture, embedded systems, and AI-based crop advisory solutions.',
      industryType: 'Manufacturing & AgriTech',
      companyLocation: 'Chennai',
      verificationStatus: 'APPROVED',
      averageRating: 4.3,
      totalReviews: 5,
    });

    // 9. Delhivery — Logistics & Supply Chain
    const delhiveryUser = await User.create({
      name: 'Delhivery Logistics',
      email: 'delhivery@careers.com',
      password: 'password123',
      role: 'industry',
      phone: '+911244029000',
      isProfileComplete: true,
    });
    const delhiveryProfile = await IndustryProfile.create({
      user: delhiveryUser._id,
      companyName: 'Delhivery Pvt. Ltd.',
      officialEmail: 'delhivery@careers.com',
      contactPerson: 'Ranjit Subramanian',
      phone: '+911244029000',
      website: 'https://www.delhivery.com',
      companyDescription: "Delhivery is India's largest and fastest-growing fully integrated logistics company, using AI route optimization, warehouse automation, and real-time analytics for over 18,000+ pin codes.",
      industryType: 'Logistics & Supply Chain',
      companyLocation: 'Chennai',
      verificationStatus: 'APPROVED',
      averageRating: 4.2,
      totalReviews: 7,
    });

    // 10. Reliance Retail — Retail & E-Commerce
    const relianceUser = await User.create({
      name: 'Reliance Retail',
      email: 'reliance@careers.com',
      password: 'password123',
      role: 'industry',
      phone: '+912222786000',
      isProfileComplete: true,
    });
    const relianceProfile = await IndustryProfile.create({
      user: relianceUser._id,
      companyName: 'Reliance Retail Ventures Ltd.',
      officialEmail: 'reliance@careers.com',
      contactPerson: 'Saranya Krishnamurthy',
      phone: '+912222786000',
      website: 'https://www.relianceretail.com',
      companyDescription: "Reliance Retail is India's largest retailer and the fastest-growing retail company globally. It operates JioMart, Smart Bazaar, Trends, and digital commerce platforms serving 200M+ customers.",
      industryType: 'Retail & E-Commerce',
      companyLocation: 'Chennai',
      verificationStatus: 'APPROVED',
      averageRating: 4.0,
      totalReviews: 9,
    });

    // 11. GreenStar AgriTech — PENDING (Startup)
    const greenstarUser = await User.create({
      name: 'GreenStar AgriTech',
      email: 'greenstar@careers.com',
      password: 'password123',
      role: 'industry',
      phone: '+919600123456',
      isProfileComplete: false,
    });
    const greenstarProfile = await IndustryProfile.create({
      user: greenstarUser._id,
      companyName: 'GreenStar AgriTech Solutions',
      officialEmail: 'greenstar@careers.com',
      contactPerson: 'Muruganantham R',
      phone: '+919600123456',
      website: 'https://greenstar.agri',
      companyDescription: 'GreenStar AgriTech is a Coimbatore-based agri-startup building drone-based crop monitoring, IoT soil sensors, and AI crop advisory systems for small-holder Tamil Nadu farmers.',
      industryType: 'Agriculture Technology',
      companyLocation: 'Coimbatore',
      verificationStatus: 'PENDING',
      verificationProofOriginalName: 'GreenStar_MSME_Certificate.pdf',
      verificationProofPath: 'uploads/proofs/sample_gst.pdf',
      verificationUploadedAt: new Date(),
    });

    // =========================================================
    // 🎓 STUDENTS — Tamil Nadu names
    // =========================================================
    console.log('🎓 Seeding Tamil Nadu students...');

    // 1. Divya Priya S — Full Stack Developer
    const divyaUser = await User.create({
      name: 'Divya Priya S',
      email: 'divyapriya@student.com',
      password: 'password123',
      role: 'student',
      phone: '+919123456780',
      isProfileComplete: true,
    });
    const divyaProfile = await StudentProfile.create({
      user: divyaUser._id,
      fullName: 'Divya Priya S',
      phone: '+919123456780',
      location: 'Chennai',
      bio: 'Passionate full-stack developer from Chennai with deep expertise in React, Node.js and MongoDB. Active open-source contributor and Smart India Hackathon 2024 winner.',
      preferredLocations: ['Chennai', 'Bangalore', 'Remote'],
      college: 'College of Engineering, Guindy (Anna University)',
      degree: 'B.Tech',
      department: 'Information Technology',
      cgpa: 8.9,
      graduationYear: 2026,
      technicalSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TypeScript', 'TailwindCSS', 'Git', 'REST API'],
      programmingLanguages: ['JavaScript', 'TypeScript', 'Java', 'SQL'],
      frameworks: ['React', 'Express', 'Node.js', 'Next.js', 'Tailwind'],
      tools: ['MongoDB', 'PostgreSQL', 'Docker', 'Git', 'Postman'],
      softSkills: ['Problem Solving', 'Team Leadership', 'Communication', 'Fast Learner'],
      experienceLevel: 'INTERMEDIATE',
      projects: [
        {
          title: 'EduCollaborate – Peer Learning Platform',
          description: 'Real-time collaborative workspace for university students built with React, Node.js, Socket.IO and MongoDB.',
          technologies: ['React', 'Node.js', 'MongoDB', 'Socket.IO', 'TailwindCSS'],
          githubLink: 'https://github.com/divyapriya/educollaborate',
        },
        {
          title: 'Smart E-Commerce REST API',
          description: 'High-throughput REST API with JWT auth, Redis caching, and MongoDB aggregation pipelines.',
          technologies: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Docker'],
          githubLink: 'https://github.com/divyapriya/ecommerce-backend',
        },
      ],
      preferredRole: 'Full Stack Developer',
      preferredDomain: 'Full Stack Development',
      preferredStipend: 20000,
      preferredWorkMode: 'HYBRID',
      preferredDuration: '6 Months',
      resumeOriginalName: 'DivyaPriya_Resume_2026.pdf',
      resumePath: 'uploads/resumes/sample_resume.pdf',
      resumeExtractedText: 'Divya Priya S. Full Stack Developer. React, Node.js, MongoDB, JavaScript, Express, Git, REST API. B.Tech IT Anna University CGPA 8.9.',
      resumeExtractedSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TypeScript', 'Git', 'REST API'],
      resumeExtractedRoles: ['Full Stack Developer', 'Frontend Developer', 'Backend Developer'],
      profileCompletionPercentage: 95,
    });

    // 2. Karthikeyan M — AI / ML Engineer
    const karthiUser = await User.create({
      name: 'Karthikeyan M',
      email: 'karthikeyan@student.com',
      password: 'password123',
      role: 'student',
      phone: '+919123456781',
      isProfileComplete: true,
    });
    const karthiProfile = await StudentProfile.create({
      user: karthiUser._id,
      fullName: 'Karthikeyan M',
      phone: '+919123456781',
      location: 'Coimbatore',
      bio: 'Machine Learning researcher and data enthusiast from PSG Tech Coimbatore, passionate about NLP, Computer Vision, and Transformer architectures.',
      preferredLocations: ['Bangalore', 'Chennai', 'Remote'],
      college: 'PSG College of Technology, Coimbatore',
      degree: 'B.Tech',
      department: 'Computer Science and Engineering',
      cgpa: 9.4,
      graduationYear: 2026,
      technicalSkills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-Learn', 'NLP', 'Computer Vision', 'Pandas', 'NumPy', 'SQL'],
      programmingLanguages: ['Python', 'C++', 'SQL', 'R'],
      frameworks: ['TensorFlow', 'PyTorch', 'FastAPI', 'Flask', 'Keras'],
      tools: ['Git', 'Docker', 'Jupyter', 'Weights & Biases', 'GCP'],
      softSkills: ['Analytical Thinking', 'Research Methodology', 'Technical Writing'],
      experienceLevel: 'INTERMEDIATE',
      projects: [
        {
          title: 'Biomedical Text Summarization with BERT',
          description: 'Fine-tuned HuggingFace Transformer models for extractive & abstractive clinical summaries with 0.88 ROUGE score.',
          technologies: ['Python', 'PyTorch', 'Transformers', 'BERT', 'FastAPI'],
          githubLink: 'https://github.com/karthikeyan/biomed-bert',
        },
      ],
      preferredRole: 'AI / Machine Learning Engineer',
      preferredDomain: 'AI & Machine Learning',
      preferredStipend: 40000,
      preferredWorkMode: 'REMOTE',
      preferredDuration: '6 Months',
      resumeOriginalName: 'Karthikeyan_M_AI_CV.pdf',
      resumeExtractedText: 'Karthikeyan M. AI/ML Engineer. Python, PyTorch, TensorFlow, NLP, Machine Learning, Deep Learning, Pandas, NumPy. PSG Tech Coimbatore CGPA 9.4.',
      resumeExtractedSkills: ['Python', 'PyTorch', 'TensorFlow', 'NLP', 'Machine Learning', 'Deep Learning', 'Pandas', 'NumPy', 'Scikit-Learn'],
      resumeExtractedRoles: ['AI Engineer', 'Machine Learning Engineer', 'Data Scientist'],
      profileCompletionPercentage: 95,
    });

    // 3. Anbazhagan R — Cloud & DevOps
    const anbazhUser = await User.create({
      name: 'Anbazhagan R',
      email: 'anbazhagan@student.com',
      password: 'password123',
      role: 'student',
      phone: '+919123456782',
      isProfileComplete: true,
    });
    const anbazhProfile = await StudentProfile.create({
      user: anbazhUser._id,
      fullName: 'Anbazhagan R',
      phone: '+919123456782',
      location: 'Trichy',
      bio: 'Cloud Architect & DevOps enthusiast from NIT Trichy, certified in AWS Solutions Architect Associate. Passionate about Kubernetes, CI/CD pipelines, and Terraform IaC.',
      preferredLocations: ['Hyderabad', 'Bangalore', 'Remote'],
      college: 'National Institute of Technology (NIT), Trichy',
      degree: 'B.Tech',
      department: 'Computer Science',
      cgpa: 8.7,
      graduationYear: 2026,
      technicalSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Python', 'Bash', 'Jenkins'],
      programmingLanguages: ['Python', 'Bash', 'Go'],
      frameworks: ['FastAPI', 'Flask'],
      tools: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Git', 'Prometheus', 'Grafana'],
      softSkills: ['Collaboration', 'Agile Methodologies', 'System Reliability'],
      experienceLevel: 'INTERMEDIATE',
      projects: [
        {
          title: 'Multi-Region Kubernetes Cluster Automation',
          description: 'Automated infrastructure as code with Terraform and Helm charts on AWS EKS with Prometheus monitoring.',
          technologies: ['AWS', 'Terraform', 'Kubernetes', 'Docker', 'Helm'],
          githubLink: 'https://github.com/anbazhagan/k8s-terraform',
        },
      ],
      preferredRole: 'Cloud / DevOps Engineer',
      preferredDomain: 'Cloud & DevOps',
      preferredStipend: 35000,
      preferredWorkMode: 'REMOTE',
      preferredDuration: '6 Months',
      resumeOriginalName: 'Anbazhagan_R_DevOps_Resume.pdf',
      resumeExtractedSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Python', 'Git'],
      resumeExtractedRoles: ['Cloud Engineer', 'DevOps Engineer', 'Site Reliability Engineer'],
      profileCompletionPercentage: 90,
    });

    // 4. Kavitha Lakshmi N — Data Science & Analytics
    const kavithaUser = await User.create({
      name: 'Kavitha Lakshmi N',
      email: 'kavitha@student.com',
      password: 'password123',
      role: 'student',
      phone: '+919123456783',
      isProfileComplete: true,
    });
    const kavithaProfile = await StudentProfile.create({
      user: kavithaUser._id,
      fullName: 'Kavitha Lakshmi N',
      phone: '+919123456783',
      location: 'Madurai',
      bio: 'Data Science and Business Intelligence enthusiast from Madura College of Engineering. Specialised in statistical modelling, Power BI dashboards, and predictive analytics for retail and FMCG domains.',
      preferredLocations: ['Chennai', 'Coimbatore', 'Remote'],
      college: 'Madura College of Engineering, Madurai',
      degree: 'B.E',
      department: 'Computer Science and Engineering',
      cgpa: 8.5,
      graduationYear: 2026,
      technicalSkills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Data Analysis', 'Tableau', 'Power BI', 'Excel'],
      programmingLanguages: ['Python', 'SQL', 'R'],
      frameworks: ['Flask', 'Scikit-Learn'],
      tools: ['Tableau', 'Power BI', 'Excel', 'Jupyter', 'Git', 'MySQL'],
      softSkills: ['Data Storytelling', 'Critical Thinking', 'Presentation Skills'],
      experienceLevel: 'BEGINNER',
      projects: [
        {
          title: 'Retail Sales Forecasting with ARIMA & LSTM',
          description: 'Hybrid time-series model combining ARIMA and LSTM for weekly retail demand prediction with 91% accuracy.',
          technologies: ['Python', 'Pandas', 'Scikit-Learn', 'TensorFlow', 'Tableau'],
          githubLink: 'https://github.com/kavitha/retail-forecast',
        },
      ],
      preferredRole: 'Data Analyst / Business Intelligence Engineer',
      preferredDomain: 'Data Science & Analytics',
      preferredStipend: 18000,
      preferredWorkMode: 'ON_SITE',
      preferredDuration: '3 Months',
      resumeOriginalName: 'KavithaLakshmi_DataAnalyst_2026.pdf',
      resumeExtractedSkills: ['Python', 'SQL', 'Pandas', 'Tableau', 'Power BI', 'Data Analysis'],
      resumeExtractedRoles: ['Data Analyst', 'Business Intelligence Analyst', 'Data Scientist'],
      profileCompletionPercentage: 88,
    });

    // 5. Murugesan T — Embedded Systems / IoT
    const murugesanUser = await User.create({
      name: 'Murugesan T',
      email: 'murugesan@student.com',
      password: 'password123',
      role: 'student',
      phone: '+919123456784',
      isProfileComplete: true,
    });
    const murugesanProfile = await StudentProfile.create({
      user: murugesanUser._id,
      fullName: 'Murugesan T',
      phone: '+919123456784',
      location: 'Hosur',
      bio: 'Embedded Systems and IoT engineer from Thiagarajar College of Engineering, Madurai. Skilled in RTOS, CAN bus, motor controllers, and PCB design for automotive and agricultural machinery.',
      preferredLocations: ['Hosur', 'Chennai', 'Coimbatore'],
      college: 'Thiagarajar College of Engineering, Madurai',
      degree: 'B.E',
      department: 'Electronics and Communication Engineering',
      cgpa: 8.2,
      graduationYear: 2026,
      technicalSkills: ['Embedded C', 'Arduino', 'Raspberry Pi', 'RTOS', 'CAN Bus', 'PCB Design', 'IoT', 'MATLAB', 'Python'],
      programmingLanguages: ['C', 'Embedded C', 'Python', 'MATLAB'],
      frameworks: ['FreeRTOS', 'Zephyr RTOS'],
      tools: ['Keil', 'STM32CubeIDE', 'Proteus', 'LTSpice', 'Git', 'Eagle PCB'],
      softSkills: ['Attention to Detail', 'Hands-on Prototyping', 'Documentation'],
      experienceLevel: 'BEGINNER',
      projects: [
        {
          title: 'CAN Bus Fleet Monitoring System for Tractors',
          description: 'Real-time CAN bus data logger for agricultural tractors using STM32 and Raspberry Pi transmitting telemetry to a cloud dashboard.',
          technologies: ['Embedded C', 'STM32', 'CAN Bus', 'Raspberry Pi', 'Python', 'MQTT'],
          githubLink: 'https://github.com/murugesan/tractor-canbus',
        },
      ],
      preferredRole: 'Embedded Systems / IoT Engineer',
      preferredDomain: 'Embedded Systems & IoT',
      preferredStipend: 15000,
      preferredWorkMode: 'ON_SITE',
      preferredDuration: '6 Months',
      resumeOriginalName: 'Murugesan_T_Embedded_Resume.pdf',
      resumeExtractedSkills: ['Embedded C', 'Arduino', 'RTOS', 'CAN Bus', 'IoT', 'PCB Design', 'Python'],
      resumeExtractedRoles: ['Embedded Engineer', 'IoT Engineer', 'Firmware Developer'],
      profileCompletionPercentage: 85,
    });

    // 6. Nithyashri P — UI/UX & Frontend
    const nithyaUser = await User.create({
      name: 'Nithyashri P',
      email: 'nithyashri@student.com',
      password: 'password123',
      role: 'student',
      phone: '+919123456785',
      isProfileComplete: true,
    });
    const nithyaProfile = await StudentProfile.create({
      user: nithyaUser._id,
      fullName: 'Nithyashri P',
      phone: '+919123456785',
      location: 'Tirunelveli',
      bio: 'UI/UX designer and frontend developer from Manonmaniam Sundaranar University. Specialised in Figma-based product design, motion graphics, and React-based responsive interfaces for media & entertainment.',
      preferredLocations: ['Chennai', 'Bangalore', 'Remote'],
      college: 'Manonmaniam Sundaranar University, Tirunelveli',
      degree: 'B.Sc',
      department: 'Computer Science',
      cgpa: 8.8,
      graduationYear: 2026,
      technicalSkills: ['Figma', 'Adobe XD', 'React', 'JavaScript', 'HTML', 'CSS', 'TailwindCSS', 'Motion Graphics', 'After Effects'],
      programmingLanguages: ['JavaScript', 'HTML', 'CSS'],
      frameworks: ['React', 'Tailwind', 'Framer Motion'],
      tools: ['Figma', 'Adobe XD', 'Adobe After Effects', 'Git', 'VS Code'],
      softSkills: ['Visual Storytelling', 'User Empathy', 'Creative Problem Solving'],
      experienceLevel: 'BEGINNER',
      projects: [
        {
          title: 'SunNXT Redesign – OTT Platform UI/UX Concept',
          description: 'Complete redesign of the SunNXT streaming platform using Figma with improved onboarding, content discovery, and accessibility.',
          technologies: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
          githubLink: 'https://www.behance.net/nithyashri',
        },
      ],
      preferredRole: 'UI/UX Designer & Frontend Developer',
      preferredDomain: 'UI/UX & Frontend Design',
      preferredStipend: 15000,
      preferredWorkMode: 'HYBRID',
      preferredDuration: '3 Months',
      resumeOriginalName: 'Nithyashri_P_UIUX_Resume.pdf',
      resumeExtractedSkills: ['Figma', 'Adobe XD', 'React', 'JavaScript', 'HTML', 'CSS', 'TailwindCSS'],
      resumeExtractedRoles: ['UI/UX Designer', 'Frontend Developer', 'Product Designer'],
      profileCompletionPercentage: 90,
    });

    // 7. Govindarajan S — Finance & Banking
    const govindUser = await User.create({
      name: 'Govindarajan S',
      email: 'govindarajan@student.com',
      password: 'password123',
      role: 'student',
      phone: '+919123456786',
      isProfileComplete: true,
    });
    const govindProfile = await StudentProfile.create({
      user: govindUser._id,
      fullName: 'Govindarajan S',
      phone: '+919123456786',
      location: 'Karur',
      bio: 'Finance and technology enthusiast from Government Arts College Karur. Skilled in Python-based fintech automation, algorithmic trading simulations, and RBI regulatory compliance frameworks.',
      preferredLocations: ['Karur', 'Chennai', 'Hyderabad'],
      college: 'Government College of Arts, Karur',
      degree: 'B.Com',
      department: 'Commerce with Computer Applications',
      cgpa: 7.8,
      graduationYear: 2026,
      technicalSkills: ['Python', 'SQL', 'Excel', 'Tally', 'Power BI', 'Financial Modelling', 'Accounting', 'GST'],
      programmingLanguages: ['Python', 'SQL'],
      frameworks: ['Flask', 'Pandas'],
      tools: ['Excel', 'Tally ERP', 'Power BI', 'Zoho Books', 'Git'],
      softSkills: ['Numerical Aptitude', 'Regulatory Knowledge', 'Client Communication'],
      experienceLevel: 'BEGINNER',
      projects: [
        {
          title: 'Automated GST Reconciliation Tool',
          description: 'Python-based automation to compare GSTR-2A with purchase register and flag mismatches, reducing manual reconciliation time by 80%.',
          technologies: ['Python', 'Pandas', 'Excel', 'SQL'],
          githubLink: 'https://github.com/govindarajan/gst-recon',
        },
      ],
      preferredRole: 'Fintech / Banking Operations Analyst',
      preferredDomain: 'Finance & Banking',
      preferredStipend: 12000,
      preferredWorkMode: 'ON_SITE',
      preferredDuration: '3 Months',
      resumeOriginalName: 'Govindarajan_S_Finance_Resume.pdf',
      resumeExtractedSkills: ['Python', 'SQL', 'Excel', 'Power BI', 'Financial Modelling', 'Accounting'],
      resumeExtractedRoles: ['Finance Analyst', 'Accounts Executive', 'Banking Intern'],
      profileCompletionPercentage: 82,
    });

    // =========================================================
    // 💼 INTERNSHIPS
    // =========================================================
    console.log('💼 Seeding Internships across domains...');

    // 1. Zoho — Full Stack
    const zohoJob = await Internship.create({
      industry: zohoProfile._id,
      postedBy: zohoUser._id,
      role: 'Full Stack Web Developer Intern',
      domain: 'Full Stack Development',
      description: 'Join Zoho CRM core engineering team to build scalable enterprise full-stack modules using React, Node.js, Express, and high-performance MongoDB/PostgreSQL pipelines.',
      requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'REST API'],
      preferredSkills: ['TypeScript', 'TailwindCSS', 'Redis', 'Docker'],
      experienceRequired: 'FRESHER',
      educationRequired: 'B.E / B.Tech / MCA in CS / IT or related',
      location: 'Chennai',
      workMode: 'HYBRID',
      duration: '6 Months',
      stipend: 25000,
      stipendType: 'PER_MONTH',
      applicationDeadline: oneMonthAhead,
      requiredCandidates: 5,
      selectedCount: 0,
      applicationCount: 0,
      interviewRounds: [
        { roundNumber: 1, name: 'Online Coding Challenge', type: 'CODING', description: 'Data structures, algorithms and frontend logic' },
        { roundNumber: 2, name: 'Technical System Design', type: 'TECHNICAL', description: 'React architecture and REST API development' },
        { roundNumber: 3, name: 'Managerial & Culture Fit', type: 'HR', description: 'Discussion with engineering director' },
      ],
      status: 'OPEN',
      perks: ['Certificate of Completion', 'PPO Opportunity', 'Free Gourmet Meals', 'Flexible Hours'],
      eligibilityCgpa: 7.0,
    });

    // 2. TCS — Frontend React
    const tcsJob = await Internship.create({
      industry: tcsProfile._id,
      postedBy: tcsUser._id,
      role: 'Frontend React Developer Intern',
      domain: 'Full Stack Development',
      description: 'Develop responsive, accessible, high-performance web UIs for digital banking and retail transformation clients using React and TypeScript.',
      requiredSkills: ['React', 'JavaScript', 'HTML', 'CSS', 'TailwindCSS', 'Git'],
      preferredSkills: ['TypeScript', 'Redux', 'Jest'],
      experienceRequired: 'FRESHER',
      educationRequired: 'B.E / B.Tech / B.Sc / BCA in any discipline',
      location: 'Chennai',
      workMode: 'ON_SITE',
      duration: '3 Months',
      stipend: 18000,
      stipendType: 'PER_MONTH',
      applicationDeadline: oneMonthAhead,
      requiredCandidates: 8,
      selectedCount: 0,
      applicationCount: 0,
      interviewRounds: [
        { roundNumber: 1, name: 'Aptitude & Technical MCQ', type: 'ONLINE_TEST', description: 'General aptitude and JavaScript fundamentals' },
        { roundNumber: 2, name: 'Live Coding Interview', type: 'TECHNICAL', description: 'React components, hooks, state management' },
        { roundNumber: 3, name: 'HR Interview', type: 'HR', description: 'Verification & placement discussion' },
      ],
      status: 'OPEN',
      perks: ['TCS Certification', 'Fast-Track to Digital Cadet Cadre'],
      eligibilityCgpa: 6.5,
    });

    // 3. Apollo Hospitals — HealthTech / Data Science
    const apolloJob = await Internship.create({
      industry: apolloProfile._id,
      postedBy: apolloUser._id,
      role: 'Healthcare Data Science & AI Intern',
      domain: 'Data Science & Analytics',
      description: 'Develop AI-driven diagnostic models for early disease detection (diabetic retinopathy, cardiac risk), analyse patient data lakes, and build clinical dashboards for hospital operations.',
      requiredSkills: ['Python', 'Machine Learning', 'Pandas', 'SQL', 'Data Analysis'],
      preferredSkills: ['NLP', 'Computer Vision', 'TensorFlow', 'HL7 FHIR', 'Tableau'],
      experienceRequired: 'FRESHER',
      educationRequired: 'B.Tech / M.Sc in CS / AI / Bioinformatics / Biomedical Engineering',
      location: 'Chennai',
      workMode: 'ON_SITE',
      duration: '6 Months',
      stipend: 22000,
      stipendType: 'PER_MONTH',
      applicationDeadline: twoMonthsAhead,
      requiredCandidates: 4,
      selectedCount: 0,
      applicationCount: 0,
      interviewRounds: [
        { roundNumber: 1, name: 'Data Science Written Test', type: 'ONLINE_TEST', description: 'Statistics, ML fundamentals, SQL queries' },
        { roundNumber: 2, name: 'Case Study – Patient Data Analysis', type: 'TECHNICAL', description: 'Analyse a de-identified dataset and present findings' },
        { roundNumber: 3, name: 'Panel Interview', type: 'HR', description: 'Medical + tech leadership panel' },
      ],
      status: 'OPEN',
      perks: ['Apollo Health Check-up', 'Research Publication Opportunity', 'Certificate'],
      eligibilityCgpa: 7.5,
    });

    // 4. Karur Vysya Bank — Fintech / Banking
    const kvbJob = await Internship.create({
      industry: kvbProfile._id,
      postedBy: kvbUser._id,
      role: 'Fintech & Digital Banking Intern',
      domain: 'Finance & Banking',
      description: "Assist in building KVB's next-generation mobile banking features, UPI payment gateway integrations, and RBI regulatory compliance reporting automation using Python and SQL.",
      requiredSkills: ['Python', 'SQL', 'Excel', 'Financial Modelling', 'Accounting'],
      preferredSkills: ['Power BI', 'Tally', 'REST API', 'UPI API Knowledge'],
      experienceRequired: 'FRESHER',
      educationRequired: 'B.Com / BBA / B.Tech in CS / IT / Finance',
      location: 'Karur',
      workMode: 'ON_SITE',
      duration: '3 Months',
      stipend: 12000,
      stipendType: 'PER_MONTH',
      applicationDeadline: threeWeeksAhead,
      requiredCandidates: 6,
      selectedCount: 0,
      applicationCount: 0,
      interviewRounds: [
        { roundNumber: 1, name: 'Written Aptitude Test', type: 'ONLINE_TEST', description: 'Quantitative aptitude, logical reasoning, banking awareness' },
        { roundNumber: 2, name: 'Technical Interview', type: 'TECHNICAL', description: 'SQL, Excel, Python basics, fintech knowledge' },
        { roundNumber: 3, name: 'HR Round', type: 'HR', description: 'Personality & commitment assessment' },
      ],
      status: 'OPEN',
      perks: ['Banking Industry Exposure', 'Certificate', 'Pre-Placement Interview Preference'],
      eligibilityCgpa: 6.0,
    });

    // 5. BYJU'S — EdTech Full Stack
    const byjusJob = await Internship.create({
      industry: byjusProfile._id,
      postedBy: byjusUser._id,
      role: 'EdTech Full Stack Developer Intern',
      domain: 'Full Stack Development',
      description: "Build BYJU'S adaptive learning engine features, gamification modules, and performance analytics dashboards using React, Node.js and MongoDB.",
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'REST API'],
      preferredSkills: ['Redux', 'TypeScript', 'AWS', 'WebSockets'],
      experienceRequired: 'FRESHER',
      educationRequired: 'B.Tech / B.Sc / MCA in CS / IT',
      location: 'Bangalore',
      workMode: 'HYBRID',
      duration: '6 Months',
      stipend: 30000,
      stipendType: 'PER_MONTH',
      applicationDeadline: twoMonthsAhead,
      requiredCandidates: 5,
      selectedCount: 0,
      applicationCount: 0,
      interviewRounds: [
        { roundNumber: 1, name: 'Online Coding Round', type: 'CODING', description: 'DSA and JavaScript problem solving' },
        { roundNumber: 2, name: 'Full Stack Technical Interview', type: 'TECHNICAL', description: 'React, REST APIs, database design' },
        { roundNumber: 3, name: 'HR & Culture Round', type: 'HR', description: 'Mission alignment & growth mindset discussion' },
      ],
      status: 'OPEN',
      perks: ['Learning Subscriptions', 'PPO Opportunity', 'Certificate', 'Flexible Working Hours'],
      eligibilityCgpa: 7.0,
    });

    // 6. Ola Electric — Embedded Systems / EV
    const olaJob = await Internship.create({
      industry: olaProfile._id,
      postedBy: olaUser._id,
      role: 'Embedded Software & ADAS Intern',
      domain: 'Embedded Systems & IoT',
      description: 'Develop firmware for Ola S1 Pro EV battery management system (BMS), ADAS sensor fusion pipelines, and V2X communication modules using Embedded C, AUTOSAR, and CAN bus.',
      requiredSkills: ['Embedded C', 'RTOS', 'CAN Bus', 'Python', 'IoT'],
      preferredSkills: ['AUTOSAR', 'MATLAB Simulink', 'PCB Design', 'ROS2'],
      experienceRequired: 'FRESHER',
      educationRequired: 'B.E / B.Tech in ECE / EEE / Mechatronics / Automotive Engineering',
      location: 'Hosur',
      workMode: 'ON_SITE',
      duration: '6 Months',
      stipend: 20000,
      stipendType: 'PER_MONTH',
      applicationDeadline: oneMonthAhead,
      requiredCandidates: 4,
      selectedCount: 0,
      applicationCount: 0,
      interviewRounds: [
        { roundNumber: 1, name: 'Embedded Systems Technical Test', type: 'ONLINE_TEST', description: 'MCQs on C, microcontrollers, RTOS, CAN bus' },
        { roundNumber: 2, name: 'Coding & Hardware Problem Solving', type: 'TECHNICAL', description: 'Write firmware for a given embedded specification' },
        { roundNumber: 3, name: 'HR & Team Fit Round', type: 'HR', description: 'EV passion & mission alignment' },
      ],
      status: 'OPEN',
      perks: ['EV Test Rides', 'Patent Contribution Opportunity', 'Certificate', 'PPO Track'],
      eligibilityCgpa: 7.0,
    });

    // 7. Sun TV Network — UI/UX & Media
    const suntvJob = await Internship.create({
      industry: suntvProfile._id,
      postedBy: suntvUser._id,
      role: 'UI/UX Designer & Frontend Intern',
      domain: 'UI/UX & Frontend Design',
      description: 'Redesign SunNXT OTT platform user flows, create motion graphics for digital marketing, and develop React-based internal content management dashboards for Sun TV Network.',
      requiredSkills: ['Figma', 'Adobe XD', 'React', 'JavaScript', 'HTML', 'CSS'],
      preferredSkills: ['After Effects', 'Framer Motion', 'TailwindCSS', 'User Research'],
      experienceRequired: 'FRESHER',
      educationRequired: 'B.Sc / B.Design / B.Tech in CS / IT / Visual Communication',
      location: 'Chennai',
      workMode: 'ON_SITE',
      duration: '3 Months',
      stipend: 15000,
      stipendType: 'PER_MONTH',
      applicationDeadline: threeWeeksAhead,
      requiredCandidates: 3,
      selectedCount: 0,
      applicationCount: 0,
      interviewRounds: [
        { roundNumber: 1, name: 'Portfolio Review', type: 'ONLINE_TEST', description: 'Submit Behance / Figma portfolio for review' },
        { roundNumber: 2, name: 'Design Challenge', type: 'TECHNICAL', description: '2-hour design sprint on a given media brief' },
        { roundNumber: 3, name: 'HR Interview', type: 'HR', description: 'Creative culture fit and commitment round' },
      ],
      status: 'OPEN',
      perks: ['Media Industry Exposure', 'Certificate', 'OTT Platform Credits'],
      eligibilityCgpa: 6.5,
    });

    // 8. TAFE — IoT / Precision Agriculture
    const tafeJob = await Internship.create({
      industry: tafeProfile._id,
      postedBy: tafeUser._id,
      role: 'IoT & Precision Agriculture Intern',
      domain: 'Embedded Systems & IoT',
      description: 'Build IoT sensor networks for TAFE tractors — soil moisture sensors, GPS-based precision ploughing modules, and real-time telematics dashboard for fleet management.',
      requiredSkills: ['IoT', 'Python', 'Embedded C', 'MQTT', 'Arduino'],
      preferredSkills: ['Raspberry Pi', 'LoRa', 'GIS', 'AWS IoT Core', 'MATLAB'],
      experienceRequired: 'FRESHER',
      educationRequired: 'B.E in ECE / EEE / Mechatronics / Agricultural Engineering',
      location: 'Chennai',
      workMode: 'HYBRID',
      duration: '6 Months',
      stipend: 15000,
      stipendType: 'PER_MONTH',
      applicationDeadline: twoMonthsAhead,
      requiredCandidates: 4,
      selectedCount: 0,
      applicationCount: 0,
      interviewRounds: [
        { roundNumber: 1, name: 'Technical MCQ – Electronics & IoT', type: 'ONLINE_TEST', description: 'Microcontrollers, sensors, communication protocols' },
        { roundNumber: 2, name: 'Live IoT Prototype Discussion', type: 'TECHNICAL', description: 'Describe a previous IoT project or solve a problem' },
        { roundNumber: 3, name: 'HR Round', type: 'HR', description: 'Agri-industry alignment' },
      ],
      status: 'OPEN',
      perks: ['Tractor Plant Visit', 'Patent Filing Support', 'Certificate'],
      eligibilityCgpa: 6.5,
    });

    // 9. Delhivery — Data Science / Logistics
    const delhiveryJob = await Internship.create({
      industry: delhiveryProfile._id,
      postedBy: delhiveryUser._id,
      role: 'Data Science & Route Optimisation Intern',
      domain: 'Data Science & Analytics',
      description: "Optimise Delhivery's last-mile delivery routes using ML algorithms, geospatial analysis, and vehicle routing problem (VRP) solvers on real-time Tamil Nadu logistics data.",
      requiredSkills: ['Python', 'SQL', 'Pandas', 'Machine Learning', 'Data Analysis'],
      preferredSkills: ['OR-Tools', 'GeoPandas', 'Folium', 'Power BI', 'Tableau'],
      experienceRequired: 'FRESHER',
      educationRequired: 'B.Tech / B.Sc / MCA in CS / IT / Mathematics / Operations Research',
      location: 'Chennai',
      workMode: 'HYBRID',
      duration: '6 Months',
      stipend: 20000,
      stipendType: 'PER_MONTH',
      applicationDeadline: oneMonthAhead,
      requiredCandidates: 3,
      selectedCount: 0,
      applicationCount: 0,
      interviewRounds: [
        { roundNumber: 1, name: 'Data & SQL Assessment', type: 'ONLINE_TEST', description: 'SQL queries, Python pandas, probability' },
        { roundNumber: 2, name: 'Case Study – Route Optimisation', type: 'TECHNICAL', description: 'Solve a real delivery optimisation scenario' },
        { roundNumber: 3, name: 'HR Round', type: 'HR', description: 'Logistics domain awareness and team fit' },
      ],
      status: 'OPEN',
      perks: ['Real-World Logistics Data Access', 'Certificate', 'PPO for High Performers'],
      eligibilityCgpa: 7.0,
    });

    // 10. Reliance Retail — E-Commerce Analytics
    const relianceJob = await Internship.create({
      industry: relianceProfile._id,
      postedBy: relianceUser._id,
      role: 'E-Commerce Product & Analytics Intern',
      domain: 'Data Science & Analytics',
      description: "Analyse JioMart user behaviour, build product recommendation algorithms, and create real-time sales analytics dashboards for Reliance Retail's 200M+ customer base.",
      requiredSkills: ['Python', 'SQL', 'Data Analysis', 'Excel', 'Power BI'],
      preferredSkills: ['Scikit-Learn', 'A/B Testing', 'Tableau', 'Google Analytics', 'Kafka'],
      experienceRequired: 'FRESHER',
      educationRequired: 'B.Tech / B.Com / BCA in CS / IT / Statistics / Marketing',
      location: 'Chennai',
      workMode: 'ON_SITE',
      duration: '3 Months',
      stipend: 18000,
      stipendType: 'PER_MONTH',
      applicationDeadline: threeWeeksAhead,
      requiredCandidates: 5,
      selectedCount: 0,
      applicationCount: 0,
      interviewRounds: [
        { roundNumber: 1, name: 'Aptitude & Analytical Test', type: 'ONLINE_TEST', description: 'Quant, data interpretation, business cases' },
        { roundNumber: 2, name: 'SQL & Python Coding Round', type: 'TECHNICAL', description: 'Data wrangling and analysis tasks' },
        { roundNumber: 3, name: 'HR & Culture Round', type: 'HR', description: 'Retail domain interest and communication' },
      ],
      status: 'OPEN',
      perks: ['JioMart Shopping Vouchers', 'Certificate', "Exposure to India's Largest Retail Dataset"],
      eligibilityCgpa: 6.5,
    });

    // =========================================================
    // 📝 APPLICATIONS
    // =========================================================
    console.log('📝 Seeding Realistic Applications...');

    // Divya Priya → Zoho (Round 2)
    const divyaZohoMatch = calculateStudentInternshipMatch(divyaProfile, zohoJob, null);
    await Application.create({
      student: divyaProfile._id,
      studentUser: divyaUser._id,
      internship: zohoJob._id,
      industry: zohoProfile._id,
      status: 'ROUND_2',
      rounds: [
        { roundNumber: 1, name: 'Online Coding Challenge', status: 'CLEARED', completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
        { roundNumber: 2, name: 'Technical System Design', status: 'SCHEDULED', scheduledDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), interviewMode: 'ONLINE_GOOGLE_MEET', meetingLink: 'https://meet.google.com/zoho-fs-tech', instructions: 'Prepare a 10 min walkthrough of your EduCollaborate architecture. Be ready for live React hooks coding.' },
        { roundNumber: 3, name: 'Managerial & Culture Fit', status: 'PENDING' },
      ],
      activeRoundNumber: 2,
      matchScore: divyaZohoMatch.matchPercentage,
      aiMatchDetails: {
        skillMatchPercentage: divyaZohoMatch.scores.skillScore,
        matchedSkills: divyaZohoMatch.matchedSkills,
        missingSkills: divyaZohoMatch.missingSkills,
        reasons: divyaZohoMatch.explainableReasons,
      },
      coverNote: 'Excited to contribute to Zoho CRM with my hands-on React and Node.js expertise!',
    });
    zohoJob.applicationCount += 1;
    await zohoJob.save();

    // Karthikeyan → Apollo (Shortlisted)
    const karthiApolloMatch = calculateStudentInternshipMatch(karthiProfile, apolloJob, null);
    await Application.create({
      student: karthiProfile._id,
      studentUser: karthiUser._id,
      internship: apolloJob._id,
      industry: apolloProfile._id,
      status: 'SHORTLISTED',
      rounds: [
        { roundNumber: 1, name: 'Data Science Written Test', status: 'SCHEDULED', scheduledDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), interviewMode: 'ONLINE_GOOGLE_MEET', meetingLink: 'https://meet.google.com/apollo-ds-round1', instructions: 'Online proctored test — ML, statistics, SQL. Keep your ID ready.' },
        { roundNumber: 2, name: 'Case Study – Patient Data Analysis', status: 'PENDING' },
        { roundNumber: 3, name: 'Panel Interview', status: 'PENDING' },
      ],
      activeRoundNumber: 1,
      matchScore: karthiApolloMatch.matchPercentage,
      aiMatchDetails: {
        skillMatchPercentage: karthiApolloMatch.scores.skillScore,
        matchedSkills: karthiApolloMatch.matchedSkills,
        missingSkills: karthiApolloMatch.missingSkills,
        reasons: karthiApolloMatch.explainableReasons,
      },
      coverNote: "Passionate about applying NLP and ML to healthcare diagnostics. Eager to join Apollo's AI team.",
    });
    apolloJob.applicationCount += 1;
    await apolloJob.save();

    // Anbazhagan → TCS (Selected)
    const anbazhTcsMatch = calculateStudentInternshipMatch(anbazhProfile, tcsJob, null);
    await Application.create({
      student: anbazhProfile._id,
      studentUser: anbazhUser._id,
      internship: tcsJob._id,
      industry: tcsProfile._id,
      status: 'SELECTED',
      rounds: [
        { roundNumber: 1, name: 'Aptitude & Technical MCQ', status: 'CLEARED' },
        { roundNumber: 2, name: 'Live Coding Interview', status: 'CLEARED' },
        { roundNumber: 3, name: 'HR Interview', status: 'CLEARED' },
      ],
      activeRoundNumber: 3,
      matchScore: anbazhTcsMatch.matchPercentage,
      aiMatchDetails: {
        skillMatchPercentage: anbazhTcsMatch.scores.skillScore,
        matchedSkills: anbazhTcsMatch.matchedSkills,
        missingSkills: anbazhTcsMatch.missingSkills,
        reasons: anbazhTcsMatch.explainableReasons,
      },
      feedback: 'Strong fundamentals in React and JavaScript. Excellent communication. Selected!',
    });
    tcsJob.applicationCount += 1;
    tcsJob.selectedCount += 1;
    await tcsJob.save();

    // Kavitha → Reliance Retail (Applied)
    const kavithaRelianceMatch = calculateStudentInternshipMatch(kavithaProfile, relianceJob, null);
    await Application.create({
      student: kavithaProfile._id,
      studentUser: kavithaUser._id,
      internship: relianceJob._id,
      industry: relianceProfile._id,
      status: 'APPLIED',
      rounds: [
        { roundNumber: 1, name: 'Aptitude & Analytical Test', status: 'PENDING' },
        { roundNumber: 2, name: 'SQL & Python Coding Round', status: 'PENDING' },
        { roundNumber: 3, name: 'HR & Culture Round', status: 'PENDING' },
      ],
      activeRoundNumber: 1,
      matchScore: kavithaRelianceMatch.matchPercentage,
      aiMatchDetails: {
        skillMatchPercentage: kavithaRelianceMatch.scores.skillScore,
        matchedSkills: kavithaRelianceMatch.matchedSkills,
        missingSkills: kavithaRelianceMatch.missingSkills,
        reasons: kavithaRelianceMatch.explainableReasons,
      },
      coverNote: 'I love combining data analytics with retail business decisions. JioMart scale excites me!',
    });
    relianceJob.applicationCount += 1;
    await relianceJob.save();

    // Murugesan → Ola Electric (Round 1 Scheduled)
    const murugesanOlaMatch = calculateStudentInternshipMatch(murugesanProfile, olaJob, null);
    await Application.create({
      student: murugesanProfile._id,
      studentUser: murugesanUser._id,
      internship: olaJob._id,
      industry: olaProfile._id,
      status: 'ROUND_1',
      rounds: [
        { roundNumber: 1, name: 'Embedded Systems Technical Test', status: 'SCHEDULED', scheduledDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), interviewMode: 'ONLINE_GOOGLE_MEET', meetingLink: 'https://meet.google.com/ola-emb-test', instructions: 'MCQ on C, microcontrollers, RTOS and CAN bus. 90 minutes, proctored.' },
        { roundNumber: 2, name: 'Coding & Hardware Problem Solving', status: 'PENDING' },
        { roundNumber: 3, name: 'HR & Team Fit Round', status: 'PENDING' },
      ],
      activeRoundNumber: 1,
      matchScore: murugesanOlaMatch.matchPercentage,
      aiMatchDetails: {
        skillMatchPercentage: murugesanOlaMatch.scores.skillScore,
        matchedSkills: murugesanOlaMatch.matchedSkills,
        missingSkills: murugesanOlaMatch.missingSkills,
        reasons: murugesanOlaMatch.explainableReasons,
      },
      coverNote: 'My CAN bus tractor project is directly aligned with Ola BMS firmware requirements.',
    });
    olaJob.applicationCount += 1;
    await olaJob.save();

    // Nithyashri → Sun TV (Applied)
    const nithyaSuntvMatch = calculateStudentInternshipMatch(nithyaProfile, suntvJob, null);
    await Application.create({
      student: nithyaProfile._id,
      studentUser: nithyaUser._id,
      internship: suntvJob._id,
      industry: suntvProfile._id,
      status: 'APPLIED',
      rounds: [
        { roundNumber: 1, name: 'Portfolio Review', status: 'PENDING' },
        { roundNumber: 2, name: 'Design Challenge', status: 'PENDING' },
        { roundNumber: 3, name: 'HR Interview', status: 'PENDING' },
      ],
      activeRoundNumber: 1,
      matchScore: nithyaSuntvMatch.matchPercentage,
      aiMatchDetails: {
        skillMatchPercentage: nithyaSuntvMatch.scores.skillScore,
        matchedSkills: nithyaSuntvMatch.matchedSkills,
        missingSkills: nithyaSuntvMatch.missingSkills,
        reasons: nithyaSuntvMatch.explainableReasons,
      },
      coverNote: 'I redesigned SunNXT for my UI/UX portfolio — thrilled to apply my design thinking here!',
    });
    suntvJob.applicationCount += 1;
    await suntvJob.save();

    // Govindarajan → KVB (Applied)
    const govindKvbMatch = calculateStudentInternshipMatch(govindProfile, kvbJob, null);
    await Application.create({
      student: govindProfile._id,
      studentUser: govindUser._id,
      internship: kvbJob._id,
      industry: kvbProfile._id,
      status: 'APPLIED',
      rounds: [
        { roundNumber: 1, name: 'Written Aptitude Test', status: 'PENDING' },
        { roundNumber: 2, name: 'Technical Interview', status: 'PENDING' },
        { roundNumber: 3, name: 'HR Round', status: 'PENDING' },
      ],
      activeRoundNumber: 1,
      matchScore: govindKvbMatch.matchPercentage,
      aiMatchDetails: {
        skillMatchPercentage: govindKvbMatch.scores.skillScore,
        matchedSkills: govindKvbMatch.matchedSkills,
        missingSkills: govindKvbMatch.missingSkills,
        reasons: govindKvbMatch.explainableReasons,
      },
      coverNote: "KVB's digital transformation vision aligns with my fintech automation background perfectly.",
    });
    kvbJob.applicationCount += 1;
    await kvbJob.save();

    // =========================================================
    // ⭐ REVIEWS
    // =========================================================
    console.log('⭐ Seeding Reviews...');

    await Review.create({
      authorUser: divyaUser._id,
      authorRole: 'student',
      industry: zohoProfile._id,
      internship: zohoJob._id,
      rating: 5,
      title: 'World-class engineering culture and hands-on learning',
      feedback: 'The mentorship at Zoho is incredible. You get to work on production code that serves millions of enterprise users worldwide. Highly recommended for full-stack enthusiasts!',
      mentorshipRating: 5,
      workEnvironmentRating: 5,
      learningOpportunitiesRating: 5,
    });

    await Review.create({
      authorUser: anbazhUser._id,
      authorRole: 'student',
      industry: tcsProfile._id,
      internship: tcsJob._id,
      rating: 4,
      title: 'Great exposure to enterprise React projects',
      feedback: 'TCS gave me real client project experience and strong code review practices. The team was very supportive and structured. Good starting point for frontend engineers.',
      mentorshipRating: 4,
      workEnvironmentRating: 4,
      learningOpportunitiesRating: 4,
    });

    await Review.create({
      authorUser: karthiUser._id,
      authorRole: 'student',
      industry: apolloProfile._id,
      internship: apolloJob._id,
      rating: 5,
      title: 'Incredible to build AI that impacts patient care',
      feedback: 'Working at Apollo on real clinical data was transformative. The AI team is world-class and the mission is deeply meaningful. Highly recommend for ML enthusiasts in healthcare.',
      mentorshipRating: 5,
      workEnvironmentRating: 5,
      learningOpportunitiesRating: 5,
    });

    await Review.create({
      authorUser: murugesanUser._id,
      authorRole: 'student',
      industry: olaProfile._id,
      internship: olaJob._id,
      rating: 5,
      title: 'Building the future of Indian EVs at Hosur',
      feedback: "Ola Electric's Hosur factory and firmware team are top-notch. Working on real BMS firmware and seeing the EV assembly line in person was a career-defining experience.",
      mentorshipRating: 4,
      workEnvironmentRating: 5,
      learningOpportunitiesRating: 5,
    });

    // =========================================================
    // 🔔 NOTIFICATIONS
    // =========================================================
    console.log('🔔 Seeding Notifications...');

    await Notification.create({
      recipient: divyaUser._id,
      title: 'Interview Scheduled – Round 2 at Zoho',
      message: 'Your Technical System Design round for Zoho Corporation has been scheduled on Google Meet. Check your application for the link.',
      type: 'INTERVIEW_SCHEDULED',
      link: '/student/applications',
    });

    await Notification.create({
      recipient: karthiUser._id,
      title: 'Application Shortlisted – Apollo Hospitals',
      message: 'Apollo Hospitals has shortlisted your application for Healthcare Data Science & AI Intern. Round 1 is now scheduled.',
      type: 'APPLICATION_UPDATE',
      link: '/student/applications',
    });

    await Notification.create({
      recipient: anbazhUser._id,
      title: '🎉 Congratulations! You are Selected – TCS!',
      message: 'You have been selected for the Frontend React Developer Intern position at Tata Consultancy Services. Offer letter process begins shortly.',
      type: 'APPLICATION_UPDATE',
      link: '/student/applications',
    });

    await Notification.create({
      recipient: murugesanUser._id,
      title: 'Interview Scheduled – Round 1 at Ola Electric',
      message: 'Your Embedded Systems Technical Test for Ola Electric has been scheduled. Check your application for the proctored test link.',
      type: 'INTERVIEW_SCHEDULED',
      link: '/student/applications',
    });

    await Notification.create({
      recipient: kavithaUser._id,
      title: 'Application Submitted – Reliance Retail',
      message: 'Your application for E-Commerce Product & Analytics Intern at Reliance Retail has been submitted successfully.',
      type: 'APPLICATION_UPDATE',
      link: '/student/applications',
    });

    await Notification.create({
      recipient: nithyaUser._id,
      title: 'Application Submitted – Sun TV Network',
      message: 'Your application for UI/UX Designer & Frontend Intern at Sun TV Network has been submitted. Portfolio review is pending.',
      type: 'APPLICATION_UPDATE',
      link: '/student/applications',
    });

    await Notification.create({
      recipient: govindUser._id,
      title: 'Application Submitted – Karur Vysya Bank',
      message: 'Your application for Fintech & Digital Banking Intern at Karur Vysya Bank has been submitted successfully.',
      type: 'APPLICATION_UPDATE',
      link: '/student/applications',
    });

    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log(`
==================================================================
🌟 SEED CREDENTIALS SUMMARY:
------------------------------------------------------------------
👑 ADMIN:
   Email:    admin@gmail.com
   Password: admin123

🏢 INDUSTRIES (10 domains + 1 pending):
   1.  Zoho Corporation        → zoho@careers.com        (SaaS / IT)
   2.  TCS                     → tcs@careers.com         (IT Consulting)
   3.  Apollo Hospitals        → apollo@careers.com      (Healthcare)
   4.  Karur Vysya Bank        → kvbank@careers.com      (Finance)
   5.  BYJU'S                  → byjus@careers.com       (EdTech)
   6.  Ola Electric            → ola@careers.com         (EV / Clean Energy)
   7.  Sun TV Network          → suntv@careers.com       (Media)
   8.  TAFE                    → tafe@careers.com        (Manufacturing / AgriTech)
   9.  Delhivery               → delhivery@careers.com   (Logistics)
   10. Reliance Retail         → reliance@careers.com    (Retail / E-Commerce)
   11. GreenStar AgriTech      → greenstar@careers.com   [PENDING]

   All industry passwords: password123

🎓 STUDENTS (Tamil Nadu names):
   1.  Divya Priya S     → divyapriya@student.com    (Full Stack — Round 2 at Zoho)
   2.  Karthikeyan M     → karthikeyan@student.com   (AI/ML — Shortlisted at Apollo)
   3.  Anbazhagan R      → anbazhagan@student.com    (Cloud/DevOps — SELECTED at TCS)
   4.  Kavitha Lakshmi N → kavitha@student.com        (Data Science — Applied at Reliance)
   5.  Murugesan T       → murugesan@student.com     (Embedded/IoT — Round 1 at Ola)
   6.  Nithyashri P      → nithyashri@student.com    (UI/UX — Applied at Sun TV)
   7.  Govindarajan S    → govindarajan@student.com  (Finance — Applied at KVB)

   All student passwords: password123
==================================================================
    `);

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
