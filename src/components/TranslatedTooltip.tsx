import React, { useEffect, useRef, useState } from "react"
import browser from "webextension-polyfill"
import { calculateCost, DEFAULT_SETTINGS, MODEL_OPTIONS, STORAGE_KEYS, TokenUsage } from "../const"
import { useTooltipPosition } from "../hooks/useTooltipPosition"
import {
  containerInlineStyles,
  costInfoInlineStyles,
  textFixedInlineStyles,
  textInlineStyles,
  tokenInfoInlineStyles,
  tooltipContentCodeInlineStyles,
  tooltipContentHeadingInlineStyles,
  tooltipContentInlineStyles,
  tooltipContentLinkHoverInlineStyles,
  tooltipContentLinkInlineStyles,
  tooltipContentListInlineStyles,
  tooltipContentListItemInlineStyles,
  tooltipContentParagraphInlineStyles,
  tooltipContentPreInlineStyles,
  tooltipInlineStyles,
} from "./TranslatedTooltip.styles"

interface TranslatedTooltipProps {
  translatedText: string
  originalHtml: string
  onHover?: () => void
  onClick?: (e: React.MouseEvent) => void
  tokenUsage?: TokenUsage
  modelValue?: string
  provider?: string
}

const applyStylesToHtml = (html: string): string => {
  const div = document.createElement("div")
  div.innerHTML = html

  const processElement = (element: Element) => {
    if (element.tagName === "A") {
      const anchor = element as HTMLAnchorElement
      anchor.setAttribute("target", "_blank")
      anchor.setAttribute("rel", "noopener noreferrer")
      Object.assign(anchor.style, tooltipContentLinkInlineStyles)
      anchor.addEventListener("mouseover", () => {
        Object.assign(anchor.style, tooltipContentLinkHoverInlineStyles)
      })
      anchor.addEventListener("mouseout", () => {
        Object.assign(anchor.style, tooltipContentLinkInlineStyles)
      })
    } else if (
      element.tagName === "H1" ||
      element.tagName === "H2" ||
      element.tagName === "H3" ||
      element.tagName === "H4" ||
      element.tagName === "H5" ||
      element.tagName === "H6"
    ) {
      Object.assign((element as HTMLHeadingElement).style, tooltipContentHeadingInlineStyles)
    } else if (element.tagName === "P") {
      Object.assign((element as HTMLParagraphElement).style, tooltipContentParagraphInlineStyles)
    } else if (element.tagName === "CODE") {
      Object.assign((element as HTMLElement).style, tooltipContentCodeInlineStyles)
    } else if (element.tagName === "PRE") {
      Object.assign((element as HTMLPreElement).style, tooltipContentPreInlineStyles)
    } else if (element.tagName === "UL" || element.tagName === "OL") {
      Object.assign((element as HTMLUListElement | HTMLOListElement).style, tooltipContentListInlineStyles)
    } else if (element.tagName === "LI") {
      Object.assign((element as HTMLLIElement).style, tooltipContentListItemInlineStyles)
    }
    element.childNodes.forEach((child) => {
      if (child.nodeType === 1) {
        processElement(child as Element)
      }
    })
  }

  processElement(div)
  return div.innerHTML
}

export function TranslatedTooltip({
  translatedText,
  originalHtml,
  onHover,
  onClick,
  tokenUsage,
  modelValue,
  provider,
}: TranslatedTooltipProps) {
  const [isFixed, setIsFixed] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [showTokenCount, setShowTokenCount] = useState<boolean>(DEFAULT_SETTINGS.SHOW_TOKEN_COUNT)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    browser.storage.sync.get([STORAGE_KEYS.SHOW_TOKEN_COUNT]).then((result) => {
      const showTokenCountValue =
        (result[STORAGE_KEYS.SHOW_TOKEN_COUNT] as boolean) ?? DEFAULT_SETTINGS.SHOW_TOKEN_COUNT
      setShowTokenCount(showTokenCountValue)
    })
  }, [])

  useTooltipPosition({
    tooltipRef: tooltipRef as React.RefObject<HTMLDivElement>,
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    showTooltip,
  })

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFixed(!isFixed)
    setShowTooltip(!isFixed)
    onClick?.(e)
  }

  const handleMouseEnter = () => {
    if (!isFixed) {
      setShowTooltip(true)
      onHover?.()
    }
  }

  const handleMouseLeave = () => {
    if (!isFixed) {
      setShowTooltip(false)
    }
  }

  return (
    <div ref={containerRef} style={containerInlineStyles}>
      <span
        style={{ ...textInlineStyles, ...(isFixed ? textFixedInlineStyles : {}) }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {translatedText}
      </span>
      {showTooltip && (
        <div ref={tooltipRef} style={tooltipInlineStyles}>
          <div
            id="brain-bridge-tooltip-content"
            style={tooltipContentInlineStyles}
            dangerouslySetInnerHTML={{ __html: applyStylesToHtml(originalHtml) }}
          />
          {tokenUsage && provider && modelValue && showTokenCount && (
            <div style={tokenInfoInlineStyles}>
              {(() => {
                const model = MODEL_OPTIONS[provider as keyof typeof MODEL_OPTIONS]?.find((m) => m.value === modelValue)
                if (model) {
                  const costs = calculateCost(tokenUsage, model)
                  return (
                    <div style={costInfoInlineStyles}>
                      Total: {tokenUsage.total.toLocaleString()}
                      <br />
                      Input: {tokenUsage.input.toLocaleString()} / Output: {tokenUsage.output.toLocaleString()}
                      <br />
                      Cost: ${costs.totalCost.toFixed(6)} (¥{costs.totalCostJPY.toFixed(2)})
                    </div>
                  )
                }
                return null
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
