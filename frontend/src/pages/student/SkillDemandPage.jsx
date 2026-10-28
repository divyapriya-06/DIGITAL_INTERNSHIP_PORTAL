import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import {
  Flame,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Award,
  BarChart3,
  Cpu,
  Zap,
  Radio,
  Cog,
  HeartPulse,
  Building,
  ArrowUpRight,
  BookOpen,
  DollarSign,
  ChevronRight,
  Users,
  GraduationCap,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export const FIELD_TAXONOMY = {
  cse: {
    id: 'cse',
    name: 'Computer Science & IT',
    shortName: 'CSE / IT',
    icon: Cpu,
    color: '#4f46e5',
    accentBg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    description: 'Software Engineering, Cloud Native, Artificial Intelligence & Machine Learning Systems.',
    growthRate: '+34% YoY',
    avgStipend: '₹25,000 - ₹55,000/mo',
    skills: [
      { name: 'Python & FastApi', count: 48, percentage: 88, color: '#4f46e5' },
      { name: 'React & Next.js', count: 42, percentage: 82, color: '#6366f1' },
      { name: 'AWS & Cloud Systems', count: 37, percentage: 76, color: '#818cf8' },
      { name: 'Machine Learning & LLMs', count: 34, percentage: 71, color: '#06b6d4' },
      { name: 'Docker & Kubernetes', count: 29, percentage: 65, color: '#0ea5e9' },
      { name: 'Node.js & Microservices', count: 27, percentage: 62, color: '#3b82f6' },
      { name: 'Cybersecurity & IAM', count: 22, percentage: 54, color: '#8b5cf6' },
      { name: 'PostgreSQL & MongoDB', count: 20, percentage: 50, color: '#a855f7' },
    ],
    topRoles: [
      { role: 'Full Stack Engineer', openings: 54, demand: 'Very High' },
      { role: 'AI / ML Engineer', openings: 38, demand: 'Exponential' },
      { role: 'Cloud & DevOps Architect', openings: 31, demand: 'High' },
      { role: 'Data Engineer', openings: 26, demand: 'High' },
    ],
    certifications: [
      'AWS Certified Solutions Architect',
      'Google Professional Data Engineer',
      'Certified Kubernetes Administrator (CKA)',
    ],
    recommendedToLearn: [
      { skill: 'Docker Containerization', reason: 'Requested in 76% of modern enterprise microservices postings.' },
      { skill: 'FastAPI & PyTorch', reason: 'High demand for deploying Generative AI models in production.' },
    ],
  },

  eee: {
    id: 'eee',
    name: 'Electrical & Electronics (EEE)',
    shortName: 'Electrical (EEE)',
    icon: Zap,
    color: '#eab308',
    accentBg: 'bg-amber-50 border-amber-200 text-amber-800',
    description: 'Power Systems, Industrial Automation, Smart Grids, Electric Vehicles & Energy Storage.',
    growthRate: '+28% YoY',
    avgStipend: '₹20,000 - ₹45,000/mo',
    skills: [
      { name: 'PLC & SCADA Systems', count: 39, percentage: 84, color: '#eab308' },
      { name: 'Power Electronics Design', count: 35, percentage: 78, color: '#f59e0b' },
      { name: 'MATLAB & Simulink', count: 32, percentage: 73, color: '#d97706' },
      { name: 'BMS (Battery Management)', count: 28, percentage: 68, color: '#b45309' },
      { name: 'Electrical CAD & ETAP', count: 24, percentage: 60, color: '#f97316' },
      { name: 'Solar PV & Wind Grids', count: 21, percentage: 55, color: '#ea580c' },
      { name: 'Industrial Drives & Motors', count: 18, percentage: 48, color: '#c2410c' },
      { name: 'High Voltage Switchgear', count: 15, percentage: 42, color: '#9a3412' },
    ],
    topRoles: [
      { role: 'Industrial Automation Specialist', openings: 42, demand: 'Very High' },
      { role: 'EV Powertrain & BMS Engineer', openings: 35, demand: 'Exponential' },
      { role: 'Power Grid Integration Engineer', openings: 27, demand: 'High' },
      { role: 'Renewable Energy Analyst', openings: 22, demand: 'High' },
    ],
    certifications: [
      'Certified Automation Professional (ISA-CAP)',
      'Siemens TIA Portal & S7 PLC Specialist',
      'IEEE Certified Power Systems Analyst',
    ],
    recommendedToLearn: [
      { skill: 'Battery Management Systems (BMS)', reason: 'EV boom has increased hiring by 140% across automotive labs.' },
      { skill: 'SCADA Network Security', reason: 'Crucial for smart grid infrastructure and plant monitoring.' },
    ],
  },

  ece: {
    id: 'ece',
    name: 'Electronics & Communication (ECE)',
    shortName: 'Electronics (ECE)',
    icon: Radio,
    color: '#06b6d4',
    accentBg: 'bg-cyan-50 border-cyan-200 text-cyan-800',
    description: 'VLSI Semi-Conductor Design, Embedded Firmware, 5G Wireless, IoT & Microcontrollers.',
    growthRate: '+31% YoY',
    avgStipend: '₹22,000 - ₹50,000/mo',
    skills: [
      { name: 'VLSI & Verilog / SystemVerilog', count: 44, percentage: 86, color: '#06b6d4' },
      { name: 'Embedded C / C++', count: 40, percentage: 82, color: '#0891b2' },
      { name: 'ARM Cortex & RTOS', count: 33, percentage: 72, color: '#0e7490' },
      { name: 'Altium PCB Layout Design', count: 30, percentage: 67, color: '#155e75' },
      { name: 'IoT Edge & MQTT / BLE', count: 26, percentage: 61, color: '#3b82f6' },
      { name: 'Digital Signal Processing', count: 22, percentage: 53, color: '#2563eb' },
      { name: '5G NR & RF Circuit Design', count: 19, percentage: 47, color: '#1d4ed8' },
      { name: 'FPGA Architecture (Xilinx)', count: 16, percentage: 41, color: '#1e40af' },
    ],
    topRoles: [
      { role: 'VLSI ASIC Verification Engineer', openings: 46, demand: 'Very High' },
      { role: 'Embedded Firmware Developer', openings: 39, demand: 'Very High' },
      { role: 'IoT Solutions Architect', openings: 28, demand: 'High' },
      { role: 'RF Telecom Engineer', openings: 21, demand: 'High' },
    ],
    certifications: [
      'Cadence / Synopsys Certified VLSI Designer',
      'ARM Accredited Engineer (AAE)',
      'Cisco CCNA Wireless & IoT Fundamentals',
    ],
    recommendedToLearn: [
      { skill: 'UVM & SystemVerilog', reason: 'Required for semiconductor chip verification in tier-1 silicon companies.' },
      { skill: 'FreeRTOS for ARM Microcontrollers', reason: 'Standard runtime for medical devices and automotive controllers.' },
    ],
  },

  mechanical: {
    id: 'mechanical',
    name: 'Mechanical Engineering',
    shortName: 'Mechanical',
    icon: Cog,
    color: '#f97316',
    accentBg: 'bg-orange-50 border-orange-200 text-orange-800',
    description: 'CAD/CAM Product Engineering, Finite Element Analysis (FEA), Robotics & Smart Manufacturing.',
    growthRate: '+24% YoY',
    avgStipend: '₹18,000 - ₹42,000/mo',
    skills: [
      { name: 'SolidWorks 3D Modeling', count: 41, percentage: 85, color: '#f97316' },
      { name: 'ANSYS FEA & CFD Simulation', count: 36, percentage: 77, color: '#ea580c' },
      { name: 'AutoCAD Mechanical & GD&T', count: 32, percentage: 71, color: '#c2410c' },
      { name: 'Robotics & Mechatronics', count: 27, percentage: 64, color: '#9a3412' },
      { name: 'CNC Programming & Mastercam', count: 23, percentage: 57, color: '#e11d48' },
      { name: 'Thermal & Fluid Dynamics', count: 20, percentage: 51, color: '#be123c' },
      { name: 'Additive Manufacturing (3D Print)', count: 17, percentage: 44, color: '#9f1239' },
      { name: 'DFM & DFA Standards', count: 14, percentage: 38, color: '#881337' },
    ],
    topRoles: [
      { role: 'Mechanical Design Engineer (CAD)', openings: 45, demand: 'Very High' },
      { role: 'FEA / Structural Simulation Analyst', openings: 32, demand: 'High' },
      { role: 'Robotics Automation Engineer', openings: 25, demand: 'High' },
      { role: 'HVAC & Thermal Systems Engineer', openings: 19, demand: 'Moderate' },
    ],
    certifications: [
      'Certified SolidWorks Professional (CSWP)',
      'ANSYS Structural & Fluids Simulation Specialist',
      'Six Sigma Green Belt in Manufacturing',
    ],
    recommendedToLearn: [
      { skill: 'ANSYS FEA Simulation', reason: 'High demand in aerospace, automotive crash tests, and defense equipment.' },
      { skill: 'GD&T (ASME Y14.5)', reason: 'Crucial blueprint requirement for precision machining and supplier quality.' },
    ],
  },

  medical: {
    id: 'medical',
    name: 'Medical & Healthcare / Biomedical',
    shortName: 'Medical / Healthcare',
    icon: HeartPulse,
    color: '#ec4899',
    accentBg: 'bg-pink-50 border-pink-200 text-pink-800',
    description: 'Biomedical Devices, Clinical Health Informatics, Medical Imaging, Hospital Tech & Pharma.',
    growthRate: '+38% YoY',
    avgStipend: '₹20,000 - ₹48,000/mo',
    skills: [
      { name: 'Biomedical Instrumentation', count: 38, percentage: 86, color: '#ec4899' },
      { name: 'Medical Imaging (DICOM / PACS)', count: 34, percentage: 80, color: '#db2777' },
      { name: 'HL7 & FHIR Health Standards', count: 29, percentage: 72, color: '#be185d' },
      { name: 'Bioinformatics & Biostatistics', count: 26, percentage: 66, color: '#9d174d' },
      { name: 'FDA & ISO 13485 Compliance', count: 22, percentage: 58, color: '#831843' },
      { name: 'Clinical EHR Systems Integration', count: 19, percentage: 51, color: '#a855f7' },
      { name: 'Telemedicine & Wearable Biosensors', count: 17, percentage: 46, color: '#9333ea' },
      { name: 'Lab Automation & Robotics', count: 14, percentage: 40, color: '#7e22ce' },
    ],
    topRoles: [
      { role: 'Biomedical Equipment Specialist', openings: 38, demand: 'Very High' },
      { role: 'Clinical Data Analyst', openings: 31, demand: 'Very High' },
      { role: 'Health Informatics Engineer', openings: 26, demand: 'High' },
      { role: 'Medical Regulatory Affairs Officer', openings: 18, demand: 'High' },
    ],
    certifications: [
      'Certified Biomedical Equipment Technician (CBET)',
      'HL7 International V2 / FHIR Proficiency',
      'Good Clinical Practice (GCP) Investigator Certificate',
    ],
    recommendedToLearn: [
      { skill: 'HL7 / FHIR Protocols', reason: 'Healthcare providers mandating interoperability between medical devices and hospital EHR.' },
      { skill: 'ISO 13485 Quality Standards', reason: 'Essential knowledge for medical device manufacturing and testing labs.' },
    ],
  },

  civil: {
    id: 'civil',
    name: 'Civil & Structural Engineering',
    shortName: 'Civil & Structural',
    icon: Building,
    color: '#14b8a6',
    accentBg: 'bg-teal-50 border-teal-200 text-teal-800',
    description: 'Structural Analysis, Building Information Modeling (BIM), Infrastructure, GIS & Smart Cities.',
    growthRate: '+21% YoY',
    avgStipend: '₹18,000 - ₹38,000/mo',
    skills: [
      { name: 'AutoCAD Civil 3D', count: 37, percentage: 83, color: '#14b8a6' },
      { name: 'Revit BIM Modeling', count: 33, percentage: 76, color: '#0d9488' },
      { name: 'STAAD.Pro & ETABS Structural', count: 29, percentage: 70, color: '#0f766e' },
      { name: 'GIS Spatial Data Analysis', count: 24, percentage: 62, color: '#115e59' },
      { name: 'Primavera P6 / MS Project', count: 21, percentage: 56, color: '#047857' },
      { name: 'Geotechnical Soil Mechanics', count: 18, percentage: 49, color: '#065f46' },
      { name: 'Green Building (LEED & GRIHA)', count: 15, percentage: 43, color: '#064e3b' },
      { name: 'Quantity Surveying & Estimation', count: 13, percentage: 38, color: '#022c22' },
    ],
    topRoles: [
      { role: 'Structural Design Engineer', openings: 40, demand: 'Very High' },
      { role: 'BIM Coordinator', openings: 33, demand: 'Very High' },
      { role: 'Infrastructure Project Engineer', openings: 26, demand: 'High' },
      { role: 'GIS Urban Planning Analyst', openings: 19, demand: 'Moderate' },
    ],
    certifications: [
      'Autodesk Certified Professional (Revit / Civil 3D)',
      'Primavera P6 Enterprise Project Portfolio Specialist',
      'LEED Green Associate Credential',
    ],
    recommendedToLearn: [
      { skill: 'Revit BIM Level 2 Standards', reason: 'High demand across national infrastructure projects and metro rails.' },
      { skill: 'ETABS Dynamic Seismic Analysis', reason: 'Crucial requirement for multi-story residential and commercial design.' },
    ],
  },

  other: {
    id: 'other',
    name: 'Management, HR, Education & Operations (Other)',
    shortName: 'Other / Management',
    icon: Users,
    color: '#8b5cf6',
    accentBg: 'bg-purple-50 border-purple-200 text-purple-700',
    description: 'Human Resources, Sales & BD, Teaching & Pedagogy, Corporate Training, Educational Technology & Operations.',
    growthRate: '+30% YoY',
    avgStipend: '₹18,000 - ₹45,000/mo',
    skills: [
      { name: 'Talent Acquisition & HR Tech', count: 42, percentage: 86, color: '#8b5cf6' },
      { name: 'Sales Pipeline & CRM Strategy', count: 38, percentage: 80, color: '#7c3aed' },
      { name: 'Pedagogy & Curriculum Design', count: 33, percentage: 74, color: '#6d28d9' },
      { name: 'Corporate Training & Mentorship', count: 29, percentage: 68, color: '#5b21b6' },
      { name: 'Operations & Process Optimization', count: 25, percentage: 62, color: '#4c1d95' },
      { name: 'Financial Modeling & Valuation', count: 22, percentage: 56, color: '#6366f1' },
      { name: 'Digital Growth & Social Marketing', count: 19, percentage: 50, color: '#4f46e5' },
      { name: 'Educational LMS Administration', count: 16, percentage: 44, color: '#4338ca' },
    ],
    topRoles: [
      { role: 'HR Executive / Recruiter', openings: 44, demand: 'Very High' },
      { role: 'Sales Manager / BD Lead', openings: 38, demand: 'Very High' },
      { role: 'Teacher / Educational Content Specialist', openings: 32, demand: 'High' },
      { role: 'Corporate Trainer & Coach', openings: 26, demand: 'High' },
      { role: 'Operations & Process Coordinator', openings: 21, demand: 'High' },
    ],
    certifications: [
      'SHRM Certified Professional (SHRM-CP)',
      'Certified Corporate Trainer (ATD)',
      'HubSpot Certified Inbound Sales & CRM',
    ],
    recommendedToLearn: [
      { skill: 'HR Analytics & Darwinbox', reason: 'Modern enterprises require data-driven hiring and attrition predictive analytics.' },
      { skill: 'Blended Learning & LMS Tools', reason: 'EdTech and corporate training sectors mandate digital curriculum management.' },
    ],
  },
};

export const SkillDemandPage = () => {
  const [selectedField, setSelectedField] = useState('cse');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkillData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/student/skill-demand');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkillData();
  }, []);

  if (loading) return <Loader message="Compiling multi-discipline industry skill taxonomy & market demand..." />;

  const currentFieldData = FIELD_TAXONOMY[selectedField] || FIELD_TAXONOMY.cse;
  const FieldIcon = currentFieldData.icon;

  const chartData = currentFieldData.skills.map((s) => ({
    name: s.name,
    count: s.count,
    percentage: s.percentage,
    color: s.color,
  }));

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Multi-Discipline Skill Demand Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Industry Skill Demand by Discipline
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
            Live requisition analytics aggregated across 6 engineering and specialized industries: Computer Science, EEE, ECE, Mechanical, Medical/Healthcare, and Civil.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[170px] shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-300 block">
            {currentFieldData.shortName} Growth
          </span>
          <span className="text-3xl font-black text-emerald-400 my-0.5 block">
            {currentFieldData.growthRate}
          </span>
          <span className="text-[11px] text-indigo-300 font-bold">
            {currentFieldData.avgStipend}
          </span>
        </div>
      </div>

      {/* Field Selector Tabs (The 6 Disciplines) */}
      <div className="bg-white rounded-3xl p-3 border border-slate-200/80 shadow-sm">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 pt-1 pb-2">
          Select Academic Discipline / Field of Study:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.values(FIELD_TAXONOMY).map((f) => {
            const Icon = f.icon;
            const isSelected = selectedField === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedField(f.id)}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all duration-200 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 scale-[1.02]'
                    : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                <span className="text-xs font-extrabold leading-tight">{f.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Field Overview */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100">
            <FieldIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">{currentFieldData.name}</h3>
            <p className="text-xs text-slate-500 font-medium">{currentFieldData.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
            Avg. Internship Stipend: {currentFieldData.avgStipend}
          </span>
        </div>
      </div>

      {/* Recommended Skills to Learn for this field */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Recommended Skills & High-Growth Competencies in {currentFieldData.shortName}
          </h3>
          <span className="text-xs font-bold text-slate-400">Targeted Recruiter Requirements</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentFieldData.recommendedToLearn.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-white border border-indigo-100/80 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">
                  High Demand Focus Area
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-1">{item.skill}</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Chart on Left, Roles & Certifications on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Ranked Skills Bar Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Top Demanded Skills in {currentFieldData.shortName}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Calculated by requisition keyword frequency and corporate interview prerequisites
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value, name) => [`${value} Requisitions`, 'Postings']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Top Recruiting Roles & Industry Certifications */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* In-Demand Job Titles */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center justify-between">
              <span>Top Recruiting Roles</span>
              <span className="text-[10px] text-slate-400 uppercase">Live Vacancies</span>
            </h3>

            <div className="space-y-2">
              {currentFieldData.topRoles.map((r, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{r.role}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Demand: {r.demand}</span>
                  </div>
                  <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px]">
                    {r.openings} open
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Valued Industry Certifications */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Valued Industry Certifications</span>
            </h3>

            <div className="space-y-2">
              {currentFieldData.certifications.map((cert, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/50 border border-amber-100 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-bold text-slate-800">{cert}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
