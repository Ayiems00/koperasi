import express from 'express';
import { 
    getAllowanceTypes, 
    createAllowanceType, 
    createInvoiceAllowance, 
    getInvoiceAllowances, 
    updateInvoiceStatus,
    exportInvoicePDF
} from '../controllers/allowanceController';
import { authenticateToken, authorizeRole, authorizeModule, authorizeAnyModule } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken);

// Allowance Types
router.get('/types', authorizeModule('ALLOWANCE'), getAllowanceTypes);
router.post('/types', authorizeRole(['SUPER_ADMIN', 'ADMIN', 'FINANCE']), authorizeModule('ALLOWANCE'), createAllowanceType);

// Invoices
router.post('/invoices', authorizeRole(['SUPER_ADMIN', 'ADMIN', 'FINANCE']), authorizeModule('ALLOWANCE'), createInvoiceAllowance);
router.get('/invoices', authorizeAnyModule(['ALLOWANCE', 'MY_ALLOWANCE']), getInvoiceAllowances);
router.put('/invoices/:id/status', authorizeRole(['SUPER_ADMIN', 'ADMIN', 'FINANCE']), authorizeModule('ALLOWANCE'), updateInvoiceStatus);
router.get('/invoices/:id/pdf', authorizeAnyModule(['ALLOWANCE', 'MY_ALLOWANCE']), exportInvoicePDF);

export default router;
