export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex min-h-screen w-full">{children}</div>;
}