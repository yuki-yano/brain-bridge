export const PROVIDER_OPTIONS = [
  { label: "OpenAI", value: "openai" as const },
  { label: "Claude", value: "claude" as const },
  { label: "Gemini", value: "gemini" as const },
] as const

export type Provider = (typeof PROVIDER_OPTIONS)[number]["value"]

export interface ModelOption {
  label: string
  value: string
  pricing: {
    input: number
    output: number
  }
}

export const MODEL_OPTIONS: Record<Provider, ModelOption[]> = {
  openai: [
    { label: "GPT-4.1", value: "gpt-4.1", pricing: { input: 2, output: 8 } },
    { label: "GPT-4.1 mini", value: "gpt-4.1-mini", pricing: { input: 0.4, output: 1.6 } },
    { label: "GPT-4.1 nano", value: "gpt-4.1-nano", pricing: { input: 0.1, output: 0.4 } },
  ],
  claude: [
    { label: "Claude 4 Sonnet", value: "claude-sonnet-4-20250514", pricing: { input: 3, output: 15 } },
    { label: "Claude 3.5 Sonnet", value: "claude-3-5-sonnet-latest", pricing: { input: 3, output: 15 } },
    { label: "Claude 3.5 Haiku", value: "claude-3-5-haiku-20241022", pricing: { input: 0.8, output: 4 } },
  ],
  gemini: [
    { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash", pricing: { input: 0.3, output: 2.5 } },
    {
      label: "Gemini 2.5 Flash-Lite",
      value: "gemini-2.5-flash-lite",
      pricing: { input: 0.1, output: 0.4 },
    },
    { label: "Gemini 2.5 Pro", value: "gemini-2.5-pro", pricing: { input: 1.25, output: 10 } },
  ],
} as const

export interface TokenUsage {
  total: number
  input: number
  output: number
}

export const calculateCost = (tokenUsage: TokenUsage, model: ModelOption) => {
  const inputCost = (tokenUsage.input * model.pricing.input) / 1_000_000
  const outputCost = (tokenUsage.output * model.pricing.output) / 1_000_000
  const totalCost = inputCost + outputCost
  const totalCostJPY = totalCost * 150

  return {
    inputCost,
    outputCost,
    totalCost,
    totalCostJPY,
    inputCostJPY: inputCost * 150,
    outputCostJPY: outputCost * 150,
  }
}

export const DEFAULT_PROVIDER: Provider = "openai"
export const JPY_RATE = 150
export const STORAGE_KEYS = {
  PROVIDER: "provider",
  MODEL: "model",
  OPENAI_KEY: "openai_key",
  CLAUDE_KEY: "claude_key",
  GEMINI_KEY: "gemini_key",
  SHOW_TOKEN_COUNT: "show_token_count",
} as const

export const DEFAULT_SETTINGS = {
  PROVIDER: "openai" as Provider,
  SHOW_TOKEN_COUNT: true,
} as const
