'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useAppState } from '@/store';
import type { ImageOverlay, ElementBounds3D } from '@/types';
import { calculateSnapPosition, getElementBounds3D } from '@/lib/alignment';
import { useAlignmentGuides } from '@/context/AlignmentContext';
import { motion, AnimatePresence } from 'framer-motion';

function OverlayImage({
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
  config: ImageOverlay;
  allTexts: any[];
  allImages: ImageOverlay[];
  isSelected: boolean;
  onSelect: () => void;
  updateConfig: (updates: Partial<ImageOverlay> & { delete?: boolean }) => void;
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
          const el = container.querySelector(`[data-overlay-id="${t.id}"]`) as HTMLElement | null;
          otherBounds.push(getElementBounds3D(t.id, t.position, el, rect.width, rect.height));
        });
        allImagesRef.current.forEach((img) => {
          if (img.id === configRef.current.id) return;
          const el = container.querySelector(`[data-overlay-id="${img.id}"]`) as HTMLElement | null;
          otherBounds.push(getElementBounds3D(img.id, img.position, el, rect.width, rect.height));
        });
      }

      const activeEl = elementRef.current;
      const activeWidthPx = activeEl ? activeEl.offsetWidth : 100;
      const activeHeightPx = activeEl ? activeEl.offsetHeight : 100;

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

  const showSelectionUI = isHovered || isSelected || isDragging;
  
  const globalTrigger = globalPreviewTrigger || 0;
  const localTrigger = config.previewTrigger || 0;
  const animTrigger = Math.max(globalTrigger, localTrigger);

  const delaySec = config.delay || 0;
  const shouldAnimate = config.animationType && config.animationType !== 'none';
  const animSpeed = config.animationSpeed ?? 1;

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

  // Handle Framer Motion variants based on animation type
  let variants = {};
  if (config.animationType === 'fade-in-out') {
    variants = {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 1 / animSpeed, ease: "easeInOut" } }
    };
  } else if (config.animationType === 'bounce') {
    variants = {
      initial: { y: -50, opacity: 0 },
      animate: { y: 0, opacity: 1, transition: { type: "spring", bounce: 0.6, duration: 1.2 / animSpeed } }
    };
  } else if (config.animationType === 'spin') {
    variants = {
      initial: { rotate: -180, scale: 0, opacity: 0 },
      animate: { rotate: 0, scale: 1, opacity: 1, transition: { type: "spring", stiffness: 100, duration: 1.5 / animSpeed } }
    };
  } else {
    variants = {
      initial: { opacity: 1 },
      animate: { opacity: 1 }
    };
  }

  const baseSize = 100; // Base size for scale 1
  const currentSize = baseSize * Math.max(0.01, Math.abs(config.scale));

  return (
    <div
      data-overlay-id={config.id}
      data-overlay-type="image"
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
          padding: '4px',
          boxSizing: 'border-box',
          userSelect: 'none',
          touchAction: 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        {/* 4 Corner Selection Points */}
        {showSelectionUI && (
          <>
            <div style={{ position: 'absolute', top: -5, left: -5, width: 8, height: 8, background: '#ffffff', border: '1.5px solid #000000', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: -5, right: -5, width: 8, height: 8, background: '#ffffff', border: '1.5px solid #000000', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -5, left: -5, width: 8, height: 8, background: '#ffffff', border: '1.5px solid #000000', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -5, right: -5, width: 8, height: 8, background: '#ffffff', border: '1.5px solid #000000', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', pointerEvents: 'none' }} />
          </>
        )}

        <div style={{ pointerEvents: 'none', width: '100%', height: '100%' }}>
          <AnimatePresence mode="wait">
            {(!shouldAnimate || isDelayPassed) && (
              <motion.img
                key={`${animTrigger}-${config.animationType}-${config.url}`}
                src={config.url}
                alt="Overlay Image"
                variants={shouldAnimate ? variants : {}}
                initial="initial"
                animate="animate"
                style={{
                  width: `${currentSize}px`,
                  height: `${currentSize}px`,
                  objectFit: 'contain',
                  display: 'block'
                }}
                draggable={false}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function SceneImages() {
  const { state, dispatch } = useAppState();
  const { images, texts } = state.scene;
  const { selectedTextId, previewTrigger: globalPreviewTrigger, exportStatus } = state;
  const { setActiveGuides, clearGuides } = useAlignmentGuides();
  const isExporting = exportStatus === 'rendering' || exportStatus === 'encoding';
  const containerRef = useRef<HTMLDivElement>(null);

  // We can use selectedTextId for both texts and images to maintain single selection focus.
  // The logic deletes the active element if it's an image.
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
        const matchingImage = (images || []).find((img) => img.id === selectedTextId);
        if (matchingImage) {
          e.preventDefault();
          const newImages = (images || []).filter((img) => img.id !== selectedTextId);
          dispatch({ scene: { images: newImages }, selectedTextId: null });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTextId, images, dispatch]);

  if (!images || images.length === 0) return null;

  return (
    <div
      id="image-overlay-layer"
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
      {images.map((img) => (
        <OverlayImage
          key={img.id}
          config={img}
          allTexts={texts || []}
          allImages={images}
          isSelected={selectedTextId === img.id}
          onSelect={() => dispatch({ selectedTextId: img.id })}
          updateConfig={(updates) => {
            if (updates.delete) {
              dispatch({ scene: { images: images.filter((i) => i.id !== img.id) } });
              return;
            }
            const newImages = images.map((i) =>
              i.id === img.id ? { ...i, ...updates } : i
            );
            dispatch({ scene: { images: newImages } });
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
