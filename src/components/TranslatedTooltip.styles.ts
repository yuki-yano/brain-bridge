export const containerInlineStyles = {
  position: "relative",
  display: "inline",
} as const

export const textInlineStyles = {
  cursor: "pointer",
  padding: "0.5rem",
  borderRadius: "0.25rem",
  textDecoration: "underline",
  textDecorationStyle: "dashed",
  textDecorationThickness: "1px",
  textUnderlineOffset: "4px",
  textDecorationColor: "#9ca3af",
  textDecorationSkipInk: "none",
  transition: "all 0.15s ease-in-out",
} as const

export const textFixedInlineStyles = {
  textDecorationColor: "#4b5563",
  backgroundColor: "rgba(243, 244, 246, 0.5)",
  "@media (prefers-color-scheme: dark)": {
    backgroundColor: "rgba(31, 41, 55, 0.5)",
  },
} as const

export const tokenInfoInlineStyles = {
  marginTop: 0,
  paddingTop: 0,
  borderTop: "1px solid hsl(var(--border))",
  fontSize: "13px",
  color: "hsl(var(--muted-foreground))",
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
} as const

export const costInfoInlineStyles = {
  marginTop: "0.25rem",
  fontSize: "12px",
  color: "hsl(var(--muted-foreground))",
  display: "flex",
  flexDirection: "column",
  gap: "0.125rem",
} as const

export const tooltipInlineStyles = {
  position: "fixed",
  zIndex: 9999,
  opacity: 0,
  visibility: "visible",
  maxWidth: "min(450px, calc(100vw - 32px))",
  width: "max-content",
  height: "auto",
  margin: 0,
  padding: "0.75rem 1rem",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontSize: "14px",
  lineHeight: 1.5,
  boxSizing: "border-box",
  pointerEvents: "auto",
  textAlign: "left",
  textTransform: "none",
  whiteSpace: "normal",
  wordWrap: "break-word",
  color: "#f8fafc",
  backgroundColor: "rgba(15, 23, 42, 0.95)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "0.5rem",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
} as const

export const tooltipContentInlineStyles = {
  color: "#f8fafc",
  fontSize: "14px",
  lineHeight: 1.5,
} as const

export const tooltipContentHeadingInlineStyles = {
  color: "#f8fafc",
  fontWeight: 600,
  margin: "0.5em 0",
  fontSize: "15px",
} as const

export const tooltipContentParagraphInlineStyles = {
  margin: "0.5em 0",
  color: "#e2e8f0",
  lineHeight: 1.5,
  fontSize: "14px",
} as const

export const tooltipContentLinkInlineStyles = {
  color: "#93c5fd",
  textDecoration: "none",
  fontSize: "14px",
} as const

export const tooltipContentLinkHoverInlineStyles = {
  color: "#bfdbfe",
  textDecoration: "underline",
} as const

export const tooltipContentCodeInlineStyles = {
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  padding: "0.2em 0.4em",
  borderRadius: "0.25em",
  fontSize: "13px",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  color: "#e2e8f0",
} as const

export const tooltipContentPreInlineStyles = {
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  padding: "0.75em",
  borderRadius: "0.375em",
  overflowX: "auto",
  margin: "0.75em 0",
  fontSize: "13px",
} as const

export const tooltipContentListInlineStyles = {
  margin: "0.5em 0",
  paddingLeft: "1.5em",
  color: "#e2e8f0",
  fontSize: "14px",
} as const

export const tooltipContentListItemInlineStyles = {
  margin: "0.25em 0",
  fontSize: "14px",
} as const
