import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { TAB_ITEMS } from './tabNavItems'
import './TopTabs.css'

const DURATION_MS = 520
const NARROW_AT = 0.36

function minTravelWidth(a: number, b: number) {
  return Math.min(a, b) * 0.3
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

  const placeIndicatorAtTab = useCallback(
    (el: HTMLElement, tab: { left: number; width: number }) => {
      el.style.left = `${tab.left}px`
      el.style.width = `${tab.width}px`
      el.style.opacity = tab.width > 0 ? '1' : '0'
    },
    [],
  )

  const releaseIndicatorWaapi = useCallback((el: HTMLElement) => {
    for (const animation of [...el.getAnimations()]) {
      try {
        animation.commitStyles?.()
      } catch {
        /* ignore */
      }
      try {
        animation.cancel()
      } catch {
        /* ignore */
      }
    }
  }, [])

  const syncStatic = useCallback(() => {
    const el = indicatorRef.current
    if (!el) return

    animRef.current?.cancel()
    animRef.current = null
    setIsAnimating(false)

    // Finished animations with fill:forwards sit above inline styles, so resize
    // could not update left/width until the effect is cleared.
    releaseIndicatorWaapi(el)

    const next = measureActiveTab()
    if (!next) {
      el.style.opacity = '0'
      el.style.width = '0px'
      prevCommittedRef.current = null
      return
    }

    placeIndicatorAtTab(el, next)
    prevCommittedRef.current = next
  }, [measureActiveTab, placeIndicatorAtTab, releaseIndicatorWaapi])

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
      prevCommittedRef.current = next
      placeIndicatorAtTab(el, next)
      return
    }

    const start = fromVisual ?? prevCommittedRef.current ?? next
    if (
      Math.abs(start.left - next.left) < 0.5 &&
      Math.abs(start.width - next.width) < 0.5
    ) {
      prevCommittedRef.current = next
      placeIndicatorAtTab(el, next)
      return
    }

    const minW = minTravelWidth(start.width, next.width)
    const narrowLeft = start.left + (next.left - start.left) * NARROW_AT

    setIsAnimating(true)

    const animation = el.animate(
      [
        { left: `${start.left}px`, width: `${start.width}px`, opacity: 1 },
        {
          left: `${narrowLeft}px`,
          width: `${minW}px`,
          opacity: 1,
          offset: NARROW_AT,
        },
        {
          left: `${next.left}px`,
          width: `${next.width}px`,
          opacity: 1,
        },
      ],
      {
        duration: DURATION_MS,
        easing: 'cubic-bezier(0.55, 0.05, 0.2, 1)',
        fill: 'forwards',
      },
    )

    animRef.current = animation

    animation.onfinish = () => {
      if (animRef.current !== animation) return
      animRef.current = null
      setIsAnimating(false)
      prevCommittedRef.current = next
      try {
        animation.commitStyles?.()
      } catch {
        /* ignore */
      }
      try {
        animation.cancel()
      } catch {
        /* ignore */
      }
      placeIndicatorAtTab(el, next)
    }

    animation.oncancel = () => {
      if (animRef.current !== animation) return
      animRef.current = null
      setIsAnimating(false)
      const tab = measureActiveTab()
      if (tab) {
        prevCommittedRef.current = tab
        placeIndicatorAtTab(el, tab)
      }
    }
  }, [measureActiveTab, measureIndicator, placeIndicatorAtTab])

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- animateToActiveTab sets isAnimating for the pointer blocker
    animateToActiveTab()
  }, [location.pathname, animateToActiveTab])

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
    <div
      ref={tabListRef}
      className="tabList tabList--desktop"
      role="tablist"
      aria-label="Sections"
      aria-busy={isAnimating}
    >
      <span ref={indicatorRef} className="tabIndicator" aria-hidden />
      {TAB_ITEMS.map(({ to, end, label }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          role="tab"
          className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
        >
          {label}
        </NavLink>
      ))}
      {isAnimating ? (
        <div className="tabBarPointerBlocker" aria-hidden />
      ) : null}
    </div>
  )
}
