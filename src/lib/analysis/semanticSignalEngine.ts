import OpenAI from "openai";
import { detectTechnologies, estimateTRL } from "@/lib/ingestion/signalEngine";

export interface SemanticSignal {
  technology: string;
  cluster: string;
  trl: number;
  confidence: number;
  novelty_score: number;
  related_domains: string[];
}

const CLUSTERS = [
  "AI",
  "Autonomy",
  "Communications",
  "Semiconductors",
  "Quantum",
  "Hypersonics",
  "Energy",
];

export async function extractSemanticSignals(text: string): Promise<SemanticSignal[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === "") {
    // Fallback if no OpenAI Key — simulate semantic extraction for prototype purposes
    return simulateSemanticExtraction(text);
  }

  try {
    const openai = new OpenAI({ apiKey });
    const prompt = `
You are a strategic technology intelligence analyst.
Analyze the following research abstract or article.
Extract specific emerging technologies mentioned.

For each technology, provide:
1. technology: The specific name of the technology (e.g., "Event-driven spiking architectures", not just "AI")
2. cluster: Map to one of these predefined clusters: ${CLUSTERS.join(", ")}
3. trl: Estimate the Technology Readiness Level (1-9) based on the text. Basic research = 1-3, Applied research/Prototype = 4-6, Operational/Deployed = 7-9.
4. confidence: Your confidence in this extraction (0.0 to 1.0)
5. novelty_score: How novel or emerging is this technology? (0.0 to 1.0, where 1.0 is highly disruptive/brand new concept)
6. related_domains: Array of 1-3 related application domains (e.g., ["Robotics", "Edge Computing"])

Respond ONLY with a valid JSON object matching this structure:
{
  "signals": [
    {
      "technology": string,
      "cluster": string,
      "trl": number,
      "confidence": number,
      "novelty_score": number,
      "related_domains": string[]
    }
  ]
}

Text:
"${text.substring(0, 4000)}"
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use gpt-4o-mini for speed/cost or gpt-4 for deep reasoning
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"signals":[]}');
    return result.signals || [];
  } catch (error) {
    console.error("[Semantic Extraction] Error calling LLM, falling back to mock:", error);
    return simulateSemanticExtraction(text);
  }
}

/**
 * Intelligent Keyword-Based Extractor
 * Uses the full TECH_KEYWORDS dictionary (49 entries) from signalEngine.ts
 * for comprehensive technology detection without requiring an LLM API key.
 */
function simulateSemanticExtraction(text: string): SemanticSignal[] {
  const detections = detectTechnologies(text);
  const trl = estimateTRL(text);

  return detections.map(det => ({
    technology: det.technology,
    cluster: det.cluster,
    trl: trl,
    confidence: 0.70,
    novelty_score: 0.65,
    related_domains: [det.cluster, "Defense"],
  }));
}

