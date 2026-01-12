/**
 * This module configures the Better Auth server-side instance.
 * It manages authentication strategies, database adapters, and provider settings.
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma"; // Shared Prisma client instance

/**
 * Configure the main authentication handler.
 */
export const auth = betterAuth({
  /**
   * Database configuration using Prisma adapter.
   * Enables storing users, sessions, and accounts in the PostgreSQL database.
   */
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  /**
   * Strategy: Email & Password
   * Allows users to sign up and log in using traditional credentials.
   */
  emailAndPassword: {
    enabled: true,
  },

  /**
   * Strategy: OAuth / Social Providers
   * Currently configured for Google Sign-In.
   */
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  /**
   * Account behavior:
   * Enabled 'accountLinking' to automatically merge accounts that share the same email
   * across different login methods (e.g., Google and Email).
   */
  account: {
    accountLinking: {
      enabled: true,
    },
  },
});
