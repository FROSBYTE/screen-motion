'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Type, Layers, Film, ChevronRight, Box, GripVertical, Play } from 'lucide-react';
import { useMGState, MGTextAnimationType, SceneTransition, MGTextLayer, MGComponentLayer, MGLayer, getSceneDuration } from '../store';
import { COMPONENT_TEMPLATES } from './templates';
import { Reorder } from 'motion/react';
import ListItemEditor from './ListItemEditor';
import CustomDropdown from './CustomDropdown';
import ComponentPicker from './ComponentPicker';
import ColorPickerControl from './ColorPickerControl';
import { TEMPLATES } from '@/types';

export function applyVideoFileToLayer(
  file: File,
  updateFn: (updates: { duration?: number; props: any }) => void,
  currentProps: any
) {
  const url = URL.createObjectURL(file);
  const tempVideo = document.createElement('video');
  tempVideo.preload = 'metadata';
  tempVideo.onloadedmetadata = () => {
    const dur = tempVideo.duration;
    const vw = tempVideo.videoWidth;
    const vh = tempVideo.videoHeight;
    const updates: any = { props: { ...currentProps, src: url } };
    if (dur && isFinite(dur) && dur > 0) {
      updates.duration = Math.round(dur * 10) / 10;
    }
    if (vw > 0 && vh > 0) {
      const baseWidth = currentProps.width || 360;
      const calcHeight = Math.round((vh / vw) * baseWidth);
      updates.props.width = baseWidth;
      updates.props.height = calcHeight;
    }
    updateFn(updates);
  };
  tempVideo.onerror = () => {
    updateFn({ props: { ...currentProps, src: url } });
  };
  tempVideo.src = url;
}

export function applyImageFileToLayer(
  file: File,
  updateFn: (updates: { props: any }) => void,
  currentProps: any
) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (nw > 0 && nh > 0) {
      const baseWidth = currentProps.width || 360;
      const calcHeight = Math.round((nh / nw) * baseWidth);
      updateFn({
        props: {
          ...currentProps,
          src: url,
          width: baseWidth,
          height: calcHeight,
        },
      });
    } else {
      updateFn({ props: { ...currentProps, src: url } });
    }
  };
  img.onerror = () => {
    updateFn({ props: { ...currentProps, src: url } });
  };
  img.src = url;
}
const DEFAULT_LOGO_LOOP_ITEMS: { type: string; value: string }[] = [
  { type: 'text', value: 'React' },
  { type: 'text', value: 'Next.js' },
  { type: 'text', value: 'TypeScript' },
  { type: 'text', value: 'Tailwind' },
  { type: 'text', value: 'Vercel' },
  { type: 'text', value: 'Docker' },
];

const DEFAULT_BUBBLE_ITEMS: { label: string; color: string; imageUrl?: string }[] = [
  { label: 'Home', color: '#6366f1' },
  { label: 'About', color: '#8b5cf6' },
  { label: 'Work', color: '#a855f7' },
  { label: 'Blog', color: '#d946ef' },
  { label: 'Contact', color: '#ec4899' },
];

const DEFAULT_FOLDER_ITEMS: { text: string; bgColor: string; textColor: string }[] = [
  { text: 'Doc 1', bgColor: '#ffffff', textColor: '#333333' },
  { text: 'Doc 2', bgColor: '#ffffff', textColor: '#333333' },
  { text: 'Doc 3', bgColor: '#ffffff', textColor: '#333333' },
];

const DEFAULT_NOTIFICATION_ITEMS: { title: string; description: string; bgColor: string; titleColor: string; descriptionColor: string; accentColor: string }[] = [
  { title: 'New notification', description: 'You have a new message', bgColor: 'rgba(255,255,255,0.05)', titleColor: '#ffffff', descriptionColor: 'rgba(255,255,255,0.5)', accentColor: '#6366f1' },
  { title: 'Payment received', description: '$250.00 from client', bgColor: 'rgba(255,255,255,0.05)', titleColor: '#ffffff', descriptionColor: 'rgba(255,255,255,0.5)', accentColor: '#6366f1' },
  { title: 'Task completed', description: 'Design review finished', bgColor: 'rgba(255,255,255,0.05)', titleColor: '#ffffff', descriptionColor: 'rgba(255,255,255,0.5)', accentColor: '#6366f1' },
];

const DEFAULT_WORD_ROTATE_ITEMS: { text: string; isBold: boolean; isItalic: boolean; fontFamily: string }[] = [
  { text: 'Innovative', isBold: true, isItalic: false, fontFamily: '"Plus Jakarta Sans", sans-serif' },
  { text: 'Creative', isBold: true, isItalic: false, fontFamily: '"Plus Jakarta Sans", sans-serif' },
  { text: 'Powerful', isBold: true, isItalic: false, fontFamily: '"Plus Jakarta Sans", sans-serif' },
  { text: 'Beautiful', isBold: true, isItalic: false, fontFamily: '"Plus Jakarta Sans", sans-serif' },
];

const ANIMATION_OPTIONS: { id: MGTextAnimationType; label: string }[] = [
  { id: 'none', label: 'None (Static)' },
  { id: 'bottom-up-letters', label: 'Bottom Up Letters' },
  { id: 'kinetic-center-build', label: 'Kinetic Center Build' },
  { id: 'line-by-line-slide', label: 'Line By Line Slide' },
  { id: 'mask-reveal-up', label: 'Mask Reveal Up' },
  { id: 'reveal-text', label: 'Reveal Text' },
  { id: 'short-slide-down', label: 'Short Slide Down' },
  { id: 'blur-out-up', label: 'Blur Out Up' },
  { id: 'depth-parallax-words', label: 'Depth Parallax Words' },
  { id: 'fade-through', label: 'Fade Through' },
  { id: 'focus-blur-resolve', label: 'Focus Blur Resolve' },
  { id: 'micro-scale-fade', label: 'Micro Scale Fade' },
  { id: 'per-character-rise', label: 'Per Character Rise' },
  { id: 'per-word-crossfade', label: 'Per Word Crossfade' },
  { id: 'scale-down-fade', label: 'Scale Down Fade' },
];

const TRANSITION_OPTIONS: { id: SceneTransition; label: string; icon: string }[] = [
  { id: 'none', label: 'None (Cut)', icon: '⚡' },
  { id: 'clip-wipe', label: 'Clip Wipe', icon: '◧' },
  { id: 'fade', label: 'Fade', icon: '🌫️' },
  { id: 'iris', label: 'Iris', icon: '⊙' },
  { id: 'iris-click', label: 'Iris Click', icon: '◎' },
  { id: 'loading-line', label: 'Loading Line', icon: '━' },
];

const FONT_OPTIONS = [
  { id: '"Plus Jakarta Sans", sans-serif', label: 'Plus Jakarta Sans' },
  { id: '"Inter", sans-serif', label: 'Inter' },
  { id: '"Outfit", sans-serif', label: 'Outfit' },
  { id: '"Poppins", sans-serif', label: 'Poppins' },
  { id: '"Space Grotesk", sans-serif', label: 'Space Grotesk' },
  { id: '"Sora", sans-serif', label: 'Sora' },
  { id: '"Playfair Display", serif', label: 'Playfair Display' },
  { id: '"Bricolage Grotesk", sans-serif', label: 'Bricolage Grotesk' },
  { id: '"Roboto", sans-serif', label: 'Roboto' },
  { id: 'monospace', label: 'Monospace' },
];

const ENTER_ANIMATION_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'fade-in', label: 'Fade In' },
  { id: 'slide-up', label: 'Slide Up' },
  { id: 'slide-down', label: 'Slide Down' },
  { id: 'slide-left', label: 'Slide Left' },
  { id: 'slide-right', label: 'Slide Right' },
  { id: 'scale-up', label: 'Scale Up' },
  { id: 'blur-in', label: 'Blur In' },
];

const EXIT_ANIMATION_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'fade-out', label: 'Fade Out' },
  { id: 'slide-up', label: 'Slide Up' },
  { id: 'slide-down', label: 'Slide Down' },
  { id: 'slide-left', label: 'Slide Left' },
  { id: 'slide-right', label: 'Slide Right' },
  { id: 'scale-down', label: 'Scale Down' },
  { id: 'blur-out', label: 'Blur Out' },
];

