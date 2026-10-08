import express from 'express';
import {
  getAdminDashboard,
  getVerificationRequests,
  updateVerificationStatus,
  getAllStudents,
  getAllIndustries,
  getAllInternships,
  updateInternshipStatusByAdmin,
  getAllApplications,
  getDuplicateFlags,
  resolveDuplicateFlag,
  getPlatformAnalytics,
  updateUserStatusByAdmin,
  deleteUserByAdmin,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Apply admin protection to all routes
router.use(protect, adminOnly);

router.get('/dashboard', getAdminDashboard);
router.get('/verifications', getVerificationRequests);
router.put('/verifications/:id', updateVerificationStatus);

router.get('/students', getAllStudents);
router.get('/industries', getAllIndustries);
router.put('/users/:id/status', updateUserStatusByAdmin);
router.delete('/users/:id', deleteUserByAdmin);

router.get('/internships', getAllInternships);
router.put('/internships/:id/status', updateInternshipStatusByAdmin);
router.get('/applications', getAllApplications);

router.get('/duplicate-flags', getDuplicateFlags);
router.put('/duplicate-flags/:id', resolveDuplicateFlag);

router.get('/analytics', getPlatformAnalytics);

export default router;
