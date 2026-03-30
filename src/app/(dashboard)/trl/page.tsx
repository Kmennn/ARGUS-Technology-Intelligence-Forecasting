'use client';

const TRL_LEVELS = [
  { level: 1, name: 'Basic Principles', description: 'Scientific research begins. Basic principles observed and reported.', phase: 'Research' },
  { level: 2, name: 'Technology Concept', description: 'Technology concept or application formulated.', phase: 'Research' },
  { level: 3, name: 'Experimental Proof', description: 'Analytical and experimental critical function or characteristic proof of concept.', phase: 'Research' },
  { level: 4, name: 'Lab Validation', description: 'Technology validated in laboratory environment.', phase: 'Development' },
  { level: 5, name: 'Relevant Environment', description: 'Technology validated in relevant environment.', phase: 'Development' },
  { level: 6, name: 'Relevant Demo', description: 'Technology demonstrated in relevant environment.', phase: 'Development' },
  { level: 7, name: 'Operational Demo', description: 'System prototype demonstrated in operational environment.', phase: 'Demonstration' },
  { level: 8, name: 'System Complete', description: 'System complete and qualified through test and demonstration.', phase: 'Deployment' },
  { level: 9, name: 'Operational', description: 'Actual system proven through successful mission operations.', phase: 'Deployment' },
];

const PHASE_COLORS: Record<string, string> = {
  Research: 'border-blue-500 bg-blue-500',
  Development: 'border-yellow-500 bg-yellow-500',
  Demonstration: 'border-orange-500 bg-orange-500',
  Deployment: 'border-green-500 bg-green-500',
};

const PHASE_TEXT: Record<string, string> = {
  Research: 'text-blue-400',
  Development: 'text-yellow-400',
  Demonstration: 'text-orange-400',
  Deployment: 'text-green-400',
};

export default function TRLPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Technology Readiness Levels</h1>
        <p className="text-gray-400 mt-1">
          NATO/DoD standard 9-level maturity framework used by ARGUS for signal classification
        </p>
      </div>

      <div className="grid gap-3">
        {TRL_LEVELS.map(({ level, name, description, phase }) => {
          const colorBar = PHASE_COLORS[phase] ?? 'border-gray-500 bg-gray-500';
          const colorText = PHASE_TEXT[phase] ?? 'text-gray-400';
          return (
            <div
              key={level}
              className={`bg-gray-900 border border-gray-700 rounded-lg p-4 flex gap-4 items-start border-l-4 ${colorBar.split(' ')[0]}`}
            >
              <div className={`text-3xl font-black w-10 shrink-0 ${colorText}`}>
                {level}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-semibold">{name}</h3>
                  <span className={`text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded ${colorText} bg-gray-800`}>
                    {phase}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">{description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
