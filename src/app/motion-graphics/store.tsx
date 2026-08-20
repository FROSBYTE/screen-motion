'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode, useMemo } from 'react';
import type { ComponentTemplateName } from './components/templates';
import { TEMPLATES } from '@/types';
import { saveAsset, getAssets, loadDraft, saveDraft, clearDraft, getProject, saveProject, createProject, listProjects, MGProjectData } from '@/lib/storage/indexedDb';
import { getDuplicateName } from '@/lib/utils';

export function extractAssetIds(obj: any): string[] {
  const ids = new Set<string>();
  function traverse(item: any) {
    if (!item || typeof item !== 'object') return;
    if (Array.isArray(item)) {
      item.forEach(traverse);
      return;
    }
    for (const [k, v] of Object.entries(item)) {
      if (typeof v === 'string' && (k.endsWith('AssetId') || k === 'assetId')) {
        ids.add(v);
      }
      traverse(v);
    }
  }
  traverse(obj);
  return Array.from(ids);
}

export function restoreAssetUrls(obj: any, assetMap: Record<string, string>): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => restoreAssetUrls(item, assetMap));
  }
  const next: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if ((k === 'src' || k === 'imageUrl' || k === 'bgImage' || k === 'value' || k === 'iconUrl' || k === 'screenImage' || k === 'screenVideo') && typeof v === 'string') {
      const assetId = obj[k + 'AssetId'] || obj.assetId;
      if (assetId && assetMap[assetId]) {
        next[k] = assetMap[assetId];
        continue;
      }
    }
    next[k] = restoreAssetUrls(v, assetMap);
  }
  return next;
}

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
  | 'scale-down-fade'
  | 'soft-blur-in'
  | 'spring-scale-in'
  | 'stagger-from-center'
  | 'text-reveal'
  | 'dia-text-reveal';

export type MGComponentPacingPreset = 'snappy' | 'balanced' | 'cinematic';
export type MGPacingPreset = MGComponentPacingPreset;

export interface PacingCalculation {
  entranceDuration: number;
  staggerDelay: number;
  holdDuration: number;
}

export function calculatePacing(
  preset: MGComponentPacingPreset,
  duration: number,
  items: number = 1
): PacingCalculation {
  const isShort = duration < 2.5;
  const isCinematic = preset === 'cinematic';
  const isSnappy = preset === 'snappy';

  const ratio = isShort
    ? 0.4
    : isSnappy
    ? 0.3
    : isCinematic
    ? 0.5
    : 0.35;

  const maxCap = isShort ? 1.0 : isSnappy ? 0.8 : isCinematic ? 2.0 : 1.2;
  const calculatedEntrance = Math.min(duration * ratio, maxCap);
  const entranceDuration = Math.max(0.15, calculatedEntrance);

  const staggerDelay = items > 1 ? entranceDuration / items : 0;
  const holdDuration = Math.max(0, duration - entranceDuration);

  return {
    entranceDuration,
    staggerDelay,
    holdDuration,
  };
}
export const getCalculatedPacing = calculatePacing;

// ── Keyframe Animation System ──
export type MGAnimatableProperty = 'posX' | 'posY' | 'scale' | 'rotation' | 'opacity';
export type MGEasingType = 'linear' | 'easeOut' | 'easeInOut' | 'spring' | 'bounce';

export interface MGKeyframe {
  id: string;
  time: number;          // seconds relative to layer start
  property: MGAnimatableProperty;
  value: number;
  easing: MGEasingType;
}

