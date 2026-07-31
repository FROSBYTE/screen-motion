'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useAppState } from '@/store';
import type { TextOverlay, ElementBounds3D } from '@/types';
import { calculateSnapPosition, getElementBounds3D } from '@/lib/alignment';
import { useAlignmentGuides } from '@/context/AlignmentContext';
import { TextAnimate } from '@/components/ui/text-animate';
import { TypingAnimation } from '@/components/ui/typing-animation';
import { TextReveal } from '@/components/ui/text-reveal';
import BottomUpLetters from '@/components/smoothui/bottom-up-letters';
import KineticCenterBuild from '@/components/smoothui/kinetic-center-build';
import LineByLineSlide from '@/components/smoothui/line-by-line-slide';
import MaskRevealUp from '@/components/smoothui/mask-reveal-up';
import RevealText from '@/components/smoothui/reveal-text';
import ShortSlideDown from '@/components/smoothui/short-slide-down';

function ShortSlideDownWrapper({ children, speed = 1 }: { children?: string; speed?: number }) {
  const text = children || '';
  return <ShortSlideDown phrases={[text]} interval={2500 / speed} />;
}

const smoothAnimMap: Record<string, React.FC<any>> = {
  'bottom-up-letters': BottomUpLetters,
  'kinetic-center-build': KineticCenterBuild,
  'line-by-line-slide': LineByLineSlide,
  'mask-reveal-up': MaskRevealUp,
  'reveal-text': RevealText,
  'short-slide-down': ShortSlideDownWrapper,
};

export const ENABLED_ANIMATIONS = new Set<string>([
  'bottom-up-letters',
  'kinetic-center-build',
  'line-by-line-slide',
  'mask-reveal-up',
  'reveal-text',
  'short-slide-down',
]);

const legacyMap: Record<string, string> = {
  'fade': 'reveal-text',
  'slide-up': 'mask-reveal-up',
  'typewriter': 'bottom-up-letters',
  'scale': 'kinetic-center-build',
  'text-animate': 'reveal-text',
  'typing-animation': 'bottom-up-letters',
  'focus-blur-resolve': 'reveal-text',
  'depth-parallax-words': 'line-by-line-slide',
  'per-word-crossfade': 'reveal-text',
};

