/**
 * テキスト選択処理モジュール
 *
 * Firefox/Chrome両対応のシンプルな選択処理を提供
 */

export interface SelectionInfo {
  text: string
  rect: DOMRect | null
  rangeCount: number
}

/**
 * 現在の選択範囲の情報を取得
 */
export function getSelectionInfo(): SelectionInfo | null {
  try {
    const selection = window.getSelection()

    if (!selection || selection.rangeCount === 0) {
      return null
    }

    const text = selection.toString().trim()

    if (!text) {
      return null
    }

    // 選択範囲の位置情報を取得
    let rect: DOMRect | null = null
    try {
      const range = selection.getRangeAt(0)
      rect = range.getBoundingClientRect()
    } catch (e) {
      // 位置情報の取得に失敗しても続行
      console.warn("Failed to get selection rect:", e)
    }

    return {
      text,
      rect,
      rangeCount: selection.rangeCount,
    }
  } catch (error) {
    console.error("Error getting selection info:", error)
    return null
  }
}

/**
 * 選択を解除
 */
export function clearSelection(): void {
  try {
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
    }
  } catch (error) {
    console.error("Error clearing selection:", error)
  }
}

/**
 * マウス位置を取得（Tooltip表示用）
 */
export function getMousePosition(event: MouseEvent): { x: number; y: number } {
  return {
    x: event.clientX,
    y: event.clientY,
  }
}

/**
 * 選択範囲の中心位置を計算
 */
export function getSelectionCenter(rect: DOMRect): { x: number; y: number } {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

/**
 * Tooltip表示に適した位置を計算
 */
export function calculateTooltipPosition(
  selectionRect: DOMRect | null,
  mousePos: { x: number; y: number },
  tooltipSize: { width: number; height: number },
): { x: number; y: number } {
  // 選択範囲の情報が取得できない場合はマウス位置を使用
  if (!selectionRect) {
    return {
      x: mousePos.x,
      y: mousePos.y - tooltipSize.height - 10, // マウスの上に表示
    }
  }

  // 基本的に選択範囲の下に表示
  let x = selectionRect.left + selectionRect.width / 2 - tooltipSize.width / 2
  let y = selectionRect.bottom + 10

  // 画面外にはみ出す場合の調整
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // 横方向の調整
  if (x < 0) {
    x = 10
  } else if (x + tooltipSize.width > viewportWidth) {
    x = viewportWidth - tooltipSize.width - 10
  }

  // 縦方向の調整（画面下部にはみ出す場合は選択範囲の上に表示）
  if (y + tooltipSize.height > viewportHeight) {
    y = selectionRect.top - tooltipSize.height - 10
  }

  // それでも画面外の場合は画面内に収める
  if (y < 0) {
    y = 10
  }

  return { x, y }
}

/**
 * 選択イベントの debounce 処理用
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
      timeout = null
    }, wait)
  }
}
