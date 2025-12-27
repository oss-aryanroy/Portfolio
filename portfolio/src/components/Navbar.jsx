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
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 sm:top-6 left-4 sm:left-6 z-50"
      >
        <Link to="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-[#b48ca0]/30 group-hover:border-[#b48ca0]/50 transition-all group-hover:shadow-lg group-hover:shadow-[#b48ca0]/20 flex items-center justify-center bg-[#1a1a1a]/60 backdrop-blur-sm">
              <img src="/vite.svg" alt="AR Logo" className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 sm:top-6 right-4 sm:right-6 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#b48ca0]/10 to-[#d4b4c4]/10 border border-[#b48ca0]/30 flex items-center justify-center backdrop-blur-sm hover:border-[#b48ca0]/50 transition-all hover:shadow-lg hover:shadow-[#b48ca0]/20"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun size={18} className="text-[#d4b4c4] sm:w-5 sm:h-5" />
          ) : (
            <Moon size={18} className="text-[#d4b4c4] sm:w-5 sm:h-5" />
          )}
        </motion.button>
      </motion.div>

      {/* Navigation Pill */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="fixed top-4 sm:top-6 inset-x-0 z-50 flex justify-center pointer-events-none"
      >
        <div className="flex items-center bg-[#1a1a1a]/60 backdrop-blur-md rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border border-[#b48ca0]/20 pointer-events-auto">
          <NavLink to="/" active={isActive('/')}>
            Home
          </NavLink>

          {/* Divider */}
          <div className="h-4 sm:h-5 w-px bg-[#b48ca0]/30 mx-2 sm:mx-3"></div>

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
        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${active
          ? 'text-white'
          : 'text-gray-400 hover:text-[#d4b4c4]'
          }`}
      >
        {children}
      </motion.span>
    </Link>
  )
}