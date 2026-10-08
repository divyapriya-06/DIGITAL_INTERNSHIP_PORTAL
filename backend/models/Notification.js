import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['APPLICATION_UPDATE', 'INTERVIEW_SCHEDULED', 'AI_MATCH', 'VERIFICATION_UPDATE', 'NEW_APPLICATION', 'SYSTEM'],
    default: 'SYSTEM',
  },
  link: {
    type: String,
    default: '',
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  }
}, {
  timestamps: true,
});

export default mongoose.model('Notification', notificationSchema);
