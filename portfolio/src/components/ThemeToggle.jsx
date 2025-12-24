import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun size={20} className="theme-icon" />
      ) : (
        <Moon size={20} className="theme-icon" />
      )}

      <style>{`
        .theme-toggle {
          position: fixed;
          top: 5.5rem;
          right: 2rem;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(180, 140, 160, 0.2);
          border: 1px solid rgba(180, 140, 160, 0.3);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .theme-toggle:hover {
          background: rgba(180, 140, 160, 0.3);
          border-color: rgba(180, 140, 160, 0.5);
          box-shadow: 0 0 20px rgba(180, 140, 160, 0.4);
        }

        .theme-icon {
          color: #d4b4c4;
          transition: transform 0.3s ease;
        }

        .theme-toggle:hover .theme-icon {
          transform: rotate(20deg);
        }

        @media (max-width: 768px) {
          .theme-toggle {
            top: 4.5rem;
            right: 1.5rem;
            width: 44px;
            height: 44px;
          }
        }
      `}</style>
    </motion.button>
  )
}
