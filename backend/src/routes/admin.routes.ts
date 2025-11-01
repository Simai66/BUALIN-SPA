import { Router } from 'express';
import { getDashboard, exportPDF, exportExcel } from '../controllers/admin.controller';
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
  getAllTherapists,
  createTherapist,
  updateTherapist,
  deleteTherapist,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getTherapistDaysOff,
  createTherapistDayOff,
  deleteTherapistDayOff,
} from '../controllers/admin.crud.controller';
import { authGuard, adminGuard } from '../middleware/auth';
import { adminLimiter } from '../middleware/rateLimit';
import { validateBody, updateServiceSchema, updateTherapistSchema, updateUserSchema, createServiceSchema, createTherapistSchema, createUserSchema, createDayOffSchema } from '../utils/validate';

const router = Router();

router.use(authGuard, adminGuard, adminLimiter);

router.get('/dashboard', getDashboard);
router.get('/export/pdf', exportPDF);
router.get('/export/excel', exportExcel);

// CRUD: Services
router.get('/services', getAllServices);
router.post('/services', validateBody(createServiceSchema), createService);
router.put('/services/:id', validateBody(updateServiceSchema), updateService);
router.delete('/services/:id', deleteService);

// CRUD: Therapists
router.get('/therapists', getAllTherapists);
router.post('/therapists', validateBody(createTherapistSchema), createTherapist);
router.put('/therapists/:id', validateBody(updateTherapistSchema), updateTherapist);
router.delete('/therapists/:id', deleteTherapist);

// CRUD: Users
router.get('/users', getAllUsers);
router.post('/users', validateBody(createUserSchema), createUser);
router.put('/users/:id', validateBody(updateUserSchema), updateUser);
router.delete('/users/:id', deleteUser);

// Days Off: Therapists
router.get('/days-off', getTherapistDaysOff);
router.post('/days-off', validateBody(createDayOffSchema), createTherapistDayOff);
router.delete('/days-off/:id', deleteTherapistDayOff);

export default router;
