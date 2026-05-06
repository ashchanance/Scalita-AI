"use server";

import { OpenAI } from "openai";

export interface SentimentResponse {
  catalyst_score: number;
  volatility_risk: "Low" | "Moderate" | "High" | "Extreme";
  key_drivers: string[];
  action_signal: "Watch Closely" | "Potential Upside" | "Correction Risk";
}

const SYSTEM_INSTRUCTION = `You are a rapid stock market sentiment analyst. Read the provided news article or IPO prospectus text and extract its core sentiment. You MUST respond ONLY with a JSON object in exactly this format — no markdown, no preamble, no explanation:
{
  "catalyst_score": [Number 1-100. 1=Extremely Bearish, 100=Extremely Bullish],
  "volatility_risk": [Choose one: "Low", "Moderate", "High", "Extreme"],
  "key_drivers": [Array of max 3 short strings describing the main sentiment drivers],
  "action_signal": [Choose one: "Watch Closely", "Potential Upside", "Correction Risk"]
}`;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function attemptWithMegaLLM(
  client: OpenAI,
  safeText: string
): Promise<SentimentResponse> {
  const MAX_RETRIES = 2;
  const model = process.env.MEGA_LLM_MODEL || "openai-gpt-oss-120b";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          { role: "user", content: safeText }
        ],
        response_format: { type: "json_object" }
      });

      const rawContent = response.choices[0]?.message?.content;
      if (!rawContent) throw new Error("AI returned no response.");

      const clean = rawContent.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean) as SentimentResponse;

      if (
        typeof parsed.catalyst_score !== "number" ||
        !parsed.volatility_risk ||
        !Array.isArray(parsed.key_drivers) ||
        !parsed.action_signal
      ) {
        throw new Error("AI response format is invalid.");
      }

      parsed.catalyst_score = Math.min(100, Math.max(1, Math.round(parsed.catalyst_score)));
      parsed.key_drivers = parsed.key_drivers.slice(0, 3);

      return parsed;

    } catch (err: unknown) {
      const isLast = attempt === MAX_RETRIES;

      if (err instanceof SyntaxError) {
        throw new Error("Failed to parse JSON response from AI.");
      }

      if (!isLast) {
        await delay(1000 * Math.pow(2, attempt));
        continue;
      }

      throw err;
    }
  }

  throw new Error("Unexpected retry loop exit.");
}

export async function analyzeSentiment(text: string): Promise<SentimentResponse> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Input text cannot be empty.");
  const safeText = trimmed.substring(0, 5000);

  const client = new OpenAI({
    baseURL: process.env.MEGA_LLM_BASE_URL || "https://ai.megallm.io/v1",
    apiKey: process.env.MEGA_LLM_API_KEY,
  });

  return attemptWithMegaLLM(client, safeText);
}
