import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isTrackFavorited, toggleTrackFavorite } from '../utils/favorites';
import { useContentSet } from '../hooks/useContentSet';

export default function TunesFeed({
  isPlaying,
  currentTrackInfo,
  onPlayPause,
  audioRef,
  onTrackSelect,
  onToggleFavorite,
  participantCount = 0,
  topContent = null,
  tuneOfTheDay = null,
  presenceSeconds = 0,
  station = null // Optional station prop for video content
}) {
  const [availableTracks, setAvailableTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [favoritedTracks, setFavoritedTracks] = useState(new Set());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading] = useState(false);
  const [practiceDuration, setPracticeDuration] = useState(null); // Timer duration in seconds
  const [timeRemaining, setTimeRemaining] = useState(null); // Countdown timer
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [practiceStartTime, setPracticeStartTime] = useState(null);
  const progressContainerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const videoRef = useRef(null); // Video background ref
  const countdownIntervalRef = useRef(null);
  
  // Fetch video content if station is provided
  const { contentSet, loading: assetsLoading } = useContentSet(station?.name || null);
  const videoUrl = contentSet?.visual?.cdn_url || null;

  // Tracks are now managed externally - no fetching needed

  // Format time helper
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update currentTrackIndex when currentTrackInfo changes
  useEffect(() => {
    if (currentTrackInfo && availableTracks.length > 0) {
      const foundIndex = availableTracks.findIndex(t => 
        t.title === currentTrackInfo.title || 
        (currentTrackInfo.isLocal && t.file === currentTrackInfo.file)
      );
      if (foundIndex !== -1 && foundIndex !== currentTrackIndex) {
        setCurrentTrackIndex(foundIndex);
        // Reset progress when track changes
        setCurrentTime(0);
        setDuration(0);
        if (audioRef?.current) {
          audioRef.current.currentTime = 0;
        }
      }
    }
  }, [currentTrackInfo, availableTracks, currentTrackIndex]);

  // Track audio progress and store duration for active track
  useEffect(() => {
    if (!audioRef?.current || availableTracks.length === 0) return;

    const audio = audioRef.current;
    const currentTrack = availableTracks[currentTrackIndex] || availableTracks[0];

    const updateProgress = () => {
      if (audio && !isNaN(audio.currentTime) && isFinite(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
      }
      if (audio && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        const newDuration = audio.duration;
        setDuration(newDuration);
        
        // Store duration in track data when available
        if (newDuration > 0 && currentTrack) {
          setAvailableTracks(prev => prev.map(t => 
            t.id === currentTrack.id ? { ...t, duration: formatTime(newDuration) } : t
          ));
        }
      }
    };

    const handleTimeUpdate = () => {
      if (audio && !isNaN(audio.currentTime) && isFinite(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
      }
    };
    
    const handleLoadedMetadata = () => {
      updateProgress();
    };
    
    const handleDurationChange = () => {
      updateProgress();
    };

    const handleLoadedData = () => {
      updateProgress();
    };

    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadeddata', handleLoadedData);

    // Fallback: Update progress every 100ms if playing (in case timeupdate doesn't fire)
    const progressInterval = setInterval(() => {
      if (isPlaying && audio && !audio.paused) {
        updateProgress();
      }
    }, 100);

    // Initial update
    updateProgress();
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadeddata', handleLoadedData);
      clearInterval(progressInterval);
    };
  }, [audioRef, isPlaying, currentTrackIndex, availableTracks]);

  // Handle progress bar seek/rewind (click)
  const handleProgressClick = (e) => {
    if (!audioRef?.current || !duration) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle progress bar drag/scrub
  const handleProgressMouseDown = (e, trackIndex) => {
    if (!audioRef?.current || !duration) return;
    // Allow tune of the day (index -1) or if trackIndex matches currentTrackIndex
    const isTuneOfTheDay = trackIndex === -1;
    if (!isTuneOfTheDay) {
      if (availableTracks.length === 0) return;
      const activeTrack = availableTracks[currentTrackIndex];
      if (!activeTrack || trackIndex !== currentTrackIndex) return;
    }
    
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    
    // Calculate initial position
    const progressBar = e.currentTarget.closest('.progress-container');
    if (progressBar) {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Global mouse move handler for dragging
  useEffect(() => {
    if (!isDragging || !audioRef?.current || !duration) return;

    const handleMouseMove = (e) => {
      if (!progressContainerRef.current) return;
      
      const rect = progressContainerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * duration;
      
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, audioRef, duration]);

  // Handle repeat toggle
  const handleRepeatToggle = (e) => {
    e.stopPropagation();
    setIsRepeating(!isRepeating);
  };

  // Scroll to top when tune of the day is available to ensure it's visible
  useEffect(() => {
    if (tuneOfTheDay && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [tuneOfTheDay]);

  // Handle timer countdown
  useEffect(() => {
    if (practiceDuration !== null && timeRemaining !== null && isPlaying) {
      countdownIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Timer finished - pause audio
            if (audioRef?.current) {
              audioRef.current.pause();
              if (onPlayPause) {
                onPlayPause();
              }
            }
            setPracticeDuration(null);
            setTimeRemaining(null);
            setPracticeStartTime(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      };
    }
  }, [practiceDuration, timeRemaining, isPlaying, audioRef, onPlayPause]);
  
  // Initialize timer when practice starts
  useEffect(() => {
    if (isPlaying && practiceDuration !== null && timeRemaining === null && !practiceStartTime) {
      setTimeRemaining(practiceDuration);
      setPracticeStartTime(Date.now());
    }
  }, [isPlaying, practiceDuration, timeRemaining, practiceStartTime]);
  
  // Handle setting timer duration
  const handleSetDuration = (minutes) => {
    const seconds = minutes * 60;
    setPracticeDuration(seconds);
    setTimeRemaining(seconds);
    setShowTimePicker(false);
    setPracticeStartTime(Date.now());
  };

  // Handle track end - repeat if enabled
  useEffect(() => {
    if (!audioRef?.current || availableTracks.length === 0) return;

    const audio = audioRef.current;
    const handleEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0;
        setCurrentTime(0);
        audio.play().catch(err => console.error('Error replaying track:', err));
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [audioRef, isRepeating, availableTracks.length]);

  // Handle rewind (15 seconds back)
  const handleRewind = (e) => {
    if (e) e.stopPropagation();
    if (!audioRef?.current) return;
    const newTime = Math.max(0, (audioRef.current.currentTime || 0) - 15);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle forward (15 seconds ahead)
  const handleForward = (e) => {
    if (e) e.stopPropagation();
    if (!audioRef?.current || !duration) return;
    const newTime = Math.min(duration, (audioRef.current.currentTime || 0) + 15);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle track favorite toggle
  const handleToggleTrackFavorite = (trackId) => {
    const newStatus = toggleTrackFavorite(trackId);
    setFavoritedTracks(prev => {
      const next = new Set(prev);
      if (newStatus) {
        next.add(trackId);
      } else {
        next.delete(trackId);
      }
      return next;
    });
    
    setAvailableTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, isFavorited: newStatus } : track
    ));
    
    if (onToggleFavorite) {
      onToggleFavorite(newStatus);
    }
  };

  const currentTrack = availableTracks.length > 0 
    ? (availableTracks[currentTrackIndex] || availableTracks[0])
    : null;
  
  const isTrackActive = (track) => {
    if (!currentTrackInfo || !track) return false;
    // Check by file (for local tracks)
    if (currentTrackInfo.isLocal && track.file && track.file === currentTrackInfo.file) {
      return true;
    }
    // Check by title and artist
    if (track.title === currentTrackInfo.title && track.artist === currentTrackInfo.artist) {
      return true;
    }
    // Check by ID if currentTrack exists
    if (currentTrack && track.id === currentTrack.id) {
      return true;
    }
    return false;
  };

  const handleTrackClick = (track, index, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const isActive = isTrackActive(track);
    
    // If track is already active, toggle play/pause
    if (isActive) {
      if (onPlayPause) {
        try {
          onPlayPause();
        } catch (error) {
          console.error('[TunesFeed] Error toggling play/pause:', error);
        }
      }
    } else {
      // Otherwise, select this track and reset to 0:00
      setCurrentTrackIndex(index);
      setCurrentTime(0);
      setDuration(0);
      if (audioRef?.current) {
        audioRef.current.currentTime = 0;
      }
      if (onTrackSelect) {
        try {
          onTrackSelect(track, index);
        } catch (error) {
          console.error('[TunesFeed] Error selecting track:', error);
        }
      }
    }
  };

  // Separate tracks into favorites and others
  const favoriteTrackList = availableTracks.filter((track) => favoritedTracks.has(track.id));
  const otherTrackList = availableTracks.filter((track) => !favoritedTracks.has(track.id));

  // Reusable track card renderer
  const renderTrackCard = (track, index, isTuneOfTheDay = false) => {
    if (!track) return null;
    // Tune of the day is always considered active since it represents the current track
    const isActive = isTuneOfTheDay ? true : isTrackActive(track);
    const isCurrentlyPlaying = isActive && isPlaying;
    // Show presence time for active tracks (tune of the day or currently playing track)
    const presenceTime = isActive && presenceSeconds ? formatTime(presenceSeconds) : null;
    
    return (
      <motion.div
        key={track.id || `tune-of-day-${index}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="relative flex-1 flex flex-col"
      >
        <div
          className={`bg-white/70 backdrop-blur-lg w-full relative overflow-visible flex flex-col rounded-2xl transition-all p-6 md:p-8 ${
            isActive ? 'ring-2 ring-[#1e2d2e]/30' : 'hover:bg-white/80 cursor-pointer'
          }`}
          style={{ 
            boxShadow: '0 4px 16px rgba(30, 45, 46, 0.1)',
            minHeight: '100%'
          }}
          onClick={(e) => {
            // Only handle click if not clicking on interactive elements
            if (e.target.closest('button') || e.target.closest('.progress-container')) {
              return;
            }
            if (isTuneOfTheDay) {
              // Tune of the day is always active - just toggle play/pause
              if (onPlayPause) {
                try {
                  onPlayPause();
                } catch (error) {
                  console.error('[TunesFeed] Error toggling play/pause for tune of the day:', error);
                }
              }
            } else if (!isActive) {
              handleTrackClick(track, index, e);
            }
          }}
          role={!isActive ? "button" : undefined}
          tabIndex={!isActive ? 0 : undefined}
          aria-label={!isActive ? `Select track: ${track.title}` : undefined}
        >
          {/* Header: Badge and Favorite button */}
          <div className="flex items-start justify-between mb-6">
          {/* Tune of the day badge */}
          {isTuneOfTheDay && (
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#1e2d2e]/10 border border-[#1e2d2e]/20">
                <span className="font-hanken text-[10px] uppercase tracking-[0.2em] text-[#1e2d2e]/70">Tune of the day</span>
              </span>
            </div>
          )}
            {!isTuneOfTheDay && <div></div>}

          {/* Favorite button */}
          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleTrackFavorite(track.id);
            }}
              className="p-2.5 rounded-full bg-white/30 backdrop-blur-md hover:bg-white/50 transition-colors touch-target"
            aria-label={favoritedTracks.has(track.id) ? 'Unfavorite track' : 'Favorite track'}
            whileTap={{ scale: 0.9 }}
            style={{ 
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill={favoritedTracks.has(track.id) ? '#E52431' : 'none'}
              stroke={favoritedTracks.has(track.id) ? '#E52431' : '#1e2d2e'}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </motion.button>
            </div>

          {/* Tags */}
          {track.tags && track.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-6">
                {track.tags.slice(0, 3).map((tag, tagIndex) => (
                  <span 
                    key={tagIndex}
                    className="text-[#1e2d2e]/50 font-hanken text-xs px-2 py-0.5 rounded-full bg-[#1e2d2e]/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

          {/* Presence info - centered */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {/* Presence count with pulsing dot */}
            <div className="flex items-center gap-2">
              <div className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E52431]/40" style={{ animationDuration: '2.5s' }}></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-[#E52431]/80"></span>
              </div>
              <span className="font-hanken text-[#1e2d2e]/60 text-xs md:text-sm">
                {isActive ? participantCount || track.listeners : track.listeners} present here
              </span>
            </div>
            {/* Timer or Presence time for active tracks */}
            {isActive && (
              <>
                <span className="text-[#1e2d2e]/30">·</span>
                {practiceDuration !== null && timeRemaining !== null ? (
                  <div className="font-hanken font-mono text-base font-semibold text-[#1e2d2e] tabular-nums">
                    {formatTime(Math.max(0, Math.floor(timeRemaining)))}
                  </div>
                ) : presenceTime ? (
                  <div className="font-hanken font-mono text-base font-semibold text-[#1e2d2e] tabular-nums">
                    {presenceTime}
                  </div>
                ) : null}
              </>
            )}
          </div>

          {/* Play/Pause button - centered */}
          {isActive ? (
            <div className="flex flex-col items-center justify-center mb-6 gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPlayPause) {
                    onPlayPause();
                  }
                }}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center bg-[#1e2d2e] text-white hover:bg-[#1e2d2e]/90 active:scale-95 transition-all shadow-lg touch-target"
                aria-label={isCurrentlyPlaying ? 'Pause' : 'Play'}
                title={isCurrentlyPlaying ? 'Pause' : 'Play'}
                style={{ 
                  boxShadow: '0 4px 16px rgba(30, 45, 46, 0.3)',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                {isCurrentlyPlaying ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '3px' }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              
              {/* Timer Picker Button - only show when no timer is set */}
              {practiceDuration === null && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTimePicker(true);
                  }}
                  className="px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm text-[#1e2d2e] font-hanken font-semibold text-sm border border-[#1e2d2e]/20 touch-target"
                  style={{ 
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  Set Timer
                </button>
              )}
            </div>
          ) : (
            /* Play button when not active */
            <div className="flex items-center justify-center mb-6">
              <div
                className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all pointer-events-none bg-[#1e2d2e]/60"
                style={{ 
                  boxShadow: '0 4px 16px rgba(30, 45, 46, 0.3)'
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '3px' }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}

          {/* Progress bar with track info */}
          <div className="mb-4">
            {/* Track info: title · artist · source */}
            <div className="flex items-center gap-1.5 mb-2 text-[#1e2d2e]/70 font-hanken text-sm md:text-base leading-tight">
                {track.title && <span className="font-semibold">{track.title}</span>}
              {track.title && track.artist && <span className="text-[#1e2d2e]/50">·</span>}
                {track.artist && <span>{track.artist}</span>}
              {track.source && (
                <>
                  <span className="text-[#1e2d2e]/50">·</span>
                  <span className="opacity-60">{track.source}</span>
                </>
              )}
            </div>

            {/* Progress bar - draggable */}
            <div 
              className="progress-container"
              ref={isActive ? progressContainerRef : null}
              onClick={isActive ? handleProgressClick : undefined}
              onMouseDown={isActive ? (e) => handleProgressMouseDown(e, index) : undefined}
              onTouchStart={isActive ? (e) => handleProgressMouseDown(e, index) : undefined}
              style={{ 
                cursor: isActive ? 'pointer' : 'default',
                touchAction: isActive ? 'pan-y' : 'auto'
              }}
            >
              <div className="w-full h-2 bg-[#1e2d2e]/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#1e2d2e] rounded-full transition-all duration-100"
                  style={{ 
                    width: isActive && duration > 0 
                      ? `${(currentTime / duration) * 100}%` 
                      : track.mockProgress ? `${track.mockProgress * 100}%` : '0%'
                  }}
                />
              </div>
            </div>

            {/* Time display */}
            {isActive && duration > 0 && (
              <div className="flex items-center justify-between text-xs text-[#1e2d2e]/50 font-hanken mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            )}
          </div>

          {/* Light tip for active tracks */}
          {isActive && (
            <p className="font-hanken text-xs text-[#1e2d2e]/50 italic mt-4 pt-4 border-t border-[#1e2d2e]/10">
              Every full minute you stay present with this tune adds 1 Light to your streak.
            </p>
          )}
        </div>
      </motion.div>
    );
  };

  // Calculate card height to take almost all space, leaving room for partial second card
  const headerHeight = 'calc(env(safe-area-inset-top,24px) + 48px + 1.5rem)';
  const cardHeight = 'calc(100vh - env(safe-area-inset-top,24px) - 48px - 1.5rem - 1.5rem - 2rem - 40px)'; // Leave ~40px to show partial second card

  return (
    <div 
      ref={scrollContainerRef}
      className="w-full h-full overflow-y-auto px-4 md:px-5 snap-y snap-mandatory relative scroll-container"
      style={{ 
        position: 'absolute',
        top: headerHeight,
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: '1.5rem',
        paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
        scrollPaddingTop: '1.5rem',
        touchAction: 'pan-y'
      }}
    >
      {/* Video Background - if available */}
      {videoUrl && !assetsLoading && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="fixed inset-0 w-full h-full object-cover -z-10"
          style={{ 
            opacity: 0.2,
            pointerEvents: 'none',
            touchAction: 'none'
          }}
          src={videoUrl}
          onError={(e) => {
            console.error('[TunesFeed] Video failed to load:', e.target.src);
            e.target.style.display = 'none';
          }}
        />
      )}
      <div className="w-full max-w-2xl mx-auto">
        {/* Tune of the day - always render first if provided */}
        {tuneOfTheDay && (
          <div style={{ minHeight: cardHeight, marginBottom: '20px' }} className="snap-start flex flex-col">
            {renderTrackCard(tuneOfTheDay, -1, true)}
          </div>
        )}
        
        {isLoading ? (
          <div className="py-12 flex items-center justify-center" style={{ minHeight: cardHeight }}>
            <p className="font-hanken text-[#1e2d2e]/60">Loading tracks...</p>
          </div>
        ) : (
          <>
            {/* Favorites section */}
            {favoriteTrackList.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h4 className="font-hanken text-[#1e2d2e] text-sm uppercase tracking-[0.18em]">Your favorites</h4>
                  <span className="font-hanken text-xs text-[#1e2d2e]/50">{favoriteTrackList.length} saved</span>
                </div>
                <div>
                  {favoriteTrackList.map((track, index) => {
                    // Skip if it's the tune of the day
                    if (tuneOfTheDay && (track.id === tuneOfTheDay.id || (track.title === tuneOfTheDay.title && track.artist === tuneOfTheDay.artist))) {
                      return null;
                    }
                    return (
                      <div key={track.id} style={{ minHeight: cardHeight, marginBottom: '20px' }} className="snap-start flex flex-col">
                        {renderTrackCard(track, index)}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All tracks section */}
            <div>
              {favoriteTrackList.length > 0 && (
                <div className="flex items-center justify-between mb-4 px-1">
                  <h4 className="font-hanken text-[#1e2d2e] text-sm uppercase tracking-[0.18em]">All tunes</h4>
                  <span className="font-hanken text-xs text-[#1e2d2e]/50">Scroll to explore</span>
                </div>
              )}
              <div>
                {availableTracks.map((track, index) => {
                  // Skip if it's the tune of the day or already in favorites
                  if (tuneOfTheDay && (track.id === tuneOfTheDay.id || (track.title === tuneOfTheDay.title && track.artist === tuneOfTheDay.artist))) {
                    return null;
                  }
                  if (favoritedTracks.has(track.id)) {
                    return null;
                  }
                  return (
                    <div key={track.id} style={{ minHeight: cardHeight, marginBottom: '80px' }} className="snap-start flex flex-col">
                      {renderTrackCard(track, index)}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Time Picker Modal */}
      <AnimatePresence>
        {showTimePicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowTimePicker(false)}
              style={{ touchAction: 'manipulation' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-center justify-center px-6 pointer-events-none z-50"
            >
              <div 
                className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
                style={{ touchAction: 'manipulation' }}
              >
                <h3 className="font-hanken text-xl md:text-2xl font-semibold text-[#1e2d2e] mb-2 text-center">
                  Set Timer
                </h3>
                <p className="font-hanken text-sm text-[#1e2d2e]/70 mb-6 text-center">
                  How long would you like to listen?
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[5, 10, 15, 20, 30].map((minutes) => (
                    <button
                      key={minutes}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSetDuration(minutes);
                      }}
                      className="px-4 py-3 rounded-full bg-[#1e2d2e] text-white font-hanken font-semibold text-sm md:text-base hover:bg-[#1e2d2e]/90 transition-all touch-target"
                      style={{ 
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent'
                      }}
                    >
                      {minutes} min
                    </button>
                  ))}
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPracticeDuration(null);
                    setTimeRemaining(null);
                    setShowTimePicker(false);
                  }}
                  className="w-full px-6 py-3 rounded-full bg-white border-2 border-[#1e2d2e] text-[#1e2d2e] font-hanken font-semibold text-sm md:text-base hover:bg-[#1e2d2e]/5 transition-all touch-target"
                  style={{ 
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  No Limit
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
