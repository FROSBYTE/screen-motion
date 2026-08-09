'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import type { ComponentTemplateName } from './components/templates';
import { TEMPLATES } from '@/types';

export type MGTextAnimationType =
  | 'none'
  | 'bottom-up-letters'
  | 'kinetic-center-build'
  | 'line-by-line-slide'
  | 'mask-reveal-up'
  | 'reveal-text'
  | 'short-slide-down'
  | 'blur-out-up'
  | 'depth-parallax-words'
  | 'fade-through'
  | 'focus-blur-resolve'
  | 'micro-scale-fade'
  | 'per-character-rise'
  | 'per-word-crossfade'
  | 'scale-down-fade';

export type SceneTransition =
  | 'none'
  | 'clip-wipe'
  | 'fade'
  | 'iris'
  | 'iris-click'
  | 'loading-line';

export interface MGTextLayer {
  id: string;
  type: 'text';
  name?: string;
  text: string;
  animationType: MGTextAnimationType;
  animationSpeed: number;
  color: string;
  fontSize: number;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  startTime: number; // seconds relative to scene start
  duration: number;  // seconds
  position: { x: number; y: number }; // percentage-based (0-100)
  enterAnimation: 'none' | 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale-up' | 'blur-in';
  enterDuration: number;
  exitAnimation: 'none' | 'fade-out' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale-down' | 'blur-out';
  exitDuration: number;
}

export interface MGComponentLayer {
  id: string;
  type: 'component';
  name?: string;
  templateId: ComponentTemplateName;
  props: Record<string, any>; // component-specific props
  startTime: number;
  duration: number;
  position: { x: number; y: number };
  scale: number;
  enterAnimation: 'none' | 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale-up' | 'blur-in';
  enterDuration: number;
  exitAnimation: 'none' | 'fade-out' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale-down' | 'blur-out';
  exitDuration: number;
}

export type MGLayer = MGTextLayer | MGComponentLayer;

export interface MGScene {
  id: string;
  name: string;
  bgColor: string;
  bgImage?: string; // background image URL
  layers: MGLayer[];
  transition: SceneTransition;
  transitionDuration: number; // seconds
}

// Scene duration is exactly the end time of its latest layer.
export function getSceneDuration(scene: MGScene): number {
  if (scene.layers.length === 0) return 0;
  return Math.max(...scene.layers.map((layer) => layer.startTime + layer.duration));
}

export interface MGState {
  scenes: MGScene[];
  activeSceneId: string;
  selectedLayerId: string | null;
  isPlaying: boolean;
  currentTime: number; // seconds (global timeline time)
  // Focused playback range: when set, play only loops this window
  playbackRange: { start: number; end: number } | null;
  activeSidebarTab: 'scene' | 'components';
  isPickerOpen: boolean;
  isMuted: boolean;
}

