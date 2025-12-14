import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CANVA_ASSETS } from '../../config/assets';
import { useContentSet } from '../../hooks/useContentSet';
import { usePracticeCards } from '../../hooks/usePracticeCards';
import { useUsageTracking } from '../../hooks/useUsageTracking';
import { loadFavorites, toggleFavorite } from '../../utils/practiceFavorites';
import TimerVoiceSelectionModal from '../TimerVoiceSelectionModal';
import CompletionMessageScreen from '../CompletionMessageScreen';
import { getCompletionMessageByDuration } from '../../constants/completionMessages';
import { PracticeCard } from './PracticeCard';
import { FullScreenPracticeView } from './FullScreenPracticeView';

// Development-only logging helper
const isDev = import.meta.env.DEV;
const devLog = isDev ? console.log.bind(console) : () => {};
const devWarn = isDev ? console.warn.bind(console) : () => {};
const devError = console.error.bind(console); // keep errors in prod

export default function PracticesTab({
  station,
  participantCount, // currently used by parent UI; kept for compatibility
  onToggleFavorite,
  onComplete,
  onExpandedViewChange
}) {
  const spaceName = station?.name || '';
  const isBreatheToRelax = spaceName === 'Breathe to Relax';

  // Content & per-card metadata
  const { contentSet, loading: assetsLoading } = useContentSet(spaceName || null);
  const { cards: practiceCards } = usePracticeCards(spaceName || null);
  const { startSession, completeSession, getLiveCount } = useUsageTracking(spaceName || null);

  // Refs
  const tuneAudioRef = useRef(null);
  const expandedVideoRef = useRef(null);
  const previewVideoRefs = useRef({});

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

  // Video selection (stable, simple): prefer contentSet.visuals; fallback to contentSet.visual; fallback to clouds.
  const getVideoUrl = useCallback(
    (cardIndex = 0) => {
      if (assetsLoading) return null;

      const visuals = contentSet?.visuals || [];
      if (visuals.length > 0) {
        // Card 0 prefers clouds if present
        if (cardIndex === 0) {
          const clouds = visuals.find(
            (v) =>
              v?.s3_key?.includes('clouds.mp4') ||
              v?.cdn_url?.includes('clouds.mp4') ||
              (v?.name || '').toLowerCase().includes('cloud')
          );
          if (clouds?.cdn_url) return clouds.cdn_url;
        }

        const idx = Math.min(Math.max(0, cardIndex), visuals.length - 1);
        const picked = visuals[idx];
        if (picked?.cdn_url) return picked.cdn_url;

        const any = visuals.find((v) => v?.cdn_url);
        if (any?.cdn_url) return any.cdn_url;
      }

      if (contentSet?.visual?.cdn_url) return contentSet.visual.cdn_url;

      // Last resort
      return 'https://magicwork-canva-assets.s3.eu-north-1.amazonaws.com/videos/canva/clouds.mp4';
    },
    [assetsLoading, contentSet?.visual?.cdn_url, contentSet?.visuals]
  );

  // Audio selection (current behavior): use contentSet audio if available; otherwise station.localMusic only for card 0.
  const getAudioSource = useCallback(
    (cardIndex = 0) => {
      if (contentSet?.audio?.cdn_url) return contentSet.audio.cdn_url;
      if (cardIndex === 0 && station?.localMusic?.file) return station.localMusic.file;
      if (cardIndex === 0 && isBreatheToRelax && CANVA_ASSETS?.BREATHE_AUDIO) return CANVA_ASSETS.BREATHE_AUDIO;
      return null;
    },
    [contentSet?.audio?.cdn_url, station?.localMusic?.file, isBreatheToRelax]
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
    if (tuneAudioRef.current) tuneAudioRef.current.pause();
    if (expandedVideoRef.current) expandedVideoRef.current.pause();
    setIsTunePlaying(false);
  }, []);

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

      const videoUrl = getVideoUrl(cardIndex);
      const audioUrl = getAudioSource(cardIndex);
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
        audioUrl,
        durationMinutes || null,
        voiceAudioId || null
      );

      // Start playback
      setIsTunePlaying(true);

      if (tuneAudioRef.current) {
        if (audioUrl) {
          tuneAudioRef.current.src = audioUrl;
        } else {
          tuneAudioRef.current.removeAttribute('src');
        }
        tuneAudioRef.current.load();
        if (audioUrl) {
          tuneAudioRef.current.play().catch((err) => devError('[PracticesTab] Audio play failed:', err));
        }
      }
    },
    [selectedCardForPractice, getVideoUrl, getAudioSource, items, startSession]
  );

  const handlePracticeComplete = useCallback(
    async (completed = true) => {
      const cardIndex = selectedCardIndex;
      const durationSeconds = practiceStartTime ? Math.floor((Date.now() - practiceStartTime) / 1000) : 0;

      stopPlayback();
      setIsInPracticeMode(false);
      setShowFullScreen(false);

      const message = getCompletionMessageByDuration(durationSeconds);
      setCompletionMessage(message);
      setShowCompletionMessage(true);

      // Track completion
      const item = items[cardIndex];
      const videoUrl = getVideoUrl(cardIndex);
      const audioUrl = getAudioSource(cardIndex);

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
      getAudioSource,
      completeSession,
      practiceDuration,
      voiceAudioSelected,
      onComplete,
      spaceName
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

        if (next) {
          if (audioEl && audioEl.src) {
            audioEl.play().catch((err) => devError('[PracticesTab] Audio resume failed:', err));
          }
          if (videoEl) {
            videoEl.play().catch(() => {});
          }
        } else {
          if (audioEl) audioEl.pause();
          if (videoEl) videoEl.pause();
        }

        return next;
      });
    },
    [selectedCardIndex]
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
      setTimeRemaining((prev) => (prev === null ? null : prev - 1));
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
        onEnded={() => {
          // If audio ends (non-loop), keep UI consistent
          setIsTunePlaying(false);
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
              {items.map((item, index) => (
                <PracticeCard
                  key={item.id}
                  item={item}
                  index={index}
                  isSelected={selectedCardIndex === index}
                  isPlaying={isTunePlaying && selectedCardIndex === index}
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
              ))}
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


