// ─── LLM Provider Abstraction ───────────────────────────────────
// Unified interface for streaming from multiple LLM providers

export type LLMProvider = "anthropic" | "gemini";

export interface StreamOptions {
  apiKey: string;
  model: string;
  systemPrompt: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
}

export interface ProviderModelOption {
  value: string;
  label: string;
  provider: LLMProvider;
}

export const PROVIDER_MODELS: ProviderModelOption[] = [
  // Anthropic
  { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4", provider: "anthropic" },
  { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5", provider: "anthropic" },
  { value: "claude-opus-4-6", label: "Claude Opus 4.6", provider: "anthropic" },
  // Gemini
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", provider: "gemini" },
  { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite", provider: "gemini" },
  { value: "gemini-2.5-pro-preview-06-05", label: "Gemini 2.5 Pro", provider: "gemini" },
];

export function getModelsForProvider(provider: LLMProvider): ProviderModelOption[] {
  return PROVIDER_MODELS.filter((m) => m.provider === provider);
}

export function getProviderForModel(model: string): LLMProvider | null {
  return PROVIDER_MODELS.find((m) => m.value === model)?.provider ?? null;
}

export function getDefaultModel(provider: LLMProvider): string {
  return provider === "anthropic"
    ? "claude-sonnet-4-20250514"
    : "gemini-2.0-flash";
}
