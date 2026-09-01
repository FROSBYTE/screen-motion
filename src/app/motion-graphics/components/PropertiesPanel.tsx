'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Copy, Type, Layers, Film, ChevronRight, Box, GripVertical, Play, RotateCcw, Pipette, Check, Pencil, Upload } from 'lucide-react';
import { useMGDoc, MGTextAnimationType, SceneTransition, MGTextLayer, MGComponentLayer, MGLayer, getSceneDuration, MGPacingPreset, MGAnimatableProperty, MGEasingType, hasKeyframesForProperty, getKeyframeAtTime, interpolateProperty } from '../store';
import { COMPONENT_TEMPLATES } from './templates';
import { Reorder } from 'motion/react';
import ListItemEditor from './ListItemEditor';
import CustomDropdown from '@/components/shared/controls/CustomDropdown';
import BasicDropdown from '@/components/smoothui/basic-dropdown';
import ComponentPicker from './ComponentPicker';
import ColorPickerControl from '@/components/shared/controls/ColorPickerControl';
import { TEMPLATES } from '@/types';
import { saveAsset } from '@/lib/storage/indexedDb';

function normalizeHex(color: string): string {
  if (!color) return '#000000';
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) return color;
  if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }
  return '#000000';
}

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB limit

export function applyVideoFileToLayer(
  file: File,
  updateFn: (updates: { duration?: number; props: any }) => void,
  currentProps: any
) {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    alert(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 50MB limit. Please upload a video smaller than 50MB.`);
    return;
  }
  const assetId = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  saveAsset(assetId, file, file.name).catch((err: any) => console.error('Failed to save video asset:', err));
  const url = URL.createObjectURL(file);
  const tempVideo = document.createElement('video');
  tempVideo.preload = 'metadata';
  tempVideo.onloadedmetadata = () => {
    const dur = tempVideo.duration;
    const vw = tempVideo.videoWidth;
    const vh = tempVideo.videoHeight;
    const updates: any = { props: { ...currentProps, src: url, srcAssetId: assetId, originalDuration: dur } };
    if (dur && isFinite(dur) && dur > 0) {
      updates.duration = Math.round(dur * 10) / 10;
      updates.props.originalDuration = dur;
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
    updateFn({ props: { ...currentProps, src: url, srcAssetId: assetId } });
  };
  tempVideo.src = url;
}

export function applyImageFileToLayer(
  file: File,
  updateFn: (updates: { props: any }) => void,
  currentProps: any
) {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    alert(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 50MB limit. Please upload an image smaller than 50MB.`);
    return;
  }
  const assetId = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  saveAsset(assetId, file, file.name).catch((err: any) => console.error('Failed to save image asset:', err));
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
          srcAssetId: assetId,
          width: baseWidth,
          height: calcHeight,
        },
      });
    } else {
      updateFn({ props: { ...currentProps, src: url, srcAssetId: assetId } });
    }
  };
  img.onerror = () => {
    updateFn({ props: { ...currentProps, src: url, srcAssetId: assetId } });
  };
  img.src = url;
}

function FastDeviceSlider({
  label,
  value,
  min,
  max,
  step = 0.05,
  unit = '',
  formatDecimals = 2,
  onChange,
  onReset,
  showReset = true,
  resetValue = 0,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatDecimals?: number;
  onChange: (val: number) => void;
  onReset?: () => void;
  showReset?: boolean;
  resetValue?: number;
}) {
  const [localVal, setLocalVal] = useState(value);
  const isDraggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalVal(value);
    }
  }, [value]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setLocalVal(val);
    isDraggingRef.current = true;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      onChange(val);
    });
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    onChange(localVal);
  };

  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <label style={H2_STYLE}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>
            {formatDecimals === 0 ? Math.round(localVal) : localVal.toFixed(formatDecimals)}{unit}
          </span>
          {showReset && onReset && (
            <button
              type="button"
              onClick={() => {
                setLocalVal(resetValue);
                onReset();
              }}
              title={`Reset ${label} to ${resetValue}${unit}`}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary, #6b7280)',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: localVal !== resetValue ? 1 : 0.35,
                transition: 'all 0.15s ease',
              }}
            >
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={localVal}
        onChange={handleSliderChange}
        onPointerUp={handlePointerUp}
        onPointerDown={() => { isDraggingRef.current = true; }}
        style={{ width: '100%' }}
      />
    </div>
  );
}

const DEFAULT_LOGO_LOOP_ITEMS: { type: string; value: string; valueAssetId?: string }[] = [
  { type: 'text', value: 'React' },
  { type: 'text', value: 'Next.js' },
  { type: 'text', value: 'TypeScript' },
  { type: 'text', value: 'Tailwind' },
  { type: 'text', value: 'Vercel' },
  { type: 'text', value: 'Docker' },
];

