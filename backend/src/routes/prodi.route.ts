import { Router } from 'express';
import { getProdi } from '../controllers/prodi.controller';

const router = Router();

router.get('/', getProdi);

export default router;
