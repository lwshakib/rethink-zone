/**
 * Generates a unique, URL-safe identifier string using current timestamp and a random hex suffix.
 * Useful for assigning IDs to new canvas elements to ensure uniqueness across the session.
 */
export const makeId = () =>
  // Combine base36 timestamp with a sliced random hex string separated by a hyphen
  `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;
