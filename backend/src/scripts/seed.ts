import { PrismaClient, UserRole, IncidentSeverity } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(' Starting database seed...');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.upsert({
      where: { email: 'reviewer@example.com' },
      update: {},
      create: {
        email: 'reviewer@example.com',
        password: hashedPassword,
        role: UserRole.REVIEWER,
      },
    }),
    prisma.user.upsert({
      where: { email: 'reporter@example.com' },
      update: {},
      create: {
        email: 'reporter@example.com',
        password: hashedPassword,
        role: UserRole.REPORTER,
      },
    }),
  ]);

  console.log(' Users created:', users.map(u => ({ email: u.email, role: u.role })));

  // Create sample incidents
  const incidents = await Promise.all([
    prisma.incident.create({
      data: {
        title: 'Database Connection Timeout',
        severity: IncidentSeverity.P1,
        status: 'OPEN',
        tags: ['database', 'performance', 'critical'],
        createdBy: users[2].id, // reporter
      },
    }),
    prisma.incident.create({
      data: {
        title: 'User Authentication Failure',
        severity: IncidentSeverity.P2,
        status: 'IN_REVIEW',
        tags: ['security', 'authentication'],
        createdBy: users[2].id, // reporter
      },
    }),
    prisma.incident.create({
      data: {
        title: 'API Rate Limiting Issue',
        severity: IncidentSeverity.P3,
        status: 'APPROVED',
        tags: ['api', 'rate-limiting'],
        createdBy: users[2].id, // reporter
      },
    }),
  ]);

  console.log(' Incidents created:', incidents.map(i => ({ title: i.title, status: i.status })));

  // Add timeline events
  const timelineEvents = await Promise.all([
    prisma.timelineEvent.create({
      data: {
        incidentId: incidents[0].id,
        content: 'Initial investigation started. Database connection pool appears to be exhausted.',
        createdBy: users[2].id,
      },
    }),
    prisma.timelineEvent.create({
      data: {
        incidentId: incidents[0].id,
        content: 'Increased connection pool size from 10 to 50. Monitoring for improvements.',
        createdBy: users[1].id, // reviewer
      },
    }),
    prisma.timelineEvent.create({
      data: {
        incidentId: incidents[1].id,
        content: 'Security team notified. Investigating potential breach.',
        createdBy: users[2].id,
      },
    }),
    prisma.timelineEvent.create({
      data: {
        incidentId: incidents[1].id,
        content: 'False positive confirmed. User was using incorrect password format.',
        createdBy: users[1].id,
      },
    }),
  ]);

  console.log(' Timeline events created:', timelineEvents.length);

  // Add reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        incidentId: incidents[1].id,
        status: 'APPROVED',
        comment: 'Issue resolved. No security breach detected.',
        reviewedBy: users[1].id,
      },
    }),
    prisma.review.create({
      data: {
        incidentId: incidents[2].id,
        status: 'APPROVED',
        comment: 'Rate limiting configuration updated successfully.',
        reviewedBy: users[1].id,
      },
    }),
  ]);

  console.log(' Reviews created:', reviews.length);

  console.log(' Database seeding completed successfully!');
  console.log('\n📋 Sample login credentials:');
  console.log('Admin: admin@example.com / password123');
  console.log('Reviewer: reviewer@example.com / password123');
  console.log('Reporter: reporter@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
