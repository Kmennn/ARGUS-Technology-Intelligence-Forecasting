# ACTIF Platform — Examiner Demonstration Script

## Purpose
This script guides the demonstration of ACTIF's defense-readiness features, specifically focusing on control, explainability, and AI safety.

---

## 1. System Overview & Trust
**Action:** Start at the **Overview** dashboard.
**Say:** "ACTIF is designed as a trust-first intelligence platform. Every insight is traceable to its source."
**Show:** Point to the **Audit Panel** (if visible) or **Secure Mode** toggle.

## 2. Deterministic Intelligence (Baseline)
**Action:** Navigate to **TRL Assessment** page.
**Say:** "Our baseline intelligence is deterministic. TRLs are inferred using explicit, rule-based logic—not AI guessing."
**Show:**
1. Click on a technology node.
2. Show the **ExplanationCard**.
3. Point out the "Structured" mode (Default).
4. Highlight the **Source: static/graphrag** at the bottom.

## 3. Explaining Intelligence (Controlled AI)
**Action:** Stay on **ExplanationCard**.
**Say:** "We use AI only for translation, not analysis. The LLM rephrases our deterministic outputs but cannot change the conclusions."
**Show:**
1. Toggle "Structured" to **"Narrative (AI)"**.
2. Point to the warning badge: *"AI-generated phrasing • Original conclusions preserved"*.
3. **Say:** "If the LLM tries to hallucinate a higher TRL, the system block enforces the deterministic value."

## 4. Forecasting & Early Signals
**Action:** Navigate to **Alerts** page.
**Say:** "We detect weak signals using graph patterns, again without relying on black-box models."
**Show:**
1. **Weak Signals** list — explain the scoring rules (Frequency + Growth).
2. **Convergence** patterns — explain the graph co-occurrence logic.

## 5. Security & Control
**Action:** Click the **Secure Mode** toggle to ON.
**Say:** "In high-security environments, we can physically disable the AI layer."
**Show:**
1. Try to switch **ExplanationCard** to "Narrative".
2. Observe that it is disabled/forced back to "Structured".
3. Open **Audit Panel** to show the "MODE_SWITCH" and "MODE_ENFORCE" logs.
4. **Say:** "This ensures that operators have absolute control over when and how AI is used."

---

## Key Defense Answers

**Q: How do you know the AI isn't hallucinating?**
A: "We don't use AI for the conclusion. The TRL is calculated deterministically. The AI only writes the summary text, and we strictly prompt-guard it to match the data."

**Q: Can this run offline?**
A: "Yes. The core logic (Graph, TRL, Forecasting) is entirely local code. The LLM layer is optional and can be swapped for a local model or disabled completely in Secure Mode."

**Q: Where does the data come from?**
A: "It uses a Knowledge Graph architecture (GraphRAG). effectively separating the data retrieval layer from the reasoning layer."
