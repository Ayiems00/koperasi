import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import {
  getExpenseCategories,
  createExpenseCategory,
  getExpenses,
  createExpense,
  updateExpense,
  getExpenseVisibility,
  updateExpenseVisibility,
  exportExpensesPDF,
  exportExpensesExcel
} from '../controllers/expenseController';

const router = express.Router();

router.use(authenticateToken);

router.get('/categories', getExpenseCategories);
router.post('/categories', authorizeRole(['SUPER_ADMIN', 'ADMIN', 'FINANCE']), createExpenseCategory);

router.get('/', getExpenses);
router.post('/', authorizeRole(['SUPER_ADMIN', 'ADMIN', 'FINANCE']), createExpense);
router.put('/:id', authorizeRole(['SUPER_ADMIN', 'ADMIN', 'FINANCE']), updateExpense);

router.get('/visibility', authorizeRole(['SUPER_ADMIN', 'ADMIN', 'FINANCE']), getExpenseVisibility);
router.put('/visibility', authorizeRole(['SUPER_ADMIN']), updateExpenseVisibility);

router.get('/export/pdf', exportExpensesPDF);
router.get('/export/excel', exportExpensesExcel);

export default router;
