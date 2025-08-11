import request from 'supertest';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole, IncidentSeverity } from '@prisma/client';
import { app } from '../index';

const prisma = new PrismaClient();

describe('Share Controller', () => {
  let adminToken: string;
  let adminUser: any;
  let testIncident: any;

  beforeEach(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    });

    // Create test incident
    testIncident = await prisma.incident.create({
      data: {
        title: 'Test Incident',
        severity: IncidentSeverity.P2,
        status: 'OPEN',
        tags: ['test'],
        createdBy: adminUser.id,
      },
    });

    // Login to get token
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123',
      });
    adminToken = response.body.token;
  });

  describe('POST /incidents/:id/share', () => {
    it('should create share link with valid expiration date', async () => {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

      const response = await request(app)
        .post(`/incidents/${testIncident.id}/share`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          expiresAt: expiresAt.toISOString(),
        })
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('url');
      expect(response.body.expiresAt).toBe(expiresAt.toISOString());
    });

    it('should reject past expiration date', async () => {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() - 1); // 1 hour ago

      await request(app)
        .post(`/incidents/${testIncident.id}/share`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          expiresAt: expiresAt.toISOString(),
        })
        .expect(400);
    });

    it('should require expiration date', async () => {
      await request(app)
        .post(`/incidents/${testIncident.id}/share`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('GET /share/:token', () => {
    it('should return incident data for valid share link', async () => {
      // Create share link
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const shareLink = await prisma.shareLink.create({
        data: {
          incidentId: testIncident.id,
          token: 'test-token-123',
          expiresAt,
          createdBy: adminUser.id,
        },
      });

      const response = await request(app)
        .get(`/share/${shareLink.token}`)
        .expect(200);

      expect(response.body.title).toBe('Test Incident');
      expect(response.body.id).toBe(testIncident.id);
    });

    it('should reject expired share link', async () => {
      // Create expired share link
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() - 1); // 1 hour ago

      const shareLink = await prisma.shareLink.create({
        data: {
          incidentId: testIncident.id,
          token: 'expired-token-123',
          expiresAt,
          createdBy: adminUser.id,
        },
      });

      await request(app)
        .get(`/share/${shareLink.token}`)
        .expect(410);
    });

    it('should reject invalid token', async () => {
      await request(app)
        .get('/share/invalid-token')
        .expect(404);
    });
  });
});
