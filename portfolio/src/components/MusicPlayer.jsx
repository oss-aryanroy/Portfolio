import { motion, AnimatePresence } from 'framer-motion'
import { Music } from 'lucide-react'
import { useMusic } from '../context/MusicContext'
import MusicPopup from './MusicPopup'

export default function MusicPlayer() {
    const { isPlaying, isPopupOpen, setIsPopupOpen } = useMusic()

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsPopupOpen(!isPopupOpen)}
                className={`music-player-fab ${isPlaying ? 'playing' : ''}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                aria-label="Toggle music player"
            >
                <motion.div
                    animate={isPlaying ? {
                        scale: [1, 1.15, 1],
                    } : {}}
                    transition={{
                        duration: 1,
                        repeat: isPlaying ? Infinity : 0,
                        repeatType: "loop"
                    }}
                >
                    <Music size={24} />
                </motion.div>
            </motion.button>

            {/* Popup Player */}
            <AnimatePresence>
                {isPopupOpen && <MusicPopup />}
            </AnimatePresence>
        </>
    )
}
