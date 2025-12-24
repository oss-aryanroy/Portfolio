import { motion } from 'framer-motion'
import { Download } from 'lucide-react'

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pb-32">
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(180, 140, 160, 0.3) 2px, transparent 2px)',
          backgroundSize: '50px 50px',
        }}
      />
      
      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8 pt-24"
        >
          <img 
            src="src/assets/pfp.jpg" 
            alt="Profile"
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full mx-auto border-4 border-[#b48ca0]/50 shadow-2xl shadow-[#b48ca0]/30 object-cover"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-6 gradient-text leading-tight"
            animate={{ 
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Aryan Roy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 px-4"
          >
            B. Tech CSE | Data Analytics | VIT-AP (2022 - Present)
          </motion.p>
          <motion.p
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-8 px-4"
          >
            Building innovative solutions and exploring the intersection of software engineering and data science.
          </motion.p>
          
          <motion.a
            href="/resume.pdf"
            download
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 30px rgba(180, 140, 160, 0.5)'
            }}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#b48ca0]/20 to-[#d4b4c4]/20 border-2 border-[#b48ca0]/40 rounded-full text-[#d4b4c4] font-semibold hover:text-white transition-all backdrop-blur-sm text-sm sm:text-base"
          >
            <Download size={18} className="sm:w-5 sm:h-5" />
            Download Resume
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}