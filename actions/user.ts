import { headers } from "next/headers";

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function getUser(): Promise<User | null> {
  const headerList = await headers();
  const userData = headerList.get("x-user");
  if (!userData) return null;
  try {
    const user = JSON.parse(userData);
    return {
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    };
  } catch (e) {
    return null;
  }
}
