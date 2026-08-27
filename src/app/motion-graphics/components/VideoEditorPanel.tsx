'use client';

import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { Lock, Rewind, FastForward, Play, Pause, Minus, Plus } from 'lucide-react';
import { useMGState, getSceneDuration, type MGLayer } from '../store';
import { COMPONENT_TEMPLATES } from './templates';

// Scene strip color palette – dark professional tones
const SCENE_COLORS = [
  { bg: '#1e293b', border: '#facc15', text: '#f8fafc' }, // slate/yellow
  { bg: '#1e1b4b', border: '#818cf8', text: '#f8fafc' }, // indigo
  { bg: '#064e3b', border: '#34d399', text: '#f8fafc' }, // emerald
  { bg: '#78350f', border: '#fbbf24', text: '#f8fafc' }, // amber
  { bg: '#0c4a6e', border: '#facc15', text: '#f8fafc' }, // sky/yellow
  { bg: '#581c87', border: '#c084fc', text: '#f8fafc' }, // violet
  { bg: '#7c2d12', border: '#fb923c', text: '#f8fafc' }, // orange
  { bg: '#134e4a', border: '#2dd4bf', text: '#f8fafc' }, // teal
];

export default function VideoEditorPanel() {
  const { state, dispatch, play, pause, seekTo, updateLayer, addScene, totalDuration, getSceneStartTime, pushUndo, moveKeyframe } = useMGState();
  const { scenes, currentTime, isPlaying, selectedLayerId, multiSelectedLayerIds, activeSceneId, activeSidebarTab } = state;
  const activeScene = scenes.find((s) => s.id === activeSceneId);

  const scenesRef = useRef(scenes);
  useEffect(() => {
    scenesRef.current = scenes;
  }, [scenes]);

  const layers = activeScene?.layers || [];
  const hasLayers = layers.length > 0;
  const layersRef = useRef(layers);
  layersRef.current = layers;

  // Check if ANY scene has layers (for showing the timeline area)
  const anySceneHasLayers = scenes.some((s) => s.layers.length > 0);

  const trackAreaRef = useRef<HTMLDivElement>(null);
  const zoomSliderRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 1.8;
  const [zoom, setZoom] = useState(1.0); // Default at 50%
  const [isDraggingZoom, setIsDraggingZoom] = useState(false);
  const [trackViewportWidth, setTrackViewportWidth] = useState(900);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [draggingLayers, setDraggingLayers] = useState<{
    type: 'move' | 'resize-left' | 'resize-right';
    startX: number;
    startY: number;
    layers: {
      id: string;
      sceneId: string;
      startTime: number;
      startDuration: number;
      startTrackIndex: number;
    }[];
  } | null>(null);
  const [draggingKeyframe, setDraggingKeyframe] = useState<{ layerId: string; keyframeId: string; startX: number; startTime: number; layerDuration: number; layerSceneStart: number; layerStartTime: number } | null>(null);
  const [snapGuide, setSnapGuide] = useState<{ time: number; kind: 'scene-start' | 'layer-edge' } | null>(null);

  const pxPerSec = 62 * zoom;
  const minimumScaleWidth = Math.max(900, trackViewportWidth);
  const scaleDuration = Math.max(totalDuration, Math.ceil(minimumScaleWidth / pxPerSec));

  const zoomPercent = Math.min(100, Math.max(0, ((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100));

  const updateZoomFromClientX = useCallback((clientX: number) => {
    if (!zoomSliderRef.current) return;
    const rect = zoomSliderRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newZoom = Number((MIN_ZOOM + ratio * (MAX_ZOOM - MIN_ZOOM)).toFixed(2));
    setZoom(newZoom);
  }, []);

  const handleZoomPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingZoom(true);
    updateZoomFromClientX(e.clientX);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      updateZoomFromClientX(moveEvent.clientX);
    };

    const handlePointerUp = () => {
      setIsDraggingZoom(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };
  const timelineWidth = scaleDuration * pxPerSec;

  useEffect(() => {
    const trackArea = trackAreaRef.current;
    if (!trackArea) return;

    const updateViewportWidth = () => setTrackViewportWidth(Math.ceil(trackArea.clientWidth));
    updateViewportWidth();
    const observer = new ResizeObserver(updateViewportWidth);
    observer.observe(trackArea);
    return () => observer.disconnect();
  }, []);

  const getTimeFromX = useCallback((clientX: number) => {
    if (!trackAreaRef.current) return 0;
    const rect = trackAreaRef.current.getBoundingClientRect();
    const scrollLeft = trackAreaRef.current.scrollLeft;
    const x = clientX - rect.left + scrollLeft;
    return Math.max(0, Math.min(x / pxPerSec, totalDuration));
  }, [pxPerSec, totalDuration]);

  useEffect(() => {
    if (!isDraggingPlayhead) return;
    pause();
    const handleMove = (e: PointerEvent) => {
      pause();
      seekTo(getTimeFromX(e.clientX));
    };
    const handleUp = () => setIsDraggingPlayhead(false);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => { window.removeEventListener('pointermove', handleMove); window.removeEventListener('pointerup', handleUp); };
  }, [isDraggingPlayhead, getTimeFromX, seekTo, pause]);

  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;

  const getSceneStartTimeRef = useRef(getSceneStartTime);
  getSceneStartTimeRef.current = getSceneStartTime;

  const updateLayerRef = useRef(updateLayer);
  updateLayerRef.current = updateLayer;

  const pxPerSecRef = useRef(pxPerSec);
  pxPerSecRef.current = pxPerSec;

  const moveKeyframeRef = useRef(moveKeyframe);
  moveKeyframeRef.current = moveKeyframe;

  const seekToRef = useRef(seekTo);
  seekToRef.current = seekTo;

  const updateSnapGuide = useCallback((newSnap: { time: number; kind: 'scene-start' | 'layer-edge' } | null) => {
    setSnapGuide((prev) => {
      if (!newSnap && !prev) return prev;
      if (newSnap && prev && prev.time === newSnap.time && prev.kind === newSnap.kind) return prev;
      return newSnap;
    });
  }, []);

  useEffect(() => {
    if (!draggingLayers) return;
    const handleMove = (e: PointerEvent) => {
      const dtPixels = Math.abs(e.clientX - draggingLayers.startX);
      const dyPixels = Math.abs(e.clientY - draggingLayers.startY);
      if (dtPixels > 3 || dyPixels > 3) {
        draggedRef.current = true;
      }
      
      const currentPxPerSec = pxPerSecRef.current;
      const dt = (e.clientX - draggingLayers.startX) / currentPxPerSec;
      const snapThreshold = 10 / currentPxPerSec; // ~10px magnetic snapping assist
      
      const MIN_LAYER_DURATION = 0.5;
      const MAX_LAYER_DURATION = 60.0;
      
      const primaryDrag = draggingLayers.layers[0];
      const dragScene = scenesRef.current.find((s) => s.id === primaryDrag.sceneId);
      const dragSceneLayers = dragScene?.layers || [];
      const sStart = getSceneStartTimeRef.current(primaryDrag.sceneId);

      // Clipping & Magnetic Snapping Candidates:
      // 1. Scene start (time: 0)
      // 2. Playhead position in scene local time
      // 3. Edges of all other layers in the scene
      const candidates: { time: number; kind: 'scene-start' | 'layer-edge' }[] = [
        { time: 0, kind: 'scene-start' as const },
      ];

      const localPlayhead = currentTimeRef.current - sStart;
      if (localPlayhead >= 0) {
        candidates.push({ time: localPlayhead, kind: 'layer-edge' as const });
      }

      dragSceneLayers
        .filter((layer) => !draggingLayers.layers.some((dl) => dl.id === layer.id))
        .forEach((layer) => {
          candidates.push({ time: layer.startTime, kind: 'layer-edge' as const });
          candidates.push({ time: layer.startTime + layer.duration, kind: 'layer-edge' as const });
        });

      const resolveSnap = (edges: { value: number; update: (target: number) => { startTime: number; duration: number } }[]) => {
        let closest: { time: number; kind: 'scene-start' | 'layer-edge'; update: { startTime: number; duration: number }; distance: number } | null = null;
        for (const candidate of candidates) {
          for (const edge of edges) {
            const update = edge.update(candidate.time);
            const distance = Math.abs(edge.value - candidate.time);
            if (
              update.startTime < 0 ||
              update.duration < MIN_LAYER_DURATION ||
              update.duration > MAX_LAYER_DURATION ||
              distance > snapThreshold ||
              (closest && distance >= closest.distance)
            ) {
              continue;
            }
            closest = { ...candidate, update, distance };
          }
        }
        return closest;
      };

      if (draggingLayers.type === 'move') {
        const minStartTime = Math.min(...draggingLayers.layers.map((l) => l.startTime));
        const clampedDt = Math.max(-minStartTime, dt);

        let snapAppliedDt = clampedDt;

        const primaryStartTime = Math.max(0, primaryDrag.startTime + clampedDt);
        const snap = resolveSnap([
          { value: primaryStartTime, update: (target) => ({ startTime: Math.max(0, target), duration: primaryDrag.startDuration }) },
          { value: primaryStartTime + primaryDrag.startDuration, update: (target) => ({ startTime: Math.max(0, target - primaryDrag.startDuration), duration: primaryDrag.startDuration }) },
        ]);

        if (snap) {
          updateSnapGuide({ time: snap.time, kind: snap.kind });
          snapAppliedDt = snap.update.startTime - primaryDrag.startTime;
        } else {
          updateSnapGuide(null);
        }

        // Vertical track movement (~42px per line)
        const verticalDelta = e.clientY - draggingLayers.startY;
        const deltaTracks = Math.round(verticalDelta / 42);

        draggingLayers.layers.forEach((layer) => {
          const newTrack = Math.max(0, layer.startTrackIndex + deltaTracks);
          updateLayerRef.current(layer.id, {
            startTime: layer.startTime + snapAppliedDt,
            duration: layer.startDuration,
            trackIndex: newTrack,
          });
        });
      } else if (draggingLayers.type === 'resize-right') {
        const dl = draggingLayers.layers[0];
        const rawDuration = dl.startDuration + dt;
        const duration = Math.min(MAX_LAYER_DURATION, Math.max(MIN_LAYER_DURATION, rawDuration));
        const snap = resolveSnap([
          { value: dl.startTime + duration, update: (target) => ({ startTime: dl.startTime, duration: Math.min(MAX_LAYER_DURATION, Math.max(MIN_LAYER_DURATION, target - dl.startTime)) }) },
        ]);
        updateSnapGuide(snap ? { time: snap.time, kind: snap.kind } : null);
        updateLayerRef.current(dl.id, snap?.update ?? { startTime: dl.startTime, duration });
      } else {
        const dl = draggingLayers.layers[0];
        const endTime = dl.startTime + dl.startDuration;
        const rawStartTime = dl.startTime + dt;
        const startTime = Math.max(0, Math.min(rawStartTime, endTime - MIN_LAYER_DURATION));
        const duration = Math.min(MAX_LAYER_DURATION, Math.max(MIN_LAYER_DURATION, endTime - startTime));
        const clampedStartTime = endTime - duration;
        const snap = resolveSnap([
          {
            value: clampedStartTime,
            update: (target) => {
              const newStart = Math.max(0, Math.min(target, endTime - MIN_LAYER_DURATION));
              const newDur = Math.min(MAX_LAYER_DURATION, Math.max(MIN_LAYER_DURATION, endTime - newStart));
              return { startTime: endTime - newDur, duration: newDur };
            },
          },
        ]);
        updateSnapGuide(snap ? { time: snap.time, kind: snap.kind } : null);
        updateLayerRef.current(dl.id, snap?.update ?? { startTime: clampedStartTime, duration });
      }
    };
    const handleUp = () => {
      setDraggingLayers(null);
      updateSnapGuide(null);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [draggingLayers, updateSnapGuide]);

  useEffect(() => {
    if (!draggingKeyframe) return;
    const handleMove = (e: PointerEvent) => {
      const dt = (e.clientX - draggingKeyframe.startX) / pxPerSecRef.current;
      const newTime = Math.max(0, Math.min(draggingKeyframe.layerDuration, draggingKeyframe.startTime + dt));
      const roundedTime = Math.round(newTime * 100) / 100;
      moveKeyframeRef.current(draggingKeyframe.layerId, draggingKeyframe.keyframeId, roundedTime);
      seekToRef.current(draggingKeyframe.layerSceneStart + draggingKeyframe.layerStartTime + roundedTime);
    };
    const handleUp = () => {
      setDraggingKeyframe(null);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [draggingKeyframe]);

  // Adaptive ruler interval calculation based on zoom slider percentage:
  // 0% - 20%: 0, 5, 10, 15... (interval: 5)
  // 20% - 60%: 0, 2, 4, 6, 8... (interval: 2)
  // > 60%: 0, 1, 2, 3, 4, 5... (interval: 1)
  let labelInterval = 2;
  let minorTickInterval = 0.5;

  if (zoomPercent <= 20) {
    labelInterval = 5;
    minorTickInterval = 1;
  } else if (zoomPercent <= 60) {
    labelInterval = 2;
    minorTickInterval = 0.5;
  } else {
    labelInterval = 1;
    minorTickInterval = 0.25;
  }

  const ticks = useMemo(() => {
    const arr: { x: number; major: boolean; label?: string }[] = [];
    const maxTime = Math.ceil(scaleDuration);
    const stepCount = Math.ceil(maxTime / minorTickInterval);

    for (let i = 0; i <= stepCount; i++) {
      const t = Number((i * minorTickInterval).toFixed(2));
      if (t > maxTime + 0.01) break;

      const isMajor = Math.abs(t % labelInterval) < 0.001 || Math.abs((t % labelInterval) - labelInterval) < 0.001;
      const isWholeSecond = Math.abs(t % 1) < 0.001;

      let label: string | undefined = undefined;
      if (isMajor) {
        label = t.toString();
      }

      arr.push({
        x: t * pxPerSec,
        major: isMajor || isWholeSecond,
        label,
      });
    }
    return arr;
  }, [scaleDuration, minorTickInterval, labelInterval, pxPerSec]);

  const sceneStart = getSceneStartTime(activeSceneId);

  // User-controlled multi-track lanes (grouping by layer.trackIndex)
  const globalLanes = useMemo(() => {
    type GlobalLayerEntry = { layer: MGLayer; sceneId: string; sceneStart: number };
    const allLayerEntries: GlobalLayerEntry[] = [];
    scenes.forEach((scene) => {
      const sStart = getSceneStartTime(scene.id);
      scene.layers.forEach((layer) => {
        allLayerEntries.push({ layer, sceneId: scene.id, sceneStart: sStart });
      });
    });

    let maxTrack = 0;
    allLayerEntries.forEach((entry) => {
      const t = entry.layer.trackIndex ?? 0;
      if (t > maxTrack) maxTrack = t;
    });

    // Provide at least 2 tracks or (maxTrack + 2) so user has an intuitive empty lane below to drop into!
    const numLanes = Math.max(2, maxTrack + 2);
    const lanes: GlobalLayerEntry[][] = Array.from({ length: numLanes }, () => []);

    allLayerEntries.forEach((entry) => {
      const t = Math.max(0, entry.layer.trackIndex ?? 0);
      if (!lanes[t]) {
        lanes[t] = [];
      }
      lanes[t].push(entry);
    });

    return lanes;
  }, [scenes, getSceneStartTime]);



  return (
    <div 
      onPointerDown={(e) => {
        const target = e.target as HTMLElement;
        if (
          !target.closest('[data-layer-clip]') &&
          !target.closest('[data-scene-strip]') &&
          !target.closest('[data-ruler]') &&
          !target.closest('button, input, select, textarea, [data-interactive]')
        ) {
          if (selectedLayerId || (multiSelectedLayerIds && multiSelectedLayerIds.length > 0)) {
            dispatch({ selectedLayerId: null, multiSelectedLayerIds: [], playbackRange: null });
          }
        }
      }}
      style={{
        flex: '0 0 clamp(300px, 40vh, 600px)',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
      }}
    >
      {/* Progress row */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 24px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
        {/* Playback Controls Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '6px' }}>
          {/* Rewind 5s */}
          <button
            onClick={() => seekTo(currentTime - 5)}
            className="mg-btn-interactive"
            style={{
              width: '30px',
              height: '30px',
              background: '#FFFFFF',
              border: '1px solid rgba(15, 23, 42, 0.12)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.15s ease',
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FF9137';
              e.currentTarget.style.color = '#FF9137';
              e.currentTarget.style.background = 'rgba(255, 145, 55, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.12)';
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.background = '#FFFFFF';
            }}
            title="Rewind 5s"
          >
            <Rewind size={16} strokeWidth={2.2} />
          </button>

          {/* Hero Play / Pause */}
          <button
            onClick={() => isPlaying ? pause() : play()}
            className="mg-btn-interactive"
            style={{
              width: '34px',
              height: '34px',
              background: isPlaying ? '#0F172A' : '#FF9137',
              border: 'none',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
              boxShadow: isPlaying ? '0 2px 6px rgba(15, 23, 42, 0.2)' : '0 2px 8px rgba(255, 145, 55, 0.35)',
              transition: 'all 0.15s ease',
              padding: 0,
            }}
            onMouseEnter={(e) => {
              if (isPlaying) {
                e.currentTarget.style.background = '#1E293B';
              } else {
                e.currentTarget.style.background = '#E6791E';
                e.currentTarget.style.boxShadow = '0 3px 10px rgba(255, 145, 55, 0.5)';
              }
              e.currentTarget.style.transform = 'scale(1.04)';
            }}
            onMouseLeave={(e) => {
              if (isPlaying) {
                e.currentTarget.style.background = '#0F172A';
              } else {
                e.currentTarget.style.background = '#FF9137';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 145, 55, 0.35)';
              }
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          >
            {isPlaying ? (
              <Pause size={16} strokeWidth={2.5} fill="#FFFFFF" color="#FFFFFF" />
            ) : (
              <Play size={16} strokeWidth={2.5} fill="#0F172A" color="#0F172A" style={{ marginLeft: '2px' }} />
            )}
          </button>

          {/* Forward 5s */}
          <button
            onClick={() => seekTo(currentTime + 5)}
            className="mg-btn-interactive"
            style={{
              width: '30px',
              height: '30px',
              background: '#FFFFFF',
              border: '1px solid rgba(15, 23, 42, 0.12)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.15s ease',
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FF9137';
              e.currentTarget.style.color = '#FF9137';
              e.currentTarget.style.background = 'rgba(255, 145, 55, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.12)';
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.background = '#FFFFFF';
            }}
            title="Fast Forward 5s"
          >
            <FastForward size={16} strokeWidth={2.2} />
          </button>
        </div>

        {/* Timestamp Display Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: '#FFFFFF',
          border: '1px solid rgba(15, 23, 42, 0.1)',
          borderRadius: '8px',
          padding: '4px 10px',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          marginLeft: '4px',
          height: '30px',
        }}>
          <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '-0.02em' }}>
            {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
            {Math.floor(currentTime % 60).toString().padStart(2, '0')}:
            {Math.floor((currentTime % 1) * 100).toString().padStart(2, '0')}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 2px' }}>/</span>
          <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '-0.02em' }}>
            {Math.floor(totalDuration / 60).toString().padStart(2, '0')}:
            {Math.floor(totalDuration % 60).toString().padStart(2, '0')}:
            {Math.floor((totalDuration % 1) * 100).toString().padStart(2, '0')}
          </span>
        </div>
        {/* Scrubber */}
        <div
          style={{
            flex: 1,
            height: '6px',
            background: '#E2E8F0',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            borderRadius: '9999px',
            position: 'relative',
            cursor: 'pointer',
            marginLeft: '8px',
            overflow: 'hidden',
            touchAction: 'none',
          }}
          onPointerDown={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const time = Math.max(0, Math.min(totalDuration, ((e.clientX - r.left) / r.width) * totalDuration));
            seekTo(time);
            const targetEl = e.currentTarget;
            const handleMove = (moveEvent: PointerEvent) => {
              const moveR = targetEl.getBoundingClientRect();
              const moveTime = Math.max(0, Math.min(totalDuration, ((moveEvent.clientX - moveR.left) / moveR.width) * totalDuration));
              seekTo(moveTime);
            };
            const handleUp = () => {
              window.removeEventListener('pointermove', handleMove);
              window.removeEventListener('pointerup', handleUp);
            };
            window.addEventListener('pointermove', handleMove);
            window.addEventListener('pointerup', handleUp);
          }}
        >
          <div style={{
            width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%`,
            height: '100%',
            background: '#FF9137',
            borderRadius: '9999px',
          }} />
        </div>

        {/* Zoom Controller */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginLeft: '8px',
          flexShrink: 0,
          background: '#FFFFFF',
          border: '1px solid rgba(15, 23, 42, 0.1)',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          borderRadius: '8px',
          padding: '2px 8px',
        }}>
          <button
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, Number((z - 0.15).toFixed(2))))}
            className="mg-btn-interactive"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              padding: '4px',
              borderRadius: '4px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FF9137';
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
            title="Zoom out"
          >
            <Minus size={13} />
          </button>
          <div
            ref={zoomSliderRef}
            onPointerDown={handleZoomPointerDown}
            onWheel={(e) => {
              e.preventDefault();
              const delta = e.deltaY < 0 ? 0.08 : -0.08;
              setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((z + delta).toFixed(2)))));
            }}
            style={{
              width: '80px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'ew-resize',
              position: 'relative',
              touchAction: 'none',
              userSelect: 'none',
              padding: '0 2px',
            }}
            title={`Zoom: ${Math.round(zoomPercent)}%`}
          >
            <div style={{ width: '100%', height: '5px', background: '#E2E8F0', border: '1px solid rgba(15, 23, 42, 0.08)', borderRadius: '9999px', position: 'relative', overflow: 'hidden' }}>
              {/* Active bar */}
              <div style={{ position: 'absolute', left: 0, height: '100%', background: '#FF9137', borderRadius: '9999px', width: `${zoomPercent}%` }} />
            </div>
            {/* Thumb */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: `${zoomPercent}%`,
              transform: `translate(-50%, -50%) ${isDraggingZoom ? 'scale(1.2)' : 'scale(1)'}`,
              width: '13px',
              height: '13px',
              background: '#FF9137',
              border: '2px solid #FFFFFF',
              borderRadius: '50%',
              boxShadow: isDraggingZoom ? '0 2px 8px rgba(255, 145, 55, 0.6)' : '0 2px 6px rgba(255, 145, 55, 0.4)',
              pointerEvents: 'none',
              transition: isDraggingZoom ? 'none' : 'transform 0.1s ease',
            }} />
          </div>
          <button
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, Number((z + 0.15).toFixed(2))))}
            className="mg-btn-interactive"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              padding: '4px',
              borderRadius: '4px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FF9137';
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
            title="Zoom in"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Tracks container */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', position: 'relative', margin: '16px 24px', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-primary)' }}>
        {/* Scrollable tracks */}
        <div
          ref={trackAreaRef}
          onPointerDown={(e) => {
            const target = e.target as HTMLElement;
            if (
              !target.closest('[data-layer-clip]') &&
              !target.closest('[data-scene-strip]') &&
              !target.closest('[data-ruler]') &&
              !target.closest('[data-keyframe-node]') &&
              !target.closest('button, input, select, textarea')
            ) {
              dispatch({ selectedLayerId: null, multiSelectedLayerIds: [], playbackRange: null });
            }
          }}
          style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'auto', position: 'relative' }}
        >
          <div 
            style={{ position: 'relative', minWidth: `${timelineWidth}px`, minHeight: '100%' }}
          >
            {/* Scene Strip – locked top row (above ruler) */}
            <div data-scene-strip onPointerDown={(e) => e.stopPropagation()} style={{ position: 'relative', zIndex: 32, height: '30px', display: 'flex', alignItems: 'stretch', background: 'var(--bg-inset)' }}>
              {scenes.map((scene, idx) => {
                const sceneDur = getSceneDuration(scene, scenes.length);
                if (sceneDur <= 0) return null;
                const sStart = getSceneStartTime(scene.id);
                const width = sceneDur * pxPerSec;
                const isActive = scene.id === activeSceneId;
                const colorScheme = SCENE_COLORS[idx % SCENE_COLORS.length];

                return (
                  <div
                    key={scene.id}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const sceneDur = getSceneDuration(scene, scenes.length);
                      const sceneEnd = sStart + sceneDur;
                      dispatch({
                        activeSceneId: scene.id,
                        selectedLayerId: null,
                        multiSelectedLayerIds: [],
                        activeSidebarTab: 'scene',
                        playbackRange: { start: sStart, end: sceneEnd },
                      });
                      seekTo(sStart);
                      play();
                    }}
                    style={{
                      position: 'absolute',
                      left: `${sStart * pxPerSec}px`,
                      width: `${width}px`,
                      height: '100%',
                      background: isActive
                        ? `linear-gradient(135deg, ${colorScheme.bg}, ${colorScheme.bg}ee)`
                        : `linear-gradient(135deg, ${colorScheme.bg}dd, ${colorScheme.bg}bb)`,
                      borderBottom: isActive
                        ? `2px solid ${colorScheme.border}`
                        : '2px solid rgba(255, 255, 255, 0.12)',
                      borderRight: '1px solid rgba(255, 255, 255, 0.15)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      overflow: 'hidden',
                      transition: 'all 150ms ease',
                      boxShadow: isActive ? `inset 0 -1px 3px ${colorScheme.border}33` : 'none',
                      opacity: isActive ? 1 : 0.85,
                    }}
                    title={`${scene.name} (${sceneDur.toFixed(1)}s)`}
                  >
                    <Lock size={9} style={{ opacity: isActive ? 0.6 : 0.35, flexShrink: 0, color: colorScheme.text }} />
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: isActive ? 700 : 500,
                      color: colorScheme.text,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.01em',
                    }}>
                      {scene.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Ruler - supports click & drag to scrub */}
            {anySceneHasLayers && (
              <div
                data-ruler
                onPointerDown={(e) => {
                  e.stopPropagation();
                  pause();
                  seekTo(getTimeFromX(e.clientX));
                  setIsDraggingPlayhead(true);
                }}
                style={{
                  position: 'relative',
                  zIndex: 30,
                  height: '32px',
                  cursor: 'ew-resize',
                  touchAction: 'none',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '32px', background: 'var(--bg-inset)', borderBottom: '1px solid var(--border-color)', pointerEvents: 'none' }} />
                {ticks.map((tick, i) => (
                  <div key={i} style={{ position: 'absolute', top: '0px', left: `${tick.x}px`, pointerEvents: 'none', height: '100%' }}>
                    <div
                      style={{
                        width: '1px',
                        height: tick.label ? '14px' : (tick.major ? '9px' : '6px'),
                        background: tick.label
                          ? 'rgba(15, 23, 42, 0.5)'
                          : (tick.major ? 'rgba(15, 23, 42, 0.3)' : 'rgba(15, 23, 42, 0.18)'),
                      }}
                    />
                    {tick.label && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '14px',
                          left: '4px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-mono, monospace)',
                          whiteSpace: 'nowrap',
                          userSelect: 'none',
                          lineHeight: 1,
                        }}
                      >
                        {tick.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Playhead - supports click & drag to scrub */}
            {anySceneHasLayers && (
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  pause();
                  setIsDraggingPlayhead(true);
                }}
                style={{
                  position: 'absolute',
                  top: '30px',
                  bottom: 0,
                  left: `${currentTime * pxPerSec}px`,
                  width: '24px',
                  transform: 'translateX(-50%)',
                  zIndex: 40,
                  cursor: 'ew-resize',
                  touchAction: 'none',
                }}
                title={`Current time: ${currentTime.toFixed(2)}s (Drag to scrub)`}
              >
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '2px', height: '100%', background: 'var(--accent-primary)', opacity: 0.85, pointerEvents: 'none' }} />
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: 0,
                  width: '10px',
                  height: '12px',
                  background: 'var(--accent-primary)',
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                }} />
              </div>
            )}

            {anySceneHasLayers && snapGuide && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '62px',
                  bottom: 0,
                  left: `${(sceneStart + snapGuide.time) * pxPerSec}px`,
                  width: '1px',
                  transform: 'translateX(-50%)',
                  background: snapGuide.kind === 'scene-start' ? '#ec4899' : '#3b82f6',
                  boxShadow: `0 0 6px ${snapGuide.kind === 'scene-start' ? 'rgba(236, 72, 153, 0.7)' : 'rgba(59, 130, 246, 0.7)'}`,
                  zIndex: 35,
                  pointerEvents: 'none',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: '50%', width: '6px', height: '6px', borderRadius: '50%', transform: 'translate(-50%, -50%)', background: 'inherit', boxShadow: 'inherit' }} />
              </div>
            )}

            {/* Layers */}
            <div style={{ paddingTop: 0, paddingBottom: '8px' }}>
              {globalLanes.map((lane, laneIdx) => (
                <div key={laneIdx} style={{ position: 'relative', height: '42px' }}>
                  {lane.map((entry) => {
                    const { layer, sceneId, sceneStart: layerSceneStart } = entry;
                    const isSelected = selectedLayerId === layer.id || multiSelectedLayerIds.includes(layer.id);
                    const isFromActiveScene = sceneId === activeSceneId;
                    const left = (layerSceneStart + layer.startTime) * pxPerSec;
                    const width = layer.duration * pxPerSec;
                    const label = layer.name !== undefined
                      ? layer.name
                      : layer.type === 'text'
                      ? ((layer as any).text.substring(0, 15) || 'Text')
                      : layer.templateId === 'phone-device'
                      ? ((layer as any).props?.deviceType === 'iphone' ? 'iPhone' : (layer as any).props?.deviceType === 'android' ? 'Android' : 'Phone')
                      : COMPONENT_TEMPLATES.find((t) => t.id === layer.templateId)?.name || layer.templateId;
                    const sceneIdx = scenes.findIndex((s) => s.id === sceneId);
                    const safeSceneIdx = sceneIdx >= 0 ? sceneIdx : 0;
                    const colorScheme = SCENE_COLORS[safeSceneIdx % SCENE_COLORS.length];

                    return (
                      <div
                        key={layer.id}
                        data-layer-clip
                        onClick={(e) => {
                          e.stopPropagation();
                          if (e.ctrlKey) return; // Handled in onPointerDown
                          if (draggedRef.current) return; // Was dragging, not a pure click

                          // Pure click without modifier -> become sole selection
                          if (multiSelectedLayerIds.length > 0 || selectedLayerId !== layer.id) {
                            dispatch({
                              activeSceneId: sceneId,
                              selectedLayerId: layer.id,
                              multiSelectedLayerIds: [],
                              activeSidebarTab: 'components',
                            });
                          }
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          const compStart = layerSceneStart + layer.startTime;
                          const compEnd = compStart + layer.duration;
                          dispatch({
                            activeSceneId: sceneId,
                            selectedLayerId: layer.id,
                            multiSelectedLayerIds: [],
                            activeSidebarTab: 'components',
                            playbackRange: { start: compStart, end: compEnd },
                          });
                          seekTo(compStart);
                          play();
                        }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          draggedRef.current = false;
                          
                          let currentMulti = multiSelectedLayerIds;
                          let currentPrimary = selectedLayerId;
                          const isCurrentlySelected = currentPrimary === layer.id || currentMulti.includes(layer.id);
                          
                          if (e.ctrlKey) {
                            if (isCurrentlySelected) {
                              if (currentPrimary === layer.id) {
                                currentPrimary = null;
                                if (currentMulti.length > 0) {
                                  currentPrimary = currentMulti[0];
                                  currentMulti = currentMulti.slice(1);
                                }
                              } else {
                                currentMulti = currentMulti.filter(id => id !== layer.id);
                              }
                            } else {
                              currentMulti = [...currentMulti, layer.id];
                              if (!currentPrimary) {
                                currentPrimary = layer.id;
                                currentMulti = currentMulti.filter(id => id !== layer.id);
                              }
                            }
                            dispatch({ selectedLayerId: currentPrimary, multiSelectedLayerIds: currentMulti });
                          } else {
                            if (!isCurrentlySelected) {
                              currentPrimary = layer.id;
                              currentMulti = [];
                              dispatch({
                                activeSceneId: sceneId,
                                selectedLayerId: currentPrimary,
                                multiSelectedLayerIds: currentMulti,
                                activeSidebarTab: 'components',
                              });
                            }
                          }
                          
                          pushUndo();
                          
                          const dragIds = [currentPrimary, ...currentMulti].filter(Boolean) as string[];
                          let layersToDrag = scenes.flatMap(s => s.layers).filter(l => dragIds.includes(l.id)).map(l => ({
                            id: l.id,
                            sceneId: scenes.find(s => s.layers.some(sl => sl.id === l.id))?.id || '',
                            startTime: l.startTime,
                            startDuration: l.duration,
                            startTrackIndex: l.trackIndex ?? 0,
                          }));
                          
                          if (dragIds.includes(layer.id)) {
                            setDraggingLayers({
                              type: 'move',
                              startX: e.clientX,
                              startY: e.clientY,
                              layers: layersToDrag,
                            });
                          }
                        }}
                        style={{
                          position: 'absolute', left: `${left}px`, width: `${width}px`, height: '34px', top: '4px',
                          background: isSelected
                            ? '#70FFD2'
                            : `linear-gradient(to bottom, ${colorScheme.bg}, #0f172a)`,
                          border: isSelected ? '2px solid #38E4AE' : `1px solid ${isFromActiveScene ? colorScheme.border + '80' : colorScheme.border + '40'}`,
                          borderRadius: '8px', cursor: 'grab',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden', transition: 'border-color 75ms, opacity 150ms, box-shadow 150ms',
                          opacity: isFromActiveScene ? 1 : 0.85,
                          boxShadow: isSelected
                            ? '0 0 0 1px rgba(112, 255, 210, 0.6), 0 3px 12px rgba(112, 255, 210, 0.35)'
                            : (isFromActiveScene ? `0 2px 6px ${colorScheme.bg}66` : '0 1px 3px rgba(0,0,0,0.15)'),
                        }}
                      >
                        {/* Left cap handle */}
                        <div
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            dispatch({ activeSceneId: sceneId });
                            pushUndo();
                            setDraggingLayers({
                              type: 'resize-left',
                              startX: e.clientX,
                              startY: e.clientY,
                              layers: [{
                                id: layer.id,
                                sceneId,
                                startTime: layer.startTime,
                                startDuration: layer.duration,
                                startTrackIndex: layer.trackIndex ?? 0,
                              }],
                            });
                          }}
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '14px',
                            height: '100%',
                            cursor: 'col-resize',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isSelected ? '#4AE3B5' : 'rgba(255,255,255,0.06)',
                            borderRight: isSelected ? '1px solid rgba(15,23,42,0.15)' : 'none',
                            borderRadius: '6px 0 0 6px',
                            zIndex: 10,
                          }}
                          title="Drag to trim left"
                        >
                          <div style={{ width: '3px', height: '14px', background: isSelected ? '#0F172A' : '#ffffff', borderRadius: '9999px', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                        </div>

                        {/* Label */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '11px',
                          color: isSelected ? '#0F172A' : '#ffffff',
                          fontWeight: 700,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                          padding: '0 18px',
                          userSelect: 'none',
                        }}>
                          {layer.type === 'text' && <span style={{ fontFamily: 'serif', fontSize: '13px', fontWeight: 800, opacity: 0.9 }}>T</span>}
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {label}
                          </span>
                        </div>

                        {/* Keyframe Diamond Markers */}
                        {layer.keyframes && layer.keyframes.length > 0 && (
                          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                            {layer.keyframes.map((kf) => {
                              const kfPct = (kf.time / Math.max(0.1, layer.duration)) * 100;
                              return (
                                <div
                                  key={kf.id}
                                  title={`${kf.property}: ${kf.value} (${kf.easing}) @ ${kf.time.toFixed(2)}s`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch({ activeSceneId: sceneId, selectedLayerId: layer.id, activeSidebarTab: 'components' });
                                    seekTo(layerSceneStart + layer.startTime + kf.time);
                                  }}
                                  onPointerDown={(e) => {
                                    e.stopPropagation();
                                    dispatch({ activeSceneId: sceneId, selectedLayerId: layer.id, activeSidebarTab: 'components' });
                                    seekTo(layerSceneStart + layer.startTime + kf.time);
                                    setDraggingKeyframe({
                                      layerId: layer.id,
                                      keyframeId: kf.id,
                                      startX: e.clientX,
                                      startTime: kf.time,
                                      layerDuration: layer.duration,
                                      layerSceneStart,
                                      layerStartTime: layer.startTime,
                                    });
                                  }}
                                  style={{
                                    position: 'absolute',
                                    left: `${kfPct}%`,
                                    top: '50%',
                                    width: '8px',
                                    height: '8px',
                                    background: '#FFFFFF',
                                    border: '1.5px solid #000000',
                                    transform: 'translate(-50%, -50%) rotate(45deg)',
                                    cursor: 'ew-resize',
                                    pointerEvents: 'auto',
                                    zIndex: 25,
                                    boxShadow: '0 0 4px rgba(0,0,0,0.8)',
                                  }}
                                />
                              );
                            })}
                          </div>
                        )}

                        {/* Right cap handle */}
                        <div
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            dispatch({ activeSceneId: sceneId });
                            pushUndo();
                            setDraggingLayers({
                              type: 'resize-right',
                              startX: e.clientX,
                              startY: e.clientY,
                              layers: [{
                                id: layer.id,
                                sceneId,
                                startTime: layer.startTime,
                                startDuration: layer.duration,
                                startTrackIndex: layer.trackIndex ?? 0,
                              }],
                            });
                          }}
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            width: '14px',
                            height: '100%',
                            cursor: 'col-resize',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isSelected ? '#4AE3B5' : 'rgba(255,255,255,0.06)',
                            borderLeft: isSelected ? '1px solid rgba(15,23,42,0.15)' : 'none',
                            borderRadius: '0 6px 6px 0',
                            zIndex: 10,
                          }}
                          title="Drag to trim right"
                        >
                          <div style={{ width: '3px', height: '14px', background: isSelected ? '#0F172A' : '#ffffff', borderRadius: '9999px', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Empty State Centered CTA in the Video Timeline Panel (No glow) */}
        {!anySceneHasLayers && (
          <div
            style={{
              position: 'absolute',
              top: '30px',
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 30,
              pointerEvents: 'none',
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (scenes.length === 0) {
                  addScene();
                }
                dispatch({ isPickerOpen: true, activeSidebarTab: 'components' });
              }}
              style={{
                pointerEvents: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '8px',
                background: '#FF9137',
                color: '#0F172A',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: 'none',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E6791E';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FF9137';
              }}
            >
              <Plus size={16} strokeWidth={2.5} color="#0F172A" />
              <span>Add Component</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