function OverlayText({
  config,
  allTexts,
  allImages,
  isSelected,
  onSelect,
  updateConfig,
  containerRef,
  globalPreviewTrigger,
  setActiveGuides,
  clearGuides,
}: {
  config: TextOverlay;
  allTexts: TextOverlay[];
  allImages: any[];
  isSelected: boolean;
  onSelect: () => void;
  updateConfig: (updates: Partial<TextOverlay> & { delete?: boolean }) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  globalPreviewTrigger?: number;
  setActiveGuides: (guides: any[]) => void;
  clearGuides: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: config.position[0],
      posY: config.position[1],
    };
  };

  const configRef = useRef(config);
  configRef.current = config;
  const updateConfigRef = useRef(updateConfig);
  updateConfigRef.current = updateConfig;
  const allTextsRef = useRef(allTexts);
  allTextsRef.current = allTexts;
  const allImagesRef = useRef(allImages);
  allImagesRef.current = allImages;
  const setActiveGuidesRef = useRef(setActiveGuides);
  setActiveGuidesRef.current = setActiveGuides;
  const clearGuidesRef = useRef(clearGuides);
  clearGuidesRef.current = clearGuides;

  useEffect(() => {
    if (!isDragging) return;

    let rafId: number;
    const handlePointerMove = (e: PointerEvent) => {
      const container = containerRef.current;
      const rect = container ? container.getBoundingClientRect() : { width: 800, height: 600 };
      const aspect = rect.height > 0 ? rect.width / rect.height : 1.777;

      const viewHeight = 3.3;
      const viewWidth = 3.3 * aspect;

      const rawDx = (e.clientX - dragStart.current.mouseX) * (viewWidth / rect.width);
      const rawDy = -(e.clientY - dragStart.current.mouseY) * (viewHeight / rect.height);

      const rawX = dragStart.current.posX + rawDx;
      const rawY = dragStart.current.posY + rawDy;

      const otherBounds: ElementBounds3D[] = [];
      if (container) {
        allTextsRef.current.forEach((t) => {
          if (t.id === configRef.current.id) return;
          const el = container.querySelector(`[data-overlay-id="${t.id}"]`) as HTMLElement | null;
          otherBounds.push(getElementBounds3D(t.id, t.position, el, rect.width, rect.height));
        });
        allImagesRef.current.forEach((img) => {
          const el = container.querySelector(`[data-overlay-id="${img.id}"]`) as HTMLElement | null;
          otherBounds.push(getElementBounds3D(img.id, img.position, el, rect.width, rect.height));
        });
      }

      const activeEl = elementRef.current;
      const activeWidthPx = activeEl ? activeEl.offsetWidth : 100;
      const activeHeightPx = activeEl ? activeEl.offsetHeight : 40;

      const snapResult = calculateSnapPosition(
        configRef.current.id,
        rawX,
        rawY,
        activeWidthPx,
        activeHeightPx,
        otherBounds,
        rect.width,
        rect.height,
        8
      );

      setActiveGuidesRef.current(snapResult.guides);

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updateConfigRef.current({
          position: [
            snapResult.x,
            snapResult.y,
            configRef.current.position[2],
          ],
        });
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      clearGuidesRef.current();
      if (rafId) cancelAnimationFrame(rafId);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      clearGuidesRef.current();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isDragging, containerRef]);

  const container = containerRef.current;
  const rect = container ? container.getBoundingClientRect() : { width: 800, height: 600 };
  const aspect = rect.height > 0 ? rect.width / rect.height : 1.777;
  const viewHeight = 3.3;
  const viewWidth = 3.3 * aspect;

  // Convert 3D position [x, y, z] to percentage relative to container center
  const leftPercent = 50 + (config.position[0] / viewWidth) * 100;
  const topPercent = 50 - (config.position[1] / viewHeight) * 100;
  const rotZDeg = ((config.rotation?.[2] || 0) * 180) / Math.PI;

  const fontSizePx = Math.max(0.01, Math.abs(config.fontSize)) * 3.2;
  const showSelectionUI = isHovered || isSelected || isDragging;
  
  const globalTrigger = globalPreviewTrigger || 0;
  const localTrigger = config.previewTrigger || 0;
  const animTrigger = Math.max(globalTrigger, localTrigger);

  const delaySec = config.delay || 0;
  const isEditingNow = !!(config.textUpdatedAt && config.textUpdatedAt > animTrigger);
  const effectiveType = legacyMap[config.animationType] || config.animationType;
  const isAnimEnabled = ENABLED_ANIMATIONS.has(effectiveType);
  const shouldAnimate = config.animationType && config.animationType !== 'none' && isAnimEnabled && !isEditingNow;

  const [isDelayPassed, setIsDelayPassed] = useState(() => !shouldAnimate || delaySec <= 0);

  useEffect(() => {
    if (!shouldAnimate || delaySec <= 0) {
      setIsDelayPassed(true);
      return;
    }
    setIsDelayPassed(false);
    const timer = setTimeout(() => {
      setIsDelayPassed(true);
    }, delaySec * 1000);
    return () => clearTimeout(timer);
  }, [animTrigger, shouldAnimate, delaySec]);

  return (
    <div
      data-overlay-id={config.id}
      data-overlay-type="text"
      data-order={config.order ?? 0}
      style={{
        position: 'absolute',
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        transform: `translate(-50%, -50%) rotate(${rotZDeg}deg)`,
        pointerEvents: 'none',
        zIndex: isSelected ? 100 + (config.order ?? 0) : (10 + (config.order ?? 0)),
      }}
    >
      <div
        ref={elementRef}
        onPointerDown={handlePointerDown}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          display: 'inline-block',
          width: 'fit-content',
          pointerEvents: 'auto',
          cursor: isDragging ? 'grabbing' : 'grab',
          border: showSelectionUI ? '2px dashed #a855f7' : '2px solid transparent',
          boxShadow: showSelectionUI ? '0 0 14px rgba(168, 85, 247, 0.4)' : 'none',
          borderRadius: '4px',
          color: config.color,
          fontSize: `${fontSizePx}px`,
          fontWeight: config.isBold !== false ? 800 : 400,
          fontStyle: config.isItalic ? 'italic' : 'normal',
          textDecoration: config.isUnderline ? 'underline' : 'none',
          textAlign: 'center',
          fontFamily: config.fontFamily || '"Plus Jakarta Sans", "Google Sans", "Inter", sans-serif',
          whiteSpace: 'pre',
          padding: '6px 12px',
          boxSizing: 'border-box',
          userSelect: 'none',
          touchAction: 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        {/* 4 Corner Selection Points */}
        {showSelectionUI && (
          <>
            <div style={{ position: 'absolute', top: -5, left: -5, width: 8, height: 8, background: '#a855f7', border: '1.5px solid #ffffff', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: -5, right: -5, width: 8, height: 8, background: '#a855f7', border: '1.5px solid #ffffff', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -5, left: -5, width: 8, height: 8, background: '#a855f7', border: '1.5px solid #ffffff', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -5, right: -5, width: 8, height: 8, background: '#a855f7', border: '1.5px solid #ffffff', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', pointerEvents: 'none' }} />
          </>
        )}

        <div style={{ pointerEvents: 'none', width: '100%', height: '100%' }}>
          {(() => {
            const displayText = (config.text && config.text.trim().length > 0) ? config.text : 'None';

            if (!shouldAnimate) {
              return <span>{displayText}</span>;
            }

            if (!isDelayPassed) {
              return <span data-delay-pending="true" style={{ opacity: 0, visibility: 'hidden' }}>{displayText}</span>;
            }

            const legacyMap: Record<string, string> = {
              'fade': 'fade-through',
              'slide-up': 'mask-reveal-up',
              'typewriter': 'typing-animation',
              'scale': 'micro-scale-fade',
            };
            const effectiveType = legacyMap[config.animationType] || config.animationType;
            const animSpeed = config.animationSpeed ?? 1;

            const SmoothComp = smoothAnimMap[effectiveType];
            if (SmoothComp) {
              return <SmoothComp key={`${animTrigger}-${effectiveType}-${animSpeed}`} speed={animSpeed}>{displayText}</SmoothComp>;
            }

            if (effectiveType === 'text-animate') {
              return <TextAnimate key={`${animTrigger}-${effectiveType}-${animSpeed}`} animation="fadeIn" duration={2 / animSpeed} style={{ whiteSpace: 'pre' }}>{displayText}</TextAnimate>;
            }

            if (effectiveType === 'typing-animation') {
              return <TypingAnimation key={`${animTrigger}-${effectiveType}-${animSpeed}`} duration={100 / animSpeed} style={{ whiteSpace: 'pre' }}>{displayText}</TypingAnimation>;
            }

            if (effectiveType === 'dia-text-reveal') {
              return <TextReveal key={`${animTrigger}-${effectiveType}-${animSpeed}`} duration={3000 / animSpeed}>{displayText}</TextReveal>;
            }

            return <TextAnimate key={`${animTrigger}-${effectiveType}-${animSpeed}`} animation="fadeIn" duration={2 / animSpeed} style={{ whiteSpace: 'pre' }}>{displayText}</TextAnimate>;
          })()}
        </div>
      </div>
    </div>
  );
}

export default function SceneTexts() {
  const { state, dispatch } = useAppState();
  const { texts, images } = state.scene;
  const { selectedTextId, previewTrigger: globalPreviewTrigger, exportStatus } = state;
  const { setActiveGuides, clearGuides } = useAlignmentGuides();
  const isExporting = exportStatus === 'rendering' || exportStatus === 'encoding';
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Delete or Backspace key deletes selected text overlay
  useEffect(() => {
    if (!selectedTextId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const matchingText = (texts || []).find((t) => t.id === selectedTextId);
        if (matchingText) {
          e.preventDefault();
          const newTexts = (texts || []).filter((t) => t.id !== selectedTextId);
          dispatch({ scene: { texts: newTexts }, selectedTextId: null });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTextId, texts, dispatch]);

  if (!texts || texts.length === 0) return null;

  return (
    <div
      id="text-overlay-layer"
      ref={containerRef}
      onPointerDown={(e) => {
        if (e.target === containerRef.current) {
          dispatch({ selectedTextId: null });
        }
      }}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 1,
        overflow: 'hidden',
      }}
    >
      {texts.map((t) => (
        <OverlayText
          key={t.id}
          config={t}
          allTexts={texts}
          allImages={images || []}
          isSelected={selectedTextId === t.id}
          onSelect={() => dispatch({ selectedTextId: t.id })}
          updateConfig={(updates) => {
            if (updates.delete) {
              dispatch({ scene: { texts: texts.filter((text) => text.id !== t.id) } });
              return;
            }
            const newTexts = texts.map((text) =>
              text.id === t.id ? { ...text, ...updates } : text
            );
            dispatch({ scene: { texts: newTexts } });
          }}
          containerRef={containerRef}
          globalPreviewTrigger={globalPreviewTrigger}
          setActiveGuides={setActiveGuides}
          clearGuides={clearGuides}
        />
      ))}
    </div>
  );
}
