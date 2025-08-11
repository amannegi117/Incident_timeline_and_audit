import request from 'supertest';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole, IncidentSeverity, IncidentStatus } from '@prisma/client';
import { app } from '../index';

const prisma = new PrismaClient();

describe('Review Controller', () => {
  let reviewerToken: string;
  let reporterToken: string;
  let reviewerUser: any;
  let reporterUser: any;
  let testIncident: any;

  beforeEach(async () => {
    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    reviewerUser = await prisma.user.create({
      data: {
        email: 'reviewer@test.com',
        password: hashedPassword,
        role: UserRole.REVIEWER,
      },
    });

    reporterUser = await prisma.user.create({
      data: {
        email: 'reporter@test.com',
        password: hashedPassword,
        role: UserRole.REPORTER,
      },
    });

    // Create test incident
    testIncident = await prisma.incident.create({
      data: {
        title: 'Test Incident',
        severity: IncidentSeverity.P2,
        status: 'OPEN',
        tags: ['test'],
        createdBy: reporterUser.id,
      },
    });

    // Login to get tokens
    const reviewerResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'reviewer@test.com',
        password: 'password123',
      });
    reviewerToken = reviewerResponse.body.token;

    const reporterResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'reporter@test.com',
        password: 'password123',
      });
    reporterToken = reporterResponse.body.token;
  });

  describe('POST /incidents/:id/review', () => {
    it('should allow valid status transition from OPEN to IN_REVIEW', async () => {
      const response = await request(app)
        .post(`/incidents/${testIncident.id}/review`)
        .set('Authorization', `Bearer ${reviewerToken}`)
        .send({
          status: IncidentStatus.IN_REVIEW,
          comment: 'Moving to review phase',
        })
        .expect(200);

      expect(response.body.incident.status).toBe('IN_REVIEW');
      expect(response.body.review.status).toBe('IN_REVIEW');
      expect(response.body.review.comment).toBe('Moving to review phase');
    });

    it('should allow valid status transition from IN_REVIEW to APPROVED', async () => {
      // First move to IN_REVIEW
      await prisma.incident.update({
        where: { id: testIncident.id },
        data: { status: IncidentStatus.IN_REVIEW },
      });

      const response = await request(app)
        .post(`/incidents/${testIncident.id}/review`)
        .set('Authorization', `Bearer ${reviewerToken}`)
        .send({
          status: IncidentStatus.APPROVED,
          comment: 'Issue resolved successfully',
        })
        .expect(200);

      expect(response.body.incident.status).toBe('APPROVED');
      expect(response.body.review.status).toBe('APPROVED');
    });

    it('should reject invalid status transition', async () => {
      await request(app)
        .post(`/incidents/${testIncident.id}/review`)
        .set('Authorization', `Bearer ${reviewerToken}`)
        .send({
          status: IncidentStatus.APPROVED, // Cannot go directly from OPEN to APPROVED
          comment: 'Invalid transition',
        })
        .expect(400);
    });

    it('should not allow reporters to review incidents', async () => {
      await request(app)
        .post(`/incidents/${testIncident.id}/review`)
        .set('Authorization', `Bearer ${reporterToken}`)
        .send({
          status: IncidentStatus.IN_REVIEW,
          comment: 'Test review',
        })
        .expect(403);
    });

    it('should require status', async () => {
      await request(app)
        .post(`/incidents/${testIncident.id}/review`)
        .set('Authorization', `Bearer ${reviewerToken}`)
        .send({
          comment: 'Test review without status',
        })
        .expect(400);
    });
  });
});
