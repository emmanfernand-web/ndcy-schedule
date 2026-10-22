export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-dark starfield min-h-dvh text-fg">
      {children}
      <footer className="px-4 pb-10 pt-6 text-center text-xs text-muted">
        NDCYC
      </footer>
    </div>
  );
}
