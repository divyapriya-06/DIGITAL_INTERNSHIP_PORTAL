import express from 'express';
import {
  submitPortalFeedback,
  getAllPortalFeedback,
  updatePortalFeedbackStatus,
} from '../controllers/portalFeedbackController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/portal', submitPortalFeedback);
router.get('/portal', getAllPortalFeedback);
router.put('/portal/:id/status', adminOnly, updatePortalFeedbackStatus);

export default router;
