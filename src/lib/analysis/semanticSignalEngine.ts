import OpenAI from "openai";

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
 * Intelligent Mock Extractor
 * If no OpenAI key is available, uses heuristic keyword grouping to simulate semantic extraction.
 */
function simulateSemanticExtraction(text: string): SemanticSignal[] {
  const lowerText = text.toLowerCase();
  const signals: SemanticSignal[] = [];

  if (lowerText.includes("spik") || lowerText.includes("neuromorphic")) {
    signals.push({
      technology: "Event-Driven Spiking Architectures",
      cluster: "AI",
      trl: 4,
      confidence: 0.88,
      novelty_score: 0.85,
      related_domains: ["Edge Inference", "Autonomous Robotics"],
    });
  }

  if (lowerText.includes("swarm") || lowerText.includes("multi-agent")) {
    signals.push({
      technology: "Decentralized Swarm Coordination",
      cluster: "Autonomy",
      trl: 5,
      confidence: 0.82,
      novelty_score: 0.75,
      related_domains: ["Tactical Operations", "UAV Networks"],
    });
  }

  if (lowerText.includes("ambient") || lowerText.includes("backscatter") || lowerText.includes("zero-power")) {
    signals.push({
      technology: "Ambient Backscatter Communications",
      cluster: "Communications",
      trl: 3,
      confidence: 0.76,
      novelty_score: 0.90,
      related_domains: ["Covert Networks", "IoT Swarms"],
    });
  }

  if (lowerText.includes("qkd") || lowerText.includes("quantum key")) {
    signals.push({
      technology: "Quantum Key Distribution",
      cluster: "Quantum",
      trl: 6,
      confidence: 0.92,
      novelty_score: 0.70,
      related_domains: ["Secure C2", "SIGINT Defeat"],
    });
  }

  return signals;
}
