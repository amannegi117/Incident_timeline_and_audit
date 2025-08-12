import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { CreateTimelineEventRequest } from '../types';

export const addTimelineEvent = async (req: Request, res: Response) => {
  try {
    const { id: incidentId } = req.params;
    const { content }: CreateTimelineEventRequest = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if incident exists
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId }
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Check permissions: Reporters can only add events to their own incidents
    if (req.user?.role === 'REPORTER' && incident.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Reporters can only add events to incidents that are still OPEN
    if (req.user?.role === 'REPORTER' && incident.status !== 'OPEN') {
      return res.status(403).json({ error: 'Cannot add events to incident that is not in OPEN status' });
    }

    const timelineEvent = await prisma.timelineEvent.create({
      data: {
        incidentId,
        content,
        createdBy: req.user!.id
      },
      include: {
        creator: {
          select: { id: true, email: true }
        }
      }
    });

    return res.status(201).json(timelineEvent);
  } catch (error) {
    console.error('Add timeline event error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
