'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useAppState } from '@/store';
import type { TextOverlay } from '@/types';
import { TextAnimate } from '@/components/ui/text-animate';
import { TypingAnimation } from '@/components/ui/typing-animation';
import { TextReveal } from '@/components/ui/text-reveal';
import BlurOutUp from '@/components/smoothui/blur-out-up';
import BottomUpLetters from '@/components/smoothui/bottom-up-letters';
import DepthParallaxWords from '@/components/smoothui/depth-parallax-words';
import FadeThrough from '@/components/smoothui/fade-through';
import FocusBlurResolve from '@/components/smoothui/focus-blur-resolve';
import KineticCenterBuild from '@/components/smoothui/kinetic-center-build';
import LineByLineSlide from '@/components/smoothui/line-by-line-slide';
import MaskRevealUp from '@/components/smoothui/mask-reveal-up';
import MicroScaleFade from '@/components/smoothui/micro-scale-fade';
import PerCharacterRise from '@/components/smoothui/per-character-rise';
import PerWordCrossfade from '@/components/smoothui/per-word-crossfade';
import RevealText from '@/components/smoothui/reveal-text';
import ScaleDownFade from '@/components/smoothui/scale-down-fade';

const smoothAnimMap: Record<string, React.FC<any>> = {
  'blur-out-up': BlurOutUp,
  'bottom-up-letters': BottomUpLetters,
  'depth-parallax-words': DepthParallaxWords,
  'fade-through': FadeThrough,
  'focus-blur-resolve': FocusBlurResolve,
  'kinetic-center-build': KineticCenterBuild,
  'line-by-line-slide': LineByLineSlide,
  'mask-reveal-up': MaskRevealUp,
  'micro-scale-fade': MicroScaleFade,
  'per-character-rise': PerCharacterRise,
  'per-word-crossfade': PerWordCrossfade,
  'reveal-text': RevealText,
  'scale-down-fade': ScaleDownFade,
};

function OverlayText({
  config,
  isSelected,
  onSelect,
  updateConfig,
  containerRef,
  globalPreviewTrigger,
}: {
  config: TextOverlay;
  isSelected: boolean;
  onSelect: () => void;
  updateConfig: (updates: Partial<TextOverlay> & { delete?: boolean }) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  globalPreviewTrigger?: number;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });

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

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const container = containerRef.current;
      const rect = container ? container.getBoundingClientRect() : { width: 800, height: 600 };
      const aspect = rect.height > 0 ? rect.width / rect.height : 1.777;

      const viewHeight = 3.3;
      const viewWidth = 3.3 * aspect;

      const dx = (e.clientX - dragStart.current.mouseX) * (viewWidth / rect.width);
      const dy = -(e.clientY - dragStart.current.mouseY) * (viewHeight / rect.height);

      updateConfig({
        position: [
          dragStart.current.posX + dx,
          dragStart.current.posY + dy,
          config.position[2],
        ],
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, config.position, containerRef, updateConfig]);

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
  const shouldAnimate = config.animationType && config.animationType !== 'none' && !isEditingNow;

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
      style={{
        position: 'absolute',
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        transform: `translate(-50%, -50%) rotate(${rotZDeg}deg)`,
        pointerEvents: 'none',
        zIndex: isSelected ? 20 : 10,
      }}
    >
      <div
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
            const animDelayMs = (config.delay || 0) * 1000;

            const SmoothComp = smoothAnimMap[effectiveType];
            if (SmoothComp) {
              return <SmoothComp key={`${animTrigger}-${effectiveType}`}>{displayText}</SmoothComp>;
            }

            if (effectiveType === 'text-animate') {
              return <TextAnimate key={`${animTrigger}-${effectiveType}`} animation="fadeIn" duration={2 / (config.animationSpeed ?? 1)} style={{ whiteSpace: 'pre' }}>{displayText}</TextAnimate>;
            }

            if (effectiveType === 'typing-animation') {
              return <TypingAnimation key={`${animTrigger}-${effectiveType}`} duration={100 / (config.animationSpeed ?? 1)} style={{ whiteSpace: 'pre' }}>{displayText}</TypingAnimation>;
            }

            if (effectiveType === 'dia-text-reveal') {
              return <TextReveal key={`${animTrigger}-${effectiveType}`} duration={3000 / (config.animationSpeed ?? 1)}>{displayText}</TextReveal>;
            }

            return <TextAnimate key={`${animTrigger}-${effectiveType}`} animation="fadeIn" duration={2 / (config.animationSpeed ?? 1)} style={{ whiteSpace: 'pre' }}>{displayText}</TextAnimate>;
          })()}
        </div>
      </div>
    </div>
  );
}

export default function SceneTexts() {
  const { state, dispatch } = useAppState();
  const { texts } = state.scene;
  const { selectedTextId, previewTrigger: globalPreviewTrigger, exportStatus } = state;
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
        e.preventDefault();
        const newTexts = (texts || []).filter((t) => t.id !== selectedTextId);
        dispatch({ scene: { texts: newTexts }, selectedTextId: null });
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
        pointerEvents: isExporting ? 'none' : 'auto',
        opacity: 1,
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      {texts.map((t) => (
        <OverlayText
          key={t.id}
          config={t}
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
        />
      ))}
    </div>
  );
}
