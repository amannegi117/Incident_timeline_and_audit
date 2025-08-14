import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { CreateShareLinkRequest, ShareLinkResponse } from '../types';
import crypto from 'crypto';

export const createShareLink = async (req: Request, res: Response) => {
  try {
    const { id: incidentId } = req.params;
    const { expiresAt }: CreateShareLinkRequest = req.body;

    if (!expiresAt) {
      return res.status(400).json({ error: 'Expiration date is required' });
    }

    // Check if incident exists
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId }
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Only admins can create share links
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can create share links' });
    }

    // Validate expiration date
    const expirationDate = new Date(expiresAt);
    if (expirationDate <= new Date()) {
      return res.status(400).json({ error: 'Expiration date must be in the future' });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');

    const shareLink = await prisma.shareLink.create({
      data: {
        incidentId,
        token,
        expiresAt: expirationDate,
        createdBy: req.user.id
      }
    });

    const response: ShareLinkResponse = {
      id: shareLink.id,
      token: shareLink.token,
      expiresAt: shareLink.expiresAt,
      createdAt: shareLink.createdAt,
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/share/${token}`
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Create share link error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSharedIncident = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // Find share link by token
    const shareLink = await prisma.shareLink.findUnique({
      where: { token },
      include: {
        incident: {
          include: {
            creator: { select: { id: true, email: true } },
            timelineEvents: { include: { creator: { select: { id: true, email: true } } }, orderBy: { createdAt: 'asc' } },
            reviews: { include: { reviewer: { select: { id: true, email: true } } }, orderBy: { reviewedAt: 'desc' } },
            _count: { select: { timelineEvents: true, reviews: true } }
          }
        }
      }
    });

    if (!shareLink) {
      return res.status(404).json({ error: 'Share link not found' });
    }

    // Check if link has expired
    if (shareLink.expiresAt < new Date()) {
      return res.status(410).json({ error: 'Share link has expired' });
    }

    // Return incident data (read-only)
    return res.json({
      ...shareLink.incident,
      shareLink: {
        expiresAt: shareLink.expiresAt,
        createdAt: shareLink.createdAt
      }
    });
  } catch (error) {
    console.error('Get shared incident error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const revokeShareLink = async (req: Request, res: Response) => {
  try {
    const { id: incidentId, token } = req.params as { id: string; token: string };

    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can revoke share links' });
    }

    const link = await prisma.shareLink.findUnique({ where: { token } });
    if (!link || link.incidentId !== incidentId) {
      return res.status(404).json({ error: 'Share link not found' });
    }

    // Expire then delete in a single transaction
    await prisma.$transaction(async (tx) => {
      await tx.shareLink.update({ where: { token }, data: { expiresAt: new Date() } });
      await tx.shareLink.delete({ where: { token } });
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Revoke share link error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const revokeShareLinkByToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params as { token: string };

    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can revoke share links' });
    }

    const link = await prisma.shareLink.findUnique({ where: { token } });
    if (!link) {
      return res.status(404).json({ error: 'Share link not found' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.shareLink.update({ where: { token }, data: { expiresAt: new Date() } });
      await tx.shareLink.delete({ where: { token } });
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Revoke share link by token error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
