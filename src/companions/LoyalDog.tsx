import { motion } from 'framer-motion'

function LoyalDog() {
  return (
    <motion.svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Body */}
      <ellipse cx="24" cy="34" rx="10" ry="8" />
      {/* Head */}
      <motion.circle cx="24" cy="20" r="9"
        animate={{ rotate: [-3, 3, -3] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '24px 26px' }}
      />
      {/* Snout */}
      <ellipse cx="24" cy="22" rx="6" ry="4" strokeWidth="0.8" />
      {/* Nose */}
      <circle cx="24" cy="21" r="1.5" fill="currentColor" />
      {/* Eyes */}
      <circle cx="20" cy="19" r="1.5" fill="currentColor" />
      <circle cx="28" cy="19" r="1.5" fill="currentColor" />
      {/* Mouth */}
      <path d="M22 24 Q24 26 26 24" strokeWidth="0.8" />
      {/* Ears - bounce with spring */}
      <motion.path d="M17 14 L14 6 L20 11"
        animate={{ rotate: [0, -8, 0] }} transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 7.6, ease: 'easeOut' }}
        style={{ transformOrigin: '17px 14px' }}
      />
      <motion.path d="M31 14 L34 6 L28 11"
        animate={{ rotate: [0, 8, 0] }} transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 7.6, ease: 'easeOut' }}
        style={{ transformOrigin: '31px 14px' }}
      />
      {/* Tail - fast wag */}
      <motion.path d="M34 32 Q42 28 40 20"
        animate={{ rotate: [-15, 15, -15] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '34px 32px' }}
      />
      {/* Legs */}
      <path d="M17 40 L17 46 M21 40 L21 46 M27 40 L27 46 M31 40 L31 46" strokeWidth="1" />
    </motion.svg>
  )
}
export default LoyalDog
