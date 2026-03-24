import { useEffect, useState, type TransitionEvent } from 'react'
import { NavLink } from 'react-router-dom'
import { TAB_ITEMS } from './tabNavItems'
import './MenuTabs.css'

export default function MenuTabs() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [drawerMounted, setDrawerMounted] = useState(false)
  const [drawerEntered, setDrawerEntered] = useState(false)

  useEffect(() => {
    if (menuOpen) {
      setDrawerMounted(true)
      let cancelled = false
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) setDrawerEntered(true)
        })
      })
      return () => {
        cancelled = true
        cancelAnimationFrame(id)
      }
    }
    setDrawerEntered(false)
  }, [menuOpen])

  useEffect(() => {
    if (!drawerMounted) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [drawerMounted])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const onDrawerTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== 'transform') return
    if (!menuOpen) setDrawerMounted(false)
  }

  return (
    <div className="tabMenuCompact">
      <button
        type="button"
        className="tabMenuButton"
        onClick={() => setMenuOpen((o) => !o)}
        aria-expanded={menuOpen}
        aria-controls="tab-menu-panel"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        id="tab-menu-button"
      >
        <span className="tabMenuIcon" aria-hidden>
          <span />
          <span />
          <span />
        </span>
      </button>
      {drawerMounted ? (
        <>
          <button
            type="button"
            className={`tabMenuBackdrop${drawerEntered ? ' tabMenuBackdrop--visible' : ''}`}
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="tab-menu-panel"
            className={`tabMenuDrawer${drawerEntered ? ' tabMenuDrawer--open' : ''}`}
            role="navigation"
            aria-label="Sections"
            onTransitionEnd={onDrawerTransitionEnd}
          >
            <div className="tabMenuDrawerInner">
              {TAB_ITEMS.map(({ to, end, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    isActive ? 'tabMenuLink tabMenuLink--active' : 'tabMenuLink'
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
