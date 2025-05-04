import { createRoot } from "react-dom/client"
import browser from "webextension-polyfill"
import { createShadowRootUi } from "wxt/client"
import { defineContentScript } from "wxt/sandbox"
import { TranslatedTooltip } from "../../components/TranslatedTooltip"

interface Message {
  type: "TRANSLATE_SELECTION" | "TRANSLATION_ERROR" | "GET_SELECTED_TEXT"
  error?: string
  provider?: string
  apiKey?: string
  model?: string
}

interface TranslationResponse {
  error?: string
  success: boolean
  translatedText?: string
  tokenUsage?: {
    total: number
    input: number
    output: number
  }
}

// 構造を維持するブロック要素のリスト
const STRUCTURAL_ELEMENTS = new Set([
  "ARTICLE",
  "ASIDE",
  "DIV",
  "FOOTER",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEADER",
  "LI",
  "MAIN",
  "NAV",
  "OL",
  "P",
  "SECTION",
  "TABLE",
  "TBODY",
  "TD",
  "TH",
  "THEAD",
  "TR",
  "UL",
])

export default defineContentScript({
  matches: ["<all_urls>"],
  main(ctx) {
    let selectedText = ""
    let selectedRange: Range | null = null

    // 選択範囲のテキストを取得
    document.addEventListener("mouseup", () => {
      const selection = window.getSelection()
      if (selection && selection.toString().trim()) {
        selectedText = selection.toString().trim()
        selectedRange = selection.getRangeAt(0)
      } else {
        selectedText = ""
        selectedRange = null
      }
    })

    // メッセージリスナー
    browser.runtime.onMessage.addListener((message: unknown, _sender, _sendResponse) => {
      const msg = message as Message
      if (msg.type === "GET_SELECTED_TEXT") {
        return Promise.resolve({ selectedText })
      }

      if (msg.type === "TRANSLATE_SELECTION" && selectedRange && selectedText) {
        return (async () => {
          try {
            const response = (await browser.runtime.sendMessage({
              type: "TRANSLATE",
              text: selectedText,
              provider: msg.provider,
              apiKey: msg.apiKey,
              model: msg.model,
            })) as TranslationResponse

            if (response.success && response.translatedText) {
              const existingTooltip = document.getElementById("brain-bridge-tooltip-root")
              if (existingTooltip) {
                existingTooltip.remove()
              }

              await createShadowRootUi(ctx, {
                name: "brain-bridge-tooltip",
                position: "overlay",
                onMount: (_, shadow) => {
                  const reactRoot = createRoot(shadow)
                  reactRoot.render(
                    <TranslatedTooltip
                      translatedText={response.translatedText!}
                      originalHtml={selectedText}
                      tokenUsage={response.tokenUsage}
                      modelValue={msg.model}
                      provider={msg.provider}
                    />,
                  )
                },
              })

              return response
            } else {
              throw new Error(response.error || "翻訳に失敗しました")
            }
          } catch (error) {
            console.error("Translation error:", error)
            const errorMessage = error instanceof Error ? error.message : "翻訳中にエラーが発生しました"
            return { error: errorMessage, success: false }
          }
        })()
      }

      if (msg.type === "TRANSLATION_ERROR") {
        console.error("Translation error:", msg.error)
        return Promise.resolve({ error: msg.error, success: false })
      }

      return Promise.resolve({ error: "不明なメッセージタイプです", success: false })
    })

    // テキストを翻訳する関数
    async function translateText(
      text: string,
      provider: string,
      apiKey: string,
      model: string,
    ): Promise<TranslationResponse> {
      const response = (await browser.runtime.sendMessage({
        text,
        type: "TRANSLATE",
        provider,
        apiKey,
        model,
      })) as TranslationResponse

      if (!response.success) {
        throw new Error(response.error || "翻訳に失敗しました")
      }

      return response
    }

    // テキストノードをTooltipで包む関数
    async function wrapTextNode(
      node: Text,
      translatedText: string,
      originalHtml: string,
      tokenUsage?: TranslationResponse["tokenUsage"],
      provider?: string,
      model?: string,
    ): Promise<void> {
      const { shadowHost, shadow } = await createShadowRootUi(ctx, {
        name: "brain-bridge-translated",
        position: "overlay",
        onMount: (_, shadow) => {
          const tooltipRoot = createRoot(shadow)
          tooltipRoot.render(
            <TranslatedTooltip
              translatedText={translatedText}
              originalHtml={originalHtml}
              tokenUsage={tokenUsage}
              provider={provider}
              modelValue={model}
            />,
          )
        },
      })

      const tooltipRoot = createRoot(shadow)
      tooltipRoot.render(
        <TranslatedTooltip
          translatedText={translatedText}
          originalHtml={originalHtml}
          tokenUsage={tokenUsage}
          provider={provider}
          modelValue={model}
          onClick={(e) => {
            e.stopPropagation()
            const selection = window.getSelection()
            if (selection) {
              const range = document.createRange()
              range.selectNode(shadowHost)
              selection.removeRange(range)
            }
          }}
        />,
      )

      const originalNode = node.parentNode
      if (originalNode) {
        originalNode.replaceChild(shadowHost, node)
      }
    }

    // 選択範囲内のテキストを収集して翻訳する関数
    async function translateRange(
      range: Range,
      provider: string,
      apiKey: string,
      model: string,
    ): Promise<TranslationResponse | undefined> {
      const container = range.commonAncestorContainer
      const root = container.nodeType === Node.TEXT_NODE ? container.parentElement! : (container as Element)

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          let parent = node.parentElement
          while (parent) {
            // 翻訳済みのテキストを除外
            if (
              parent.classList?.contains("brain-bridge-translated-container") ||
              parent.classList?.contains("brain-bridge-tooltip-content") ||
              parent.id === "brain-bridge-tooltip-content" ||
              parent.tagName === "PRE" ||
              parent.tagName === "CODE"
            ) {
              return NodeFilter.FILTER_REJECT
            }
            parent = parent.parentElement
          }
          return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
        },
      })

      const textNodes: Text[] = []
      let node: Node | null

      while ((node = walker.nextNode())) {
        if (node.textContent?.trim()) {
          textNodes.push(node as Text)
        }
      }

      // 選択範囲は翻訳完了後に解除するため、ここでは解除しない
      const originalSelection = window.getSelection()

      // 最も近い構造的な親要素を見つける関数
      function findNearestStructuralParent(node: Text): Element | null {
        let parent = node.parentElement
        while (parent) {
          if (STRUCTURAL_ELEMENTS.has(parent.tagName)) {
            return parent
          }
          parent = parent.parentElement
        }
        return null
      }

      // テキストノードをグループ化
      const structuralGroups = new Map<Element, Text[]>()
      const nonStructuralNodes: Array<{ node: Text; context: Element }> = []

      for (const textNode of textNodes) {
        const structuralParent = findNearestStructuralParent(textNode)

        if (structuralParent) {
          if (!structuralGroups.has(structuralParent)) {
            structuralGroups.set(structuralParent, [])
          }
          structuralGroups.get(structuralParent)!.push(textNode)
        } else {
          // 構造的な親要素がない場合、直近の親要素のコンテキストを保持
          const immediateParent = textNode.parentElement || root
          nonStructuralNodes.push({
            node: textNode,
            context: immediateParent,
          })
        }
      }

      type TranslationTask = {
        html: string
        isStructural: boolean
        nodes: Text[]
        text: string
        context?: Element
      }
      const translationTasks: TranslationTask[] = []

      // 構造的な要素のグループを処理
      for (const [parent, nodes] of structuralGroups) {
        const texts: string[] = []
        for (const node of nodes) {
          const text = node.textContent?.trim()
          if (text) {
            texts.push(text)
          }
        }

        const combinedText = texts.join(" ")
        if (combinedText) {
          translationTasks.push({
            html: parent.outerHTML,
            isStructural: true,
            nodes,
            text: combinedText,
          })
        }
      }

      // 非構造的なノードを処理
      for (const { node, context } of nonStructuralNodes) {
        const text = node.textContent?.trim()
        if (text) {
          translationTasks.push({
            html: context.outerHTML,
            isStructural: false,
            nodes: [node],
            text,
            context,
          })
        }
      }

      const results: TranslationResponse | undefined = await Promise.all(
        translationTasks.map(async ({ html, isStructural, nodes, text }) => {
          try {
            const response = await translateText(text, provider, apiKey, model)
            if (response.success && response.translatedText) {
              if (isStructural) {
                if (nodes.length > 0) {
                  const firstNode = nodes[0]
                  const parentElement = firstNode.parentElement
                  if (parentElement) {
                    wrapTextNode(
                      firstNode,
                      response.translatedText,
                      parentElement.outerHTML,
                      response.tokenUsage,
                      provider,
                      model,
                    )
                    for (let i = 1; i < nodes.length; i++) {
                      nodes[i].textContent = ""
                    }
                  }
                }
              } else {
                wrapTextNode(nodes[0], response.translatedText, html, response.tokenUsage, provider, model)
              }
            }
            return response
          } catch (error) {
            console.error("Translation error for text:", text, error)
            throw error
          }
        }),
      ).then((responses) => {
        // すべての翻訳が完了した後に選択範囲を解除
        if (originalSelection) {
          originalSelection.removeAllRanges()
        }

        if (responses.every((r) => r.success)) {
          return responses.reduce((acc, response) => {
            if (response.tokenUsage) {
              if (!acc.tokenUsage) {
                acc.tokenUsage = {
                  total: 0,
                  input: 0,
                  output: 0,
                }
              }
              acc.tokenUsage.total += response.tokenUsage.total
              acc.tokenUsage.input += response.tokenUsage.input
              acc.tokenUsage.output += response.tokenUsage.output
            }
            return acc
          }, {} as TranslationResponse)
        } else {
          throw new Error("Translation failed")
        }
      })

      return results
    }

    // メッセージリスナー
    browser.runtime.onMessage.addListener(async (message: unknown) => {
      const msg = message as { type: string }

      if (msg.type === "GET_SELECTED_TEXT") {
        const selection = window.getSelection()
        return Promise.resolve({
          selectedText: selection ? selection.toString().trim() : "",
        })
      }

      if (msg.type === "TRANSLATION_ERROR") {
        const { error } = message as { type: string; error: string }
        console.error("Translation error:", error)
        // TODO: エラーメッセージをユーザーに表示する処理を追加
        return Promise.resolve({ success: false })
      }

      if (msg.type === "TRANSLATE_SELECTION") {
        const { provider, apiKey, model } = message as {
          type: string
          provider: string
          apiKey: string
          model: string
        }

        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) {
          return Promise.resolve({ success: false, error: "テキストが選択されていません" })
        }

        const originalRange = selection.getRangeAt(0).cloneRange()

        try {
          const results = await translateRange(originalRange, provider, apiKey, model)
          return { success: true, tokenUsage: results?.tokenUsage }
        } catch (error_1) {
          console.error("Translation error:", error_1)
          return {
            error: error_1 instanceof Error ? error_1.message : String(error_1),
            success: false,
          }
        }
      }

      return Promise.resolve({ error: "不明なメッセージタイプです", success: false })
    })
  },
})
