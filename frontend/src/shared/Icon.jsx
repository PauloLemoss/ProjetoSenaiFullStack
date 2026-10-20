/**
 * Ícones de linha simples (SVG inline), sem biblioteca externa
 * (frontend-design-system, design.md "Sem biblioteca de ícones").
 */
const BASE_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconUsers({ className = 'w-5 h-5' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.5 14.2c2.4.4 4.5 2.4 4.5 5.8" />
    </svg>
  )
}

export function IconShield({ className = 'w-5 h-5' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
    </svg>
  )
}

export function IconCalendar({ className = 'w-5 h-5' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  )
}

export function IconTrophy({ className = 'w-5 h-5' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <path d="M7 4h10v4a5 5 0 01-10 0V4z" />
      <path d="M7 5H4a3 3 0 003 4M17 5h3a3 3 0 01-3 4" />
      <path d="M12 13v3M9 20h6M9.5 20c0-2 .8-2.6 2.5-3.5 1.7.9 2.5 1.5 2.5 3.5" />
    </svg>
  )
}

export function IconHome({ className = 'w-5 h-5' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <path d="M4 11l8-7 8 7" />
      <path d="M6 10v9a1 1 0 001 1h3v-6h4v6h3a1 1 0 001-1v-9" />
    </svg>
  )
}

export function IconSearch({ className = 'w-5 h-5' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M19.5 19.5L15 15" />
    </svg>
  )
}

export function IconChevronDown({ className = 'w-4 h-4' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function IconChevronLeft({ className = 'w-4 h-4' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  )
}

export function IconChevronRight({ className = 'w-4 h-4' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

export function IconPlus({ className = 'w-4 h-4' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconDotsHorizontal({ className = 'w-5 h-5' }) {
  return (
    <svg
      {...BASE_PROPS}
      fill="currentColor"
      stroke="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  )
}

export function IconUser({ className = 'w-4 h-4' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" />
    </svg>
  )
}

export function IconCoin({ className = 'w-4 h-4' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v9M9.5 9.8c0-1.3 1.1-2.1 2.5-2.1s2.5.7 2.5 1.8c0 2.5-5 1.3-5 3.8 0 1.1 1.1 1.8 2.5 1.8s2.5-.8 2.5-2.1" />
    </svg>
  )
}

export function IconSort({ className = 'w-4 h-4' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <path d="M7 4v16M4 7l3-3 3 3M17 20V4M14 17l3 3 3-3" />
    </svg>
  )
}

export function IconFilter({ className = 'w-4 h-4' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <path d="M4 5h16l-6 7v6l-4 2v-8z" />
    </svg>
  )
}

export function IconPencil({ className = 'w-4 h-4' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
    </svg>
  )
}

export function IconTrash({ className = 'w-4 h-4' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  )
}

export function IconActivity({ className = 'w-4 h-4' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <path d="M22 12l-4 4-4-4-4 4-4-4" />
    </svg>
  )
}

export function IconAlertCircle({ className = 'w-4 h-4' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  )
}

export function IconLock({ className = 'w-4 h-4' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </svg>
  )
}

export function IconHeart({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg
      {...BASE_PROPS}
      fill="currentColor"
      stroke="none"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 20.5s-7.5-4.6-9.8-9.1C.7 8.1 2 4.8 5.2 4.1c2-.4 3.9.5 5 2.1a.9.9 0 001.6 0c1.1-1.6 3-2.5 5-2.1 3.2.7 4.5 4 3 7.3-2.3 4.5-9.8 9.1-9.8 9.1z" />
    </svg>
  )
}

export function IconAlertTriangle({ className = 'w-4 h-4' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <path d="M12 3.5l10 17.3H2L12 3.5z" />
      <path d="M12 10v4.5M12 17.5h.01" />
    </svg>
  )
}

export function IconInbox({ className = 'w-5 h-5' }) {
  return (
    <svg {...BASE_PROPS} className={className} aria-hidden="true">
      <path d="M4 13l2.5-7h11L20 13" />
      <path d="M4 13v6a1 1 0 001 1h14a1 1 0 001-1v-6" />
      <path d="M4 13h5l1.2 2h3.6l1.2-2h5" />
    </svg>
  )
}
