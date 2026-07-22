'use client';

import React from 'react';
import { useAppState } from '@/store';
import { DeviceType, Orientation } from '@/types';
import { trackMixpanelEvent } from '@/lib/mixpanel';

export default function DeviceOrientation() {
  const { state, dispatch } = useAppState();

  return (
    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
      <div className="toggle-group" id="device-selector" style={{ flex: 1 }}>
        <button
          className={`toggle-btn${state.device === 'android' ? ' active' : ''}`}
          onClick={() => {
            dispatch({ device: 'android' });
            trackMixpanelEvent('device_selected', { device: 'android' });
          }}
          id="device-android-btn"
          title="Android Device"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.523 2.262a.75.75 0 0 0-1.046.214l-1.08 1.655A6.97 6.97 0 0 0 12 3.5a6.97 6.97 0 0 0-3.397.631l-1.08-1.655a.75.75 0 1 0-1.26.832l1.006 1.54A7 7 0 0 0 5 11h14a7 7 0 0 0-2.27-5.152l1.007-1.54a.75.75 0 0 0-.214-1.046zM10 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm6 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6H5z" />
          </svg>
        </button>
        <button
          className={`toggle-btn${state.device === 'ios' ? ' active' : ''}`}
          onClick={() => {
            dispatch({ device: 'ios' });
            trackMixpanelEvent('device_selected', { device: 'ios' });
          }}
          id="device-ios-btn"
          title="iOS Device"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
        </button>
      </div>

      <div className="toggle-group" id="orientation-selector" style={{ flex: 1 }}>
        <button
          className={`toggle-btn${state.orientation === 'portrait' ? ' active' : ''}`}
          onClick={() => dispatch({ orientation: 'portrait' })}
          id="orientation-portrait-btn"
          title="Portrait Mode"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="6" y="2" width="12" height="20" rx="2" />
          </svg>
        </button>
        <button
          className={`toggle-btn${state.orientation === 'landscape' ? ' active' : ''}`}
          onClick={() => dispatch({ orientation: 'landscape' })}
          id="orientation-landscape-btn"
          title="Landscape Mode"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="6" width="20" height="12" rx="2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
