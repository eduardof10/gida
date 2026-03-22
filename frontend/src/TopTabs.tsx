import { useCallback, useLayoutEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

export default function TopTabs() {
  const location = useLocation()
  const tabListRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)

  const applyIndicator = useCallback(() => {
    const list = tabListRef.current
    const el = indicatorRef.current
    if (!list || !el) return

    const active = list.querySelector('a.tab.active') as HTMLElement | null
    if (!active) {
      el.style.opacity = '0'
      el.style.width = '0px'
      return
    }

    const listRect = list.getBoundingClientRect()
    const tabRect = active.getBoundingClientRect()
    const left = tabRect.left - listRect.left + list.scrollLeft
    const width = tabRect.width

    el.style.left = `${left}px`
    el.style.width = `${width}px`
    el.style.opacity = width > 0 ? '1' : '0'
  }, [])

  useLayoutEffect(() => {
    applyIndicator()
  }, [location.pathname, applyIndicator])

  useLayoutEffect(() => {
    const list = tabListRef.current
    if (!list) return

    const ro = new ResizeObserver(() => {
      applyIndicator()
    })
    ro.observe(list)

    window.addEventListener('resize', applyIndicator)
    list.addEventListener('scroll', applyIndicator, { passive: true })
    document.fonts?.ready?.then(() => applyIndicator())

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', applyIndicator)
      list.removeEventListener('scroll', applyIndicator)
    }
  }, [applyIndicator])

  return (
    <nav className="topTabs" aria-label="Primary">
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
        </div>
      </div>
    </nav>
  )
}
