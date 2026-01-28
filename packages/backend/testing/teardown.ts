import { prisma } from './utils/prisma';

export default async function globalTeardown() {
    // Close the Prisma Client connection after all tests are done
    await prisma.$disconnect();
}
