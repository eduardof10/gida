import { useLocation } from 'react-router-dom'
import { useMediaQuery } from '../../hooks/useMediaQuery.ts'
import MenuTabs from './MenuTabs.tsx'
import TopTabs from './TopTabs.tsx'
import { COMPACT_NAV_QUERY } from './TabNavItems.ts'
import './Tabs.css'

export default function Tabs() {
  const isCompactNav = useMediaQuery(COMPACT_NAV_QUERY)
  const { pathname } = useLocation()

  return (
    <nav className="topTabs" aria-label="Primary">
      <div
        className={`topTabsInner${isCompactNav ? ' topTabsInner--compact' : ''}`}
      >
        {isCompactNav ? (
          <MenuTabs key={pathname} />
        ) : (
          <TopTabs />
        )}
      </div>
    </nav>
  )
}
