import mongoose from 'mongoose';

const industryProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  officialEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    default: '',
  },
  companyDescription: {
    type: String,
    default: '',
  },
  industryType: {
    type: String,
    default: 'Information Technology',
  },
  companyLocation: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    default: '',
  },

  // Verification
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'ON_HOLD'],
    default: 'PENDING',
    index: true,
  },
  verificationProofPath: {
    type: String,
    default: '',
  },
  verificationProofOriginalName: {
    type: String,
    default: '',
  },
  verificationUploadedAt: {
    type: Date,
  },
  verificationReviewedAt: {
    type: Date,
  },
  verificationRejectionReason: {
    type: String,
    default: '',
  },
  
  // Stats & Ratings
  averageRating: {
    type: Number,
    default: 4.8,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

export default mongoose.model('IndustryProfile', industryProfileSchema);