const DURATION_OPTIONS = [
  { value: 0.1, label: '0.1s' }, { value: 0.2, label: '0.2s' }, { value: 0.3, label: '0.3s' },
  { value: 0.4, label: '0.4s' }, { value: 0.5, label: '0.5s' }, { value: 0.6, label: '0.6s' },
  { value: 0.8, label: '0.8s' }, { value: 1.0, label: '1.0s' }, { value: 1.2, label: '1.2s' },
  { value: 1.5, label: '1.5s' }, { value: 2.0, label: '2.0s' },
];

const SPEED_OPTIONS = [
  { value: 0.25, label: '0.25x' }, { value: 0.5, label: '0.5x' }, { value: 0.75, label: '0.75x' },
  { value: 1.0, label: '1.0x' }, { value: 1.25, label: '1.25x' }, { value: 1.5, label: '1.5x' },
  { value: 2.0, label: '2.0x' }, { value: 2.5, label: '2.5x' }, { value: 3.0, label: '3.0x' },
];

const TIMING_OPTIONS = [
  { value: 0, label: '0s' }, { value: 0.5, label: '0.5s' }, { value: 1, label: '1s' },
  { value: 1.5, label: '1.5s' }, { value: 2, label: '2s' }, { value: 2.5, label: '2.5s' },
  { value: 3, label: '3s' }, { value: 4, label: '4s' }, { value: 5, label: '5s' },
  { value: 6, label: '6s' }, { value: 8, label: '8s' }, { value: 10, label: '10s' },
  { value: 15, label: '15s' }, { value: 20, label: '20s' },
];

