/**
 * Tooltip管理モジュール
 *
 * Shadow DOMを使用したTooltipの作成・管理
 */

import { createShadowRootUi, type ContentScriptContext } from "#imports"

export interface TooltipState {
  isVisible: boolean
  shadowHost: HTMLElement | null
  rootId: string
}

export class TooltipManager {
  private state: TooltipState = {
    isVisible: false,
    shadowHost: null,
    rootId: "brain-bridge-tooltip-root",
  }

  constructor(private ctx: ContentScriptContext) {}

  /**
   * 既存のTooltipを削除
   */
  async remove(): Promise<void> {
    try {
      // 既存のTooltipを検索して削除
      const existingTooltip = document.getElementById(this.state.rootId)
      if (existingTooltip) {
        existingTooltip.remove()
      }

      // Shadow host経由でも削除を試みる
      if (this.state.shadowHost && this.state.shadowHost.parentNode) {
        this.state.shadowHost.remove()
      }

      this.state.isVisible = false
      this.state.shadowHost = null
    } catch (error) {
      console.error("Error removing tooltip:", error)
    }
  }

  /**
   * 新しいTooltipを作成
   */
  async create(onMount: (container: HTMLElement, shadow: ShadowRoot) => void): Promise<void> {
    console.log("[Brain Bridge] Creating tooltip")
    try {
      // 既存のTooltipを削除
      await this.remove()

      // 新しいShadow DOMを作成
      console.log("[Brain Bridge] Creating shadow root UI")
      await createShadowRootUi(this.ctx, {
        name: "brain-bridge-tooltip",
        position: "overlay",
        onMount: (container: HTMLElement) => {
          const shadow = container.shadowRoot
          if (!shadow) {
            console.error("[Brain Bridge] No shadow root found")
            return
          }
          console.log("[Brain Bridge] Shadow root onMount called")
          // コンテナにIDを設定
          container.id = this.state.rootId
          console.log("[Brain Bridge] Container created with ID:", container.id)

          // スタイルを追加
          const style = document.createElement("style")
          style.textContent = `
            :host {
              position: fixed;
              z-index: 2147483647;
              pointer-events: none;
            }
            * {
              pointer-events: auto;
            }
          `
          shadow.appendChild(style)
          console.log("[Brain Bridge] Shadow DOM style added")

          // カスタムマウント処理を実行
          console.log("[Brain Bridge] Calling custom onMount")
          try {
            onMount(container, shadow)
          } catch (mountError) {
            console.error("[Brain Bridge] Error in onMount:", mountError)
            throw mountError
          }

          // 状態を更新
          this.state.shadowHost = container
          this.state.isVisible = true
          console.log("[Brain Bridge] Tooltip created successfully")
        },
      })
    } catch (error) {
      console.error("[Brain Bridge] Error creating tooltip:", error)
      if (error instanceof Error) {
        console.error("[Brain Bridge] Error stack:", error.stack)
      }
      throw error
    }
  }

  /**
   * Tooltipの表示状態を取得
   */
  isVisible(): boolean {
    return this.state.isVisible
  }

  /**
   * Tooltipの位置を更新
   */
  updatePosition(x: number, y: number): void {
    if (this.state.shadowHost) {
      this.state.shadowHost.style.left = `${x}px`
      this.state.shadowHost.style.top = `${y}px`
    }
  }

  /**
   * クリーンアップ処理
   */
  cleanup(): void {
    this.remove()
  }
}

/**
 * Tooltipの表示/非表示をアニメーション付きで制御
 */
export function animateTooltip(element: HTMLElement, show: boolean, duration: number = 200): Promise<void> {
  return new Promise((resolve) => {
    if (show) {
      element.style.opacity = "0"
      element.style.transform = "translateY(10px)"
      element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`

      // 次のフレームでアニメーション開始
      requestAnimationFrame(() => {
        element.style.opacity = "1"
        element.style.transform = "translateY(0)"

        setTimeout(resolve, duration)
      })
    } else {
      element.style.opacity = "0"
      element.style.transform = "translateY(10px)"

      setTimeout(() => {
        element.style.display = "none"
        resolve()
      }, duration)
    }
  })
}
