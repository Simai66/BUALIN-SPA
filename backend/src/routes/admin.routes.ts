import { Router } from 'express';
import { getDashboard, exportPDF, exportExcel } from '../controllers/admin.controller';
import { authGuard, adminGuard } from '../middleware/auth';
import { adminLimiter } from '../middleware/rateLimit';

const router = Router();

router.use(authGuard, adminGuard, adminLimiter);

router.get('/dashboard', getDashboard);
router.get('/export/pdf', exportPDF);
router.get('/export/excel', exportExcel);

export default router;
