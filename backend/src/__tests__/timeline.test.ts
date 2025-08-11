import request from 'supertest';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole, IncidentSeverity } from '@prisma/client';
import { app } from '../index';

const prisma = new PrismaClient();

describe('Timeline Controller', () => {
  let reporterToken: string;
  let reporterUser: any;
  let testIncident: any;

  beforeEach(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
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

    // Login to get token
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'reporter@test.com',
        password: 'password123',
      });
    reporterToken = response.body.token;
  });

  describe('POST /incidents/:id/timeline', () => {
    it('should create timeline event with valid data', async () => {
      const response = await request(app)
        .post(`/incidents/${testIncident.id}/timeline`)
        .set('Authorization', `Bearer ${reporterToken}`)
        .send({
          content: 'Initial investigation started',
        })
        .expect(201);

      expect(response.body.content).toBe('Initial investigation started');
      expect(response.body.incidentId).toBe(testIncident.id);
      expect(response.body.createdBy).toBe(reporterUser.id);
    });

    it('should require content', async () => {
      await request(app)
        .post(`/incidents/${testIncident.id}/timeline`)
        .set('Authorization', `Bearer ${reporterToken}`)
        .send({})
        .expect(400);
    });

    it('should require authentication', async () => {
      await request(app)
        .post(`/incidents/${testIncident.id}/timeline`)
        .send({
          content: 'Test content',
        })
        .expect(401);
    });
  });
});
