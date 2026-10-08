import express from 'express';
import {
  getIndustryProfile,
  updateIndustryProfile,
  uploadVerificationProof,
  postInternship,
  getMyInternships,
  updateInternship,
  getIndustryApplications,
  getAICandidateRecommendations,
  searchCandidates,
  updateApplicationRoundStatus,
  getIndustryDashboard,
} from '../controllers/industryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { industryOnly, approvedIndustryOnly } from '../middleware/roleMiddleware.js';
import { uploadProof } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Profile & Verification
router.get('/profile', protect, industryOnly, getIndustryProfile);
router.put('/profile', protect, industryOnly, updateIndustryProfile);
router.post('/verification', protect, industryOnly, uploadProof.single('proof'), uploadVerificationProof);

// Dashboard
router.get('/dashboard', protect, industryOnly, getIndustryDashboard);

// Internships (Posting strictly requires approved status)
router.post('/internships', protect, industryOnly, approvedIndustryOnly, postInternship);
router.get('/internships', protect, industryOnly, getMyInternships);
router.put('/internships/:id', protect, industryOnly, updateInternship);

// Applications & Candidate Management
router.get('/applications', protect, industryOnly, getIndustryApplications);
router.put('/applications/:id/status', protect, industryOnly, updateApplicationRoundStatus);

// AI Reverse Candidate Matching & Candidate Search
router.get('/ai-candidates/:internshipId', protect, industryOnly, getAICandidateRecommendations);
router.get('/candidates/search', protect, industryOnly, searchCandidates);

export default router;
