import mongoose from 'mongoose';

const interviewRoundStatusSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  name: { type: String, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'SCHEDULED', 'CLEARED', 'REJECTED', 'SKIPPED'],
    default: 'PENDING',
  },
  scheduledDate: { type: Date },
  interviewMode: { type: String, enum: ['ONLINE_GOOGLE_MEET', 'ONLINE_ZOOM', 'ONLINE_TEAMS', 'IN_PERSON', 'TELEPHONIC'], default: 'ONLINE_GOOGLE_MEET' },
  meetingLink: { type: String, default: '' },
  venue: { type: String, default: '' },
  instructions: { type: String, default: '' },
  feedback: { type: String, default: '' },
  completedAt: { type: Date },
}, { _id: false });

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true,
    index: true,
  },
  studentUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true,
    index: true,
  },
  industry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IndustryProfile',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: [
      'APPLIED',
      'UNDER_REVIEW',
      'SHORTLISTED',
      'ROUND_1',
      'ROUND_2',
      'TECHNICAL',
      'HR',
      'SELECTED',
      'ON_HOLD',
      'REJECTED'
    ],
    default: 'APPLIED',
    index: true,
  },
  rounds: [interviewRoundStatusSchema],
  activeRoundNumber: {
    type: Number,
    default: 0,
  },
  matchScore: {
    type: Number,
    default: 0,
  },
  aiMatchDetails: {
    skillMatchPercentage: { type: Number, default: 0 },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    reasons: [{ type: String }],
  },
  coverNote: {
    type: String,
    default: '',
  },
  notesByIndustry: {
    type: String,
    default: '',
  },
  // Soft deletion for rejected applications on student view
  deletedByStudent: {
    type: Boolean,
    default: false,
    index: true,
  },
  statusUpdatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

// Enforce compound unique index so student cannot apply twice
applicationSchema.index({ student: 1, internship: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);