function createDefaultScene(index: number): MGScene {
  return {
    id: `scene-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: `Scene ${index}`,
    bgColor: '#0f0f0f',
    layers: [],
    transition: index === 0 ? 'none' : 'fade',
    transitionDuration: 0.5,
  };
}

const defaultScene = createDefaultScene(1);

const DEFAULT_STATE: MGState = {
  scenes: [defaultScene],
  activeSceneId: defaultScene.id,
  selectedLayerId: null,
  isPlaying: false,
  currentTime: 0,
  playbackRange: null,
  activeSidebarTab: 'scene',
  isPickerOpen: false,
  isMuted: false,
};

type MGUpdate = Partial<MGState>;

interface MGContextValue {
  state: MGState;
  dispatch: (update: MGUpdate | ((prev: MGState) => MGUpdate)) => void;
  // Scene actions
  addScene: () => void;
  removeScene: (id: string) => void;
  updateScene: (id: string, updates: Partial<MGScene>) => void;
  duplicateScene: (id: string) => void;
  reorderScenes: (fromIndex: number, toIndex: number) => void;
  setScenes: (scenes: MGScene[]) => void;
  // Layer actions (on active scene)
  addLayer: (layer?: Partial<MGTextLayer>) => void;
  addComponentLayer: (templateId: ComponentTemplateName, props?: Record<string, any>) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<MGLayer>) => void;
  duplicateLayer: (id: string) => void;
  setLayers: (layers: MGLayer[]) => void;
  resetSelectedComponent: () => void;
  // Playback
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  // Undo / Redo
  undo: () => void;
  redo: () => void;
  pushUndo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  // Computed
  totalDuration: number;
  getSceneAtTime: (time: number) => { scene: MGScene; localTime: number; transitionProgress: number } | null;
  getSceneStartTime: (sceneId: string) => number;
}

const MGContext = createContext<MGContextValue | null>(null);

const MAX_HISTORY = 50;

export function MotionGraphicsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MGState>(DEFAULT_STATE);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── Undo / Redo history ──
  const stateRef = useRef<MGState>(state);
  stateRef.current = state;
  const historyRef = useRef<{ past: MGScene[][]; future: MGScene[][] }>({ past: [], future: [] });
  const [historyVersion, setHistoryVersion] = useState(0);

  const canUndo = historyRef.current.past.length > 0;
  const canRedo = historyRef.current.future.length > 0;

  // Snapshot current scenes onto the undo stack (call BEFORE mutating)
  const pushUndo = useCallback(() => {
    const h = historyRef.current;
    h.past.push(JSON.parse(JSON.stringify(stateRef.current.scenes)));
    if (h.past.length > MAX_HISTORY) h.past.shift();
    h.future = [];
    setHistoryVersion((v) => v + 1);
  }, []);

  const undo = useCallback(() => {
    const h = historyRef.current;
    if (h.past.length === 0) return;
    h.future.push(JSON.parse(JSON.stringify(stateRef.current.scenes)));
    const prev = h.past.pop()!;
    setState((s) => ({
      ...s,
      scenes: prev,
      activeSceneId: prev.some((sc) => sc.id === s.activeSceneId) ? s.activeSceneId : prev[0]?.id ?? s.activeSceneId,
      selectedLayerId: null,
    }));
    setHistoryVersion((v) => v + 1);
  }, []);

  const redo = useCallback(() => {
    const h = historyRef.current;
    if (h.future.length === 0) return;
    h.past.push(JSON.parse(JSON.stringify(stateRef.current.scenes)));
    const next = h.future.pop()!;
    setState((s) => ({
      ...s,
      scenes: next,
      activeSceneId: next.some((sc) => sc.id === s.activeSceneId) ? s.activeSceneId : next[0]?.id ?? s.activeSceneId,
      selectedLayerId: null,
    }));
    setHistoryVersion((v) => v + 1);
  }, []);

  // Global keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement).isContentEditable) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey) || (e.key === 'Z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const totalDuration = state.scenes.reduce((sum, s) => sum + getSceneDuration(s), 0);

  const getSceneStartTime = useCallback((sceneId: string) => {
    let time = 0;
    for (const scene of state.scenes) {
      if (scene.id === sceneId) return time;
      time += getSceneDuration(scene);
    }
    return time;
  }, [state.scenes]);

  const getSceneAtTime = useCallback((time: number) => {
    let elapsed = 0;
    for (let i = 0; i < state.scenes.length; i++) {
      const scene = state.scenes[i];
      const sceneDur = getSceneDuration(scene);
      if (time >= elapsed && time < elapsed + sceneDur) {
        const localTime = time - elapsed;
        // Calculate transition progress (0 = fully transitioning in, 1 = fully visible)
        let transitionProgress = 1;
        if (scene.transition !== 'none' && scene.transitionDuration > 0 && i > 0) {
          if (localTime < scene.transitionDuration) {
            transitionProgress = localTime / scene.transitionDuration;
          }
        }
        return { scene, localTime, transitionProgress };
      }
      elapsed += sceneDur;
    }
    // If at the very end, return last scene
    if (state.scenes.length > 0) {
      const lastScene = state.scenes[state.scenes.length - 1];
      return { scene: lastScene, localTime: getSceneDuration(lastScene), transitionProgress: 1 };
    }
    return null;
  }, [state.scenes]);

  const dispatch = useCallback((update: MGUpdate | ((prev: MGState) => MGUpdate)) => {
    setState((prev) => {
      const partial = typeof update === 'function' ? update(prev) : update;
      return { ...prev, ...partial };
    });
  }, []);

  const addScene = useCallback(() => {
    pushUndo();
    setState((prev) => {
      const newScene = createDefaultScene(prev.scenes.length + 1);
      return {
        ...prev,
        scenes: [...prev.scenes, newScene],
        activeSceneId: newScene.id,
      };
    });
  }, [pushUndo]);

  const removeScene = useCallback((id: string) => {
    pushUndo();
    setState((prev) => {
      if (prev.scenes.length <= 1) return prev; // Keep at least one scene
      const filtered = prev.scenes.filter((s) => s.id !== id);
      const newActive = prev.activeSceneId === id ? filtered[0].id : prev.activeSceneId;
      return { ...prev, scenes: filtered, activeSceneId: newActive };
    });
  }, [pushUndo]);

  const updateScene = useCallback((id: string, updates: Partial<MGScene>) => {
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  const duplicateScene = useCallback((id: string) => {
    pushUndo();
    setState((prev) => {
      const original = prev.scenes.find((s) => s.id === id);
      if (!original) return prev;
      const newId = `scene-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const duplicate: MGScene = {
        ...original,
        id: newId,
        name: `${original.name} (Copy)`,
        layers: original.layers.map((l) => ({ ...l, id: `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })),
      };
      const index = prev.scenes.findIndex((s) => s.id === id);
      const newScenes = [...prev.scenes];
      newScenes.splice(index + 1, 0, duplicate);
      return { ...prev, scenes: newScenes, activeSceneId: newId };
    });
  }, [pushUndo]);

  const reorderScenes = useCallback((fromIndex: number, toIndex: number) => {
    pushUndo();
    setState((prev) => {
      const newScenes = [...prev.scenes];
      const [moved] = newScenes.splice(fromIndex, 1);
      newScenes.splice(toIndex, 0, moved);
      return { ...prev, scenes: newScenes };
    });
  }, [pushUndo]);

  const setScenes = useCallback((newScenes: MGScene[]) => {
    pushUndo();
    setState((prev) => ({
      ...prev,
      scenes: newScenes,
    }));
  }, [pushUndo]);

  // Layer actions operate on the active scene
  const addLayer = useCallback((partial?: Partial<MGTextLayer>) => {
    const id = `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newLayer: MGTextLayer = {
      id,
      type: 'text',
      text: partial?.text || 'New Text',
      animationType: partial?.animationType || 'mask-reveal-up',
      animationSpeed: partial?.animationSpeed ?? 1,
      color: partial?.color || '#ffffff',
      fontSize: partial?.fontSize ?? 48,
      fontFamily: partial?.fontFamily || '"Plus Jakarta Sans", sans-serif',
      isBold: partial?.isBold ?? true,
      isItalic: partial?.isItalic ?? false,
      startTime: partial?.startTime ?? 0,
      duration: partial?.duration ?? 3,
      position: partial?.position ?? { x: 50, y: 50 },
      enterAnimation: partial?.enterAnimation ?? 'fade-in',
      enterDuration: partial?.enterDuration ?? 0.4,
      exitAnimation: partial?.exitAnimation ?? 'fade-out',
      exitDuration: partial?.exitDuration ?? 0.3,
    };
    pushUndo();
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === prev.activeSceneId ? { ...s, layers: [...s.layers, newLayer] } : s
      ),
      selectedLayerId: id,
    }));
  }, [pushUndo]);

  const addComponentLayer = useCallback((templateId: ComponentTemplateName, props?: Record<string, any>) => {
    const id = `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    let initialDuration = 2;
    if (templateId === 'phone-device') {
      const animName = props?.animationTemplate || 'float';
      const animConfig = TEMPLATES.find((t) => t.id === animName);
      initialDuration = animConfig ? animConfig.duration : 6;
    }
    const newLayer: MGComponentLayer = {
      id,
      type: 'component',
      templateId,
      props: props || {},
      startTime: 0,
      duration: initialDuration,
      position: { x: 50, y: 50 },
      scale: 1,
      enterAnimation: 'fade-in',
      enterDuration: 0.4,
      exitAnimation: 'fade-out',
      exitDuration: 0.3,
    };
    pushUndo();
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === prev.activeSceneId ? { ...s, layers: [...s.layers, newLayer] } : s
      ),
      selectedLayerId: id,
    }));
  }, [pushUndo]);

  const removeLayer = useCallback((id: string) => {
    pushUndo();
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.layers.some((l) => l.id === id) ? { ...s, layers: s.layers.filter((l) => l.id !== id) } : s
      ),
      selectedLayerId: prev.selectedLayerId === id ? null : prev.selectedLayerId,
    }));
  }, [pushUndo]);

  const updateLayer = useCallback((id: string, updates: Partial<MGLayer>) => {
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.layers.some((l) => l.id === id)
          ? { ...s, layers: s.layers.map((l) => (l.id === id ? { ...l, ...updates } as MGLayer : l)) }
          : s
      ),
    }));
  }, []);

  const duplicateLayer = useCallback((id: string) => {
    pushUndo();
    setState((prev) => {
      const activeScene = prev.scenes.find((s) => s.id === prev.activeSceneId);
      if (!activeScene) return prev;
      const original = activeScene.layers.find((l) => l.id === id);
      if (!original) return prev;
      const newId = `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const duplicate = {
        ...original,
        id: newId,
        startTime: original.startTime + original.duration,
      } as MGLayer;
      return {
        ...prev,
        scenes: prev.scenes.map((s) =>
          s.id === prev.activeSceneId ? { ...s, layers: [...s.layers, duplicate] } : s
        ),
        selectedLayerId: newId,
      };
    });
  }, [pushUndo]);

  const setLayers = useCallback((layers: MGLayer[]) => {
    pushUndo();
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === prev.activeSceneId ? { ...s, layers } : s
      ),
    }));
  }, [pushUndo]);

  const resetSelectedComponent = useCallback(() => {
    pushUndo();
    setState((prev) => {
      if (!prev.selectedLayerId) {
        // Reset all layers in active scene
        return {
          ...prev,
          scenes: prev.scenes.map((s) =>
            s.id === prev.activeSceneId
              ? {
                  ...s,
                  layers: s.layers.map((l) => ({
                    ...l,
                    position: { x: 50, y: 50 },
                    startTime: 0,
                    duration: 3,
                    ...(l.type === 'component' ? { scale: 1 } : {}),
                  })),
                }
              : s
          ),
        };
      }
      return {
        ...prev,
        scenes: prev.scenes.map((s) => ({
          ...s,
          layers: s.layers.map((l) => {
            if (l.id !== prev.selectedLayerId) return l;
            return {
              ...l,
              position: { x: 50, y: 50 },
              startTime: 0,
              duration: 3,
              ...(l.type === 'component' ? { scale: 1 } : {}),
            };
          }),
        })),
      };
    });
  }, [pushUndo]);

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const pause = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const play = useCallback(() => {
    setState((prev) => {
      const td = prev.scenes.reduce((sum, s) => sum + getSceneDuration(s), 0);
      // If focused playback ended, re-seek to range start before replaying
      if (prev.playbackRange && prev.currentTime >= prev.playbackRange.end) {
        return { ...prev, isPlaying: true, currentTime: prev.playbackRange.start };
      }
      // If video played to completion (at or past end), reset cursor to beginning before playing
      if (td > 0 && prev.currentTime >= td - 0.05) {
        return { ...prev, isPlaying: true, currentTime: 0 };
      }
      return { ...prev, isPlaying: true };
    });

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
    }
    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const delta = Math.min((now - lastTimeRef.current) / 1000, 0.08);
      lastTimeRef.current = now;

      setState((prev) => {
        if (!prev.isPlaying) return prev;
        const td = prev.scenes.reduce((sum, s) => sum + getSceneDuration(s), 0);
        const next = prev.currentTime + delta;
        // Focused playback: stop at range end
        if (prev.playbackRange) {
          if (next >= prev.playbackRange.end) {
            if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
            return { ...prev, currentTime: prev.playbackRange.end, isPlaying: false };
          }
          return { ...prev, currentTime: next };
        }
        if (next >= td) {
          if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
          return { ...prev, currentTime: td, isPlaying: false };
        }
        return { ...prev, currentTime: next };
      });

      if (stateRef.current.isPlaying) {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);
  }, []);

  const seekTo = useCallback((time: number) => {
    setState((prev) => {
      const td = prev.scenes.reduce((sum, s) => sum + getSceneDuration(s), 0);
      return { ...prev, currentTime: Math.max(0, Math.min(time, td)) };
    });
  }, []);

  // ── Auto-seek playhead cursor to beginning of component on layer selection ──
  const prevSelectedLayerIdRef = useRef<string | null>(null);

  useEffect(() => {
    const selectedId = state.selectedLayerId;
    if (selectedId && selectedId !== prevSelectedLayerIdRef.current) {
      let sceneStart = 0;
      for (const scene of state.scenes) {
        const layer = scene.layers.find((l) => l.id === selectedId);
        if (layer) {
          const componentStart = sceneStart + layer.startTime;
          setState((prev) => ({ ...prev, currentTime: componentStart }));
          break;
        }
        sceneStart += getSceneDuration(scene);
      }
    }
    prevSelectedLayerIdRef.current = selectedId;
  }, [state.selectedLayerId]);

  return (
    <MGContext.Provider value={{
      state,
      dispatch,
      addScene,
      removeScene,
      updateScene,
      duplicateScene,
      reorderScenes,
      setScenes,
      addLayer,
      addComponentLayer,
      removeLayer,
      updateLayer,
      duplicateLayer,
      setLayers,
      resetSelectedComponent,
      play,
      pause,
      seekTo,
      undo,
      redo,
      pushUndo,
      canUndo,
      canRedo,
      totalDuration,
      getSceneAtTime,
      getSceneStartTime,
    }}>
      {children}
    </MGContext.Provider>
  );
}

export function useMGState() {
  const ctx = useContext(MGContext);
  if (!ctx) throw new Error('useMGState must be used within MotionGraphicsProvider');
  return ctx;
}
