/**
 * Viewport width thresholds (px). Use with `useBreakpoint()` or `tierFromWidth()`
 * to pick layout in components — no automatic CSS changes from this file.
 *
 * Tiers:
 * - **xs** — below `sm`
 * - **sm** — ≥ sm, below md
 * - **md** — ≥ md, below lg
 * - **lg** — ≥ lg, below xl
 * - **xl** — ≥ xl
 */
export const BREAKPOINTS = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const

export type BreakpointName = keyof typeof BREAKPOINTS

/** Smallest → largest */
export const BREAKPOINT_NAMES: BreakpointName[] = ['sm', 'md', 'lg', 'xl']

export type BreakpointTier = 'xs' | BreakpointName

/** `min-width` query for `matchMedia` */
export function minWidthQuery(px: number): string {
  return `(min-width: ${px}px)`
}

export function tierFromWidth(width: number): BreakpointTier {
  if (width >= BREAKPOINTS.xl) return 'xl'
  if (width >= BREAKPOINTS.lg) return 'lg'
  if (width >= BREAKPOINTS.md) return 'md'
  if (width >= BREAKPOINTS.sm) return 'sm'
  return 'xs'
}
