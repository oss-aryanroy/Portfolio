import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Shuffle,
    Repeat,
    Repeat1,
    Volume2,
    VolumeX,
    Search,
    X,
    Music2
} from 'lucide-react'
import { useMusic } from '../context/MusicContext'

// Simple fuzzy search - matches if all characters appear in order
function fuzzyMatch(text, query) {
    if (!query) return true
    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()

    let queryIndex = 0
    for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
        if (lowerText[i] === lowerQuery[queryIndex]) {
            queryIndex++
        }
    }
    return queryIndex === lowerQuery.length
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function MusicPopup() {
    const {
        trackList,
        currentTrack,
        currentTrackIndex,
        isPlaying,
        duration,
        currentTime,
        volume,
        isShuffle,
        repeatMode,
        togglePlay,
        playNext,
        playPrevious,
        seekTo,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        playTrack,
        setIsPopupOpen,
        loadMoreTracks,
        hasMore,
        isLoadingMore,
        audioQuality,
        changeQuality
    } = useMusic()

    const [searchQuery, setSearchQuery] = useState('')
    const popupRef = useRef(null)
    const playlistRef = useRef(null)

    // Filter tracks based on fuzzy search
    const filteredTracks = useMemo(() => {
        return trackList.filter(track =>
            fuzzyMatch(track.title, searchQuery) ||
            fuzzyMatch(track.artist, searchQuery)
        )
    }, [trackList, searchQuery])

    // Infinite scroll handler
    const handlePlaylistScroll = useCallback(() => {
        if (!playlistRef.current || isLoadingMore || !hasMore || searchQuery) return

        const { scrollTop, scrollHeight, clientHeight } = playlistRef.current
        // Load more when scrolled to within 50px of bottom
        if (scrollHeight - scrollTop - clientHeight < 50) {
            loadMoreTracks()
        }
    }, [loadMoreTracks, isLoadingMore, hasMore, searchQuery])

    // Close popup when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                // Check if click is on the FAB button
                if (event.target.closest('.music-player-fab')) return
                setIsPopupOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [setIsPopupOpen])

    const handleProgressChange = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = x / rect.width
        seekTo(percentage * duration)
    }

    const handleVolumeChange = (e) => {
        setVolume(parseFloat(e.target.value))
    }

    return (
        <motion.div
            ref={popupRef}
            className="music-popup"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
            {/* Header */}
            <div className="music-popup-header">
                <div className="music-header-text">
                    <h3>Music Player</h3>
                    <div className="music-header-meta">
                        <span className="music-header-subtitle">✨ My favorite picks</span>
                        <div className="music-quality-pill">
                            <button
                                className={`music-quality-btn ${audioQuality === 'flac' ? 'active' : ''}`}
                                onClick={() => changeQuality('flac')}
                                data-tooltip="Lossless • ~450 MB/hr"
                            >
                                FLAC
                            </button>
                            <button
                                className={`music-quality-btn ${audioQuality === 'ogg' ? 'active' : ''}`}
                                onClick={() => changeQuality('ogg')}
                                data-tooltip="Compressed • ~144 MB/hr"
                            >
                                OGG
                            </button>
                        </div>
                    </div>
                </div>
                <button
                    className="music-popup-close"
                    onClick={() => setIsPopupOpen(false)}
                    aria-label="Close music player"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Now Playing Bar - Spotify style */}
            <div className="music-now-bar">
                <div className="music-now-bar-left">
                    <div className="music-cover-tiny">
                        {currentTrack?.cover ? (
                            <img src={currentTrack.cover} alt={currentTrack.title} />
                        ) : (
                            <Music2 size={16} />
                        )}
                    </div>
                    <div className="music-track-info-mini">
                        <span className="music-track-title-mini">{currentTrack?.title || 'No track'}</span>
                        <span className="music-track-artist-mini">{currentTrack?.artist || ''}</span>
                    </div>
                </div>
                <div className="music-now-bar-right">
                    <span className="music-time-mini">{formatTime(currentTime)}</span>
                    <span className="music-time-sep">/</span>
                    <span className="music-time-mini">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Progress Bar - Full width */}
            <div
                className="music-progress-slim"
                onClick={handleProgressChange}
            >
                <div
                    className="music-progress-fill-slim"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
            </div>

            {/* Controls with Volume inline */}
            <div className="music-controls">
                <button
                    className={`music-control-btn ${isShuffle ? 'active' : ''}`}
                    onClick={toggleShuffle}
                    aria-label="Toggle shuffle"
                >
                    <Shuffle size={16} />
                </button>

                <button
                    className="music-control-btn"
                    onClick={playPrevious}
                    aria-label="Previous track"
                >
                    <SkipBack size={20} />
                </button>

                <button
                    className="music-control-btn play-btn"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>

                <button
                    className="music-control-btn"
                    onClick={playNext}
                    aria-label="Next track"
                >
                    <SkipForward size={20} />
                </button>

                <button
                    className={`music-control-btn ${repeatMode !== 'none' ? 'active' : ''}`}
                    onClick={toggleRepeat}
                    aria-label="Toggle repeat"
                >
                    {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
                </button>

                <div className="music-volume-inline">
                    <button
                        className="music-control-btn"
                        onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                        aria-label="Toggle mute"
                    >
                        {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="music-volume-slider-inline"
                    />
                </div>
            </div>

            {/* Search */}
            <div className="music-search">
                <Search size={16} />
                <input
                    type="text"
                    placeholder="Search songs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Playlist */}
            <div
                className="music-playlist"
                ref={playlistRef}
                onScroll={handlePlaylistScroll}
            >
                {filteredTracks.length === 0 ? (
                    <p className="music-no-results">No songs found</p>
                ) : (
                    filteredTracks.map((track) => {
                        const originalIndex = trackList.findIndex(t => t.id === track.id)
                        return (
                            <div
                                key={track.id}
                                className={`music-playlist-item ${originalIndex === currentTrackIndex ? 'active' : ''}`}
                                onClick={() => playTrack(originalIndex)}
                            >
                                <div className="music-playlist-item-cover">
                                    {track.cover ? (
                                        <img src={track.cover} alt={track.title} />
                                    ) : (
                                        <Music2 size={16} />
                                    )}
                                </div>
                                <div className="music-playlist-item-info">
                                    <p className="music-playlist-item-title">{track.title}</p>
                                    <p className="music-playlist-item-artist">{track.artist}</p>
                                </div>
                                {originalIndex === currentTrackIndex && isPlaying && (
                                    <div className="music-playing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
                {isLoadingMore && (
                    <div className="music-loading-more">
                        <span>Loading more...</span>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
