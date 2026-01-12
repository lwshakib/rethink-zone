/**
 * This layout serves as a wrapper for all routes inside the (main) group 
 * (typically authenticated zones like workspaces).
 */

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ensure the main view always takes at least the full viewport height.
    <div className="min-h-screen w-full flex flex-col">
      {children}
    </div>
  );
}
