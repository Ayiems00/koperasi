import express from 'express';
import { register, login, resetPassword, getMe } from '../controllers/authController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.post('/reset-password', authenticateToken, authorizeRole(['SUPER_ADMIN']), resetPassword);

export default router;
