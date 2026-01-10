import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { authenticateToken, authorizeRole, authorizeModule } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeModule('PRODUCTS'));

router.get('/', getProducts);
router.get('/:id', getProductById);

// Only Admin/Farm Manager can manage products/prices
router.post('/', authorizeRole(['ADMIN', 'FARM_MANAGER']), createProduct);
router.put('/:id', authorizeRole(['ADMIN', 'FARM_MANAGER']), updateProduct);
router.delete('/:id', authorizeRole(['ADMIN']), deleteProduct);

export default router;
