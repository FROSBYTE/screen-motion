'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { trackMixpanelEvent } from '@/lib/mixpanel';
import { useAutoSave } from '@/hooks/useAutoSave';
import { saveAsset, getAsset, loadDraft, clearDraft } from '@/lib/storage/indexedDb';
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
  MediaType,
} from '@/types';

// ---------- Initial State ----------
const initialState: AppState = {
  activeTool: 'upload',
  screenshot: null,
  screenshotUrl: null,
  screenshotOrientation: null,
  mediaType: 'image',
  device: 'ios',
  deviceColor: '#ffffff', // default white color
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
  foldState: 'animated',
  foldProgress: 0,
  closeScreenshot: null,
  closeScreenshotUrl: null,
  closeMediaType: 'image',
  useSameImageForClose: true,
};

// ---------- Context ----------
type AppUpdate = Omit<Partial<AppState>, 'scene'> & {
  scene?: Partial<SceneSettings>;
};

interface AppContextValue {
  state: AppState;
  dispatch: (update: AppUpdate | ((prev: AppState) => AppUpdate)) => void;
  uploadScreenshot: (file: File) => void;
  uploadCloseScreenshot: (file: File) => void;
  resetProject: () => Promise<void>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore editor draft on mount
  useEffect(() => {
    let isMounted = true;
    async function hydrate() {
      try {
        const draft = await loadDraft<Partial<AppState>>('editor_active_draft');
        const savedBlob = await getAsset('editor_screenshot');
        const savedCloseBlob = await getAsset('editor_close_screenshot');
        let restoredScreenshotUrl: string | null = null;
        let restoredCloseScreenshotUrl: string | null = null;

        if (savedBlob) {
          restoredScreenshotUrl = URL.createObjectURL(savedBlob);
        }
        if (savedCloseBlob) {
          restoredCloseScreenshotUrl = URL.createObjectURL(savedCloseBlob);
        }

        if (isMounted) {
          if (draft && draft.data) {
            setState((prev) => ({
              ...prev,
              ...draft.data,
              screenshot: (savedBlob as File) || null,
              screenshotUrl: restoredScreenshotUrl || null,
              closeScreenshot: (savedCloseBlob as File) || null,
              closeScreenshotUrl: restoredCloseScreenshotUrl || null,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              screenshot: (savedBlob as File) || null,
              screenshotUrl: restoredScreenshotUrl || null,
              closeScreenshot: (savedCloseBlob as File) || null,
              closeScreenshotUrl: restoredCloseScreenshotUrl || null,
            }));
          }
        }
      } catch (err) {
        console.error('[AppProvider] Failed to hydrate editor draft:', err);
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    }

    hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save serializable editor state
  const serializableState = useMemo(() => {
    const { screenshot, screenshotUrl, closeScreenshot, closeScreenshotUrl, error, exportStatus, exportProgress, ...rest } = state;
    return rest;
  }, [state]);

  useAutoSave({
    key: 'editor_active_draft',
    data: serializableState,
    enabled: isHydrated,
    debounceMs: 600,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const templateParam = params.get('template') || params.get('animation');
      if (templateParam) {
        setState((prev) => ({ ...prev, template: templateParam as TemplateName }));
      }
    }
  }, []);

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



  const uploadScreenshot = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      dispatch({ error: 'Please upload an image (PNG, JPG, WEBP) or video (MP4, WEBM, MOV)' });
      return;
    }
    const maxSize = isVideo ? 100 * 1024 * 1024 : 25 * 1024 * 1024;
    if (file.size > maxSize) {
      dispatch({ error: isVideo ? 'Video must be under 100MB' : 'Image must be under 25MB' });
      return;
    }

    if (state.screenshotUrl) {
      URL.revokeObjectURL(state.screenshotUrl);
    }

    // Save screenshot blob to IndexedDB
    saveAsset('editor_screenshot', file, file.name).catch((err) =>
      console.error('Failed to save screenshot asset:', err)
    );

    const url = URL.createObjectURL(file);

    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const orientation: Orientation =
          video.videoWidth > video.videoHeight ? 'landscape' : 'portrait';
        dispatch({ screenshot: file, screenshotUrl: url, screenshotOrientation: orientation, mediaType: 'video', error: null });
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
        dispatch({ screenshot: file, screenshotUrl: url, screenshotOrientation: orientation, mediaType: 'image', error: null });
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

  const uploadCloseScreenshot = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      dispatch({ error: 'Please upload an image (PNG, JPG, WEBP) or video (MP4, WEBM, MOV)' });
      return;
    }
    const maxSize = isVideo ? 100 * 1024 * 1024 : 25 * 1024 * 1024;
    if (file.size > maxSize) {
      dispatch({ error: isVideo ? 'Video must be under 100MB' : 'Image must be under 25MB' });
      return;
    }

    if (state.closeScreenshotUrl) {
      URL.revokeObjectURL(state.closeScreenshotUrl);
    }

    saveAsset('editor_close_screenshot', file, file.name).catch((err) =>
      console.error('Failed to save close screenshot asset:', err)
    );

    const url = URL.createObjectURL(file);

    dispatch({
      closeScreenshot: file,
      closeScreenshotUrl: url,
      closeMediaType: isVideo ? 'video' : 'image',
      error: null,
    });
  };

  const resetProject = useCallback(async () => {
    try {
      await clearDraft('editor_active_draft');
      await clearDraft('editor_screenshot');
      await clearDraft('editor_close_screenshot');
      if (state.screenshotUrl) {
        URL.revokeObjectURL(state.screenshotUrl);
      }
      if (state.closeScreenshotUrl) {
        URL.revokeObjectURL(state.closeScreenshotUrl);
      }
      setState(initialState);
    } catch (err) {
      console.error('[AppProvider] Failed to reset project:', err);
    }
  }, [state.screenshotUrl, state.closeScreenshotUrl]);

  return (
    <AppContext.Provider value={{ state, dispatch, uploadScreenshot, uploadCloseScreenshot, resetProject }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
