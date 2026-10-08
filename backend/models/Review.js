import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  authorUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorRole: {
    type: String,
    enum: ['student', 'industry'],
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
  },
  industry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IndustryProfile',
    required: true,
    index: true,
  },
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  feedback: {
    type: String,
    required: true,
  },
  // Sub-criteria ratings
  mentorshipRating: { type: Number, min: 1, max: 5, default: 5 },
  workEnvironmentRating: { type: Number, min: 1, max: 5, default: 5 },
  learningOpportunitiesRating: { type: Number, min: 1, max: 5, default: 5 },
  // Industry-to-student ratings (when authorRole === 'industry')
  technicalRating: { type: Number, min: 1, max: 5 },
  communicationRating: { type: Number, min: 1, max: 5 },
  professionalismRating: { type: Number, min: 1, max: 5 },
}, {
  timestamps: true,
});

export default mongoose.model('Review', reviewSchema);
