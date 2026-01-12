/**
 * This module configures the client-side instance of Better Auth.
 * It provides hooks and methods for performing authentication actions (login, logout, signup) 
 * directly from React components.
 */

import { createAuthClient } from "better-auth/react";

/**
 * Configure the authentication client with the application's base URL.
 */
export const authClient = createAuthClient({
  /** 
   * The base URL of the auth server. 
   * Uses an environment variable in production, or defaults to localhost for development.
   */
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
});
