interface PageContainerProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  subtitle?: string;
}

export function PageContainer({
  children,
  title,
  description,
  subtitle,
}: PageContainerProps) {
  return (
    <div className="w-full px-[10vw] py-[80px]">
      <div className="max-w-[1280px] mx-auto">
        <header className="mb-16">
          <h1
            className="text-5xl md:text-6xl font-normal leading-tight mb-4"
            style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
              {subtitle}
            </p>
          )}
          {description && (
            <p className="text-base mt-2 max-w-[720px]" style={{ color: "var(--text-muted)" }}>
              {description}
            </p>
          )}
        </header>
        <div>{children}</div>
      </div>
    </div>
  );
}
