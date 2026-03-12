/**
 * Better-Auth server-side configuration.
 * Handles database integration via Prisma and configures authentication providers.
 */
import { betterAuth } from "better-auth"; // Core library function to initialize the Better-Auth service
import { prismaAdapter } from "better-auth/adapters/prisma"; // Prisma database adapter tailored for Better-Auth
import prisma from "./prisma"; // The project's singleton Prisma database client instance
import { Resend } from "resend"; // Resend SDK for sending transactional emails
import { AuthEmailTemplate } from "@/components/emails/auth-email-template"; // React component acting as template for auth emails

// Initialize the Resend mail client using the secret API key from environment variables.
const resend = new Resend(process.env.RESEND_API_KEY);

// Create and export the configured authentication service instance.
export const auth = betterAuth({
  // Use Prisma as the database adapter to persist user accounts, sessions, and social connections directly into our PostgreSQL database.
  database: prismaAdapter(prisma, {
    provider: "postgresql", // Matches the Prisma provider type defined in schema.prisma.
  }),

  // Enable standard email and password authentication methods.
  emailAndPassword: {
    enabled: true, // Allow users to sign up and log in using an email and password.
    requireEmailVerification: true, // Prevent users from logging in until they have clicked the verification link sent to their email.

    // Custom asynchronous callback triggered when a user requests a password reset.
    sendResetPassword: async ({ user, url }) => {
      try {
        // Attempt to dispatch the password reset email via Resend's API.
        const { error } = await resend.emails.send({
          from: "Rethink <noreply@lwshakib.site>", // The verified sender identity
          to: user.email, // Recipient's email address passed by Better-Auth
          subject: "Reset your password", // Description for the email subject line
          react: AuthEmailTemplate({ type: "forgot-password", url }), // Renders the specialized React Email template into HTML
        });

        // Log and handle explicit errors returned by the Resend API (e.g., rate-limits, unverified domains)
        if (error) {
          console.error("Failed to send email via Resend:", error);
          throw new Error("Failed to send authentication email.");
        }
      } catch (err) {
        // Catch network errors or unexpected exceptions during the email sending process
        console.error("Resend error:", err);
        throw err;
      }
    },
  },

  // Configure OAuth providers allowing fast, passwordless onboarding.
  socialProviders: {
    google: {
      enabled: true, // Activate "Sign in with Google" strategy.
      // Load Google API credentials from secure environment variables.
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  // Settings pertaining to the email verification lifecycle.
  emailVerification: {
    sendOnSignUp: true, // Automatically trigger the verification email immediately after a successful signup registration.

    // Custom asynchronous callback triggered to deliver the verification link to the newly registered user.
    sendVerificationEmail: async ({ user, url }) => {
      try {
        // Dispatch the account verification email via Resend's API.
        await resend.emails.send({
          from: "Rethink <noreply@lwshakib.site>",
          to: user.email,
          subject: "Verify your email address",
          react: AuthEmailTemplate({ type: "email-verification", url }), // Renders the specialized React Email verification template
        });
      } catch (err) {
        // Log errors to the server console if the verification email fails to send (fails silently for the end user)
        console.error("Verification email error:", err);
      }
    },
  },

  // Adjust application-wide account level settings.
  account: {
    accountLinking: {
      enabled: true, // Enables linking multiple identity providers (Google, Email) to a single user account context if the emails match.
    },
  },
});
