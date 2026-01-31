// Standalone layout for /share routes - no Navigation or Footer
// This allows print pages to render without the site chrome

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
