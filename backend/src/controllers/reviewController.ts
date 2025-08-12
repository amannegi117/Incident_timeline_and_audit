import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { CreateReviewRequest } from '../types';

export const reviewIncident = async (req: Request, res: Response) => {
  try {
    const { id: incidentId } = req.params;
    const { status, comment }: CreateReviewRequest = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Check if incident exists
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId }
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Only reviewers and admins can review incidents
    if (req.user?.role === 'REPORTER') {
      return res.status(403).json({ error: 'Only reviewers and admins can review incidents' });
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      'OPEN': ['IN_REVIEW'],
      'IN_REVIEW': ['APPROVED', 'REJECTED'],
      'APPROVED': [],
      'REJECTED': []
    };

    const allowedTransitions = validTransitions[incident.status];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status transition from ${incident.status} to ${status}` 
      });
    }

    // Use transaction to update incident status and create review
    const result = await prisma.$transaction(async (tx) => {
      // Update incident status
      const updatedIncident = await tx.incident.update({
        where: { id: incidentId },
        data: { status },
        include: {
          creator: {
            select: { id: true, email: true }
          },
          _count: {
            select: {
              timelineEvents: true,
              reviews: true
            }
          }
        }
      });

      // Create review record
      const review = await tx.review.create({
        data: {
          incidentId,
          status,
          comment,
          reviewedBy: req.user!.id
        },
        include: {
          reviewer: {
            select: { id: true, email: true }
          }
        }
      });

      return { incident: updatedIncident, review };
    });

    return res.json(result);
  } catch (error) {
    console.error('Review incident error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
