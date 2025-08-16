import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

export const getStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id

    const [totalUsers, myIncidents] = await Promise.all([
      prisma.user.count(),
      prisma.incident.count({ where: { createdBy: userId } })
    ])

    return res.json({ totalUsers, myIncidents })
  } catch (error) {
    console.error('Get stats error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}