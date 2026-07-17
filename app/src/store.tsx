'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
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

// ---------- Actions ----------
type Action =
  | { type: 'SET_SCREENSHOT'; file: File; url: string; orientation: Orientation }
  | { type: 'CLEAR_SCREENSHOT' }
  | { type: 'SET_DEVICE'; device: DeviceType }
  | { type: 'SET_ORIENTATION'; orientation: Orientation }
  | { type: 'SET_TEMPLATE'; template: TemplateName }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'SET_SCENE'; scene: Partial<SceneSettings> }
  | { type: 'SET_RESOLUTION'; resolution: Resolution }
  | { type: 'SET_EXPORT_STATUS'; status: ExportStatus; progress?: number }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'DISMISS_MISMATCH' }
  | { type: 'SET_ACTIVE_TOOL'; tool: ActiveTool };

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
};

// ---------- Reducer ----------
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SCREENSHOT': {
      const mismatch = action.orientation !== state.orientation;
      return {
        ...state,
        screenshot: action.file,
        screenshotUrl: action.url,
        screenshotOrientation: action.orientation,
        orientationMismatch: mismatch,
        error: null,
      };
    }
    case 'CLEAR_SCREENSHOT':
      if (state.screenshotUrl) URL.revokeObjectURL(state.screenshotUrl);
      return {
        ...state,
        screenshot: null,
        screenshotUrl: null,
        screenshotOrientation: null,
        orientationMismatch: false,
      };
    case 'SET_DEVICE':
      return { ...state, device: action.device };
    case 'SET_ORIENTATION': {
      const mismatch =
        state.screenshotOrientation !== null &&
        state.screenshotOrientation !== action.orientation;
      return { ...state, orientation: action.orientation, orientationMismatch: mismatch };
    }
    case 'SET_TEMPLATE':
      return { ...state, template: action.template };
    case 'SET_SPEED':
      return { ...state, speed: action.speed };
    case 'SET_SCENE':
      return { ...state, scene: { ...state.scene, ...action.scene } };
    case 'SET_RESOLUTION':
      return { ...state, resolution: action.resolution };
    case 'SET_EXPORT_STATUS':
      return {
        ...state,
        exportStatus: action.status,
        exportProgress: action.progress ?? state.exportProgress,
      };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'DISMISS_MISMATCH':
      return { ...state, orientationMismatch: false };
    case 'SET_ACTIVE_TOOL':
      return { ...state, activeTool: action.tool };
    default:
      return state;
  }
}

// ---------- Context ----------
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  uploadScreenshot: (file: File) => void;
  clearScreenshot: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const uploadScreenshot = useCallback(
    (file: File) => {
      // Validate format
      const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        dispatch({ type: 'SET_ERROR', error: 'Please upload PNG, JPG, or WEBP' });
        return;
      }
      // Validate size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        dispatch({ type: 'SET_ERROR', error: 'File must be under 10MB' });
        return;
      }

      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const orientation: Orientation =
          img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait';
        dispatch({ type: 'SET_SCREENSHOT', file, url, orientation });
      };
      img.onerror = () => {
        dispatch({ type: 'SET_ERROR', error: 'Failed to load image. Try another file.' });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    },
    []
  );

  const clearScreenshot = useCallback(() => {
    dispatch({ type: 'CLEAR_SCREENSHOT' });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, uploadScreenshot, clearScreenshot }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
