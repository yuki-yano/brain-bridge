import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { browser, defineBackground } from "#imports"

interface Settings {
  provider: "openai" | "claude" | "gemini"
  apiKey: string
  model: string
}

interface Message {
  type: "TRANSLATE"
  text?: string
  provider?: Settings["provider"]
  apiKey?: string
  model?: string
}

type TranslationResult = {
  error?: string
  success: boolean
  translatedText?: string
  tokenUsage?: {
    total: number
    input: number
    output: number
  }
}

const STRICT_TRANSLATION_PROMPT = `
日本語は英語に、その他は日本語に翻訳。
翻訳結果のみを返し、他の情報は一切含めないでください。
`

async function translateText(
  text: string,
  provider: Settings["provider"],
  apiKey: string,
  model: string,
): Promise<{ text: string; tokenUsage: TranslationResult["tokenUsage"] }> {
  let ai
  switch (provider) {
    case "openai":
      ai = createOpenAI({
        apiKey,
      })
      break
    case "claude":
      ai = createAnthropic({
        apiKey,
        headers: {
          "anthropic-dangerous-direct-browser-access": "true",
        },
      })
      break
    case "gemini":
      ai = createGoogleGenerativeAI({
        apiKey,
      })
      break
    default:
      throw new Error("不明なプロバイダーです")
  }

  try {
    const result = await generateText({
      messages: [
        {
          content: STRICT_TRANSLATION_PROMPT,
          role: "system",
        },
        { content: text, role: "user" },
      ],
      model: ai(model),
      temperature: 0.3,
    })

    const tokenUsage = {
      total: result.usage?.totalTokens ?? 0,
      input: result.usage?.promptTokens ?? 0,
      output: result.usage?.completionTokens ?? 0,
    }

    return {
      text: result.text.trim() || "エラー: 翻訳結果が見つかりません",
      tokenUsage,
    }
  } catch (error) {
    console.error("Translation error:", error)
    throw new Error("翻訳中にエラーが発生しました")
  }
}

export default defineBackground(() => {
  // コンテキストメニューを作成
  browser.contextMenus.create({
    id: "translate-selection",
    title: "Brain Bridgeで選択範囲を翻訳",
    contexts: ["selection"],
  })

  // コンテキストメニューのクリックを処理
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "translate-selection" && tab?.id) {
      try {
        // 設定を取得
        const result = await browser.storage.sync.get(["provider", "openai_key", "claude_key", "model"])
        const provider = result.provider as Settings["provider"]
        const apiKey = result[`${provider}_key`] as string
        const model = result.model as string

        if (!provider || !apiKey || !model) {
          await browser.tabs.sendMessage(tab.id, {
            type: "TRANSLATION_ERROR",
            error: "翻訳設定が見つかりません。拡張機能のポップアップから設定を行ってください。",
          })
          return
        }

        // コンテンツスクリプトに翻訳開始を通知
        await browser.tabs.sendMessage(tab.id, {
          type: "TRANSLATE_SELECTION",
          provider,
          apiKey,
          model,
        })
      } catch (error) {
        console.error("Error getting settings:", error)
        if (tab?.id) {
          await browser.tabs.sendMessage(tab.id, {
            type: "TRANSLATION_ERROR",
            error: "設定の取得中にエラーが発生しました。",
          })
        }
      }
    }
  })

  // コンテンツスクリプトからのメッセージを処理
  browser.runtime.onMessage.addListener((message: unknown, _sender: chrome.runtime.MessageSender, sendResponse: (response: TranslationResult) => void) => {
    const msg = message as Message

    if (msg.type === "TRANSLATE" && msg.text && msg.provider && msg.apiKey && msg.model) {
      translateText(msg.text, msg.provider, msg.apiKey, msg.model)
        .then(({ text: translatedText, tokenUsage }) => {
          sendResponse({ success: true, translatedText, tokenUsage })
        })
        .catch((e) => {
          const error = e as Error
          sendResponse({ error: error.message, success: false })
        })
      return true // 非同期応答のため
    }

    sendResponse({ error: "不明なメッセージタイプです", success: false })
  })
})
