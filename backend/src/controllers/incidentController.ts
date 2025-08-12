import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { CreateIncidentRequest, UpdateIncidentRequest, IncidentFilters, PaginatedResponse, IncidentResponse } from '../types';

export const getIncidents = async (req: Request, res: Response) => {
  try {
    const {
      search,
      severity,
      status,
      tags,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10
    } = req.query as IncidentFilters;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause for search and filters
    const where: any = {};

    // Search across title, tags, and timeline content
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
        {
          timelineEvents: {
            some: {
              content: { contains: search, mode: 'insensitive' }
            }
          }
        }
      ];
    }

    // Filter by severity
    if (severity) {
      where.severity = severity;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // Role-based filtering: Reporters can only see their own incidents
    if (req.user?.role === 'REPORTER') {
      where.createdBy = req.user.id;
    }

    // Get incidents with pagination
    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.incident.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<IncidentResponse> = {
      data: incidents as IncidentResponse[],
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };

    return res.json(response);
  } catch (error) {
    console.error('Get incidents error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getIncident = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, email: true }
        },
        timelineEvents: {
          include: {
            creator: {
              select: { id: true, email: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        reviews: {
          include: {
            reviewer: {
              select: { id: true, email: true }
            }
          },
          orderBy: { reviewedAt: 'desc' }
        },
        _count: {
          select: {
            timelineEvents: true,
            reviews: true
          }
        }
      }
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Check permissions: Reporters can only see their own incidents
    if (req.user?.role === 'REPORTER' && incident.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json(incident);
  } catch (error) {
    console.error('Get incident error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createIncident = async (req: Request, res: Response) => {
  try {
    const { title, severity, tags }: CreateIncidentRequest = req.body;

    if (!title || !severity) {
      return res.status(400).json({ error: 'Title and severity are required' });
    }

    const incident = await prisma.incident.create({
      data: {
        title,
        severity,
        tags: tags || [],
        createdBy: req.user!.id
      },
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

    return res.status(201).json(incident);
  } catch (error) {
    console.error('Create incident error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateIncident = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateIncidentRequest = req.body;

    // Check if incident exists
    const existingIncident = await prisma.incident.findUnique({
      where: { id }
    });

    if (!existingIncident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Check permissions
    if (req.user?.role === 'REPORTER' && existingIncident.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Reporters can only edit incidents that are still OPEN
    if (req.user?.role === 'REPORTER' && existingIncident.status !== 'OPEN') {
      return res.status(403).json({ error: 'Cannot edit incident that is not in OPEN status' });
    }

    const incident = await prisma.incident.update({
      where: { id },
      data: updateData,
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

    return res.json(incident);
  } catch (error) {
    console.error('Update incident error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteIncident = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if incident exists
    const existingIncident = await prisma.incident.findUnique({
      where: { id }
    });

    if (!existingIncident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Only admins can delete incidents
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can delete incidents' });
    }

    await prisma.incident.delete({
      where: { id }
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Delete incident error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
