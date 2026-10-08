import express from 'express';
import {
  getStudentProfile,
  updateStudentProfile,
  uploadStudentResume,
  deleteStudentResume,
  getRecommendedInternships,
  searchInternships,
  getInternshipDetails,
  applyForInternship,
  getStudentApplications,
  deleteRejectedApplication,
  getStudentDashboard,
  getStudentSkillDemandInsights,
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { studentOnly } from '../middleware/roleMiddleware.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Profile management
router.get('/profile', protect, studentOnly, getStudentProfile);
router.put('/profile', protect, studentOnly, updateStudentProfile);

// Resume upload & delete
router.post('/resume', protect, studentOnly, uploadResume.single('resume'), uploadStudentResume);
router.delete('/resume', protect, studentOnly, deleteStudentResume);

// Internship recommendations, search, details
router.get('/recommendations', protect, studentOnly, getRecommendedInternships);
router.get('/internships', protect, studentOnly, searchInternships);
router.get('/internships/:id', protect, studentOnly, getInternshipDetails);

// Applications
router.post('/apply/:id', protect, studentOnly, applyForInternship);
router.get('/applications', protect, studentOnly, getStudentApplications);
router.delete('/applications/:id', protect, studentOnly, deleteRejectedApplication);

// Dashboard & Skill Insights
router.get('/dashboard', protect, studentOnly, getStudentDashboard);
router.get('/skill-demand', protect, studentOnly, getStudentSkillDemandInsights);

export default router;
