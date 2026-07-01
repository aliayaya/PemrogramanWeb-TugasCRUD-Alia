import { Router } from 'express';
import { getProduk, createProduk, updateProduk, deleteProduk } from '../controllers/produk.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getProduk);
router.post('/', createProduk);
router.put('/:id', updateProduk);
router.delete('/:id', deleteProduk);

export default router;
