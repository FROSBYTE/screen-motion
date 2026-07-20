'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useAppState } from '@/store';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
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

function AnimatedText({
  config,
  speed,
  isSelected,
  onSelect,
  updateConfig,
  index: textIndex
}: {
  config: TextOverlay;
  speed: number;
  isSelected: boolean;
  onSelect: () => void;
  updateConfig: (updates: Partial<TextOverlay> & { delete?: boolean }) => void;
  index: number;
}) {
  const meshRef = useRef<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const rotateStart = useRef({ x: 0, y: 0, rotZ: 0 });
  
  // HTML size tracking for 3D hitbox
  const htmlDivRef = useRef<HTMLDivElement>(null);
  const [htmlSize, setHtmlSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!htmlDivRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHtmlSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(htmlDivRef.current);
    return () => observer.disconnect();
  }, [htmlDivRef.current, isEditing, config.text, config.fontSize, isSelected]);

  // Sync position/rotation to mesh
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...config.position);
      meshRef.current.rotation.set(...config.rotation);
    }
  }, [config.position, config.rotation]);

  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef(new THREE.Vector3());

  // Global mouse release listener when dragging is active without pointer capture
  useEffect(() => {
    if (isDragging) {
      const handleGlobalPointerUp = () => {
        setIsDragging(false);
      };
      window.addEventListener('pointerup', handleGlobalPointerUp);
      return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
    }
  }, [isDragging]);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    onSelect();
    if (!isEditing) {
      setIsDragging(true);
      
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -config.position[2]);
      const intersection = new THREE.Vector3();
      if (e.ray.intersectPlane(plane, intersection)) {
        dragOffset.current.set(
          config.position[0] - intersection.x,
          config.position[1] - intersection.y,
          0
        );
      }
    }
  };

  const handlePointerMove = (e: any) => {
    if (isDragging) {
      e.stopPropagation();
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -config.position[2]);
      const intersection = new THREE.Vector3();
      if (e.ray.intersectPlane(plane, intersection)) {
        updateConfig({
          position: [
            intersection.x + dragOffset.current.x,
            intersection.y + dragOffset.current.y,
            config.position[2]
          ]
        });
      }
    }
  };

  const handlePointerUp = (e: any) => {
    if (isDragging) {
      e.stopPropagation();
      setIsDragging(false);
    }
  };

  const handleDoubleClick = (e: any) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const fontSizePx = Math.max(0.01, Math.abs(config.fontSize)) * 87.8;
  const lines = config.text.split('\n');
  const maxLineLength = Math.max(...lines.map(line => line.length), 1);
  const calculatedWidth = Math.max(150, maxLineLength * fontSizePx * 0.6);
  // We use scale 0.01, so 3D dimensions are width * 0.01
  const planeWidth = Math.max(0.1, htmlSize.width * 0.01);
  const planeHeight = Math.max(0.1, htmlSize.height * 0.01);

  return (
    <>
      {/* Invisible 3D Hitbox */}
      <mesh
        ref={meshRef}
        position={config.position}
        rotation={config.rotation}
        renderOrder={textIndex + 1}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} depthTest={false} />
      </mesh>

      {/* HTML Overlay */}
      <Html 
        position={config.position} 
        rotation={config.rotation} 
        scale={0.01} 
        center 
        transform 
        pointerEvents="none" 
        zIndexRange={[100, 0]} 
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        <div 
          ref={htmlDivRef} 
          style={{ 
            position: 'relative',
            border: (isSelected && !isEditing) ? '6px solid #a855f7' : '6px solid transparent',
            color: config.color,
            fontSize: `${fontSizePx}px`, 
            fontWeight: config.isBold !== false ? 800 : 400, 
            fontStyle: config.isItalic ? 'italic' : 'normal', 
            textDecoration: config.isUnderline ? 'underline' : 'none', 
            textAlign: 'center', 
            fontFamily: '"Google Sans", sans-serif', 
             whiteSpace: 'pre',
             padding: '4px 8px', // Slight padding so the border doesn't clip the text
             boxSizing: 'border-box'
           }}
         >
           {isEditing ? (
             <textarea
               autoFocus
               value={config.text}
               rows={config.text.split('\n').length}
               onPointerDown={(e) => { e.stopPropagation(); (e.target as HTMLTextAreaElement).focus(); }}
               onChange={(e) => updateConfig({ text: e.target.value })}
               onBlur={() => setIsEditing(false)}
               style={{
                 background: 'transparent',
                 border: 'none',
                 color: config.color,
                 fontSize: `${fontSizePx}px`,
                 fontWeight: config.isBold !== false ? 800 : 400,
                 fontStyle: config.isItalic ? 'italic' : 'normal', 
                 textDecoration: config.isUnderline ? 'underline' : 'none', 
                 textAlign: 'center',
                 outline: 'none',
                 fontFamily: 'inherit',
                 minWidth: '150px',
                 width: `${calculatedWidth}px`,
                 resize: 'none',
                 whiteSpace: 'pre',
                 overflow: 'hidden',
                 lineHeight: '1.2',
                 pointerEvents: 'auto'
               }}
             />
          ) : (
            (() => {
              const SmoothComp = smoothAnimMap[config.animationType as string];
              if (SmoothComp) {
                return <SmoothComp key={config.previewTrigger}>{config.text}</SmoothComp>;
              }

              if (config.animationType === 'text-animate') {
                return <TextAnimate key={config.previewTrigger} animation="fadeIn" duration={2 / (config.animationSpeed ?? 1)} style={{ whiteSpace: 'pre' }}>{config.text}</TextAnimate>;
              }

              if (config.animationType === 'typing-animation') {
                return <TypingAnimation key={config.previewTrigger} duration={100 / (config.animationSpeed ?? 1)} style={{ whiteSpace: 'pre' }}>{config.text}</TypingAnimation>;
              }

              if (config.animationType === 'dia-text-reveal') {
                return <TextReveal key={config.previewTrigger} duration={3000 / (config.animationSpeed ?? 1)}>{config.text}</TextReveal>;
              }

              return <span>{config.text}</span>;
            })()
          )}

          {/* Render Icons inside the same HTML box if selected */}
          {isSelected && !isEditing && (
            <>
              {/* Rotate Icon */}
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  (e.target as HTMLElement).setPointerCapture(e.pointerId);
                  setIsRotating(true);
                  rotateStart.current = { x: e.clientX, y: e.clientY, rotZ: config.rotation[2] };
                }}
                onPointerMove={(e) => {
                  if (isRotating) {
                    e.stopPropagation();
                    const dx = e.clientX - rotateStart.current.x;
                    const newRotZ = rotateStart.current.rotZ - (dx * 0.02);
                    updateConfig({ rotation: [config.rotation[0], config.rotation[1], newRotZ] });
                  }
                }}
                onPointerUp={(e) => {
                  if (isRotating) {
                    e.stopPropagation();
                    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
                    setIsRotating(false);
                  }
                }}
                style={{ position: 'absolute', top: -14, left: -14, width: 28, height: 28, background: '#ffffff', borderRadius: '50%', cursor: isRotating ? 'ew-resize' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', color: '#000', pointerEvents: 'auto' }}
                title="Drag to Rotate"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" /></svg>
              </div>

              {/* Delete Icon */}
              <div
                onPointerDown={(e) => { e.stopPropagation(); updateConfig({ delete: true } as any); }}
                style={{ position: 'absolute', top: -14, right: -14, width: 28, height: 28, background: '#ff4d4d', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', color: '#fff', pointerEvents: 'auto' }}
                title="Delete"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </div>
            </>
          )}
        </div>
      </Html>

      {/* 3D Transform Controls Removed - Using native dragging */}
    </>
  );
}

export default function SceneTexts() {
  const { state, dispatch } = useAppState();
  const { texts, textSpeed = 1.0 } = state.scene;
  const { selectedTextId } = state;

  if (!texts || texts.length === 0) return null;

  return (
    <>
      {texts.map((t, i) => (
        <AnimatedText
          key={t.id}
          config={t}
          speed={textSpeed}
          isSelected={selectedTextId === t.id}
          onSelect={() => dispatch({ selectedTextId: t.id })}
          index={i}
          updateConfig={(updates) => {
            if (updates.delete) { dispatch({ scene: { texts: texts.filter(text => text.id !== t.id) } }); return; } const newTexts = texts.map(text => text.id === t.id ? { ...text, ...updates } : text);
            dispatch({ scene: { texts: newTexts } });
          }}
        />
      ))}
    </>
  );
}
