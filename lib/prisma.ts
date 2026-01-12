/**
 * This module initializes and exports the Prisma Client.
 * It also handles connection pooling and ensures a single global instance during development
 * to avoid exceeding connection limits during hot-reloads.
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg"; // Native PostgreSQL adapter for edge compatibility
import { PrismaClient } from "@/generated/prisma/client"; // Path to generated Prisma types

// The database connection string sourced from the .env file.
const connectionString = `${process.env.DATABASE_URL}`;

// Initialize the Prisma adapter with the connection string.
const adapter = new PrismaPg({ connectionString });

// Setup for the singleton pattern to prevent multiple Prisma instances in dev mode.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Instantiate the client: use existing global object if present, otherwise create new.
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

// If we are not in production, store the prisma client in the global scope.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * The default export is the shared Prisma Client instance used for all database operations.
 */
export default prisma;
