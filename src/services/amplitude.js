import * as amplitude from '@amplitude/analytics-browser';

class WebAmplitudeService {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize Amplitude analytics
   */
  async initialize(userId) {
    try {
      const apiKey = process.env.REACT_APP_AMPLITUDE_API_KEY;
      
      if (!apiKey) {
        console.warn('REACT_APP_AMPLITUDE_API_KEY not configured');
        return;
      }

      amplitude.init(apiKey, userId, {
        defaultTracking: {
          sessions: true,
          formInteractions: true,
          fileDownloads: true,
        },
      });

      this.setUserProperties({
        platform: 'web',
        timestamp: new Date().toISOString(),
      });

      this.initialized = true;
      console.log('Amplitude initialized for user:', userId);
    } catch (error) {
      console.error('Failed to initialize Amplitude:', error);
    }
  }

  /**
   * Track screen/page view
   */
  trackScreenView(pageName, pageProperties = {}) {
    if (!this.initialized) {
      console.warn('Amplitude not initialized');
      return;
    }

    amplitude.track('page_view', {
      page_name: pageName,
      timestamp: new Date().toISOString(),
      ...pageProperties,
    });
  }

  /**
   * Track practice start
   */
  trackPracticeStart(practiceType, duration, difficulty = 'medium') {
    if (!this.initialized) return;

    amplitude.track('practice_started', {
      practice_type: practiceType,
      duration_minutes: duration,
      difficulty,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track practice completion
   */
  trackPracticeComplete(practiceType, duration, feedbackRating = null) {
    if (!this.initialized) return;

    amplitude.track('practice_completed', {
      practice_type: practiceType,
      duration_minutes: duration,
      feedback_rating: feedbackRating,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track subscription event
   */
  trackSubscriptionEvent(eventType, packageId, price, currency = 'USD') {
    if (!this.initialized) return;

    amplitude.track(`subscription_${eventType}`, {
      package_id: packageId,
      price,
      currency,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track mood/emotional check-in
   */
  trackMoodCheckIn(mood, intent = null) {
    if (!this.initialized) return;

    amplitude.track('mood_checkin', {
      mood,
      intent,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track user engagement
   */
  trackUserEngagement(actionType, metadata = {}) {
    if (!this.initialized) return;

    amplitude.track('user_engagement', {
      action: actionType,
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track error events
   */
  trackError(errorType, errorMessage) {
    if (!this.initialized) return;

    amplitude.track('app_error', {
      error_type: errorType,
      error_message: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Set user properties for segmentation
   */
  setUserProperties(properties) {
    if (!this.initialized) return;

    amplitude.setUserProperties(properties);
  }

  /**
   * Track retention metrics
   */
  trackRetention(daysSinceInstall) {
    if (!this.initialized) return;

    amplitude.track('retention_check', {
      days_since_install: daysSinceInstall,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Identify user
   */
  setUserId(userId) {
    if (!this.initialized) return;

    amplitude.setUserId(userId);
  }
}

export default new WebAmplitudeService();