// Easing functions
function easingLinear(t: number): number { return t; }
function easingEaseOut(t: number): number { return 1 - Math.pow(1 - t, 3); }
function easingEaseInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easingSpring(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}
function easingBounce(t: number): number {
  const n1 = 7.5625, d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

const EASING_FNS: Record<MGEasingType, (t: number) => number> = {
  linear: easingLinear,
  easeOut: easingEaseOut,
  easeInOut: easingEaseInOut,
  spring: easingSpring,
  bounce: easingBounce,
};

/**
 * Evaluate the animated value for a given property at a relative time.
 * Returns defaultValue if no keyframes exist for that property.
 */
export function interpolateProperty(
  keyframes: MGKeyframe[] | undefined,
  property: MGAnimatableProperty,
  relativeTime: number,
  defaultValue: number,
): number {
  if (!keyframes || keyframes.length === 0) return defaultValue;
  const propKfs = keyframes.filter((k) => k.property === property).sort((a, b) => a.time - b.time);
  if (propKfs.length === 0) return defaultValue;
  // Before first keyframe
  if (relativeTime <= propKfs[0].time) return propKfs[0].value;
  // After last keyframe
  if (relativeTime >= propKfs[propKfs.length - 1].time) return propKfs[propKfs.length - 1].value;
  // Find the surrounding pair
  for (let i = 0; i < propKfs.length - 1; i++) {
    const a = propKfs[i];
    const b = propKfs[i + 1];
    if (relativeTime >= a.time && relativeTime <= b.time) {
      const range = b.time - a.time;
      if (range <= 0) return b.value;
      const rawT = (relativeTime - a.time) / range;
      const easedT = EASING_FNS[b.easing || 'easeInOut'](rawT);
      return a.value + (b.value - a.value) * easedT;
    }
  }
  return defaultValue;
}

/** Check if a property has keyframes */
export function hasKeyframesForProperty(
  keyframes: MGKeyframe[] | undefined,
  property: MGAnimatableProperty,
): boolean {
  return !!keyframes && keyframes.some((k) => k.property === property);
}

/** Check if a keyframe exists at a given time (+/- tolerance) for a property */
export function getKeyframeAtTime(
  keyframes: MGKeyframe[] | undefined,
  property: MGAnimatableProperty,
  time: number,
  tolerance: number = 0.05,
): MGKeyframe | undefined {
  if (!keyframes) return undefined;
  return keyframes.find((k) => k.property === property && Math.abs(k.time - time) < tolerance);
}

export interface MGTextLayer {
  id: string;
  type: 'text';
  name?: string;
  text: string;
  animationType: MGTextAnimationType;
  animationSpeed?: number;
  pacingPreset?: MGComponentPacingPreset;
  color: string;
  fontSize: number;
  fontFamily: string;
  letterSpacing?: number; // in pixels, default 0
  isBold: boolean;
  isItalic: boolean;
  startTime: number; // seconds
  duration: number;  // seconds
  position: { x: number; y: number }; // percentage 0-100
  enterAnimation?: 'none' | 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale-up' | 'blur-in';
  enterDuration?: number;
  exitAnimation?: 'none' | 'fade-out' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale-down' | 'blur-out';
  exitDuration?: number;
  keyframes?: MGKeyframe[];
}

export interface MGComponentLayer {
  id: string;
  type: 'component';
  name?: string;
  templateId: ComponentTemplateName;
  props: Record<string, any>;
  pacingPreset?: MGComponentPacingPreset;
  startTime: number;
  duration: number;
  position: { x: number; y: number };
  scale?: number;
  enterAnimation?: 'none' | 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale-up' | 'blur-in';
  enterDuration?: number;
  exitAnimation?: 'none' | 'fade-out' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale-down' | 'blur-out';
  exitDuration?: number;
  keyframes?: MGKeyframe[];
}

export type MGLayer = MGTextLayer | MGComponentLayer;

export type MGSceneTransition = 'none' | 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'zoom' | 'blur' | 'clip-wipe' | 'iris' | 'iris-click' | 'loading-line';
export type SceneTransition = MGSceneTransition;

export interface MGScene {
  id: string;
  name: string;
  bgColor: string;
  bgImage?: string;
  bgGradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    angle?: number;
  };
  layers: MGLayer[];
  transition: MGSceneTransition;
  transitionDuration: number; // seconds
}

// Scene duration is exactly the end time of its latest layer.
export function getSceneDuration(scene: MGScene): number {
  if (!scene.layers || scene.layers.length === 0) return 3;
  return Math.max(...scene.layers.map((layer) => layer.startTime + layer.duration));
}

export interface MGState {
  projectId: string;
  title: string;
  scenes: MGScene[];
  activeSceneId: string;
  selectedLayerId: string | null;
  isPlaying: boolean;
  currentTime: number; // seconds (global timeline time)
  playbackRange: { start: number; end: number } | null;
  activeSidebarTab: 'scene' | 'components';
  isPickerOpen: boolean;
  isMuted: boolean;
}