const selectStyle = { width: '100%', padding: '8px', background: '#1c1c26', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', fontSize: '12px', marginBottom: '10px', outline: 'none' };



export default function MotionSidebar() {
  const {
    state, dispatch, addScene, removeScene, updateScene, duplicateScene, setScenes,
    addLayer, addComponentLayer, removeLayer, updateLayer, duplicateLayer, setLayers, seekTo, getSceneStartTime, play,
  } = useMGState();
  const { scenes, activeSceneId, selectedLayerId } = state;
  const activeTab = state.activeSidebarTab || 'scene';
  const setActiveTab = (tab: 'scene' | 'components') => dispatch({ activeSidebarTab: tab });
  const pickerOpen = state.isPickerOpen || false;
  const setPickerOpen = (open: boolean) => dispatch({ isPickerOpen: open });

  const activeScene = scenes.find((s) => s.id === activeSceneId);
  const layers = activeScene?.layers || [];
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);
  const selectedTextLayer = selectedLayer?.type === 'text' ? selectedLayer : null;
  const selectedComponentLayer = selectedLayer?.type === 'component' ? selectedLayer : null;
  const activeSceneIndex = scenes.findIndex((s) => s.id === activeSceneId);

  return (
    <div style={{
      width: '368px',
      minWidth: '368px',
      height: '100%',
      background: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '0 12px' }}>
        {(['scene', 'components'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '12px 0', background: 'none', border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
            }}
          >
            {tab === 'scene' ? <Film size={13} /> : <Box size={13} />}
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {/* ===== SCENES TAB ===== */}
        {activeTab === 'scene' && (
          <>
            {/* Scene List with Reordering */}
            <Reorder.Group
              axis="y"
              values={scenes}
              onReorder={setScenes}
              style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 0, margin: '0 0 12px 0', listStyle: 'none' }}
            >
              {scenes.map((scene, i) => {
                const isActive = activeSceneId === scene.id;
                return (
                  <Reorder.Item
                    key={scene.id}
                    value={scene}
                    onClick={() => {
                      dispatch({ activeSceneId: scene.id, selectedLayerId: null, activeSidebarTab: 'scene' });
                      seekTo(getSceneStartTime(scene.id));
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: isActive ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255,255,255,0.02)',
                      border: isActive ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                        <GripVertical size={14} />
                      </div>
                      <Layers size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative', minWidth: 0 }}>
                        <input
                          type="text"
                          value={scene.name}
                          maxLength={20}
                          onChange={(e) => updateScene(scene.id, { name: e.target.value.slice(0, 20) })}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLElement).blur(); }}
                          style={{
                            width: '100%',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            background: 'transparent',
                            border: '1px solid transparent',
                            borderRadius: '4px',
                            padding: '2px 4px',
                            outline: 'none',
                          }}
                          onFocus={(e) => {
                            e.target.style.background = 'var(--bg-primary)';
                            e.target.style.borderColor = 'var(--border-color)';
                          }}
                          onBlur={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.borderColor = 'transparent';
                          }}
                          title="Click to edit scene name"
                        />
                        <span style={{
                          fontSize: '9px',
                          color: scene.name.length >= 20 ? '#ef4444' : 'var(--text-muted)',
                          fontWeight: scene.name.length >= 20 ? 700 : 500,
                          marginLeft: '4px',
                          flexShrink: 0,
                          userSelect: 'none',
                        }}>
                          {scene.name.length}/20
                        </span>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {getSceneDuration(scene).toFixed(1)}s
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); duplicateScene(scene.id); }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                        title="Duplicate Scene">
                        <Copy size={12} />
                      </button>
                      {scenes.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); removeScene(scene.id); }}
                          className="delete-btn-hover"
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                          title="Delete Scene">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    {i > 0 && (
                      <div style={{ marginTop: '4px', paddingLeft: '22px', fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ChevronRight size={10} />
                        {TRANSITION_OPTIONS.find((t) => t.id === scene.transition)?.label || 'Cut'} ({scene.transitionDuration}s)
                      </div>
                    )}
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>

            {/* Active Scene Properties */}
            {activeScene && (
              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>
                  SCENE PROPERTIES
                </h4>

                {/* Background Color */}
                <div style={{ marginBottom: '12px' }}>
                  <ColorPickerControl
                    label="BG Color"
                    value={activeScene.bgColor}
                    onChange={(color) => updateScene(activeScene.id, { bgColor: color })}
                  />
                </div>

                {/* Background Images */}
                <h4 style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>BG IMAGES</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '16px' }}>
                  {[
                    { id: 'none', label: 'None', url: null },
                    { id: 'bg-01', label: 'BG 01', url: '/Background_Images/bg-01.svg' },
                    { id: 'bg-02', label: 'BG 02', url: '/Background_Images/bg-02.svg' },
                    { id: 'bg-03', label: 'BG 03', url: '/Background_Images/bg-03.svg' },
                    { id: 'bg-04', label: 'BG 04', url: '/Background_Images/bg-04.svg' },
                    { id: 'bg-05', label: 'BG 05', url: '/Background_Images/bg-05.svg' },
                    { id: 'bg-06', label: 'BG 06', url: '/Background_Images/bg-06.svg' },
                    { id: 'bg-07', label: 'BG 07', url: '/Background_Images/bg-07.svg' },
                    { id: 'bg-08', label: 'BG 08', url: '/Background_Images/bg-08.svg' },
                    { id: 'bg-09', label: 'BG 09', url: '/Background_Images/bg-09.svg' },
                    { id: 'bg-10', label: 'BG 10', url: '/Background_Images/bg-10.svg' },
                    { id: 'bg-11', label: 'BG 11', url: '/Background_Images/bg-11.svg' },
                    { id: 'bg-12', label: 'BG 12', url: '/Background_Images/bg-12.svg' },
                    { id: 'bg-13', label: 'BG 13', url: '/Background_Images/bg-13.svg' },
                    { id: 'bg-14', label: 'BG 14', url: '/Background_Images/bg-14.svg' },
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => updateScene(activeScene.id, { bgImage: bg.url || undefined })}
                      title={bg.label}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: '6px',
                        border: activeScene.bgImage === bg.url ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        background: bg.url ? `url(${bg.url})` : 'var(--bg-primary)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s',
                        padding: '0',
                      }}
                    />
                  ))}
                </div>

                {/* Transition (not for first scene) */}
                {activeSceneIndex > 0 && (
                  <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>
                      TRANSITION IN
                    </h4>

                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Type</label>
                    <select
                      value={activeScene.transition}
                      onChange={(e) => updateScene(activeScene.id, { transition: e.target.value as SceneTransition })}
                      style={{
                        width: '100%', padding: '8px', background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)', borderRadius: '6px',
                        color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px',
                      }}
                    >
                      {TRANSITION_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.icon} {opt.label}</option>
                      ))}
                    </select>

                    {activeScene.transition !== 'none' && (
                      <>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                          Transition Duration: {activeScene.transitionDuration.toFixed(1)}s
                        </label>
                        <input
                          type="range" min={0.1} max={2} step={0.1}
                          value={activeScene.transitionDuration}
                          onChange={(e) => {
                            const dur = Number(e.target.value);
                            updateScene(activeScene.id, { transitionDuration: dur });
                          }}
                          style={{ width: '100%', marginBottom: '10px' }}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ===== COMPONENTS TAB ===== */}
        {activeTab === 'components' && (
          <>
            {activeScene && (
              <div style={{ marginBottom: '14px', fontSize: '13.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Film size={14} /> Editing: <strong style={{ color: 'var(--text-primary)', fontSize: '13.5px' }}>{activeScene.name}</strong>
              </div>
            )}

            <ComponentPicker 
              open={pickerOpen} 
              onClose={() => setPickerOpen(false)} 
              onSelect={(id, props) => addComponentLayer(id, props)}
              onAddText={(animationType) => addLayer({ animationType })}
            />

            {/* Layer List */}
            <Reorder.Group
              axis="y"
              values={layers}
              onReorder={setLayers}
              style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 0, margin: 0, listStyle: 'none', marginBottom: '8px' }}
            >
              {layers.map((layer) => {
                const isSelected = selectedLayerId === layer.id;
                const layerDisplayName = layer.name !== undefined ? layer.name : (layer.type === 'text' ? layer.text : (COMPONENT_TEMPLATES.find((t) => t.id === layer.templateId)?.name || layer.templateId));
                return (
                  <Reorder.Item
                    key={layer.id}
                    value={layer}
                    onClick={() => dispatch({ selectedLayerId: layer.id })}
                    style={{
                      padding: '8px 10px', borderRadius: '6px',
                      background: isSelected ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255,255,255,0.02)',
                      border: isSelected ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid var(--border-color)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                      <GripVertical size={14} />
                    </div>
                    {layer.type === 'component' ? (
                      <Box size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    ) : (
                      <Type size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <input
                        type="text"
                        value={layerDisplayName}
                        onChange={(e) => updateLayer(layer.id, { name: e.target.value } as any)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLElement).blur(); }}
                        style={{
                          width: '100%',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          background: 'transparent',
                          border: '1px solid transparent',
                          borderRadius: '4px',
                          padding: '2px 4px',
                          outline: 'none',
                        }}
                        onFocus={(e) => {
                          e.target.style.background = 'var(--bg-primary)';
                          e.target.style.borderColor = 'var(--border-color)';
                        }}
                        onBlur={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.borderColor = 'transparent';
                        }}
                        title="Click to rename component"
                      />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.id); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                      title="Duplicate Component">
                      <Copy size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
                      className="delete-btn-hover"
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                      title="Delete Component">
                      <Trash2 size={12} />
                    </button>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>

            {/* Selected Layer Properties */}
            {selectedLayer && selectedLayer.type === 'text' && (
              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <h4 style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '10px', fontWeight: 800 }}>
                  PROPERTIES
                </h4>

                <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Text</label>
                <textarea
                  value={selectedLayer.text}
                  onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
                  style={{
                    width: '100%', padding: '8px', background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)', borderRadius: '6px',
                    color: 'var(--text-primary)', fontSize: '12px', resize: 'vertical', minHeight: '50px',
                    fontFamily: '"Plus Jakarta Sans", sans-serif', marginBottom: '10px',
                  }}
                />

                {/* Animation + Font same line */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>Animation</label>
                    <select value={selectedLayer.animationType}
                      onChange={(e) => updateLayer(selectedLayer.id, { animationType: e.target.value as MGTextAnimationType })}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }}>
                      {ANIMATION_OPTIONS.map((opt) => (<option key={opt.id} value={opt.id}>{opt.label}</option>))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>Font</label>
                    <select value={selectedLayer.fontFamily}
                      onChange={(e) => updateLayer(selectedLayer.id, { fontFamily: e.target.value })}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }}>
                      {FONT_OPTIONS.map((opt) => (<option key={opt.id} value={opt.id}>{opt.label}</option>))}
                    </select>
                  </div>
                </div>

                {/* Size, Color, Bold, Italic same line */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', marginBottom: '10px' }}>
                  <div style={{ width: '50px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>Size</label>
                    <input type="number" value={selectedLayer.fontSize}
                      onChange={(e) => updateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })}
                      min={12} max={200}
                      style={{ width: '100%', padding: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </div>
                  <ColorPickerControl
                    label="Color"
                    showHex={false}
                    value={selectedLayer.color}
                    onChange={(color) => updateLayer(selectedLayer.id, { color })}
                    style={{ width: '40px', flexShrink: 0 }}
                  />
                  <button onClick={() => updateLayer(selectedLayer.id, { isBold: !selectedLayer.isBold })}
                    style={{ padding: '6px 10px', background: selectedLayer.isBold ? 'var(--accent-primary)' : 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: selectedLayer.isBold ? '#0f172a' : 'var(--text-primary)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    B
                  </button>
                  <button onClick={() => updateLayer(selectedLayer.id, { isItalic: !selectedLayer.isItalic })}
                    style={{ padding: '6px 10px', background: selectedLayer.isItalic ? 'var(--accent-primary)' : 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: selectedLayer.isItalic ? '#0f172a' : 'var(--text-primary)', fontSize: '12px', fontStyle: 'italic', cursor: 'pointer' }}>
                    I
                  </button>
                </div>

                {/* Speed only */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>Speed</label>
                  <select value={selectedLayer.animationSpeed}
                    onChange={(e) => updateLayer(selectedLayer.id, { animationSpeed: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }}>
                    {SPEED_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                  </select>
                </div>

                {/* Enter Animation */}
                <div style={{ marginTop: '8px' }}>
                  <label style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>Enter Animation</label>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <select value={selectedLayer.enterAnimation || 'none'}
                      onChange={(e) => updateLayer(selectedLayer.id, { enterAnimation: e.target.value } as any)}
                      style={{ flex: 1, padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }}>
                      {ENTER_ANIMATION_OPTIONS.map((opt) => (<option key={opt.id} value={opt.id}>{opt.label}</option>))}
                    </select>
                    {(selectedLayer.enterAnimation && selectedLayer.enterAnimation !== 'none') && (
                      <select value={selectedLayer.enterDuration ?? 0.4}
                        onChange={(e) => updateLayer(selectedLayer.id, { enterDuration: Number(e.target.value) } as any)}
                        style={{ width: '60px', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }}>
                        {DURATION_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Exit Animation */}
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>Exit Animation</label>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <select value={selectedLayer.exitAnimation || 'none'}
                      onChange={(e) => updateLayer(selectedLayer.id, { exitAnimation: e.target.value } as any)}
                      style={{ flex: 1, padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }}>
                      {EXIT_ANIMATION_OPTIONS.map((opt) => (<option key={opt.id} value={opt.id}>{opt.label}</option>))}
                    </select>
                    {(selectedLayer.exitAnimation && selectedLayer.exitAnimation !== 'none') && (
                      <select value={selectedLayer.exitDuration ?? 0.3}
                        onChange={(e) => updateLayer(selectedLayer.id, { exitDuration: Number(e.target.value) } as any)}
                        style={{ width: '60px', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }}>
                        {DURATION_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Component Layer Properties */}
            {selectedLayer && selectedLayer.type === 'component' && (
              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>
                  PROPERTIES
                </h4>

                <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '12px', fontWeight: 600 }} title={COMPONENT_TEMPLATES.find((t) => t.id === selectedLayer.templateId)?.description}>
                  {COMPONENT_TEMPLATES.find((t) => t.id === selectedLayer.templateId)?.name} <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>ⓘ</span>
                </div>

                {/* Speed & Scale side by side */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Speed</label>
                    <CustomDropdown value={selectedLayer.props.speed ?? 1}
                      onChange={(v) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, speed: v } } as any)}
                      options={SPEED_OPTIONS} style={{ width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Scale</label>
                    <CustomDropdown
                      value={selectedLayer.templateId === 'phone-device' ? (selectedLayer.props.deviceSize ?? selectedLayer.scale ?? 1) : selectedLayer.scale}
                      onChange={(v) => {
                        if (selectedLayer.templateId === 'phone-device') {
                          updateLayer(selectedLayer.id, { scale: v, props: { ...selectedLayer.props, deviceSize: v } } as any);
                        } else {
                          updateLayer(selectedLayer.id, { scale: v } as any);
                        }
                      }}
                      options={[{ value: 0.5, label: '0.5x' }, { value: 0.75, label: '0.75x' }, { value: 1, label: '1.0x' }, { value: 1.25, label: '1.25x' }, { value: 1.5, label: '1.5x' }, { value: 1.8, label: '1.8x' }, { value: 2, label: '2.0x' }, { value: 2.5, label: '2.5x' }, { value: 3, label: '3.0x' }]}
                      style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Enter Animation */}
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Enter Animation</label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  <select value={selectedLayer.enterAnimation || 'none'}
                    onChange={(e) => updateLayer(selectedLayer.id, { enterAnimation: e.target.value } as any)}
                    style={{ flex: 1, padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }}>
                    {ENTER_ANIMATION_OPTIONS.map((opt) => (<option key={opt.id} value={opt.id}>{opt.label}</option>))}
                  </select>
                  {(selectedLayer.enterAnimation && selectedLayer.enterAnimation !== 'none') && (
                    <CustomDropdown value={selectedLayer.enterDuration ?? 0.4}
                      onChange={(v) => updateLayer(selectedLayer.id, { enterDuration: v } as any)}
                      options={DURATION_OPTIONS} style={{ width: '70px' }} />
                  )}
                </div>

                {/* Exit Animation */}
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Exit Animation</label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  <select value={selectedLayer.exitAnimation || 'none'}
                    onChange={(e) => updateLayer(selectedLayer.id, { exitAnimation: e.target.value } as any)}
                    style={{ flex: 1, padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }}>
                    {EXIT_ANIMATION_OPTIONS.map((opt) => (<option key={opt.id} value={opt.id}>{opt.label}</option>))}
                  </select>
                  {(selectedLayer.exitAnimation && selectedLayer.exitAnimation !== 'none') && (
                    <CustomDropdown value={selectedLayer.exitDuration ?? 0.3}
                      onChange={(v) => updateLayer(selectedLayer.id, { exitDuration: v } as any)}
                      options={DURATION_OPTIONS} style={{ width: '70px' }} />
                  )}
                </div>

                {/* Template-specific props */}
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '12px', paddingTop: '12px' }}>
                <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>
                  TEMPLATE SETTINGS
                </h4>

                {selectedLayer.templateId === 'count-up' && (
                  <>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>From</label>
                        <input type="number" value={selectedLayer.props.from ?? 0}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, from: Number(e.target.value) } } as any)}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>To</label>
                        <input type="number" value={selectedLayer.props.to ?? 100}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, to: Number(e.target.value) } } as any)}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>Color</label>
                        <input type="color" value={selectedLayer.props.color ?? '#ffffff'}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, color: e.target.value } } as any)}
                          style={{ width: '100%', height: '30px', padding: '1px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>Size</label>
                        <input type="number" value={selectedLayer.props.fontSize ?? 48}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontSize: Number(e.target.value) } } as any)}
                          min={12} max={150} step={2}
                          style={{ width: '100%', padding: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                      <button onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, isBold: !(selectedLayer.props.isBold ?? true) } } as any)}
                        style={{ padding: '6px 10px', background: (selectedLayer.props.isBold ?? true) ? 'var(--accent-primary)' : 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: (selectedLayer.props.isBold ?? true) ? '#0f172a' : 'var(--text-primary)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                        B
                      </button>
                      <button onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, isItalic: !selectedLayer.props.isItalic } } as any)}
                        style={{ padding: '6px 10px', background: selectedLayer.props.isItalic ? 'var(--accent-primary)' : 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: selectedLayer.props.isItalic ? '#0f172a' : 'var(--text-primary)', fontSize: '12px', fontStyle: 'italic', cursor: 'pointer' }}>
                        I
                      </button>
                    </div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Font</label>
                    <select value={selectedLayer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontFamily: e.target.value } } as any)}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }}>
                      {FONT_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </>
                )}

                {selectedLayer.templateId === 'animated-list' && (
                  <>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>Items</label>
                    <ListItemEditor
                      items={(() => {
                        const raw = selectedLayer.props.items || ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
                        const arr = Array.isArray(raw) ? raw : typeof raw === 'object' && raw !== null ? Object.values(raw) : [raw];
                        return arr.map((it: any) => typeof it === 'string' ? it : typeof it === 'object' && it !== null ? (it.text ?? it.value ?? Object.values(it).join('')) : String(it ?? ''));
                      })()}
                      onChange={(items) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, items } } as any)}
                      createNewItem={() => `Item ${((selectedLayer.props.items || []) as any[]).length + 1}`}
                      addLabel="Add Item"
                      renderItem={(item: any, idx, update) => {
                        const strVal = typeof item === 'string' ? item : typeof item === 'object' && item !== null ? (item.text ?? item.value ?? Object.values(item).join('')) : String(item ?? '');
                        return (
                          <input type="text" value={strVal}
                            onChange={(e) => update(e.target.value)}
                            style={{ flex: 1, minWidth: '100px', padding: '4px 6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                        );
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Item BG Color</label>
                        <input type="color" value={selectedLayer.props.itemBg ?? '#ffffff'}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, itemBg: e.target.value } } as any)}
                          style={{ width: '100%', height: '34px', padding: '2px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Text Color</label>
                        <input type="color" value={selectedLayer.props.textColor ?? '#000000'}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, textColor: e.target.value } } as any)}
                          style={{ width: '100%', height: '34px', padding: '2px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Style</label>
                        <button
                          onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, isBold: !selectedLayer.props.isBold } } as any)}
                          style={{
                            height: '34px',
                            padding: '0 14px',
                            background: selectedLayer.props.isBold ? 'var(--accent-primary)' : 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            color: selectedLayer.props.isBold ? '#0f172a' : 'var(--text-primary)',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                          title="Toggle Bold Text"
                        >
                          B
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {selectedLayer.templateId === 'logo-loop' && (
                  <>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>Logo Items</label>
                    <ListItemEditor
                      items={selectedLayer.props.items || DEFAULT_LOGO_LOOP_ITEMS}
                      onChange={(items) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, items } } as any)}
                      createNewItem={() => ({ type: 'text', value: `Item ${(selectedLayer.props.items || DEFAULT_LOGO_LOOP_ITEMS).length + 1}` })}
                      addLabel="Add Logo"
                      renderItem={(item: any, idx, update) => (
                        <>
                          <select value={item.type} onChange={(e) => update({ type: e.target.value, value: e.target.value === 'image' ? '' : item.value })}
                            style={{ width: '64px', padding: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '10px' }}>
                            <option value="text">Text</option>
                            <option value="image">Image</option>
                          </select>
                          {item.type === 'text' ? (
                            <input type="text" value={item.value} placeholder="Label"
                              onChange={(e) => update({ value: e.target.value })}
                              style={{ flex: 1, minWidth: '80px', padding: '4px 6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                          ) : (
                            <label style={{ flex: 1, minWidth: '80px', padding: '4px 6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-muted)', fontSize: '10px', cursor: 'pointer', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.value ? 'Change Image' : 'Upload Image'}
                              <input type="file" accept="image/*" style={{ display: 'none' }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) update({ value: URL.createObjectURL(file) });
                                }} />
                            </label>
                          )}
                        </>
                      )}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Direction</label>
                        <select value={selectedLayer.props.direction ?? 'left'}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, direction: e.target.value } } as any)}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }}>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Text Color</label>
                        <input type="color" value={selectedLayer.props.textColor ?? '#ffffff'}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, textColor: e.target.value } } as any)}
                          style={{ width: '100%', height: '34px', padding: '2px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Gap (px)</label>
                        <input type="number" value={selectedLayer.props.gap ?? 48}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, gap: Number(e.target.value) } } as any)}
                          min={8} max={100} step={4}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Height (px)</label>
                        <input type="number" value={selectedLayer.props.logoHeight ?? 28}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, logoHeight: Number(e.target.value) } } as any)}
                          min={16} max={60} step={2}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                    </div>
                  </>
                )}

                {selectedLayer.templateId === 'ai-loader' && (
                  <>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Variant</label>
                        <select value={selectedLayer.props.variant ?? 'dots'}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, variant: e.target.value } } as any)}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }}>
                          <option value="dots">Dots</option>
                          <option value="bar">Bar</option>
                          <option value="grid">Grid</option>
                        </select>
                      </div>
                      <ColorPickerControl
                        label="Color"
                        value={selectedLayer.props.color ?? '#facc15'}
                        onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, color } } as any)}
                      />
                    </div>
                  </>
                )}

                {selectedLayer.templateId === 'folder' && (
                  <>
                    <ColorPickerControl
                      label="Folder Color"
                      value={selectedLayer.props.color ?? '#5227ff'}
                      onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, color } } as any)}
                      style={{ marginBottom: '10px' }}
                    />
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                      Size: {(selectedLayer.props.size ?? 1.5).toFixed(1)}x
                    </label>
                    <input type="range" min={0.5} max={3} step={0.1} value={selectedLayer.props.size ?? 1.5}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, size: Number(e.target.value) } } as any)}
                      style={{ width: '100%', marginBottom: '10px' }} />
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>Documents (max 3)</label>
                    <ListItemEditor
                      items={(selectedLayer.props.items || DEFAULT_FOLDER_ITEMS).slice(0, 3)}
                      onChange={(items) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, items: items.slice(0, 3) } } as any)}
                      createNewItem={() => ({ text: `Doc ${(selectedLayer.props.items || DEFAULT_FOLDER_ITEMS).length + 1}`, bgColor: '#ffffff', textColor: '#333333' })}
                      addLabel={(selectedLayer.props.items || DEFAULT_FOLDER_ITEMS).length >= 3 ? 'Max 3 documents' : '+ Add Document'}
                      renderItem={(item: any, idx, update) => (
                        <>
                          <input type="text" value={item.text || ''} placeholder="Doc name"
                            onChange={(e) => update({ text: e.target.value })}
                            style={{ flex: 1, minWidth: '70px', padding: '4px 6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>BG</span>
                          <input type="color" value={item.bgColor || '#ffffff'}
                            onChange={(e) => update({ bgColor: e.target.value })}
                            style={{ width: '24px', height: '20px', padding: '1px', border: '1px solid var(--border-color)', borderRadius: '3px', cursor: 'pointer' }} />
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Text</span>
                          <input type="color" value={item.textColor || '#333333'}
                            onChange={(e) => update({ textColor: e.target.value })}
                            style={{ width: '24px', height: '20px', padding: '1px', border: '1px solid var(--border-color)', borderRadius: '3px', cursor: 'pointer' }} />
                        </>
                      )}
                    />
                  </>
                )}

                {selectedLayer.templateId === 'bubble-menu' && (
                  <>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Menu BG Color</label>
                    <input type="color" value={selectedLayer.props.menuBg ?? '#ffffff'}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, menuBg: e.target.value } } as any)}
                      style={{ width: '100%', height: '34px', padding: '2px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', marginBottom: '10px' }} />
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Radius</label>
                        <input type="number" value={selectedLayer.props.radius ?? 90}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, radius: Number(e.target.value) } } as any)}
                          min={40} max={200} step={5}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Bubble Size</label>
                        <input type="number" value={selectedLayer.props.bubbleSize ?? 44}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, bubbleSize: Number(e.target.value) } } as any)}
                          min={24} max={80} step={2}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                    </div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>Menu Items</label>
                    <ListItemEditor
                      items={selectedLayer.props.items || DEFAULT_BUBBLE_ITEMS}
                      onChange={(items) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, items } } as any)}
                      createNewItem={() => ({ label: `Item ${(selectedLayer.props.items || DEFAULT_BUBBLE_ITEMS).length + 1}`, color: '#6366f1', imageUrl: undefined } as { label: string; color: string; imageUrl?: string })}
                      addLabel="Add Bubble"
                      renderItem={(item: any, idx, update) => (
                        <>
                          <label style={{ width: '32px', height: '28px', borderRadius: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }} title="Upload image">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>img</span>
                            )}
                            <input type="file" accept="image/*" style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) update({ imageUrl: URL.createObjectURL(file) });
                              }} />
                          </label>
                          <input type="text" value={item.label || ''} placeholder="Label"
                            onChange={(e) => update({ label: e.target.value })}
                            style={{ flex: 1, minWidth: '70px', padding: '4px 6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                          <input type="color" value={item.color || '#6366f1'}
                            onChange={(e) => update({ color: e.target.value })}
                            style={{ width: '28px', height: '24px', padding: '1px', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }} />
                        </>
                      )}
                    />
                  </>
                )}

                {selectedLayer.templateId === 'unlumen-animated-list' && (
                  <>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Notification Count</label>
                    <input type="number" value={selectedLayer.props.count ?? (selectedLayer.props.items || DEFAULT_NOTIFICATION_ITEMS).length}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, count: Number(e.target.value) } } as any)}
                      min={1} max={20} step={1}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>Notification Items</label>
                    <ListItemEditor
                      items={selectedLayer.props.items || DEFAULT_NOTIFICATION_ITEMS}
                      onChange={(items) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, items } } as any)}
                      createNewItem={() => ({
                        title: `Notification ${(selectedLayer.props.items || DEFAULT_NOTIFICATION_ITEMS).length + 1}`,
                        description: 'Description text',
                        bgColor: 'rgba(255,255,255,0.05)', titleColor: '#ffffff', descriptionColor: 'rgba(255,255,255,0.5)', accentColor: '#6366f1',
                      })}
                      addLabel="Add Notification"
                      renderItem={(item: any, idx, update) => (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                          <input type="text" value={item.title || ''} placeholder="Title"
                            onChange={(e) => update({ title: e.target.value })}
                            style={{ width: '100%', padding: '4px 6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                          <input type="text" value={item.description || ''} placeholder="Description"
                            onChange={(e) => update({ description: e.target.value })}
                            style={{ width: '100%', padding: '4px 6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', width: '28px' }}>BG</span>
                            <input type="color" value={item.bgColor && item.bgColor.startsWith('#') ? item.bgColor : '#2a2a3e'}
                              onChange={(e) => update({ bgColor: e.target.value })}
                              style={{ width: '24px', height: '20px', padding: '1px', border: '1px solid var(--border-color)', borderRadius: '3px', cursor: 'pointer' }} />
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', width: '28px' }}>Title</span>
                            <input type="color" value={item.titleColor || '#ffffff'}
                              onChange={(e) => update({ titleColor: e.target.value })}
                              style={{ width: '24px', height: '20px', padding: '1px', border: '1px solid var(--border-color)', borderRadius: '3px', cursor: 'pointer' }} />
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', width: '28px' }}>Desc</span>
                            <input type="color" value={item.descriptionColor && item.descriptionColor.startsWith('#') ? item.descriptionColor : '#888888'}
                              onChange={(e) => update({ descriptionColor: e.target.value })}
                              style={{ width: '24px', height: '20px', padding: '1px', border: '1px solid var(--border-color)', borderRadius: '3px', cursor: 'pointer' }} />
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', width: '28px' }}>Dot</span>
                            <input type="color" value={item.accentColor || '#6366f1'}
                              onChange={(e) => update({ accentColor: e.target.value })}
                              style={{ width: '24px', height: '20px', padding: '1px', border: '1px solid var(--border-color)', borderRadius: '3px', cursor: 'pointer' }} />
                          </div>
                        </div>
                      )}
                    />
                  </>
                )}

                {selectedLayer.templateId === 'word-rotate' && (
                  <>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Text Color</label>
                    <input type="color" value={selectedLayer.props.color ?? '#ffffff'}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, color: e.target.value } } as any)}
                      style={{ width: '100%', height: '34px', padding: '2px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', marginBottom: '10px' }} />
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Font Size</label>
                    <input type="number" value={selectedLayer.props.fontSize ?? 32}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontSize: Number(e.target.value) } } as any)}
                      min={12} max={100} step={2}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>Word Items</label>
                    <ListItemEditor
                      items={selectedLayer.props.items || DEFAULT_WORD_ROTATE_ITEMS}
                      onChange={(items) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, items } } as any)}
                      createNewItem={() => ({ text: 'New Word', isBold: true, isItalic: false, fontFamily: '"Plus Jakarta Sans", sans-serif' })}
                      addLabel="Add Word"
                      renderItem={(item: any, idx, update) => (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                          <input type="text" value={item.text || ''} placeholder="Word"
                            onChange={(e) => update({ text: e.target.value })}
                            style={{ width: '100%', padding: '4px 6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <select value={item.fontFamily || '"Plus Jakarta Sans", sans-serif'}
                              onChange={(e) => update({ fontFamily: e.target.value })}
                              style={{ flex: 1, padding: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '10px' }}>
                              {FONT_OPTIONS.map((opt) => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                              ))}
                            </select>
                            <button onClick={() => update({ isBold: !item.isBold })}
                              style={{ padding: '4px 8px', background: item.isBold ? 'var(--accent-primary)' : 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: item.isBold ? '#0f172a' : 'var(--text-primary)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                              B
                            </button>
                            <button onClick={() => update({ isItalic: !item.isItalic })}
                              style={{ padding: '4px 8px', background: item.isItalic ? 'var(--accent-primary)' : 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: item.isItalic ? '#0f172a' : 'var(--text-primary)', fontSize: '11px', fontStyle: 'italic', cursor: 'pointer' }}>
                              I
                            </button>
                          </div>
                        </div>
                      )}
                    />
                  </>
                )}

                {selectedLayer.templateId === 'highlighter' && (
                  <>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Full Sentence</label>
                    <input type="text" value={selectedLayer.props.text ?? 'My name is World'}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, text: e.target.value } } as any)}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Words to Highlight (comma separated)</label>
                    <input type="text" value={selectedLayer.props.highlightWords ?? 'World'}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, highlightWords: e.target.value } } as any)}
                      placeholder="e.g. World, name"
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Pattern</label>
                    <select value={selectedLayer.props.action ?? 'highlight'}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, action: e.target.value } } as any)}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }}>
                      <option value="highlight">Highlight</option>
                      <option value="underline">Underline</option>
                      <option value="box">Box</option>
                      <option value="circle">Circle</option>
                      <option value="strike-through">Strike-through</option>
                    </select>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Annotation Color</label>
                        <input type="color" value={selectedLayer.props.color ?? '#ffd1dc'}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, color: e.target.value } } as any)}
                          style={{ width: '100%', height: '34px', padding: '2px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Text Color</label>
                        <input type="color" value={selectedLayer.props.textColor ?? '#ffffff'}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, textColor: e.target.value } } as any)}
                          style={{ width: '100%', height: '34px', padding: '2px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Font Size</label>
                        <input type="number" value={selectedLayer.props.fontSize ?? 32}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontSize: Number(e.target.value) } } as any)}
                          min={12} max={120} step={2}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Stroke Width</label>
                        <input type="number" value={selectedLayer.props.strokeWidth ?? 2}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, strokeWidth: Number(e.target.value) } } as any)}
                          min={1} max={8} step={0.5}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                    </div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Animation Duration (ms)</label>
                    <input type="number" value={selectedLayer.props.animationDuration ?? 600}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, animationDuration: Number(e.target.value) } } as any)}
                      min={100} max={3000} step={100}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                  </>
                )}

                {selectedLayer.templateId === 'orbiting-circles' && (
                  <>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>Orbit Items (images)</label>
                    <ListItemEditor
                      items={selectedLayer.props.items || [{ emoji: '⚛️' }, { emoji: '▲' }, { emoji: '🔷' }, { emoji: '🟢' }, { emoji: '⚡' }, { emoji: '🔮' }]}
                      onChange={(items) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, items } } as any)}
                      createNewItem={() => ({ emoji: '⭐' } as any)}
                      addLabel="Add Orbit Item"
                      renderItem={(item: any, idx, update) => (
                        <>
                          <label style={{ width: '32px', height: '28px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }} title="Upload image">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: '14px' }}>{item.emoji || '⭐'}</span>
                            )}
                            <input type="file" accept="image/*" style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) update({ imageUrl: URL.createObjectURL(file), emoji: undefined } as any);
                              }} />
                          </label>
                          <input type="text" value={item.emoji || ''} placeholder="emoji fallback"
                            onChange={(e) => update({ emoji: e.target.value, imageUrl: undefined } as any)}
                            style={{ flex: 1, padding: '4px 6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }} />
                        </>
                      )}
                    />
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Radius (px)</label>
                    <input type="number" value={selectedLayer.props.radius ?? 80}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, radius: Number(e.target.value) } } as any)}
                      min={40} max={200} step={5}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Icon Size (px)</label>
                    <input type="number" value={selectedLayer.props.iconSize ?? 36}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, iconSize: Number(e.target.value) } } as any)}
                      min={20} max={60} step={2}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Orbit Color</label>
                    <input type="color" value={selectedLayer.props.orbitColor ?? '#333333'}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, orbitColor: e.target.value } } as any)}
                      style={{ width: '100%', height: '34px', padding: '2px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', marginBottom: '10px' }} />
                  </>
                )}

                {selectedLayer.templateId === 'text-reveal' && (
                  <>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Text</label>
                    <input type="text" value={selectedLayer.props.text ?? 'Reveal This Text'}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, text: e.target.value } } as any)}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <ColorPickerControl
                        label="Text Color"
                        value={selectedLayer.props.color ?? '#ffffff'}
                        onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, color } } as any)}
                      />
                      <ColorPickerControl
                        label="Reveal Color"
                        value={selectedLayer.props.revealColor ?? '#facc15'}
                        onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, revealColor: color } } as any)}
                      />
                    </div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Font Size (px)</label>
                    <input type="number" value={selectedLayer.props.fontSize ?? 32}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontSize: Number(e.target.value) } } as any)}
                      min={12} max={120} step={2}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                  </>
                )}

                {selectedLayer.templateId === 'skeleton-shimmer' && (
                  <>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Lines</label>
                    <input type="number" value={selectedLayer.props.lines ?? 3}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, lines: Number(e.target.value) } } as any)}
                      min={1} max={8} step={1}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-primary)', marginBottom: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={selectedLayer.props.showAvatar ?? true}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, showAvatar: e.target.checked } } as any)}
                        style={{ accentColor: 'var(--accent-primary)' }} />
                      Show Avatar
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-primary)', marginBottom: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={selectedLayer.props.showImage ?? false}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, showImage: e.target.checked } } as any)}
                        style={{ accentColor: 'var(--accent-primary)' }} />
                      Show Image Block
                    </label>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Border Radius (px)</label>
                    <input type="number" value={selectedLayer.props.borderRadius ?? 6}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, borderRadius: Number(e.target.value) } } as any)}
                      min={0} max={20} step={1}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                  </>
                )}

                {selectedLayer.templateId === 'text-3d-flip' && (
                  <>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Front Text</label>
                    <input type="text" value={selectedLayer.props.text ?? 'Stay hungry, stay foolish'}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, text: e.target.value } } as any)}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Flipped Text (leave empty to use same)</label>
                    <input type="text" value={selectedLayer.props.flippedText ?? ''}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, flippedText: e.target.value } } as any)}
                      placeholder="Different text on flip..."
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <ColorPickerControl
                        label="Text Color"
                        value={selectedLayer.props.color ?? '#ffffff'}
                        onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, color } } as any)}
                      />
                      <ColorPickerControl
                        label="Flip Color"
                        value={selectedLayer.props.flipColor ?? '#facc15'}
                        onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, flipColor: color } } as any)}
                      />
                    </div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Font Size (px)</label>
                    <input type="number" value={selectedLayer.props.fontSize ?? 36}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontSize: Number(e.target.value) } } as any)}
                      min={12} max={100} step={2}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Rotate Direction</label>
                    <select value={selectedLayer.props.rotateDirection ?? 'top'}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, rotateDirection: e.target.value } } as any)}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }}>
                      <option value="top">Top</option>
                      <option value="right">Right</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                    </select>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Stagger From</label>
                    <select value={selectedLayer.props.staggerFrom ?? 'first'}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, staggerFrom: e.target.value } } as any)}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }}>
                      <option value="first">First</option>
                      <option value="last">Last</option>
                      <option value="center">Center</option>
                      <option value="random">Random</option>
                    </select>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                      Stagger Duration: {(selectedLayer.props.staggerDuration ?? 0.05).toFixed(2)}s
                    </label>
                    <input type="range" min={0.01} max={0.15} step={0.01} value={selectedLayer.props.staggerDuration ?? 0.05}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, staggerDuration: Number(e.target.value) } } as any)}
                      style={{ width: '100%', marginBottom: '10px' }} />
                  </>
                )}

                {selectedLayer.templateId === 'camera-zoom' && (
                  <>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                      Zoom Scale: {(selectedLayer.props.zoomScale ?? 0).toFixed(1)}x
                    </label>
                    <input type="range" min={0} max={5} step={0.1} value={selectedLayer.props.zoomScale ?? 0}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, zoomScale: Number(e.target.value) } } as any)}
                      style={{ width: '100%', marginBottom: '10px' }} />
                  </>
                )}

                {selectedLayer.templateId === 'media-upload' && (
                  <>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Media Type</label>
                    <select value={selectedLayer.props.mediaType ?? 'image'}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, mediaType: e.target.value } } as any)}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }}>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Upload File</label>
                    <label style={{
                      display: 'block', padding: '12px', background: 'var(--bg-primary)',
                      border: '2px dashed var(--border-color)', borderRadius: '8px',
                      textAlign: 'center', cursor: 'pointer', fontSize: '11px',
                      color: 'var(--text-muted)', marginBottom: '10px',
                    }}>
                      {selectedLayer.props.src ? '✓ Change File' : 'Click to upload'}
                      <input type="file" accept={(selectedLayer.props.mediaType ?? 'image') === 'video' ? 'video/*' : 'image/*'} style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, src: URL.createObjectURL(file) } } as any);
                        }} />
                    </label>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Object Fit</label>
                    <select value={selectedLayer.props.objectFit ?? 'contain'}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, objectFit: e.target.value } } as any)}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }}>
                      <option value="contain">Contain</option>
                      <option value="cover">Cover</option>
                      <option value="fill">Fill</option>
                    </select>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Width</label>
                        <input type="number" value={selectedLayer.props.width ?? 300}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, width: Number(e.target.value) } } as any)}
                          min={50} max={800} step={10}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Height</label>
                        <input type="number" value={selectedLayer.props.height ?? 200}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, height: Number(e.target.value) } } as any)}
                          min={50} max={600} step={10}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                    </div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Border Radius</label>
                    <input type="number" value={selectedLayer.props.borderRadius ?? 8}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, borderRadius: Number(e.target.value) } } as any)}
                      min={0} max={50} step={2}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                  </>
                )}

                {selectedLayer.templateId === 'video-upload' && (
                  <>
                    {/* Video File Upload Dropzone */}
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block', fontWeight: 600 }}>VIDEO FILE</label>
                    <label style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      padding: '16px 12px', background: 'var(--bg-primary)',
                      border: '2px dashed var(--border-color)', borderRadius: '10px',
                      textAlign: 'center', cursor: 'pointer', fontSize: '12px',
                      color: 'var(--text-primary)', fontWeight: 600, marginBottom: '12px',
                      transition: 'all 0.15s ease',
                    }}>
                      {selectedLayer.props.src ? (
                        <>
                          <span style={{ color: '#a855f7', fontSize: '13px' }}>✓ Video Loaded</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>Click to replace video file</span>
                        </>
                      ) : (
                        <>
                          <Film size={20} style={{ color: '#a855f7', marginBottom: '2px' }} />
                          <span>Upload Video File</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>MP4, WEBM, or MOV</span>
                        </>
                      )}
                      <input type="file" accept="video/*" style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            applyVideoFileToLayer(file, (updates) => updateLayer(selectedLayer.id, updates as any), selectedLayer.props);
                          }
                        }} />
                    </label>

                    {/* Playback Controls */}
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>PLAYBACK SETTINGS</label>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={selectedLayer.props.loop ?? true}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, loop: e.target.checked } } as any)}
                          style={{ accentColor: '#a855f7' }} />
                        Loop
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={selectedLayer.props.muted ?? true}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, muted: e.target.checked } } as any)}
                          style={{ accentColor: '#a855f7' }} />
                        Mute
                      </label>
                    </div>

                    {/* Styling */}
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>STYLING & BORDER</label>
                    
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'flex-end' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Border Radius (px)</label>
                        <input type="number" value={selectedLayer.props.borderRadius ?? 12}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, borderRadius: Number(e.target.value) } } as any)}
                          min={0} max={60} step={2}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Border Width</label>
                        <input type="number" value={selectedLayer.props.borderWidth ?? 0}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, borderWidth: Number(e.target.value) } } as any)}
                          min={0} max={10} step={1}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <ColorPickerControl
                          label="Border Color"
                          value={selectedLayer.props.borderColor ?? '#a855f7'}
                          onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, borderColor: color } } as any)}
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedLayer.templateId === 'image' && (
                  <>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>IMAGE FILE</label>
                    <label style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: '16px', borderRadius: '8px', border: '2px dashed var(--border-color)',
                      background: 'rgba(255,255,255,0.02)', cursor: 'pointer', marginBottom: '12px',
                      color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, gap: '4px',
                    }}>
                      {selectedLayer.props.src ? (
                        <>
                          <span style={{ color: '#facc15', fontSize: '13px' }}>✓ Image Loaded</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>Click to replace image file</span>
                        </>
                      ) : (
                        <>
                          <Box size={20} style={{ color: '#facc15', marginBottom: '2px' }} />
                          <span>Upload Image File</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>PNG, JPG, SVG, WEBP</span>
                        </>
                      )}
                      <input type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            applyImageFileToLayer(file, (updates) => updateLayer(selectedLayer.id, updates as any), selectedLayer.props);
                          }
                        }} />
                    </label>

                    {/* Dimensions & Object Fit */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Width (px)</label>
                        <input type="number" value={selectedLayer.props.width ?? 300}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, width: Number(e.target.value) } } as any)}
                          min={50} max={1920} step={10}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Height (px)</label>
                        <input type="number" value={selectedLayer.props.height ?? 200}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, height: Number(e.target.value) } } as any)}
                          min={50} max={1080} step={10}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Border Radius (px)</label>
                        <input type="number" value={selectedLayer.props.borderRadius ?? 8}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, borderRadius: Number(e.target.value) } } as any)}
                          min={0} max={100} step={2}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Object Fit</label>
                        <select value={selectedLayer.props.objectFit ?? 'contain'}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, objectFit: e.target.value } } as any)}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }}>
                          <option value="contain">Contain</option>
                          <option value="cover">Cover</option>
                          <option value="fill">Fill</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {selectedLayer.templateId === 'phone-device' && (
                  <>
                    {/* Device Type & Animation in 2-column grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Device Type</label>
                        <select value={selectedLayer.props.deviceType ?? 'iphone'}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, deviceType: e.target.value } } as any)}
                          style={{ width: '100%', padding: '7px 8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }}>
                          <option value="iphone">iPhone</option>
                          <option value="android">Android</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Animation</label>
                        <select value={selectedLayer.props.animationTemplate ?? 'float'}
                          onChange={(e) => {
                            const animName = e.target.value;
                            const animConfig = TEMPLATES.find((t) => t.id === animName);
                            const newDuration = animConfig ? animConfig.duration : selectedLayer.duration;
                            updateLayer(selectedLayer.id, {
                              duration: newDuration,
                              props: { ...selectedLayer.props, animationTemplate: animName },
                            } as any);
                          }}
                          style={{ width: '100%', padding: '7px 8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }}>
                          <option value="orbit">Orbit</option>
                          <option value="hero-reveal">Hero Reveal</option>
                          <option value="float">Float</option>
                          <option value="flip">Flip & Land</option>
                          <option value="rise">Rise</option>
                          <option value="tilt-shift">Tilt Shift</option>
                          <option value="bounce-drop">Bounce Drop</option>
                          <option value="slide-in">Slide In</option>
                          <option value="spiral">Spiral</option>
                          <option value="cinematic-pan">Cinematic Pan</option>
                          <option value="slow-pan">Slow Pan</option>
                          <option value="horizontal-slide">Horizontal Slide</option>
                          <option value="infinity-loop">Infinity Loop</option>
                          <option value="dynamic-showcase">Dynamic Showcase</option>
                          <option value="corkscrew-reveal">Corkscrew Reveal</option>
                          <option value="depth-zoom">Depth Zoom</option>
                          <option value="corner-drop">Corner Drop</option>
                          <option value="3d-spin-flip">3D Spin Flip</option>
                          <option value="perspective-float">Perspective Float</option>
                          <option value="zoom-pulse">Zoom Pulse</option>
                        </select>
                      </div>
                    </div>

                    {/* Device Color */}
                    <ColorPickerControl
                      label="Device Color"
                      value={selectedLayer.props.deviceColor ?? '#1a1a1a'}
                      onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, deviceColor: color } } as any)}
                      style={{ marginBottom: '10px' }}
                    />

                    {/* Screen Image & Screen Video Uploads in 2-column grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                      <label style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '8px 6px', background: 'var(--bg-primary)',
                        border: '1px dashed var(--border-color)', borderRadius: '6px',
                        textAlign: 'center', cursor: 'pointer', fontSize: '11px',
                        color: 'var(--text-muted)', fontWeight: 600,
                      }}>
                        {selectedLayer.props.screenImage ? '✓ Image' : '🖼️ Upload Image'}
                        <input type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, screenImage: URL.createObjectURL(file), screenVideo: undefined } } as any);
                          }} />
                      </label>
                      <label style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '8px 6px', background: 'var(--bg-primary)',
                        border: '1px dashed var(--border-color)', borderRadius: '6px',
                        textAlign: 'center', cursor: 'pointer', fontSize: '11px',
                        color: 'var(--text-muted)', fontWeight: 600,
                      }}>
                        {selectedLayer.props.screenVideo ? '✓ Video' : '🎬 Upload Video'}
                        <input type="file" accept="video/*" style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, screenVideo: URL.createObjectURL(file), screenImage: undefined } } as any);
                          }} />
                      </label>
                    </div>

                    {/* Device Settings */}
                    <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '8px', paddingTop: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <h4 style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>DEVICE SETTINGS</h4>
                        <button onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, posX: 0, posY: 0, rotX: 0, rotY: 0 } } as any)}
                          title="Reset"
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', fontSize: '12px' }}>↺</button>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Pos X</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-primary)' }}>{(selectedLayer.props.posX ?? 0).toFixed(2)}</span>
                              <button onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, posX: 0 } } as any)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0', fontSize: '9px', lineHeight: 1 }}>↺</button>
                            </div>
                          </div>
                          <input type="range" min={-2} max={2} step={0.05} value={selectedLayer.props.posX ?? 0}
                            onChange={(e) => {
                              const valX = Number(e.target.value);
                              const newPos = { ...selectedLayer.position, x: 50 + valX * 12.5 };
                              updateLayer(selectedLayer.id, { position: newPos, props: { ...selectedLayer.props, posX: valX } } as any);
                            }}
                            style={{ width: '100%' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Rot X</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-primary)' }}>{(selectedLayer.props.rotX ?? 0)}°</span>
                              <button onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, rotX: 0 } } as any)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0', fontSize: '9px', lineHeight: 1 }}>↺</button>
                            </div>
                          </div>
                          <input type="range" min={-180} max={180} step={1} value={selectedLayer.props.rotX ?? 0}
                            onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, rotX: Number(e.target.value) } } as any)}
                            style={{ width: '100%' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Pos Y</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-primary)' }}>{(selectedLayer.props.posY ?? 0).toFixed(2)}</span>
                              <button onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, posY: 0 } } as any)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0', fontSize: '9px', lineHeight: 1 }}>↺</button>
                            </div>
                          </div>
                          <input type="range" min={-2} max={2} step={0.05} value={selectedLayer.props.posY ?? 0}
                            onChange={(e) => {
                              const valY = Number(e.target.value);
                              const newPos = { ...selectedLayer.position, y: 50 - valY * 12.5 };
                              updateLayer(selectedLayer.id, { position: newPos, props: { ...selectedLayer.props, posY: valY } } as any);
                            }}
                            style={{ width: '100%' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Rot Y</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-primary)' }}>{(selectedLayer.props.rotY ?? 0)}°</span>
                              <button onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, rotY: 0 } } as any)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0', fontSize: '9px', lineHeight: 1 }}>↺</button>
                            </div>
                          </div>
                          <input type="range" min={-180} max={180} step={1} value={selectedLayer.props.rotY ?? 0}
                            onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, rotY: Number(e.target.value) } } as any)}
                            style={{ width: '100%' }} />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedLayer.templateId === 'masked-heading' && (
                  <>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Text</label>
                    <input type="text" value={selectedLayer.props.text ?? 'Designed in the details'}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, text: e.target.value } } as any)}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Media Type</label>
                    <select value={selectedLayer.props.mediaType ?? 'image'}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, mediaType: e.target.value } } as any)}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }}>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Upload Media</label>
                    <label style={{
                      display: 'block', padding: '12px', background: 'var(--bg-primary)',
                      border: '2px dashed var(--border-color)', borderRadius: '8px',
                      textAlign: 'center', cursor: 'pointer', fontSize: '11px',
                      color: 'var(--text-muted)', marginBottom: '10px',
                    }}>
                      {selectedLayer.props.src ? '✓ Change Media' : 'Click to upload'}
                      <input type="file" accept={(selectedLayer.props.mediaType ?? 'image') === 'video' ? 'video/*' : 'image/*'} style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, src: URL.createObjectURL(file) } } as any);
                        }} />
                    </label>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Reveal</label>
                    <select value={selectedLayer.props.reveal ?? 'rise'}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, reveal: e.target.value } } as any)}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }}>
                      <option value="rise">Rise</option>
                      <option value="wipe">Wipe</option>
                      <option value="fade">Fade</option>
                      <option value="none">None</option>
                    </select>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Align</label>
                    <select value={selectedLayer.props.align ?? 'center'}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, align: e.target.value } } as any)}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }}>
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Weight</label>
                        <input type="number" value={selectedLayer.props.weight ?? 700}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, weight: Number(e.target.value) } } as any)}
                          min={100} max={900} step={100}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Scale</label>
                        <input type="number" value={selectedLayer.props.textScale ?? 0.115}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, textScale: Number(e.target.value) } } as any)}
                          min={0.04} max={0.3} step={0.005}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Parallax</label>
                        <input type="number" value={selectedLayer.props.parallax ?? 26}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, parallax: Number(e.target.value) } } as any)}
                          min={0} max={80} step={2}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Drift</label>
                        <input type="number" value={selectedLayer.props.drift ?? 18}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, drift: Number(e.target.value) } } as any)}
                          min={0} max={50} step={2}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Fill Scale</label>
                        <input type="number" value={selectedLayer.props.fillScale ?? 1.25}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fillScale: Number(e.target.value) } } as any)}
                          min={1} max={2} step={0.05}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Brightness</label>
                        <input type="number" value={selectedLayer.props.brightness ?? 1}
                          onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, brightness: Number(e.target.value) } } as any)}
                          min={0.2} max={2} step={0.1}
                          style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                      </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-primary)', marginBottom: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={selectedLayer.props.grayscale ?? false}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, grayscale: e.target.checked } } as any)}
                        style={{ accentColor: 'var(--accent-primary)' }} />
                      Grayscale
                    </label>
                  </>
                )}
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* Pinned Bottom-Aligned Action Footer */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        flexShrink: 0,
      }}>
        {activeTab === 'scene' ? (
          <button
            onClick={addScene}
            style={{
              width: '100%', padding: '10px', background: 'var(--accent-primary)', color: '#0f172a',
              border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <Plus size={14} /> Add Scene
          </button>
        ) : (
          <button
            onClick={() => setPickerOpen(true)}
            style={{
              width: '100%', padding: '10px', background: 'var(--accent-primary)', color: '#0f172a',
              border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <Plus size={13} /> Add Element
          </button>
        )}
      </div>
    </div>
  );
}
