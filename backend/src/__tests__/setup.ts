import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Clean database before tests
  await prisma.shareLink.deleteMany();
  await prisma.review.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  // Clean up after each test
  await prisma.shareLink.deleteMany();
  await prisma.review.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.user.deleteMany();
});
