import express from 'express';
import { processSlaughter, getSlaughterLogs } from '../controllers/slaughterController';
import { authenticateToken, authorizeRole, authorizeModule } from '../middleware/authMiddleware';

const router = express.Router();

// Process Slaughter (Admin, Farm Manager, Inventory)
router.post('/', authenticateToken, authorizeModule('SLAUGHTER'), authorizeRole(['ADMIN', 'FARM_MANAGER', 'INVENTORY']), processSlaughter);

// Get Logs (All authorized roles including Auditor)
router.get('/', authenticateToken, authorizeModule('SLAUGHTER'), getSlaughterLogs);

export default router;
