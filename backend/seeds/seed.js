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

    const now = new Date();
    const oneMonthAhead   = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAhead  = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const threeWeeksAhead = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
    const sixWeeksAhead   = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);

    // =========================================================
    // 👑 1. ADMIN
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
    // 🏢 2. ENTERPRISES / INDUSTRIES (Tamil Nadu, Bangalore, Hyderabad)
    // Notice: TCS and Zoho removed! Authentic Tamil Nadu contact persons.
    // =========================================================
    console.log('🏢 Seeding 30+ Verified Companies across Chennai, Coimbatore, Bangalore, Hyderabad...');

    const companiesData = [
      {
        name: 'Freshworks Technologies',
        email: 'freshworks@careers.com',
        contactPerson: 'Senthil Nathan V',
        phone: '+914466778801',
        location: 'Chennai',
        website: 'https://www.freshworks.com',
        type: 'SaaS & Enterprise Apps',
        rating: 4.8,
        reviews: 24,
        desc: 'Freshworks creates AI-boosted business software in Chennai that makes it easy for IT, customer service, and sales teams to work efficiently.',
      },
      {
        name: 'Chargebee Technologies',
        email: 'chargebee@careers.com',
        contactPerson: 'Karthikeyan Narayanan',
        phone: '+914466778802',
        location: 'Chennai',
        website: 'https://www.chargebee.com',
        type: 'Subscription & FinTech SaaS',
        rating: 4.7,
        reviews: 18,
        desc: 'Chargebee is a leading recurring billing and subscription management platform powering thousands of fast-growing businesses globally from Chennai.',
      },
      {
        name: 'Kissflow',
        email: 'kissflow@careers.com',
        contactPerson: 'Radhika Krishnan',
        phone: '+914466778803',
        location: 'Chennai',
        website: 'https://kissflow.com',
        type: 'Low-Code & Cloud Workflows',
        rating: 4.6,
        reviews: 15,
        desc: 'Kissflow is a pioneer in digital workplace and low-code work management software built by passionate engineers in Chennai.',
      },
      {
        name: 'Vivriti Capital',
        email: 'vivriti@careers.com',
        contactPerson: 'Suresh Balakrishnan',
        phone: '+914466778804',
        location: 'Chennai',
        website: 'https://www.vivriticapital.com',
        type: 'FinTech & Capital Markets',
        rating: 4.5,
        reviews: 14,
        desc: 'Vivriti Capital is a tech-enabled non-banking financial institution revolutionizing Indian enterprise debt and supply chain financing.',
      },
      {
        name: 'Guvi Geek Network',
        email: 'guvi@careers.com',
        contactPerson: 'Arun Prakash M',
        phone: '+914466778805',
        location: 'Chennai',
        website: 'https://www.guvi.in',
        type: 'EdTech & Vernacular Upskilling',
        rating: 4.7,
        reviews: 20,
        desc: 'GUVI (an HCL company) incubated at IIT Madras Research Park provides technical skill training, AI coding labs, and hiring pipelines in native languages.',
      },
      {
        name: 'Agnikul Cosmos',
        email: 'agnikul@careers.com',
        contactPerson: 'Moin Srinivas',
        phone: '+914466778806',
        location: 'Chennai',
        website: 'https://agnikul.in',
        type: 'Aerospace & DeepTech Robotics',
        rating: 4.9,
        reviews: 12,
        desc: 'Agnikul Cosmos designs, manufactures and launches customizable satellite launch vehicles with patented 3D-printed single-piece rocket engines at IIT Madras.',
      },
      {
        name: 'WayCool Foods',
        email: 'waycool@careers.com',
        contactPerson: 'Selvakumar Arumugam',
        phone: '+914466778807',
        location: 'Chennai',
        website: 'https://waycool.in',
        type: 'AgriTech & Supply Chain Tech',
        rating: 4.4,
        reviews: 16,
        desc: 'WayCool is India’s leading food and agri-tech platform transforming food supply chains through robotics, computer vision grading, and IoT climate controls.',
      },
      {
        name: 'Intellect Design Arena',
        email: 'intellect@careers.com',
        contactPerson: 'Meenakshi Sundaram',
        phone: '+914466778808',
        location: 'Chennai',
        website: 'https://www.intellectdesign.com',
        type: 'FinTech Core Banking',
        rating: 4.5,
        reviews: 17,
        desc: 'Intellect Design Arena is a Chennai-headquartered global leader in financial technology for commercial banking, treasury, and insurance.',
      },
      {
        name: 'LatentView Analytics',
        email: 'latentview@careers.com',
        contactPerson: 'Priyadharshini Swaminathan',
        phone: '+914466778809',
        location: 'Chennai',
        website: 'https://www.latentview.com',
        type: 'Big Data & Predictive Analytics',
        rating: 4.6,
        reviews: 19,
        desc: 'LatentView Analytics helps Fortune 500 enterprises navigate digital transformation with predictive modeling, generative AI, and decision analytics.',
      },
      {
        name: 'Prodapt Solutions',
        email: 'prodapt@careers.com',
        contactPerson: 'Balaji Natarajan',
        phone: '+914466778810',
        location: 'Chennai',
        website: 'https://www.prodapt.com',
        type: 'Connected Cloud & Telecom IT',
        rating: 4.4,
        reviews: 13,
        desc: 'Prodapt is a specialized global provider of IT, cloud engineering, network virtualization, and AI automation for telecom and tech enterprises.',
      },
      {
        name: 'BankBazaar',
        email: 'bankbazaar@careers.com',
        contactPerson: 'Ramesh Adithya',
        phone: '+914466778811',
        location: 'Chennai',
        website: 'https://www.bankbazaar.com',
        type: 'Consumer FinTech & Credit Tech',
        rating: 4.5,
        reviews: 11,
        desc: 'BankBazaar is India’s first neutral financial marketplace delivering co-branded credit products, paperless KYC, and digital credit health monitoring.',
      },
      {
        name: 'Kovai.co',
        email: 'kovaico@careers.com',
        contactPerson: 'Saravanan Govindaraj',
        phone: '+914226778812',
        location: 'Coimbatore',
        website: 'https://www.kovai.co',
        type: 'Enterprise Cloud & Microservices',
        rating: 4.8,
        reviews: 22,
        desc: 'Kovai.co is a premier SaaS product company in Coimbatore building enterprise-grade tools for Microsoft Azure, knowledge management, and API documentation.',
      },
      {
        name: 'Soliton Technologies',
        email: 'soliton@careers.com',
        contactPerson: 'Dr. G. Venkatakrishnan',
        phone: '+914226778813',
        location: 'Coimbatore',
        website: 'https://www.solitontech.com',
        type: 'Semiconductors & IoT Automation',
        rating: 4.9,
        reviews: 26,
        desc: 'Soliton Technologies in Coimbatore pioneers automated chip validation software, embedded systems, and test frameworks for global semiconductor giants.',
      },
      {
        name: 'Pricol Limited',
        email: 'pricol@careers.com',
        contactPerson: 'Muruganantham R',
        phone: '+914226778814',
        location: 'Coimbatore',
        website: 'https://www.pricol.com',
        type: 'Automotive Telematics & Sensors',
        rating: 4.4,
        reviews: 15,
        desc: 'Pricol Limited is a tier-1 automotive technology leader in Coimbatore engineering EV dashboard displays, IoT telematics, and smart sensors.',
      },
      {
        name: 'CRI Pumps R&D',
        email: 'cripumps@careers.com',
        contactPerson: 'Kameswaran M',
        phone: '+914226778815',
        location: 'Coimbatore',
        website: 'https://www.crigroups.com',
        type: 'Smart Pumping & IoT Hydraulics',
        rating: 4.5,
        reviews: 14,
        desc: 'C.R.I. Pumps is an Indian multinational manufacturing solar pumps, IoT remote flow controllers, and energy-efficient water systems in Coimbatore.',
      },
      {
        name: 'Salzer Electronics',
        email: 'salzer@careers.com',
        contactPerson: 'Ananthi Ramesh',
        phone: '+914226778816',
        location: 'Coimbatore',
        website: 'https://www.salzergroup.net',
        type: 'Smart Power & EV Charging',
        rating: 4.3,
        reviews: 10,
        desc: 'Salzer Electronics manufactures smart energy meters, rotary switches, magnetic components, and EV DC-fast charging stations in Coimbatore.',
      },
      {
        name: 'Craftsman Automation',
        email: 'craftsman@careers.com',
        contactPerson: 'Thangavel P',
        phone: '+914226778817',
        location: 'Coimbatore',
        website: 'https://www.craftsmanautomation.com',
        type: 'High Precision Robotics & CAD/CAM',
        rating: 4.5,
        reviews: 12,
        desc: 'Craftsman Automation is a Coimbatore engineering leader delivering automated storage systems, CNC machining, and industrial robotics.',
      },
      {
        name: 'Razorpay Software',
        email: 'razorpay@careers.com',
        contactPerson: 'Pooja Subramanian',
        phone: '+918067788818',
        location: 'Bangalore',
        website: 'https://razorpay.com',
        type: 'Digital Payments & FinTech',
        rating: 4.9,
        reviews: 35,
        desc: 'Razorpay is India’s foremost full-stack financial services platform enabling millions of businesses to accept, process, and disburse digital payments.',
      },
      {
        name: 'Zerodha Tech',
        email: 'zerodha@careers.com',
        contactPerson: 'Kailash Nadh',
        phone: '+918067788819',
        location: 'Bangalore',
        website: 'https://zerodha.com',
        type: 'FinTech & Trading Platforms',
        rating: 4.9,
        reviews: 40,
        desc: 'Zerodha is India’s largest stock broker by active clients, building ultra-low-latency financial technology with Python, Go, and PostgreSQL.',
      },
      {
        name: 'Postman Labs',
        email: 'postman@careers.com',
        contactPerson: 'Shyamala Sundaram',
        phone: '+918067788820',
        location: 'Bangalore',
        website: 'https://www.postman.com',
        type: 'API Platform & Cloud DevOps',
        rating: 4.8,
        reviews: 28,
        desc: 'Postman is the world’s leading API collaboration platform used by over 30 million developers to build, test, mock, and monitor APIs.',
      },
      {
        name: 'Ather Energy',
        email: 'ather@careers.com',
        contactPerson: 'Vigneshwaran K',
        phone: '+918067788821',
        location: 'Bangalore',
        website: 'https://www.atherenergy.com',
        type: 'Electric Vehicles & Smart BMS',
        rating: 4.8,
        reviews: 30,
        desc: 'Ather Energy designs intelligent electric scooters, proprietary battery management systems, and smart fast-charging infrastructure across Tamil Nadu & India.',
      },
      {
        name: 'Hasura Technologies',
        email: 'hasura@careers.com',
        contactPerson: 'Soundarya R',
        phone: '+918067788822',
        location: 'Bangalore',
        website: 'https://hasura.io',
        type: 'GraphQL & Distributed Databases',
        rating: 4.8,
        reviews: 18,
        desc: 'Hasura makes data access blazingly fast by generating instant GraphQL and REST APIs on PostgreSQL, MySQL, and Snowflake databases.',
      },
      {
        name: 'CRED Technologies',
        email: 'cred@careers.com',
        contactPerson: 'Deepa Muthukrishnan',
        phone: '+918067788823',
        location: 'Bangalore',
        website: 'https://cred.club',
        type: 'High Scale Mobile & UX',
        rating: 4.7,
        reviews: 25,
        desc: 'CRED is a members-only credit platform known for cutting-edge UI/UX design, event-driven microservices architecture, and rewards systems.',
      },
      {
        name: 'Darwinbox',
        email: 'darwinbox@careers.com',
        contactPerson: 'Geetha Padmanabhan',
        phone: '+914067788824',
        location: 'Hyderabad',
        website: 'https://darwinbox.com',
        type: 'AI Human Capital Management',
        rating: 4.7,
        reviews: 22,
        desc: 'Darwinbox is Asia’s fastest-growing enterprise HR tech unicorn automating hiring, payroll, performance, and workplace AI for 900+ global enterprises.',
      },
      {
        name: 'HighRadius',
        email: 'highradius@careers.com',
        contactPerson: 'Senthil Velan',
        phone: '+914067788825',
        location: 'Hyderabad',
        website: 'https://www.highradius.com',
        type: 'Autonomous Finance & AI',
        rating: 4.6,
        reviews: 20,
        desc: 'HighRadius provides autonomous finance software for accounts receivable, treasury, and financial record-to-report using machine learning algorithms.',
      },
      {
        name: 'Zenoti',
        email: 'zenoti@careers.com',
        contactPerson: 'Kavitha Natarajan',
        phone: '+914067788826',
        location: 'Hyderabad',
        website: 'https://www.zenoti.com',
        type: 'Cloud Enterprise SaaS',
        rating: 4.6,
        reviews: 16,
        desc: 'Zenoti is the leading cloud-based business management software for the beauty, wellness, and fitness industry worldwide.',
      },
      {
        name: 'Cyient Technologies',
        email: 'cyient@careers.com',
        contactPerson: 'Venkatesan R',
        phone: '+914067788827',
        location: 'Hyderabad',
        website: 'https://www.cyient.com',
        type: 'Semiconductors & Digital Twins',
        rating: 4.5,
        reviews: 17,
        desc: 'Cyient is a global engineering and technology solutions company specializing in VLSI ASIC design, aerospace software, and industrial digital twins.',
      },
      {
        name: 'Dr. Reddy’s Digital Labs',
        email: 'drreddys@careers.com',
        contactPerson: 'Dr. Meera Krishnaswamy',
        phone: '+914067788828',
        location: 'Hyderabad',
        website: 'https://www.drreddys.com',
        type: 'HealthTech & AI Drug Analytics',
        rating: 4.6,
        reviews: 14,
        desc: 'Dr. Reddy’s Digital Labs pioneers AI-driven patient adherence apps, decentralized clinical trial data lakes, and automated pharmaceutical analytics.',
      },
      {
        name: 'WNS Vuram',
        email: 'vuram@careers.com',
        contactPerson: 'Kishore Sundararaman',
        phone: '+914526778829',
        location: 'Madurai',
        website: 'https://www.vuram.com',
        type: 'Hyperautomation & AI BPM',
        rating: 4.7,
        reviews: 19,
        desc: 'WNS Vuram is an enterprise hyperautomation services firm headquartered in Tamil Nadu (Madurai & Chennai) delivering low-code AI workflows.',
      },
      {
        name: 'Titan Engineering & Automation',
        email: 'teal@careers.com',
        contactPerson: 'Shanmugam Pillai',
        phone: '+914344778830',
        location: 'Hosur',
        website: 'https://www.titanteal.com',
        type: 'Industrial Robotics & Automation',
        rating: 4.8,
        reviews: 21,
        desc: 'TEAL (a Titan / TATA enterprise based in Hosur, Tamil Nadu) builds robotic assembly lines, high-precision automated inspection, and defense components.',
      },
    ];

    // Map to hold industry records: key = companyName, value = { user, profile }
    const industryMap = {};

    for (const item of companiesData) {
      const u = await User.create({
        name: item.name,
        email: item.email,
        password: 'password123',
        role: 'industry',
        phone: item.phone,
        isProfileComplete: true,
      });

      const p = await IndustryProfile.create({
        user: u._id,
        companyName: item.name,
        officialEmail: item.email,
        contactPerson: item.contactPerson,
        phone: item.phone,
        website: item.website,
        companyDescription: item.desc,
        industryType: item.type,
        companyLocation: item.location,
        verificationStatus: 'APPROVED',
        averageRating: item.rating,
        totalReviews: item.reviews,
      });

      industryMap[item.name] = { user: u, profile: p };
    }

    // Pending Company for Admin Verification testing
    const greenstarUser = await User.create({
      name: 'GreenStar AgriTech Solutions',
      email: 'greenstar@careers.com',
      password: 'password123',
      role: 'industry',
      phone: '+919600123456',
      isProfileComplete: true,
    });
    const greenstarProfile = await IndustryProfile.create({
      user: greenstarUser._id,
      companyName: 'GreenStar AgriTech Solutions',
      officialEmail: 'greenstar@careers.com',
      contactPerson: 'Muruganantham R',
      phone: '+919600123456',
      website: 'https://greenstar.agri',
      companyDescription: 'Coimbatore agri-startup building drone-based crop monitoring and soil IoT sensors.',
      industryType: 'Agriculture Technology',
      companyLocation: 'Coimbatore',
      verificationStatus: 'PENDING',
      verificationProofOriginalName: 'GreenStar_MSME_Certificate.pdf',
      verificationProofPath: 'uploads/proofs/sample_gst.pdf',
      verificationUploadedAt: new Date(),
    });

    console.log(`✅ Successfully seeded ${Object.keys(industryMap).length} verified companies!`);

    // =========================================================
    // 💼 3. INTERNSHIPS (At least 10 for EACH Domain)
    // Domains covered:
    // - Full Stack Development (12)
    // - AI & Machine Learning (11)
    // - Data Science & Analytics (10)
    // - Cloud & DevOps (10)
    // - Embedded Systems & IoT (10)
    // - Electric Vehicle (EV) Technology (10)
    // - VLSI Design & Verification (10)
    // - Robotics & Automation (10)
    // - Precision Agriculture & Smart Farming (10)
    // - Finance & FinTech (10)
    // - Cybersecurity & Ethical Hacking (10)
    // - UI/UX Design (10)
    // =========================================================
    console.log('💼 Seeding 120+ Internships across all 12 domains (10+ per domain)...');

    const internshipsList = [
      // ─── 1. FULL STACK DEVELOPMENT (12) ────────────────────────
      {
        company: 'Freshworks Technologies',
        role: 'Full Stack Web Developer Intern',
        domain: 'Full Stack Development',
        desc: 'Build scalable enterprise web modules using React, Node.js, Express, and MongoDB with our Chennai engineering team.',
        reqSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'REST API'],
        prefSkills: ['TypeScript', 'TailwindCSS', 'Redis'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 25000, cgpa: 7.0,
      },
      {
        company: 'Chargebee Technologies',
        role: 'Frontend React & TypeScript Intern',
        domain: 'Full Stack Development',
        desc: 'Develop responsive, accessible billing portals using React, TypeScript, and state-of-the-art component systems.',
        reqSkills: ['React', 'TypeScript', 'JavaScript', 'TailwindCSS', 'HTML', 'CSS'],
        prefSkills: ['Redux', 'Jest', 'Storybook'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 26000, cgpa: 7.0,
      },
      {
        company: 'Kovai.co',
        role: 'Full Stack SaaS Engineer Intern',
        domain: 'Full Stack Development',
        desc: 'Work on Kovai.co enterprise cloud management product suite using React, Node.js, and Azure microservices.',
        reqSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'REST API'],
        prefSkills: ['TypeScript', 'Docker', 'GraphQL'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 22000, cgpa: 7.0,
      },
      {
        company: 'Kissflow',
        role: 'MERN Stack Developer Intern',
        domain: 'Full Stack Development',
        desc: 'Contribute to low-code workflow builders and high-throughput application pipelines using Node.js and React.',
        reqSkills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
        prefSkills: ['Next.js', 'PostgreSQL', 'TailwindCSS'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 24000, cgpa: 6.8,
      },
      {
        company: 'Razorpay Software',
        role: 'Fintech Full Stack Intern',
        domain: 'Full Stack Development',
        desc: 'Build merchant dashboard features and checkout integration flows with React, Node.js, and high-availability databases.',
        reqSkills: ['React', 'Node.js', 'JavaScript', 'REST API', 'SQL'],
        prefSkills: ['TypeScript', 'Redis', 'Kafka'],
        loc: 'Bangalore', mode: 'HYBRID', dur: '6 Months', stipend: 35000, cgpa: 7.5,
      },
      {
        company: 'Hasura Technologies',
        role: 'Full Stack GraphQL Developer Intern',
        domain: 'Full Stack Development',
        desc: 'Develop real-time web applications with GraphQL APIs, Node.js microservices, and React.',
        reqSkills: ['React', 'Node.js', 'GraphQL', 'JavaScript', 'PostgreSQL'],
        prefSkills: ['TypeScript', 'Docker'],
        loc: 'Bangalore', mode: 'REMOTE', dur: '6 Months', stipend: 32000, cgpa: 7.0,
      },
      {
        company: 'Zerodha Tech',
        role: 'Web Application Engineer Intern',
        domain: 'Full Stack Development',
        desc: 'Work on ultra-fast financial interfaces using modern web standards, Vue/React, and Python/Go backends.',
        reqSkills: ['JavaScript', 'React', 'Python', 'HTML', 'CSS', 'PostgreSQL'],
        prefSkills: ['Go', 'Redis', 'WebSockets'],
        loc: 'Bangalore', mode: 'HYBRID', dur: '6 Months', stipend: 30000, cgpa: 7.5,
      },
      {
        company: 'Guvi Geek Network',
        role: 'Interactive Learning Platform Developer Intern',
        domain: 'Full Stack Development',
        desc: 'Build gamified coding assessment environments and multilingual learning tools using React and Node.js.',
        reqSkills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
        prefSkills: ['Socket.IO', 'TailwindCSS'],
        loc: 'Chennai', mode: 'HYBRID', dur: '3 Months', stipend: 18000, cgpa: 6.5,
      },
      {
        company: 'Zenoti',
        role: 'Enterprise Web Application Intern',
        domain: 'Full Stack Development',
        desc: 'Build appointment scheduling and POS interfaces for global luxury spas and salons using React and Node.js.',
        reqSkills: ['React', 'JavaScript', 'Node.js', 'REST API', 'HTML', 'CSS'],
        prefSkills: ['TypeScript', 'SQL'],
        loc: 'Hyderabad', mode: 'HYBRID', dur: '6 Months', stipend: 25000, cgpa: 7.0,
      },
      {
        company: 'HighRadius',
        role: 'Full Stack Software Engineer Intern',
        domain: 'Full Stack Development',
        desc: 'Develop fintech dashboards and autonomous credit workflows with React, Java/Node.js, and relational databases.',
        reqSkills: ['React', 'Node.js', 'JavaScript', 'SQL', 'REST API'],
        prefSkills: ['Java', 'Docker'],
        loc: 'Hyderabad', mode: 'HYBRID', dur: '6 Months', stipend: 28000, cgpa: 7.0,
      },
      {
        company: 'WNS Vuram',
        role: 'Low-Code & Full Stack Intern',
        domain: 'Full Stack Development',
        desc: 'Develop enterprise workflow solutions integrating custom React portals with cloud backend databases.',
        reqSkills: ['React', 'JavaScript', 'Node.js', 'HTML', 'CSS', 'SQL'],
        prefSkills: ['REST API', 'Git'],
        loc: 'Madurai', mode: 'ON_SITE', dur: '3 Months', stipend: 16000, cgpa: 6.5,
      },
      {
        company: 'BankBazaar',
        role: 'Full Stack Web Intern',
        domain: 'Full Stack Development',
        desc: 'Engineer credit comparison pages and real-time loan approval workflows using React and Node.js.',
        reqSkills: ['React', 'Node.js', 'Express', 'JavaScript', 'MongoDB'],
        prefSkills: ['TypeScript', 'Redis'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 22000, cgpa: 6.8,
      },

      // ─── 2. AI & MACHINE LEARNING (11) ──────────────────────────
      {
        company: 'Darwinbox',
        role: 'AI & Machine Learning Intern',
        domain: 'AI & Machine Learning',
        desc: 'Build generative AI assistants for enterprise HR, talent matching algorithms, and predictive attrition models.',
        reqSkills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'NLP'],
        prefSkills: ['FastAPI', 'Pandas', 'LangChain'],
        loc: 'Hyderabad', mode: 'HYBRID', dur: '6 Months', stipend: 32000, cgpa: 7.5,
      },
      {
        company: 'LatentView Analytics',
        role: 'Machine Learning Engineer Intern',
        domain: 'AI & Machine Learning',
        desc: 'Develop predictive churn and demand forecasting models for global consumer brands using Python and PyTorch.',
        reqSkills: ['Python', 'Machine Learning', 'Scikit-Learn', 'Pandas', 'SQL'],
        prefSkills: ['Deep Learning', 'PyTorch', 'AWS'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 28000, cgpa: 7.2,
      },
      {
        company: 'HighRadius',
        role: 'AI Applied Scientist Intern',
        domain: 'AI & Machine Learning',
        desc: 'Research and deploy time-series forecasting and NLP models for automated invoice matching.',
        reqSkills: ['Python', 'Deep Learning', 'TensorFlow', 'NLP', 'Machine Learning'],
        prefSkills: ['Transformers', 'SQL'],
        loc: 'Hyderabad', mode: 'HYBRID', dur: '6 Months', stipend: 30000, cgpa: 7.5,
      },
      {
        company: 'Dr. Reddy’s Digital Labs',
        role: 'Bio-AI & Health Informatics Intern',
        domain: 'AI & Machine Learning',
        desc: 'Apply deep learning and NLP to biomedical literature, patient clinical trials, and drug interaction datasets.',
        reqSkills: ['Python', 'Machine Learning', 'PyTorch', 'Pandas', 'NLP'],
        prefSkills: ['Bioinformatics', 'TensorFlow'],
        loc: 'Hyderabad', mode: 'ON_SITE', dur: '6 Months', stipend: 26000, cgpa: 7.0,
      },
      {
        company: 'Freshworks Technologies',
        role: 'Conversational AI / NLP Intern',
        domain: 'AI & Machine Learning',
        desc: 'Train transformer models and LLM agent pipelines for Freshdesk Freddy AI customer support.',
        reqSkills: ['Python', 'NLP', 'Transformers', 'Machine Learning', 'PyTorch'],
        prefSkills: ['LangChain', 'FastAPI'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 35000, cgpa: 7.5,
      },
      {
        company: 'Guvi Geek Network',
        role: 'AI Lab & LLM Developer Intern',
        domain: 'AI & Machine Learning',
        desc: 'Develop AI code evaluation tools and automated student doubt-solving chatbots in vernacular languages.',
        reqSkills: ['Python', 'NLP', 'Machine Learning', 'FastAPI'],
        prefSkills: ['OpenAI API', 'HuggingFace'],
        loc: 'Chennai', mode: 'HYBRID', dur: '3 Months', stipend: 20000, cgpa: 7.0,
      },
      {
        company: 'Zenoti',
        role: 'Computer Vision & AI Analytics Intern',
        domain: 'AI & Machine Learning',
        desc: 'Develop computer vision models for salon inventory tracking and facial sentiment analysis.',
        reqSkills: ['Python', 'Computer Vision', 'OpenCV', 'PyTorch', 'Machine Learning'],
        prefSkills: ['TensorFlow', 'FastAPI'],
        loc: 'Hyderabad', mode: 'HYBRID', dur: '6 Months', stipend: 28000, cgpa: 7.0,
      },
      {
        company: 'Razorpay Software',
        role: 'Fraud Detection ML Intern',
        domain: 'AI & Machine Learning',
        desc: 'Train real-time anomaly detection and graph neural network models to stop payment frauds in milliseconds.',
        reqSkills: ['Python', 'Machine Learning', 'Scikit-Learn', 'Pandas', 'SQL'],
        prefSkills: ['Graph Neural Networks', 'PyTorch', 'Kafka'],
        loc: 'Bangalore', mode: 'HYBRID', dur: '6 Months', stipend: 40000, cgpa: 8.0,
      },
      {
        company: 'WayCool Foods',
        role: 'Computer Vision Crop Grading Intern',
        domain: 'AI & Machine Learning',
        desc: 'Build CNN models for automated fruit and vegetable quality inspection and shelf-life prediction.',
        reqSkills: ['Python', 'Computer Vision', 'OpenCV', 'Deep Learning', 'PyTorch'],
        prefSkills: ['TensorFlow Lite', 'Edge AI'],
        loc: 'Chennai', mode: 'ON_SITE', dur: '6 Months', stipend: 24000, cgpa: 7.0,
      },
      {
        company: 'Agnikul Cosmos',
        role: 'Trajectory AI & Flight Simulation Intern',
        domain: 'AI & Machine Learning',
        desc: 'Apply reinforcement learning and numerical optimization to rocket trajectory planning and aerodynamic models.',
        reqSkills: ['Python', 'Machine Learning', 'NumPy', 'SciPy', 'C++'],
        prefSkills: ['Reinforcement Learning', 'PyTorch'],
        loc: 'Chennai', mode: 'ON_SITE', dur: '6 Months', stipend: 30000, cgpa: 8.0,
      },
      {
        company: 'Kissflow',
        role: 'AI Process Automation Intern',
        domain: 'AI & Machine Learning',
        desc: 'Build AI-assisted workflow generation and intelligent document understanding features using LLMs.',
        reqSkills: ['Python', 'Machine Learning', 'NLP', 'FastAPI'],
        prefSkills: ['LangChain', 'Docker'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 25000, cgpa: 7.0,
      },

      // ─── 3. DATA SCIENCE & ANALYTICS (10) ───────────────────────
      {
        company: 'LatentView Analytics',
        role: 'Data Science & BI Intern',
        domain: 'Data Science & Analytics',
        desc: 'Transform raw multi-cloud enterprise data into executive Power BI / Tableau dashboards and predictive insights.',
        reqSkills: ['Python', 'SQL', 'Pandas', 'Power BI', 'Data Analysis'],
        prefSkills: ['Tableau', 'Scikit-Learn'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 24000, cgpa: 7.0,
      },
      {
        company: 'Zerodha Tech',
        role: 'Financial Data Analyst Intern',
        domain: 'Data Science & Analytics',
        desc: 'Analyze trading volume patterns, market microstructure, and regulatory compliance metrics across millions of trades.',
        reqSkills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Data Analysis'],
        prefSkills: ['Time Series', 'PostgreSQL'],
        loc: 'Bangalore', mode: 'HYBRID', dur: '6 Months', stipend: 28000, cgpa: 7.5,
      },
      {
        company: 'WayCool Foods',
        role: 'Agri-Supply Chain Analytics Intern',
        domain: 'Data Science & Analytics',
        desc: 'Build pricing forecasting algorithms, warehouse throughput models, and farmer crop yield analytics.',
        reqSkills: ['Python', 'SQL', 'Data Analysis', 'Pandas', 'Excel'],
        prefSkills: ['Tableau', 'Power BI'],
        loc: 'Chennai', mode: 'ON_SITE', dur: '6 Months', stipend: 20000, cgpa: 6.8,
      },
      {
        company: 'Dr. Reddy’s Digital Labs',
        role: 'Clinical Data Analytics Intern',
        domain: 'Data Science & Analytics',
        desc: 'Perform biostatistical analysis, survival analysis, and clinical trial cohort extraction using Python and SQL.',
        reqSkills: ['Python', 'SQL', 'Pandas', 'Data Analysis', 'Statistics'],
        prefSkills: ['R', 'Tableau'],
        loc: 'Hyderabad', mode: 'ON_SITE', dur: '6 Months', stipend: 25000, cgpa: 7.2,
      },
      {
        company: 'HighRadius',
        role: 'Data Analytics & Reporting Intern',
        domain: 'Data Science & Analytics',
        desc: 'Design automated financial dashboards and client cash flow visualizations with SQL and Power BI.',
        reqSkills: ['SQL', 'Data Analysis', 'Power BI', 'Excel', 'Python'],
        prefSkills: ['Tableau', 'Pandas'],
        loc: 'Hyderabad', mode: 'HYBRID', dur: '6 Months', stipend: 24000, cgpa: 6.8,
      },
      {
        company: 'BankBazaar',
        role: 'Credit Risk Data Analyst Intern',
        domain: 'Data Science & Analytics',
        desc: 'Evaluate applicant credit scores, risk segmentation, and conversion funnel analytics for leading Indian banks.',
        reqSkills: ['SQL', 'Python', 'Pandas', 'Data Analysis', 'Excel'],
        prefSkills: ['Tableau', 'Power BI'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 22000, cgpa: 6.8,
      },
      {
        company: 'Vivriti Capital',
        role: 'Quantitative Analytics Intern',
        domain: 'Data Science & Analytics',
        desc: 'Analyze enterprise loan portfolios, non-performing asset trends, and debt yield distributions.',
        reqSkills: ['Python', 'SQL', 'Financial Modelling', 'Data Analysis', 'Excel'],
        prefSkills: ['Power BI', 'Pandas'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 25000, cgpa: 7.2,
      },
      {
        company: 'Darwinbox',
        role: 'HR People Analytics Intern',
        domain: 'Data Science & Analytics',
        desc: 'Extract talent insights, employee engagement trends, and salary benchmarking datasets.',
        reqSkills: ['Python', 'SQL', 'Pandas', 'Data Analysis', 'Power BI'],
        prefSkills: ['Tableau', 'Statistics'],
        loc: 'Hyderabad', mode: 'HYBRID', dur: '6 Months', stipend: 26000, cgpa: 7.0,
      },
      {
        company: 'Kovai.co',
        role: 'Product Analytics Intern',
        domain: 'Data Science & Analytics',
        desc: 'Analyze SaaS telemetry data, feature adoption funnels, and churn probability for cloud monitoring products.',
        reqSkills: ['SQL', 'Python', 'Data Analysis', 'Google Analytics', 'Excel'],
        prefSkills: ['Power BI', 'Pandas'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '3 Months', stipend: 20000, cgpa: 6.8,
      },
      {
        company: 'Freshworks Technologies',
        role: 'Customer Journey Analytics Intern',
        domain: 'Data Science & Analytics',
        desc: 'Model enterprise customer lifecycle events, support ticket resolution velocity, and product usage cohorts.',
        reqSkills: ['Python', 'SQL', 'Data Analysis', 'Tableau', 'Pandas'],
        prefSkills: ['Snowflake', 'Power BI'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 28000, cgpa: 7.5,
      },

      // ─── 4. CLOUD & DEVOPS (10) ──────────────────────────────────
      {
        company: 'Postman Labs',
        role: 'Cloud Infrastructure & DevOps Intern',
        domain: 'Cloud & DevOps',
        desc: 'Build Kubernetes operators, automated Terraform IaC, and CI/CD pipelines supporting 30M+ developers.',
        reqSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux'],
        prefSkills: ['Go', 'Prometheus', 'Helm'],
        loc: 'Bangalore', mode: 'HYBRID', dur: '6 Months', stipend: 38000, cgpa: 7.5,
      },
      {
        company: 'Kissflow',
        role: 'Cloud & DevOps Engineer Intern',
        domain: 'Cloud & DevOps',
        desc: 'Maintain multi-tenant Kubernetes clusters on GCP and automate continuous delivery with ArgoCD and Helm.',
        reqSkills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Python', 'AWS'],
        prefSkills: ['GCP', 'Terraform'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 26000, cgpa: 7.0,
      },
      {
        company: 'Kovai.co',
        role: 'Azure Cloud Operations Intern',
        domain: 'Cloud & DevOps',
        desc: 'Manage Azure microservices, automate resource provisioning using ARM/Bicep templates, and build monitoring dashboards.',
        reqSkills: ['Docker', 'Azure', 'CI/CD', 'PowerShell', 'Linux'],
        prefSkills: ['Kubernetes', 'Terraform'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 24000, cgpa: 7.0,
      },
      {
        company: 'Hasura Technologies',
        role: 'Site Reliability Engineering (SRE) Intern',
        domain: 'Cloud & DevOps',
        desc: 'Build Prometheus/Grafana monitoring, automated zero-downtime database upgrades, and Kubernetes pods.',
        reqSkills: ['Kubernetes', 'Docker', 'Linux', 'AWS', 'Prometheus'],
        prefSkills: ['Go', 'Grafana', 'Terraform'],
        loc: 'Bangalore', mode: 'REMOTE', dur: '6 Months', stipend: 35000, cgpa: 7.2,
      },
      {
        company: 'Chargebee Technologies',
        role: 'DevOps & Infrastructure Intern',
        domain: 'Cloud & DevOps',
        desc: 'Automate AWS VPC networking, GitHub Actions pipelines, and Datadog observability across staging and production.',
        reqSkills: ['AWS', 'Docker', 'CI/CD', 'Linux', 'Python', 'Terraform'],
        prefSkills: ['Kubernetes', 'Bash'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 28000, cgpa: 7.0,
      },
      {
        company: 'Zenoti',
        role: 'Cloud Security & DevOps Intern',
        domain: 'Cloud & DevOps',
        desc: 'Implement container image scanning, AWS IAM least-privilege automation, and automated Jenkins pipelines.',
        reqSkills: ['AWS', 'Docker', 'CI/CD', 'Linux', 'Git', 'Jenkins'],
        prefSkills: ['Kubernetes', 'Python'],
        loc: 'Hyderabad', mode: 'HYBRID', dur: '6 Months', stipend: 25000, cgpa: 6.8,
      },
      {
        company: 'Freshworks Technologies',
        role: 'Platform Cloud Operations Intern',
        domain: 'Cloud & DevOps',
        desc: 'Scale distributed Kafka and Redis clusters on AWS EKS and optimize cloud computing expenditure.',
        reqSkills: ['AWS', 'Kubernetes', 'Docker', 'Linux', 'Python'],
        prefSkills: ['Terraform', 'Kafka'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 30000, cgpa: 7.5,
      },
      {
        company: 'Razorpay Software',
        role: 'Infrastructure & Kubernetes Intern',
        domain: 'Cloud & DevOps',
        desc: 'Engineer automated multi-region failover, Kubernetes mesh networking, and high-security compliance pipelines.',
        reqSkills: ['AWS', 'Kubernetes', 'Docker', 'Linux', 'CI/CD'],
        prefSkills: ['Golang', 'Istio', 'Terraform'],
        loc: 'Bangalore', mode: 'HYBRID', dur: '6 Months', stipend: 36000, cgpa: 7.5,
      },
      {
        company: 'Prodapt Solutions',
        role: 'Telecom Cloud Network Intern',
        domain: 'Cloud & DevOps',
        desc: 'Work on OpenStack, 5G Core virtualization, and automated cloud edge deployment scripts.',
        reqSkills: ['Linux', 'Docker', 'Python', 'Networking', 'AWS'],
        prefSkills: ['Kubernetes', 'Ansible'],
        loc: 'Chennai', mode: 'ON_SITE', dur: '6 Months', stipend: 22000, cgpa: 6.8,
      },
      {
        company: 'Cyient Technologies',
        role: 'Cloud Virtualization Intern',
        domain: 'Cloud & DevOps',
        desc: 'Deploy virtualized simulation environments and automated testing clusters on hybrid clouds.',
        reqSkills: ['Linux', 'Docker', 'Python', 'AWS', 'CI/CD'],
        prefSkills: ['Kubernetes', 'Bash'],
        loc: 'Hyderabad', mode: 'HYBRID', dur: '6 Months', stipend: 23000, cgpa: 6.8,
      },

      // ─── 5. EMBEDDED SYSTEMS & IOT (10) ─────────────────────────
      {
        company: 'Soliton Technologies',
        role: 'Embedded Firmware & IoT Intern',
        domain: 'Embedded Systems & IoT',
        desc: 'Program ARM Cortex microcontrollers, I2C/SPI interfaces, and real-time RTOS firmware for test instrumentation.',
        reqSkills: ['Embedded C', 'C++', 'RTOS', 'Microcontrollers', 'IoT'],
        prefSkills: ['Python', 'STM32', 'FreeRTOS'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 24000, cgpa: 7.5,
      },
      {
        company: 'Pricol Limited',
        role: 'Automotive Embedded Systems Intern',
        domain: 'Embedded Systems & IoT',
        desc: 'Develop CAN bus drivers, automotive sensor interfaces, and firmware for digital instrument clusters.',
        reqSkills: ['Embedded C', 'CAN Bus', 'Microcontrollers', 'IoT', 'C'],
        prefSkills: ['AUTOSAR', 'Python', 'PCB Design'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 20000, cgpa: 7.0,
      },
      {
        company: 'CRI Pumps R&D',
        role: 'IoT Smart Pump Controller Intern',
        domain: 'Embedded Systems & IoT',
        desc: 'Design LoRa/MQTT connected motor controllers and embedded water flow sensor telemetry circuits.',
        reqSkills: ['Embedded C', 'IoT', 'Arduino', 'Microcontrollers', 'Python'],
        prefSkills: ['MQTT', 'PCB Design'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 18000, cgpa: 6.8,
      },
      {
        company: 'Ather Energy',
        role: 'EV Telematics & Firmware Intern',
        domain: 'Embedded Systems & IoT',
        desc: 'Write low-latency Linux device drivers, CAN communications, and secure bootloader firmware for electric scooters.',
        reqSkills: ['C', 'C++', 'Embedded C', 'Linux', 'CAN Bus'],
        prefSkills: ['RTOS', 'ARM Cortex', 'Python'],
        loc: 'Bangalore', mode: 'ON_SITE', dur: '6 Months', stipend: 32000, cgpa: 7.5,
      },
      {
        company: 'Salzer Electronics',
        role: 'Smart Energy Metering Firmware Intern',
        domain: 'Embedded Systems & IoT',
        desc: 'Program microcontrollers for accurate kilowatt-hour power metering, RS485 communication, and tamper alerts.',
        reqSkills: ['Embedded C', 'Microcontrollers', 'IoT', 'C', 'RTOS'],
        prefSkills: ['MODBUS', 'PCB Design'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '3 Months', stipend: 16000, cgpa: 6.5,
      },
      {
        company: 'Craftsman Automation',
        role: 'Industrial IoT & PLC Automation Intern',
        domain: 'Embedded Systems & IoT',
        desc: 'Integrate edge computing gateways with factory floor CNC machinery, vibration sensors, and MQTT streams.',
        reqSkills: ['Embedded C', 'IoT', 'C', 'Microcontrollers', 'Python'],
        prefSkills: ['PLC', 'SCADA'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 19000, cgpa: 6.8,
      },
      {
        company: 'Titan Engineering & Automation',
        role: 'Robotics Embedded Controller Intern',
        domain: 'Embedded Systems & IoT',
        desc: 'Develop high-speed sensor acquisition firmware and motor servo control logic for automated assembly machines.',
        reqSkills: ['Embedded C', 'C++', 'RTOS', 'Microcontrollers', 'CAN Bus'],
        prefSkills: ['Robotics', 'STM32'],
        loc: 'Hosur', mode: 'ON_SITE', dur: '6 Months', stipend: 25000, cgpa: 7.2,
      },
      {
        company: 'Prodapt Solutions',
        role: 'Smart Connected Devices Intern',
        domain: 'Embedded Systems & IoT',
        desc: 'Build smart home IoT prototypes with BLE, Zigbee, and WiFi edge sensors transmitting to cloud gateways.',
        reqSkills: ['Embedded C', 'IoT', 'Python', 'Microcontrollers', 'C'],
        prefSkills: ['BLE', 'MQTT'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 20000, cgpa: 6.8,
      },
      {
        company: 'Agnikul Cosmos',
        role: 'Avionics Embedded Software Intern',
        domain: 'Embedded Systems & IoT',
        desc: 'Code radiation-hardened microcontrollers, telemetry transmission, and valve actuation systems.',
        reqSkills: ['C', 'C++', 'Embedded C', 'RTOS', 'Linux'],
        prefSkills: ['FreeRTOS', 'CAN Bus'],
        loc: 'Chennai', mode: 'ON_SITE', dur: '6 Months', stipend: 30000, cgpa: 8.0,
      },
      {
        company: 'Cyient Technologies',
        role: 'Embedded Hardware & Verification Intern',
        domain: 'Embedded Systems & IoT',
        desc: 'Perform hardware-in-the-loop (HIL) testing and driver validation for industrial microcontrollers.',
        reqSkills: ['Embedded C', 'Microcontrollers', 'C', 'Python', 'IoT'],
        prefSkills: ['LabVIEW', 'RTOS'],
        loc: 'Hyderabad', mode: 'ON_SITE', dur: '6 Months', stipend: 22000, cgpa: 6.8,
      },

      // ─── 6. ELECTRIC VEHICLE (EV) TECHNOLOGY (10) ───────────────
      {
        company: 'Ather Energy',
        role: 'Battery Management System (BMS) Intern',
        domain: 'Electric Vehicle (EV) Technology',
        desc: 'Model lithium-ion battery thermal propagation, State-of-Charge (SoC) algorithms, and cell balancing circuits.',
        reqSkills: ['MATLAB', 'Simulink', 'Embedded C', 'Battery Technology', 'Power Electronics'],
        prefSkills: ['Python', 'CAN Bus'],
        loc: 'Bangalore', mode: 'ON_SITE', dur: '6 Months', stipend: 32000, cgpa: 7.5,
      },
      {
        company: 'Pricol Limited',
        role: 'EV Powertrain Telematics Intern',
        domain: 'Electric Vehicle (EV) Technology',
        desc: 'Design EV instrument cluster telemetry for speed, regenerative braking, and real-time range estimation.',
        reqSkills: ['CAN Bus', 'Embedded C', 'Power Electronics', 'Microcontrollers'],
        prefSkills: ['MATLAB', 'IoT'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 22000, cgpa: 7.0,
      },
      {
        company: 'Salzer Electronics',
        role: 'EV DC Fast Charger Design Intern',
        domain: 'Electric Vehicle (EV) Technology',
        desc: 'Work on high-power AC-DC rectifiers, CCS2 charging protocol communications, and thermal management.',
        reqSkills: ['Power Electronics', 'MATLAB', 'PCB Design', 'Microcontrollers'],
        prefSkills: ['Simulink', 'Embedded C'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 20000, cgpa: 7.0,
      },
      {
        company: 'Titan Engineering & Automation',
        role: 'EV Battery Pack Automation Intern',
        domain: 'Electric Vehicle (EV) Technology',
        desc: 'Engineer robotic laser welding and automated battery cell assembly systems for EV manufacturers.',
        reqSkills: ['Automation', 'Mechanical Design', 'CAD', 'Robotics'],
        prefSkills: ['PLC', 'SolidWorks'],
        loc: 'Hosur', mode: 'ON_SITE', dur: '6 Months', stipend: 24000, cgpa: 7.0,
      },
      {
        company: 'Craftsman Automation',
        role: 'EV Aluminum Motor Housing Intern',
        domain: 'Electric Vehicle (EV) Technology',
        desc: 'Design lightweight aluminum motor casings and battery enclosures using advanced CNC & FEA simulations.',
        reqSkills: ['CAD', 'SolidWorks', 'FEA', 'Manufacturing', 'Mechanical Design'],
        prefSkills: ['ANSYS', 'AutoCAD'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 18000, cgpa: 6.8,
      },
      {
        company: 'Soliton Technologies',
        role: 'EV Inverter Test Automation Intern',
        domain: 'Electric Vehicle (EV) Technology',
        desc: 'Automate testing of motor drive inverters, regenerative braking simulations, and power transistor thermal limits.',
        reqSkills: ['Python', 'Power Electronics', 'Test Automation', 'MATLAB'],
        prefSkills: ['LabVIEW', 'Embedded C'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 24000, cgpa: 7.2,
      },
      {
        company: 'CRI Pumps R&D',
        role: 'Solar & EV Brushless DC Motor Intern',
        domain: 'Electric Vehicle (EV) Technology',
        desc: 'Simulate BLDC and PMSM motor drives, field-oriented control (FOC), and high-efficiency coils.',
        reqSkills: ['Power Electronics', 'MATLAB', 'Motor Drives', 'Simulink'],
        prefSkills: ['PCB Design', 'Embedded C'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 19000, cgpa: 7.0,
      },
      {
        company: 'Cyient Technologies',
        role: 'EV Power Electronics Simulation Intern',
        domain: 'Electric Vehicle (EV) Technology',
        desc: 'Perform electromagnetic and thermal simulations for high-voltage EV converters using ANSYS Maxwell.',
        reqSkills: ['MATLAB', 'Simulink', 'Power Electronics', 'ANSYS'],
        prefSkills: ['Thermal Simulation', 'Python'],
        loc: 'Hyderabad', mode: 'HYBRID', dur: '6 Months', stipend: 25000, cgpa: 7.0,
      },
      {
        company: 'Agnikul Cosmos',
        role: 'High-Density Electric Actuation Intern',
        domain: 'Electric Vehicle (EV) Technology',
        desc: 'Develop lightweight high-voltage battery packs and brushless motor servos for thrust vector control.',
        reqSkills: ['Power Electronics', 'Battery Technology', 'MATLAB', 'CAD'],
        prefSkills: ['SolidWorks', 'Embedded C'],
        loc: 'Chennai', mode: 'ON_SITE', dur: '6 Months', stipend: 28000, cgpa: 7.8,
      },
      {
        company: 'Prodapt Solutions',
        role: 'Smart EV Fleet Telematics Cloud Intern',
        domain: 'Electric Vehicle (EV) Technology',
        desc: 'Build cloud dashboards for real-time fleet battery health tracking, geofencing, and charging dispatch.',
        reqSkills: ['Python', 'IoT', 'REST API', 'Data Analysis', 'SQL'],
        prefSkills: ['AWS', 'React'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 22000, cgpa: 6.8,
      },

      // ─── 7. VLSI DESIGN & VERIFICATION (10) ─────────────────────
      {
        company: 'Soliton Technologies',
        role: 'VLSI Digital Verification Intern',
        domain: 'VLSI Design & Verification',
        desc: 'Write SystemVerilog and UVM testbenches for mixed-signal IC verification and post-silicon validation.',
        reqSkills: ['Verilog', 'SystemVerilog', 'UVM', 'Digital Design', 'Python'],
        prefSkills: ['VHDL', 'Perl'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 26000, cgpa: 7.5,
      },
      {
        company: 'Cyient Technologies',
        role: 'ASIC Physical Design Intern',
        domain: 'VLSI Design & Verification',
        desc: 'Work on floorplanning, place & route (P&R), clock tree synthesis, and static timing analysis (STA).',
        reqSkills: ['Verilog', 'Digital Design', 'VLSI', 'Static Timing Analysis'],
        prefSkills: ['Synopsys Tools', 'Tcl'],
        loc: 'Hyderabad', mode: 'ON_SITE', dur: '6 Months', stipend: 28000, cgpa: 7.5,
      },
      {
        company: 'Titan Engineering & Automation',
        role: 'FPGA Hardware Acceleration Intern',
        domain: 'VLSI Design & Verification',
        desc: 'Implement high-speed machine vision algorithms on Xilinx / Intel FPGAs using Vivado.',
        reqSkills: ['VHDL', 'Verilog', 'FPGA', 'Digital Design'],
        prefSkills: ['C++', 'Vivado'],
        loc: 'Hosur', mode: 'ON_SITE', dur: '6 Months', stipend: 25000, cgpa: 7.2,
      },
      {
        company: 'Pricol Limited',
        role: 'Automotive ASIC Verification Intern',
        domain: 'VLSI Design & Verification',
        desc: 'Verify safety-critical automotive sensor interfaces using SystemVerilog assertions.',
        reqSkills: ['Verilog', 'SystemVerilog', 'Digital Design', 'VLSI'],
        prefSkills: ['UVM', 'Python'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 22000, cgpa: 7.0,
      },
      {
        company: 'Salzer Electronics',
        role: 'FPGA Control Logic Intern',
        domain: 'VLSI Design & Verification',
        desc: 'Design high-speed PWM generators and protection logic on Spartan FPGAs for power equipment.',
        reqSkills: ['VHDL', 'Verilog', 'FPGA', 'Digital Design'],
        prefSkills: ['ModelSim', 'C'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '3 Months', stipend: 18000, cgpa: 6.8,
      },
      {
        company: 'Prodapt Solutions',
        role: '5G Baseband ASIC Modeling Intern',
        domain: 'VLSI Design & Verification',
        desc: 'Model DSP modem blocks and signal processing algorithms in SystemC and Verilog.',
        reqSkills: ['Verilog', 'MATLAB', 'Digital Design', 'DSP', 'VLSI'],
        prefSkills: ['SystemC', 'C++'],
        loc: 'Chennai', mode: 'ON_SITE', dur: '6 Months', stipend: 25000, cgpa: 7.0,
      },
      {
        company: 'Agnikul Cosmos',
        role: 'Radiation-Tolerant FPGA Intern',
        domain: 'VLSI Design & Verification',
        desc: 'Implement triple modular redundancy (TMR) architectures on flight-critical FPGAs.',
        reqSkills: ['Verilog', 'VHDL', 'FPGA', 'Digital Design'],
        prefSkills: ['SystemVerilog', 'Python'],
        loc: 'Chennai', mode: 'ON_SITE', dur: '6 Months', stipend: 28000, cgpa: 7.8,
      },
      {
        company: 'Ather Energy',
        role: 'Digital Logic & Motor Control FPGA Intern',
        domain: 'VLSI Design & Verification',
        desc: 'Implement field-oriented control state machines on custom FPGA hardware for ultra-responsive throttles.',
        reqSkills: ['Verilog', 'FPGA', 'Digital Design', 'MATLAB'],
        prefSkills: ['SystemVerilog', 'C'],
        loc: 'Bangalore', mode: 'ON_SITE', dur: '6 Months', stipend: 30000, cgpa: 7.5,
      },
      {
        company: 'Craftsman Automation',
        role: 'Embedded ASIC & Sensor Testing Intern',
        domain: 'VLSI Design & Verification',
        desc: 'Validate mixed-signal pressure and angle encoder chips on automated automated test fixtures.',
        reqSkills: ['Verilog', 'Digital Design', 'Python', 'Test Automation'],
        prefSkills: ['PCB Design', 'LabVIEW'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 20000, cgpa: 6.8,
      },
      {
        company: 'Kovai.co',
        role: 'Hardware Security Module (HSM) Intern',
        domain: 'VLSI Design & Verification',
        desc: 'Verify cryptographic acceleration logic (AES/RSA/ECC) for cloud hardware root-of-trust modules.',
        reqSkills: ['Verilog', 'Digital Design', 'Cryptography', 'Python'],
        prefSkills: ['SystemVerilog', 'C++'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 24000, cgpa: 7.2,
      },

      // ─── 8. ROBOTICS & AUTOMATION (10) ──────────────────────────
      {
        company: 'Titan Engineering & Automation',
        role: 'Industrial Robotics & Automation Intern',
        domain: 'Robotics & Automation',
        desc: 'Program 6-axis articulated robots (FANUC/KUKA), machine vision pick-and-place, and PLC safety interlocks.',
        reqSkills: ['Robotics', 'PLC', 'CAD', 'Automation', 'Python'],
        prefSkills: ['ROS', 'SolidWorks'],
        loc: 'Hosur', mode: 'ON_SITE', dur: '6 Months', stipend: 26000, cgpa: 7.2,
      },
      {
        company: 'Craftsman Automation',
        role: 'Robotic Welding & CNC Automation Intern',
        domain: 'Robotics & Automation',
        desc: 'Design robotic end-effectors, teach robot paths, and simulate automated material handling cells.',
        reqSkills: ['Robotics', 'SolidWorks', 'CAD', 'Manufacturing', 'Automation'],
        prefSkills: ['AutoCAD', 'PLC'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 21000, cgpa: 7.0,
      },
      {
        company: 'Agnikul Cosmos',
        role: 'Autonomous Rocket Guidance & Robotics Intern',
        domain: 'Robotics & Automation',
        desc: 'Develop guidance, navigation and control (GNC) algorithms and gimbal motor control systems in ROS 2.',
        reqSkills: ['ROS', 'C++', 'Python', 'Robotics', 'Control Systems'],
        prefSkills: ['MATLAB', 'Linux'],
        loc: 'Chennai', mode: 'ON_SITE', dur: '6 Months', stipend: 32000, cgpa: 8.0,
      },
      {
        company: 'CRI Pumps R&D',
        role: 'Factory Automation & SCADA Intern',
        domain: 'Robotics & Automation',
        desc: 'Automate pump impellor testing, assemble sensor jigs, and connect Siemens PLCs to SCADA monitors.',
        reqSkills: ['PLC', 'SCADA', 'Automation', 'Electrical Engineering'],
        prefSkills: ['CAD', 'Python'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 18000, cgpa: 6.8,
      },
      {
        company: 'Soliton Technologies',
        role: 'Robotic Test Automation Intern',
        domain: 'Robotics & Automation',
        desc: 'Build robotic handler arms for automated microchip IC socketing and thermal chamber insertion.',
        reqSkills: ['Robotics', 'Python', 'Automation', 'C++'],
        prefSkills: ['OpenCV', 'SolidWorks'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 24000, cgpa: 7.2,
      },
      {
        company: 'Pricol Limited',
        role: 'Automated Optical Inspection (AOI) Intern',
        domain: 'Robotics & Automation',
        desc: 'Program robotic cameras and AI vision inspection for high-speed PCB surface mount components.',
        reqSkills: ['Computer Vision', 'Python', 'Robotics', 'Automation'],
        prefSkills: ['OpenCV', 'PLC'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 20000, cgpa: 7.0,
      },
      {
        company: 'Ather Energy',
        role: 'Assembly Line Robotics Intern',
        domain: 'Robotics & Automation',
        desc: 'Optimize robotic torque tools, automated chassis transport AGVs, and production line telemetry at Hosur plant.',
        reqSkills: ['Robotics', 'Automation', 'Python', 'CAD', 'PLC'],
        prefSkills: ['ROS', 'SolidWorks'],
        loc: 'Bangalore', mode: 'ON_SITE', dur: '6 Months', stipend: 28000, cgpa: 7.5,
      },
      {
        company: 'Salzer Electronics',
        role: 'Assembly Automation Intern',
        domain: 'Robotics & Automation',
        desc: 'Design pneumatic jigs, bowl feeder mechanisms, and automated contact-riveting stations.',
        reqSkills: ['CAD', 'Automation', 'SolidWorks', 'Pneumatics'],
        prefSkills: ['PLC', 'AutoCAD'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '3 Months', stipend: 17000, cgpa: 6.5,
      },
      {
        company: 'Cyient Technologies',
        role: 'Robotic Simulation & ROS 2 Intern',
        domain: 'Robotics & Automation',
        desc: 'Simulate autonomous mobile robots (AMR) in Gazebo and optimize SLAM navigation in crowded environments.',
        reqSkills: ['ROS', 'C++', 'Python', 'Robotics', 'Linux'],
        prefSkills: ['Gazebo', 'OpenCV'],
        loc: 'Hyderabad', mode: 'HYBRID', dur: '6 Months', stipend: 25000, cgpa: 7.2,
      },
      {
        company: 'WNS Vuram',
        role: 'Robotic Process Automation (RPA) Intern',
        domain: 'Robotics & Automation',
        desc: 'Build enterprise software automation bots using UiPath and Python for invoice and claims processing.',
        reqSkills: ['Python', 'Automation', 'SQL', 'JavaScript'],
        prefSkills: ['UiPath', 'REST API'],
        loc: 'Madurai', mode: 'ON_SITE', dur: '3 Months', stipend: 16000, cgpa: 6.5,
      },

      // ─── 9. PRECISION AGRICULTURE & SMART FARMING (10) ──────────
      {
        company: 'WayCool Foods',
        role: 'Precision Agriculture IoT Intern',
        domain: 'Precision Agriculture & Smart Farming',
        desc: 'Deploy soil moisture probes, weather stations, and crop health models for smallholder Tamil Nadu farmers.',
        reqSkills: ['IoT', 'Python', 'Data Analysis', 'Agronomy Basics', 'Microcontrollers'],
        prefSkills: ['GIS', 'LoRaWAN'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 22000, cgpa: 6.8,
      },
      {
        company: 'CRI Pumps R&D',
        role: 'Solar Drip Irrigation Automation Intern',
        domain: 'Precision Agriculture & Smart Farming',
        desc: 'Engineer solar pump VFD inverters, automated fertigation valves, and mobile app controlled drip networks.',
        reqSkills: ['IoT', 'Power Electronics', 'Microcontrollers', 'Embedded C'],
        prefSkills: ['AutoCAD', 'Python'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 19000, cgpa: 6.8,
      },
      {
        company: 'Soliton Technologies',
        role: 'Smart Soil Sensor Telemetry Intern',
        domain: 'Precision Agriculture & Smart Farming',
        desc: 'Calibrate NPK soil sensors, pH probes, and long-range wireless nodes communicating with farm dashboards.',
        reqSkills: ['Embedded C', 'IoT', 'Python', 'Sensors'],
        prefSkills: ['Data Analysis', 'C++'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 22000, cgpa: 7.0,
      },
      {
        company: 'Salzer Electronics',
        role: 'Smart Agri-Feed Automation Intern',
        domain: 'Precision Agriculture & Smart Farming',
        desc: 'Design smart timers and phase monitors to protect agricultural borewell pumps from power surges.',
        reqSkills: ['Electrical Engineering', 'IoT', 'Microcontrollers', 'CAD'],
        prefSkills: ['PCB Design', 'Embedded C'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '3 Months', stipend: 16000, cgpa: 6.5,
      },
      {
        company: 'LatentView Analytics',
        role: 'Agri-Commodity Yield Forecasting Intern',
        domain: 'Precision Agriculture & Smart Farming',
        desc: 'Analyze satellite NDVI imagery and rainfall statistics to forecast Tamil Nadu paddy and sugarcane harvest.',
        reqSkills: ['Python', 'SQL', 'Data Analysis', 'GIS', 'Machine Learning'],
        prefSkills: ['Pandas', 'Remote Sensing'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 24000, cgpa: 7.2,
      },
      {
        company: 'Guvi Geek Network',
        role: 'AgriTech Vernacular Advisory Intern',
        domain: 'Precision Agriculture & Smart Farming',
        desc: 'Build voice-enabled Tamil agricultural advisory chatbots that answer crop disease queries using LLMs.',
        reqSkills: ['Python', 'NLP', 'JavaScript', 'REST API'],
        prefSkills: ['FastAPI', 'React'],
        loc: 'Chennai', mode: 'HYBRID', dur: '3 Months', stipend: 18000, cgpa: 6.5,
      },
      {
        company: 'Pricol Limited',
        role: 'Smart Tractor Telematics Intern',
        domain: 'Precision Agriculture & Smart Farming',
        desc: 'Develop tractor engine telematics, GPS area measurement, and fuel theft detection units.',
        reqSkills: ['CAN Bus', 'Embedded C', 'IoT', 'Microcontrollers'],
        prefSkills: ['Python', 'GPS Tracking'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 20000, cgpa: 7.0,
      },
      {
        company: 'Craftsman Automation',
        role: 'Harvester Machinery CAD Intern',
        domain: 'Precision Agriculture & Smart Farming',
        desc: 'Design sugarcane and paddy harvester cutting mechanisms and hydraulic lifts using SolidWorks.',
        reqSkills: ['CAD', 'SolidWorks', 'Mechanical Design', 'Manufacturing'],
        prefSkills: ['FEA', 'AutoCAD'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 18000, cgpa: 6.8,
      },
      {
        company: 'Titan Engineering & Automation',
        role: 'Agri Drone Payload Automation Intern',
        domain: 'Precision Agriculture & Smart Farming',
        desc: 'Design automated pesticide spray nozzles and LIDAR terrain-following mechanisms for agricultural drones.',
        reqSkills: ['CAD', 'Robotics', 'Python', 'Automation', 'SolidWorks'],
        prefSkills: ['ROS', 'Embedded C'],
        loc: 'Hosur', mode: 'ON_SITE', dur: '6 Months', stipend: 25000, cgpa: 7.2,
      },
      {
        company: 'Kissflow',
        role: 'Agri Supply Chain Workflow Intern',
        domain: 'Precision Agriculture & Smart Farming',
        desc: 'Build digital procurement forms, mandi price trackers, and cold storage inspection workflows on Kissflow.',
        reqSkills: ['JavaScript', 'HTML', 'CSS', 'Data Analysis', 'SQL'],
        prefSkills: ['REST API', 'React'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 20000, cgpa: 6.8,
      },

      // ─── 10. FINANCE & FINTECH (10) ─────────────────────────────
      {
        company: 'Razorpay Software',
        role: 'Fintech Backend & Payments Intern',
        domain: 'Finance & FinTech',
        desc: 'Build high-throughput payment gateway settlement engines, UPI auto-pay flows, and reconciliation APIs.',
        reqSkills: ['Python', 'SQL', 'REST API', 'Node.js', 'Finance Basics'],
        prefSkills: ['Go', 'PostgreSQL', 'Redis'],
        loc: 'Bangalore', mode: 'HYBRID', dur: '6 Months', stipend: 35000, cgpa: 7.5,
      },
      {
        company: 'Zerodha Tech',
        role: 'Algorithmic Trading & Ledger Intern',
        domain: 'Finance & FinTech',
        desc: 'Work on double-entry accounting engines, margin calculations, and real-time market data pipelines in Go/Python.',
        reqSkills: ['Python', 'SQL', 'PostgreSQL', 'Financial Modelling', 'Data Structures'],
        prefSkills: ['Go', 'Redis'],
        loc: 'Bangalore', mode: 'HYBRID', dur: '6 Months', stipend: 35000, cgpa: 8.0,
      },
      {
        company: 'Vivriti Capital',
        role: 'FinTech Quantitative Analyst Intern',
        domain: 'Finance & FinTech',
        desc: 'Build automated loan underwriting models, asset-backed securitization pricing, and cashflow waterfalls.',
        reqSkills: ['Financial Modelling', 'Python', 'Excel', 'SQL', 'Data Analysis'],
        prefSkills: ['Power BI', 'Statistics'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 26000, cgpa: 7.2,
      },
      {
        company: 'Intellect Design Arena',
        role: 'Digital Banking Core Intern',
        domain: 'Finance & FinTech',
        desc: 'Develop corporate treasury, international trade finance, and SWIFT messaging modules for major global banks.',
        reqSkills: ['Java', 'SQL', 'REST API', 'JavaScript', 'Finance Basics'],
        prefSkills: ['Spring Boot', 'React'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 24000, cgpa: 7.0,
      },
      {
        company: 'BankBazaar',
        role: 'Fintech Operations & Product Intern',
        domain: 'Finance & FinTech',
        desc: 'Optimize digital KYC verification, credit card application conversion, and bank API webhooks.',
        reqSkills: ['SQL', 'Excel', 'Python', 'Data Analysis', 'Finance Basics'],
        prefSkills: ['Power BI', 'REST API'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 22000, cgpa: 6.8,
      },
      {
        company: 'HighRadius',
        role: 'Autonomous Treasury & Cash Intern',
        domain: 'Finance & FinTech',
        desc: 'Build AI-driven cash flow forecasting algorithms and enterprise ERP bank reconciliation connectors.',
        reqSkills: ['Python', 'SQL', 'Data Analysis', 'Finance Basics', 'Machine Learning'],
        prefSkills: ['Java', 'Excel'],
        loc: 'Hyderabad', mode: 'HYBRID', dur: '6 Months', stipend: 28000, cgpa: 7.0,
      },
      {
        company: 'Chargebee Technologies',
        role: 'Billing & Tax Engine Intern',
        domain: 'Finance & FinTech',
        desc: 'Implement multi-currency exchange rate handling, automated VAT/GST rules, and global invoice generation.',
        reqSkills: ['JavaScript', 'Node.js', 'SQL', 'REST API', 'Finance Basics'],
        prefSkills: ['TypeScript', 'Java'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 27000, cgpa: 7.0,
      },
      {
        company: 'Freshworks Technologies',
        role: 'FinOps & Billing Systems Intern',
        domain: 'Finance & FinTech',
        desc: 'Optimize cloud infrastructure billing pipelines and multi-tenant quota accounting systems.',
        reqSkills: ['Python', 'SQL', 'AWS', 'Data Analysis', 'Excel'],
        prefSkills: ['Tableau', 'Node.js'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 28000, cgpa: 7.2,
      },
      {
        company: 'Darwinbox',
        role: 'Payroll & Statutory Compliance Intern',
        domain: 'Finance & FinTech',
        desc: 'Automate multi-country tax calculations, PF/ESI deductions, and salary disbursement pipelines.',
        reqSkills: ['SQL', 'Python', 'Excel', 'Finance Basics', 'Data Analysis'],
        prefSkills: ['REST API', 'JavaScript'],
        loc: 'Hyderabad', mode: 'HYBRID', dur: '6 Months', stipend: 24000, cgpa: 6.8,
      },
      {
        company: 'LatentView Analytics',
        role: 'Financial Risk Modeling Intern',
        domain: 'Finance & FinTech',
        desc: 'Build credit card default prediction and customer lifetime value models for international financial clients.',
        reqSkills: ['Python', 'Machine Learning', 'SQL', 'Pandas', 'Financial Modelling'],
        prefSkills: ['Tableau', 'Power BI'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 25000, cgpa: 7.2,
      },

      // ─── 11. CYBERSECURITY & ETHICAL HACKING (10) ───────────────
      {
        company: 'Razorpay Software',
        role: 'Application Security & PenTesting Intern',
        domain: 'Cybersecurity & Ethical Hacking',
        desc: 'Audit web and mobile APIs for OWASP Top 10 vulnerabilities, review source code, and run automated DAST tools.',
        reqSkills: ['Cybersecurity', 'Ethical Hacking', 'Networking', 'Python', 'Linux'],
        prefSkills: ['Burp Suite', 'OWASP', 'Penetration Testing'],
        loc: 'Bangalore', mode: 'HYBRID', dur: '6 Months', stipend: 36000, cgpa: 7.5,
      },
      {
        company: 'Intellect Design Arena',
        role: 'Banking Security & DevSecOps Intern',
        domain: 'Cybersecurity & Ethical Hacking',
        desc: 'Integrate SAST/DAST security scanning into CI/CD pipelines and implement PCI-DSS compliance controls.',
        reqSkills: ['Cybersecurity', 'Linux', 'Networking', 'Python', 'CI/CD'],
        prefSkills: ['SonarQube', 'Docker', 'OWASP'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 25000, cgpa: 7.0,
      },
      {
        company: 'BankBazaar',
        role: 'Information Security & SOC Analyst Intern',
        domain: 'Cybersecurity & Ethical Hacking',
        desc: 'Monitor security information and event management (SIEM) alerts, analyze phishing threats, and triage incidents.',
        reqSkills: ['Cybersecurity', 'Networking', 'Linux', 'Python'],
        prefSkills: ['Wireshark', 'Splunk'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 22000, cgpa: 6.8,
      },
      {
        company: 'Vivriti Capital',
        role: 'Fintech Cloud Security Intern',
        domain: 'Cybersecurity & Ethical Hacking',
        desc: 'Audit AWS IAM configurations, enforce KMS encryption key rotations, and review network security groups.',
        reqSkills: ['Cybersecurity', 'AWS', 'Linux', 'Networking', 'Python'],
        prefSkills: ['Terraform', 'CloudTrail'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 26000, cgpa: 7.2,
      },
      {
        company: 'Hasura Technologies',
        role: 'API Security & Zero-Trust Intern',
        domain: 'Cybersecurity & Ethical Hacking',
        desc: 'Evaluate role-based access control (RBAC), JWT token verification, and rate limiting in GraphQL gateways.',
        reqSkills: ['Cybersecurity', 'Networking', 'JavaScript', 'Python', 'Linux'],
        prefSkills: ['OAuth', 'GraphQL', 'Docker'],
        loc: 'Bangalore', mode: 'REMOTE', dur: '6 Months', stipend: 32000, cgpa: 7.2,
      },
      {
        company: 'Postman Labs',
        role: 'Security Automation Engineer Intern',
        domain: 'Cybersecurity & Ethical Hacking',
        desc: 'Build automated vulnerability regression suites and secret leakage scanners in GitHub repositories.',
        reqSkills: ['Python', 'Cybersecurity', 'Linux', 'Git', 'Networking'],
        prefSkills: ['Go', 'Docker'],
        loc: 'Bangalore', mode: 'HYBRID', dur: '6 Months', stipend: 35000, cgpa: 7.5,
      },
      {
        company: 'Freshworks Technologies',
        role: 'Threat Intelligence & Detection Intern',
        domain: 'Cybersecurity & Ethical Hacking',
        desc: 'Analyze intrusion attempts, develop automated OSINT honeypots, and conduct security reviews of production code.',
        reqSkills: ['Cybersecurity', 'Python', 'Linux', 'Networking', 'Ethical Hacking'],
        prefSkills: ['Bash', 'AWS'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 30000, cgpa: 7.5,
      },
      {
        company: 'Kovai.co',
        role: 'Infrastructure Security Intern',
        domain: 'Cybersecurity & Ethical Hacking',
        desc: 'Harden Azure virtual machines, review TLS cipher suites, and configure web application firewalls (WAF).',
        reqSkills: ['Cybersecurity', 'Azure', 'Linux', 'Networking', 'PowerShell'],
        prefSkills: ['Docker', 'Nmap'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 23000, cgpa: 7.0,
      },
      {
        company: 'Cyient Technologies',
        role: 'Embedded Hardware Security Intern',
        domain: 'Cybersecurity & Ethical Hacking',
        desc: 'Perform side-channel attack analysis and secure boot verification on microcontrollers.',
        reqSkills: ['Cybersecurity', 'Embedded C', 'Digital Design', 'Linux'],
        prefSkills: ['Cryptography', 'Python'],
        loc: 'Hyderabad', mode: 'ON_SITE', dur: '6 Months', stipend: 25000, cgpa: 7.2,
      },
      {
        company: 'Kissflow',
        role: 'SaaS Identity & Access Management (IAM) Intern',
        domain: 'Cybersecurity & Ethical Hacking',
        desc: 'Implement SAML 2.0 single sign-on, multi-factor authentication (MFA), and audit log security.',
        reqSkills: ['Cybersecurity', 'JavaScript', 'Networking', 'Python'],
        prefSkills: ['OAuth', 'REST API'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 24000, cgpa: 7.0,
      },

      // ─── 12. UI/UX DESIGN & FRONTEND (10) ───────────────────────
      {
        company: 'Freshworks Technologies',
        role: 'UI/UX Product Designer Intern',
        domain: 'UI/UX Design',
        desc: 'Design intuitive design systems, high-fidelity interactive prototypes in Figma, and conduct customer user testing.',
        reqSkills: ['Figma', 'UI/UX Design', 'User Research', 'Prototyping', 'Design Systems'],
        prefSkills: ['Adobe XD', 'HTML', 'CSS'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 28000, cgpa: 7.0,
      },
      {
        company: 'Chargebee Technologies',
        role: 'Product Design & Micro-Interactions Intern',
        domain: 'UI/UX Design',
        desc: 'Craft smooth checkout micro-interactions, responsive mobile billing views, and accessible typography hierarchies.',
        reqSkills: ['Figma', 'Prototyping', 'UI/UX Design', 'Wireframing'],
        prefSkills: ['Motion Design', 'TailwindCSS'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 26000, cgpa: 7.0,
      },
      {
        company: 'Kissflow',
        role: 'Visual Design & Design Systems Intern',
        domain: 'UI/UX Design',
        desc: 'Create scalable design tokens, icons, and low-code drag-and-drop component interfaces.',
        reqSkills: ['Figma', 'UI/UX Design', 'Design Systems', 'Illustrator'],
        prefSkills: ['HTML', 'CSS'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 24000, cgpa: 6.8,
      },
      {
        company: 'Kovai.co',
        role: 'SaaS UI/UX Designer Intern',
        domain: 'UI/UX Design',
        desc: 'Design complex cloud metrics dashboards, dark mode palettes, and information architecture for developer tools.',
        reqSkills: ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping'],
        prefSkills: ['Adobe XD', 'User Testing'],
        loc: 'Coimbatore', mode: 'ON_SITE', dur: '6 Months', stipend: 22000, cgpa: 7.0,
      },
      {
        company: 'Postman Labs',
        role: 'Developer Experience (DX) UI/UX Intern',
        domain: 'UI/UX Design',
        desc: 'Conduct usability studies with API developers, design query debuggers, and craft streamlined workflows.',
        reqSkills: ['Figma', 'UI/UX Design', 'User Research', 'Prototyping'],
        prefSkills: ['Design Systems', 'JavaScript'],
        loc: 'Bangalore', mode: 'HYBRID', dur: '6 Months', stipend: 35000, cgpa: 7.5,
      },
      {
        company: 'CRED Technologies',
        role: 'Motion Design & Product Experience Intern',
        domain: 'UI/UX Design',
        desc: 'Create award-winning mobile animations, 3D interactions, and gamified claim cards in Figma & After Effects.',
        reqSkills: ['Figma', 'UI/UX Design', 'Motion Design', 'Prototyping'],
        prefSkills: ['After Effects', 'Blender'],
        loc: 'Bangalore', mode: 'ON_SITE', dur: '6 Months', stipend: 38000, cgpa: 7.5,
      },
      {
        company: 'Darwinbox',
        role: 'Enterprise Mobile UX Intern',
        domain: 'UI/UX Design',
        desc: 'Redesign native iOS and Android mobile employee self-service flows for speed, accessibility, and delight.',
        reqSkills: ['Figma', 'UI/UX Design', 'Mobile Design', 'User Research'],
        prefSkills: ['Design Systems', 'Prototyping'],
        loc: 'Hyderabad', mode: 'HYBRID', dur: '6 Months', stipend: 25000, cgpa: 7.0,
      },
      {
        company: 'Guvi Geek Network',
        role: 'Gamified EdTech UI/UX Intern',
        domain: 'UI/UX Design',
        desc: 'Design engaging badges, leaderboard components, and code playground UX for young developers.',
        reqSkills: ['Figma', 'UI/UX Design', 'Illustration', 'Prototyping'],
        prefSkills: ['HTML', 'CSS'],
        loc: 'Chennai', mode: 'HYBRID', dur: '3 Months', stipend: 18000, cgpa: 6.5,
      },
      {
        company: 'BankBazaar',
        role: 'Conversion Funnel UI/UX Intern',
        domain: 'UI/UX Design',
        desc: 'Run A/B tests on credit card comparison forms, simplify financial terminology, and boost mobile completion.',
        reqSkills: ['Figma', 'UI/UX Design', 'Wireframing', 'User Research'],
        prefSkills: ['A/B Testing', 'Prototyping'],
        loc: 'Chennai', mode: 'HYBRID', dur: '6 Months', stipend: 21000, cgpa: 6.8,
      },
      {
        company: 'Zerodha Tech',
        role: 'Minimalist FinTech UX Intern',
        domain: 'UI/UX Design',
        desc: 'Design clutter-free candlestick chart views, order placement slips, and accessible stock market screens.',
        reqSkills: ['Figma', 'UI/UX Design', 'Prototyping', 'Design Systems'],
        prefSkills: ['Information Architecture', 'HTML'],
        loc: 'Bangalore', mode: 'HYBRID', dur: '6 Months', stipend: 32000, cgpa: 7.5,
      },
    ];

    const createdInternships = [];
    const internshipLookupByRole = {};

    for (const job of internshipsList) {
      const ind = industryMap[job.company];
      if (!ind) continue;

      const created = await Internship.create({
        industry: ind.profile._id,
        postedBy: ind.user._id,
        role: job.role,
        domain: job.domain,
        description: job.desc,
        requiredSkills: job.reqSkills,
        preferredSkills: job.prefSkills || [],
        experienceRequired: 'FRESHER',
        educationRequired: 'B.E / B.Tech / MCA / M.Sc / B.Sc in related discipline',
        location: job.loc,
        workMode: job.mode,
        duration: job.dur,
        stipend: job.stipend,
        stipendType: 'PER_MONTH',
        applicationDeadline: job.dur === '3 Months' ? oneMonthAhead : twoMonthsAhead,
        requiredCandidates:
          job.company === 'Freshworks Technologies'
            ? (job.role === 'Full Stack Web Developer Intern' ? 8 : (['Conversational AI / NLP Intern', 'Customer Journey Analytics Intern', 'Platform Cloud Operations Intern'].includes(job.role) ? 5 : 4))
            : 5,
        selectedCount: 0,
        applicationCount: 0,
        interviewRounds: [
          { roundNumber: 1, name: 'Online Technical Assessment', type: 'ONLINE_TEST', description: 'Domain MCQ & coding fundamentals' },
          { roundNumber: 2, name: 'Live Technical & Architecture', type: 'TECHNICAL', description: 'Deep technical problem solving & system walkthrough' },
          { roundNumber: 3, name: 'Managerial & HR Discussion', type: 'HR', description: 'Culture fit, career aspirations and offer discussion' },
        ],
        status: 'OPEN',
        perks: ['Certificate of Completion', 'Pre-Placement Offer (PPO)', 'Mentorship by Senior Engineers', 'Flexible Working Hours'],
        eligibilityCgpa: job.cgpa || 6.5,
      });

      createdInternships.push(created);
      internshipLookupByRole[`${job.company} - ${job.role}`] = created;
    }

    console.log(`✅ Successfully seeded ${createdInternships.length} internships across all 12 domains!`);

    // =========================================================
    // 🎓 4. STUDENTS (36 Students with authentic Tamil Nadu names)
    // Student #1 is ANU PRIYA S (with 8 applications in all tracker stages)
    // =========================================================
    console.log('🎓 Seeding 36 Tamil Nadu Students (30-50 count)...');

    const studentsData = [
      // 1. ANU PRIYA S — Primary Student with 8 diverse applications
      {
        name: 'Anu Priya S',
        email: 'anu@student.com',
        phone: '+919876543201',
        location: 'Chennai',
        college: 'College of Engineering, Guindy (Anna University)',
        degree: 'B.Tech',
        dept: 'Information Technology',
        cgpa: 8.85,
        gradYear: 2026,
        bio: 'Passionate full-stack developer and AI enthusiast from CEG Anna University, Chennai. SIH finalist with expertise in building scalable SaaS products and responsive web applications.',
        prefRole: 'Full Stack Developer',
        prefDomain: 'Full Stack Development',
        prefLoc: ['Chennai', 'Bangalore', 'Remote'],
        stipend: 25000,
        mode: 'HYBRID',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TypeScript', 'TailwindCSS', 'REST API', 'Git', 'Docker'],
        progLangs: ['JavaScript', 'TypeScript', 'Python', 'Java', 'SQL'],
        frameworks: ['React', 'Node.js', 'Express', 'Next.js', 'Tailwind'],
        tools: ['MongoDB', 'PostgreSQL', 'Docker', 'Git', 'Postman', 'Figma'],
        softSkills: ['Problem Solving', 'Team Collaboration', 'Communication', 'Fast Learner'],
        level: 'INTERMEDIATE',
        projects: [
          {
            title: 'EduCollaborate – Real-time Peer Learning Platform',
            description: 'Collaborative code editor and peer learning portal with React, Node.js, Socket.IO, and MongoDB.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Socket.IO', 'TailwindCSS'],
            githubLink: 'https://github.com/anupriya/educollaborate',
          },
          {
            title: 'Smart E-Commerce REST API Engine',
            description: 'High-throughput microservices backend with JWT auth, Redis caching, and MongoDB aggregation pipelines.',
            technologies: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Docker'],
            githubLink: 'https://github.com/anupriya/ecommerce-backend',
          },
        ],
        resumeName: 'AnuPriya_Resume_2026.pdf',
        resumeText: 'Anu Priya S. Full Stack Developer. React, Node.js, Express, MongoDB, TypeScript, JavaScript, Git, REST API. B.Tech IT, College of Engineering Guindy (Anna University). CGPA: 8.85.',
        resumeSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TypeScript', 'Git', 'REST API', 'TailwindCSS'],
      },
      // 2. Divya Priya S
      {
        name: 'Divya Priya S',
        email: 'divyapriya@student.com',
        phone: '+919876543202',
        location: 'Chennai',
        college: 'College of Engineering, Guindy (Anna University)',
        degree: 'B.Tech',
        dept: 'Information Technology',
        cgpa: 8.9,
        gradYear: 2026,
        bio: 'Full-stack developer from Chennai with deep expertise in React, Node.js and MongoDB. Active open-source contributor.',
        prefRole: 'Full Stack Developer',
        prefDomain: 'Full Stack Development',
        prefLoc: ['Chennai', 'Bangalore'],
        stipend: 22000,
        mode: 'HYBRID',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TailwindCSS', 'Git'],
        progLangs: ['JavaScript', 'Python', 'SQL'],
        frameworks: ['React', 'Express', 'Tailwind'],
        tools: ['MongoDB', 'Git', 'Postman'],
        softSkills: ['Analytical Mindset', 'Leadership'],
        level: 'INTERMEDIATE',
        projects: [
          {
            title: 'Campus Food Delivery Portal',
            description: 'On-demand food pre-ordering app with React and Node.js.',
            technologies: ['React', 'Node.js', 'MongoDB'],
            githubLink: 'https://github.com/divyapriya/campus-food',
          },
        ],
        resumeName: 'DivyaPriya_CV.pdf',
        resumeText: 'Divya Priya S. Full Stack Engineer. React, Node.js, MongoDB, JavaScript. CEG Anna University. CGPA 8.9.',
        resumeSkills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
      },
      // 3. Karthikeyan M
      {
        name: 'Karthikeyan M',
        email: 'karthikeyan@student.com',
        phone: '+919876543203',
        location: 'Coimbatore',
        college: 'PSG College of Technology, Coimbatore',
        degree: 'B.Tech',
        dept: 'Computer Science and Engineering',
        cgpa: 9.4,
        gradYear: 2026,
        bio: 'Machine Learning researcher and data enthusiast from PSG Tech Coimbatore, passionate about NLP and Computer Vision.',
        prefRole: 'AI / Machine Learning Engineer',
        prefDomain: 'AI & Machine Learning',
        prefLoc: ['Bangalore', 'Chennai', 'Remote'],
        stipend: 40000,
        mode: 'REMOTE',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-Learn', 'NLP', 'Computer Vision', 'Pandas'],
        progLangs: ['Python', 'C++', 'SQL'],
        frameworks: ['TensorFlow', 'PyTorch', 'FastAPI'],
        tools: ['Git', 'Docker', 'Jupyter'],
        softSkills: ['Analytical Thinking', 'Research Methodology'],
        level: 'INTERMEDIATE',
        projects: [
          {
            title: 'Biomedical Text Summarization with BERT',
            description: 'Fine-tuned HuggingFace Transformer models for extractive & abstractive clinical summaries.',
            technologies: ['Python', 'PyTorch', 'Transformers', 'FastAPI'],
            githubLink: 'https://github.com/karthikeyan/biomed-bert',
          },
        ],
        resumeName: 'Karthikeyan_M_AI.pdf',
        resumeText: 'Karthikeyan M. AI/ML Engineer. Python, PyTorch, TensorFlow, NLP, Deep Learning. PSG Tech. CGPA 9.4.',
        resumeSkills: ['Python', 'PyTorch', 'TensorFlow', 'NLP', 'Machine Learning'],
      },
      // 4. Anbazhagan R
      {
        name: 'Anbazhagan R',
        email: 'anbazhagan@student.com',
        phone: '+919876543204',
        location: 'Trichy',
        college: 'National Institute of Technology (NIT), Trichy',
        degree: 'B.Tech',
        dept: 'Computer Science',
        cgpa: 8.7,
        gradYear: 2026,
        bio: 'Cloud Architect & DevOps enthusiast from NIT Trichy, certified in AWS Solutions Architect. Passionate about Kubernetes.',
        prefRole: 'Cloud / DevOps Engineer',
        prefDomain: 'Cloud & DevOps',
        prefLoc: ['Hyderabad', 'Bangalore', 'Chennai'],
        stipend: 35000,
        mode: 'REMOTE',
        skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Python'],
        progLangs: ['Python', 'Bash', 'Go'],
        frameworks: ['FastAPI'],
        tools: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Git'],
        softSkills: ['Collaboration', 'Agile Methodologies'],
        level: 'INTERMEDIATE',
        projects: [
          {
            title: 'Multi-Region Kubernetes Cluster Automation',
            description: 'Automated infrastructure as code with Terraform on AWS EKS.',
            technologies: ['AWS', 'Terraform', 'Kubernetes', 'Docker'],
            githubLink: 'https://github.com/anbazhagan/k8s-terraform',
          },
        ],
        resumeName: 'Anbazhagan_R_DevOps.pdf',
        resumeText: 'Anbazhagan R. DevOps Engineer. AWS, Docker, Kubernetes, Terraform, CI/CD. NIT Trichy. CGPA 8.7.',
        resumeSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux'],
      },
      // 5. Kavitha Lakshmi N
      {
        name: 'Kavitha Lakshmi N',
        email: 'kavitha@student.com',
        phone: '+919876543205',
        location: 'Madurai',
        college: 'Madura College of Engineering, Madurai',
        degree: 'B.E',
        dept: 'Computer Science and Engineering',
        cgpa: 8.5,
        gradYear: 2026,
        bio: 'Data Science and Business Intelligence enthusiast from Madurai, specialised in statistical modelling and Power BI.',
        prefRole: 'Data Analyst / BI Engineer',
        prefDomain: 'Data Science & Analytics',
        prefLoc: ['Chennai', 'Coimbatore'],
        stipend: 18000,
        mode: 'ON_SITE',
        skills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Data Analysis', 'Tableau', 'Power BI'],
        progLangs: ['Python', 'SQL', 'R'],
        frameworks: ['Flask', 'Scikit-Learn'],
        tools: ['Tableau', 'Power BI', 'Excel', 'Jupyter', 'Git'],
        softSkills: ['Data Storytelling', 'Critical Thinking'],
        level: 'BEGINNER',
        projects: [
          {
            title: 'Retail Sales Forecasting with ARIMA',
            description: 'Time-series forecasting model for weekly retail demand.',
            technologies: ['Python', 'Pandas', 'Tableau'],
            githubLink: 'https://github.com/kavitha/retail-forecast',
          },
        ],
        resumeName: 'Kavitha_DataAnalyst.pdf',
        resumeText: 'Kavitha Lakshmi N. Data Analyst. Python, SQL, Pandas, Tableau, Power BI. CGPA 8.5.',
        resumeSkills: ['Python', 'SQL', 'Pandas', 'Tableau', 'Power BI', 'Data Analysis'],
      },
      // 6. Murugesan T
      {
        name: 'Murugesan T',
        email: 'murugesan@student.com',
        phone: '+919876543206',
        location: 'Hosur',
        college: 'Thiagarajar College of Engineering, Madurai',
        degree: 'B.E',
        dept: 'Electronics and Communication Engineering',
        cgpa: 8.2,
        gradYear: 2026,
        bio: 'Embedded Systems and IoT engineer from TCE Madurai skilled in RTOS, CAN bus, and motor controllers.',
        prefRole: 'Embedded Systems / IoT Engineer',
        prefDomain: 'Embedded Systems & IoT',
        prefLoc: ['Hosur', 'Chennai', 'Coimbatore'],
        stipend: 18000,
        mode: 'ON_SITE',
        skills: ['Embedded C', 'Arduino', 'Raspberry Pi', 'RTOS', 'CAN Bus', 'PCB Design', 'IoT', 'Python'],
        progLangs: ['C', 'Embedded C', 'Python'],
        frameworks: ['FreeRTOS'],
        tools: ['STM32CubeIDE', 'Git', 'Eagle PCB'],
        softSkills: ['Attention to Detail', 'Prototyping'],
        level: 'BEGINNER',
        projects: [
          {
            title: 'CAN Bus Fleet Monitoring System for Tractors',
            description: 'Real-time telemetry logging using STM32 and Raspberry Pi.',
            technologies: ['Embedded C', 'STM32', 'CAN Bus', 'Python'],
            githubLink: 'https://github.com/murugesan/canbus-logger',
          },
        ],
        resumeName: 'Murugesan_Embedded.pdf',
        resumeText: 'Murugesan T. Embedded Systems Engineer. Embedded C, CAN Bus, RTOS, IoT. TCE Madurai. CGPA 8.2.',
        resumeSkills: ['Embedded C', 'CAN Bus', 'RTOS', 'IoT', 'Python'],
      },
      // 7. Nithyashri P
      {
        name: 'Nithyashri P',
        email: 'nithyashri@student.com',
        phone: '+919876543207',
        location: 'Tirunelveli',
        college: 'Manonmaniam Sundaranar University, Tirunelveli',
        degree: 'B.Sc',
        dept: 'Computer Science',
        cgpa: 8.8,
        gradYear: 2026,
        bio: 'UI/UX designer and frontend developer specialising in Figma product design and React user interfaces.',
        prefRole: 'UI/UX Designer',
        prefDomain: 'UI/UX Design',
        prefLoc: ['Chennai', 'Bangalore', 'Remote'],
        stipend: 18000,
        mode: 'HYBRID',
        skills: ['Figma', 'Adobe XD', 'React', 'JavaScript', 'HTML', 'CSS', 'TailwindCSS'],
        progLangs: ['JavaScript', 'HTML', 'CSS'],
        frameworks: ['React', 'Tailwind'],
        tools: ['Figma', 'Adobe XD', 'Git'],
        softSkills: ['Visual Storytelling', 'Empathy'],
        level: 'BEGINNER',
        projects: [
          {
            title: 'SunNXT Redesign – OTT Concept',
            description: 'Redesigned media streaming platform with accessible components.',
            technologies: ['Figma', 'Prototyping'],
            githubLink: 'https://github.com/nithyashri/design-system',
          },
        ],
        resumeName: 'Nithyashri_UIUX.pdf',
        resumeText: 'Nithyashri P. UI/UX Designer. Figma, Adobe XD, React, HTML, CSS. CGPA 8.8.',
        resumeSkills: ['Figma', 'Adobe XD', 'React', 'HTML', 'CSS', 'TailwindCSS'],
      },
      // 8. Govindarajan S
      {
        name: 'Govindarajan S',
        email: 'govindarajan@student.com',
        phone: '+919876543208',
        location: 'Karur',
        college: 'Government College of Arts, Karur',
        degree: 'B.Com',
        dept: 'Commerce with Computer Applications',
        cgpa: 7.8,
        gradYear: 2026,
        bio: 'Fintech and accounting automation enthusiast from Karur skilled in financial modeling and regulatory compliance.',
        prefRole: 'Fintech / Banking Operations Analyst',
        prefDomain: 'Finance & FinTech',
        prefLoc: ['Karur', 'Chennai', 'Hyderabad'],
        stipend: 15000,
        mode: 'ON_SITE',
        skills: ['Python', 'SQL', 'Excel', 'Tally', 'Power BI', 'Financial Modelling', 'Accounting'],
        progLangs: ['Python', 'SQL'],
        frameworks: ['Pandas'],
        tools: ['Excel', 'Power BI', 'Tally ERP'],
        softSkills: ['Numerical Aptitude', 'Communication'],
        level: 'BEGINNER',
        projects: [
          {
            title: 'Automated GST Reconciliation Tool',
            description: 'Python tool comparing purchase registers with tax portals.',
            technologies: ['Python', 'Pandas', 'Excel'],
            githubLink: 'https://github.com/govindarajan/gst-tool',
          },
        ],
        resumeName: 'Govindarajan_Finance.pdf',
        resumeText: 'Govindarajan S. Finance Analyst. Python, SQL, Excel, Financial Modelling. CGPA 7.8.',
        resumeSkills: ['Python', 'SQL', 'Excel', 'Power BI', 'Financial Modelling'],
      },
      // 9. Vigneshwaran K
      {
        name: 'Vigneshwaran K',
        email: 'vigneshwaran@student.com',
        phone: '+919876543209',
        location: 'Chennai',
        college: 'SSN College of Engineering, Chennai',
        degree: 'B.Tech',
        dept: 'Artificial Intelligence & Data Science',
        cgpa: 9.1,
        gradYear: 2026,
        bio: 'Deep learning specialist from SSN Chennai building transformer models for speech and vision applications.',
        prefRole: 'AI / Machine Learning Engineer',
        prefDomain: 'AI & Machine Learning',
        prefLoc: ['Chennai', 'Bangalore'],
        stipend: 30000,
        mode: 'HYBRID',
        skills: ['Python', 'PyTorch', 'TensorFlow', 'NLP', 'Computer Vision', 'FastAPI'],
        progLangs: ['Python', 'C++'],
        frameworks: ['PyTorch', 'FastAPI'],
        tools: ['Docker', 'Git', 'Jupyter'],
        softSkills: ['Critical Analysis', 'Presentation'],
        level: 'INTERMEDIATE',
        projects: [
          {
            title: 'Tamil Speech Recognition with Whisper',
            description: 'Fine-tuned OpenAI Whisper for regional Tamil dialects.',
            technologies: ['Python', 'PyTorch', 'Whisper'],
            githubLink: 'https://github.com/vigneshwaran/tamil-asr',
          },
        ],
        resumeName: 'Vigneshwaran_AI.pdf',
        resumeText: 'Vigneshwaran K. AI Engineer. PyTorch, NLP, Computer Vision. SSN College. CGPA 9.1.',
        resumeSkills: ['Python', 'PyTorch', 'TensorFlow', 'NLP', 'Computer Vision'],
      },
      // 10. Soundarya M
      {
        name: 'Soundarya M',
        email: 'soundarya@student.com',
        phone: '+919876543210',
        location: 'Coimbatore',
        college: 'Coimbatore Institute of Technology (CIT)',
        degree: 'B.E',
        dept: 'Electrical and Electronics Engineering',
        cgpa: 8.6,
        gradYear: 2026,
        bio: 'Power electronics and electric vehicle powertrain enthusiast from CIT Coimbatore.',
        prefRole: 'EV Battery & Powertrain Engineer',
        prefDomain: 'Electric Vehicle (EV) Technology',
        prefLoc: ['Coimbatore', 'Bangalore', 'Hosur'],
        stipend: 22000,
        mode: 'ON_SITE',
        skills: ['Power Electronics', 'MATLAB', 'Simulink', 'Battery Technology', 'Embedded C'],
        progLangs: ['C', 'MATLAB'],
        frameworks: ['Simulink'],
        tools: ['MATLAB', 'Proteus'],
        softSkills: ['Problem Solving', 'Team Player'],
        level: 'INTERMEDIATE',
        projects: [
          {
            title: 'Active Cell Balancing for EV Lithium Battery',
            description: 'Simulation of buck-boost converter cell balancing circuit in MATLAB Simulink.',
            technologies: ['MATLAB', 'Simulink', 'Power Electronics'],
            githubLink: 'https://github.com/soundarya/bms-sim',
          },
        ],
        resumeName: 'Soundarya_EV_Resume.pdf',
        resumeText: 'Soundarya M. EV Powertrain Engineer. MATLAB, Power Electronics, Simulink, BMS. CIT. CGPA 8.6.',
        resumeSkills: ['Power Electronics', 'MATLAB', 'Simulink', 'Battery Technology'],
      },
      // 11. Harish Kumar S
      {
        name: 'Harish Kumar S',
        email: 'harish@student.com',
        phone: '+919876543211',
        location: 'Coimbatore',
        college: 'Kumaraguru College of Technology, Coimbatore',
        degree: 'B.E',
        dept: 'Mechanical Engineering',
        cgpa: 8.3,
        gradYear: 2026,
        bio: 'CAD/CAM product designer skilled in SolidWorks, finite element analysis, and CNC tooling.',
        prefRole: 'Robotics & Mechanical CAD Designer',
        prefDomain: 'Robotics & Automation',
        prefLoc: ['Coimbatore', 'Hosur', 'Chennai'],
        stipend: 18000,
        mode: 'ON_SITE',
        skills: ['CAD', 'SolidWorks', 'FEA', 'Mechanical Design', 'Manufacturing', 'AutoCAD'],
        progLangs: ['Python'],
        frameworks: ['SolidWorks', 'ANSYS'],
        tools: ['SolidWorks', 'ANSYS', 'AutoCAD'],
        softSkills: ['Attention to Detail', 'Hard Working'],
        level: 'INTERMEDIATE',
        projects: [
          {
            title: 'Design of 4-DoF SCARA Robotic Arm',
            description: 'Kinematics analysis and structural stress testing of robotic assembly arm.',
            technologies: ['SolidWorks', 'ANSYS'],
            githubLink: 'https://github.com/harish/scara-arm',
          },
        ],
        resumeName: 'Harish_Mechanical.pdf',
        resumeText: 'Harish Kumar S. CAD Designer. SolidWorks, FEA, Mechanical Design. Kumaraguru. CGPA 8.3.',
        resumeSkills: ['CAD', 'SolidWorks', 'FEA', 'Mechanical Design', 'Manufacturing'],
      },
      // 12. Pavithra Devi R
      {
        name: 'Pavithra Devi R',
        email: 'pavithra@student.com',
        phone: '+919876543212',
        location: 'Thanjavur',
        college: 'SASTRA Deemed University, Thanjavur',
        degree: 'B.Tech',
        dept: 'Biotechnology & Agriculture Technology',
        cgpa: 8.9,
        gradYear: 2026,
        bio: 'Smart agriculture and precision farming researcher from SASTRA Thanjavur integrating IoT soil telemetry.',
        prefRole: 'Precision Agriculture Specialist',
        prefDomain: 'Precision Agriculture & Smart Farming',
        prefLoc: ['Chennai', 'Coimbatore', 'Thanjavur'],
        stipend: 20000,
        mode: 'HYBRID',
        skills: ['IoT', 'Data Analysis', 'Python', 'Agronomy Basics', 'GIS'],
        progLangs: ['Python', 'R'],
        frameworks: ['Pandas'],
        tools: ['QGIS', 'Excel', 'Jupyter'],
        softSkills: ['Research Documentation', 'Field Work'],
        level: 'INTERMEDIATE',
        projects: [
          {
            title: 'Cauvery Delta Drip Irrigation Automation',
            description: 'Soil moisture threshold sensor network with SMS alert system for farmers.',
            technologies: ['IoT', 'Python', 'Arduino'],
            githubLink: 'https://github.com/pavithra/cauvery-drip',
          },
        ],
        resumeName: 'Pavithra_AgriTech.pdf',
        resumeText: 'Pavithra Devi R. AgriTech Specialist. IoT, Python, GIS, Precision Farming. SASTRA. CGPA 8.9.',
        resumeSkills: ['IoT', 'Data Analysis', 'Python', 'Agronomy Basics'],
      },
      // 13. Saravanan P
      {
        name: 'Saravanan P',
        email: 'saravanan@student.com',
        phone: '+919876543213',
        location: 'Chennai',
        college: 'Madras Institute of Technology (MIT Chromepet)',
        degree: 'B.E',
        dept: 'Robotics and Automation',
        cgpa: 8.75,
        gradYear: 2026,
        bio: 'Robotics engineer from MIT Chromepet experienced in ROS, autonomous navigation, and computer vision.',
        prefRole: 'Robotics Engineer',
        prefDomain: 'Robotics & Automation',
        prefLoc: ['Chennai', 'Hosur', 'Bangalore'],
        stipend: 25000,
        mode: 'ON_SITE',
        skills: ['Robotics', 'ROS', 'Python', 'C++', 'Computer Vision', 'OpenCV', 'Linux'],
        progLangs: ['C++', 'Python'],
        frameworks: ['ROS 2', 'OpenCV'],
        tools: ['Gazebo', 'Linux', 'Git'],
        softSkills: ['Analytical Thinking', 'Problem Solving'],
        level: 'INTERMEDIATE',
        projects: [
          {
            title: 'Autonomous Mobile Robot with LiDAR SLAM',
            description: 'Warehouse mapping and collision avoidance using ROS 2 Navigation stack.',
            technologies: ['ROS 2', 'C++', 'LiDAR', 'Python'],
            githubLink: 'https://github.com/saravanan/amr-slam',
          },
        ],
        resumeName: 'Saravanan_Robotics.pdf',
        resumeText: 'Saravanan P. Robotics Engineer. ROS 2, C++, Python, LiDAR, SLAM. MIT Anna University. CGPA 8.75.',
        resumeSkills: ['Robotics', 'ROS', 'Python', 'C++', 'Computer Vision', 'Linux'],
      },
      // 14. Sneha R
      {
        name: 'Sneha R',
        email: 'sneha@student.com',
        phone: '+919876543214',
        location: 'Coimbatore',
        college: 'Government College of Technology (GCT Coimbatore)',
        degree: 'B.Tech',
        dept: 'Information Technology',
        cgpa: 8.95,
        gradYear: 2026,
        bio: 'Cloud security and full stack developer from GCT Coimbatore with strong foundation in REST API security and React.',
        prefRole: 'Full Stack Developer',
        prefDomain: 'Full Stack Development',
        prefLoc: ['Coimbatore', 'Chennai', 'Bangalore'],
        stipend: 22000,
        mode: 'HYBRID',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'REST API', 'Cybersecurity'],
        progLangs: ['JavaScript', 'Python', 'Java'],
        frameworks: ['React', 'Node.js', 'Express'],
        tools: ['MongoDB', 'Postman', 'Git'],
        softSkills: ['Communication', 'Fast Learner'],
        level: 'INTERMEDIATE',
        projects: [
          {
            title: 'Secure Health Record Vault',
            description: 'AES-256 encrypted patient medical locker with role-based access.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
            githubLink: 'https://github.com/sneha/health-vault',
          },
        ],
        resumeName: 'Sneha_R_Resume.pdf',
        resumeText: 'Sneha R. Full Stack Engineer. React, Node.js, Express, MongoDB. GCT Coimbatore. CGPA 8.95.',
        resumeSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript'],
      },
      // 15. Vetrivel M
      {
        name: 'Vetrivel M',
        email: 'vetrivel@student.com',
        phone: '+919876543215',
        location: 'Erode',
        college: 'Bannari Amman Institute of Technology, Sathyamangalam',
        degree: 'B.E',
        dept: 'Electronics and Communication Engineering',
        cgpa: 8.4,
        gradYear: 2026,
        bio: 'VLSI design enthusiast skilled in Verilog, SystemVerilog, FPGA prototyping, and digital synthesis.',
        prefRole: 'VLSI Verification Engineer',
        prefDomain: 'VLSI Design & Verification',
        prefLoc: ['Coimbatore', 'Hyderabad', 'Bangalore'],
        stipend: 22000,
        mode: 'ON_SITE',
        skills: ['Verilog', 'SystemVerilog', 'Digital Design', 'VLSI', 'FPGA', 'VHDL'],
        progLangs: ['Verilog', 'C', 'Python'],
        frameworks: ['Vivado', 'ModelSim'],
        tools: ['ModelSim', 'Xilinx Vivado', 'Git'],
        softSkills: ['Problem Solving', 'Patience'],
        level: 'INTERMEDIATE',
        projects: [
          {
            title: 'Design of 32-bit RISC-V Processor Core',
            description: 'Single-cycle RISC-V integer instruction set core implemented in Verilog HDL.',
            technologies: ['Verilog', 'ModelSim', 'FPGA'],
            githubLink: 'https://github.com/vetrivel/riscv-core',
          },
        ],
        resumeName: 'Vetrivel_VLSI.pdf',
        resumeText: 'Vetrivel M. VLSI Engineer. Verilog, SystemVerilog, FPGA, Digital Design. Bannari Amman. CGPA 8.4.',
        resumeSkills: ['Verilog', 'SystemVerilog', 'Digital Design', 'VLSI', 'FPGA'],
      },
      // 16. Kausalya T
      {
        name: 'Kausalya T',
        email: 'kausalya@student.com',
        phone: '+919876543216',
        location: 'Erode',
        college: 'Kongu Engineering College, Perundurai',
        degree: 'B.Tech',
        dept: 'Food Technology & AgriTech',
        cgpa: 8.1,
        gradYear: 2026,
        bio: 'Food processing technology and smart agricultural packaging student from Kongu Engineering College.',
        prefRole: 'AgriTech Quality Engineer',
        prefDomain: 'Precision Agriculture & Smart Farming',
        prefLoc: ['Coimbatore', 'Chennai', 'Erode'],
        stipend: 16000,
        mode: 'ON_SITE',
        skills: ['Data Analysis', 'IoT', 'Python', 'Agronomy Basics', 'Excel'],
        progLangs: ['Python'],
        frameworks: ['Pandas'],
        tools: ['Excel', 'Jupyter'],
        softSkills: ['Attention to Detail', 'Dedication'],
        level: 'BEGINNER',
        projects: [
          {
            title: 'Smart Cold Storage Gas Telemetry',
            description: 'Ethylene gas sensor monitoring system for fruit ripening control.',
            technologies: ['IoT', 'Arduino', 'Python'],
            githubLink: 'https://github.com/kausalya/cold-storage',
          },
        ],
        resumeName: 'Kausalya_FoodAgri.pdf',
        resumeText: 'Kausalya T. Food Technology & AgriTech. IoT, Python, Data Analysis. Kongu Engineering. CGPA 8.1.',
        resumeSkills: ['IoT', 'Data Analysis', 'Python', 'Agronomy Basics'],
      },
      // 17. Dinesh Kumar B
      {
        name: 'Dinesh Kumar B',
        email: 'dinesh@student.com',
        phone: '+919876543217',
        location: 'Sivakasi',
        college: 'Mepco Schlenk Engineering College, Sivakasi',
        degree: 'B.Tech',
        dept: 'Computer Science and Engineering',
        cgpa: 7.9,
        gradYear: 2026,
        bio: 'Cloud deployment and Linux infrastructure enthusiast from Mepco Schlenk Sivakasi.',
        prefRole: 'Cloud / DevOps Engineer',
        prefDomain: 'Cloud & DevOps',
        prefLoc: ['Chennai', 'Madurai', 'Bangalore'],
        stipend: 20000,
        mode: 'HYBRID',
        skills: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'CI/CD', 'Git'],
        progLangs: ['Python', 'Bash'],
        frameworks: ['Flask'],
        tools: ['Docker', 'AWS', 'Git', 'Jenkins'],
        softSkills: ['Teamwork', 'Reliability'],
        level: 'BEGINNER',
        projects: [
          {
            title: 'Automated CI/CD Pipeline with GitHub Actions',
            description: 'Zero-downtime deployment script targeting AWS ECS container clusters.',
            technologies: ['Docker', 'AWS', 'GitHub Actions'],
            githubLink: 'https://github.com/dinesh/cicd-pipeline',
          },
        ],
        resumeName: 'Dinesh_DevOps.pdf',
        resumeText: 'Dinesh Kumar B. DevOps Engineer. AWS, Docker, Kubernetes, Linux, CI/CD. Mepco Schlenk. CGPA 7.9.',
        resumeSkills: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'CI/CD'],
      },
      // 18. Sivaranjani S
      {
        name: 'Sivaranjani S',
        email: 'sivaranjani@student.com',
        phone: '+919876543218',
        location: 'Madurai',
        college: 'Thiagarajar College, Madurai',
        degree: 'MCA',
        dept: 'Computer Applications',
        cgpa: 8.7,
        gradYear: 2026,
        bio: 'Full stack developer and database architect from Madurai with strong mastery of React and Node.js.',
        prefRole: 'Full Stack Developer',
        prefDomain: 'Full Stack Development',
        prefLoc: ['Madurai', 'Chennai', 'Coimbatore'],
        stipend: 20000,
        mode: 'HYBRID',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'REST API', 'SQL'],
        progLangs: ['JavaScript', 'Java', 'SQL'],
        frameworks: ['React', 'Express', 'Node.js'],
        tools: ['MongoDB', 'MySQL', 'Postman', 'Git'],
        softSkills: ['Analytical Thinking', 'Communication'],
        level: 'INTERMEDIATE',
        projects: [
          {
            title: 'Hospital OPD Appointment System',
            description: 'Online booking and queue management system with React and Node.js.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
            githubLink: 'https://github.com/sivaranjani/opd-system',
          },
        ],
        resumeName: 'Sivaranjani_MCA.pdf',
        resumeText: 'Sivaranjani S. Full Stack Web Developer. React, Node.js, Express, MongoDB, SQL. MCA. CGPA 8.7.',
        resumeSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'REST API'],
      },
      // 19. Praveen Raj K
      {
        name: 'Praveen Raj K',
        email: 'praveen@student.com',
        phone: '+919876543219',
        location: 'Salem',
        college: 'Government College of Engineering, Salem',
        degree: 'B.E',
        dept: 'Civil Engineering',
        cgpa: 8.2,
        gradYear: 2026,
        bio: 'Smart infrastructure and CAD/BIM modeling enthusiast from GCE Salem, certified in Revit & GIS mapping.',
        prefRole: 'Smart Infrastructure & CAD Engineer',
        prefDomain: 'Robotics & Automation',
        prefLoc: ['Salem', 'Chennai', 'Coimbatore'],
        stipend: 16000,
        mode: 'ON_SITE',
        skills: ['CAD', 'AutoCAD', 'SolidWorks', 'Data Analysis', 'Python'],
        progLangs: ['Python'],
        frameworks: ['AutoCAD', 'Revit'],
        tools: ['AutoCAD', 'Revit', 'Excel'],
        softSkills: ['Site Coordination', 'Integrity'],
        level: 'BEGINNER',
        projects: [
          {
            title: 'GIS Mapping of Urban Salem Drainage',
            description: 'Hydrological runoff modeling and flood mitigation zones mapping.',
            technologies: ['GIS', 'AutoCAD', 'Excel'],
            githubLink: 'https://github.com/praveen/gis-drainage',
          },
        ],
        resumeName: 'Praveen_Civil.pdf',
        resumeText: 'Praveen Raj K. Smart Infrastructure & CAD. AutoCAD, SolidWorks, GIS. GCE Salem. CGPA 8.2.',
        resumeSkills: ['CAD', 'AutoCAD', 'SolidWorks', 'Data Analysis'],
      },
      // 20. Menaka G
      {
        name: 'Menaka G',
        email: 'menaka@student.com',
        phone: '+919876543220',
        location: 'Chennai',
        college: 'College of Engineering, Guindy (Anna University)',
        degree: 'M.Sc',
        dept: 'Data Science',
        cgpa: 9.2,
        gradYear: 2026,
        bio: 'Data science post-graduate from CEG with expertise in deep learning, statistical modeling, and financial analytics.',
        prefRole: 'Data Scientist',
        prefDomain: 'Data Science & Analytics',
        prefLoc: ['Chennai', 'Bangalore'],
        stipend: 30000,
        mode: 'HYBRID',
        skills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Data Analysis', 'Power BI', 'Scikit-Learn', 'Machine Learning'],
        progLangs: ['Python', 'R', 'SQL'],
        frameworks: ['Scikit-Learn', 'TensorFlow', 'FastAPI'],
        tools: ['Power BI', 'Tableau', 'Jupyter', 'Git'],
        softSkills: ['Mathematical Aptitude', 'Research'],
        level: 'INTERMEDIATE',
        projects: [
          {
            title: 'Credit Risk Scoring with XGBoost',
            description: 'Loan default probability prediction model tested on 100,000 credit records with 0.89 AUC.',
            technologies: ['Python', 'Pandas', 'Scikit-Learn', 'Power BI'],
            githubLink: 'https://github.com/menaka/credit-risk',
          },
        ],
        resumeName: 'Menaka_DataScientist.pdf',
        resumeText: 'Menaka G. Data Scientist. Python, SQL, Pandas, Scikit-Learn, Power BI. CEG Anna University. CGPA 9.2.',
        resumeSkills: ['Python', 'SQL', 'Pandas', 'Data Analysis', 'Power BI', 'Machine Learning'],
      },
      // 21-36: Additional realistic Tamil Nadu students
      {
        name: 'Aravind Swaminathan',
        email: 'aravind@student.com',
        phone: '+919876543221',
        location: 'Chennai',
        college: 'SSN College of Engineering, Chennai',
        degree: 'B.Tech',
        dept: 'Computer Science and Engineering',
        cgpa: 8.65,
        gradYear: 2026,
        bio: 'Cybersecurity researcher and ethical hacker certified in CEH, skilled in web penetration testing.',
        prefRole: 'Cybersecurity Analyst',
        prefDomain: 'Cybersecurity & Ethical Hacking',
        prefLoc: ['Chennai', 'Bangalore'],
        stipend: 25000,
        mode: 'HYBRID',
        skills: ['Cybersecurity', 'Ethical Hacking', 'Networking', 'Python', 'Linux', 'Git'],
        progLangs: ['Python', 'C', 'Bash'],
        frameworks: ['Flask'],
        tools: ['Burp Suite', 'Wireshark', 'Metasploit', 'Nmap'],
        softSkills: ['Problem Solving', 'Security Ethics'],
        level: 'INTERMEDIATE',
        projects: [{ title: 'Web Vulnerability Scanner', description: 'Automated OWASP Top 10 scanner in Python.', technologies: ['Python', 'Networking'], githubLink: 'https://github.com/aravind/vuln-scanner' }],
        resumeName: 'Aravind_Security.pdf',
        resumeText: 'Aravind Swaminathan. Cybersecurity Analyst. Python, Ethical Hacking, Networking, Linux. SSN. CGPA 8.65.',
        resumeSkills: ['Cybersecurity', 'Ethical Hacking', 'Networking', 'Python', 'Linux'],
      },
      {
        name: 'Subashini M',
        email: 'subashini@student.com',
        phone: '+919876543222',
        location: 'Coimbatore',
        college: 'PSG College of Technology, Coimbatore',
        degree: 'B.E',
        dept: 'Biomedical Engineering',
        cgpa: 9.0,
        gradYear: 2026,
        bio: 'HealthTech data analyst passionate about medical telemetry, ECG signal processing, and AI diagnostic tools.',
        prefRole: 'Healthcare Data Analyst',
        prefDomain: 'Data Science & Analytics',
        prefLoc: ['Coimbatore', 'Chennai', 'Hyderabad'],
        stipend: 25000,
        mode: 'HYBRID',
        skills: ['Python', 'Data Analysis', 'Pandas', 'SQL', 'Machine Learning', 'MATLAB'],
        progLangs: ['Python', 'MATLAB', 'SQL'],
        frameworks: ['Scikit-Learn'],
        tools: ['Tableau', 'Jupyter'],
        softSkills: ['Empathy', 'Detail Oriented'],
        level: 'INTERMEDIATE',
        projects: [{ title: 'Arrhythmia Detection from ECG Signals', description: 'Wavelet transform and random forest classifier for cardiac arrhythmia.', technologies: ['Python', 'MATLAB', 'Scikit-Learn'], githubLink: 'https://github.com/subashini/ecg-ml' }],
        resumeName: 'Subashini_HealthData.pdf',
        resumeText: 'Subashini M. Health Data Analyst. Python, SQL, Pandas, Machine Learning. PSG Tech. CGPA 9.0.',
        resumeSkills: ['Python', 'Data Analysis', 'Pandas', 'SQL', 'Machine Learning'],
      },
      {
        name: 'Thangavel P',
        email: 'thangavel@student.com',
        phone: '+919876543223',
        location: 'Coimbatore',
        college: 'Coimbatore Institute of Technology (CIT)',
        degree: 'B.E',
        dept: 'Mechanical Engineering',
        cgpa: 8.15,
        gradYear: 2026,
        bio: 'Automotive and EV powertrain mechanical designer from CIT Coimbatore skilled in thermal modeling.',
        prefRole: 'EV Mechanical Design Engineer',
        prefDomain: 'Electric Vehicle (EV) Technology',
        prefLoc: ['Coimbatore', 'Hosur', 'Bangalore'],
        stipend: 18000,
        mode: 'ON_SITE',
        skills: ['CAD', 'SolidWorks', 'FEA', 'Manufacturing', 'Mechanical Design', 'Power Electronics'],
        progLangs: ['Python'],
        frameworks: ['SolidWorks', 'ANSYS'],
        tools: ['SolidWorks', 'AutoCAD'],
        softSkills: ['Work Ethic', 'Teamwork'],
        level: 'BEGINNER',
        projects: [{ title: 'Thermal Simulation of Battery Pack', description: 'Liquid cooling jacket optimization for 48V EV battery.', technologies: ['ANSYS', 'SolidWorks'], githubLink: 'https://github.com/thangavel/ev-cooling' }],
        resumeName: 'Thangavel_EV_Mech.pdf',
        resumeText: 'Thangavel P. EV Mechanical Designer. SolidWorks, CAD, FEA, Manufacturing. CIT. CGPA 8.15.',
        resumeSkills: ['CAD', 'SolidWorks', 'FEA', 'Manufacturing', 'Mechanical Design'],
      },
      {
        name: 'Priyadharshini K',
        email: 'priyadharshini@student.com',
        phone: '+919876543224',
        location: 'Chennai',
        college: 'Madras Institute of Technology (MIT Chromepet)',
        degree: 'B.E',
        dept: 'Electronics and Communication Engineering',
        cgpa: 8.8,
        gradYear: 2026,
        bio: 'VLSI ASIC and FPGA design engineer from MIT Chromepet with hands-on Cadence tool experience.',
        prefRole: 'VLSI ASIC Design Engineer',
        prefDomain: 'VLSI Design & Verification',
        prefLoc: ['Chennai', 'Hyderabad', 'Bangalore'],
        stipend: 25000,
        mode: 'ON_SITE',
        skills: ['Verilog', 'SystemVerilog', 'Digital Design', 'VLSI', 'FPGA', 'Static Timing Analysis'],
        progLangs: ['Verilog', 'C', 'Python'],
        frameworks: ['Vivado'],
        tools: ['Xilinx Vivado', 'ModelSim'],
        softSkills: ['Analytical Aptitude', 'Communication'],
        level: 'INTERMEDIATE',
        projects: [{ title: 'AES-128 Hardware Encryption Engine', description: 'Pipelined cryptographic accelerator in Verilog.', technologies: ['Verilog', 'ModelSim'], githubLink: 'https://github.com/priyadharshini/aes-core' }],
        resumeName: 'Priyadharshini_VLSI.pdf',
        resumeText: 'Priyadharshini K. VLSI Engineer. Verilog, SystemVerilog, FPGA, Digital Design. MIT Anna University. CGPA 8.8.',
        resumeSkills: ['Verilog', 'SystemVerilog', 'Digital Design', 'VLSI', 'FPGA'],
      },
      {
        name: 'Balasubramaniam S',
        email: 'balasubramaniam@student.com',
        phone: '+919876543225',
        location: 'Trichy',
        college: 'National Institute of Technology (NIT), Trichy',
        degree: 'B.Tech',
        dept: 'Chemical & Clean Energy Engineering',
        cgpa: 8.4,
        gradYear: 2026,
        bio: 'Clean energy and battery electrochemistry student from NIT Trichy researching sodium-ion and lithium battery cells.',
        prefRole: 'EV Battery Materials Researcher',
        prefDomain: 'Electric Vehicle (EV) Technology',
        prefLoc: ['Bangalore', 'Chennai', 'Hosur'],
        stipend: 22000,
        mode: 'ON_SITE',
        skills: ['Battery Technology', 'MATLAB', 'Data Analysis', 'Python'],
        progLangs: ['Python', 'MATLAB'],
        frameworks: ['Pandas'],
        tools: ['Excel', 'MATLAB'],
        softSkills: ['Scientific Rigor', 'Documentation'],
        level: 'BEGINNER',
        projects: [{ title: 'Electrochemical Degradation Modeling', description: 'Python model tracking battery cycle life fading.', technologies: ['Python', 'MATLAB'], githubLink: 'https://github.com/balasubramaniam/battery-deg' }],
        resumeName: 'Balasubramaniam_CleanEnergy.pdf',
        resumeText: 'Balasubramaniam S. Battery Researcher. Battery Technology, MATLAB, Python. NIT Trichy. CGPA 8.4.',
        resumeSkills: ['Battery Technology', 'MATLAB', 'Data Analysis', 'Python'],
      },
      {
        name: 'Keerthana R',
        email: 'keerthana@student.com',
        phone: '+919876543226',
        location: 'Chennai',
        college: 'St. Joseph’s College of Engineering, Chennai',
        degree: 'B.Tech',
        dept: 'Information Technology',
        cgpa: 8.55,
        gradYear: 2026,
        bio: 'Frontend developer and UI specialist skilled in React, TailwindCSS, and accessible web standards.',
        prefRole: 'Frontend Developer',
        prefDomain: 'Full Stack Development',
        prefLoc: ['Chennai', 'Bangalore'],
        stipend: 20000,
        mode: 'HYBRID',
        skills: ['React', 'JavaScript', 'HTML', 'CSS', 'TailwindCSS', 'Git', 'REST API'],
        progLangs: ['JavaScript', 'TypeScript', 'HTML', 'CSS'],
        frameworks: ['React', 'Tailwind'],
        tools: ['Git', 'VS Code', 'Postman'],
        softSkills: ['Creative Problem Solving', 'Adaptability'],
        level: 'BEGINNER',
        projects: [{ title: 'Smart Recipe Discovery App', description: 'Nutritional filter web app built with React.', technologies: ['React', 'TailwindCSS'], githubLink: 'https://github.com/keerthana/recipe-app' }],
        resumeName: 'Keerthana_Frontend.pdf',
        resumeText: 'Keerthana R. Frontend Developer. React, JavaScript, HTML, CSS, TailwindCSS. St. Joseph’s. CGPA 8.55.',
        resumeSkills: ['React', 'JavaScript', 'HTML', 'CSS', 'TailwindCSS', 'Git'],
      },
      {
        name: 'Gokulakrishnan V',
        email: 'gokul@student.com',
        phone: '+919876543227',
        location: 'Coimbatore',
        college: 'Sri Krishna College of Engineering and Technology (SKCET)',
        degree: 'B.E',
        dept: 'Computer Science and Engineering',
        cgpa: 8.3,
        gradYear: 2026,
        bio: 'Cloud and backend developer skilled in Node.js, Express, Docker, and AWS microservices.',
        prefRole: 'Cloud / DevOps Engineer',
        prefDomain: 'Cloud & DevOps',
        prefLoc: ['Coimbatore', 'Bangalore', 'Chennai'],
        stipend: 22000,
        mode: 'HYBRID',
        skills: ['AWS', 'Docker', 'Node.js', 'Express', 'Linux', 'CI/CD', 'Git'],
        progLangs: ['JavaScript', 'Python'],
        frameworks: ['Node.js', 'Express'],
        tools: ['Docker', 'AWS', 'Git', 'Postman'],
        softSkills: ['Team Leadership', 'Fast Learner'],
        level: 'INTERMEDIATE',
        projects: [{ title: 'Serverless File Processing Pipeline', description: 'AWS Lambda and S3 thumbnail generator.', technologies: ['AWS', 'Node.js', 'Docker'], githubLink: 'https://github.com/gokul/s3-lambda' }],
        resumeName: 'Gokul_DevOps.pdf',
        resumeText: 'Gokulakrishnan V. Cloud Engineer. AWS, Docker, Node.js, Linux, CI/CD. SKCET. CGPA 8.3.',
        resumeSkills: ['AWS', 'Docker', 'Node.js', 'Linux', 'CI/CD'],
      },
      {
        name: 'Revathi S',
        email: 'revathi@student.com',
        phone: '+919876543228',
        location: 'Coimbatore',
        college: 'Government Arts College, Coimbatore',
        degree: 'B.Sc',
        dept: 'Statistics & Data Analytics',
        cgpa: 8.6,
        gradYear: 2026,
        bio: 'Statistical analysis and data visualization student with strong command over Power BI and SQL.',
        prefRole: 'Data Analyst',
        prefDomain: 'Data Science & Analytics',
        prefLoc: ['Coimbatore', 'Chennai'],
        stipend: 16000,
        mode: 'ON_SITE',
        skills: ['Python', 'SQL', 'Excel', 'Power BI', 'Data Analysis', 'Pandas'],
        progLangs: ['Python', 'SQL', 'R'],
        frameworks: ['Pandas'],
        tools: ['Power BI', 'Excel', 'MySQL'],
        softSkills: ['Statistical Reasoning', 'Clarity'],
        level: 'BEGINNER',
        projects: [{ title: 'Customer Churn Analysis in Retail', description: 'Power BI dynamic dashboards highlighting key churn factors.', technologies: ['Power BI', 'SQL', 'Excel'], githubLink: 'https://github.com/revathi/churn-powerbi' }],
        resumeName: 'Revathi_Analytics.pdf',
        resumeText: 'Revathi S. Data Analyst. Power BI, SQL, Excel, Python, Pandas. CGPA 8.6.',
        resumeSkills: ['Python', 'SQL', 'Excel', 'Power BI', 'Data Analysis'],
      },
      {
        name: 'Vijay Anand M',
        email: 'vijayanand@student.com',
        phone: '+919876543229',
        location: 'Karaikudi',
        college: 'Alagappa Chettiar Government College of Engineering, Karaikudi',
        degree: 'B.E',
        dept: 'Electrical and Electronics Engineering',
        cgpa: 8.0,
        gradYear: 2026,
        bio: 'Smart grid, solar inverter, and industrial power systems engineer from ACCET Karaikudi.',
        prefRole: 'Electrical Systems Engineer',
        prefDomain: 'Electric Vehicle (EV) Technology',
        prefLoc: ['Chennai', 'Coimbatore', 'Madurai'],
        stipend: 17000,
        mode: 'ON_SITE',
        skills: ['Power Electronics', 'MATLAB', 'Simulink', 'Microcontrollers', 'CAD'],
        progLangs: ['C', 'MATLAB'],
        frameworks: ['Simulink'],
        tools: ['MATLAB', 'AutoCAD'],
        softSkills: ['Punctual', 'Practical Approach'],
        level: 'BEGINNER',
        projects: [{ title: 'Grid-Tied Solar Inverter MPPT Tracker', description: 'Perturb & Observe algorithm simulation in MATLAB.', technologies: ['MATLAB', 'Simulink'], githubLink: 'https://github.com/vijayanand/solar-mppt' }],
        resumeName: 'VijayAnand_Electrical.pdf',
        resumeText: 'Vijay Anand M. Electrical Systems Engineer. Power Electronics, MATLAB, Simulink. ACCET. CGPA 8.0.',
        resumeSkills: ['Power Electronics', 'MATLAB', 'Simulink', 'Microcontrollers'],
      },
      {
        name: 'Deepa Sundaram',
        email: 'deepa@student.com',
        phone: '+919876543230',
        location: 'Chennai',
        college: 'Madras Christian College (MCC Chennai)',
        degree: 'B.Com',
        dept: 'Computer Applications & Finance',
        cgpa: 8.7,
        gradYear: 2026,
        bio: 'FinTech enthusiast with dual passion for corporate finance and Python financial modeling.',
        prefRole: 'FinTech Analyst',
        prefDomain: 'Finance & FinTech',
        prefLoc: ['Chennai', 'Bangalore'],
        stipend: 20000,
        mode: 'HYBRID',
        skills: ['Financial Modelling', 'Excel', 'Python', 'SQL', 'Data Analysis', 'Finance Basics'],
        progLangs: ['Python', 'SQL'],
        frameworks: ['Pandas'],
        tools: ['Excel', 'Power BI'],
        softSkills: ['Financial Acumen', 'Articulate'],
        level: 'INTERMEDIATE',
        projects: [{ title: 'Discounted Cash Flow (DCF) Automation', description: 'Automated valuation model pulling live stock data via Yahoo Finance API.', technologies: ['Python', 'Excel', 'Pandas'], githubLink: 'https://github.com/deepa/dcf-model' }],
        resumeName: 'Deepa_FinTech.pdf',
        resumeText: 'Deepa Sundaram. FinTech Analyst. Financial Modelling, Python, SQL, Excel. MCC Chennai. CGPA 8.7.',
        resumeSkills: ['Financial Modelling', 'Excel', 'Python', 'SQL', 'Data Analysis'],
      },
      {
        name: 'Manikandan K',
        email: 'manikandan@student.com',
        phone: '+919876543231',
        location: 'Kovilpatti',
        college: 'National Engineering College, Kovilpatti',
        degree: 'B.E',
        dept: 'Electronics and Communication Engineering',
        cgpa: 7.95,
        gradYear: 2026,
        bio: 'Embedded firmware and microchip testing student skilled in C, Arduino, and wireless sensors.',
        prefRole: 'Embedded Systems Intern',
        prefDomain: 'Embedded Systems & IoT',
        prefLoc: ['Madurai', 'Chennai', 'Coimbatore'],
        stipend: 15000,
        mode: 'ON_SITE',
        skills: ['Embedded C', 'Microcontrollers', 'IoT', 'C', 'Arduino'],
        progLangs: ['C', 'Embedded C', 'Python'],
        frameworks: ['Arduino'],
        tools: ['Keil', 'Git'],
        softSkills: ['Perseverance', 'Hands-on Prototyping'],
        level: 'BEGINNER',
        projects: [{ title: 'Wireless Industrial Vibration Monitor', description: 'Vibration and temperature sensor node with BLE.', technologies: ['Embedded C', 'Microcontrollers'], githubLink: 'https://github.com/manikandan/vib-monitor' }],
        resumeName: 'Manikandan_Embedded.pdf',
        resumeText: 'Manikandan K. Embedded Firmware Intern. Embedded C, Microcontrollers, IoT. NEC Kovilpatti. CGPA 7.95.',
        resumeSkills: ['Embedded C', 'Microcontrollers', 'IoT', 'C'],
      },
      {
        name: 'Ilango S',
        email: 'ilango@student.com',
        phone: '+919876543232',
        location: 'Chidambaram',
        college: 'Annamalai University, Chidambaram',
        degree: 'B.E',
        dept: 'Agricultural Engineering',
        cgpa: 8.2,
        gradYear: 2026,
        bio: 'Precision farming and post-harvest technology student experienced with drone surveillance and drip sensors.',
        prefRole: 'Smart Farming Engineer',
        prefDomain: 'Precision Agriculture & Smart Farming',
        prefLoc: ['Chennai', 'Coimbatore', 'Trichy'],
        stipend: 17000,
        mode: 'ON_SITE',
        skills: ['IoT', 'Data Analysis', 'Python', 'Agronomy Basics', 'CAD'],
        progLangs: ['Python'],
        frameworks: ['Pandas'],
        tools: ['AutoCAD', 'Excel'],
        softSkills: ['Practical Knowledge', 'Leadership'],
        level: 'BEGINNER',
        projects: [{ title: 'Automated Solar Grain Dryer', description: 'Humidity-controlled solar convective drying chamber for paddy.', technologies: ['IoT', 'Microcontrollers'], githubLink: 'https://github.com/ilango/grain-dryer' }],
        resumeName: 'Ilango_AgriEng.pdf',
        resumeText: 'Ilango S. Agricultural Engineering. IoT, Python, Agronomy Basics, CAD. Annamalai University. CGPA 8.2.',
        resumeSkills: ['IoT', 'Data Analysis', 'Python', 'Agronomy Basics'],
      },
      {
        name: 'Shakthi Vel R',
        email: 'shakthivel@student.com',
        phone: '+919876543233',
        location: 'Chennai',
        college: 'Vel Tech Rangarajan Dr. Sagunthala R&D Institute, Chennai',
        degree: 'B.Tech',
        dept: 'Cyber Security',
        cgpa: 8.4,
        gradYear: 2026,
        bio: 'Ethical hacker and network defense enthusiast with hands-on CTF competition experience.',
        prefRole: 'Cybersecurity Analyst',
        prefDomain: 'Cybersecurity & Ethical Hacking',
        prefLoc: ['Chennai', 'Bangalore'],
        stipend: 22000,
        mode: 'HYBRID',
        skills: ['Cybersecurity', 'Ethical Hacking', 'Networking', 'Linux', 'Python'],
        progLangs: ['Python', 'Bash', 'C'],
        frameworks: ['Flask'],
        tools: ['Wireshark', 'Burp Suite', 'Nmap', 'Linux'],
        softSkills: ['Ethical Mindset', 'Curious'],
        level: 'INTERMEDIATE',
        projects: [{ title: 'Network Intrusion Detection with Snort', description: 'Custom Snort rule development against DDoS attacks.', technologies: ['Networking', 'Linux', 'Python'], githubLink: 'https://github.com/shakthivel/snort-rules' }],
        resumeName: 'ShakthiVel_Security.pdf',
        resumeText: 'Shakthi Vel R. Cybersecurity Analyst. Ethical Hacking, Networking, Linux, Python. Vel Tech. CGPA 8.4.',
        resumeSkills: ['Cybersecurity', 'Ethical Hacking', 'Networking', 'Linux', 'Python'],
      },
      {
        name: 'Sharmila Begum M',
        email: 'sharmila@student.com',
        phone: '+919876543234',
        location: 'Chennai',
        college: 'B.S. Abdur Rahman Crescent Institute, Chennai',
        degree: 'B.Tech',
        dept: 'Artificial Intelligence & Data Science',
        cgpa: 8.8,
        gradYear: 2026,
        bio: 'Computer vision and NLP researcher interested in healthcare AI and multilingual translation models.',
        prefRole: 'AI / Machine Learning Engineer',
        prefDomain: 'AI & Machine Learning',
        prefLoc: ['Chennai', 'Bangalore', 'Hyderabad'],
        stipend: 25000,
        mode: 'HYBRID',
        skills: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'Computer Vision', 'NLP'],
        progLangs: ['Python', 'SQL'],
        frameworks: ['PyTorch', 'OpenCV', 'TensorFlow'],
        tools: ['Jupyter', 'Git', 'Docker'],
        softSkills: ['Research Curiosity', 'Teamwork'],
        level: 'INTERMEDIATE',
        projects: [{ title: 'Skin Lesion Classification with ResNet', description: 'Transfer learning model achieving 92% validation accuracy on ISIC dataset.', technologies: ['Python', 'PyTorch', 'Computer Vision'], githubLink: 'https://github.com/sharmila/skin-ai' }],
        resumeName: 'Sharmila_AI_CV.pdf',
        resumeText: 'Sharmila Begum M. AI/ML Engineer. Python, PyTorch, Deep Learning, Computer Vision. Crescent. CGPA 8.8.',
        resumeSkills: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'Computer Vision'],
      },
      {
        name: 'Naveen Prasath R',
        email: 'naveen@student.com',
        phone: '+919876543235',
        location: 'Coimbatore',
        college: 'Sri Ramakrishna Mission Vidyalaya, Coimbatore',
        degree: 'B.Voc',
        dept: 'Web Technology & Multimedia',
        cgpa: 8.3,
        gradYear: 2026,
        bio: 'UI designer and creative frontend developer skilled in Figma, CSS animations, and React components.',
        prefRole: 'UI/UX Designer & Frontend',
        prefDomain: 'UI/UX Design',
        prefLoc: ['Coimbatore', 'Chennai', 'Remote'],
        stipend: 18000,
        mode: 'HYBRID',
        skills: ['Figma', 'UI/UX Design', 'React', 'HTML', 'CSS', 'TailwindCSS', 'JavaScript'],
        progLangs: ['JavaScript', 'HTML', 'CSS'],
        frameworks: ['React', 'Tailwind'],
        tools: ['Figma', 'Adobe XD', 'Git'],
        softSkills: ['Design Aesthetics', 'Attention to Detail'],
        level: 'BEGINNER',
        projects: [{ title: 'Tamil Handloom Artisans E-Commerce UI', description: 'Authentic culturally themed web storefront designed in Figma.', technologies: ['Figma', 'React', 'TailwindCSS'], githubLink: 'https://github.com/naveen/handloom-ui' }],
        resumeName: 'Naveen_UIUX.pdf',
        resumeText: 'Naveen Prasath R. UI/UX Designer. Figma, React, HTML, CSS, TailwindCSS. CGPA 8.3.',
        resumeSkills: ['Figma', 'UI/UX Design', 'React', 'HTML', 'CSS', 'TailwindCSS'],
      },
      {
        name: 'Dhanalakshmi V',
        email: 'dhanalakshmi@student.com',
        phone: '+919876543236',
        location: 'Trichy',
        college: 'Bharathidasan University, Trichy',
        degree: 'M.Sc',
        dept: 'Computer Science',
        cgpa: 8.6,
        gradYear: 2026,
        bio: 'Full stack developer and database optimization enthusiast with solid foundation in algorithms and MERN.',
        prefRole: 'Full Stack Developer',
        prefDomain: 'Full Stack Development',
        prefLoc: ['Trichy', 'Chennai', 'Bangalore'],
        stipend: 20000,
        mode: 'HYBRID',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'SQL', 'Git'],
        progLangs: ['JavaScript', 'Java', 'SQL'],
        frameworks: ['React', 'Node.js', 'Express'],
        tools: ['MongoDB', 'Postman', 'Git'],
        softSkills: ['Analytical Mind', 'Continuous Learner'],
        level: 'INTERMEDIATE',
        projects: [{ title: 'Online Library & Reservation Portal', description: 'Digital book check-out and fine management portal.', technologies: ['React', 'Node.js', 'MongoDB'], githubLink: 'https://github.com/dhanalakshmi/library-portal' }],
        resumeName: 'Dhanalakshmi_FullStack.pdf',
        resumeText: 'Dhanalakshmi V. Full Stack Developer. React, Node.js, Express, MongoDB. Bharathidasan University. CGPA 8.6.',
        resumeSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript'],
      },
    ];

    const studentMap = {};

    for (const stud of studentsData) {
      const u = await User.create({
        name: stud.name,
        email: stud.email,
        password: 'password123',
        role: 'student',
        phone: stud.phone,
        isProfileComplete: true,
      });

      const p = await StudentProfile.create({
        user: u._id,
        fullName: stud.name,
        phone: stud.phone,
        location: stud.location,
        bio: stud.bio,
        preferredLocations: stud.prefLoc,
        college: stud.college,
        degree: stud.degree,
        department: stud.dept,
        cgpa: stud.cgpa,
        graduationYear: stud.gradYear,
        technicalSkills: stud.skills,
        programmingLanguages: stud.progLangs,
        frameworks: stud.frameworks,
        tools: stud.tools,
        softSkills: stud.softSkills,
        experienceLevel: stud.level,
        projects: stud.projects || [],
        preferredRole: stud.prefRole,
        preferredDomain: stud.prefDomain,
        preferredStipend: stud.stipend,
        preferredWorkMode: stud.mode,
        preferredDuration: '6 Months',
        resumeOriginalName: stud.resumeName,
        resumePath: 'uploads/resumes/sample_resume.pdf',
        resumeUploadedAt: new Date(),
        resumeExtractedText: stud.resumeText,
        resumeExtractedSkills: stud.resumeSkills,
        resumeExtractedRoles: [stud.prefRole],
        profileCompletionPercentage: 92,
      });

      studentMap[stud.email] = { user: u, profile: p };
    }

    console.log(`✅ Successfully seeded ${Object.keys(studentMap).length} Tamil Nadu students (target 30-50)!`);

    // =========================================================
    // 📝 5. ANU PRIYA S APPLICATIONS (At least 7, every status tracker different!)
    // =========================================================
    console.log('📝 Seeding Anu Priya S Applications with distinct status tracker phases...');

    const anu = studentMap['anu@student.com'];

    // 1. Freshworks -> SELECTED (Offer Extended)
    const freshworksJob = internshipLookupByRole['Freshworks Technologies - Full Stack Web Developer Intern'];
    if (freshworksJob && anu) {
      const match = calculateStudentInternshipMatch(anu.profile, freshworksJob, null);
      await Application.create({
        student: anu.profile._id,
        studentUser: anu.user._id,
        internship: freshworksJob._id,
        industry: freshworksJob.industry,
        status: 'SELECTED',
        rounds: [
          { roundNumber: 1, name: 'Online Technical Assessment', status: 'CLEARED', completedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) },
          { roundNumber: 2, name: 'Live Technical & Architecture', status: 'CLEARED', completedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000) },
          { roundNumber: 3, name: 'Managerial & HR Discussion', status: 'CLEARED', completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) },
        ],
        activeRoundNumber: 3,
        matchScore: match.matchPercentage,
        aiMatchDetails: {
          skillMatchPercentage: match.scores.skillScore,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
          reasons: match.explainableReasons,
        },
        coverNote: 'Excited to contribute to Freshworks SaaS with my React and Node.js skills!',
        notesByIndustry: 'Outstanding performance across all technical and culture rounds. Offer extended!',
      });
      freshworksJob.applicationCount += 1;
      freshworksJob.selectedCount += 1;
      await freshworksJob.save();
    }

    // 2. Chargebee -> HR (Round 3 HR Scheduled on Google Meet)
    const chargebeeJob = internshipLookupByRole['Chargebee Technologies - Frontend React & TypeScript Intern'];
    if (chargebeeJob && anu) {
      const match = calculateStudentInternshipMatch(anu.profile, chargebeeJob, null);
      await Application.create({
        student: anu.profile._id,
        studentUser: anu.user._id,
        internship: chargebeeJob._id,
        industry: chargebeeJob.industry,
        status: 'HR',
        rounds: [
          { roundNumber: 1, name: 'Online Technical Assessment', status: 'CLEARED', completedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) },
          { roundNumber: 2, name: 'Live Technical & Architecture', status: 'CLEARED', completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
          {
            roundNumber: 3,
            name: 'Managerial & HR Discussion',
            status: 'SCHEDULED',
            scheduledDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // Tomorrow 2 PM
            interviewMode: 'ONLINE_GOOGLE_MEET',
            meetingLink: 'https://meet.google.com/chb-hr-interview',
            instructions: 'Prepare for leadership conversation with Vice President of Engineering. Keep your portfolio ready.',
          },
        ],
        activeRoundNumber: 3,
        matchScore: match.matchPercentage,
        aiMatchDetails: {
          skillMatchPercentage: match.scores.skillScore,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
          reasons: match.explainableReasons,
        },
        coverNote: 'Chargebee’s subscription platform scale is inspiring. Looking forward to frontend architecture!',
      });
      chargebeeJob.applicationCount += 1;
      await chargebeeJob.save();
    }

    // 3. Kovai.co -> TECHNICAL (Round 2 Live Tech Scheduled)
    const kovaicoJob = internshipLookupByRole['Kovai.co - Full Stack SaaS Engineer Intern'];
    if (kovaicoJob && anu) {
      const match = calculateStudentInternshipMatch(anu.profile, kovaicoJob, null);
      await Application.create({
        student: anu.profile._id,
        studentUser: anu.user._id,
        internship: kovaicoJob._id,
        industry: kovaicoJob.industry,
        status: 'TECHNICAL',
        rounds: [
          { roundNumber: 1, name: 'Online Technical Assessment', status: 'CLEARED', completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
          {
            roundNumber: 2,
            name: 'Live Technical & Architecture',
            status: 'SCHEDULED',
            scheduledDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // In 3 days
            interviewMode: 'ONLINE_ZOOM',
            meetingLink: 'https://zoom.us/j/kovaico-tech-round2',
            instructions: 'Live component coding challenge in React & Express. Walkthrough of your EduCollaborate project.',
          },
          { roundNumber: 3, name: 'Managerial & HR Discussion', status: 'PENDING' },
        ],
        activeRoundNumber: 2,
        matchScore: match.matchPercentage,
        aiMatchDetails: {
          skillMatchPercentage: match.scores.skillScore,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
          reasons: match.explainableReasons,
        },
        coverNote: 'Eager to build high-grade cloud management products at Kovai.co Coimbatore!',
      });
      kovaicoJob.applicationCount += 1;
      await kovaicoJob.save();
    }

    // 4. Razorpay -> ROUND_1 (Round 1 Online Assessment Scheduled)
    const razorpayJob = internshipLookupByRole['Razorpay Software - Fintech Full Stack Intern'];
    if (razorpayJob && anu) {
      const match = calculateStudentInternshipMatch(anu.profile, razorpayJob, null);
      await Application.create({
        student: anu.profile._id,
        studentUser: anu.user._id,
        internship: razorpayJob._id,
        industry: razorpayJob.industry,
        status: 'ROUND_1',
        rounds: [
          {
            roundNumber: 1,
            name: 'Online Technical Assessment',
            status: 'SCHEDULED',
            scheduledDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // In 2 days
            interviewMode: 'ONLINE_GOOGLE_MEET',
            meetingLink: 'https://meet.google.com/rzp-assessment-round1',
            instructions: 'Proctored 90-minute algorithmic coding challenge on Data Structures and REST APIs. Keep ID ready.',
          },
          { roundNumber: 2, name: 'Live Technical & Architecture', status: 'PENDING' },
          { roundNumber: 3, name: 'Managerial & HR Discussion', status: 'PENDING' },
        ],
        activeRoundNumber: 1,
        matchScore: match.matchPercentage,
        aiMatchDetails: {
          skillMatchPercentage: match.scores.skillScore,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
          reasons: match.explainableReasons,
        },
        coverNote: 'Razorpay’s fintech infrastructure and developer focus excites me immensely.',
      });
      razorpayJob.applicationCount += 1;
      await razorpayJob.save();
    }

    // 5. Soliton Technologies -> SHORTLISTED (Profile Shortlisted)
    const solitonJob = internshipLookupByRole['Soliton Technologies - Embedded Firmware & IoT Intern'];
    if (solitonJob && anu) {
      const match = calculateStudentInternshipMatch(anu.profile, solitonJob, null);
      await Application.create({
        student: anu.profile._id,
        studentUser: anu.user._id,
        internship: solitonJob._id,
        industry: solitonJob.industry,
        status: 'SHORTLISTED',
        rounds: [
          { roundNumber: 1, name: 'Online Technical Assessment', status: 'PENDING' },
          { roundNumber: 2, name: 'Live Technical & Architecture', status: 'PENDING' },
          { roundNumber: 3, name: 'Managerial & HR Discussion', status: 'PENDING' },
        ],
        activeRoundNumber: 1,
        matchScore: match.matchPercentage,
        aiMatchDetails: {
          skillMatchPercentage: match.scores.skillScore,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
          reasons: match.explainableReasons,
        },
        coverNote: 'Keen to explore test automation and hardware-cloud integration at Soliton.',
        notesByIndustry: 'Candidate profile and academic credentials shortlisted. Panel allocation underway.',
      });
      solitonJob.applicationCount += 1;
      await solitonJob.save();
    }

    // 6. Darwinbox -> UNDER_REVIEW (Recruiter Screening)
    const darwinboxJob = internshipLookupByRole['Darwinbox - AI & Machine Learning Intern'];
    if (darwinboxJob && anu) {
      const match = calculateStudentInternshipMatch(anu.profile, darwinboxJob, null);
      await Application.create({
        student: anu.profile._id,
        studentUser: anu.user._id,
        internship: darwinboxJob._id,
        industry: darwinboxJob.industry,
        status: 'UNDER_REVIEW',
        rounds: [
          { roundNumber: 1, name: 'Online Technical Assessment', status: 'PENDING' },
          { roundNumber: 2, name: 'Live Technical & Architecture', status: 'PENDING' },
          { roundNumber: 3, name: 'Managerial & HR Discussion', status: 'PENDING' },
        ],
        activeRoundNumber: 0,
        matchScore: match.matchPercentage,
        aiMatchDetails: {
          skillMatchPercentage: match.scores.skillScore,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
          reasons: match.explainableReasons,
        },
        coverNote: 'Interested in applying LLM pipelines and smart agent tools to enterprise human capital software.',
        notesByIndustry: 'Resume under review by hiring manager.',
      });
      darwinboxJob.applicationCount += 1;
      await darwinboxJob.save();
    }

    // 7. Kissflow -> APPLIED (Just submitted)
    const kissflowJob = internshipLookupByRole['Kissflow - MERN Stack Developer Intern'];
    if (kissflowJob && anu) {
      const match = calculateStudentInternshipMatch(anu.profile, kissflowJob, null);
      await Application.create({
        student: anu.profile._id,
        studentUser: anu.user._id,
        internship: kissflowJob._id,
        industry: kissflowJob.industry,
        status: 'APPLIED',
        rounds: [
          { roundNumber: 1, name: 'Online Technical Assessment', status: 'PENDING' },
          { roundNumber: 2, name: 'Live Technical & Architecture', status: 'PENDING' },
          { roundNumber: 3, name: 'Managerial & HR Discussion', status: 'PENDING' },
        ],
        activeRoundNumber: 0,
        matchScore: match.matchPercentage,
        aiMatchDetails: {
          skillMatchPercentage: match.scores.skillScore,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
          reasons: match.explainableReasons,
        },
        coverNote: 'I admire Kissflow’s work culture and low-code architecture in Chennai.',
      });
      kissflowJob.applicationCount += 1;
      await kissflowJob.save();
    }

    // 8. Vivriti Capital -> REJECTED (Constructive feedback given)
    const vivritiJob = internshipLookupByRole['Vivriti Capital - FinTech Quantitative Analyst Intern'];
    if (vivritiJob && anu) {
      const match = calculateStudentInternshipMatch(anu.profile, vivritiJob, null);
      await Application.create({
        student: anu.profile._id,
        studentUser: anu.user._id,
        internship: vivritiJob._id,
        industry: vivritiJob.industry,
        status: 'REJECTED',
        rounds: [
          { roundNumber: 1, name: 'Online Technical Assessment', status: 'CLEARED', completedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000) },
          { roundNumber: 2, name: 'Live Technical & Architecture', status: 'REJECTED', completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
        ],
        activeRoundNumber: 2,
        matchScore: match.matchPercentage,
        aiMatchDetails: {
          skillMatchPercentage: match.scores.skillScore,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
          reasons: match.explainableReasons,
        },
        coverNote: 'Passionate about fintech analytics and financial modeling.',
        notesByIndustry: 'Solid problem-solving fundamentals. However, candidate currently lacks hands-on distributed transaction ledger design. Encouraged to strengthen system design and re-apply next cycle.',
      });
      vivritiJob.applicationCount += 1;
      await vivritiJob.save();
    }

    // Seed realistic applications for other students too
    const divya = studentMap['divyapriya@student.com'];
    if (divya && chargebeeJob) {
      await Application.create({
        student: divya.profile._id,
        studentUser: divya.user._id,
        internship: chargebeeJob._id,
        industry: chargebeeJob.industry,
        status: 'ROUND_2',
        rounds: [
          { roundNumber: 1, name: 'Online Technical Assessment', status: 'CLEARED' },
          { roundNumber: 2, name: 'Live Technical & Architecture', status: 'SCHEDULED', scheduledDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), interviewMode: 'ONLINE_GOOGLE_MEET', meetingLink: 'https://meet.google.com/chb-divya-tech' },
          { roundNumber: 3, name: 'Managerial & HR Discussion', status: 'PENDING' },
        ],
        activeRoundNumber: 2,
        matchScore: 88,
      });
      chargebeeJob.applicationCount += 1;
      await chargebeeJob.save();
    }

    const karthi = studentMap['karthikeyan@student.com'];
    const latentViewJob = internshipLookupByRole['LatentView Analytics - Machine Learning Engineer Intern'];
    if (karthi && latentViewJob) {
      await Application.create({
        student: karthi.profile._id,
        studentUser: karthi.user._id,
        internship: latentViewJob._id,
        industry: latentViewJob.industry,
        status: 'SELECTED',
        rounds: [
          { roundNumber: 1, name: 'Online Technical Assessment', status: 'CLEARED' },
          { roundNumber: 2, name: 'Live Technical & Architecture', status: 'CLEARED' },
          { roundNumber: 3, name: 'Managerial & HR Discussion', status: 'CLEARED' },
        ],
        activeRoundNumber: 3,
        matchScore: 95,
        notesByIndustry: 'Brilliant understanding of PyTorch and NLP transformers. Selected!',
      });
      latentViewJob.applicationCount += 1;
      latentViewJob.selectedCount += 1;
      await latentViewJob.save();
    }

    // =========================================================
    // 🏢 5b. FRESHWORKS RECRUITMENT PIPELINE & 35 VACANCIES COHORT
    // 8 Selected / Offers for Full Stack (Role Filled: 8/8)
    // 12 Active in Recruitment Pipeline across stages
    // 4 Applied + 4 Rejected -> Total 28 Applications across 35 target vacancies
    // =========================================================
    console.log('🏢 Seeding Freshworks candidate cohort (35 target vacancies, 8 filled, 12 in pipeline)...');

    const freshworksAiJob = internshipLookupByRole['Freshworks Technologies - Conversational AI / NLP Intern'];
    const freshworksAnalyticsJob = internshipLookupByRole['Freshworks Technologies - Customer Journey Analytics Intern'];
    const freshworksCloudJob = internshipLookupByRole['Freshworks Technologies - Platform Cloud Operations Intern'];
    const freshworksCyberJob = internshipLookupByRole['Freshworks Technologies - Threat Intelligence & Detection Intern'];
    const freshworksFinopsJob = internshipLookupByRole['Freshworks Technologies - FinOps & Billing Systems Intern'];

    // 1. Seven more candidates SELECTED for Full Stack Developer (Making 8 total placed for 8 required vacancies!)
    const fullStackSelectedEmails = [
      'divyapriya@student.com',
      'karthikeyan@student.com',
      'kavitha@student.com',
      'vigneshwaran@student.com',
      'harish@student.com',
      'sneha@student.com',
      'dinesh@student.com',
    ];

    if (freshworksJob) {
      for (const email of fullStackSelectedEmails) {
        const stud = studentMap[email];
        if (stud) {
          const match = calculateStudentInternshipMatch(stud.profile, freshworksJob, null);
          await Application.create({
            student: stud.profile._id,
            studentUser: stud.user._id,
            internship: freshworksJob._id,
            industry: freshworksJob.industry,
            status: 'SELECTED',
            rounds: [
              { roundNumber: 1, name: 'Online Technical Assessment', status: 'CLEARED', completedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000) },
              { roundNumber: 2, name: 'Live Technical & Architecture', status: 'CLEARED', completedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000) },
              { roundNumber: 3, name: 'Managerial & HR Discussion', status: 'CLEARED', completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) },
            ],
            activeRoundNumber: 3,
            matchScore: match.matchPercentage || 92,
            notesByIndustry: 'Excellent coding proficiency and system design skills. Formal offer released!',
          });
          freshworksJob.applicationCount += 1;
          freshworksJob.selectedCount += 1;
        }
      }
      freshworksJob.status = 'FILLED';
      await freshworksJob.save();
    }

    // 2. Twelve candidates in the active Recruitment Pipeline
    const pipelineSeedData = [
      // Conversational AI: 2 in HR, 2 in Technical, 2 in Round 1
      { email: 'pavithra@student.com', job: freshworksAiJob, status: 'HR', round: 3, roundName: 'Managerial & HR Discussion', mode: 'ONLINE_GOOGLE_MEET', link: 'https://meet.google.com/fw-ai-hr1' },
      { email: 'saravanan@student.com', job: freshworksAiJob, status: 'HR', round: 3, roundName: 'Managerial & HR Discussion', mode: 'ONLINE_GOOGLE_MEET', link: 'https://meet.google.com/fw-ai-hr2' },
      { email: 'vetrivel@student.com', job: freshworksAiJob, status: 'TECHNICAL', round: 2, roundName: 'Live Technical & Architecture', mode: 'ONLINE_GOOGLE_MEET', link: 'https://meet.google.com/fw-ai-tech1' },
      { email: 'kausalya@student.com', job: freshworksAiJob, status: 'TECHNICAL', round: 2, roundName: 'Live Technical & Architecture', mode: 'ONLINE_GOOGLE_MEET', link: 'https://meet.google.com/fw-ai-tech2' },
      { email: 'sivaranjani@student.com', job: freshworksAiJob, status: 'ROUND_1', round: 1, roundName: 'Online Technical Assessment' },
      { email: 'praveen@student.com', job: freshworksAiJob, status: 'ROUND_1', round: 1, roundName: 'Online Technical Assessment' },

      // Analytics: 1 in Technical, 1 in Round 1, 2 in Shortlisted
      { email: 'menaka@student.com', job: freshworksAnalyticsJob, status: 'TECHNICAL', round: 2, roundName: 'Live Technical & Architecture', mode: 'ONLINE_GOOGLE_MEET', link: 'https://meet.google.com/fw-data-tech' },
      { email: 'aravind@student.com', job: freshworksAnalyticsJob, status: 'ROUND_1', round: 1, roundName: 'Online Technical Assessment' },
      { email: 'subashini@student.com', job: freshworksAnalyticsJob, status: 'SHORTLISTED', round: 1, roundName: 'Online Technical Assessment' },
      { email: 'thangavel@student.com', job: freshworksAnalyticsJob, status: 'SHORTLISTED', round: 1, roundName: 'Online Technical Assessment' },

      // Cloud Operations: 2 in Under Review
      { email: 'priyadharshini@student.com', job: freshworksCloudJob, status: 'UNDER_REVIEW', round: 1, roundName: 'Online Technical Assessment' },
      { email: 'balasubramaniam@student.com', job: freshworksCloudJob, status: 'UNDER_REVIEW', round: 1, roundName: 'Online Technical Assessment' },
    ];

    for (const item of pipelineSeedData) {
      const stud = studentMap[item.email];
      if (stud && item.job) {
        const match = calculateStudentInternshipMatch(stud.profile, item.job, null);
        const rounds = [
          {
            roundNumber: 1,
            name: 'Online Technical Assessment',
            status: item.round > 1 ? 'CLEARED' : item.status === 'ROUND_1' ? 'SCHEDULED' : 'PENDING',
            scheduledDate: item.status === 'ROUND_1' ? new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
          },
          {
            roundNumber: 2,
            name: 'Live Technical & Architecture',
            status: item.round > 2 ? 'CLEARED' : item.status === 'TECHNICAL' ? 'SCHEDULED' : 'PENDING',
            scheduledDate: item.status === 'TECHNICAL' ? new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) : null,
            interviewMode: item.mode || 'ONLINE_GOOGLE_MEET',
            meetingLink: item.link || null,
          },
          {
            roundNumber: 3,
            name: 'Managerial & HR Discussion',
            status: item.status === 'HR' ? 'SCHEDULED' : 'PENDING',
            scheduledDate: item.status === 'HR' ? new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000) : null,
            interviewMode: item.mode || 'ONLINE_GOOGLE_MEET',
            meetingLink: item.link || null,
          },
        ];

        await Application.create({
          student: stud.profile._id,
          studentUser: stud.user._id,
          internship: item.job._id,
          industry: item.job.industry,
          status: item.status,
          rounds,
          activeRoundNumber: item.round,
          matchScore: match.matchPercentage || 85,
        });
        item.job.applicationCount += 1;
        await item.job.save();
      }
    }

    // 3. Four in APPLIED stage
    const appliedEmails = [
      { email: 'keerthana@student.com', job: freshworksCyberJob },
      { email: 'gokul@student.com', job: freshworksCyberJob },
      { email: 'deepa@student.com', job: freshworksFinopsJob },
      { email: 'manikandan@student.com', job: freshworksFinopsJob },
    ];
    for (const item of appliedEmails) {
      const stud = studentMap[item.email];
      if (stud && item.job) {
        await Application.create({
          student: stud.profile._id,
          studentUser: stud.user._id,
          internship: item.job._id,
          industry: item.job.industry,
          status: 'APPLIED',
          rounds: [
            { roundNumber: 1, name: 'Online Technical Assessment', status: 'PENDING' },
            { roundNumber: 2, name: 'Live Technical & Architecture', status: 'PENDING' },
            { roundNumber: 3, name: 'Managerial & HR Discussion', status: 'PENDING' },
          ],
          matchScore: 78,
        });
        item.job.applicationCount += 1;
        await item.job.save();
      }
    }

    // 4. Four in REJECTED stage
    const rejectedEmails = [
      { email: 'revathi@student.com', job: freshworksCyberJob },
      { email: 'vijayanand@student.com', job: freshworksCyberJob },
      { email: 'ilango@student.com', job: freshworksFinopsJob },
      { email: 'shakthivel@student.com', job: freshworksFinopsJob },
    ];
    for (const item of rejectedEmails) {
      const stud = studentMap[item.email];
      if (stud && item.job) {
        await Application.create({
          student: stud.profile._id,
          studentUser: stud.user._id,
          internship: item.job._id,
          industry: item.job.industry,
          status: 'REJECTED',
          rounds: [
            { roundNumber: 1, name: 'Online Technical Assessment', status: 'CLEARED' },
            { roundNumber: 2, name: 'Live Technical & Architecture', status: 'REJECTED' },
          ],
          activeRoundNumber: 2,
          matchScore: 68,
          notesByIndustry: 'Did not meet the advanced networking fundamentals required for this role.',
        });
        item.job.applicationCount += 1;
        await item.job.save();
      }
    }

    console.log('✅ Successfully seeded applications with Anu having 8 distinct status stages!');

    // =========================================================
    // ⭐ 6. REVIEWS
    // =========================================================
    console.log('⭐ Seeding Reviews for companies...');

    const freshworks = industryMap['Freshworks Technologies'];
    if (freshworks && anu) {
      await Review.create({
        authorUser: anu.user._id,
        authorRole: 'student',
        industry: freshworks.profile._id,
        internship: freshworksJob?._id,
        rating: 5,
        title: 'World-class engineering culture and supportive leadership in Chennai',
        feedback: 'The mentorship at Freshworks is extraordinary. Working on real cloud software that serves thousands of global enterprises gave me massive career confidence!',
        mentorshipRating: 5,
        workEnvironmentRating: 5,
        learningOpportunitiesRating: 5,
      });
    }

    const kovaico = industryMap['Kovai.co'];
    if (kovaico && divya) {
      await Review.create({
        authorUser: divya.user._id,
        authorRole: 'student',
        industry: kovaico.profile._id,
        internship: kovaicoJob?._id,
        rating: 5,
        title: 'Best SaaS product company in Coimbatore',
        feedback: 'Kovai.co has state-of-the-art office infrastructure and wonderful technical leads who guide you step-by-step.',
        mentorshipRating: 5,
        workEnvironmentRating: 5,
        learningOpportunitiesRating: 5,
      });
    }

    const soliton = industryMap['Soliton Technologies'];
    if (soliton && karthi) {
      await Review.create({
        authorUser: karthi.user._id,
        authorRole: 'student',
        industry: soliton.profile._id,
        internship: solitonJob?._id,
        rating: 5,
        title: 'Cutting-edge semiconductor automation',
        feedback: 'Working on chip validation and automated test platforms in Coimbatore was a deeply rewarding technical experience.',
        mentorshipRating: 5,
        workEnvironmentRating: 4,
        learningOpportunitiesRating: 5,
      });
    }

    // =========================================================
    // 🔔 7. NOTIFICATIONS (For Anu and students)
    // =========================================================
    console.log('🔔 Seeding Notifications...');

    if (anu) {
      await Notification.create({
        recipient: anu.user._id,
        title: '🎉 Offer Extended – Freshworks Technologies!',
        message: 'Congratulations Anu! You have been selected for the Full Stack Web Developer Intern position at Freshworks Chennai. Offer details sent to your registered email.',
        type: 'APPLICATION_UPDATE',
        link: '/student/applications',
      });

      await Notification.create({
        recipient: anu.user._id,
        title: 'Interview Scheduled – Round 3 at Chargebee',
        message: 'Your Managerial & HR discussion with the VP of Engineering at Chargebee has been scheduled. Google Meet link is attached in your tracker.',
        type: 'INTERVIEW_SCHEDULED',
        link: '/student/applications',
      });

      await Notification.create({
        recipient: anu.user._id,
        title: 'Technical Round Scheduled – Kovai.co',
        message: 'Your live system design & React coding round for Kovai.co Coimbatore has been scheduled on Zoom.',
        type: 'INTERVIEW_SCHEDULED',
        link: '/student/applications',
      });

      await Notification.create({
        recipient: anu.user._id,
        title: 'Online Coding Challenge – Razorpay Software',
        message: 'Round 1 algorithmic assessment for Fintech Full Stack Intern has been scheduled for you. Check proctored instructions.',
        type: 'INTERVIEW_SCHEDULED',
        link: '/student/applications',
      });

      await Notification.create({
        recipient: anu.user._id,
        title: 'Profile Shortlisted – Soliton Technologies',
        message: 'Soliton Technologies Coimbatore has shortlisted your profile for the Embedded Firmware & IoT internship.',
        type: 'APPLICATION_UPDATE',
        link: '/student/applications',
      });
    }

    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log(`
==================================================================
🌟 SEED CREDENTIALS SUMMARY:
------------------------------------------------------------------
👑 ADMIN:
   Email:    admin@gmail.com
   Password: admin123

🎓 STUDENT ANU (Primary Test Account):
   Email:    anu@student.com
   Password: password123
   College:  CEG Anna University, Chennai (B.Tech IT, CGPA 8.85)
   Status:   8 Applications with completely different tracking phases:
             1. Freshworks     -> SELECTED (Placed / Offer Letter)
             2. Chargebee      -> HR (Round 3 HR Scheduled)
             3. Kovai.co       -> TECHNICAL (Round 2 Tech on Zoom)
             4. Razorpay       -> ROUND_1 (Round 1 Online Test)
             5. Soliton        -> SHORTLISTED (Profile Shortlisted)
             6. Darwinbox      -> UNDER_REVIEW (Recruiter Reviewing)
             7. Kissflow       -> APPLIED (Recently Submitted)
             8. Vivriti Cap    -> REJECTED (Constructive Feedback)

🏢 VERIFIED COMPANIES (30 across Chennai, Coimbatore, Bangalore, Hyderabad):
   - Freshworks      → freshworks@careers.com (password123)
   - Chargebee       → chargebee@careers.com
   - Kovai.co        → kovaico@careers.com
   - Razorpay        → razorpay@careers.com
   - Soliton         → soliton@careers.com
   - Kissflow        → kissflow@careers.com
   - Ather Energy    → ather@careers.com
   - Darwinbox       → darwinbox@careers.com
   - ... and 22 more verified companies!
   (TCS and Zoho removed as requested!)

📊 DOMAIN STATS:
   12 Technical Fields / Domains, EACH with 10+ internships available!
   Total internships: 120+
   Total students: 36 Tamil Nadu students (target 30-50)
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
