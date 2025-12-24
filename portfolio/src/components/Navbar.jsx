import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* AR Logo - Absolute positioned, stays at top-left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 z-[60]"
      >
        <Link to="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative group"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#b48ca0]/30 group-hover:border-[#b48ca0]/50 transition-all group-hover:shadow-lg group-hover:shadow-[#b48ca0]/20 flex items-center justify-center bg-[#1a1a1a]/60">
              <img src="/vite.svg" alt="AR Logo" className="w-8 h-8" />
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Theme Toggle - Absolute positioned, stays at top-right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 right-6 z-[60]"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#b48ca0]/10 to-[#d4b4c4]/10 border border-[#b48ca0]/30 flex items-center justify-center backdrop-blur-sm hover:border-[#b48ca0]/50 transition-all hover:shadow-lg hover:shadow-[#b48ca0]/20"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun size={20} className="text-[#d4b4c4]" />
          ) : (
            <Moon size={20} className="text-[#d4b4c4]" />
          )}
        </motion.button>
      </motion.div>

      {/* Center Navigation Pill - Fixed, follows on scroll */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="fixed top-6 left-0 right-0 z-50 flex justify-center"
      >
        <div className="flex items-center bg-[#1a1a1a]/60 backdrop-blur-md rounded-full px-4 py-2 border border-[#b48ca0]/20">
          <NavLink to="/" active={isActive('/')}>
            Home
          </NavLink>

          {/* Divider */}
          <div className="h-5 w-px bg-[#b48ca0]/30 mx-3"></div>

          <NavLink to="/blog" active={isActive('/blog')}>
            Blog
          </NavLink>
        </div>
      </motion.nav>
    </>
  )
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to}>
      <motion.span
        whileHover={{ scale: 1.05 }}
        className={`px-3 py-1 text-sm font-medium transition-all ${active
          ? 'text-white'
          : 'text-gray-400 hover:text-[#d4b4c4]'
          }`}
      >
        {children}
      </motion.span>
    </Link>
  )
}