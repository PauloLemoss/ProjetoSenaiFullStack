const PALETTE = [
  'bg-blue-100 text-blue-700',
  'bg-pink-100 text-pink-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700',
  'bg-cyan-100 text-cyan-700',
]

const SIZE_CLASSES = {
  xs: 'w-7 h-5 text-[0.6875rem]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
}

const SHAPE_CLASSES = {
  circle: 'rounded-full',
  square: 'rounded-md',
}

function initialsFrom(label) {
  const parts = label.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function paletteIndex(seed) {
  let hash = 0
  for (const char of String(seed)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash % PALETTE.length
}

/**
 * Avatar circular com as iniciais de um nome, usado nas células de
 * jogador/clube das tabelas e na lista de clubes da barra lateral
 * (frontend-design-system, "Avatar com iniciais").
 */
export function Avatar({ label, seed, size = 'md', shape = 'circle' }) {
  return (
    <span
      className={`inline-flex items-center justify-center font-semibold shrink-0 ${SIZE_CLASSES[size]} ${SHAPE_CLASSES[shape]} ${PALETTE[paletteIndex(seed ?? label)]}`}
    >
      {shape === 'square' ? label : initialsFrom(label)}
    </span>
  )
}
