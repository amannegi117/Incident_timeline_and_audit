import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            createdIncidents: true,
            timelineEvents: true,
            reviews: true,
            shareLinks: true,
          },
        },
        createdIncidents: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            title: true,
            severity: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json(user);
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
