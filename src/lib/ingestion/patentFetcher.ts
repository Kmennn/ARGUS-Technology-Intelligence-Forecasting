/**
 * Patents Fetcher — Gracefully Degraded
 *
 * USPTO PatentsView API (api.patentsview.org/patents/query) was
 * deprecated in 2024. Live patent ingestion pending Lens.org integration.
 *
 * Returns { fetched: 0, stored: 0 } so the pipeline treats this as a
 * clean no-op run. The PENDING_INTEGRATION sentinel is surfaced via
 * the `notes` field, which the pipeline reads into the ingestion_log
 * error column (see ingestionPipeline.ts).
 *
 * For a trust-first intelligence platform, a transparent gap beats
 * a broken source pretending to work.
 */

export async function fetchPatents(
  _perQuery: number = 5
): Promise<{ fetched: number; stored: number; notes?: string }> {
  return {
    fetched: 0,
    stored: 0,
    notes: 'PENDING_INTEGRATION: USPTO PatentsView API deprecated 2024. Live patent feed pending Lens.org integration.',
  };
}
