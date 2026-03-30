'use client';

const TRL_LEVELS = [
  { level: 1, name: 'Basic Principles', description: 'Scientific research begins. Basic principles observed and reported.', phase: 'Research' },
  { level: 2, name: 'Technology Concept', description: 'Technology concept or application formulated.', phase: 'Research' },
  { level: 3, name: 'Experimental Proof', description: 'Analytical and experimental critical function proof of concept.', phase: 'Research' },
  { level: 4, name: 'Lab Validation', description: 'Technology validated in laboratory environment.', phase: 'Development' },
  { level: 5, name: 'Relevant Environment', description: 'Technology validated in relevant environment.', phase: 'Development' },
  { level: 6, name: 'Relevant Demo', description: 'Technology demonstrated in relevant environment.', phase: 'Development' },
  { level: 7, name: 'Operational Demo', description: 'System prototype demonstrated in operational environment.', phase: 'Demonstration' },
  { level: 8, name: 'System Complete', description: 'System complete and qualified through test and demonstration.', phase: 'Deployment' },
  { level: 9, name: 'Operational', description: 'Actual system proven through successful mission operations.', phase: 'Deployment' },
];

const PHASE_ACCENT: Record<string, string> = {
  Research: '#6B8CAE',
  Development: '#C4A35A',
  Demonstration: '#C4684B',
  Deployment: '#5A8A6A',
};

export default function TRLPage() {
  return (
    <div className="p-6 space-y-4 max-w-[1200px] mx-auto">
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--ink-primary)', fontFamily: 'var(--font-serif, Georgia, serif)' }}
        >
          Technology Readiness Levels
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--ink-secondary)' }}>
          NATO/DoD 9-level maturity framework used by ARGUS for signal classification
        </p>
      </div>

      <div className="grid gap-2">
        {TRL_LEVELS.map(({ level, name, description, phase }) => {
          const accent = PHASE_ACCENT[phase] ?? '#888';
          return (
            <div
              key={level}
              className="rounded-lg p-4 flex gap-4 items-start"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderLeft: `4px solid ${accent}`,
              }}
            >
              <div className="text-3xl font-black w-10 shrink-0" style={{ color: accent }}>
                {level}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold" style={{ color: 'var(--ink-primary)' }}>{name}</h3>
                  <span
                    className="text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{
                      color: accent,
                      background: 'var(--background-muted)',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    {phase}
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--ink-secondary)' }}>{description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
