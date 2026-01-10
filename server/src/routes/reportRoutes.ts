import express from 'express';
import { getSalesReport, getInventoryReport, getAllowanceReport, exportAllowanceCSV, exportAllowanceExcel, exportAllowancePDF } from '../controllers/reportController';
import { authenticateToken, authorizeRole, authorizeModule } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authorizeModule('REPORTS'));

// Sales Report
router.get('/sales', authenticateToken, authorizeRole(['SUPER_ADMIN', 'ADMIN', 'FINANCE']), getSalesReport);

// Inventory Report
router.get('/inventory', authenticateToken, authorizeRole(['SUPER_ADMIN', 'ADMIN', 'FARM_ADMIN']), getInventoryReport);

// Allowance Report
router.get('/allowance', authenticateToken, authorizeRole(['SUPER_ADMIN', 'ADMIN', 'FINANCE']), getAllowanceReport);
router.get('/allowance/export/csv', authenticateToken, authorizeRole(['SUPER_ADMIN', 'ADMIN', 'FINANCE']), exportAllowanceCSV);
router.get('/allowance/export/excel', authenticateToken, authorizeRole(['SUPER_ADMIN', 'ADMIN', 'FINANCE']), exportAllowanceExcel);
router.get('/allowance/export/pdf', authenticateToken, authorizeRole(['SUPER_ADMIN', 'ADMIN', 'FINANCE']), exportAllowancePDF);

export default router;
