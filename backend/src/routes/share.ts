import { revokeShareLink } from './../controllers/revoke';
import { shareLinkRateLimit } from './../middleware/rateLimit';
import { Router } from 'express';
import { getSharedIncident } from '../controllers/shareController';
import { requireAdmin } from '../middleware/auth';
const router = Router();

// GET /share/:token - Public read-only access to incident
router.get('/:token', getSharedIncident);
// DELETE /incidents/:id/share/:token - Revoke expired share link (Admin only)
router.delete('/:id/share/:token', requireAdmin, shareLinkRateLimit, revokeShareLink);

export default router;
