import React, { useCallback, useEffect, useState } from "react"
import { tooltipInlineStyles } from "../components/TranslatedTooltip.styles"

interface UseTooltipPositionProps {
  tooltipRef: React.RefObject<HTMLDivElement>
  containerRef: React.RefObject<HTMLDivElement>
  showTooltip: boolean
}

export const useTooltipPosition = ({ tooltipRef, containerRef, showTooltip }: UseTooltipPositionProps) => {
  const [isPositioned, setIsPositioned] = useState(false)

  const calculatePosition = useCallback(() => {
    if (!tooltipRef.current || !containerRef.current) return null

    // 基本スタイルを適用
    Object.assign(tooltipRef.current.style, tooltipInlineStyles)

    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const windowWidth = window.innerWidth

    const spaceAbove = containerRect.top
    const spaceBelow = windowHeight - containerRect.bottom
    const newPosition = spaceAbove < tooltipRect.height && spaceBelow > tooltipRect.height ? "bottom" : "top"

    const tooltipWidth = tooltipRect.width
    const containerCenterX = containerRect.left + containerRect.width / 2
    const maxLeft = windowWidth - tooltipWidth - 16
    const minLeft = 16

    let leftPosition = containerCenterX - tooltipWidth / 2
    leftPosition = Math.min(maxLeft, Math.max(minLeft, leftPosition))

    // 位置のスタイルを追加
    Object.assign(tooltipRef.current.style, {
      left: `${leftPosition}px`,
      transform: "none",
      transition: "opacity 0.15s ease-out",
      ...(newPosition === "top"
        ? {
            top: "auto",
            bottom: `${windowHeight - containerRect.top + 10}px`,
          }
        : {
            top: `${containerRect.bottom + 10}px`,
            bottom: "auto",
          }),
    })

    // 表示アニメーション（少し遅延を入れて確実にトランジションを適用）
    requestAnimationFrame(() => {
      if (tooltipRef.current) {
        tooltipRef.current.style.opacity = "1"
        tooltipRef.current.style.visibility = "visible"
      }
    })

    return () => {}
  }, [tooltipRef, containerRef])

  const updateTooltipPosition = useCallback(() => {
    calculatePosition()
  }, [calculatePosition])

  useEffect(() => {
    let cleanup: (() => void) | null = null
    if (showTooltip) {
      cleanup = calculatePosition()
    } else {
      if (tooltipRef.current) {
        tooltipRef.current.style.opacity = "0"
        tooltipRef.current.style.visibility = "hidden"
      }
      setIsPositioned(false)
    }
    return () => {
      if (cleanup) cleanup()
    }
  }, [showTooltip, calculatePosition, tooltipRef])

  useEffect(() => {
    if (showTooltip) {
      const handleUpdate = () => {
        requestAnimationFrame(updateTooltipPosition)
      }
      window.addEventListener("resize", handleUpdate)
      window.addEventListener("scroll", handleUpdate, { passive: true })
      return () => {
        window.removeEventListener("resize", handleUpdate)
        window.removeEventListener("scroll", handleUpdate)
      }
    }
  }, [showTooltip, updateTooltipPosition])

  return {
    isPositioned,
  }
}
