import express from 'express';
import { registerUser, loginUser, getMe, deactivateAccount, deleteAccount } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/deactivate', protect, deactivateAccount);
router.delete('/delete', protect, deleteAccount);

export default router;
