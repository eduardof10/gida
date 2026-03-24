export const COMPACT_NAV_QUERY = '(max-width: 1000px)'

export const TAB_ITEMS = [
  { to: '/', end: true as boolean, label: 'About' },
  { to: '/architecture', end: false, label: 'Architecture' },
  { to: '/interiors', end: false, label: 'Interiors' },
  { to: '/designs', end: false, label: 'Designs' },
  { to: '/contact', end: false, label: 'Contact' },
] as const
