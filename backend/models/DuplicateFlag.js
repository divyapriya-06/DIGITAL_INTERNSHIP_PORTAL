import mongoose from 'mongoose';

const duplicateFlagSchema = new mongoose.Schema({
  suspectUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  suspectProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true,
  },
  matchingUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  matchingProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true,
  },
  similarityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  matchedFields: [{ type: String }],
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['FLAGGED', 'REVIEWED_LEGITIMATE', 'RESOLVED_MERGED', 'DISMISSED'],
    default: 'FLAGGED',
    index: true,
  },
  adminNotes: {
    type: String,
    default: '',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  }
}, {
  timestamps: true,
});

export default mongoose.model('DuplicateFlag', duplicateFlagSchema);
