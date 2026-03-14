"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SituationRegion } from "@/components/spatial/SituationRegion";
import { AnalysisRegion } from "@/components/spatial/AnalysisRegion";
import { SignalsRegion } from "@/components/spatial/SignalsRegion";
import { CapabilitiesRegion } from "@/components/spatial/CapabilitiesRegion";
import { ArchiveRegion } from "@/components/spatial/ArchiveRegion";

function RegionRenderer() {
  const searchParams = useSearchParams();
  const sec = searchParams.get("sec");

  switch (sec) {
    case "analysis":
      return <AnalysisRegion />;
    case "signals":
      return <SignalsRegion />;
    case "capabilities":
      return <CapabilitiesRegion />;
    case "archive":
      return <ArchiveRegion />;
    default:
      return <SituationRegion />;
  }
}

export default function OverviewPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<div className="min-h-screen" />}>
        <RegionRenderer />
      </Suspense>
    </div>
  );
}

