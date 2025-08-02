/**
 * Brain Bridge メッセージング型定義
 *
 * このファイルはContent Script、Background Script、Popup間の
 * 型安全な通信を実現するための型定義を提供します。
 */

// プロバイダー型
export type AIProvider = "openai" | "claude" | "gemini"

// トークン使用量
export interface TokenUsage {
  total: number
  input: number
  output: number
}

// 基本的なメッセージ型
export interface BaseMessage {
  type: string
  timestamp?: number
}

// Content Script -> Background Script メッセージ
export interface TranslateMessage extends BaseMessage {
  type: "TRANSLATE"
  text: string
  provider: AIProvider
  apiKey: string
  model: string
}

// Background Script -> Content Script メッセージ
export interface TranslateResponseMessage extends BaseMessage {
  type: "TRANSLATE_RESPONSE"
  success: boolean
  translatedText?: string
  tokenUsage?: TokenUsage
  error?: string
}

export interface TranslateSelectionMessage extends BaseMessage {
  type: "TRANSLATE_SELECTION"
  provider: AIProvider
  apiKey: string
  model: string
}

export interface GetSelectedTextMessage extends BaseMessage {
  type: "GET_SELECTED_TEXT"
}

export interface SelectedTextResponse {
  selectedText: string
}

export interface TranslationErrorMessage extends BaseMessage {
  type: "TRANSLATION_ERROR"
  error: string
}

// メッセージ型のユニオン
export type RuntimeMessage =
  | TranslateMessage
  | TranslateResponseMessage
  | TranslateSelectionMessage
  | GetSelectedTextMessage
  | TranslationErrorMessage

// 設定型
export interface Settings {
  provider: AIProvider
  openai_key?: string
  claude_key?: string
  gemini_key?: string
  model: string
}

// ストレージキー
export const STORAGE_KEYS = {
  PROVIDER: "provider",
  OPENAI_KEY: "openai_key",
  CLAUDE_KEY: "claude_key",
  GEMINI_KEY: "gemini_key",
  MODEL: "model",
} as const

// エラーメッセージ
export const ERROR_MESSAGES = {
  NO_SELECTION: "テキストが選択されていません",
  NO_SETTINGS: "翻訳設定が見つかりません。拡張機能のポップアップから設定を行ってください。",
  TRANSLATION_FAILED: "翻訳に失敗しました",
  NETWORK_ERROR: "ネットワークエラーが発生しました",
  API_ERROR: "APIエラーが発生しました",
  UNKNOWN_ERROR: "不明なエラーが発生しました",
} as const

// デフォルトモデル
export const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: "gpt-4.1-nano",
  claude: "claude-3-5-haiku-20241022",
  gemini: "gemini-2.5-flash-lite-preview-06-17",
}

// ヘルパー関数
export function isTranslateMessage(msg: unknown): msg is TranslateMessage {
  return typeof msg === "object" && msg !== null && "type" in msg && msg.type === "TRANSLATE"
}

export function isTranslateSelectionMessage(msg: unknown): msg is TranslateSelectionMessage {
  return typeof msg === "object" && msg !== null && "type" in msg && msg.type === "TRANSLATE_SELECTION"
}

export function isGetSelectedTextMessage(msg: unknown): msg is GetSelectedTextMessage {
  return typeof msg === "object" && msg !== null && "type" in msg && msg.type === "GET_SELECTED_TEXT"
}

export function isTranslationErrorMessage(msg: unknown): msg is TranslationErrorMessage {
  return typeof msg === "object" && msg !== null && "type" in msg && msg.type === "TRANSLATION_ERROR"
}
