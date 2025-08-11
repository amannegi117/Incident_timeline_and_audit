import { Router } from 'express';
import { getSharedIncident } from '../controllers/shareController';

const router = Router();

// GET /share/:token - Public read-only access to incident
router.get('/:token', getSharedIncident);

export default router;
