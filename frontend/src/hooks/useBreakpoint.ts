import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BREAKPOINT_NAMES,
  BREAKPOINTS,
  type BreakpointName,
  type BreakpointTier,
  tierFromWidth,
} from '../breakpoints'

function readWidth(): number {
  if (typeof window === 'undefined') return BREAKPOINTS.lg
  return window.innerWidth
}

/**
 * Current screen category (`tier`) and booleans per named breakpoint.
 * Adjust layout in React from `tier` or `matches` — thresholds live in `breakpoints.ts`.
 */
export function useBreakpoint(): {
  width: number
  tier: BreakpointTier
  /** `true` when viewport width is at least that breakpoint */
  matches: Record<BreakpointName, boolean>
} {
  const [width, setWidth] = useState(readWidth)

  const onResize = useCallback(() => setWidth(readWidth()), [])

  useEffect(() => {
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [onResize])

  const tier = useMemo(() => tierFromWidth(width), [width])

  const matches = useMemo(() => {
    const m = {} as Record<BreakpointName, boolean>
    for (const name of BREAKPOINT_NAMES) {
      m[name] = width >= BREAKPOINTS[name]
    }
    return m
  }, [width])

  return { width, tier, matches }
}
