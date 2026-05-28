import { motion } from 'framer-motion'

// Seeded PRNG (mulberry32)
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

interface Props { patronageStartDate?: string | null }

function Constellation({ patronageStartDate }: Props) {
  const weeks = patronageStartDate
    ? Math.floor((Date.now() - new Date(patronageStartDate).getTime()) / (7 * 24 * 60 * 60 * 1000))
    : 0
  const count = Math.min(weeks, 52)
  const rng = mulberry32(new Date(patronageStartDate || Date.now()).getTime())

  const stars = Array.from({ length: count }, (_, i) => ({
    x: 8 + rng() * 32,
    y: 8 + rng() * 32,
    delay: i * 0.15,
    r: 1 + rng() * 1.5,
  }))

  const pairs: [number, number][] = []
  for (let i = 0; i < stars.length - 1; i++) {
    if (rng() > 0.6) pairs.push([i, i + 1])
  }
  if (stars.length > 2 && rng() > 0.5) pairs.push([0, stars.length - 1])

  return (
    <svg viewBox="0 0 48 48" fill="none">
      {/* Nebula glow at 52 stars */}
      {count >= 52 && (
        <radialGradient id="nebula">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      )}
      {count >= 52 && <circle cx="24" cy="24" r="20" fill="url(#nebula)" className="text-purple-400" />}
      {/* Connection lines */}
      {pairs.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={stars[a].x} y1={stars[a].y} x2={stars[b].x} y2={stars[b].y}
          stroke="currentColor" strokeWidth="0.4" className="text-ink dark:text-bone"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: i * 0.3 }}
        />
      ))}
      {/* Stars */}
      {stars.map((s, i) => (
        <motion.circle key={i} cx={s.x} cy={s.y} r={s.r}
          className="fill-ink dark:fill-bone"
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 8, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  )
}
export default Constellation
