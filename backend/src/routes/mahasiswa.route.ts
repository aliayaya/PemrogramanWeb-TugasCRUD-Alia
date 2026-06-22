import { Router } from 'express';
import { getMahasiswa, createMahasiswa, updateMahasiswa, deleteMahasiswa } from '../controllers/mahasiswa.controller';

const router = Router();

router.get('/', getMahasiswa);
router.post('/', createMahasiswa);
router.put('/:id', updateMahasiswa);
router.delete('/:id', deleteMahasiswa);

export default router;
