import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const revokeShareLink = async (req: Request, res: Response) => {
  try {
    const { id: incidentId, token } = req.params as { id: string; token: string };

    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can revoke share links' });
    }

    const shareLink = await prisma.shareLink.findUnique({ where: { token } });
    if (!shareLink || shareLink.incidentId !== incidentId) {
      return res.status(404).json({ error: 'Share link not found' });
    }

    if (shareLink.expiresAt >= new Date()) {
      return res.status(400).json({ error: 'Share link is not expired and cannot be revoked by this endpoint' });
    }

    await prisma.shareLink.delete({ where: { token } });
    return res.status(204).send();
  } catch (error) {
    console.error('Revoke share link error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};