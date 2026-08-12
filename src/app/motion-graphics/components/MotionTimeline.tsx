'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Plus, Trash2, Undo2, Redo2, RotateCcw, Minus, Lock, Rewind, FastForward } from 'lucide-react';
import { useMGState, getSceneDuration, type MGLayer } from '../store';

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

export default function MotionTimeline() {
  const { state, dispatch, play, pause, seekTo, updateLayer, removeLayer, resetSelectedComponent, totalDuration, getSceneStartTime, undo, redo, canUndo, canRedo, pushUndo } = useMGState();
  const { scenes, currentTime, isPlaying, selectedLayerId, activeSceneId, activeSidebarTab } = state;
  const activeScene = scenes.find((s) => s.id === activeSceneId);
  const layers = activeScene?.layers || [];
  const hasLayers = layers.length > 0;
  const layersRef = useRef(layers);
  layersRef.current = layers;

  // Check if ANY scene has layers (for showing the timeline area)
  const anySceneHasLayers = scenes.some((s) => s.layers.length > 0);

  const trackAreaRef = useRef<HTMLDivElement>(null);
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 1.8;
  const [zoom, setZoom] = useState(0.68); // Default at 30%
  const [trackViewportWidth, setTrackViewportWidth] = useState(900);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [draggingLayer, setDraggingLayer] = useState<{ id: string; sceneId: string; type: 'move' | 'resize-left' | 'resize-right'; startX: number; startTime: number; startDuration: number } | null>(null);
  const [snapGuide, setSnapGuide] = useState<{ time: number; kind: 'scene-start' | 'layer-edge' } | null>(null);

  const pxPerSec = 62 * zoom;
  const minimumScaleWidth = Math.max(900, trackViewportWidth);
  const scaleDuration = Math.max(totalDuration, Math.ceil(minimumScaleWidth / pxPerSec));

  const zoomPercent = Math.min(100, Math.max(0, ((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100));

  const handleZoomSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newZoom = Number((MIN_ZOOM + ratio * (MAX_ZOOM - MIN_ZOOM)).toFixed(2));
    setZoom(newZoom);
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
    const handleMove = (e: PointerEvent) => seekTo(getTimeFromX(e.clientX));
    const handleUp = () => setIsDraggingPlayhead(false);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => { window.removeEventListener('pointermove', handleMove); window.removeEventListener('pointerup', handleUp); };
  }, [isDraggingPlayhead, getTimeFromX, seekTo]);

  useEffect(() => {
    if (!draggingLayer) return;
    const handleMove = (e: PointerEvent) => {
      const dt = (e.clientX - draggingLayer.startX) / pxPerSec;
      const snapThreshold = 8 / pxPerSec;
      // Snap candidates use layers from the dragging layer's scene
      const dragScene = scenes.find((s) => s.id === draggingLayer.sceneId);
      const dragSceneLayers = dragScene?.layers || [];
      const candidates = [
        { time: 0, kind: 'scene-start' as const },
        ...dragSceneLayers
          .filter((layer) => layer.id !== draggingLayer.id)
          .flatMap((layer) => [
            { time: layer.startTime, kind: 'layer-edge' as const },
            { time: layer.startTime + layer.duration, kind: 'layer-edge' as const },
          ]),
      ];
      const resolveSnap = (edges: { value: number; update: (target: number) => { startTime: number; duration: number } }[]) => {
        let closest: { time: number; kind: 'scene-start' | 'layer-edge'; update: { startTime: number; duration: number }; distance: number } | null = null;
        for (const candidate of candidates) {
          for (const edge of edges) {
            const update = edge.update(candidate.time);
            const distance = Math.abs(edge.value - candidate.time);
            if (update.startTime < 0 || update.duration < 0.5 || distance > snapThreshold || (closest && distance >= closest.distance)) continue;
            closest = { ...candidate, update, distance };
          }
        }
        return closest;
      };

      if (draggingLayer.type === 'move') {
        const startTime = Math.max(0, draggingLayer.startTime + dt);
        const snap = resolveSnap([
          { value: startTime, update: (target) => ({ startTime: target, duration: draggingLayer.startDuration }) },
          { value: startTime + draggingLayer.startDuration, update: (target) => ({ startTime: target - draggingLayer.startDuration, duration: draggingLayer.startDuration }) },
        ]);
        setSnapGuide(snap ? { time: snap.time, kind: snap.kind } : null);
        updateLayer(draggingLayer.id, snap?.update ?? { startTime, duration: draggingLayer.startDuration });
      } else if (draggingLayer.type === 'resize-right') {
        const duration = Math.max(0.5, draggingLayer.startDuration + dt);
        const snap = resolveSnap([
          { value: draggingLayer.startTime + duration, update: (target) => ({ startTime: draggingLayer.startTime, duration: target - draggingLayer.startTime }) },
        ]);
        setSnapGuide(snap ? { time: snap.time, kind: snap.kind } : null);
        updateLayer(draggingLayer.id, snap?.update ?? { startTime: draggingLayer.startTime, duration });
      } else {
        const endTime = draggingLayer.startTime + draggingLayer.startDuration;
        const startTime = Math.min(Math.max(0, draggingLayer.startTime + dt), endTime - 0.5);
        const duration = endTime - startTime;
        const snap = resolveSnap([
          { value: startTime, update: (target) => ({ startTime: target, duration: endTime - target }) },
        ]);
        setSnapGuide(snap ? { time: snap.time, kind: snap.kind } : null);
        updateLayer(draggingLayer.id, snap?.update ?? { startTime, duration });
      }
    };
    const handleUp = () => {
      setDraggingLayer(null);
      setSnapGuide(null);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      setSnapGuide(null);
    };
  }, [draggingLayer, pxPerSec, updateLayer, scenes]);

  // Ruler ticks
  const tickSpacing = pxPerSec; // 1 tick per second at current zoom
  const majorEvery = 5;
  const ticks: { x: number; major: boolean; label?: string }[] = [];
  for (let t = 0; t <= Math.ceil(scaleDuration); t++) {
    const isMajor = t % majorEvery === 0;
    ticks.push({
      x: t * pxPerSec,
      major: isMajor,
      label: isMajor ? `${Math.floor(t / 60).toString().padStart(2, '0')}:${(t % 60).toString().padStart(2, '0')}` : undefined,
    });
  }

  // Lane packing for ALL scenes
  const sceneStart = getSceneStartTime(activeSceneId);
  // Build global lanes from all scenes
  type GlobalLayerEntry = { layer: MGLayer; sceneId: string; sceneStart: number };
  const allLayerEntries: GlobalLayerEntry[] = [];
  scenes.forEach((scene) => {
    const sStart = getSceneStartTime(scene.id);
    scene.layers.forEach((layer) => {
      allLayerEntries.push({ layer, sceneId: scene.id, sceneStart: sStart });
    });
  });

  const globalLanes: GlobalLayerEntry[][] = [];
  allLayerEntries.forEach((entry) => {
    const s = entry.sceneStart + entry.layer.startTime;
    const e = s + entry.layer.duration;
    let placed = false;
    for (const lane of globalLanes) {
      if (!lane.some((l) => {
        const ls = l.sceneStart + l.layer.startTime;
        const le = ls + l.layer.duration;
        return s < le && e > ls;
      })) {
        lane.push(entry);
        placed = true;
        break;
      }
    }
    if (!placed) globalLanes.push([entry]);
  });

  const btnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
    background: 'var(--bg-input)', border: '1px solid var(--border-color)',
    borderRadius: '8px', fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)',
    cursor: 'pointer', whiteSpace: 'nowrap',
  };
  const iconBtnStyle: React.CSSProperties = { ...btnStyle, padding: '6px 10px' };

  return (
    <div style={{
      flex: '0 0 clamp(260px, 34vh, 420px)',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      userSelect: 'none',
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
    }}>
      {/* Progress row */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
        <button onClick={() => seekTo(currentTime - 5)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', color: 'var(--text-muted)' }} title="-5s">
          <Rewind size={16} />
        </button>
        <button onClick={() => isPlaying ? pause() : play()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }} title={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--text-primary)"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--text-primary)"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        <button onClick={() => seekTo(currentTime + 5)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', color: 'var(--text-muted)' }} title="+5s">
          <FastForward size={16} />
        </button>

        <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 600 }}>
          {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
          {Math.floor(currentTime % 60).toString().padStart(2, '0')}:
          {Math.floor((currentTime % 1) * 100).toString().padStart(2, '0')}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 4px' }}>/</span>
        <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
          {Math.floor(totalDuration / 60).toString().padStart(2, '0')}:
          {Math.floor(totalDuration % 60).toString().padStart(2, '0')}:
          {Math.floor((totalDuration % 1) * 100).toString().padStart(2, '0')}
        </span>
        {/* Scrubber */}
        <div style={{ flex: 1, height: '5px', background: 'var(--bg-inset)', borderRadius: '3px', position: 'relative', cursor: 'pointer', marginLeft: '8px' }}
          onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seekTo(((e.clientX - r.left) / r.width) * totalDuration); }}>
          <div style={{ width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '3px' }} />
        </div>
      </div>

      {/* Toolbar row with horizontal scroll view */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 24px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollbarWidth: 'thin',
        WebkitOverflowScrolling: 'touch',
      }}>
        <button
          onClick={() => dispatch({ isPickerOpen: true, activeSidebarTab: 'components' })}
          style={{ ...btnStyle, borderRadius: '8px' }}
          title="Add a component"
        >
          <Plus size={14} style={{ opacity: 0.8 }} /> Add a component
        </button>

        <button
          className="delete-btn-hover"
          style={{ ...iconBtnStyle, marginRight: '4px' }}
          title="Delete component"
          onClick={() => { if (selectedLayerId) removeLayer(selectedLayerId); }}
          disabled={!selectedLayerId}
        >
          <Trash2 size={14} />
        </button>

        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <button style={iconBtnStyle} title="Undo (Ctrl+Z)" disabled={!canUndo} onClick={undo}><Undo2 size={14} /></button>
          <button style={iconBtnStyle} title="Redo (Ctrl+Y)" disabled={!canRedo} onClick={redo}><Redo2 size={14} /></button>
          <button
            style={btnStyle}
            title="Reset selected component properties (or all components in scene)"
            onClick={resetSelectedComponent}
          >
            <RotateCcw size={14} style={{ opacity: 0.65 }} /> Reset Component
          </button>
        </div>

        {/* Zoom Controller */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginLeft: 'auto',
          flexShrink: 0,
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '2px 8px',
        }}>
          <button
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, Number((z - 0.15).toFixed(2))))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)', padding: '2px' }}
            title="Zoom out"
          >
            <Minus size={13} />
          </button>
          <div
            onClick={handleZoomSliderClick}
            style={{ width: '70px', height: '14px', display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
            title={`Zoom: ${Math.round(zoomPercent)}%`}
          >
            <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
              {/* Active bar */}
              <div style={{ position: 'absolute', left: 0, height: '100%', background: 'var(--accent-primary)', borderRadius: '3px', width: `${zoomPercent}%` }} />
            </div>
            {/* Thumb */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: `${zoomPercent}%`,
              transform: 'translate(-50%, -50%)',
              width: '12px',
              height: '12px',
              background: 'var(--bg-primary)',
              border: '2px solid var(--accent-primary)',
              borderRadius: '50%',
              boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
              pointerEvents: 'none',
            }} />
          </div>
          <button
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, Number((z + 0.15).toFixed(2))))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)', padding: '2px' }}
            title="Zoom in"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Tracks container */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', margin: '0 24px 16px', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-primary)' }}>
        {/* Scrollable tracks */}
        <div ref={trackAreaRef} onPointerDown={(e) => { if (e.target === e.currentTarget || !(e.target as HTMLElement).closest('[data-layer-clip]')) { dispatch({ selectedLayerId: null, activeSidebarTab: 'components', playbackRange: null }); } }} style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'auto', position: 'relative' }}>
          <div style={{ position: 'relative', minWidth: `${timelineWidth}px`, minHeight: '100%' }}>
            {/* Scene Strip – locked top row (above ruler) */}
            <div style={{ position: 'sticky', top: 0, zIndex: 32, height: '30px', display: 'flex', alignItems: 'stretch', background: 'var(--bg-inset)' }}>
              {scenes.map((scene, idx) => {
                const sceneDur = getSceneDuration(scene);
                if (sceneDur <= 0) return null;
                const sStart = getSceneStartTime(scene.id);
                const width = sceneDur * pxPerSec;
                const isActive = scene.id === activeSceneId;
                const colorScheme = SCENE_COLORS[idx % SCENE_COLORS.length];

                return (
                  <div
                    key={scene.id}
                    onClick={() => {
                      dispatch({ activeSceneId: scene.id, selectedLayerId: null, activeSidebarTab: 'scene' });
                      seekTo(sStart);
                    }}
                    style={{
                      position: 'absolute',
                      left: `${sStart * pxPerSec}px`,
                      width: `${width}px`,
                      height: '100%',
                      background: isActive
                        ? `linear-gradient(135deg, ${colorScheme.bg}, ${colorScheme.bg}ee)`
                        : `var(--bg-inset)`,
                      borderBottom: isActive
                        ? `2px solid ${colorScheme.border}`
                        : '2px solid var(--border-color)',
                      borderRight: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      overflow: 'hidden',
                      transition: 'background 150ms, border-color 150ms',
                      boxShadow: isActive ? `inset 0 -1px 3px ${colorScheme.border}33` : 'none',
                    }}
                    title={`${scene.name} (${sceneDur.toFixed(1)}s)`}
                  >
                    <Lock size={9} style={{ opacity: 0.35, flexShrink: 0 }} />
                    <span style={{
                      fontSize: '10px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? colorScheme.text : '#94a3b8',
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

            {/* Ruler */}
            {anySceneHasLayers && (
              <div style={{ position: 'sticky', top: '30px', zIndex: 30, pointerEvents: 'none', height: '32px' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '32px', background: 'var(--bg-inset)', borderBottom: '1px solid var(--border-color)' }} />
                {ticks.map((tick, i) => (
                  <div key={i} style={{ position: 'absolute', top: '6px', left: `${tick.x}px` }}>
                    <div style={{ width: '1px', height: tick.major ? '16px' : '8px', background: tick.major ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)' }} />
                    {tick.label && (
                      <span style={{ position: 'absolute', top: '100%', left: '4px', fontSize: '9px', fontWeight: 500, color: 'var(--text-muted)', transform: 'translateY(-50%) scale(0.9)', transformOrigin: 'left', whiteSpace: 'nowrap' }}>
                        {tick.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Playhead */}
            {anySceneHasLayers && (selectedLayerId !== null || activeSidebarTab === 'scene' || isPlaying || isDraggingPlayhead) && (
              <div
                onPointerDown={(e) => { e.stopPropagation(); setIsDraggingPlayhead(true); }}
                style={{ position: 'absolute', top: 0, left: `${currentTime * pxPerSec}px`, width: '24px', height: '100%', transform: 'translateX(-50%)', zIndex: 40, cursor: 'ew-resize', touchAction: 'none' }}
              >
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '2px', height: '100%', background: 'var(--accent-primary)', opacity: 0.8 }} />
                <div style={{ position: 'relative', left: '50%', transform: 'translateX(-50%) rotate(180deg)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '8px solid var(--accent-primary)' }} />
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
                    const isSelected = selectedLayerId === layer.id;
                    const isFromActiveScene = sceneId === activeSceneId;
                    const left = (layerSceneStart + layer.startTime) * pxPerSec;
                    const width = layer.duration * pxPerSec;
                    const label = layer.type === 'text' ? (layer as any).text : layer.templateId;
                    const sceneIdx = scenes.findIndex((s) => s.id === sceneId);
                    const colorScheme = SCENE_COLORS[sceneIdx % SCENE_COLORS.length];

                    return (
                      <div
                        key={layer.id}
                        data-layer-clip
                        onClick={() => {
                          // Switch to this layer's scene if not already active and show components tab
                          dispatch({
                            activeSceneId: sceneId,
                            selectedLayerId: layer.id,
                            activeSidebarTab: 'components',
                            playbackRange: { start: layerSceneStart + layer.startTime, end: layerSceneStart + layer.startTime + layer.duration },
                          });
                          seekTo(layerSceneStart + layer.startTime);
                        }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          dispatch({
                            activeSceneId: sceneId,
                          });
                          seekTo(layerSceneStart + layer.startTime);
                          pushUndo();
                          setDraggingLayer({ id: layer.id, sceneId, type: 'move', startX: e.clientX, startTime: layer.startTime, startDuration: layer.duration });
                        }}
                        style={{
                          position: 'absolute', left: `${left}px`, width: `${width}px`, height: '34px', top: '4px',
                          background: isFromActiveScene
                            ? `linear-gradient(to bottom, ${colorScheme.bg}, #0f172a)`
                            : 'var(--bg-input)',
                          border: isSelected ? '2px solid var(--accent-primary)' : `1px solid ${isFromActiveScene ? colorScheme.border + '60' : 'var(--border-color)'}`,
                          borderBottom: isSelected ? '2px solid var(--accent-primary)' : `3px solid ${isFromActiveScene ? colorScheme.border + '40' : 'var(--border-color)'}`,
                          borderRadius: '8px', cursor: 'grab',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden', transition: 'border-color 75ms, opacity 150ms',
                          opacity: isFromActiveScene ? 1 : 0.5,
                        }}
                      >
                        {/* Left cap */}
                        <div
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            dispatch({ activeSceneId: sceneId });
                            pushUndo();
                            setDraggingLayer({ id: layer.id, sceneId, type: 'resize-left', startX: e.clientX, startTime: layer.startTime, startDuration: layer.duration });
                          }}
                          style={{ position: 'absolute', left: 0, top: 0, width: '10px', height: '100%', cursor: 'ew-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px 0 0 8px' }}
                        >
                          <div style={{ width: '2px', height: '14px', background: 'rgba(255,255,255,0.2)', borderRadius: '1px' }} />
                        </div>

                        {/* Label */}
                        <span style={{ fontSize: '11px', color: isFromActiveScene ? '#f8fafc' : 'var(--text-muted)', fontWeight: 600, opacity: 0.9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pointerEvents: 'none', padding: '0 14px' }}>
                          {label}
                        </span>

                        {/* Right cap */}
                        <div
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            dispatch({ activeSceneId: sceneId });
                            pushUndo();
                            setDraggingLayer({ id: layer.id, sceneId, type: 'resize-right', startX: e.clientX, startTime: layer.startTime, startDuration: layer.duration });
                          }}
                          style={{ position: 'absolute', right: 0, top: 0, width: '10px', height: '100%', cursor: 'ew-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0 8px 8px 0' }}
                        >
                          <div style={{ width: '2px', height: '14px', background: 'rgba(0,0,0,0.15)', borderRadius: '1px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
