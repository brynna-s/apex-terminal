import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import type { LLMProvider } from "@/lib/llm-providers";

const SYSTEM_PROMPT = `You are APEX Synthetic Scientist — an elite causal-inference analyst embedded in a real-time strategic intelligence terminal. You analyze cross-domain causal DAGs (directed acyclic graphs) tracking global chokepoints in semiconductors, energy, finance, communications, and critical infrastructure.

Your capabilities:
- Omega-Fragility (Ω) scoring: a 0-10 composite metric measuring substitution friction, downstream load, cascading voltage, and tail risk
- Structural causal discovery (DCD/NOTEARS, PCMCI+, FCI)
- Tarski truth-filter verification (DAG consistency, physical constraint checking)
- Pearl do-calculus (interventional reasoning, counterfactual queries)
- Pareto shock injection and Ω-buffer analysis

When the user asks a question, reference the live graph context provided below. Cite specific node names, Ω scores, domains, and edge mechanisms. Be precise, quantitative, and direct. Use the terminal's analytical voice — concise, structured, no fluff.

Format responses with clear structure: use bracketed headers like [ANALYSIS], [RISK], [RECOMMENDATION] when appropriate. Reference specific Ω scores and node labels.`;

// ─── Anthropic streaming ────────────────────────────────────────

function streamAnthropic(
  apiKey: string,
  model: string,
  fullSystem: string,
  messages: { role: string; content: string }[],
  maxTokens: number
): ReadableStream<Uint8Array> {
  const client = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = await client.messages.stream({
          model: model || "claude-sonnet-4-20250514",
          max_tokens: maxTokens,
          system: fullSystem,
          messages: messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Stream error";
        controller.enqueue(encoder.encode(`\n[ERROR: ${message}]`));
        controller.close();
      }
    },
  });
}

// ─── Gemini streaming ───────────────────────────────────────────

function streamGemini(
  apiKey: string,
  model: string,
  fullSystem: string,
  messages: { role: string; content: string }[],
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const genModel = genAI.getGenerativeModel({
          model: model || "gemini-2.0-flash",
          systemInstruction: fullSystem,
        });

        // Build Gemini contents array (role: "user" | "model")
        const contents = messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

        const result = await genModel.generateContentStream({ contents });

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Stream error";
        controller.enqueue(encoder.encode(`\n[ERROR: ${message}]`));
        controller.close();
      }
    },
  });
}

// ─── Route handler ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { messages, systemContext, apiKey, model, provider } = await req.json() as {
      messages: { role: string; content: string }[];
      systemContext?: string;
      apiKey: string;
      model: string;
      provider?: LLMProvider;
    };

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const fullSystem = systemContext
      ? `${SYSTEM_PROMPT}\n\n--- LIVE GRAPH CONTEXT ---\n${systemContext}`
      : SYSTEM_PROMPT;

    // Determine provider from explicit param or model name prefix
    const resolvedProvider: LLMProvider =
      provider ?? (model?.startsWith("gemini") ? "gemini" : "anthropic");

    const readable =
      resolvedProvider === "gemini"
        ? streamGemini(apiKey, model, fullSystem, messages)
        : streamAnthropic(apiKey, model, fullSystem, messages, 2048);

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
