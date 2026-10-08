import mongoose from 'mongoose';

const portalFeedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['student', 'industry', 'admin'],
    required: true,
  },
  category: {
    type: String,
    enum: ['PORTAL_IMPROVEMENT', 'SUGGESTION', 'FEATURE_REQUEST', 'BUG_REPORT', 'GENERAL'],
    default: 'PORTAL_IMPROVEMENT',
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM',
  },
  status: {
    type: String,
    enum: ['PENDING', 'UNDER_REVIEW', 'PLANNED', 'IMPLEMENTED', 'DISMISSED'],
    default: 'PENDING',
  },
  adminResponse: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export default mongoose.model('PortalFeedback', portalFeedbackSchema);
