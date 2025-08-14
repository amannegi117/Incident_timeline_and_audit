import { Router } from 'express';
import { getSharedIncident, revokeShareLinkByToken } from '../controllers/shareController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { shareLinkRateLimit } from '../middleware/rateLimit';

const router = Router();

// GET /share/:token - Public read-only access to incident
router.get('/:token', getSharedIncident);

// POST /share/:token/revoke - Revoke by token (Admin only)
router.post('/:token/revoke', authenticateToken, requireAdmin, shareLinkRateLimit, revokeShareLinkByToken);

export default router;
