export const PROVIDER_OPTIONS = [
  { label: "OpenAI", value: "openai" as const },
  { label: "Claude", value: "claude" as const },
  { label: "DeepSeek", value: "deepseek" as const },
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
    { label: "GPT-4o", value: "gpt-4o", pricing: { input: 5, output: 15 } },
    { label: "o3-mini", value: "o3-mini", pricing: { input: 2.5, output: 10 } },
    { label: "o1-mini", value: "o1-mini", pricing: { input: 2.5, output: 10 } },
    { label: "o1", value: "o1", pricing: { input: 30, output: 60 } },
  ],
  claude: [
    { label: "Claude 3.5 Sonnet", value: "claude-3-5-sonnet-latest", pricing: { input: 3, output: 15 } },
    { label: "Claude 3.5 Haiku", value: "claude-3-5-haiku-latest", pricing: { input: 0.8, output: 4 } },
  ],
  deepseek: [
    { label: "DeepSeek Reasoner", value: "deepseek-reasoner", pricing: { input: 0.55, output: 2.19 } },
    { label: "DeepSeek Chat", value: "deepseek-chat", pricing: { input: 0.14, output: 0.28 } },
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
  DEEPSEEK_KEY: "deepseek_key",
  SHOW_TOKEN_COUNT: "show_token_count",
} as const

export const DEFAULT_SETTINGS = {
  PROVIDER: "openai" as Provider,
  SHOW_TOKEN_COUNT: true,
} as const
