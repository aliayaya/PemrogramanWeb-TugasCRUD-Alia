import { Router } from 'express';
import { getProduk, createProduk, updateProduk, deleteProduk } from '../controllers/produk.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', allowRoles('admin', 'operator', 'viewer'), getProduk);
router.post('/', allowRoles('admin', 'operator'), createProduk);
router.put('/:id', allowRoles('admin', 'operator'), updateProduk);
router.delete('/:id', allowRoles('admin'), deleteProduk);

export default router;
