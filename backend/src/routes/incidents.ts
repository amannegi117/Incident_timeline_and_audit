import { Router } from 'express';
import {
  getIncidents,
  getIncident,
  createIncident,
  updateIncident,
  deleteIncident
} from '../controllers/incidentController';
import { addTimelineEvent } from '../controllers/timelineController';
import { reviewIncident } from '../controllers/reviewController';
import { createShareLink } from '../controllers/shareController';
import { authenticateToken, requireReporter, requireReviewer, requireAdmin } from '../middleware/auth';
import { writeRateLimit, shareLinkRateLimit } from '../middleware/rateLimit';
import { revokeShareLink } from '../controllers/shareController';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /incidents - List incidents with search and filters
router.get('/', getIncidents);

// GET /incidents/:id - Get specific incident
router.get('/:id', getIncident);

// POST /incidents - Create new incident (Reporters and above)
router.post('/', requireReporter, writeRateLimit, createIncident);

// PUT /incidents/:id - Update incident (Reporters can edit own, Reviewers/Admins can edit any)
router.put('/:id', requireReporter, writeRateLimit, updateIncident);

// DELETE /incidents/:id - Delete incident (Admin only)
router.delete('/:id', requireAdmin, writeRateLimit, deleteIncident);

// POST /incidents/:id/timeline - Add timeline event
router.post('/:id/timeline', requireReporter, writeRateLimit, addTimelineEvent);

// POST /incidents/:id/review - Review incident (Reviewers and above)
router.post('/:id/review', requireReviewer, writeRateLimit, reviewIncident);

// POST /incidents/:id/share - Create share link (Admin only)
router.post('/:id/share', requireAdmin, shareLinkRateLimit, createShareLink);

// DELETE /incidents/:id/share/:token - Revoke expired share link (Admin only)
router.delete('/:id/share/:token', requireAdmin, shareLinkRateLimit, revokeShareLink);

export default router;
