import { Router } from 'express';
import { getMahasiswa, createMahasiswa, updateMahasiswa, deleteMahasiswa } from '../controllers/mahasiswa.controller';
import { upload } from '../middlewares/upload.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', allowRoles('admin', 'operator', 'viewer'), getMahasiswa);
router.post('/', allowRoles('admin', 'operator'), upload.single('foto'), createMahasiswa);
router.put('/:id', allowRoles('admin', 'operator'), upload.single('foto'), updateMahasiswa);
router.delete('/:id', allowRoles('admin'), deleteMahasiswa);

export default router;
