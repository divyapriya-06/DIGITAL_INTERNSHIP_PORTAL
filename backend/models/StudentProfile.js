import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  technologies: [{ type: String }],
  githubLink: { type: String, default: '' },
  liveLink: { type: String, default: '' }
}, { _id: true });

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  duration: { type: String, default: '' },
  description: { type: String, default: '' },
  type: { type: String, enum: ['INTERNSHIP', 'FULL_TIME', 'FREELANCE', 'TRAINING'], default: 'INTERNSHIP' }
}, { _id: true });

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  // Personal Details
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  location: { type: String, default: '' },
  bio: { type: String, default: '' },
  preferredLocations: [{ type: String }],
  profilePhoto: { type: String, default: '' },

  // Education Details
  college: { type: String, default: '', index: true },
  degree: { type: String, default: '' }, // e.g. B.E, B.Tech, MCA, M.Tech, B.Sc
  department: { type: String, default: '', index: true }, // e.g. Computer Science, AI & DS, IT, ECE
  cgpa: { type: Number, min: 0, max: 10, default: 0 },
  graduationYear: { type: Number, index: true },

  // Skills
  technicalSkills: [{ type: String }],
  programmingLanguages: [{ type: String }],
  frameworks: [{ type: String }],
  tools: [{ type: String }],
  softSkills: [{ type: String }],

  // Experience & Projects
  experienceLevel: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'EXPERIENCED'], default: 'BEGINNER' },
  experiences: [experienceSchema],
  projects: [projectSchema],

  // Preferences
  preferredRole: { type: String, default: '' },
  preferredDomain: { type: String, default: '' }, // e.g. Fullstack, AI/ML, Cloud/DevOps, Mobile, Cybersecurity
  preferredStipend: { type: Number, default: 0 },
  preferredWorkMode: { type: String, enum: ['ANY', 'REMOTE', 'HYBRID', 'ON_SITE'], default: 'ANY' },
  preferredDuration: { type: String, default: '3-6 Months' },

  // Resume data
  resumeOriginalName: { type: String, default: '' },
  resumePath: { type: String, default: '' },
  resumeUploadedAt: { type: Date },
  resumeExtractedText: { type: String, default: '' },
  resumeExtractedSkills: [{ type: String }],
  resumeExtractedProjects: [{ type: String }],
  resumeExtractedRoles: [{ type: String }],
  resumeExtractedEducation: { type: String, default: '' },

  // Profile completion score
  profileCompletionPercentage: { type: Number, default: 20, min: 0, max: 100 },

  // Administrative flag
  isFlaggedDuplicate: { type: Boolean, default: false },
  duplicateFlagReason: { type: String, default: '' },
}, {
  timestamps: true,
});

// Calculate profile completion percentage
studentProfileSchema.methods.calculateCompletion = function() {
  let score = 0;
  if (this.fullName && this.phone) score += 15;
  if (this.college && this.degree && this.department && this.cgpa) score += 20;
  if (this.technicalSkills && this.technicalSkills.length > 0) score += 20;
  if (this.projects && this.projects.length > 0) score += 15;
  if (this.preferredRole || this.preferredDomain) score += 10;
  if (this.resumePath) score += 20;
  this.profileCompletionPercentage = Math.min(100, score);
  return this.profileCompletionPercentage;
};

export default mongoose.model('StudentProfile', studentProfileSchema);
