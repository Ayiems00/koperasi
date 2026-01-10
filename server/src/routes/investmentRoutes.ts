import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import { 
  submitMemberInvestment,
  getPendingInvestments,
  getMyInvestments,
  approveInvestment,
  rejectInvestment,
  getIndividualInvestments,
  getInvestmentSummary,
  upsertInvestmentSummary,
  getInvestmentHistory,
  getInvestmentSummaryHistory,
  getDividendSettings,
  setDividendSetting,
  cancelDividend,
  getDividendHistory,
  getROI
} from '../controllers/investmentController';

const router = express.Router();

router.use(authenticateToken);

// Member Investments
router.post('/member', submitMemberInvestment);
router.get('/member/pending', authorizeRole(['SUPER_ADMIN', 'FINANCE']), getPendingInvestments);
router.get('/member/history', authorizeRole(['SUPER_ADMIN', 'FINANCE']), getInvestmentHistory);
router.get('/member/me', getMyInvestments);
router.put('/member/:id/approve', authorizeRole(['SUPER_ADMIN', 'FINANCE']), approveInvestment);
router.put('/member/:id/reject', authorizeRole(['SUPER_ADMIN', 'FINANCE']), rejectInvestment);
router.get('/member/individual', authorizeRole(['SUPER_ADMIN', 'FINANCE']), getIndividualInvestments);

// Summary
router.get('/summary', authorizeRole(['SUPER_ADMIN', 'ADMIN', 'FINANCE']), getInvestmentSummary);
router.put('/summary', authorizeRole(['SUPER_ADMIN']), upsertInvestmentSummary);
router.get('/history', authorizeRole(['SUPER_ADMIN', 'FINANCE']), getInvestmentSummaryHistory);

// Dividends
router.get('/dividends', authorizeRole(['SUPER_ADMIN', 'ADMIN', 'FINANCE']), getDividendSettings);
router.post('/dividends', authorizeRole(['SUPER_ADMIN']), setDividendSetting);
router.put('/dividends/:id/cancel', authorizeRole(['SUPER_ADMIN']), cancelDividend);
router.get('/dividends/history', authorizeRole(['SUPER_ADMIN', 'ADMIN', 'FINANCE']), getDividendHistory);

// ROI
router.get('/roi', authorizeRole(['SUPER_ADMIN', 'ADMIN', 'FINANCE']), getROI);

export default router;
