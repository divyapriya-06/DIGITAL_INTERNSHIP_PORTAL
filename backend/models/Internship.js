import mongoose from 'mongoose';

const interviewRoundDefinitionSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  name: { type: String, required: true }, // e.g. "Aptitude Assessment", "Technical Interview", "HR Discussion"
  type: { type: String, enum: ['ONLINE_TEST', 'TECHNICAL', 'HR', 'CODING', 'MANAGERIAL'], default: 'TECHNICAL' },
  description: { type: String, default: '' },
}, { _id: false });

const internshipSchema = new mongoose.Schema({
  industry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IndustryProfile',
    required: true,
    index: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  domain: {
    type: String,
    required: true,
    index: true, // e.g. "Full Stack Development", "AI & Machine Learning", "Data Engineering", "Cloud & DevOps", "Mobile Apps"
  },
  description: {
    type: String,
    required: true,
  },
  requiredSkills: [{
    type: String,
    required: true,
    index: true,
  }],
  preferredSkills: [{
    type: String,
  }],
  experienceRequired: {
    type: String,
    enum: ['FRESHER', '0-1_YEARS', '1-2_YEARS', 'ANY'],
    default: 'FRESHER',
  },
  educationRequired: {
    type: String,
    default: 'B.E / B.Tech / MCA / M.Sc in CS / IT / Related Disciplines',
  },
  location: {
    type: String,
    required: true,
    index: true, // e.g. "Chennai", "Bangalore", "Hyderabad", "Remote"
  },
  workMode: {
    type: String,
    enum: ['REMOTE', 'HYBRID', 'ON_SITE'],
    default: 'HYBRID',
    index: true,
  },
  duration: {
    type: String,
    default: '6 Months',
  },
  stipend: {
    type: Number,
    required: true,
    min: 0,
    index: true,
  },
  stipendType: {
    type: String,
    enum: ['PER_MONTH', 'LUMP_SUM', 'PERFORMANCE_BASED'],
    default: 'PER_MONTH',
  },
  applicationDeadline: {
    type: Date,
    required: true,
    index: true,
  },
  // Private vacancy field: STRICTLY HIDDEN FROM STUDENTS
  requiredCandidates: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  selectedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  applicationCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  interviewRounds: [interviewRoundDefinitionSchema],
  status: {
    type: String,
    enum: ['OPEN', 'FILLED', 'CLOSED', 'EXPIRED', 'INACTIVE'],
    default: 'OPEN',
    index: true,
  },
  perks: [{ type: String }],
  eligibilityCgpa: {
    type: Number,
    default: 6.0,
  }
}, {
  timestamps: true,
});

// Check if vacancy is full and update status
internshipSchema.methods.checkFulfillment = function() {
  if (this.selectedCount >= this.requiredCandidates && this.status === 'OPEN') {
    this.status = 'FILLED';
  }
  return this.status;
};

export default mongoose.model('Internship', internshipSchema);
