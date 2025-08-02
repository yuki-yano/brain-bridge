import { Settings2, X } from "lucide-react"
import React, { useEffect, useState } from "react"
import { browser } from "#imports"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import {
  calculateCost,
  DEFAULT_PROVIDER,
  DEFAULT_SETTINGS,
  MODEL_OPTIONS,
  Provider,
  PROVIDER_OPTIONS,
  STORAGE_KEYS,
  TokenUsage,
} from "../../const"

interface Settings {
  provider: Provider
  apiKey: string
  model: string
  showTokenCount: boolean
}

interface TranslationResponse {
  error?: string
  success: boolean
  translatedText?: string
  tokenUsage?: TokenUsage
}

// APIキーをマスクする関数
function maskApiKey(apiKey: string): string {
  if (!apiKey) return ""
  const prefix = apiKey.slice(0, 3)
  const suffix = apiKey.slice(-4)
  return `${prefix}...${suffix}`
}

function App() {
  const [settings, setSettings] = useState<Settings>({
    apiKey: "",
    model: MODEL_OPTIONS[DEFAULT_PROVIDER][0].value,
    provider: DEFAULT_PROVIDER,
    showTokenCount: DEFAULT_SETTINGS.SHOW_TOKEN_COUNT,
  })
  const [apiKeys, setApiKeys] = useState<Record<Provider, string>>({
    claude: "",
    gemini: "",
    openai: "",
  })
  const [status, setStatus] = useState("")
  const [selectedText, setSelectedText] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [tokenUsage, setTokenUsage] = useState<TokenUsage>()

  useEffect(() => {
    // 保存されている設定を取得
    browser.storage.sync
      .get([
        STORAGE_KEYS.PROVIDER,
        STORAGE_KEYS.OPENAI_KEY,
        STORAGE_KEYS.CLAUDE_KEY,
        STORAGE_KEYS.GEMINI_KEY,
        STORAGE_KEYS.MODEL,
        STORAGE_KEYS.SHOW_TOKEN_COUNT,
      ])
      .then((result) => {
        const provider = (result[STORAGE_KEYS.PROVIDER] as Provider) ?? DEFAULT_PROVIDER
        const apiKeyMap = {
          claude: (result[STORAGE_KEYS.CLAUDE_KEY] as string) ?? "",
          gemini: (result[STORAGE_KEYS.GEMINI_KEY] as string) ?? "",
          openai: (result[STORAGE_KEYS.OPENAI_KEY] as string) ?? "",
        }
        setApiKeys(apiKeyMap)
        setSettings({
          apiKey: apiKeyMap[provider],
          model: (result[STORAGE_KEYS.MODEL] as string) ?? MODEL_OPTIONS[provider][0].value,
          provider,
          showTokenCount: (result[STORAGE_KEYS.SHOW_TOKEN_COUNT] as boolean) ?? DEFAULT_SETTINGS.SHOW_TOKEN_COUNT,
        })
      })

    // 選択されているテキストを取得
    browser.tabs.query({ active: true, currentWindow: true }).then(async (tabs) => {
      if (tabs[0].id) {
        const response = (await browser.tabs.sendMessage(tabs[0].id, { type: "GET_SELECTED_TEXT" })) as {
          selectedText: string
        }
        if (response?.selectedText) {
          setSelectedText(response.selectedText)
        }
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // APIキーを保存
      await browser.storage.sync.set({
        [STORAGE_KEYS.PROVIDER]: settings.provider,
        [`${settings.provider}_key`]: settings.apiKey,
        [STORAGE_KEYS.MODEL]: settings.model,
        [STORAGE_KEYS.SHOW_TOKEN_COUNT]: settings.showTokenCount,
      })

      // APIキーの状態を更新
      setApiKeys((prev) => ({
        ...prev,
        [settings.provider]: settings.apiKey,
      }))

      setStatus("設定を保存しました")
      setShowSettings(false)
      // 3秒後にステータスメッセージをクリア
      setTimeout(() => {
        setStatus("")
      }, 3000)
    } catch (error: unknown) {
      console.error("Error setting API key:", error)
      setStatus("エラーが発生しました")
    }
  }

  const handleReset = async () => {
    try {
      // 設定を初期化
      const initialSettings = {
        provider: DEFAULT_PROVIDER,
        model: MODEL_OPTIONS[DEFAULT_PROVIDER][0].value,
        apiKey: "",
        showTokenCount: DEFAULT_SETTINGS.SHOW_TOKEN_COUNT,
      }

      // ストレージから設定を削除
      await browser.storage.sync.remove([
        STORAGE_KEYS.PROVIDER,
        STORAGE_KEYS.OPENAI_KEY,
        STORAGE_KEYS.CLAUDE_KEY,
        STORAGE_KEYS.GEMINI_KEY,
        STORAGE_KEYS.MODEL,
        STORAGE_KEYS.SHOW_TOKEN_COUNT,
      ])

      // 状態を初期化
      setSettings(initialSettings)
      setApiKeys({
        claude: "",
        gemini: "",
        openai: "",
      })

      setStatus("設定をリセットしました")
      setShowResetConfirm(false)
      setTimeout(() => {
        setStatus("")
      }, 3000)
    } catch (error) {
      console.error("Error resetting settings:", error)
      setStatus("リセット中にエラーが発生しました")
    }
  }

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as Provider
    setSettings({
      apiKey: apiKeys[newProvider],
      model: MODEL_OPTIONS[newProvider][0].value,
      provider: newProvider,
      showTokenCount: settings.showTokenCount,
    })
  }

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value
    setApiKeys((prev) => ({
      ...prev,
      [settings.provider]: newApiKey,
    }))
    setSettings((prev) => ({
      ...prev,
      apiKey: newApiKey,
    }))
  }

  const handleTranslate = async () => {
    if (!selectedText) return

    try {
      setIsLoading(true)
      setTokenUsage(undefined)
      // 現在アクティブなタブを取得
      const tabs = await browser.tabs.query({ active: true, currentWindow: true })
      if (!tabs[0].id) return

      // 設定を取得
      const result = await browser.storage.sync.get([
        STORAGE_KEYS.PROVIDER,
        STORAGE_KEYS.OPENAI_KEY,
        STORAGE_KEYS.CLAUDE_KEY,
        STORAGE_KEYS.MODEL,
      ])
      const provider = result[STORAGE_KEYS.PROVIDER] as Provider
      const apiKey = result[`${provider}_key`] as string
      const model = result[STORAGE_KEYS.MODEL] as string

      if (!provider || !apiKey || !model) {
        setStatus("翻訳設定が見つかりません。設定を確認してください。")
        return
      }

      const response = (await browser.tabs.sendMessage(tabs[0].id, {
        type: "TRANSLATE_SELECTION",
        provider,
        apiKey,
        model,
      })) as TranslationResponse

      if (response.success) {
        setStatus("")
        if (response.tokenUsage) {
          setTokenUsage(response.tokenUsage)
        }
      } else {
        setStatus(response.error || "翻訳中にエラーが発生しました")
      }
    } catch (error) {
      console.error("Translation error:", error)
      setStatus("翻訳中にエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  if (showSettings) {
    return (
      <div className="w-[320px] p-6 bg-background">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">設定</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowSettings(false)
              setStatus("")
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">プロバイダー</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={settings.provider}
              onChange={handleProviderChange}
            >
              {PROVIDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">モデル</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
            >
              {MODEL_OPTIONS[settings.provider].map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium text-muted-foreground">
              {settings.provider === "openai" ? "OpenAI" : settings.provider === "claude" ? "Claude" : "Gemini"}{" "}
              APIキー
            </label>
            <Input
              id="apiKey"
              onChange={handleApiKeyChange}
              placeholder={
                settings.provider === "openai"
                  ? "sk-..."
                  : settings.provider === "claude"
                    ? "sk-ant-..."
                    : "aiza..."
              }
              type="password"
              value={settings.apiKey}
            />
            {apiKeys[settings.provider] && (
              <p className="text-xs text-muted-foreground mt-1">現在のキー: {maskApiKey(apiKeys[settings.provider])}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showTokenCount"
              checked={settings.showTokenCount}
              onChange={(e) => setSettings((prev) => ({ ...prev, showTokenCount: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="showTokenCount" className="text-sm font-medium text-muted-foreground">
              トークン数を表示
            </label>
          </div>
          <Button type="submit" className="w-full">
            保存
          </Button>
        </form>
        <div className="flex justify-end mt-4">
          {showResetConfirm ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowResetConfirm(false)}>
                キャンセル
              </Button>
              <Button variant="destructive" size="sm" onClick={handleReset}>
                リセットする
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              className="text-destructive hover:text-destructive border-destructive hover:bg-destructive/10"
            >
              設定をリセット
            </Button>
          )}
        </div>
        {status && (
          <p className={`mt-4 text-sm ${status.includes("エラー") ? "text-destructive" : "text-primary"}`}>{status}</p>
        )}
      </div>
    )
  }

  return (
    <div className="w-[320px] p-6 bg-background">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Brain Bridge</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowSettings(true)
            setStatus("")
          }}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {settings.apiKey && (
            <>
              <p>Provider: {PROVIDER_OPTIONS.find((option) => option.value === settings.provider)?.label}</p>
              <p>
                Model:{" "}
                {(() => {
                  const model = MODEL_OPTIONS[settings.provider].find((option) => option.value === settings.model)
                  if (model) {
                    return (
                      <span className="border-b border-dotted border-muted-foreground cursor-help">{model.label}</span>
                    )
                  }
                  return null
                })()}
              </p>
            </>
          )}
        </div>
        <Button onClick={handleTranslate} className="w-full" disabled={!selectedText || isLoading}>
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
              翻訳中...
            </>
          ) : (
            "翻訳する"
          )}
        </Button>
        {tokenUsage && settings.showTokenCount && (
          <p className="text-sm text-muted-foreground text-center">
            Total: {tokenUsage.total.toLocaleString()} tokens
            <br />
            Input: {tokenUsage.input.toLocaleString()} tokens / Output: {tokenUsage.output.toLocaleString()} tokens
            <br />
            {(() => {
              const model = MODEL_OPTIONS[settings.provider].find((m) => m.value === settings.model)
              if (model) {
                const costs = calculateCost(tokenUsage, model)
                return `Cost: $${costs.totalCost.toFixed(6)} (¥${costs.totalCostJPY.toFixed(2)})`
              }
              return null
            })()}
          </p>
        )}
        {selectedText ? (
          <>
            <hr />
            <h2 className="text-sm text-center font-medium">選択されたテキスト</h2>
            <p className="text-sm text-muted-foreground bg-secondary/50 p-2 rounded-md">{selectedText}</p>
          </>
        ) : (
          <h2 className="text-sm text-center text-muted-foreground">翻訳したいテキストを選択</h2>
        )}
        {status && (
          <p className={`mt-4 text-sm ${status.includes("エラー") ? "text-destructive" : "text-primary"}`}>{status}</p>
        )}
      </div>
    </div>
  )
}

export default App
