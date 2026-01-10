import express from 'express';
import { createTransaction, getTransactions, getTransactionById } from '../controllers/transactionController';
import { authenticateToken, authorizeModule } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeModule('POS'));

router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);

export default router;
