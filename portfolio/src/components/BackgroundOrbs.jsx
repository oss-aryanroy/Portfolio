import { motion } from 'framer-motion'

export default function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 w-screen h-screen pointer-events-none z-0 overflow-hidden">
      {/* Wave Layer 1 */}
      <motion.div
        className="absolute w-[150%] h-[150%] -left-1/4 -top-1/4"
        style={{
          background: 'radial-gradient(ellipse at 30% 40%, rgba(180, 140, 160, 0.15) 0%, transparent 50%)',
        }}
        animate={{
          x: ['0%', '10%', '0%'],
          y: ['0%', '15%', '0%'],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Wave Layer 2 */}
      <motion.div
        className="absolute w-[150%] h-[150%] -right-1/4 -bottom-1/4"
        style={{
          background: 'radial-gradient(ellipse at 70% 60%, rgba(212, 180, 196, 0.12) 0%, transparent 50%)',
        }}
        animate={{
          x: ['0%', '-10%', '0%'],
          y: ['0%', '-12%', '0%'],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Wave Layer 3 */}
      <motion.div
        className="absolute w-[150%] h-[150%] left-1/4 top-1/4"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(160, 124, 144, 0.08) 0%, transparent 50%)',
        }}
        animate={{
          x: ['0%', '-8%', '0%'],
          y: ['0%', '10%', '0%'],
          rotate: [0, 3, 0],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Flowing gradient streaks */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(120deg, rgba(180, 140, 160, 0.05) 0%, transparent 30%, rgba(212, 180, 196, 0.05) 70%, transparent 100%)',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  )
}