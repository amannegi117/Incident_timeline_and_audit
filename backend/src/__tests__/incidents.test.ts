import request from 'supertest';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole, IncidentSeverity } from '@prisma/client';
import { app } from '../index';

const prisma = new PrismaClient();

describe('Incident Controller', () => {
  let reporterToken: string;
  let reviewerToken: string;
  let adminToken: string;
  let reporterUser: any;
  let reviewerUser: any;
  let adminUser: any;

  beforeEach(async () => {
    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    reporterUser = await prisma.user.create({
      data: {
        email: 'reporter@test.com',
        password: hashedPassword,
        role: UserRole.REPORTER,
      },
    });

    reviewerUser = await prisma.user.create({
      data: {
        email: 'reviewer@test.com',
        password: hashedPassword,
        role: UserRole.REVIEWER,
      },
    });

    adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    });

    // Login to get tokens
    const reporterResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'reporter@test.com',
        password: 'password123',
      });
    reporterToken = reporterResponse.body.token;

    const reviewerResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'reviewer@test.com',
        password: 'password123',
      });
    reviewerToken = reviewerResponse.body.token;

    const adminResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123',
      });
    adminToken = adminResponse.body.token;
  });

  describe('POST /incidents', () => {
    it('should create incident with valid data', async () => {
      const response = await request(app)
        .post('/incidents')
        .set('Authorization', `Bearer ${reporterToken}`)
        .send({
          title: 'Test Incident',
          severity: IncidentSeverity.P2,
          tags: ['test', 'bug'],
        })
        .expect(201);

      expect(response.body.title).toBe('Test Incident');
      expect(response.body.severity).toBe('P2');
      expect(response.body.status).toBe('OPEN');
      expect(response.body.createdBy).toBe(reporterUser.id);
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/incidents')
        .send({
          title: 'Test Incident',
          severity: IncidentSeverity.P2,
        })
        .expect(401);
    });
  });

  describe('GET /incidents', () => {
    it('should return incidents with search functionality', async () => {
      // Create test incidents
      await prisma.incident.createMany({
        data: [
          {
            title: 'Database Issue',
            severity: IncidentSeverity.P1,
            status: 'OPEN',
            tags: ['database'],
            createdBy: reporterUser.id,
          },
          {
            title: 'API Performance Problem',
            severity: IncidentSeverity.P2,
            status: 'OPEN',
            tags: ['api', 'performance'],
            createdBy: reporterUser.id,
          },
        ],
      });

      const response = await request(app)
        .get('/incidents?search=database')
        .set('Authorization', `Bearer ${reporterToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Database Issue');
    });
  });

  describe('DELETE /incidents/:id', () => {
    it('should only allow admins to delete incidents', async () => {
      const incident = await prisma.incident.create({
        data: {
          title: 'Test Incident',
          severity: IncidentSeverity.P3,
          status: 'OPEN',
          tags: ['test'],
          createdBy: reporterUser.id,
        },
      });

      // Reporter should not be able to delete
      await request(app)
        .delete(`/incidents/${incident.id}`)
        .set('Authorization', `Bearer ${reporterToken}`)
        .expect(403);

      // Admin should be able to delete
      await request(app)
        .delete(`/incidents/${incident.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });
  });
});
