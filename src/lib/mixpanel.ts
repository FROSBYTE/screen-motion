import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '434d5c9a662994e4d1771c0aac412adc';

let initialized = false;

export function initMixpanel(): void {
  if (typeof window === 'undefined' || initialized) return;

  try {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: false,
      autocapture: true,
      record_sessions_percent: 100,
      api_host: 'https://api-eu.mixpanel.com',
      track_pageview: true,
      persistence: 'localStorage',
      cross_site_cookie: false,
      secure_cookie: true,
      ignore_dnt: true,
    });
    initialized = true;
  } catch (error) {
    console.error('Failed to initialize Mixpanel:', error);
  }
}

export function trackMixpanelEvent(eventName: string, properties?: Record<string, any>): void {
  if (typeof window === 'undefined') return;

  try {
    if (!initialized) {
      initMixpanel();
    }
    mixpanel.track(eventName, properties);
  } catch (error) {
    console.error(`Mixpanel track error for event "${eventName}":`, error);
  }
}
