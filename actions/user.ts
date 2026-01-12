/**
 * This module contains server-side helper functions for user-related data access.
 */

import { headers } from "next/headers";

/**
 * User interface reflecting the structure of an authenticated user in the database.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * server-side helper to retrieve the currently authenticated user.
 * It reads user data from a custom 'x-user' header typically set by middleware during verification.
 * 
 * @returns {Promise<User | null>} - The current user object or null if not authenticated.
 */
export async function getUser(): Promise<User | null> {
  // Access request headers (Server Component compatible)
  const headerList = await headers();
  // 'x-user' contains stringified JSON of the user record
  const userData = headerList.get("x-user");
  
  if (!userData) return null;
  
  try {
    // Parse the JSON string into a structured object
    const user = JSON.parse(userData);
    return {
      ...user,
      // Ensure date strings are converted back into Date objects for downstream logic
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    };
  } catch (e) {
    // Handle JSON parsing errors by returning null (unauthenticated)
    return null;
  }
}
