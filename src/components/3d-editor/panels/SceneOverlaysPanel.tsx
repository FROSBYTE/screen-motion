'use client';

import React, { useState } from 'react';
import { useAppState } from '@/store';
import { Play, ChevronDown, Bold, Trash2, RotateCcw, Plus, GripVertical, Copy } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import BasicDropdown from '../../smoothui/basic-dropdown';
import type { TextOverlay, ImageOverlay } from '@/types';
import { getDuplicateName } from '@/lib/utils';

const fontItems = [
  { id: '"Plus Jakarta Sans", sans-serif', label: 'Plus Jakarta Sans', fontFamily: '"Plus Jakarta Sans", sans-serif' },
  { id: '"Inter", sans-serif', label: 'Inter', fontFamily: '"Inter", sans-serif' },
  { id: '"Outfit", sans-serif', label: 'Outfit', fontFamily: '"Outfit", sans-serif' },
  { id: '"Poppins", sans-serif', label: 'Poppins', fontFamily: '"Poppins", sans-serif' },
  { id: '"Space Grotesk", sans-serif', label: 'Space Grotesk', fontFamily: '"Space Grotesk", sans-serif' },
  { id: '"Sora", sans-serif', label: 'Sora', fontFamily: '"Sora", sans-serif' },
  { id: '"Playfair Display", serif', label: 'Playfair Display', fontFamily: '"Playfair Display", serif' },
  { id: '"Bricolage Grotesk", sans-serif', label: 'Bricolage Grotesk', fontFamily: '"Bricolage Grotesk", sans-serif' },
  { id: '"Roboto", sans-serif', label: 'Roboto', fontFamily: '"Roboto", sans-serif' },
  { id: 'monospace', label: 'Monospace', fontFamily: 'monospace' },
];

const animationItems = [
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
  { id: 'depth-parallax-words', label: 'Depth Parallax' },
  { id: 'fade-through', label: 'Fade Through' },
  { id: 'focus-blur-resolve', label: 'Focus Blur Resolve' },
  { id: 'micro-scale-fade', label: 'Micro Scale Fade' },
  { id: 'scale-down-fade', label: 'Scale Down Fade' },
  { id: 'per-character-rise', label: 'Per Char Rise' },
  { id: 'per-word-crossfade', label: 'Per Word Crossfade' },
  { id: 'text-reveal', label: 'Text Reveal' },
  // Temporarily disabled per user request - DO NOT DELETE during cleanup
  // { id: 'dia-text-reveal', label: 'Dia Text Reveal' },
];

const imageAnimationItems = [
  { id: 'none', label: 'None (Static)' },
  { id: 'fade-in-out', label: 'Fade In/Out' },
  { id: 'bounce', label: 'Bounce' },
  { id: 'spin', label: 'Spin' },
];

export interface UnifiedOverlayItem {
  id: string;
  kind: 'text' | 'image';
  textData?: TextOverlay;
  imageData?: ImageOverlay;
  order: number;
}

interface SceneOverlaysPanelProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function SceneOverlaysPanel({ fileInputRef }: SceneOverlaysPanelProps) {
  const { state, dispatch } = useAppState();
  const { scene, selectedTextId } = state;
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const texts = scene.texts || [];
  const images = scene.images || [];

  // Automatically expand selected item and collapse all others when selectedTextId changes
  React.useEffect(() => {
    if (selectedTextId) {
      setExpandedCards({ [selectedTextId]: true });
    }
  }, [selectedTextId]);

