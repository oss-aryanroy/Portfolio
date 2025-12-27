import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import { API_URL } from '../config/api'

const MusicContext = createContext(null)

const TRACKS_PER_PAGE = 10

export function MusicProvider({ children }) {
    const audioRef = useRef(null)
    const [trackList, setTrackList] = useState([])
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [volume, setVolume] = useState(0.7)
    const [isShuffle, setIsShuffle] = useState(false)
    const [repeatMode, setRepeatMode] = useState('none') // none, one, all
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [audioQuality, setAudioQuality] = useState(() => {
        return localStorage.getItem('musicQuality') || 'flac'
    })

    const currentTrack = trackList[currentTrackIndex] || null

    // Fetch tracks from backend with pagination
    const fetchTracks = useCallback(async (page = 1, append = false) => {
        if (page > 1) setIsLoadingMore(true)
        else setIsLoading(true)

        try {
            const res = await fetch(`${API_URL}/api/music/tracks?page=${page}&limit=${TRACKS_PER_PAGE}`)
            if (res.ok) {
                const data = await res.json()

                // Handle both old (array) and new (paginated) formats
                const tracksData = data.tracks || data
                const hasMoreData = data.pagination?.hasMore ?? false

                // Prepend API_URL to relative paths
                const fullTracks = tracksData.map(track => ({
                    ...track,
                    cover: `${API_URL}${track.cover}`,
                    src: `${API_URL}${track.src}` // Base URL, quality added when playing
                }))

                if (append) {
                    setTrackList(prev => [...prev, ...fullTracks])
                } else {
                    setTrackList(fullTracks)
                }
                setHasMore(hasMoreData)
                setCurrentPage(page)
            }
        } catch (error) {
            console.error('Failed to fetch music tracks:', error)
        } finally {
            setIsLoading(false)
            setIsLoadingMore(false)
        }
    }, [])

    // Load more tracks (for infinite scroll)
    const loadMoreTracks = useCallback(() => {
        if (!isLoadingMore && hasMore) {
            fetchTracks(currentPage + 1, true)
        }
    }, [fetchTracks, currentPage, isLoadingMore, hasMore])

    // Initial load
    useEffect(() => {
        fetchTracks(1, false)
    }, [fetchTracks])

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio()
        audioRef.current.volume = volume
        audioRef.current.preload = 'auto' // Preload audio for faster playback

        const audio = audioRef.current

        const handleLoadedMetadata = () => setDuration(audio.duration)
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
        const handleEnded = () => handleTrackEnd()
        const handleError = (e) => console.error('Audio error:', e)

        audio.addEventListener('loadedmetadata', handleLoadedMetadata)
        audio.addEventListener('timeupdate', handleTimeUpdate)
        audio.addEventListener('ended', handleEnded)
        audio.addEventListener('error', handleError)

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
            audio.removeEventListener('timeupdate', handleTimeUpdate)
            audio.removeEventListener('ended', handleEnded)
            audio.removeEventListener('error', handleError)
            audio.pause()
        }
    }, [])

    // Load track when currentTrackIndex or quality changes
    useEffect(() => {
        if (audioRef.current && currentTrack) {
            // Add quality parameter to stream URL
            const streamUrl = `${currentTrack.src}?quality=${audioQuality}`

            // Only reload if source actually changed
            if (audioRef.current.src !== streamUrl) {
                // Save current position before switching (for quality change)
                const savedTime = audioRef.current.currentTime
                const wasPlaying = isPlaying
                const isSameTrack = audioRef.current.src.includes(`/stream/${currentTrack.id}?`)

                audioRef.current.src = streamUrl
                audioRef.current.load()

                // Restore position after metadata loads (only for quality switch, not track change)
                const handleLoaded = () => {
                    if (isSameTrack && savedTime > 0) {
                        audioRef.current.currentTime = savedTime
                    } else {
                        audioRef.current.currentTime = 0
                        setCurrentTime(0)
                    }
                    if (wasPlaying) {
                        audioRef.current.play().catch(console.error)
                    }
                    audioRef.current.removeEventListener('loadedmetadata', handleLoaded)
                }
                audioRef.current.addEventListener('loadedmetadata', handleLoaded)
            }
        }
    }, [currentTrackIndex, currentTrack, audioQuality])

    // Update volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
        }
    }, [volume])

    const handleTrackEnd = useCallback(() => {
        if (repeatMode === 'one') {
            audioRef.current.currentTime = 0
            audioRef.current.play().catch(console.error)
        } else if (repeatMode === 'all' || currentTrackIndex < trackList.length - 1) {
            playNext()
        } else {
            setIsPlaying(false)
        }
    }, [repeatMode, currentTrackIndex, trackList.length])

    const play = useCallback(() => {
        if (audioRef.current && currentTrack) {
            audioRef.current.play().catch(console.error)
            setIsPlaying(true)
        }
    }, [currentTrack])

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause()
            setIsPlaying(false)
        }
    }, [])

    const togglePlay = useCallback(() => {
        if (isPlaying) {
            pause()
        } else {
            play()
        }
    }, [isPlaying, play, pause])

    const playNext = useCallback(() => {
        let nextIndex
        if (isShuffle) {
            nextIndex = Math.floor(Math.random() * trackList.length)
        } else {
            nextIndex = (currentTrackIndex + 1) % trackList.length
        }
        setCurrentTrackIndex(nextIndex)
    }, [isShuffle, currentTrackIndex, trackList.length])

    const playPrevious = useCallback(() => {
        // If more than 3 seconds in, restart current track
        if (currentTime > 3) {
            audioRef.current.currentTime = 0
            return
        }
        let prevIndex
        if (isShuffle) {
            prevIndex = Math.floor(Math.random() * trackList.length)
        } else {
            prevIndex = currentTrackIndex === 0 ? trackList.length - 1 : currentTrackIndex - 1
        }
        setCurrentTrackIndex(prevIndex)
    }, [isShuffle, currentTrackIndex, trackList.length, currentTime])

    const seekTo = useCallback((time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time
            setCurrentTime(time)
        }
    }, [])

    const toggleShuffle = useCallback(() => {
        setIsShuffle(prev => !prev)
    }, [])

    const toggleRepeat = useCallback(() => {
        setRepeatMode(prev => {
            if (prev === 'none') return 'all'
            if (prev === 'all') return 'one'
            return 'none'
        })
    }, [])

    const playTrack = useCallback((index) => {
        setCurrentTrackIndex(index)
        setIsPlaying(true)
        setTimeout(() => {
            audioRef.current?.play().catch(console.error)
        }, 100)
    }, [])

    // Change audio quality and persist to localStorage
    const changeQuality = useCallback((quality) => {
        setAudioQuality(quality)
        localStorage.setItem('musicQuality', quality)
    }, [])

    const value = {
        // State
        trackList,
        currentTrack,
        currentTrackIndex,
        isPlaying,
        duration,
        currentTime,
        volume,
        isShuffle,
        repeatMode,
        isPopupOpen,
        hasMore,
        isLoadingMore,
        audioQuality,
        // Actions
        play,
        pause,
        togglePlay,
        playNext,
        playPrevious,
        seekTo,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        playTrack,
        setIsPopupOpen,
        setTrackList,
        loadMoreTracks,
        changeQuality
    }

    return (
        <MusicContext.Provider value={value}>
            {children}
        </MusicContext.Provider>
    )
}

export function useMusic() {
    const context = useContext(MusicContext)
    if (!context) {
        throw new Error('useMusic must be used within a MusicProvider')
    }
    return context
}

export default MusicContext
