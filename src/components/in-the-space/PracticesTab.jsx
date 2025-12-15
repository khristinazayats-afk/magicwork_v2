import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CANVA_ASSETS } from '../../config/assets';
import { useContentSet } from '../../hooks/useContentSet';
import { usePracticeCards } from '../../hooks/usePracticeCards';
import { useUsageTracking } from '../../hooks/useUsageTracking';
import { loadFavorites, toggleFavorite } from '../../utils/practiceFavorites';
import TimerVoiceSelectionModal from '../TimerVoiceSelectionModal';
import CompletionMessageScreen from '../CompletionMessageScreen';
import { getCompletionMessageByDuration } from '../../constants/completionMessages';
import { getVoiceAudioOption } from '../../constants/voiceAudioOptions';
import { PracticeCard } from './PracticeCard';
import { FullScreenPracticeView } from './FullScreenPracticeView';
import { useAmbientSound } from '../../contexts/AmbientSoundContext';

// Development-only logging helper
const isDev = import.meta.env.DEV;
const devLog = isDev ? console.log.bind(console) : () => {};
const devWarn = isDev ? console.warn.bind(console) : () => {};
const devError = console.error.bind(console); // keep errors in prod

export default function PracticesTab({
  station,
  participantCount, // currently used by parent UI; kept for compatibility
  filter = 'All',
  onToggleFavorite,
  onComplete,
  onExpandedViewChange
}) {
  const spaceName = station?.name || '';
  const isBreatheToRelax = spaceName === 'Breathe to Relax';
  const { startAmbient, pauseAmbient, setAmbientMode } = useAmbientSound();

  // Content & per-card metadata
  const { contentSet, loading: assetsLoading } = useContentSet(spaceName || null);
  const { cards: practiceCards } = usePracticeCards(spaceName || null);
  const { startSession, completeSession, getLiveCount } = useUsageTracking(spaceName || null);

  // Refs
  const tuneAudioRef = useRef(null);
  const expandedVideoRef = useRef(null);
  const previewVideoRefs = useRef({});
  const speechEnabledRef = useRef(false);

  // UI state
  const [favorites, setFavorites] = useState(() => loadFavorites());
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [isTunePlaying, setIsTunePlaying] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);

  // Practice flow state
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [selectedCardForPractice, setSelectedCardForPractice] = useState(null);
  const [isInPracticeMode, setIsInPracticeMode] = useState(false);
  const [practiceStartTime, setPracticeStartTime] = useState(null);
  const [practiceDuration, setPracticeDuration] = useState(null); // seconds
  const [timeRemaining, setTimeRemaining] = useState(null); // seconds
  const [voiceAudioSelected, setVoiceAudioSelected] = useState(null);

  // Playback stats
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  // Completion UI
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [completionMessage, setCompletionMessage] = useState(null);

  // Keep parent in sync for layout changes (expanded/fullscreen)
  useEffect(() => {
    if (onExpandedViewChange) onExpandedViewChange(showFullScreen);
  }, [showFullScreen, onExpandedViewChange]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds) => {
    const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    const mins = Math.floor(safe / 60);
    const secs = Math.floor(safe % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Video selection: assign different relaxing videos to each card
  // Each card gets a unique video for variety
  const getVideoUrl = useCallback(
    (cardIndex = 0) => {
      if (assetsLoading) return null;

      const visuals = contentSet?.visuals || [];
      const s3BaseUrl = 'https://magicwork-canva-assets.s3.eu-north-1.amazonaws.com';
      
      // Map of relaxing video types for each card index
      const videoTypes = [
        'clouds',      // Card 0: Gentle clouds
        'rain',        // Card 1: Gentle rain
        'waves',       // Card 2: Ocean waves
        'forest'       // Card 3: Forest/nature
      ];
      
      const videoType = videoTypes[cardIndex] || 'clouds';
      
      if (visuals.length > 0) {
        // Try to find a video matching the card's theme
        const themedVideo = visuals.find(
          (v) =>
            v?.s3_key?.toLowerCase().includes(videoType) ||
            v?.cdn_url?.toLowerCase().includes(videoType) ||
            (v?.name || '').toLowerCase().includes(videoType)
        );
        if (themedVideo?.cdn_url) return themedVideo.cdn_url;
        
        // If no themed video, use card index to pick from available videos
        const idx = Math.min(Math.max(0, cardIndex), visuals.length - 1);
        const picked = visuals[idx];
        if (picked?.cdn_url) return picked.cdn_url;

        // Fallback to any available video
        const any = visuals.find((v) => v?.cdn_url);
        if (any?.cdn_url) return any.cdn_url;
      }

      // Fallback to contentSet visual
      if (contentSet?.visual?.cdn_url) return contentSet.visual.cdn_url;

      // Last resort: use S3 fallback videos based on card index
      const fallbackVideos = {
        0: `${s3BaseUrl}/videos/canva/clouds.mp4`,
        1: `${s3BaseUrl}/videos/canva/rain.mp4`,
        2: `${s3BaseUrl}/videos/canva/waves.mp4`,
        3: `${s3BaseUrl}/videos/canva/forest.mp4`
      };
      
      return fallbackVideos[cardIndex] || fallbackVideos[0];
    },
    [assetsLoading, contentSet?.visual?.cdn_url, contentSet?.visuals]
  );

  // Audio selection (current behavior): use contentSet audio if available; otherwise station.localMusic only for card 0.
  const getPracticeAudioUrl = useCallback(
    (voiceAudioId, cardIndex = 0) => {
      const option = getVoiceAudioOption(voiceAudioId);

      // These options use the bowls engine (WebAudio) instead of an <audio> file.
      if (option?.id === 'meditation-bells' || option?.id === 'ambient-only') return null;

      // Guided voices: keep a gentle ambient bed underneath the guidance (nature by default).
      if (option?.type === 'guided') {
        return station?.localMusic?.file || contentSet?.audio?.cdn_url || null;
      }

      // Ambient options
      if (option?.id === 'nature-sounds') {
        return station?.localMusic?.file || contentSet?.audio?.cdn_url || null;
      }

      // Fallback
      return contentSet?.audio?.cdn_url || station?.localMusic?.file || null;
    },
    [station?.localMusic?.file, contentSet?.audio?.cdn_url]
  );

  const stopVoiceGuidance = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      // ignore
    }
    speechEnabledRef.current = false;
  }, []);

  const startVoiceGuidance = useCallback(
    (voiceAudioId) => {
      const option = getVoiceAudioOption(voiceAudioId);
      if (option?.type !== 'guided') return;
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      const synth = window.speechSynthesis;
      try {
        synth.cancel();
      } catch (e) {
        // ignore
      }

      // Pick a deterministic voice (best effort). If voices aren't loaded yet, browser default will be used.
      const voices = synth.getVoices ? synth.getVoices() : [];
      const english = Array.isArray(voices)
        ? voices.filter((v) => (v?.lang || '').toLowerCase().startsWith('en'))
        : [];
      const pool = english.length > 0 ? english : Array.isArray(voices) ? voices : [];

      const preferredIndex =
        voiceAudioId === 'warm-male' ? 1 : voiceAudioId === 'neutral-calm' ? 2 : 0;
      const pickedVoice = pool.length > 0 ? pool[preferredIndex % pool.length] : null;

      const lines = [];
      if (station?.guidance) lines.push(station.guidance);
      const instructions = Array.isArray(station?.instructions) ? station.instructions : [];
      if (instructions[0]) lines.push(instructions[0]);
      if (instructions[1]) lines.push(instructions[1]);

      for (const text of lines) {
        const u = new SpeechSynthesisUtterance(text);
        if (pickedVoice) u.voice = pickedVoice;
        u.rate = 0.92;
        u.pitch = 1.0;
        u.volume = 0.9;
        synth.speak(u);
      }

      speechEnabledRef.current = true;
    },
    [station]
  );

  const items = useMemo(() => {
    const cards = Array.isArray(practiceCards) ? practiceCards : [];

    // Ensure we can grab by index even if API returns unsorted
    const byIndex = new Map();
    for (const c of cards) {
      const idx = Number.isFinite(c?.card_index) ? c.card_index : null;
      if (idx !== null) byIndex.set(idx, c);
    }

    return [0, 1, 2, 3].map((idx) => {
      const c = byIndex.get(idx) || cards[idx] || null;
      const id = c?.id != null ? `card-${c.id}` : `${spaceName}-card-${idx}`;
      const title = c?.title || `${spaceName} — Card ${idx + 1}`;
      const description = c?.description || '';
      const videoUrl = getVideoUrl(idx);

      return {
        cardIndex: idx,
        id,
        title,
        description,
        hasVideo: true,
        videoUrl,
        // keep these fields for usage tracking payload compatibility
        video_asset_id: c?.video_asset_id || null,
        audio_asset_id: c?.audio_asset_id || null
      };
    });
  }, [practiceCards, spaceName, getVideoUrl]);

  const refreshFavorites = useCallback(() => {
    setFavorites(loadFavorites());
  }, []);

  const handleToggleFavorite = useCallback(
    (itemId) => {
      const newFavorited = toggleFavorite(itemId);
      refreshFavorites();
      if (onToggleFavorite) onToggleFavorite(newFavorited);
    },
    [onToggleFavorite, refreshFavorites]
  );

  const stopPlayback = useCallback(() => {
    stopVoiceGuidance();
    if (tuneAudioRef.current) tuneAudioRef.current.pause();
    if (expandedVideoRef.current) expandedVideoRef.current.pause();
    setIsTunePlaying(false);
  }, [stopVoiceGuidance]);

  const handleCardClick = useCallback(
    (cardIndex) => {
      if (isInPracticeMode && selectedCardIndex === cardIndex) {
        // Toggle pause/resume if they tap the active card
        setIsTunePlaying((prev) => !prev);
        return;
      }

      setSelectedCardForPractice(cardIndex);
      setShowTimerModal(true);
    },
    [isInPracticeMode, selectedCardIndex]
  );

  const handleStartPractice = useCallback(
    async ({ durationMinutes, voiceAudioId }) => {
      const cardIndex = selectedCardForPractice;
      if (cardIndex === null) return;

      stopVoiceGuidance();

      const videoUrl = getVideoUrl(cardIndex);
      const voiceOption = getVoiceAudioOption(voiceAudioId);
      const usesBowls =
        voiceOption?.id === 'meditation-bells' || voiceOption?.id === 'ambient-only';
      const audioUrl = usesBowls ? null : getPracticeAudioUrl(voiceAudioId, cardIndex);
      const durationSeconds = durationMinutes ? durationMinutes * 60 : null;

      setShowTimerModal(false);
      setSelectedCardForPractice(null);

      setSelectedCardIndex(cardIndex);
      setVoiceAudioSelected(voiceAudioId);
      setPracticeDuration(durationSeconds);
      setTimeRemaining(durationSeconds);
      setPracticeStartTime(Date.now());
      setIsInPracticeMode(true);
      setShowFullScreen(true);

      // Track live session
      const item = items[cardIndex];
      await startSession(
        cardIndex,
        null,
        item?.video_asset_id || null,
        item?.audio_asset_id || null,
        videoUrl,
        usesBowls ? 'webaudio:bowls' : audioUrl,
        durationMinutes || null,
        voiceAudioId || null
      );

      // Start playback
      setIsTunePlaying(true);

      // Sound layer rules:
      // - Menus: bowls loop (ambient)
      // - Practice: bowls OFF unless user explicitly chooses a bowls/bells option
      if (usesBowls) {
        // Transition bowls into a slightly more present "practice" profile
        pauseAmbient();
        await startAmbient('practice');
      } else {
        // Ensure bowls are off while playing a selected practice sound
        pauseAmbient();
      }

      if (tuneAudioRef.current) {
        // If bowls are the selected "sound", we don't play an <audio> file.
        if (!usesBowls && audioUrl) {
          tuneAudioRef.current.loop = true;
          tuneAudioRef.current.volume = voiceOption?.type === 'guided' ? 0.25 : 0.75;
          tuneAudioRef.current.src = audioUrl;
          tuneAudioRef.current.load();
          tuneAudioRef.current.play().catch((err) => devError('[PracticesTab] Audio play failed:', err));
        } else {
          tuneAudioRef.current.pause();
          tuneAudioRef.current.removeAttribute('src');
          tuneAudioRef.current.load();
        }
      }

      // If they selected a guided voice, speak gentle guidance (best effort)
      if (voiceOption?.type === 'guided') {
        startVoiceGuidance(voiceAudioId);
      }
    },
    [
      selectedCardForPractice,
      getVideoUrl,
      getPracticeAudioUrl,
      items,
      startSession,
      pauseAmbient,
      startAmbient,
      stopVoiceGuidance,
      startVoiceGuidance
    ]
  );

  const handlePracticeComplete = useCallback(
    async (completed = true) => {
      const cardIndex = selectedCardIndex;
      const durationSeconds = practiceStartTime ? Math.floor((Date.now() - practiceStartTime) / 1000) : 0;

      stopPlayback();
      setIsInPracticeMode(false);
      setShowFullScreen(false);

      // Return to the calm bowls loop across menus
      setAmbientMode('menu');
      await startAmbient('menu');

      const message = getCompletionMessageByDuration(durationSeconds);
      setCompletionMessage(message);
      setShowCompletionMessage(true);

      // Track completion
      const item = items[cardIndex];
      const videoUrl = getVideoUrl(cardIndex);
      const voiceOption = getVoiceAudioOption(voiceAudioSelected);
      const usesBowls =
        voiceOption?.id === 'meditation-bells' || voiceOption?.id === 'ambient-only';
      const audioUrl = usesBowls
        ? 'webaudio:bowls'
        : getPracticeAudioUrl(voiceAudioSelected, cardIndex);

      await completeSession(
        cardIndex,
        null,
        item?.video_asset_id || null,
        item?.audio_asset_id || null,
        videoUrl,
        audioUrl,
        durationSeconds,
        practiceDuration ? Math.floor(practiceDuration / 60) : null,
        voiceAudioSelected,
        message
      );

      // Reset practice state
      setPracticeStartTime(null);
      setPracticeDuration(null);
      setTimeRemaining(null);
      setAudioProgress(0);
      setAudioDuration(0);
      setAudioCurrentTime(0);

      if (onComplete && completed) {
        onComplete({
          spaceName,
          duration: durationSeconds,
          cardIndex,
          mode: 'ambient'
        });
      }
    },
    [
      selectedCardIndex,
      practiceStartTime,
      stopPlayback,
      items,
      getVideoUrl,
      getPracticeAudioUrl,
      completeSession,
      practiceDuration,
      voiceAudioSelected,
      onComplete,
      spaceName,
      startAmbient,
      setAmbientMode
    ]
  );

  const handleTunePlayPause = useCallback(
    (cardIndex = selectedCardIndex) => {
      // If switching cards while fullscreen, allow switching video target
      setSelectedCardIndex(cardIndex);

      setIsTunePlaying((prev) => {
        const next = !prev;
        const audioEl = tuneAudioRef.current;
        const videoEl = expandedVideoRef.current;
        const isBowlsPractice =
          voiceAudioSelected === 'meditation-bells' || voiceAudioSelected === 'ambient-only';

        if (next) {
          if (isBowlsPractice) {
            startAmbient('practice');
          }
          if (audioEl && audioEl.src) {
            audioEl.play().catch((err) => devError('[PracticesTab] Audio resume failed:', err));
          }
          if (videoEl) {
            videoEl.play().catch(() => {});
          }
        } else {
          stopVoiceGuidance();
          if (isBowlsPractice) {
            pauseAmbient();
          }
          if (audioEl) audioEl.pause();
          if (videoEl) videoEl.pause();
        }

        return next;
      });
    },
    [selectedCardIndex, voiceAudioSelected, startAmbient, pauseAmbient, stopVoiceGuidance]
  );

  // Countdown timer
  useEffect(() => {
    if (!isInPracticeMode) return undefined;
    if (!isTunePlaying) return undefined;
    if (timeRemaining === null) return undefined;

    if (timeRemaining <= 0) {
      handlePracticeComplete(true);
      return undefined;
    }

    const t = setTimeout(() => {
      setTimeRemaining((prev) => (prev === null ? null : Math.max(0, prev - 1)));
    }, 1000);

    return () => clearTimeout(t);
  }, [isInPracticeMode, isTunePlaying, timeRemaining, handlePracticeComplete]);

  // Content wrapper for Breathe to Relax (background video)
  const ContentWrapper = useCallback(
    ({ children }) => {
      if (!isBreatheToRelax) return children;

      const videoUrl =
        contentSet?.visual?.cdn_url ||
        CANVA_ASSETS.BREATHE_VIDEO ||
        'https://magicwork-canva-assets.s3.eu-north-1.amazonaws.com/video/canva/breathe-to-relax-video.mp4';

      return (
        <div className="fixed inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.3 }}
            src={videoUrl}
            onError={(e) => {
              if (e?.target) e.target.style.display = 'none';
            }}
          />
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,183,77,0.15) 0%, rgba(143,181,105,0.15) 50%, rgba(169,132,229,0.15) 100%)',
              animation: 'gradient 15s ease infinite',
              backgroundSize: '200%'
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.2) 100%)'
            }}
          />
          <div className="relative z-10">{children}</div>
        </div>
      );
    },
    [isBreatheToRelax, contentSet?.visual?.cdn_url]
  );

  const videoSrc = getVideoUrl(selectedCardIndex);

  return (
    <>
      <TimerVoiceSelectionModal
        isOpen={showTimerModal}
        onClose={() => {
          setShowTimerModal(false);
          setSelectedCardForPractice(null);
        }}
        onStart={handleStartPractice}
        cardTitle={selectedCardForPractice !== null ? items[selectedCardForPractice]?.title : null}
      />

      <CompletionMessageScreen
        isOpen={showCompletionMessage}
        onClose={() => {
          setShowCompletionMessage(false);
          setCompletionMessage(null);
        }}
        durationSeconds={practiceStartTime ? Math.floor((Date.now() - practiceStartTime) / 1000) : 0}
        message={completionMessage}
      />

      {/* Audio element used for practice playback */}
      <audio
        ref={tuneAudioRef}
        preload="auto"
        onTimeUpdate={() => {
          if (!tuneAudioRef.current) return;
          const current = tuneAudioRef.current.currentTime || 0;
          const duration = tuneAudioRef.current.duration || 0;
          setAudioCurrentTime(current);
          setAudioDuration(duration);
          setAudioProgress(duration > 0 ? (current / duration) * 100 : 0);
        }}
        onError={(e) => {
          devError('[PracticesTab] Audio error:', e);
        }}
      />

      <ContentWrapper
        children={
          <div
            className="w-full px-4 md:px-5"
            style={{
              paddingTop: '16px',
              paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
              margin: 0,
              minHeight: '100%'
            }}
          >
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
              {(() => {
                const visibleItems =
                  filter === 'Favorited'
                    ? items.filter((it) => favorites.has(it.id))
                    : items;

                if (visibleItems.length === 0) {
                  return (
                    <div className="text-center py-10">
                      <div className="font-hanken text-[#1e2d2e] font-semibold text-lg">
                        No favorites yet
                      </div>
                      <div className="font-hanken text-[#1e2d2e]/70 text-sm mt-1">
                        Tap the heart on any card to save it.
                      </div>
                    </div>
                  );
                }

                return visibleItems.map((item) => {
                  const cardIndex = item.cardIndex;
                  return (
                <PracticeCard
                  key={item.id}
                  item={item}
                  index={cardIndex}
                  isSelected={selectedCardIndex === cardIndex}
                  isPlaying={isTunePlaying && selectedCardIndex === cardIndex}
                  isInPracticeMode={isInPracticeMode}
                  assetsLoading={assetsLoading}
                  contentSet={contentSet}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onCardClick={handleCardClick}
                  onPlayPause={handleTunePlayPause}
                  audioProgress={audioProgress}
                  audioCurrentTime={audioCurrentTime}
                  audioDuration={audioDuration}
                  formatTime={formatTime}
                  getLiveCount={getLiveCount}
                  previewVideoRefs={previewVideoRefs}
                />
                  );
                });
              })()}
            </div>
          </div>
        }
      />

      <FullScreenPracticeView
        isOpen={showFullScreen}
        selectedCardIndex={selectedCardIndex}
        isPlaying={isTunePlaying}
        videoSrc={videoSrc}
        timeRemaining={timeRemaining}
        audioProgress={audioProgress}
        onClose={() => handlePracticeComplete(false)}
        onPlayPause={handleTunePlayPause}
        onComplete={() => handlePracticeComplete(true)}
        expandedVideoRef={expandedVideoRef}
        formatTime={formatTime}
      />
    </>
  );
}


