'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import {
  AppState,
  DeviceType,
  Orientation,
  TemplateName,
  Resolution,
  ExportStatus,
  SceneSettings,
  DEFAULT_SCENE,
  ActiveTool,
} from '@/types';

// ---------- Initial State ----------
const initialState: AppState = {
  activeTool: 'upload',
  screenshot: null,
  screenshotUrl: null,
  screenshotOrientation: null,
  device: 'android',
  orientation: 'portrait',
  template: 'orbit',
  speed: 1,
  scene: DEFAULT_SCENE,
  resolution: '1080p',
  exportStatus: 'idle',
  exportProgress: 0,
  error: null,
  orientationMismatch: false,
  selectedTextId: null,
};

// ---------- Context ----------
type AppUpdate = Omit<Partial<AppState>, 'scene'> & {
  scene?: Partial<SceneSettings>;
};

interface AppContextValue {
  state: AppState;
  dispatch: (update: AppUpdate | ((prev: AppState) => AppUpdate)) => void;
  uploadScreenshot: (file: File) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const dispatch = (update: AppUpdate | ((prev: AppState) => AppUpdate)) => {
    setState((prev) => {
      const nextPartial = typeof update === 'function' ? update(prev) : update;
      const nextState: AppState = {
        ...prev,
        ...nextPartial,
        scene: nextPartial.scene
          ? { ...prev.scene, ...nextPartial.scene }
          : prev.scene,
      };

      // Handle orientation mismatch logic natively
      if (nextPartial.screenshotOrientation !== undefined || nextPartial.orientation !== undefined) {
        const checkScreenshotOrientation = nextPartial.screenshotOrientation !== undefined ? nextPartial.screenshotOrientation : prev.screenshotOrientation;
        const checkOrientation = nextPartial.orientation !== undefined ? nextPartial.orientation : prev.orientation;
        
        if (checkScreenshotOrientation !== null) {
            nextState.orientationMismatch = checkScreenshotOrientation !== checkOrientation;
        } else {
            nextState.orientationMismatch = false;
        }
      }

      return nextState;
    });
  };

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (state.screenshotUrl) URL.revokeObjectURL(state.screenshotUrl);
    };
  }, [state.screenshotUrl]);

  const uploadScreenshot = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      dispatch({ error: 'Please upload PNG, JPG, or WEBP' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      dispatch({ error: 'File must be under 10MB' });
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const orientation: Orientation =
        img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait';
      dispatch({ screenshot: file, screenshotUrl: url, screenshotOrientation: orientation, error: null });
    };
    img.onerror = () => {
      dispatch({ error: 'Failed to load image. Try another file.' });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <AppContext.Provider value={{ state, dispatch, uploadScreenshot }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
