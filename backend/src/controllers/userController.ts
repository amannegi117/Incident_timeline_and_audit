import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const [incidentCount] = await Promise.all([
      prisma.incident.count({ where: { createdBy: req.user.id } }),
    ])

    return res.json({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      incidentCount,
    })
  } catch (error) {
    console.error('Get me error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}