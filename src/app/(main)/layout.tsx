import { getOrCreateUser } from "@/app/actions/user";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getOrCreateUser();
  return <div className="flex min-h-screen w-full">{children}</div>;
}
