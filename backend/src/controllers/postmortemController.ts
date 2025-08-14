import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { prisma } from '../lib/prisma';

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toISOString().replace('T', ' ').replace('Z', ' UTC');
}

export const exportIncidentPostmortemPdf = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, email: true } },
        timelineEvents: {
          include: { creator: { select: { id: true, email: true } } },
          orderBy: { createdAt: 'asc' },
        },
        reviews: {
          include: { reviewer: { select: { id: true, email: true } } },
          orderBy: { reviewedAt: 'desc' },
        },
        _count: { select: { timelineEvents: true, reviews: true } },
      },
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    if (req.user?.role === 'REPORTER' && incident.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="incident-${incident.id}-postmortem.pdf"`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    // Title
    doc.fontSize(20).text(`Incident Postmortem`, { align: 'center' }).moveDown(0.5);
    doc.fontSize(16).text(`${incident.title}`, { align: 'center' }).moveDown(1);

    // Meta
    doc.fontSize(11);
    doc.text(`Incident ID: ${incident.id}`);
    doc.text(`Severity: ${incident.severity}`);
    doc.text(`Status: ${incident.status}`);
    doc.text(`Tags: ${incident.tags.join(', ') || '-'}`);
    doc.text(`Created By: ${incident.creator?.email || incident.createdBy}`);
    doc.text(`Created At: ${formatDate(incident.createdAt)}`);
    doc.text(`Updated At: ${formatDate(incident.updatedAt)}`);

    doc.moveDown(1);

    // Five Whys Template
    doc.fontSize(14).text('Five Whys Analysis', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text('Problem Statement:', { continued: false });
    doc.moveDown(0.2);
    doc.rect(doc.x, doc.y, doc.page.width - doc.page.margins.left - doc.page.margins.right, 40).stroke();
    doc.moveDown(1.2);

    for (let i = 1; i <= 5; i++) {
      doc.text(`Why ${i}?`);
      doc.moveDown(0.2);
      doc.rect(doc.x, doc.y, doc.page.width - doc.page.margins.left - doc.page.margins.right, 30).stroke();
      doc.moveDown(0.8);
    }

    doc.addPage();

    // Timeline
    doc.fontSize(14).text('Timeline', { underline: true });
    doc.moveDown(0.5);
    if (incident.timelineEvents.length === 0) {
      doc.fontSize(11).text('No timeline events.');
    } else {
      incident.timelineEvents.forEach((te) => {
        doc.fontSize(11).text(`- [${formatDate(te.createdAt)}] ${te.creator?.email || te.createdBy}:`);
        doc.moveDown(0.2);
        doc.fontSize(11).text(te.content, { indent: 14 });
        doc.moveDown(0.5);
      });
    }

    doc.moveDown(0.5);

    // Reviews
    doc.fontSize(14).text('Reviews', { underline: true });
    doc.moveDown(0.5);
    if (incident.reviews.length === 0) {
      doc.fontSize(11).text('No reviews.');
    } else {
      incident.reviews.forEach((rv) => {
        doc.fontSize(11).text(`- [${formatDate(rv.reviewedAt)}] ${rv.reviewer?.email || rv.reviewedBy} -> ${rv.status}`);
        if (rv.comment) {
          doc.moveDown(0.2);
          doc.text(`Comment: ${rv.comment}`, { indent: 14 });
        }
        doc.moveDown(0.5);
      });
    }

    doc.moveDown(0.5);

    // Metrics summary
    doc.fontSize(14).text('Summary Metrics', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Timeline Events: ${incident._count.timelineEvents}`);
    doc.text(`Reviews: ${incident._count.reviews}`);

    doc.end();
  } catch (error) {
    console.error('Export postmortem PDF error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};