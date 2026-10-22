export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="theme-light min-h-dvh bg-bg text-fg">{children}</div>;
}
