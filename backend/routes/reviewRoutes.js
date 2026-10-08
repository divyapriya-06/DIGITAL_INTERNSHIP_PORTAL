import express from 'express';
import { createReview, getIndustryReviews, getAllReviews, getAllCompaniesForReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/companies', getAllCompaniesForReviews);
router.post('/', protect, createReview);
router.get('/industry/:id', getIndustryReviews);
router.get('/all', protect, getAllReviews);

export default router;
