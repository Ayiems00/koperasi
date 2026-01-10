import express from 'express';
import { 
    getUsers, 
    createUser, 
    updateUser, 
    requestProfileChange, 
    handleProfileChangeRequest, 
    getPendingRequests,
    getUserPermissions,
    updateUserPermissions,
    getMyPermissions
} from '../controllers/userController';
import { authenticateToken, authorizeRole, authorizeModule } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken);

// User Management (Admin/Super Admin)
router.get('/', authorizeRole(['SUPER_ADMIN', 'ADMIN']), authorizeModule('USERS'), getUsers);
router.post('/', authorizeRole(['SUPER_ADMIN', 'ADMIN']), authorizeModule('USERS'), createUser);
router.put('/:id', authorizeRole(['SUPER_ADMIN', 'ADMIN']), authorizeModule('USERS'), updateUser);

// Profile Requests
router.post('/request-change', requestProfileChange); // Any auth user
router.get('/requests', authorizeRole(['SUPER_ADMIN', 'ADMIN']), authorizeModule('USERS'), getPendingRequests);
router.put('/requests/:id', authorizeRole(['SUPER_ADMIN', 'ADMIN']), authorizeModule('USERS'), handleProfileChangeRequest);

// Current user's permissions must be above dynamic route to avoid shadowing
router.get('/me/permissions', getMyPermissions);

// Permissions (Super Admin only) for specific user id
router.get('/:id/permissions', authorizeRole(['SUPER_ADMIN']), authorizeModule('USERS'), getUserPermissions);
router.put('/:id/permissions', authorizeRole(['SUPER_ADMIN']), authorizeModule('USERS'), updateUserPermissions);

export default router;