function createDefaultScene(index: number, existingNames?: string[]): MGScene {
  let name = `Scene ${index}`;
  if (existingNames && existingNames.length > 0) {
    const nameSet = new Set(existingNames.map((n) => (n || '').trim().toLowerCase()));
    let idx = index;
    while (nameSet.has(`scene ${idx}`.toLowerCase())) {
      idx++;
    }
    name = `Scene ${idx}`;
  }
  return {
    id: `scene-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    bgColor: '#0f0f0f',
    layers: [],
    transition: index === 0 ? 'none' : 'fade',
    transitionDuration: 0.5,
  };
}

const defaultScene = createDefaultScene(1);

const DEFAULT_STATE: MGState = {
  projectId: 'default',
  title: 'Untitled Project',
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

export type MGSaveStatus = 'saved' | 'unsaved' | 'saving' | 'error';
export type AutoSaveStatus = MGSaveStatus;

type MGUpdate = Partial<MGState>;

interface MGContextValue {
  state: MGState;
  dispatch: (update: MGUpdate | ((prev: MGState) => MGUpdate)) => void;
  isHydrated: boolean;
  saveStatus: MGSaveStatus;
  hasUnsavedChanges: boolean;
  saveCurrentProject: () => Promise<void>;
  projectId: string;
  title: string;
  setTitle: (title: string) => void;
  resetProject: () => Promise<void>;
  registerAsset: (file: Blob | File, name?: string) => Promise<{ assetId: string; url: string }>;
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
  // Keyframe actions
  addOrUpdateKeyframe: (layerId: string, property: MGAnimatableProperty, time: number, value: number, easing?: MGEasingType) => void;
  removeKeyframe: (layerId: string, keyframeId: string) => void;
  moveKeyframe: (layerId: string, keyframeId: string, newTime: number) => void;
  clearKeyframes: (layerId: string, property?: MGAnimatableProperty) => void;
  // Computed
  totalDuration: number;
  getSceneAtTime: (time: number) => { scene: MGScene; localTime: number; transitionProgress: number } | null;
  getSceneStartTime: (sceneId: string) => number;
}

const MGContext = createContext<MGContextValue | null>(null);

const MAX_HISTORY = 50;

export function MotionGraphicsProvider({ children, projectId }: { children: ReactNode; projectId?: string }) {
  const [state, setState] = useState<MGState>(DEFAULT_STATE);
  const [isHydrated, setIsHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<MGSaveStatus>('saved');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const activeAssetUrlsRef = useRef<Map<string, string>>(new Map());
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const createdAtRef = useRef<number>(Date.now());

  // ── Undo / Redo history ──
  const stateRef = useRef<MGState>(state);
  stateRef.current = state;
  const historyRef = useRef<{ past: MGScene[][]; future: MGScene[][] }>({ past: [], future: [] });
  const [historyVersion, setHistoryVersion] = useState(0);

  // ── Asset registration ──
  const registerAsset = useCallback(async (file: Blob | File, name?: string) => {
    const assetId = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await saveAsset(assetId, file, name);
    const url = URL.createObjectURL(file);
    activeAssetUrlsRef.current.set(assetId, url);
    return { assetId, url };
  }, []);

  // ── Restore project from IndexedDB on initial mount ──
  useEffect(() => {
    let isMounted = true;
    async function hydrate() {
      try {
        let loadedProject: MGProjectData | null = null;

        if (projectId) {
          loadedProject = await getProject(projectId);
          if (!loadedProject) {
            loadedProject = await createProject('Untitled Project');
            loadedProject.id = projectId;
            await saveProject(loadedProject);
          }
        } else {
          // Check projects list
          const existing = await listProjects();
          if (existing.length > 0) {
            loadedProject = await getProject(existing[0].id);
          } else {
            // Check legacy draft for backward compatibility
            const draft = await loadDraft<MGScene[]>('mg_active_draft');
            if (draft && draft.data && Array.isArray(draft.data) && draft.data.length > 0) {
              loadedProject = await createProject('My First Video', draft.data);
            } else {
              loadedProject = await createProject('Untitled Project');
            }
          }
        }

        if (loadedProject && isMounted) {
          createdAtRef.current = loadedProject.createdAt || Date.now();
          const rawScenes = loadedProject.scenes && Array.isArray(loadedProject.scenes) && loadedProject.scenes.length > 0
            ? loadedProject.scenes
            : [createDefaultScene(1)];

          const assetIds = loadedProject.assetIds || extractAssetIds(rawScenes);
          const assetsMap = await getAssets(assetIds);

          const urlMap: Record<string, string> = {};
          for (const [id, blob] of Object.entries(assetsMap)) {
            const url = URL.createObjectURL(blob);
            urlMap[id] = url;
            activeAssetUrlsRef.current.set(id, url);
          }

          const restoredScenes = restoreAssetUrls(rawScenes, urlMap);

          setState((prev) => ({
            ...prev,
            projectId: loadedProject!.id,
            title: loadedProject!.title || 'Untitled Project',
            scenes: restoredScenes,
            activeSceneId: restoredScenes[0]?.id || prev.activeSceneId,
            selectedLayerId: null,
          }));
          setHasUnsavedChanges(false);
          setSaveStatus('saved');
        }
      } catch (err) {
        console.error('[MotionGraphicsProvider] Failed to restore project from IndexedDB:', err);
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
  }, [projectId]);

  // ── Explicit Manual Save ──
  const saveCurrentProject = useCallback(async () => {
    const s = stateRef.current;
    if (!s.projectId || s.projectId === 'default') return;
    try {
      setSaveStatus('saving');
      const assetIds = extractAssetIds(s.scenes);
      await saveProject({
        id: s.projectId,
        title: s.title,
        createdAt: createdAtRef.current,
        updatedAt: Date.now(),
        scenes: s.scenes,
        assetIds,
      }, assetIds);
      await saveDraft('mg_active_draft', s.scenes, assetIds);
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
    } catch (err) {
      console.error('[MotionGraphicsProvider] Failed to save project:', err);
      setSaveStatus('error');
    }
  }, []);

  // ── Global Keyboard Shortcuts (Ctrl+S / Cmd+S to Save) ──
  useEffect(() => {
    const handleSaveShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentProject();
      }
    };
    window.addEventListener('keydown', handleSaveShortcut);
    return () => window.removeEventListener('keydown', handleSaveShortcut);
  }, [saveCurrentProject]);

  const setTitle = useCallback((title: string) => {
    setState((prev) => ({ ...prev, title }));
    setHasUnsavedChanges(true);
    setSaveStatus('unsaved');
  }, []);

  // ── Reset project ──
  const resetProject = useCallback(async () => {
    try {
      for (const url of activeAssetUrlsRef.current.values()) {
        try {
          URL.revokeObjectURL(url);
        } catch (_) {}
      }
      activeAssetUrlsRef.current.clear();

      historyRef.current = { past: [], future: [] };
      setHistoryVersion((v) => v + 1);

      const freshScene = createDefaultScene(1);
      setState((prev) => ({
        ...prev,
        scenes: [freshScene],
        activeSceneId: freshScene.id,
        selectedLayerId: null,
        currentTime: 0,
        isPlaying: false,
      }));
      setHasUnsavedChanges(true);
      setSaveStatus('unsaved');
    } catch (err) {
      console.error('[MotionGraphicsProvider] Failed to reset project:', err);
    }
  }, []);

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
    setHasUnsavedChanges(true);
    setSaveStatus('unsaved');
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
    setHasUnsavedChanges(true);
    setSaveStatus('unsaved');
  }, []);

  const markDirty = useCallback(() => {
    setHasUnsavedChanges(true);
    setSaveStatus('unsaved');
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
        if (scene.transition !== 'none' && scene.transitionDuration > 0) {
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
    markDirty();
    setState((prev) => {
      const newScene = createDefaultScene(prev.scenes.length + 1, prev.scenes.map((s) => s.name));
      return {
        ...prev,
        scenes: [...prev.scenes, newScene],
        activeSceneId: newScene.id,
      };
    });
  }, [pushUndo, markDirty]);

  const removeScene = useCallback((id: string) => {
    pushUndo();
    markDirty();
    setState((prev) => {
      if (prev.scenes.length <= 1) return prev; // Keep at least one scene
      const filtered = prev.scenes.filter((s) => s.id !== id);
      const newActive = prev.activeSceneId === id ? filtered[0].id : prev.activeSceneId;
      return { ...prev, scenes: filtered, activeSceneId: newActive };
    });
  }, [pushUndo, markDirty]);

  const updateScene = useCallback((id: string, updates: Partial<MGScene>) => {
    markDirty();
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, [markDirty]);

  const duplicateScene = useCallback((id: string) => {
    pushUndo();
    markDirty();
    setState((prev) => {
      const original = prev.scenes.find((s) => s.id === id);
      if (!original) return prev;
      const newId = `scene-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const duplicate: MGScene = {
        ...original,
        id: newId,
        name: getDuplicateName(original.name, prev.scenes.map((s) => s.name)),
        layers: original.layers.map((l) => ({ ...l, id: `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })),
      };
      const index = prev.scenes.findIndex((s) => s.id === id);
      const newScenes = [...prev.scenes];
      newScenes.splice(index + 1, 0, duplicate);
      return { ...prev, scenes: newScenes, activeSceneId: newId };
    });
  }, [pushUndo, markDirty]);

  const reorderScenes = useCallback((fromIndex: number, toIndex: number) => {
    pushUndo();
    markDirty();
    setState((prev) => {
      const newScenes = [...prev.scenes];
      const [moved] = newScenes.splice(fromIndex, 1);
      newScenes.splice(toIndex, 0, moved);
      return { ...prev, scenes: newScenes };
    });
  }, [pushUndo, markDirty]);

  const setScenes = useCallback((newScenes: MGScene[]) => {
    pushUndo();
    markDirty();
    setState((prev) => ({
      ...prev,
      scenes: newScenes,
    }));
  }, [pushUndo, markDirty]);

  // Layer actions operate on the active scene
  const addLayer = useCallback((partial?: Partial<MGTextLayer>) => {
    const id = `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newLayer: MGTextLayer = {
      id,
      type: 'text',
      text: partial?.text || 'New Text',
      animationType: partial?.animationType || 'mask-reveal-up',
      animationSpeed: partial?.animationSpeed ?? 1,
      pacingPreset: partial?.pacingPreset ?? 'balanced',
      color: partial?.color || '#ffffff',
      fontSize: partial?.fontSize ?? 48,
      fontFamily: partial?.fontFamily || '"Plus Jakarta Sans", sans-serif',
      letterSpacing: partial?.letterSpacing ?? 0,
      isBold: partial?.isBold ?? true,
      isItalic: partial?.isItalic ?? false,
      startTime: partial?.startTime ?? 0,
      duration: partial?.duration ?? 5,
      position: partial?.position ?? { x: 50, y: 50 },
      enterAnimation: partial?.enterAnimation ?? 'fade-in',
      enterDuration: partial?.enterDuration ?? 1.0,
      exitAnimation: partial?.exitAnimation ?? 'fade-out',
      exitDuration: partial?.exitDuration ?? 1.0,
    };
    pushUndo();
    markDirty();
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === prev.activeSceneId ? { ...s, layers: [...s.layers, newLayer] } : s
      ),
      selectedLayerId: id,
    }));
  }, [pushUndo, markDirty]);

  const addComponentLayer = useCallback((templateId: ComponentTemplateName, props?: Record<string, any>) => {
    const id = `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const initialDuration = 5;
    const newLayer: MGComponentLayer = {
      id,
      type: 'component',
      templateId,
      props: props || {},
      startTime: 0,
      duration: initialDuration,
      pacingPreset: 'balanced',
      position: { x: 50, y: 50 },
      scale: 1,
      enterAnimation: 'fade-in',
      enterDuration: 1.0,
      exitAnimation: 'fade-out',
      exitDuration: 1.0,
    };
    pushUndo();
    markDirty();
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === prev.activeSceneId ? { ...s, layers: [...s.layers, newLayer] } : s
      ),
      selectedLayerId: id,
    }));
  }, [pushUndo, markDirty]);

  const removeLayer = useCallback((id: string) => {
    pushUndo();
    markDirty();
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.layers.some((l) => l.id === id) ? { ...s, layers: s.layers.filter((l) => l.id !== id) } : s
      ),
      selectedLayerId: prev.selectedLayerId === id ? null : prev.selectedLayerId,
    }));
  }, [pushUndo, markDirty]);

  const updateLayer = useCallback((id: string, updates: Partial<MGLayer>) => {
    markDirty();
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.layers.some((l) => l.id === id)
          ? {
              ...s,
              layers: s.layers.map((l) => {
                if (l.id !== id) return l;
                const next = { ...l, ...updates } as MGLayer;
                if (next.duration !== undefined) {
                  next.duration = Math.max(0.5, Math.min(60, next.duration));
                }
                if (next.startTime !== undefined) {
                  next.startTime = Math.max(0, next.startTime);
                }
                return next;
              }),
            }
          : s
      ),
    }));
  }, [markDirty]);

  const duplicateLayer = useCallback((id: string) => {
    pushUndo();
    markDirty();
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
  }, [pushUndo, markDirty]);

  const setLayers = useCallback((layers: MGLayer[]) => {
    pushUndo();
    markDirty();
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === prev.activeSceneId ? { ...s, layers } : s
      ),
    }));
  }, [pushUndo, markDirty]);

  const resetSelectedComponent = useCallback(() => {
    pushUndo();
    markDirty();
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
                    duration: 5,
                    pacingPreset: 'balanced',
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
              duration: 5,
              pacingPreset: 'balanced',
              ...(l.type === 'component' ? { scale: 1 } : {}),
            };
          }),
        })),
      };
    });
  }, [pushUndo, markDirty]);

  // ── Keyframe CRUD Actions ──
  const addOrUpdateKeyframe = useCallback((
    layerId: string,
    property: MGAnimatableProperty,
    time: number,
    value: number,
    easing: MGEasingType = 'easeInOut',
  ) => {
    pushUndo();
    markDirty();
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => ({
        ...s,
        layers: s.layers.map((l) => {
          if (l.id !== layerId) return l;
          const existing = (l.keyframes || []).slice();
          const idx = existing.findIndex((k) => k.property === property && Math.abs(k.time - time) < 0.05);
          if (idx >= 0) {
            existing[idx] = { ...existing[idx], value, easing };
          } else {
            existing.push({
              id: `kf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              time,
              property,
              value,
              easing,
            });
          }
          return { ...l, keyframes: existing } as MGLayer;
        }),
      })),
    }));
  }, [pushUndo, markDirty]);

  const removeKeyframe = useCallback((layerId: string, keyframeId: string) => {
    pushUndo();
    markDirty();
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => ({
        ...s,
        layers: s.layers.map((l) => {
          if (l.id !== layerId) return l;
          return { ...l, keyframes: (l.keyframes || []).filter((k) => k.id !== keyframeId) } as MGLayer;
        }),
      })),
    }));
  }, [pushUndo, markDirty]);

  const moveKeyframe = useCallback((layerId: string, keyframeId: string, newTime: number) => {
    markDirty();
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => ({
        ...s,
        layers: s.layers.map((l) => {
          if (l.id !== layerId) return l;
          return {
            ...l,
            keyframes: (l.keyframes || []).map((k) =>
              k.id === keyframeId ? { ...k, time: Math.max(0, Math.min(newTime, l.duration)) } : k
            ),
          } as MGLayer;
        }),
      })),
    }));
  }, [markDirty]);

  const clearKeyframes = useCallback((layerId: string, property?: MGAnimatableProperty) => {
    pushUndo();
    markDirty();
    setState((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => ({
        ...s,
        layers: s.layers.map((l) => {
          if (l.id !== layerId) return l;
          const filtered = property
            ? (l.keyframes || []).filter((k) => k.property !== property)
            : [];
          return { ...l, keyframes: filtered } as MGLayer;
        }),
      })),
    }));
  }, [pushUndo, markDirty]);

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



  return (
    <MGContext.Provider value={{
      state,
      dispatch,
      isHydrated,
      saveStatus,
      hasUnsavedChanges,
      saveCurrentProject,
      projectId: state.projectId,
      title: state.title,
      setTitle,
      resetProject,
      registerAsset,
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
      addOrUpdateKeyframe,
      removeKeyframe,
      moveKeyframe,
      clearKeyframes,
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
