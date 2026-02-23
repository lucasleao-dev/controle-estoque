import { Router } from 'express';
import { autenticar } from '../middleware/auth';
import { obterDashboard } from '../controllers/DashboardController';

const router = Router();

router.get('/', autenticar, obterDashboard);

export default router;