'use client';

import { useEffect } from 'react';
import { initMixpanel, trackMixpanelEvent } from '@/lib/mixpanel';

export default function MixpanelInit() {
  useEffect(() => {
    initMixpanel();
    trackMixpanelEvent('site_visited', {
      path: window.location.pathname,
      referrer: document.referrer || 'direct',
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
    });
  }, []);

  return null;
}
