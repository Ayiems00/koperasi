import express from 'express';
import { getLivestock, getLivestockById, createLivestock, updateLivestock, deleteLivestock } from '../controllers/livestockController';
import { authenticateToken, authorizeRole, authorizeModule } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);
router.use(authorizeModule('INVENTORY'));

router.get('/', getLivestock);
router.get('/:id', getLivestockById);

// Only specific roles can modify inventory
router.post('/', authorizeRole(['ADMIN', 'FARM_MANAGER']), createLivestock);
router.put('/:id', authorizeRole(['ADMIN', 'FARM_MANAGER']), updateLivestock);
router.delete('/:id', authorizeRole(['ADMIN']), deleteLivestock);

export default router;
