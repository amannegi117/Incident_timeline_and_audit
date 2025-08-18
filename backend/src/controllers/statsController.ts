import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

export const getStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const [totalUsers, myIncidents] = await Promise.all([
      prisma.user.count(),
      prisma.incident.count({ where: { createdBy: req.user.id } }),
    ])

    return res.json({
      totalUsers,
      myIncidents,
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
