import { useCallback, useEffect, useRef, useState, type TransitionEvent } from 'react'
import { createPortal } from 'react-dom'
import appIconSrc from '../../assets/app_icon.svg'
import './IntroSplash.css'

const HOLD_MS = 1500
const SLIDE_MS = 2200
const SLIDE_MS_REDUCED = 380

function scheduleExit(setExiting: (v: boolean) => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setExiting(true)
    })
  })
}

export default function IntroSplash() {
  const [mounted, setMounted] = useState(true)
  const [exiting, setExiting] = useState(false)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reducedMotionRef = useRef(false)
  const exitingRef = useRef(false)

  const finish = useCallback(() => {
    setMounted(false)
  }, [])

  exitingRef.current = exiting

  const onTransitionEnd = useCallback(
    (e: TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return
      if (e.propertyName !== 'transform') return
      if (!exitingRef.current) return
      finish()
    },
    [finish],
  )

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    reducedMotionRef.current = reduced
    const hold = reduced ? 0 : HOLD_MS

    holdTimerRef.current = setTimeout(() => {
      scheduleExit(setExiting)
    }, hold)

    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mounted])

  useEffect(() => {
    if (!exiting) return
    const slideMs = reducedMotionRef.current ? SLIDE_MS_REDUCED : SLIDE_MS
    const t = window.setTimeout(finish, slideMs + 200)
    return () => window.clearTimeout(t)
  }, [exiting, finish])

  if (!mounted) return null

  return createPortal(
    <div
      className={`introSplash${exiting ? ' introSplash--exit' : ''}`}
      onTransitionEnd={onTransitionEnd}
    >
      <span className="introSplash__srOnly">Diaz Architects</span>
      <div className="introSplash__brand" aria-hidden>
        <img
          className="introSplash__logo"
          src={appIconSrc}
          alt=""
          width={95}
          height={95}
          decoding="async"
          fetchPriority="high"
        />
        <div className="introSplash__copy">
          <span className="introSplash__diaz">DIAZ</span>
          <span className="introSplash__tagline">ARCHITECTS</span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