const DEFAULT_BUBBLE_ITEMS: { imageUrl?: string; imageAssetId?: string }[] = [
  { imageUrl: undefined },
  { imageUrl: undefined },
  { imageUrl: undefined },
  { imageUrl: undefined },
  { imageUrl: undefined },
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

const DEFAULT_WORD_ROTATE_ITEMS: { text: string }[] = [
  { text: 'Innovative' },
  { text: 'Creative' },
  { text: 'Powerful' },
  { text: 'Beautiful' },
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
  { id: 'soft-blur-in', label: 'Soft Blur In' },
  { id: 'spring-scale-in', label: 'Spring Scale In' },
  { id: 'stagger-from-center', label: 'Stagger Center' },
  { id: 'depth-parallax-words', label: 'Depth Parallax Words' },
  { id: 'fade-through', label: 'Fade Through' },
  { id: 'focus-blur-resolve', label: 'Focus Blur Resolve' },
  { id: 'micro-scale-fade', label: 'Micro Scale Fade' },
  { id: 'per-character-rise', label: 'Per Character Rise' },
  { id: 'per-word-crossfade', label: 'Per Word Crossfade' },
  { id: 'scale-down-fade', label: 'Scale Down Fade' },
  { id: 'text-reveal', label: 'Text Reveal' },
];

const TRANSITION_OPTIONS: { id: SceneTransition; label: string; icon: string }[] = [
  { id: 'none', label: 'None (Cut)', icon: '⚡' },
  { id: 'clip-wipe', label: 'Clip Wipe', icon: '◧' },
  { id: 'fade', label: 'Fade', icon: '🌫️' },
  { id: 'slide-left', label: 'Slide Left', icon: '⬅' },
  { id: 'slide-right', label: 'Slide Right', icon: '➡' },
  { id: 'slide-up', label: 'Slide Up', icon: '⬆' },
  { id: 'slide-down', label: 'Slide Down', icon: '⬇' },
  { id: 'zoom', label: 'Zoom', icon: '🔍' },
  { id: 'blur', label: 'Blur', icon: '💠' },
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

const LOGO_LOOP_TYPE_OPTIONS = [
  { id: 'text', label: 'Text' },
  { id: 'image', label: 'Image' },
];

const DIRECTION_OPTIONS = [
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
];

const AI_LOADER_VARIANT_OPTIONS = [
  { id: 'dots', label: 'Dots' },
  { id: 'bar', label: 'Bar' },
  { id: 'grid', label: 'Grid' },
];

const HIGHLIGHTER_ACTION_OPTIONS = [
  { id: 'highlight', label: 'Highlight' },
  { id: 'underline', label: 'Underline' },
  { id: 'box', label: 'Box' },
  { id: 'circle', label: 'Circle' },
  { id: 'strike-through', label: 'Strike-through' },
];

const ROTATE_DIRECTION_OPTIONS = [
  { id: 'top', label: 'Top' },
  { id: 'right', label: 'Right' },
  { id: 'bottom', label: 'Bottom' },
  { id: 'left', label: 'Left' },
];

const STAGGER_FROM_OPTIONS = [
  { id: 'first', label: 'First' },
  { id: 'last', label: 'Last' },
  { id: 'center', label: 'Center' },
  { id: 'random', label: 'Random' },
];

const MEDIA_TYPE_OPTIONS = [
  { id: 'image', label: 'Image' },
  { id: 'video', label: 'Video' },
];

const OBJECT_FIT_OPTIONS = [
  { id: 'contain', label: 'Contain' },
  { id: 'cover', label: 'Cover' },
  { id: 'fill', label: 'Fill' },
];

const DEVICE_TYPE_OPTIONS = [
  { id: 'iphone', label: 'iPhone' },
  { id: 'android', label: 'Android' },
];

const PHONE_ANIMATION_OPTIONS = [
  { id: 'orbit', label: 'Orbit' },
  { id: 'hero-reveal', label: 'Hero Reveal' },
  { id: 'float', label: 'Float' },
  { id: 'flip', label: 'Flip & Land' },
  { id: 'rise', label: 'Rise' },
  { id: 'tilt-shift', label: 'Tilt Shift' },
  { id: 'bounce-drop', label: 'Bounce Drop' },
  { id: 'slide-in', label: 'Slide In' },
  { id: 'spiral', label: 'Spiral' },
  { id: 'cinematic-pan', label: 'Cinematic Pan' },
  { id: 'slow-pan', label: 'Slow Pan' },
  { id: 'horizontal-slide', label: 'Horizontal Slide' },
  { id: 'infinity-loop', label: 'Infinity Loop' },
  { id: 'dynamic-showcase', label: 'Dynamic Showcase' },
  { id: 'corkscrew-reveal', label: 'Corkscrew Reveal' },
  { id: 'depth-zoom', label: 'Depth Zoom' },
  { id: 'corner-drop', label: 'Corner Drop' },
  { id: '3d-spin-flip', label: '3D Spin Flip' },
  { id: 'perspective-float', label: 'Perspective Float' },
  { id: 'zoom-pulse', label: 'Zoom Pulse' },
];

const MASKED_HEADING_REVEAL_OPTIONS = [
  { id: 'rise', label: 'Rise' },
  { id: 'wipe', label: 'Wipe' },
  { id: 'fade', label: 'Fade' },
  { id: 'none', label: 'None' },
];

const ALIGN_OPTIONS = [
  { id: 'left', label: 'Left' },
  { id: 'center', label: 'Center' },
  { id: 'right', label: 'Right' },
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

const selectStyle = { width: '100%', padding: '8px', background: 'var(--bg-input, #EEF0F5)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary, #0F172A)', fontSize: '12px', marginBottom: '10px', outline: 'none' };

const H1_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '14px',
  fontWeight: 700,
  color: 'var(--text-primary, #0F172A)',
  marginBottom: '14px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const H2_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--text-secondary, #475569)',
  marginBottom: '6px',
  display: 'block',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const H3_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--text-secondary, #475569)',
  marginBottom: '6px',
  display: 'block',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const SECTION_HEADING_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  fontWeight: 700,
  color: 'var(--text-primary, #0F172A)',
  marginBottom: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

function BoldSplitControl({
  isBold,
  boldLevel,
  fontWeight,
  onChange,
}: {
  isBold?: boolean;
  boldLevel?: 'half' | 'full';
  fontWeight?: number;
  onChange: (updates: { isBold: boolean; boldLevel?: 'half' | 'full'; fontWeight?: number }) => void;
}) {
  const isHalf = Boolean(isBold && (boldLevel === 'half' || fontWeight === 550));
  const isFull = Boolean(isBold && (boldLevel === 'full' || (!boldLevel && fontWeight !== 550 && isBold)));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', width: '100%', height: '36px' }}>
      <button
        type="button"
        onClick={() => {
          if (isHalf) {
            onChange({ isBold: false, boldLevel: undefined, fontWeight: 300 });
          } else {
            onChange({ isBold: true, boldLevel: 'half', fontWeight: 550 });
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          background: isHalf ? '#0F172A' : 'var(--bg-primary)',
          border: isHalf ? '1px solid #0F172A' : '1px solid var(--border-color)',
          borderRadius: '6px',
          color: isHalf ? '#FFFFFF' : 'var(--text-primary)',
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: isHalf ? '0 2px 6px rgba(15, 23, 42, 0.25)' : 'none',
          transition: 'all 0.15s ease',
          padding: '0 2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono, monospace)',
          letterSpacing: '-0.02em',
        }}
        title="Half Bold (550 Weight)"
      >
        Half
      </button>
      <button
        type="button"
        onClick={() => {
          if (isFull) {
            onChange({ isBold: false, boldLevel: undefined, fontWeight: 300 });
          } else {
            onChange({ isBold: true, boldLevel: 'full', fontWeight: 800 });
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          background: isFull ? '#0F172A' : 'var(--bg-primary)',
          border: isFull ? '1px solid #0F172A' : '1px solid var(--border-color)',
          borderRadius: '6px',
          color: isFull ? '#FFFFFF' : 'var(--text-primary)',
          fontSize: '11px',
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: isFull ? '0 2px 6px rgba(15, 23, 42, 0.25)' : 'none',
          transition: 'all 0.15s ease',
          padding: '0 2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono, monospace)',
          letterSpacing: '-0.02em',
        }}
        title="Full Bold (800 Weight)"
      >
        Full
      </button>
    </div>
  );
}

function PacingPresetControl({
  value = 'balanced',
  onChange,
}: {
  value?: MGPacingPreset;
  onChange: (preset: MGPacingPreset) => void;
}) {
  const presets: { id: MGPacingPreset; label: string; tooltip: string }[] = [
    { id: 'snappy', label: 'Snappy', tooltip: 'Fast entrance (~20% duration), maximizes reading time on screen.' },
    { id: 'balanced', label: 'Balanced', tooltip: 'Standard smooth entrance (~35% duration).' },
    { id: 'cinematic', label: 'Cinematic', tooltip: 'Slower, elegant reveal (~50% duration).' },
  ];

  return (
    <div style={{ marginBottom: '10px' }}>
      <label style={H2_STYLE}>
        Speed
      </label>
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-primary)', padding: '3px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
        {presets.map((p) => {
          const isActive = value === p.id;
          return (
            <button
              key={p.id}
              type="button"
              title={p.tooltip}
              onClick={() => onChange(p.id)}
              style={{
                flex: 1,
                padding: '6px 4px',
                background: isActive ? '#FF9137' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-primary)',
                border: 'none',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'center',
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(function PropertiesPanel() {
  const {
    state, dispatch, addScene, removeScene, updateScene, duplicateScene, setScenes,
    addLayer, addComponentLayer, removeLayer, updateLayer, duplicateLayer, moveLayerToScene, setLayers, seekTo, getSceneStartTime, play,
    addOrUpdateKeyframe, removeKeyframe, clearKeyframes, moveKeyframe, resetSelectedComponent,
  } = useMGDoc();
  const { scenes, activeSceneId, selectedLayerId } = state;
  const activeScene = scenes.find((s) => s.id === activeSceneId);
  const layers = activeScene?.layers || [];
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);
  const bgColorInputRef = React.useRef<HTMLInputElement>(null);
  const textColorInputRef = React.useRef<HTMLInputElement>(null);

  const isComponentMode = !!selectedLayerId;
  const isSceneMode = !isComponentMode && !!activeSceneId;

  return (
    <div
      className="properties-panel"
      style={{
        width: 'clamp(300px, 20vw, 368px)',
        minWidth: '300px',
        height: '100%',
        background: 'var(--theme-bg-panel, #FFFFFF)',
        borderLeft: '1px solid var(--theme-border, rgba(15, 23, 42, 0.08))',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>

        {/* Active Scene Properties */}
        {isSceneMode && activeScene && (
          <div style={{ paddingTop: '4px' }}>
            <h1 style={H1_STYLE}>
              SCENE PROPERTIES ({activeScene.name})
            </h1>

            {/* Background Images */}
            <h4 style={SECTION_HEADING_STYLE}>BG IMAGES</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '16px' }}>
              {/* Square button with color picker */}
              <div
                onClick={() => {
                  updateScene(activeScene.id, { bgImage: undefined });
                  bgColorInputRef.current?.click();
                }}
                title={`Color Picker: ${activeScene.bgColor || '#000000'} (Click to change color)`}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '6px',
                  border: !activeScene.bgImage ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  backgroundColor: activeScene.bgColor || '#000000',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: !activeScene.bgImage ? '0 0 0 1px rgba(168,85,247,0.4), 0 2px 6px rgba(0,0,0,0.4)' : 'none',
                  transition: 'border-color 0.2s',
                  padding: 0,
                }}
              >
                <Pencil size={14} style={{ color: '#ffffff', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))', opacity: 0.9 }} />
                <input
                  ref={bgColorInputRef}
                  type="color"
                  value={activeScene.bgColor || '#000000'}
                  onChange={(e) => {
                    updateScene(activeScene.id, { bgColor: e.target.value, bgImage: undefined });
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    pointerEvents: 'none',
                  }}
                />
              </div>

              {[
                { id: 'bg-01', label: 'BG 01', url: '/Background_Images/bg-01.svg' },
                { id: 'bg-02', label: 'BG 02', url: '/Background_Images/bg-02.svg' },
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

            {/* Transition - Only for Scene 2 and above */}
            {scenes.findIndex((s) => s.id === activeScene.id) > 0 && (
              <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <h4 style={SECTION_HEADING_STYLE}>
                  TRANSITION IN
                </h4>

                <label style={H2_STYLE}>Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '14px' }}>
                  {TRANSITION_OPTIONS.map((opt) => {
                    const isSelected = activeScene.transition === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateScene(activeScene.id, { transition: opt.id as SceneTransition })}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '8px 4px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #FFFFFF' : '1px solid var(--border-color)',
                          background: isSelected ? '#FFFFFF' : 'var(--bg-primary)',
                          color: isSelected ? '#000000' : 'var(--text-primary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          textAlign: 'center',
                        }}
                        title={opt.label}
                      >
                        <span style={{ fontSize: '14px' }}>{opt.icon}</span>
                        <span style={{ fontSize: '10px', fontWeight: isSelected ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {activeScene.transition !== 'none' && (
                  <>
                    <label style={H2_STYLE}>
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

        {/* Selected Layer Properties */}
        {isComponentMode && selectedLayer && selectedLayer.type === 'text' && (
          <div style={{ paddingTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h1 style={{ ...H1_STYLE, marginBottom: 0 }}>
                COMPONENT PROPERTIES
              </h1>
              <button
                onClick={resetSelectedComponent}
                title="Reset component to default properties"
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px',
                }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            <label style={H2_STYLE}>Text</label>
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

            {/* 2nd line: Only Animation Dropdown */}
            <div style={{ marginBottom: '10px' }}>
              <label style={H2_STYLE}>Animation</label>
              <BasicDropdown
                items={ANIMATION_OPTIONS}
                value={selectedLayer.animationType}
                onChange={(val) => updateLayer(selectedLayer.id, { animationType: val as MGTextAnimationType })}
              />
            </div>

            {/* 3rd line: Font, Font Size */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              <div>
                <label style={H2_STYLE}>Font</label>
                <BasicDropdown
                  items={FONT_OPTIONS}
                  value={selectedLayer.fontFamily}
                  onChange={(val) => updateLayer(selectedLayer.id, { fontFamily: val })}
                />
              </div>
              <div>
                <label style={H2_STYLE}>Font Size</label>
                <input
                  type="number"
                  value={selectedLayer.fontSize ?? 48}
                  onChange={(e) => updateLayer(selectedLayer.id, { fontSize: Math.max(1, Number(e.target.value)) })}
                  min={1} max={300} step={1}
                  style={{
                    width: '100%', padding: '7px 8px', background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)', borderRadius: '6px',
                    color: 'var(--text-primary)', fontSize: '12px', outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* 4th line: Color, Bold, Italic, Letter Spacing in a 4-button style with equal distance and headings */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {/* Color Button */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ ...H2_STYLE, textAlign: 'center' }}>Color</label>
                <ColorPickerControl
                  value={selectedLayer.color || '#ffffff'}
                  onChange={(color) => updateLayer(selectedLayer.id, { color })}
                  height="36px"
                />
              </div>

              {/* Bold Button */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ ...H2_STYLE, textAlign: 'center' }}>Bold</label>
                <BoldSplitControl
                  isBold={selectedLayer.isBold}
                  boldLevel={selectedLayer.boldLevel}
                  fontWeight={selectedLayer.fontWeight}
                  onChange={(updates) => updateLayer(selectedLayer.id, updates)}
                />
              </div>

              {/* Italic Button */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ ...H2_STYLE, textAlign: 'center' }}>Italic</label>
                <button
                  type="button"
                  onClick={() => updateLayer(selectedLayer.id, { isItalic: !selectedLayer.isItalic })}
                  style={{
                    width: '100%',
                    height: '36px',
                    background: selectedLayer.isItalic ? '#0F172A' : 'var(--bg-primary)',
                    border: selectedLayer.isItalic ? '1px solid #0F172A' : '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: selectedLayer.isItalic ? '#FFFFFF' : 'var(--text-primary)',
                    fontSize: '13px',
                    fontStyle: 'italic',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: selectedLayer.isItalic ? '0 2px 6px rgba(15, 23, 42, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  title="Toggle Italic"
                >
                  I
                </button>
              </div>

              {/* Letter Spacing */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ ...H2_STYLE, textAlign: 'center' }}>Spacing</label>
                <input
                  type="number"
                  value={selectedLayer.letterSpacing ?? 0}
                  onChange={(e) => updateLayer(selectedLayer.id, { letterSpacing: Math.round(Number(e.target.value)) })}
                  min={-10} max={60} step={1}
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '4px 6px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    outline: 'none',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                  }}
                  title="Letter Spacing (px)"
                />
              </div>
            </div>

            {/* Pacing Preset */}
            <PacingPresetControl
              value={selectedLayer.pacingPreset || 'balanced'}
              onChange={(pacingPreset) => updateLayer(selectedLayer.id, { pacingPreset })}
            />

            {/* Enter Animation */}
            <div style={{ marginTop: '8px' }}>
              <label style={H2_STYLE}>Enter Animation</label>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                <BasicDropdown
                  items={ENTER_ANIMATION_OPTIONS}
                  value={selectedLayer.enterAnimation || 'none'}
                  onChange={(val) => updateLayer(selectedLayer.id, { enterAnimation: val } as any)}
                  style={{ flex: 1 }}
                />
                {(selectedLayer.enterAnimation && selectedLayer.enterAnimation !== 'none') && (
                  <CustomDropdown value={selectedLayer.enterDuration ?? 1.0}
                    onChange={(v) => updateLayer(selectedLayer.id, { enterDuration: v } as any)}
                    options={DURATION_OPTIONS} style={{ width: '84px', minWidth: '84px', flexShrink: 0 }} />
                )}
              </div>
            </div>

            {/* Exit Animation */}
            <div>
              <label style={H2_STYLE}>Exit Animation</label>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                <BasicDropdown
                  items={EXIT_ANIMATION_OPTIONS}
                  value={selectedLayer.exitAnimation || 'none'}
                  onChange={(val) => updateLayer(selectedLayer.id, { exitAnimation: val } as any)}
                  style={{ flex: 1 }}
                />
                {(selectedLayer.exitAnimation && selectedLayer.exitAnimation !== 'none') && (
                  <CustomDropdown value={selectedLayer.exitDuration ?? 1.0}
                    onChange={(v) => updateLayer(selectedLayer.id, { exitDuration: v } as any)}
                    options={DURATION_OPTIONS} style={{ width: '84px', minWidth: '84px', flexShrink: 0 }} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Component Layer Properties */}
        {selectedLayer && selectedLayer.type === 'component' && (
          <div style={{ paddingTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h1 style={{ ...H1_STYLE, marginBottom: 0 }}>
                COMPONENT PROPERTIES
              </h1>
              <button
                onClick={resetSelectedComponent}
                title="Reset component to default properties"
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px',
                }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            <div style={{
              background: 'var(--theme-bg-inset, #F4F5EE)',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }} title="Edit component name">
              <input
                type="text"
                value={selectedLayer.name !== undefined ? selectedLayer.name : (COMPONENT_TEMPLATES.find((t: any) => t.id === selectedLayer.templateId)?.name || selectedLayer.templateId || '')}
                placeholder={COMPONENT_TEMPLATES.find((t: any) => t.id === selectedLayer.templateId)?.name || 'Component Name'}
                onChange={(e) => updateLayer(selectedLayer.id, { name: e.target.value } as any)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-primary, #0F172A)',
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  padding: 0,
                }}
              />
              <Pencil size={13} style={{ color: 'var(--text-muted)', opacity: 0.65, flexShrink: 0 }} />
            </div>

            <PacingPresetControl
              value={selectedLayer.pacingPreset || 'balanced'}
              onChange={(pacingPreset) => updateLayer(selectedLayer.id, { pacingPreset })}
            />



            {/* Enter & Exit Animation (for non-device components) */}
            {selectedLayer.templateId !== 'phone-device' && (
              <>
                {/* Enter Animation */}
                <label style={H2_STYLE}>Enter Animation</label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', alignItems: 'center' }}>
                  <BasicDropdown
                    items={ENTER_ANIMATION_OPTIONS}
                    value={selectedLayer.enterAnimation || 'none'}
                    onChange={(val) => updateLayer(selectedLayer.id, { enterAnimation: val } as any)}
                    style={{ flex: 1 }}
                  />
                  {(selectedLayer.enterAnimation && selectedLayer.enterAnimation !== 'none') && (
                    <CustomDropdown value={selectedLayer.enterDuration ?? 1.0}
                      onChange={(v) => updateLayer(selectedLayer.id, { enterDuration: v } as any)}
                      options={DURATION_OPTIONS} style={{ width: '84px', minWidth: '84px', flexShrink: 0 }} />
                  )}
                </div>

                {/* Exit Animation */}
                <label style={H2_STYLE}>Exit Animation</label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', alignItems: 'center' }}>
                  <BasicDropdown
                    items={EXIT_ANIMATION_OPTIONS}
                    value={selectedLayer.exitAnimation || 'none'}
                    onChange={(val) => updateLayer(selectedLayer.id, { exitAnimation: val } as any)}
                    style={{ flex: 1 }}
                  />
                  {(selectedLayer.exitAnimation && selectedLayer.exitAnimation !== 'none') && (
                    <CustomDropdown value={selectedLayer.exitDuration ?? 1.0}
                      onChange={(v) => updateLayer(selectedLayer.id, { exitDuration: v } as any)}
                      options={DURATION_OPTIONS} style={{ width: '84px', minWidth: '84px', flexShrink: 0 }} />
                  )}
                </div>
              </>
            )}

            {/* Template-specific props */}
            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '12px', paddingTop: '12px' }}>
              <h4 style={SECTION_HEADING_STYLE}>
                TEMPLATE SETTINGS
              </h4>

              {selectedLayer.templateId === 'count-up' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={H2_STYLE}>From</label>
                      <input type="number" value={selectedLayer.props.from ?? 0}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, from: Number(e.target.value) } } as any)}
                        style={{ width: '100%', height: '36px', padding: '0 8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={H2_STYLE}>To</label>
                      <input type="number" value={selectedLayer.props.to ?? 100}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, to: Number(e.target.value) } } as any)}
                        style={{ width: '100%', height: '36px', padding: '0 8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  {/* Uniform 3-column Color, Bold, Italic row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    {/* Color */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Color</label>
                      <ColorPickerControl
                        value={selectedLayer.props.color || '#ffffff'}
                        onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, color } } as any)}
                        height="36px"
                      />
                    </div>

                    {/* Bold */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Bold</label>
                      <BoldSplitControl
                        isBold={selectedLayer.props.isBold ?? true}
                        boldLevel={selectedLayer.props.boldLevel}
                        fontWeight={selectedLayer.props.fontWeight}
                        onChange={(updates) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, ...updates } } as any)}
                      />
                    </div>

                    {/* Italic */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Italic</label>
                      <button
                        type="button"
                        onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, isItalic: !selectedLayer.props.isItalic } } as any)}
                        style={{
                          width: '100%',
                          height: '36px',
                          background: selectedLayer.props.isItalic ? '#0F172A' : 'var(--bg-primary)',
                          border: selectedLayer.props.isItalic ? '1px solid #0F172A' : '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: selectedLayer.props.isItalic ? '#FFFFFF' : 'var(--text-primary)',
                          fontSize: '13px',
                          fontStyle: 'italic',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: selectedLayer.props.isItalic ? '0 2px 6px rgba(15, 23, 42, 0.25)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                        title="Toggle Italic"
                      >
                        I
                      </button>
                    </div>
                  </div>
                  <label style={H2_STYLE}>Font</label>
                  <div style={{ marginBottom: '10px' }}>
                    <BasicDropdown
                      items={FONT_OPTIONS}
                      value={selectedLayer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'}
                      onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontFamily: val } } as any)}
                    />
                  </div>
                </>
              )}

              {selectedLayer.templateId === 'animated-list' && (
                <>
                  <label style={H2_STYLE}>Items</label>
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
                  <label style={H2_STYLE}>Font</label>
                  <div style={{ marginBottom: '10px' }}>
                    <BasicDropdown
                      items={FONT_OPTIONS}
                      value={selectedLayer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'}
                      onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontFamily: val } } as any)}
                    />
                  </div>

                  {/* Uniform 4-column Item BG, Text Color, Bold, Italic row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    {/* Item BG Color */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Item BG</label>
                      <ColorPickerControl
                        value={selectedLayer.props.itemBg || '#ffffff'}
                        onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, itemBg: color } } as any)}
                        height="36px"
                      />
                    </div>

                    {/* Text Color */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Text Color</label>
                      <ColorPickerControl
                        value={selectedLayer.props.textColor || '#000000'}
                        onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, textColor: color } } as any)}
                        height="36px"
                      />
                    </div>

                    {/* Bold */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Bold</label>
                      <BoldSplitControl
                        isBold={selectedLayer.props.isBold}
                        boldLevel={selectedLayer.props.boldLevel}
                        fontWeight={selectedLayer.props.fontWeight}
                        onChange={(updates) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, ...updates } } as any)}
                      />
                    </div>

                    {/* Italic */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Italic</label>
                      <button
                        type="button"
                        onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, isItalic: !selectedLayer.props.isItalic } } as any)}
                        style={{
                          width: '100%',
                          height: '36px',
                          background: selectedLayer.props.isItalic ? '#0F172A' : 'var(--bg-primary)',
                          border: selectedLayer.props.isItalic ? '1px solid #0F172A' : '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: selectedLayer.props.isItalic ? '#FFFFFF' : 'var(--text-primary)',
                          fontSize: '13px',
                          fontStyle: 'italic',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: selectedLayer.props.isItalic ? '0 2px 6px rgba(15, 23, 42, 0.25)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                        title="Toggle Italic"
                      >
                        I
                      </button>
                    </div>
                  </div>
                </>
              )}

              {selectedLayer.templateId === 'logo-loop' && (
                <>
                  <label style={H2_STYLE}>Logo Items</label>
                  <ListItemEditor
                    items={selectedLayer.props.items || DEFAULT_LOGO_LOOP_ITEMS}
                    onChange={(items) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, items } } as any)}
                    createNewItem={() => ({ type: 'text', value: `Item ${(selectedLayer.props.items || DEFAULT_LOGO_LOOP_ITEMS).length + 1}` } as { type: string; value: string; valueAssetId?: string })}
                    addLabel="Add Logo"
                    renderItem={(item: any, idx, update) => (
                      <>
                        <div style={{ width: '74px', minWidth: '74px' }}>
                          <BasicDropdown
                            compact
                            items={LOGO_LOOP_TYPE_OPTIONS}
                            value={item.type}
                            onChange={(val) => update({ type: val, value: val === 'image' ? '' : item.value })}
                          />
                        </div>
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
                                if (file) {
                                  if (file.size > MAX_FILE_SIZE_BYTES) {
                                    alert(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 50MB limit. Please upload a file smaller than 50MB.`);
                                    return;
                                  }
                                  const assetId = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
                                  saveAsset(assetId, file, file.name).catch((err: any) => console.error(err));
                                  update({ value: URL.createObjectURL(file), valueAssetId: assetId });
                                }
                              }} />
                          </label>
                        )}
                      </>
                    )}
                  />
                  <label style={H2_STYLE}>Font</label>
                  <div style={{ marginBottom: '10px' }}>
                    <BasicDropdown
                      items={FONT_OPTIONS}
                      value={selectedLayer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'}
                      onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontFamily: val } } as any)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Direction">Direction</label>
                      <BasicDropdown
                        items={DIRECTION_OPTIONS}
                        value={selectedLayer.props.direction ?? 'left'}
                        onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, direction: val } } as any)}
                        compact={true}
                        buttonStyle={{ height: '36px', padding: '0 6px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Text Color">Color</label>
                      <ColorPickerControl
                        value={selectedLayer.props.textColor || '#ffffff'}
                        onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, textColor: color } } as any)}
                        height="36px"
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Bold">Bold</label>
                      <BoldSplitControl
                        isBold={selectedLayer.props.isBold ?? true}
                        boldLevel={selectedLayer.props.boldLevel}
                        fontWeight={selectedLayer.props.fontWeight}
                        onChange={(updates) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, ...updates } } as any)}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Italic">Italic</label>
                      <button
                        type="button"
                        onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, isItalic: !selectedLayer.props.isItalic } } as any)}
                        style={{
                          width: '100%',
                          height: '36px',
                          background: selectedLayer.props.isItalic ? '#0F172A' : 'var(--bg-primary)',
                          border: selectedLayer.props.isItalic ? '1px solid #0F172A' : '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: selectedLayer.props.isItalic ? '#FFFFFF' : 'var(--text-primary)',
                          fontSize: '13px',
                          fontStyle: 'italic',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: selectedLayer.props.isItalic ? '0 2px 6px rgba(15, 23, 42, 0.25)' : 'none',
                          transition: 'all 0.15s ease',
                          boxSizing: 'border-box',
                        }}
                        title="Toggle Italic Text"
                      >
                        I
                      </button>
                    </div>
                  </div>

                  {/* Speed Slider */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={H2_STYLE}>Speed</label>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{(selectedLayer.props.speed ?? 1).toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={4}
                      step={0.1}
                      value={selectedLayer.props.speed ?? 1}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, speed: Number(e.target.value) } } as any)}
                      style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-primary, #ffffff)' }}
                    />
                  </div>

                  {/* Gap & Height in equal 2-column grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Gap (px)</label>
                      <input
                        type="number"
                        value={selectedLayer.props.gap ?? 48}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, gap: Number(e.target.value) } } as any)}
                        min={8}
                        max={100}
                        step={4}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '0 8px',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          textAlign: 'center',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Height (px)</label>
                      <input
                        type="number"
                        value={selectedLayer.props.logoHeight ?? 28}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, logoHeight: Number(e.target.value) } } as any)}
                        min={16}
                        max={60}
                        step={2}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '0 8px',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          textAlign: 'center',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {selectedLayer.templateId === 'ai-loader' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={H2_STYLE}>Variant</label>
                      <BasicDropdown
                        items={AI_LOADER_VARIANT_OPTIONS}
                        value={selectedLayer.props.variant ?? 'dots'}
                        onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, variant: val } } as any)}
                        compact={true}
                        buttonStyle={{ height: '36px' }}
                      />
                    </div>
                    <ColorPickerControl
                      label="Color"
                      value={selectedLayer.props.color ?? '#ffffff'}
                      onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, color } } as any)}
                    />
                  </div>

                  {/* Speed Slider */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={H2_STYLE}>Speed</label>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{(selectedLayer.props.speed ?? 1).toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={4}
                      step={0.1}
                      value={selectedLayer.props.speed ?? 1}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, speed: Number(e.target.value) } } as any)}
                      style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-primary, #ffffff)' }}
                    />
                  </div>
                </>
              )}

              {selectedLayer.templateId === 'bubble-menu' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={H2_STYLE}>Radius</label>
                      <input
                        type="number"
                        value={selectedLayer.props.radius ?? 90}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, radius: Number(e.target.value) } } as any)}
                        min={40}
                        max={200}
                        step={5}
                        style={{ width: '100%', height: '36px', padding: '0 8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={H2_STYLE}>Bubble Size</label>
                      <input
                        type="number"
                        value={selectedLayer.props.bubbleSize ?? 44}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, bubbleSize: Number(e.target.value) } } as any)}
                        min={24}
                        max={80}
                        step={2}
                        style={{ width: '100%', height: '36px', padding: '0 8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <label style={H2_STYLE}>Center Circle & Image</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', background: 'var(--bg-primary)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <label style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }} title="Upload Center Image">
                      {selectedLayer.props.centerImageUrl ? (
                        <img src={selectedLayer.props.centerImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Upload size={16} style={{ color: 'var(--text-muted)' }} />
                      )}
                      <input type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const assetId = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
                            saveAsset(assetId, file, file.name).catch((err: any) => console.error(err));
                            updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, centerImageUrl: URL.createObjectURL(file), centerImageAssetId: assetId } } as any);
                          }
                        }} />
                    </label>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>Center Image</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{selectedLayer.props.centerImageUrl ? 'Image attached' : 'Click circle to upload'}</div>
                    </div>
                    {selectedLayer.props.centerImageUrl && (
                      <button
                        onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, centerImageUrl: undefined, centerImageAssetId: undefined } } as any)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', fontSize: '11px' }}
                        title="Remove Center Image"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <label style={H2_STYLE}>Center Size</label>
                  <input type="number" value={selectedLayer.props.centerSize ?? (selectedLayer.props.bubbleSize ?? 44)}
                    onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, centerSize: Number(e.target.value) } } as any)}
                    min={16} max={120} step={2}
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                  <label style={H2_STYLE}>Menu Items</label>
                  <ListItemEditor
                    items={selectedLayer.props.items || DEFAULT_BUBBLE_ITEMS}
                    onChange={(items) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, items } } as any)}
                    createNewItem={() => ({ imageUrl: undefined } as { imageUrl?: string; imageAssetId?: string })}
                    addLabel="Add Bubble"
                    renderItem={(item: any, idx, update) => (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }} title="Upload image">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Upload size={14} style={{ color: 'var(--text-muted)' }} />
                          )}
                          <input type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > MAX_FILE_SIZE_BYTES) {
                                  alert(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 50MB limit. Please upload a file smaller than 50MB.`);
                                  return;
                                }
                                const assetId = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
                                saveAsset(assetId, file, file.name).catch((err: any) => console.error(err));
                                update({ imageUrl: URL.createObjectURL(file), imageAssetId: assetId });
                              }
                            }} />
                        </label>
                        <span style={{ fontSize: '12px', color: item.imageUrl ? 'var(--text-primary)' : 'var(--text-muted)', flex: 1 }}>
                          {item.imageUrl ? `Bubble Image ${idx + 1}` : `Click circle to upload image`}
                        </span>
                        {item.imageUrl && (
                          <button
                            onClick={() => update({ imageUrl: undefined, imageAssetId: undefined })}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px 4px', fontSize: '11px' }}
                            title="Clear image"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    )}
                  />
                </>
              )}

              {selectedLayer.templateId === 'unlumen-animated-list' && (
                <>
                  <label style={H2_STYLE}>Notification Items</label>
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
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>BG:</span>
                          <ColorPickerControl
                            value={item.bgColor && item.bgColor.startsWith('#') ? item.bgColor : '#2a2a3e'}
                            onChange={(color) => update({ bgColor: color })}
                            height="24px"
                            style={{ maxWidth: '40px' }}
                          />
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Title:</span>
                          <ColorPickerControl
                            value={item.titleColor || '#ffffff'}
                            onChange={(color) => update({ titleColor: color })}
                            height="24px"
                            style={{ maxWidth: '40px' }}
                          />
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Desc:</span>
                          <ColorPickerControl
                            value={item.descriptionColor && item.descriptionColor.startsWith('#') ? item.descriptionColor : '#888888'}
                            onChange={(color) => update({ descriptionColor: color })}
                            height="24px"
                            style={{ maxWidth: '40px' }}
                          />
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Dot:</span>
                          <ColorPickerControl
                            value={item.accentColor || '#6366f1'}
                            onChange={(color) => update({ accentColor: color })}
                            height="24px"
                            style={{ maxWidth: '40px' }}
                          />
                        </div>
                      </div>
                    )}
                  />

                  <label style={H2_STYLE}>Font</label>
                  <div style={{ marginBottom: '10px' }}>
                    <BasicDropdown
                      items={FONT_OPTIONS}
                      value={selectedLayer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'}
                      onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontFamily: val } } as any)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    {/* Bold */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Bold</label>
                      <BoldSplitControl
                        isBold={selectedLayer.props.isBold ?? true}
                        boldLevel={selectedLayer.props.boldLevel}
                        fontWeight={selectedLayer.props.fontWeight}
                        onChange={(updates) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, ...updates } } as any)}
                      />
                    </div>

                    {/* Italic */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Italic</label>
                      <button
                        type="button"
                        onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, isItalic: !selectedLayer.props.isItalic } } as any)}
                        style={{
                          width: '100%',
                          height: '36px',
                          background: selectedLayer.props.isItalic ? '#0F172A' : 'var(--bg-primary)',
                          border: selectedLayer.props.isItalic ? '1px solid #0F172A' : '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: selectedLayer.props.isItalic ? '#FFFFFF' : 'var(--text-primary)',
                          fontSize: '13px',
                          fontStyle: 'italic',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: selectedLayer.props.isItalic ? '0 2px 6px rgba(15, 23, 42, 0.25)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                        title="Toggle Italic"
                      >
                        I
                      </button>
                    </div>
                  </div>

                  {/* Speed Slider */}
                  <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={H2_STYLE}>Speed</label>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{(selectedLayer.props.speed ?? 1).toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={4}
                      step={0.1}
                      value={selectedLayer.props.speed ?? 1}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, speed: Number(e.target.value) } } as any)}
                      style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-primary, #ffffff)' }}
                    />
                  </div>
                </>
              )}

              {selectedLayer.templateId === 'word-rotate' && (
                <>
                  <button
                    type="button"
                    onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, isLoop: !(selectedLayer.props.isLoop ?? true) } } as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: 600,
                      transition: 'all 0.15s ease',
                      width: '100%',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      background: (selectedLayer.props.isLoop ?? true) ? '#FF9137' : 'transparent',
                      border: (selectedLayer.props.isLoop ?? true) ? 'none' : '1.5px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {(selectedLayer.props.isLoop ?? true) && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </div>
                    <span>Loop Animation</span>
                  </button>

                  {/* Font, Font Size */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    <div>
                      <label style={H2_STYLE}>Font</label>
                      <BasicDropdown
                        items={FONT_OPTIONS}
                        value={selectedLayer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'}
                        onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontFamily: val } } as any)}
                      />
                    </div>
                    <div>
                      <label style={H2_STYLE}>Font Size</label>
                      <input
                        type="number"
                        value={selectedLayer.props.fontSize ?? 48}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontSize: Math.max(1, Number(e.target.value)) } } as any)}
                        min={1} max={200} step={1}
                        style={{
                          width: '100%', padding: '7px 8px', background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)', borderRadius: '6px',
                          color: 'var(--text-primary)', fontSize: '12px', outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* Uniform 3-column Color, Bold, Italic row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    {/* Color */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Color</label>
                      <ColorPickerControl
                        value={selectedLayer.props.color || '#ffffff'}
                        onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, color } } as any)}
                        height="36px"
                      />
                    </div>

                    {/* Bold */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Bold</label>
                      <BoldSplitControl
                        isBold={selectedLayer.props.isBold ?? true}
                        boldLevel={selectedLayer.props.boldLevel}
                        fontWeight={selectedLayer.props.fontWeight}
                        onChange={(updates) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, ...updates } } as any)}
                      />
                    </div>

                    {/* Italic */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Italic</label>
                      <button
                        type="button"
                        onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, isItalic: !selectedLayer.props.isItalic } } as any)}
                        style={{
                          width: '100%',
                          height: '36px',
                          background: selectedLayer.props.isItalic ? '#0F172A' : 'var(--bg-primary)',
                          border: selectedLayer.props.isItalic ? '1px solid #0F172A' : '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: selectedLayer.props.isItalic ? '#FFFFFF' : 'var(--text-primary)',
                          fontSize: '13px',
                          fontStyle: 'italic',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: selectedLayer.props.isItalic ? '0 2px 6px rgba(15, 23, 42, 0.25)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                        title="Toggle Italic"
                      >
                        I
                      </button>
                    </div>
                  </div>

                  {/* Speed Slider */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={H2_STYLE}>Speed</label>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{(selectedLayer.props.speed ?? 1).toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={4}
                      step={0.1}
                      value={selectedLayer.props.speed ?? 1}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, speed: Number(e.target.value) } } as any)}
                      style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-primary, #ffffff)' }}
                    />
                  </div>

                  <label style={H2_STYLE}>Word Items</label>
                  <ListItemEditor
                    items={selectedLayer.props.items || DEFAULT_WORD_ROTATE_ITEMS}
                    onChange={(items) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, items } } as any)}
                    createNewItem={() => ({ text: `Word ${((selectedLayer.props.items || DEFAULT_WORD_ROTATE_ITEMS) as any[]).length + 1}` })}
                    addLabel="Add Word"
                    renderItem={(item: any, idx, update) => {
                      const textVal = typeof item === 'string' ? item : typeof item === 'object' && item !== null ? (item.text ?? item.value ?? '') : String(item ?? '');
                      return (
                        <input
                          type="text"
                          value={textVal}
                          placeholder="Word"
                          onChange={(e) => update(typeof item === 'object' ? { ...item, text: e.target.value } : e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px' }}
                        />
                      );
                    }}
                  />
                </>
              )}

              {selectedLayer.templateId === 'highlighter' && (
                <>
                  <label style={H2_STYLE}>Full Sentence</label>
                  <input type="text" value={selectedLayer.props.text ?? 'My name is World'}
                    onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, text: e.target.value } } as any)}
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                  <label style={H2_STYLE}>Words to Highlight (comma separated)</label>
                  <input type="text" value={selectedLayer.props.highlightWords ?? 'World'}
                    onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, highlightWords: e.target.value } } as any)}
                    placeholder="e.g. World, name"
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                  <label style={H2_STYLE}>Pattern</label>
                  <div style={{ marginBottom: '10px' }}>
                    <BasicDropdown
                      items={HIGHLIGHTER_ACTION_OPTIONS}
                      value={selectedLayer.props.action ?? 'highlight'}
                      onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, action: val } } as any)}
                    />
                  </div>

                  <label style={H2_STYLE}>Font</label>
                  <div style={{ marginBottom: '10px' }}>
                    <BasicDropdown
                      items={FONT_OPTIONS}
                      value={selectedLayer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'}
                      onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontFamily: val } } as any)}
                    />
                  </div>

                  {/* Uniform 3-column Annotation Color, Text Color, Stroke Width row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    {/* Annotation Color */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Annotation Color">Annotation</label>
                      <ColorPickerControl
                        value={selectedLayer.props.color || '#ffd1dc'}
                        onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, color } } as any)}
                        height="36px"
                      />
                    </div>

                    {/* Text Color */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Text Color">Text Color</label>
                      <ColorPickerControl
                        value={selectedLayer.props.textColor || '#ffffff'}
                        onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, textColor: color } } as any)}
                        height="36px"
                      />
                    </div>

                    {/* Stroke Width */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Stroke Width">Stroke</label>
                      <input
                        type="number"
                        value={selectedLayer.props.strokeWidth ?? 2}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, strokeWidth: Number(e.target.value) } } as any)}
                        min={1}
                        max={12}
                        step={0.5}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '0 8px',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          textAlign: 'center',
                        }}
                      />
                    </div>
                  </div>

                  {/* Uniform 3-column Bold, Italic, Font Size row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    {/* Bold */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Bold</label>
                      <BoldSplitControl
                        isBold={selectedLayer.props.isBold ?? true}
                        boldLevel={selectedLayer.props.boldLevel}
                        fontWeight={selectedLayer.props.fontWeight}
                        onChange={(updates) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, ...updates } } as any)}
                      />
                    </div>

                    {/* Italic */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Italic</label>
                      <button
                        type="button"
                        onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, isItalic: !selectedLayer.props.isItalic } } as any)}
                        style={{
                          width: '100%',
                          height: '36px',
                          background: selectedLayer.props.isItalic ? '#0F172A' : 'var(--bg-primary)',
                          border: selectedLayer.props.isItalic ? '1px solid #0F172A' : '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: selectedLayer.props.isItalic ? '#FFFFFF' : 'var(--text-primary)',
                          fontSize: '13px',
                          fontStyle: 'italic',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: selectedLayer.props.isItalic ? '0 2px 6px rgba(15, 23, 42, 0.25)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                        title="Toggle Italic"
                      >
                        I
                      </button>
                    </div>

                    {/* Font Size */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Size</label>
                      <input
                        type="number"
                        value={selectedLayer.props.fontSize ?? 44}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontSize: Math.max(1, Number(e.target.value)) } } as any)}
                        min={1}
                        max={200}
                        step={1}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '0 8px',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          textAlign: 'center',
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {selectedLayer.templateId === 'orbiting-circles' && (
                <>
                  <label style={H2_STYLE}>Orbit Items</label>
                  <ListItemEditor
                    items={selectedLayer.props.items || [{ imageUrl: undefined }, { imageUrl: undefined }, { imageUrl: undefined }, { imageUrl: undefined }, { imageUrl: undefined }]}
                    onChange={(items) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, items } } as any)}
                    createNewItem={() => ({ imageUrl: undefined } as { imageUrl?: string; imageAssetId?: string })}
                    addLabel="Add Orbit Item"
                    renderItem={(item: any, idx, update) => (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }} title="Upload image">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Upload size={14} style={{ color: 'var(--text-muted)' }} />
                          )}
                          <input type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const assetId = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
                                saveAsset(assetId, file, file.name).catch((err: any) => console.error(err));
                                update({ imageUrl: URL.createObjectURL(file), imageAssetId: assetId });
                              }
                            }} />
                        </label>
                        <span style={{ fontSize: '12px', color: item.imageUrl ? 'var(--text-primary)' : 'var(--text-muted)', flex: 1 }}>
                          {item.imageUrl ? `Orbit Image ${idx + 1}` : `Click circle to upload image`}
                        </span>
                        {item.imageUrl && (
                          <button
                            onClick={() => update({ imageUrl: undefined, imageAssetId: undefined })}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px 4px', fontSize: '11px' }}
                            title="Clear image"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    )}
                  />
                  {/* Uniform 2-column Radius and Icon Size row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={H2_STYLE}>Radius (px)</label>
                      <input
                        type="number"
                        value={selectedLayer.props.radius ?? 80}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, radius: Number(e.target.value) } } as any)}
                        min={40}
                        max={200}
                        step={5}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '0 8px',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={H2_STYLE}>Icon Size (px)</label>
                      <input
                        type="number"
                        value={selectedLayer.props.iconSize ?? 36}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, iconSize: Number(e.target.value) } } as any)}
                        min={20}
                        max={60}
                        step={2}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '0 8px',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Orbit Speed Slider */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={H2_STYLE}>Orbit Speed</label>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{(selectedLayer.props.speed ?? 1).toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={5}
                      step={0.1}
                      value={selectedLayer.props.speed ?? 1}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, speed: Number(e.target.value) } } as any)}
                      style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-primary, #ffffff)' }}
                    />
                  </div>
                </>
              )}

              {selectedLayer.templateId === 'text-reveal' && (
                <>
                  <label style={H2_STYLE}>Text</label>
                  <input type="text" value={selectedLayer.props.text ?? 'Reveal This Text'}
                    onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, text: e.target.value } } as any)}
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                  
                  <label style={H2_STYLE}>Font</label>
                  <div style={{ marginBottom: '10px' }}>
                    <BasicDropdown
                      items={FONT_OPTIONS}
                      value={selectedLayer.props.fontFamily}
                      onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontFamily: val } } as any)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
                    <ColorPickerControl
                      label="Text Color"
                      value={selectedLayer.props.color ?? '#ffffff'}
                      onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, color } } as any)}
                    />
                    <ColorPickerControl
                      label="Reveal Color"
                      value={selectedLayer.props.revealColor ?? '#FF9137'}
                      onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, revealColor: color } } as any)}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Bold</label>
                      <BoldSplitControl
                        isBold={selectedLayer.props.isBold ?? true}
                        boldLevel={selectedLayer.props.boldLevel}
                        fontWeight={selectedLayer.props.fontWeight}
                        onChange={(updates) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, ...updates } } as any)}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Italic</label>
                      <button
                        type="button"
                        onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, isItalic: !selectedLayer.props.isItalic } } as any)}
                        style={{
                          width: '100%',
                          height: '36px',
                          background: selectedLayer.props.isItalic ? '#0F172A' : 'var(--bg-primary)',
                          border: selectedLayer.props.isItalic ? '1px solid #0F172A' : '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: selectedLayer.props.isItalic ? '#FFFFFF' : 'var(--text-primary)',
                          fontSize: '13px',
                          fontStyle: 'italic',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: selectedLayer.props.isItalic ? '0 2px 6px rgba(15, 23, 42, 0.25)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                        title="Toggle Italic"
                      >
                        I
                      </button>
                    </div>
                  </div>
                  <label style={H2_STYLE}>Font Size (px)</label>
                  <input type="number" value={selectedLayer.props.fontSize ?? 32}
                    onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontSize: Math.max(1, Number(e.target.value)) } } as any)}
                    min={1} max={200} step={1}
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                </>
              )}

              {selectedLayer.templateId === 'dia-text-reveal' && (
                <>
                  <label style={H2_STYLE}>Text (lines or words)</label>
                  <textarea
                    value={Array.isArray(selectedLayer.props.text) ? selectedLayer.props.text.join('\n') : (selectedLayer.props.text ?? 'Design Systems')}
                    onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, text: e.target.value } } as any)}
                    rows={2}
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px', resize: 'vertical' }}
                  />

                  <label style={H2_STYLE}>Font</label>
                  <div style={{ marginBottom: '10px' }}>
                    <BasicDropdown
                      items={FONT_OPTIONS}
                      value={selectedLayer.props.fontFamily}
                      onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontFamily: val } } as any)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
                    <ColorPickerControl
                      label="Text Color"
                      value={selectedLayer.props.textColor ?? '#ffffff'}
                      onChange={(textColor) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, textColor } } as any)}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Bold</label>
                      <button
                        type="button"
                        onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, isBold: !(selectedLayer.props.isBold ?? true) } } as any)}
                        style={{
                          width: '100%',
                          height: '36px',
                          background: (selectedLayer.props.isBold ?? true) ? '#0F172A' : 'var(--bg-primary)',
                          border: (selectedLayer.props.isBold ?? true) ? '1px solid #0F172A' : '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: (selectedLayer.props.isBold ?? true) ? '#FFFFFF' : 'var(--text-primary)',
                          fontSize: '13px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: (selectedLayer.props.isBold ?? true) ? '0 2px 6px rgba(15, 23, 42, 0.25)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                        title="Toggle Bold"
                      >
                        B
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Italic</label>
                      <button
                        type="button"
                        onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, isItalic: !selectedLayer.props.isItalic } } as any)}
                        style={{
                          width: '100%',
                          height: '36px',
                          background: selectedLayer.props.isItalic ? '#0F172A' : 'var(--bg-primary)',
                          border: selectedLayer.props.isItalic ? '1px solid #0F172A' : '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: selectedLayer.props.isItalic ? '#FFFFFF' : 'var(--text-primary)',
                          fontSize: '13px',
                          fontStyle: 'italic',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: selectedLayer.props.isItalic ? '0 2px 6px rgba(15, 23, 42, 0.25)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                        title="Toggle Italic"
                      >
                        I
                      </button>
                    </div>
                  </div>

                  <label style={H2_STYLE}>Font Size (px)</label>
                  <input
                    type="number"
                    value={selectedLayer.props.fontSize ?? 36}
                    onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontSize: Math.max(1, Number(e.target.value)) } } as any)}
                    min={1} max={200} step={1}
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }}
                  />
                </>
              )}

              {selectedLayer.templateId === 'skeleton-shimmer' && (
                <>
                  {/* Single-line Avatar and Image Block Card Toggles */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    {/* Show Avatar Card */}
                    <button
                      type="button"
                      onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, showAvatar: !(selectedLayer.props.showAvatar ?? true) } } as any)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        transition: 'all 0.15s ease',
                        width: '100%',
                      }}
                    >
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        background: (selectedLayer.props.showAvatar ?? true) ? '#FF9137' : 'transparent',
                        border: (selectedLayer.props.showAvatar ?? true) ? 'none' : '1.5px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {(selectedLayer.props.showAvatar ?? true) && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </div>
                      <span>Avatar</span>
                    </button>

                    {/* Show Image Card */}
                    <button
                      type="button"
                      onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, showImage: !selectedLayer.props.showImage } } as any)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        transition: 'all 0.15s ease',
                        width: '100%',
                      }}
                    >
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        background: selectedLayer.props.showImage ? '#FF9137' : 'transparent',
                        border: selectedLayer.props.showImage ? 'none' : '1.5px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {selectedLayer.props.showImage && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </div>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Image</span>
                    </button>
                  </div>

                  {/* Uniform 3-column Color, Lines, Border Radius row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    {/* Color Shading */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Shading Color">Color</label>
                      <ColorPickerControl
                        value={selectedLayer.props.color || '#ffffff'}
                        onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, color } } as any)}
                        height="36px"
                      />
                    </div>

                    {/* Lines */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Lines</label>
                      <input
                        type="number"
                        value={selectedLayer.props.lines ?? 3}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, lines: Number(e.target.value) } } as any)}
                        min={1}
                        max={8}
                        step={1}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '0 8px',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          textAlign: 'center',
                        }}
                      />
                    </div>

                    {/* Border Radius */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Radius</label>
                      <input
                        type="number"
                        value={selectedLayer.props.borderRadius ?? 6}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, borderRadius: Number(e.target.value) } } as any)}
                        min={0}
                        max={24}
                        step={1}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '0 8px',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          textAlign: 'center',
                        }}
                      />
                    </div>
                  </div>

                  {/* Speed Slider */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={H2_STYLE}>Speed</label>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{(selectedLayer.props.speed ?? 1).toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={4}
                      step={0.1}
                      value={selectedLayer.props.speed ?? 1}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, speed: Number(e.target.value) } } as any)}
                      style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-primary, #ffffff)' }}
                    />
                  </div>
                </>
              )}

              {selectedLayer.templateId === 'text-3d-flip' && (
                <>
                  {/* Loop Animation Toggle Card */}
                  <div style={{ marginBottom: '12px' }}>
                    <button
                      type="button"
                      onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, isLoop: !(selectedLayer.props.isLoop ?? true) } } as any)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        transition: 'all 0.15s ease',
                        width: '100%',
                      }}
                    >
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        background: (selectedLayer.props.isLoop ?? true) ? '#FF9137' : 'transparent',
                        border: (selectedLayer.props.isLoop ?? true) ? 'none' : '1.5px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {(selectedLayer.props.isLoop ?? true) && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </div>
                      <span>Infinite Loop</span>
                    </button>
                  </div>

                  <label style={H2_STYLE}>Front Text</label>
                  <input
                    type="text"
                    value={selectedLayer.props.text ?? 'Stay hungry, stay foolish'}
                    onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, text: e.target.value } } as any)}
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }}
                  />

                  <label style={H2_STYLE}>Flipped Text (leave empty to use same)</label>
                  <input
                    type="text"
                    value={selectedLayer.props.flippedText ?? ''}
                    onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, flippedText: e.target.value } } as any)}
                    placeholder="Different text on flip..."
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }}
                  />

                  <label style={H2_STYLE}>Font</label>
                  <div style={{ marginBottom: '10px' }}>
                    <BasicDropdown
                      items={FONT_OPTIONS}
                      value={selectedLayer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'}
                      onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontFamily: val } } as any)}
                    />
                  </div>

                  {/* Uniform 4-column row for Text Color, Flip Color, Bold, Italic */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
                    <ColorPickerControl
                      label="Text Color"
                      value={selectedLayer.props.color ?? '#ffffff'}
                      onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, color } } as any)}
                    />
                    <ColorPickerControl
                      label="Flip Color"
                      value={selectedLayer.props.flipColor ?? '#a855f7'}
                      onChange={(color) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, flipColor: color } } as any)}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Bold</label>
                      <BoldSplitControl
                        isBold={selectedLayer.props.isBold ?? true}
                        boldLevel={selectedLayer.props.boldLevel}
                        fontWeight={selectedLayer.props.fontWeight}
                        onChange={(updates) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, ...updates } } as any)}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Italic</label>
                      <button
                        type="button"
                        onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, isItalic: !selectedLayer.props.isItalic } } as any)}
                        style={{
                          width: '100%',
                          height: '36px',
                          background: selectedLayer.props.isItalic ? '#0F172A' : 'var(--bg-primary)',
                          border: selectedLayer.props.isItalic ? '1px solid #0F172A' : '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: selectedLayer.props.isItalic ? '#FFFFFF' : 'var(--text-primary)',
                          fontSize: '13px',
                          fontStyle: 'italic',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: selectedLayer.props.isItalic ? '0 2px 6px rgba(15, 23, 42, 0.25)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                        title="Toggle Italic"
                      >
                        I
                      </button>
                    </div>
                  </div>

                  {/* Uniform 3-column row for Font Size, Rotate Direction, and Stagger From */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px', alignItems: 'flex-start' }}>
                    {/* Font Size */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Font Size">Font Size</label>
                      <input
                        type="number"
                        value={selectedLayer.props.fontSize ?? 36}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontSize: Math.max(1, Number(e.target.value)) } } as any)}
                        min={1}
                        max={200}
                        step={1}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '0 6px',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          textAlign: 'center',
                        }}
                      />
                    </div>

                    {/* Rotate Direction */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Rotate Direction">Rotate</label>
                      <BasicDropdown
                        items={ROTATE_DIRECTION_OPTIONS}
                        value={selectedLayer.props.rotateDirection ?? 'top'}
                        onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, rotateDirection: val } } as any)}
                        compact={true}
                        buttonStyle={{ height: '36px', padding: '0 6px' }}
                      />
                    </div>

                    {/* Stagger From */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Stagger From">Stagger</label>
                      <BasicDropdown
                        items={STAGGER_FROM_OPTIONS}
                        value={selectedLayer.props.staggerFrom ?? 'first'}
                        onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, staggerFrom: val } } as any)}
                        compact={true}
                        buttonStyle={{ height: '36px', padding: '0 6px' }}
                      />
                    </div>
                  </div>

                  {/* Speed Slider */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={H2_STYLE}>Speed</label>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{(selectedLayer.props.speed ?? 1).toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={4}
                      step={0.1}
                      value={selectedLayer.props.speed ?? 1}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, speed: Number(e.target.value) } } as any)}
                      style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-primary, #ffffff)' }}
                    />
                  </div>
                </>
              )}

              {selectedLayer.templateId === 'camera-zoom' && (
                <>
                  <label style={H2_STYLE}>
                    Zoom Scale: {(selectedLayer.props.zoomScale ?? 0).toFixed(1)}x
                  </label>
                  <input type="range" min={0} max={5} step={0.1} value={selectedLayer.props.zoomScale ?? 0}
                    onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, zoomScale: Number(e.target.value) } } as any)}
                    style={{ width: '100%', marginBottom: '10px' }} />
                </>
              )}

              {selectedLayer.templateId === 'media-upload' && (
                <>
                  <label style={H2_STYLE}>Media Type</label>
                  <div style={{ marginBottom: '10px' }}>
                    <BasicDropdown
                      items={MEDIA_TYPE_OPTIONS}
                      value={selectedLayer.props.mediaType ?? 'image'}
                      onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, mediaType: val } } as any)}
                    />
                  </div>
                  <label style={H2_STYLE}>Upload File</label>
                  <label style={{
                    display: 'block', padding: '12px', background: 'var(--bg-primary)',
                    border: '2px dashed var(--border-color)', borderRadius: '8px',
                    textAlign: 'center', cursor: 'pointer', fontSize: '12px',
                    color: 'var(--text-muted)', marginBottom: '10px',
                  }}>
                    {selectedLayer.props.src ? '✓ Change File' : 'Click to upload'}
                    <input type="file" accept={(selectedLayer.props.mediaType ?? 'image') === 'video' ? 'video/*' : 'image/*'} style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > MAX_FILE_SIZE_BYTES) {
                            alert(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 50MB limit. Please upload a file smaller than 50MB.`);
                            return;
                          }
                          const assetId = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
                          saveAsset(assetId, file, file.name).catch((err: any) => console.error(err));
                          updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, src: URL.createObjectURL(file), srcAssetId: assetId } } as any);
                        }
                      }} />
                  </label>
                  <label style={H2_STYLE}>Object Fit</label>
                  <div style={{ marginBottom: '10px' }}>
                    <BasicDropdown
                      items={OBJECT_FIT_OPTIONS}
                      value={selectedLayer.props.objectFit ?? 'contain'}
                      onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, objectFit: val } } as any)}
                    />
                  </div>
                  <label style={H2_STYLE}>Border Radius</label>
                  <input type="number" value={selectedLayer.props.borderRadius ?? 8}
                    onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, borderRadius: Number(e.target.value) } } as any)}
                    min={0} max={50} step={2}
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                </>
              )}

              {selectedLayer.templateId === 'video-upload' && (
                <>
                  {/* Video File Upload Dropzone */}
                  <h4 style={SECTION_HEADING_STYLE}>VIDEO FILE</h4>
                  <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '14px 12px', background: 'var(--bg-primary)',
                    border: '2px dashed var(--border-color)', borderRadius: '10px',
                    textAlign: 'center', cursor: 'pointer', fontSize: '12px',
                    color: 'var(--text-primary)', fontWeight: 600, marginBottom: '12px',
                    transition: 'all 0.15s ease',
                  }}>
                    {selectedLayer.props.src ? (
                      <>
                        <div style={{
                          width: '100%',
                          maxHeight: '110px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(0,0,0,0.3)',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          padding: '6px',
                          border: '1px solid var(--border-color)',
                        }}>
                          <video
                            src={selectedLayer.props.src}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '98px',
                              borderRadius: '4px',
                            }}
                            muted
                            playsInline
                          />
                        </div>
                        <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: 700 }}>✓ Video Loaded</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>Click to replace video file</span>
                      </>
                    ) : (
                      <>
                        <Film size={20} style={{ color: '#ffffff', marginBottom: '2px' }} />
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
                  <h4 style={SECTION_HEADING_STYLE}>PLAYBACK SETTINGS</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    {/* Loop Toggle */}
                    <button
                      type="button"
                      onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, loop: !(selectedLayer.props.loop ?? true) } } as any)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        fontWeight: 600,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        background: (selectedLayer.props.loop ?? true) ? '#FF9137' : 'transparent',
                        border: (selectedLayer.props.loop ?? true) ? 'none' : '1.5px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {(selectedLayer.props.loop ?? true) && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </div>
                      <span>Loop</span>
                    </button>

                    {/* Mute Toggle */}
                    <button
                      type="button"
                      onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, muted: !(selectedLayer.props.muted ?? true) } } as any)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        fontWeight: 600,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        background: (selectedLayer.props.muted ?? true) ? '#FF9137' : 'transparent',
                        border: (selectedLayer.props.muted ?? true) ? 'none' : '1.5px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {(selectedLayer.props.muted ?? true) && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </div>
                      <span>Muted</span>
                    </button>
                  </div>

                  {/* Styling */}
                  <h4 style={SECTION_HEADING_STYLE}>STYLING & BORDER</h4>
                  
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={H2_STYLE}>Border Radius</label>
                      <input type="number" value={selectedLayer.props.borderRadius ?? 12}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, borderRadius: Number(e.target.value) } } as any)}
                        min={0} max={60} step={2}
                        style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={H2_STYLE}>Border Width</label>
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
                  <h4 style={SECTION_HEADING_STYLE}>IMAGE FILE</h4>
                  <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '14px 12px', borderRadius: '8px', border: '2px dashed var(--border-color)',
                    background: 'rgba(255,255,255,0.02)', cursor: 'pointer', marginBottom: '12px',
                    color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, gap: '6px',
                  }}>
                    {selectedLayer.props.src ? (
                      <>
                        <div style={{
                          width: '100%',
                          maxHeight: '110px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(0,0,0,0.3)',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          padding: '6px',
                          border: '1px solid var(--border-color)',
                        }}>
                          <img
                            src={selectedLayer.props.src}
                            alt="Uploaded image thumbnail"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '98px',
                              objectFit: 'contain',
                              borderRadius: '4px',
                            }}
                          />
                        </div>
                        <span style={{ color: '#facc15', fontSize: '13px', fontWeight: 700 }}>✓ Image Loaded</span>
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

                  <div style={{ marginBottom: '10px' }}>
                    <label style={H2_STYLE}>Border Radius</label>
                    <input type="number" value={selectedLayer.props.borderRadius ?? 8}
                      onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, borderRadius: Number(e.target.value) } } as any)}
                      min={0} max={100} step={2}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px' }} />
                  </div>
                </>
              )}

              {selectedLayer.templateId === 'phone-device' && (
                <>
                  {/* Device Type & Animation in 2-column grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    <div>
                      <label style={H2_STYLE}>Device Type</label>
                      <BasicDropdown
                        items={DEVICE_TYPE_OPTIONS}
                        value={selectedLayer.props.deviceType ?? 'iphone'}
                        onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, deviceType: val } } as any)}
                      />
                    </div>
                    <div>
                      <label style={H2_STYLE}>Animation</label>
                      <BasicDropdown
                        items={PHONE_ANIMATION_OPTIONS}
                        value={selectedLayer.props.animationTemplate ?? 'float'}
                        onChange={(animName) => {
                          updateLayer(selectedLayer.id, {
                            props: { ...selectedLayer.props, animationTemplate: animName },
                          } as any);
                        }}
                      />
                    </div>
                  </div>

                  {/* Device Color */}
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={SECTION_HEADING_STYLE}>
                      DEVICE COLOR
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {['#ffffff', '#333333', '#6b7280', '#e3d5ca', '#991b1b', '#448AFF'].map((color, i) => {
                        const currentVal = selectedLayer.props.deviceColor ?? '#333333';
                        const isActive = currentVal.toLowerCase() === color.toLowerCase();
                        return (
                          <button
                            key={i}
                            type="button"
                            title={`Device Color ${color}`}
                            onClick={() => {
                              if (!isActive) {
                                updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, deviceColor: color } } as any);
                              }
                            }}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: color,
                              cursor: 'pointer',
                              border: isActive ? '2px solid var(--accent-primary, #3b82f6)' : '1px solid rgba(255,255,255,0.2)',
                              transform: isActive ? 'scale(1.15)' : 'scale(1)',
                              transition: 'all 0.2s ease',
                              boxShadow: color === '#ffffff' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                              outline: 'none',
                              padding: 0,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Screen Media Upload (Single Button) */}
                  <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '12px', background: 'var(--bg-primary)',
                    border: '1px dashed var(--border-color)', borderRadius: '8px',
                    textAlign: 'center', cursor: 'pointer', fontSize: '12px',
                    color: 'var(--text-primary)', fontWeight: 600, marginBottom: '12px',
                    transition: 'all 0.15s ease', width: '100%',
                  }}>
                    {selectedLayer.props.screenVideo ? (
                      <>
                        <div style={{
                          width: '100%',
                          maxHeight: '100px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(0,0,0,0.3)',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          padding: '4px',
                          border: '1px solid var(--border-color)',
                        }}>
                          <video
                            src={selectedLayer.props.screenVideo}
                            style={{ maxWidth: '100%', maxHeight: '90px', borderRadius: '4px' }}
                            muted
                            playsInline
                          />
                        </div>
                        <span style={{ color: '#ffffff', fontWeight: 700 }}>✓ Screen Video Loaded</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>(Click to change)</span>
                      </>
                    ) : selectedLayer.props.screenImage && selectedLayer.props.screenImage !== '/Drag_And_Drop.png' ? (
                      <>
                        <div style={{
                          width: '100%',
                          maxHeight: '100px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(0,0,0,0.3)',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          padding: '4px',
                          border: '1px solid var(--border-color)',
                        }}>
                          <img
                            src={selectedLayer.props.screenImage}
                            alt="Screen thumbnail"
                            style={{ maxWidth: '100%', maxHeight: '90px', objectFit: 'contain', borderRadius: '4px' }}
                          />
                        </div>
                        <span style={{ color: '#FF9137', fontWeight: 700 }}>✓ Screen Image Loaded</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>(Click to change)</span>
                      </>
                    ) : (
                      <>
                        <div style={{
                          width: '100%',
                          maxHeight: '100px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(0,0,0,0.04)',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          padding: '4px',
                          border: '1px dashed var(--border-color)',
                        }}>
                          <img
                            src="/Drag_And_Drop.png"
                            alt="Default Screen Placeholder"
                            style={{ maxWidth: '100%', maxHeight: '90px', objectFit: 'contain', borderRadius: '4px', opacity: 0.9 }}
                          />
                        </div>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>🖼️ Upload Image or Video</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>(Click to upload custom screen)</span>
                      </>
                    )}
                    <input type="file" accept="image/*,video/*" style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > MAX_FILE_SIZE_BYTES) {
                            alert(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 50MB limit. Please upload a file smaller than 50MB.`);
                            return;
                          }
                          const assetId = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
                          saveAsset(assetId, file, file.name).catch((err: any) => console.error(err));
                          const url = URL.createObjectURL(file);
                          if (file.type.startsWith('video/')) {
                            updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, screenVideo: url, screenVideoAssetId: assetId, screenImage: undefined, screenImageAssetId: undefined } } as any);
                          } else {
                            updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, screenImage: url, screenImageAssetId: assetId, screenVideo: undefined, screenVideoAssetId: undefined } } as any);
                          }
                        }
                      }} />
                  </label>

                  {/* Device Settings */}
                  <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '8px', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <h4 style={SECTION_HEADING_STYLE}>DEVICE SETTINGS</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const newPos = { ...selectedLayer.position, x: 50, y: 50 };
                          updateLayer(selectedLayer.id, { position: newPos, scale: 1, props: { ...selectedLayer.props, deviceSize: 1, size: 1, posX: 0, posY: 0, rotX: 0, rotY: 0, rotZ: 0 } } as any);
                        }}
                        title="Reset Device Settings"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--text-secondary, #6b7280)",
                          cursor: "pointer",
                          padding: "4px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--text-primary, #ffffff)";
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--text-secondary, #6b7280)";
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>

                    {/* Size Slider */}
                    <div style={{ marginBottom: '10px' }}>
                      <FastDeviceSlider
                        label="Size"
                        value={selectedLayer.props.deviceSize ?? selectedLayer.props.size ?? selectedLayer.scale ?? 1}
                        min={0.3}
                        max={3.0}
                        step={0.05}
                        unit="x"
                        formatDecimals={2}
                        resetValue={1}
                        onReset={() => {
                          updateLayer(selectedLayer.id, { scale: 1, props: { ...selectedLayer.props, deviceSize: 1, size: 1 } } as any);
                        }}
                        onChange={(val) => {
                          updateLayer(selectedLayer.id, { scale: val, props: { ...selectedLayer.props, deviceSize: val, size: val } } as any);
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <FastDeviceSlider
                        label="Pos X"
                        value={selectedLayer.props.posX ?? 0}
                        min={-2}
                        max={2}
                        step={0.05}
                        resetValue={0}
                        onReset={() => {
                          const newPos = { ...selectedLayer.position, x: 50 };
                          updateLayer(selectedLayer.id, { position: newPos, props: { ...selectedLayer.props, posX: 0 } } as any);
                        }}
                        onChange={(valX) => {
                          const newPos = { ...selectedLayer.position, x: 50 + valX * 40 };
                          updateLayer(selectedLayer.id, { position: newPos, props: { ...selectedLayer.props, posX: valX } } as any);
                        }}
                      />
                      <FastDeviceSlider
                        label="Pos Y"
                        value={selectedLayer.props.posY ?? 0}
                        min={-2}
                        max={2}
                        step={0.05}
                        resetValue={0}
                        onReset={() => {
                          const newPos = { ...selectedLayer.position, y: 50 };
                          updateLayer(selectedLayer.id, { position: newPos, props: { ...selectedLayer.props, posY: 0 } } as any);
                        }}
                        onChange={(valY) => {
                          const newPos = { ...selectedLayer.position, y: 50 - valY * 40 };
                          updateLayer(selectedLayer.id, { position: newPos, props: { ...selectedLayer.props, posY: valY } } as any);
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <FastDeviceSlider
                        label="Rot X"
                        value={selectedLayer.props.rotX ?? 0}
                        min={-180}
                        max={180}
                        step={1}
                        unit="°"
                        formatDecimals={0}
                        resetValue={0}
                        onReset={() => {
                          updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, rotX: 0 } } as any);
                        }}
                        onChange={(valRotX) => {
                          updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, rotX: valRotX } } as any);
                        }}
                      />
                      <FastDeviceSlider
                        label="Rot Y"
                        value={selectedLayer.props.rotY ?? 0}
                        min={-180}
                        max={180}
                        step={1}
                        unit="°"
                        formatDecimals={0}
                        resetValue={0}
                        onReset={() => {
                          updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, rotY: 0 } } as any);
                        }}
                        onChange={(valRotY) => {
                          updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, rotY: valRotY } } as any);
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <FastDeviceSlider
                          label="Rot Z"
                          value={selectedLayer.props.rotZ ?? 0}
                          min={-180}
                          max={180}
                          step={1}
                          unit="°"
                          formatDecimals={0}
                          resetValue={0}
                          onReset={() => {
                            updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, rotZ: 0 } } as any);
                          }}
                          onChange={(valRotZ) => {
                            updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, rotZ: valRotZ } } as any);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedLayer.templateId === 'masked-heading' && (
                <>
                  <label style={H2_STYLE}>Text</label>
                  <input type="text" value={selectedLayer.props.text ?? 'Designed in the details'}
                    onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, text: e.target.value } } as any)}
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '10px' }} />
                  <label style={H2_STYLE}>Media Type</label>
                  <div style={{ marginBottom: '10px' }}>
                    <BasicDropdown
                      items={MEDIA_TYPE_OPTIONS}
                      value={selectedLayer.props.mediaType ?? 'image'}
                      onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, mediaType: val } } as any)}
                    />
                  </div>
                  <label style={H2_STYLE}>Upload Media</label>
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
                        if (file) {
                          const assetId = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
                          saveAsset(assetId, file, file.name).catch((err: any) => console.error(err));
                          updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, src: URL.createObjectURL(file), srcAssetId: assetId } } as any);
                        }
                      }} />
                  </label>
                  <label style={H2_STYLE}>Reveal</label>
                  <div style={{ marginBottom: '10px' }}>
                    <BasicDropdown
                      items={MASKED_HEADING_REVEAL_OPTIONS}
                      value={selectedLayer.props.reveal ?? 'rise'}
                      onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, reveal: val } } as any)}
                    />
                  </div>
                  <label style={H2_STYLE}>Align</label>
                  <div style={{ marginBottom: '10px' }}>
                    <BasicDropdown
                      items={ALIGN_OPTIONS}
                      value={selectedLayer.props.align ?? 'center'}
                      onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, align: val } } as any)}
                    />
                  </div>
                  <label style={H2_STYLE}>Font</label>
                  <div style={{ marginBottom: '10px' }}>
                    <BasicDropdown
                      items={FONT_OPTIONS}
                      value={selectedLayer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'}
                      onChange={(val) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fontFamily: val } } as any)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={H2_STYLE}>Weight</label>
                      <input type="number" value={selectedLayer.props.weight ?? 700}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, weight: Number(e.target.value) } } as any)}
                        min={100} max={900} step={100}
                        style={{ width: '100%', height: '36px', padding: '0 8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ width: '60px' }}>
                      <label style={{ ...H2_STYLE, textAlign: 'center' }}>Italic</label>
                      <button
                        type="button"
                        onClick={() => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, isItalic: !selectedLayer.props.isItalic } } as any)}
                        style={{
                          width: '100%',
                          height: '36px',
                          background: selectedLayer.props.isItalic ? '#0F172A' : 'var(--bg-primary)',
                          border: selectedLayer.props.isItalic ? '1px solid #0F172A' : '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: selectedLayer.props.isItalic ? '#FFFFFF' : 'var(--text-primary)',
                          fontSize: '13px',
                          fontStyle: 'italic',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: selectedLayer.props.isItalic ? '0 2px 6px rgba(15, 23, 42, 0.25)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                        title="Toggle Italic"
                      >
                        I
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={H2_STYLE}>Parallax</label>
                      <input type="number" value={selectedLayer.props.parallax ?? 26}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, parallax: Number(e.target.value) } } as any)}
                        min={0} max={80} step={2}
                        style={{ width: '100%', height: '36px', padding: '0 8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={H2_STYLE}>Drift</label>
                      <input type="number" value={selectedLayer.props.drift ?? 18}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, drift: Number(e.target.value) } } as any)}
                        min={0} max={50} step={2}
                        style={{ width: '100%', height: '36px', padding: '0 8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={H2_STYLE}>Fill Scale</label>
                      <input type="number" value={selectedLayer.props.fillScale ?? 1.25}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, fillScale: Number(e.target.value) } } as any)}
                        min={1} max={2} step={0.05}
                        style={{ width: '100%', height: '36px', padding: '0 8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={H2_STYLE}>Brightness</label>
                      <input type="number" value={selectedLayer.props.brightness ?? 1}
                        onChange={(e) => updateLayer(selectedLayer.id, { props: { ...selectedLayer.props, brightness: Number(e.target.value) } } as any)}
                        min={0.2} max={2} step={0.1}
                        style={{ width: '100%', height: '36px', padding: '0 8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px', cursor: 'pointer' }}>
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

        {!isComponentMode && !isSceneMode && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '12px' }}>
            Select a scene or component to view properties
          </div>
        )}
      </div>

      {/* Pinned Bottom Footer Action */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-secondary)', flexShrink: 0 }}>
        <button
          onClick={() => addScene()}
          className="mg-btn-interactive"
          style={{
            width: '100%',
            height: '38px',
            background: '#FFCC4D',
            color: '#0F172A',
            border: '1px solid rgba(15, 23, 42, 0.1)',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 2px 6px rgba(255, 204, 77, 0.3)',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F5B800';
            e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFCC4D';
            e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.1)';
          }}
          title="Add a new scene"
        >
          <Plus size={15} strokeWidth={2.5} style={{ color: '#0F172A' }} />
          Add Scene
        </button>
        <button
          type="button"
          onClick={() => dispatch({ isPickerOpen: true, activeSidebarTab: 'components' })}
          className="mg-btn-interactive"
          style={{
            width: '100%',
            height: '38px',
            background: '#FF9137',
            color: '#0F172A',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 2px 10px rgba(255, 145, 55, 0.3)',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#E6791E';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 145, 55, 0.45)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FF9137';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(255, 145, 55, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          title="Add a component to current scene"
        >
          <Plus size={15} strokeWidth={2.5} style={{ color: '#0F172A' }} />
          Add Component
        </button>
      </div>
    </div>
  );
});
