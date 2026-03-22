import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const DURATION_MS = 520
/** Where along the journey the line is narrowest (earlier = shrink faster, then expand toward the end) */
const NARROW_AT = 0.36
/** Narrowest width during travel (px), scales with tab size */
function minTravelWidth(a: number, b: number) {
  return Math.min(a, b) * 0.30
}

export default function TopTabs() {
  const location = useLocation()
  const tabListRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const prevCommittedRef = useRef<{ left: number; width: number } | null>(null)
  const animRef = useRef<Animation | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const measureActiveTab = useCallback((): {
    left: number
    width: number
  } | null => {
    const list = tabListRef.current
    if (!list) return null
    const active = list.querySelector('a.tab.active') as HTMLElement | null
    if (!active) return null
    const listRect = list.getBoundingClientRect()
    const tabRect = active.getBoundingClientRect()
    return {
      left: tabRect.left - listRect.left + list.scrollLeft,
      width: tabRect.width,
    }
  }, [])

  const measureIndicator = useCallback((): {
    left: number
    width: number
  } | null => {
    const list = tabListRef.current
    const el = indicatorRef.current
    if (!list || !el) return null
    const listRect = list.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    const width = r.width
    if (width < 0.5) return null
    return {
      left: r.left - listRect.left + list.scrollLeft,
      width,
    }
  }, [])

  const applyStyles = useCallback(
    (metrics: { left: number; width: number }) => {
      const el = indicatorRef.current
      if (!el) return
      el.style.left = `${metrics.left}px`
      el.style.width = `${metrics.width}px`
      el.style.opacity = metrics.width > 0 ? '1' : '0'
    },
    [],
  )

  /** Snap to measured tab — no animation (resize, scroll, fonts) */
  const syncStatic = useCallback(() => {
    const el = indicatorRef.current
    if (!el) return

    animRef.current?.cancel()
    animRef.current = null
    setIsAnimating(false)

    const next = measureActiveTab()
    if (!next) {
      el.style.opacity = '0'
      el.style.width = '0px'
      prevCommittedRef.current = null
      return
    }

    applyStyles(next)
    prevCommittedRef.current = next
  }, [applyStyles, measureActiveTab])

  /** Route change: shrink while moving, expand at destination */
  const animateToActiveTab = useCallback(() => {
    const el = indicatorRef.current
    if (!el) return

    const next = measureActiveTab()
    if (!next) {
      el.style.opacity = '0'
      prevCommittedRef.current = null
      setIsAnimating(false)
      return
    }

    animRef.current?.cancel()
    animRef.current = null
    setIsAnimating(false)

    const fromVisual = measureIndicator()

    if (!fromVisual && !prevCommittedRef.current) {
      applyStyles(next)
      prevCommittedRef.current = next
      return
    }

    const start = fromVisual ?? prevCommittedRef.current ?? next
    if (
      Math.abs(start.left - next.left) < 0.5 &&
      Math.abs(start.width - next.width) < 0.5
    ) {
      applyStyles(next)
      prevCommittedRef.current = next
      return
    }

    const minW = minTravelWidth(start.width, next.width)
    const narrowLeft = start.left + (next.left - start.left) * NARROW_AT

    setIsAnimating(true)

    const animation = el.animate(
      [
        { left: `${start.left}px`, width: `${start.width}px` },
        {
          left: `${narrowLeft}px`,
          width: `${minW}px`,
          offset: NARROW_AT,
        },
        { left: `${next.left}px`, width: `${next.width}px` },
      ],
      {
        duration: DURATION_MS,
        // Ease-in-out so the “expand” at the end feels deliberate
        easing: 'cubic-bezier(0.55, 0.05, 0.2, 1)',
        fill: 'forwards',
      },
    )

    animRef.current = animation

    animation.onfinish = () => {
      if (animRef.current !== animation) return
      animRef.current = null
      setIsAnimating(false)
      applyStyles(next)
      prevCommittedRef.current = next
    }

    animation.oncancel = () => {
      if (animRef.current !== animation) return
      animRef.current = null
      setIsAnimating(false)
    }
  }, [applyStyles, measureActiveTab, measureIndicator])

  useLayoutEffect(() => {
    // Tab lock + WAAPI run in the layout phase with the route update.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- animateToActiveTab sets isAnimating for the pointer blocker
    animateToActiveTab()
  }, [location.pathname, animateToActiveTab])

  /* After paint so ResizeObserver doesn’t cancel the route animation on the same frame */
  useEffect(() => {
    const list = tabListRef.current
    if (!list) return

    const ro = new ResizeObserver(() => {
      syncStatic()
    })
    ro.observe(list)

    window.addEventListener('resize', syncStatic)
    list.addEventListener('scroll', syncStatic, { passive: true })
    document.fonts?.ready?.then(() => syncStatic())

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', syncStatic)
      list.removeEventListener('scroll', syncStatic)
      animRef.current?.cancel()
    }
  }, [syncStatic])

  return (
    <nav className="topTabs" aria-label="Primary" aria-busy={isAnimating}>
      <div className="topTabsInner">
        <div
          ref={tabListRef}
          className="tabList"
          role="tablist"
          aria-label="Sections"
        >
          <span ref={indicatorRef} className="tabIndicator" aria-hidden />
          <NavLink
            to="/"
            end
            role="tab"
            className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
          >
            About
          </NavLink>

          <NavLink
            to="/architecture"
            role="tab"
            className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
          >
            Architecture
          </NavLink>

          <NavLink
            to="/interiors"
            role="tab"
            className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
          >
            Interiors
          </NavLink>

          <NavLink
            to="/designs"
            role="tab"
            className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
          >
            Designs
          </NavLink>

          <NavLink
            to="/contact"
            role="tab"
            className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
          >
            Contact
          </NavLink>
          {isAnimating ? (
            <div className="tabBarPointerBlocker" aria-hidden />
          ) : null}
        </div>
      </div>
    </nav>
  )
}
