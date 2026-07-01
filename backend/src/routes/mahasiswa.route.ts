import { Router } from 'express';
import { getMahasiswa, createMahasiswa, updateMahasiswa, deleteMahasiswa } from '../controllers/mahasiswa.controller';
import { upload } from '../middlewares/upload.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getMahasiswa);
router.post('/', upload.single('foto'), createMahasiswa);
router.put('/:id', upload.single('foto'), updateMahasiswa);
router.delete('/:id', deleteMahasiswa);

export default router;
