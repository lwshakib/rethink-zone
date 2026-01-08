export const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;
