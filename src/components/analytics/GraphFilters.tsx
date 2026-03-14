export function GraphFilters() {
  return (
    <div className="flex flex-col gap-5">
      {/* Time Range */}
      <div>
        <h3 className="text-label text-text-primary uppercase tracking-wider mb-3">
          Time Range
        </h3>
        <div className="relative h-2 bg-background-tertiary rounded-full">
          <div className="absolute left-1/4 right-1/3 h-full bg-accent/50 rounded-full" />
          <div className="absolute left-1/4 w-3 h-3 bg-accent rounded-full -top-0.5" />
          <div className="absolute right-1/3 w-3 h-3 bg-accent rounded-full -top-0.5" />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-text-muted">
          <span>2020</span>
          <span>2025</span>
          <span>2030</span>
        </div>
      </div>

      {/* Domains */}
      <div>
        <h3 className="text-label text-text-primary uppercase tracking-wider mb-3">
          Domains
        </h3>
        <div className="flex flex-col gap-2">
          {["AI / ML", "Quantum", "Biotech", "Materials", "Energy"].map((domain) => (
            <label key={domain} className="flex items-center gap-2 cursor-pointer">
              <div className="w-4 h-4 rounded border border-border bg-background-tertiary flex items-center justify-center">
                {domain === "AI / ML" && (
                  <div className="w-2 h-2 rounded-sm bg-accent" />
                )}
              </div>
              <span className="text-caption text-text-secondary">{domain}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Signal Strength */}
      <div>
        <h3 className="text-label text-text-primary uppercase tracking-wider mb-3">
          Signal Strength
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-caption text-text-muted">Weak</span>
          <div className="flex-1 h-2 bg-background-tertiary rounded-full">
            <div className="w-3/4 h-full bg-gradient-to-r from-text-muted to-accent rounded-full" />
          </div>
          <span className="text-caption text-text-muted">Strong</span>
        </div>
      </div>
    </div>
  );
}
