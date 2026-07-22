'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { trackMixpanelEvent } from '@/lib/mixpanel';
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
  device: 'ios',
  deviceColor: '#6b7280', // default grey color
  orientation: 'landscape',
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
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  state: AppState;
  dispatch: (update: AppUpdate | ((prev: AppState) => AppUpdate)) => void;
  uploadScreenshot: (file: File) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [history, setHistory] = useState<AppState[]>([]);
  const [future, setFuture] = useState<AppState[]>([]);

  const dispatch = (update: AppUpdate | ((prev: AppState) => AppUpdate)) => {
    setState((prev) => {
      // DISABLED_FEATURE_START: Undo/Redo System History Tracking
      // DO NOT DELETE: Keeping this code disabled for future reference or reactivation.
      /*
      setHistory((h) => [...h, prev].slice(-20));
      setFuture([]);
      */
      // DISABLED_FEATURE_END: Undo/Redo System History Tracking
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

  // DISABLED_FEATURE_START: Undo/Redo Actions and States
  // DO NOT DELETE: Keeping this code disabled for future reference or reactivation.
  /*
  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setFuture((f) => [state, ...f]);
    setHistory((h) => h.slice(0, -1));
    setState(prev);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory((h) => [...h, state]);
    setFuture((f) => f.slice(1));
    setState(next);
  };

  const canUndo = history.length > 0;
  const canRedo = future.length > 0;
  */
  const undo = () => {};
  const redo = () => {};
  const canUndo = false;
  const canRedo = false;
  // DISABLED_FEATURE_END: Undo/Redo Actions and States

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (state.screenshotUrl) URL.revokeObjectURL(state.screenshotUrl);
    };
  }, [state.screenshotUrl]);

  const uploadScreenshot = (file: File) => {
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isImage && !isVideo) {
      dispatch({ error: 'Please upload a valid image or video (PNG, JPG, WEBP, MP4, WEBM)' });
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      dispatch({ error: 'File must be under 25MB' });
      return;
    }

    const url = URL.createObjectURL(file);

    if (isVideo) {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        const orientation: Orientation =
          video.videoWidth > video.videoHeight ? 'landscape' : 'portrait';
        dispatch({ screenshot: file, screenshotUrl: url, screenshotOrientation: orientation, error: null });
        trackMixpanelEvent('screenshot_uploaded', {
          file_type: 'video',
          file_name: file.name,
          file_extension: file.name.split('.').pop()?.toLowerCase() || '',
          file_size_mb: Number((file.size / (1024 * 1024)).toFixed(2)),
          orientation,
        });
      };
      video.onerror = () => {
        dispatch({ error: 'Failed to load video. Try another file.' });
        URL.revokeObjectURL(url);
      };
      video.src = url;
    } else {
      const img = new Image();
      img.onload = () => {
        const orientation: Orientation =
          img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait';
        dispatch({ screenshot: file, screenshotUrl: url, screenshotOrientation: orientation, error: null });
        trackMixpanelEvent('screenshot_uploaded', {
          file_type: 'image',
          file_name: file.name,
          file_extension: file.name.split('.').pop()?.toLowerCase() || '',
          file_size_mb: Number((file.size / (1024 * 1024)).toFixed(2)),
          orientation,
        });
      };
      img.onerror = () => {
        dispatch({ error: 'Failed to load image. Try another file.' });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  return (
    <AppContext.Provider value={{ undo, redo, canUndo, canRedo, state, dispatch, uploadScreenshot }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