  // Build combined list
  const combinedItems: UnifiedOverlayItem[] = [
    ...texts.map((t, idx) => ({
      id: t.id,
      kind: 'text' as const,
      textData: t,
      order: t.order ?? idx,
    })),
    ...images.map((img, idx) => ({
      id: img.id,
      kind: 'image' as const,
      imageData: img,
      order: img.order ?? (texts.length + idx),
    })),
  ].sort((a, b) => a.order - b.order);

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      if (prev[id]) {
        return {};
      } else {
        return { [id]: true };
      }
    });
    dispatch({ selectedTextId: id });
  };

  const handleReorder = (newItems: UnifiedOverlayItem[]) => {
    const updatedTexts: TextOverlay[] = [];
    const updatedImages: ImageOverlay[] = [];

    newItems.forEach((item, index) => {
      if (item.kind === 'text' && item.textData) {
        updatedTexts.push({ ...item.textData, order: index });
      } else if (item.kind === 'image' && item.imageData) {
        updatedImages.push({ ...item.imageData, order: index });
      }
    });

    dispatch({
      scene: {
        texts: updatedTexts,
        images: updatedImages,
      },
    });
  };

  const handleAddText = () => {
    const newId = Math.random().toString(36).substring(7);
    const newText: TextOverlay = {
      id: newId,
      text: 'New Text',
      position: [0, 0, 1],
      rotation: [0, 0, 0],
      color: '#000000',
      fontSize: 10,
      animationType: 'none',
      animationSpeed: 1,
      isBold: true,
      fontFamily: fontItems[0].id,
      order: combinedItems.length,
    };
    dispatch({ scene: { texts: [...texts, newText] }, selectedTextId: newId });
    setExpandedCards({ [newId]: true });
  };

  return (
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {combinedItems.length > 0 ? (
        <Reorder.Group
          axis="y"
          values={combinedItems}
          onReorder={handleReorder}
          style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 0, margin: 0, listStyle: 'none' }}
        >
          {combinedItems.map((item, index) => {
            const isExpanded = !!expandedCards[item.id];
            const isText = item.kind === 'text' && item.textData;
            const isImage = item.kind === 'image' && item.imageData;
            const t = item.textData;
            const img = item.imageData;

            return (
              <Reorder.Item
                key={item.id}
                value={item}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color, rgba(0, 0, 0, 0.08))',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  userSelect: 'none',
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {/* Left: Drag Handle & Title */}
                  <div 
                    onClick={() => toggleCard(item.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, cursor: 'pointer' }}
                  >
                    <div style={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: 'var(--text-secondary, #6b7280)' }}>
                      <GripVertical size={16} />
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '120px',
                      }}
                    >
                      {isText ? t?.text || 'New Text' : `Image ${index + 1}`}
                    </span>
                  </div>

                  {/* Right Action Bar: Bold, Reset, Color, Play, Duplicate, Expand Chevron */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* 0. Bold Button (Text items) */}
                    {isText && t && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          let nextBold = true;
                          let nextLevel: 'half' | 'full' | undefined = 'full';
                          let nextWeight = 800;
                          if (t.isBold !== false && (t.boldLevel === 'full' || (!t.boldLevel && t.fontWeight !== 550))) {
                            nextBold = true;
                            nextLevel = 'half';
                            nextWeight = 550;
                          } else if (t.isBold !== false && (t.boldLevel === 'half' || t.fontWeight === 550)) {
                            nextBold = false;
                            nextLevel = undefined;
                            nextWeight = 300;
                          } else {
                            nextBold = true;
                            nextLevel = 'full';
                            nextWeight = 800;
                          }
                          const newTexts = texts.map((tx) => (tx.id === t.id ? { ...tx, isBold: nextBold, boldLevel: nextLevel, fontWeight: nextWeight } : tx));
                          dispatch({ scene: { texts: newTexts } });
                        }}
                        title={t.isBold === false ? 'Normal (Click for Full Bold)' : (t.boldLevel === 'half' ? 'Half Bold (Click for Normal)' : 'Full Bold (Click for Half Bold)')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 28,
                          height: 28,
                          borderRadius: '6px',
                          border: '1px solid var(--border-color, rgba(0, 0, 0, 0.08))',
                          background: t.isBold !== false ? 'rgba(0,0,0,0.12)' : 'var(--bg-secondary, #f3f4f6)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: t.boldLevel === 'half' ? 600 : 800,
                        }}
                      >
                        {t.boldLevel === 'half' ? (
                          <span style={{ fontSize: '10px', fontWeight: 600, fontFamily: 'var(--font-mono, monospace)' }}>H</span>
                        ) : (
                          <Bold size={14} />
                        )}
                      </button>
                    )}

                    {/* 1. Reset Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isText && t) {
                          const newTexts = texts.map((tx) => (tx.id === t.id ? { ...tx, rotation: [0, 0, 0] as [number, number, number] } : tx));
                          dispatch({ scene: { texts: newTexts } });
                        } else if (isImage && img) {
                          const newImages = images.map((i) => (i.id === img.id ? { ...i, rotation: [0, 0, 0] as [number, number, number], scale: 1 } : i));
                          dispatch({ scene: { images: newImages } });
                        }
                      }}
                      title="Reset Transforms"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: '6px',
                        border: '1px solid var(--border-color, rgba(0, 0, 0, 0.08))',
                        background: 'var(--bg-secondary, #f3f4f6)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                      }}
                    >
                      <RotateCcw size={14} />
                    </button>

                    {/* 2. Color Swatch (Text) or Placeholder Box (Image) */}
                    {isText && t ? (
                      <div
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'relative',
                          width: 28,
                          height: 28,
                          borderRadius: '6px',
                          border: '1px solid var(--border-color, rgba(0,0,0,0.08))',
                          background: t.color || '#000000',
                          overflow: 'hidden',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="color"
                          value={t.color || '#000000'}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const newTexts = texts.map((tx) => (tx.id === t.id ? { ...tx, color: e.target.value } : tx));
                            dispatch({ scene: { texts: newTexts } });
                          }}
                          style={{
                            position: 'absolute',
                            top: -10,
                            left: -10,
                            width: 50,
                            height: 50,
                            opacity: 0,
                            cursor: 'pointer',
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '6px',
                          border: '1px solid var(--border-color, rgba(0,0,0,0.08))',
                          background: 'rgba(0,0,0,0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        IMG
                      </div>
                    )}

                    {/* 3. Play Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isText && t) {
                          const newTexts = texts.map((tx) => (tx.id === t.id ? { ...tx, previewTrigger: Date.now() } : tx));
                          dispatch({ scene: { texts: newTexts } });
                        } else if (isImage && img) {
                          const newImages = images.map((i) => (i.id === img.id ? { ...i, previewTrigger: Date.now() } : i));
                          dispatch({ scene: { images: newImages } });
                        }
                      }}
                      title="Preview Animation"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: '6px',
                        border: '1px solid var(--border-color, rgba(0, 0, 0, 0.08))',
                        background: 'var(--bg-secondary, #f3f4f6)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                      }}
                    >
                      <Play size={14} />
                    </button>

                    {/* 3.5. Duplicate Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isText && t) {
                          const newId = 'text-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
                          const duplicatedText: TextOverlay = {
                            ...t,
                            id: newId,
                            text: getDuplicateName(t.text, texts.map((item) => item.text)),
                            position: [t.position[0] + 0.15, t.position[1] - 0.15, t.position[2]],
                            order: combinedItems.length,
                          };
                          dispatch({ scene: { texts: [...texts, duplicatedText] }, selectedTextId: newId });
                          setExpandedCards({ [newId]: true });
                        } else if (isImage && img) {
                          const newId = 'img-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
                          const duplicatedImg: ImageOverlay = {
                            ...img,
                            id: newId,
                            position: [img.position[0] + 0.15, img.position[1] - 0.15, img.position[2]],
                            order: combinedItems.length,
                          };
                          dispatch({ scene: { images: [...images, duplicatedImg] }, selectedTextId: newId });
                          setExpandedCards({ [newId]: true });
                        }
                      }}
                      title="Duplicate Item"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: '6px',
                        border: '1px solid var(--border-color, rgba(0, 0, 0, 0.08))',
                        background: 'var(--bg-secondary, #f3f4f6)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                      }}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                {/* Expanded Card Body */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key={`card-body-${item.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-color, rgba(0, 0, 0, 0.06))' }}>
                      {isText && t && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <textarea
                            value={t.text}
                            onChange={(e) => {
                              const newTexts = texts.map((tx) => (tx.id === t.id ? { ...tx, text: e.target.value, textUpdatedAt: Date.now() } : tx));
                              dispatch({ scene: { texts: newTexts } });
                            }}
                            rows={2}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-primary, #ffffff)',
                              color: 'var(--text-primary)',
                              fontSize: '12px',
                              resize: 'vertical',
                            }}
                          />

                          {/* Font Family & Animation Dropdowns Side-by-Side */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <BasicDropdown
                              compact={true}
                              items={fontItems}
                              value={fontItems.find((f) => f.id === t.fontFamily || f.label.toLowerCase() === t.fontFamily?.toLowerCase())?.id || fontItems[0].id}
                              onChange={(val) => {
                                const newTexts = texts.map((tx) => (tx.id === t.id ? { ...tx, fontFamily: val } : tx));
                                dispatch({ scene: { texts: newTexts } });
                              }}
                            />
                            <BasicDropdown
                              compact={true}
                              items={animationItems}
                              value={t.animationType}
                              onChange={(val) => {
                                const newTexts = texts.map((tx) => (tx.id === t.id ? { ...tx, animationType: val as any, previewTrigger: Date.now() } : tx));
                                dispatch({ scene: { texts: newTexts } });
                              }}
                            />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* Speed Slider */}
                            <div className="slider-control">
                              <div className="slider-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span className="slider-label" style={{ fontSize: '12.8px' }}>Speed</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <span className="slider-value" style={{ fontSize: '12.8px' }}>{t.animationSpeed.toFixed(1)}×</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newTexts = texts.map((tx) => (tx.id === t.id ? { ...tx, animationSpeed: 1 } : tx));
                                      dispatch({ scene: { texts: newTexts } });
                                    }}
                                    title="Reset Speed to 1.0×"
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: 'var(--text-secondary)',
                                      cursor: 'pointer',
                                      padding: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      opacity: t.animationSpeed !== 1 ? 1 : 0.35,
                                    }}
                                  >
                                    <RotateCcw size={10} />
                                  </button>
                                </div>
                              </div>
                              <input
                                type="range"
                                min="0.1"
                                max="3"
                                step="0.1"
                                value={t.animationSpeed}
                                onChange={(e) => {
                                  const newTexts = texts.map((tx) => (tx.id === t.id ? { ...tx, animationSpeed: parseFloat(e.target.value) } : tx));
                                  dispatch({ scene: { texts: newTexts } });
                                }}
                                style={{ width: '100%', height: 4, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                              />
                            </div>

                            {/* Delay Slider */}
                            <div className="slider-control">
                              <div className="slider-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span className="slider-label" style={{ fontSize: '12.8px' }}>Delay</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <span className="slider-value" style={{ fontSize: '12.8px' }}>{(t.delay || 0).toFixed(1)}s</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newTexts = texts.map((tx) => (tx.id === t.id ? { ...tx, delay: 0 } : tx));
                                      dispatch({ scene: { texts: newTexts } });
                                    }}
                                    title="Reset Delay to 0.0s"
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: 'var(--text-secondary)',
                                      cursor: 'pointer',
                                      padding: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      opacity: (t.delay || 0) !== 0 ? 1 : 0.35,
                                    }}
                                  >
                                    <RotateCcw size={10} />
                                  </button>
                                </div>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="5"
                                step="0.1"
                                value={t.delay || 0}
                                onChange={(e) => {
                                  const newTexts = texts.map((tx) => (tx.id === t.id ? { ...tx, delay: parseFloat(e.target.value) } : tx));
                                  dispatch({ scene: { texts: newTexts } });
                                }}
                                style={{ width: '100%', height: 4, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                              />
                            </div>

                            {/* Size Slider */}
                            <div className="slider-control">
                              <div className="slider-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span className="slider-label" style={{ fontSize: '12.8px' }}>Size</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <span className="slider-value" style={{ fontSize: '12.8px' }}>{t.fontSize}pt</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newTexts = texts.map((tx) => (tx.id === t.id ? { ...tx, fontSize: 10 } : tx));
                                      dispatch({ scene: { texts: newTexts } });
                                    }}
                                    title="Reset Size to 10pt"
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: 'var(--text-secondary)',
                                      cursor: 'pointer',
                                      padding: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      opacity: t.fontSize !== 10 ? 1 : 0.35,
                                    }}
                                  >
                                    <RotateCcw size={10} />
                                  </button>
                                </div>
                              </div>
                              <input
                                type="range"
                                min="4"
                                max="24"
                                step="0.5"
                                value={t.fontSize}
                                onChange={(e) => {
                                  const newTexts = texts.map((tx) => (tx.id === t.id ? { ...tx, fontSize: parseFloat(e.target.value) } : tx));
                                  dispatch({ scene: { texts: newTexts } });
                                }}
                                style={{ width: '100%', height: 4, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                              />
                            </div>

                            {/* Rot Z Slider */}
                            <div className="slider-control">
                              <div className="slider-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span className="slider-label" style={{ fontSize: '12.8px' }}>Rot Z</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <span className="slider-value" style={{ fontSize: '12.8px' }}>
                                    {Math.round((((Array.isArray(t.rotation) ? t.rotation[2] : t.rotation) || 0) * 180) / Math.PI)}°
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newTexts = texts.map((tx) =>
                                        tx.id === t.id ? { ...tx, rotation: [tx.rotation[0], tx.rotation[1], 0] as [number, number, number] } : tx
                                      );
                                      dispatch({ scene: { texts: newTexts } });
                                    }}
                                    title="Reset Rot Z to 0°"
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: 'var(--text-secondary)',
                                      cursor: 'pointer',
                                      padding: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      opacity: (((Array.isArray(t.rotation) ? t.rotation[2] : t.rotation) || 0) !== 0) ? 1 : 0.35,
                                    }}
                                  >
                                    <RotateCcw size={10} />
                                  </button>
                                </div>
                              </div>
                              <input
                                type="range"
                                min="-180"
                                max="180"
                                step="1"
                                value={Math.round((((Array.isArray(t.rotation) ? t.rotation[2] : t.rotation) || 0) * 180) / Math.PI)}
                                onChange={(e) => {
                                  const degrees = parseFloat(e.target.value);
                                  const radians = (degrees * Math.PI) / 180;
                                  const newTexts = texts.map((tx) =>
                                    tx.id === t.id ? { ...tx, rotation: [tx.rotation[0], tx.rotation[1], radians] as [number, number, number] } : tx
                                  );
                                  dispatch({ scene: { texts: newTexts } });
                                }}
                                style={{ width: '100%', height: 4, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                              />
                            </div>
                          </div>

                          {/* Rectangle Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch({ scene: { texts: texts.filter((tx) => tx.id !== t.id) } });
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              marginTop: 4,
                              borderRadius: '8px',
                              border: '1px solid rgba(255, 68, 68, 0.3)',
                              background: 'rgba(255, 68, 68, 0.08)',
                              color: '#ff4444',
                              fontWeight: 700,
                              fontSize: '12.8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={14} />
                            Delete Text
                          </button>
                        </div>
                      )}

                      {isImage && img && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <BasicDropdown
                            compact={true}
                            items={imageAnimationItems}
                            value={img.animationType}
                            onChange={(val) => {
                              const newImages = images.map((i) => (i.id === img.id ? { ...i, animationType: val as any, previewTrigger: Date.now() } : i));
                              dispatch({ scene: { images: newImages } });
                            }}
                          />

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* Speed Slider */}
                            <div className="slider-control">
                              <div className="slider-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span className="slider-label" style={{ fontSize: '12.8px' }}>Speed</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <span className="slider-value" style={{ fontSize: '12.8px' }}>{img.animationSpeed.toFixed(1)}×</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newImages = images.map((i) => (i.id === img.id ? { ...i, animationSpeed: 1 } : i));
                                      dispatch({ scene: { images: newImages } });
                                    }}
                                    title="Reset Speed to 1.0×"
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: 'var(--text-secondary)',
                                      cursor: 'pointer',
                                      padding: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      opacity: img.animationSpeed !== 1 ? 1 : 0.35,
                                    }}
                                  >
                                    <RotateCcw size={10} />
                                  </button>
                                </div>
                              </div>
                              <input
                                type="range"
                                min="0.1"
                                max="3"
                                step="0.1"
                                value={img.animationSpeed}
                                onChange={(e) => {
                                  const newImages = images.map((i) => (i.id === img.id ? { ...i, animationSpeed: parseFloat(e.target.value) } : i));
                                  dispatch({ scene: { images: newImages } });
                                }}
                                style={{ width: '100%', height: 4, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                              />
                            </div>

                            {/* Delay Slider */}
                            <div className="slider-control">
                              <div className="slider-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span className="slider-label" style={{ fontSize: '12.8px' }}>Delay</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <span className="slider-value" style={{ fontSize: '12.8px' }}>{(img.delay || 0).toFixed(1)}s</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newImages = images.map((i) => (i.id === img.id ? { ...i, delay: 0 } : i));
                                      dispatch({ scene: { images: newImages } });
                                    }}
                                    title="Reset Delay to 0.0s"
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: 'var(--text-secondary)',
                                      cursor: 'pointer',
                                      padding: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      opacity: (img.delay || 0) !== 0 ? 1 : 0.35,
                                    }}
                                  >
                                    <RotateCcw size={10} />
                                  </button>
                                </div>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="5"
                                step="0.1"
                                value={img.delay || 0}
                                onChange={(e) => {
                                  const newImages = images.map((i) => (i.id === img.id ? { ...i, delay: parseFloat(e.target.value) } : i));
                                  dispatch({ scene: { images: newImages } });
                                }}
                                style={{ width: '100%', height: 4, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                              />
                            </div>

                            {/* Scale Slider */}
                            <div className="slider-control">
                              <div className="slider-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span className="slider-label" style={{ fontSize: '12.8px' }}>Scale</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <span className="slider-value" style={{ fontSize: '12.8px' }}>{(img.scale || 1).toFixed(2)}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newImages = images.map((i) => (i.id === img.id ? { ...i, scale: 1 } : i));
                                      dispatch({ scene: { images: newImages } });
                                    }}
                                    title="Reset Scale to 1.00"
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: 'var(--text-secondary)',
                                      cursor: 'pointer',
                                      padding: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      opacity: (img.scale || 1) !== 1 ? 1 : 0.35,
                                    }}
                                  >
                                    <RotateCcw size={10} />
                                  </button>
                                </div>
                              </div>
                              <input
                                type="range"
                                min="0.1"
                                max="3"
                                step="0.1"
                                value={img.scale || 1}
                                onChange={(e) => {
                                  const newImages = images.map((i) => (i.id === img.id ? { ...i, scale: parseFloat(e.target.value) } : i));
                                  dispatch({ scene: { images: newImages } });
                                }}
                                style={{ width: '100%', height: 4, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                              />
                            </div>

                            {/* Rot Z Slider */}
                            <div className="slider-control">
                              <div className="slider-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span className="slider-label" style={{ fontSize: '12.8px' }}>Rot Z</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <span className="slider-value" style={{ fontSize: '12.8px' }}>
                                    {Math.round((((Array.isArray(img.rotation) ? img.rotation[2] : img.rotation) || 0) * 180) / Math.PI)}°
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newImages = images.map((i) =>
                                        i.id === img.id ? { ...i, rotation: [i.rotation[0], i.rotation[1], 0] as [number, number, number] } : i
                                      );
                                      dispatch({ scene: { images: newImages } });
                                    }}
                                    title="Reset Rot Z to 0°"
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: 'var(--text-secondary)',
                                      cursor: 'pointer',
                                      padding: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      opacity: (((Array.isArray(img.rotation) ? img.rotation[2] : img.rotation) || 0) !== 0) ? 1 : 0.35,
                                    }}
                                  >
                                    <RotateCcw size={10} />
                                  </button>
                                </div>
                              </div>
                              <input
                                type="range"
                                min="-180"
                                max="180"
                                step="1"
                                value={Math.round((((Array.isArray(img.rotation) ? img.rotation[2] : img.rotation) || 0) * 180) / Math.PI)}
                                onChange={(e) => {
                                  const radians = (parseFloat(e.target.value) * Math.PI) / 180;
                                  const newImages = images.map((i) =>
                                    i.id === img.id ? { ...i, rotation: [i.rotation[0], i.rotation[1], radians] as [number, number, number] } : i
                                  );
                                  dispatch({ scene: { images: newImages } });
                                }}
                                style={{ width: '100%', height: 4, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                              />
                            </div>
                          </div>

                          {/* Rectangle Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch({ scene: { images: images.filter((i) => i.id !== img.id) } });
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              marginTop: 4,
                              borderRadius: '8px',
                              border: '1px solid rgba(255, 68, 68, 0.3)',
                              background: 'rgba(255, 68, 68, 0.08)',
                              color: '#ff4444',
                              fontWeight: 700,
                              fontSize: '12.8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={14} />
                            Delete Image
                          </button>
                        </div>
                      )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      ) : (
        <div style={{ padding: '18px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14.4px', fontWeight: 500 }}>
          No components added yet
        </div>
      )}

      {/* Bottom Buttons: Add Text & New Image */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button
          type="button"
          onClick={handleAddText}
          style={{
            flex: 1,
            fontSize: '12px',
            padding: '8px 12px',
            borderRadius: '9999px',
            cursor: 'pointer',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary, #f3f4f6)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--text-primary)';
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #f3f4f6)';
          }}
        >
          <Plus size={14} />
          Add Text
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            flex: 1,
            fontSize: '12px',
            padding: '8px 12px',
            borderRadius: '9999px',
            cursor: 'pointer',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary, #f3f4f6)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--text-primary)';
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #f3f4f6)';
          }}
        >
          <Plus size={14} />
          New Image
        </button>
      </div>
    </div>
  );
}
