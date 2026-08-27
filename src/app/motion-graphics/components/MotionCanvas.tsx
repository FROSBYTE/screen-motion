'use client';

import React, { useEffect, useState, useMemo, useRef, Suspense } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMGState, MGTextLayer, MGComponentLayer, MGLayer, MGScene, SceneTransition, getSceneDuration, interpolateProperty } from '../store';
import BottomUpLetters from '@/components/smoothui/bottom-up-letters';
import KineticCenterBuild from '@/components/smoothui/kinetic-center-build';
import LineByLineSlide from '@/components/smoothui/line-by-line-slide';
import MaskRevealUp from '@/components/smoothui/mask-reveal-up';
import RevealText from '@/components/smoothui/reveal-text';
import ShortSlideDown from '@/components/smoothui/short-slide-down';
import BlurOutUp from '@/components/smoothui/blur-out-up';
import DepthParallaxWords from '@/components/smoothui/depth-parallax-words';
import FadeThrough from '@/components/smoothui/fade-through';
import FocusBlurResolve from '@/components/smoothui/focus-blur-resolve';
import SoftBlurIn from '@/components/smoothui/soft-blur-in';
import SpringScaleIn from '@/components/smoothui/spring-scale-in';
import StaggerFromCenter from '@/components/smoothui/stagger-from-center';
import MicroScaleFade from '@/components/smoothui/micro-scale-fade';
import ScaleDownFade from '@/components/smoothui/scale-down-fade';
import PerCharacterRise from '@/components/smoothui/per-character-rise';
import PerWordCrossfade from '@/components/smoothui/per-word-crossfade';
import DiaTextRevealUI from '@/components/ui/dia-text-reveal';
import CountUp from './templates/CountUp';
import AnimatedList from './templates/AnimatedList';
import LogoLoop from './templates/LogoLoop';
import AILoader from './templates/AILoader';
import BubbleMenu from './templates/BubbleMenu';
import UnlumenAnimatedList from './templates/UnlumenAnimatedList';
import WordRotate from './templates/WordRotate';
import Highlighter from './templates/Highlighter';
import AnimatedBeam from './templates/AnimatedBeam';
import OrbitingCircles from './templates/OrbitingCircles';
import TextReveal from './templates/TextReveal';

import SkeletonShimmer from './templates/SkeletonShimmer';
import Text3DFlip from './templates/Text3DFlip';
import MediaUploadComponent from './templates/MediaUpload';
import VideoUploadComponent from './templates/VideoUpload';
import ImageUploadComponent from './templates/ImageUpload';
import PhoneDeviceComponent from './templates/PhoneDevice';
import MaskedHeadingComponent from './templates/MaskedHeading';
import { applyVideoFileToLayer, applyImageFileToLayer } from './PropertiesPanel';
import { useAlignmentGuides } from '@/context/AlignmentContext';
import AlignmentGuidesOverlay from '@/components/3d-editor/overlays/AlignmentGuidesOverlay';
import type { AlignmentGuide } from '@/types';
import DevicePoolCanvas, { ActiveDeviceDescriptor } from './3d/DevicePoolCanvas';



function ShortSlideDownWrapper({ children, speed = 1, localTime, layerStartTime, layerDuration }: { children?: string; speed?: number; localTime?: number; layerStartTime?: number; layerDuration?: number }) {
  const text = children || '';
  return <ShortSlideDown phrases={[text]} speed={speed} interval={2500 / speed} localTime={localTime} layerStartTime={layerStartTime} layerDuration={layerDuration} />;
}

type EnterAnimType = 'none' | 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale-up' | 'blur-in';
type ExitAnimType = 'none' | 'fade-out' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale-down' | 'blur-out';

const ENTER_INITIAL: Record<EnterAnimType, any> = {
  'none': {},
  'fade-in': { opacity: 0 },
  'slide-up': { opacity: 0, y: 40 },
  'slide-down': { opacity: 0, y: -40 },
  'slide-left': { opacity: 0, x: 40 },
  'slide-right': { opacity: 0, x: -40 },
  'scale-up': { opacity: 0, scale: 0.6 },
  'blur-in': { opacity: 0, filter: 'blur(12px)' },
};

const ENTER_ANIMATE: Record<EnterAnimType, any> = {
  'none': {},
  'fade-in': { opacity: 1 },
  'slide-up': { opacity: 1, y: 0 },
  'slide-down': { opacity: 1, y: 0 },
  'slide-left': { opacity: 1, x: 0 },
  'slide-right': { opacity: 1, x: 0 },
  'scale-up': { opacity: 1, scale: 1 },
  'blur-in': { opacity: 1, filter: 'blur(0px)' },
};

const EXIT_TARGET: Record<ExitAnimType, any> = {
  'none': {},
  'fade-out': { opacity: 0 },
  'slide-up': { opacity: 0, y: -40 },
  'slide-down': { opacity: 0, y: 40 },
  'slide-left': { opacity: 0, x: -40 },
  'slide-right': { opacity: 0, x: 40 },
  'scale-down': { opacity: 0, scale: 0.6 },
  'blur-out': { opacity: 0, filter: 'blur(12px)' },
};

function easeEnterOut(t: number) {
  return 1 - Math.pow(1 - t, 2.5);
}

function easeExitOut(t: number) {
  return Math.pow(t, 2.0);
}

function computeEnterExitStyle(
  enterAnimation: EnterAnimType,
  enterDuration: number,
  exitAnimation: ExitAnimType,
  exitDuration: number,
  localTime?: number,
  layerStartTime?: number,
  layerDuration?: number
): React.CSSProperties | null {
  if (localTime === undefined || layerStartTime === undefined || layerDuration === undefined) {
    return null;
  }

  const relTime = localTime - layerStartTime;
  const layerEnd = layerStartTime + layerDuration;
  const timeUntilEnd = layerEnd - localTime;

  let opacity = 1;
  let translateY = 0;
  let translateX = 0;
  let scale = 1;
  let blur = 0;

  // Enter Phase
  if (enterAnimation !== 'none' && relTime < enterDuration && enterDuration > 0) {
    const t = easeEnterOut(Math.max(0, Math.min(1, relTime / enterDuration)));
    if (enterAnimation === 'fade-in') {
      opacity = t;
    } else if (enterAnimation === 'slide-up') {
      opacity = t;
      translateY = (1 - t) * 40;
    } else if (enterAnimation === 'slide-down') {
      opacity = t;
      translateY = (1 - t) * -40;
    } else if (enterAnimation === 'slide-left') {
      opacity = t;
      translateX = (1 - t) * 40;
    } else if (enterAnimation === 'slide-right') {
      opacity = t;
      translateX = (1 - t) * -40;
    } else if (enterAnimation === 'scale-up') {
      opacity = t;
      scale = 0.6 + t * 0.4;
    } else if (enterAnimation === 'blur-in') {
      opacity = t;
      blur = (1 - t) * 12;
    }
  }

  // Exit Phase
  if (exitAnimation !== 'none' && timeUntilEnd <= exitDuration && exitDuration > 0) {
    const t = easeExitOut(Math.max(0, Math.min(1, (exitDuration - timeUntilEnd) / exitDuration)));
    if (exitAnimation === 'fade-out') {
      opacity = Math.min(opacity, 1 - t);
    } else if (exitAnimation === 'slide-up') {
      opacity = Math.min(opacity, 1 - t);
      translateY = -t * 40;
    } else if (exitAnimation === 'slide-down') {
      opacity = Math.min(opacity, 1 - t);
      translateY = t * 40;
    } else if (exitAnimation === 'slide-left') {
      opacity = Math.min(opacity, 1 - t);
      translateX = -t * 40;
    } else if (exitAnimation === 'slide-right') {
      opacity = Math.min(opacity, 1 - t);
      translateX = t * 40;
    } else if (exitAnimation === 'scale-down') {
      opacity = Math.min(opacity, 1 - t);
      scale = 1 - t * 0.4;
    } else if (exitAnimation === 'blur-out') {
      opacity = Math.min(opacity, 1 - t);
      blur = Math.max(blur, t * 12);
    }
  }

  const transformParts: string[] = [];
  if (translateX !== 0 || translateY !== 0) {
    transformParts.push(`translate(${translateX}px, ${translateY}px)`);
  }
  if (scale !== 1) {
    transformParts.push(`scale(${scale})`);
  }

  return {
    opacity,
    transform: transformParts.length > 0 ? transformParts.join(' ') : undefined,
    filter: blur > 0 ? `blur(${blur.toFixed(1)}px)` : undefined,
  };
}

function EnterAnimationWrapper({
  enterAnimation,
  enterDuration,
  exitAnimation,
  exitDuration,
  triggerKey,
  isExiting,
  localTime,
  layerStartTime,
  layerDuration,
  children,
  style,
}: {
  enterAnimation: EnterAnimType;
  enterDuration: number;
  exitAnimation: ExitAnimType;
  exitDuration: number;
  triggerKey: number;
  isExiting: boolean;
  localTime?: number;
  layerStartTime?: number;
  layerDuration?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  if (enterAnimation === 'none' && exitAnimation === 'none') return <div style={style}>{children}</div>;

  const deterministicStyle = computeEnterExitStyle(
    enterAnimation,
    enterDuration,
    exitAnimation,
    exitDuration,
    localTime,
    layerStartTime,
    layerDuration
  );

  if (deterministicStyle) {
    return (
      <div style={{ ...style, ...deterministicStyle }}>
        {children}
      </div>
    );
  }

  const animateTarget = isExiting && exitAnimation !== 'none'
    ? EXIT_TARGET[exitAnimation]
    : ENTER_ANIMATE[enterAnimation];

  const transitionDuration = isExiting ? exitDuration : enterDuration;

  return (
    <motion.div
      key={triggerKey}
      initial={enterAnimation !== 'none' ? ENTER_INITIAL[enterAnimation] : undefined}
      animate={animateTarget}
      transition={{ duration: transitionDuration, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

const animationMap: Record<string, React.FC<any>> = {
  'bottom-up-letters': BottomUpLetters,
  'kinetic-center-build': KineticCenterBuild,
  'line-by-line-slide': LineByLineSlide,
  'mask-reveal-up': MaskRevealUp,
  'reveal-text': RevealText,
  'short-slide-down': ShortSlideDownWrapper,
  'blur-out-up': BlurOutUp,
  'soft-blur-in': SoftBlurIn,
  'spring-scale-in': SpringScaleIn,
  'stagger-from-center': StaggerFromCenter,
  'depth-parallax-words': DepthParallaxWords,
  'fade-through': FadeThrough,
  'focus-blur-resolve': FocusBlurResolve,
  'micro-scale-fade': MicroScaleFade,
  'scale-down-fade': ScaleDownFade,
  'per-character-rise': PerCharacterRise,
  'per-word-crossfade': PerWordCrossfade,
  'text-reveal': (props: any) => <TextReveal text={props.children} speed={props.speed || 1} color={props.color || '#ffffff'} revealColor={props.revealColor || '#FF9137'} fontSize={props.fontSize} fontFamily={props.fontFamily} />,
  'dia-text-reveal': (props: any) => <DiaTextRevealUI text={props.children} duration={1.5 / (props.speed || 1)} repeat={true} />,
};

type CanvasAxis = 'x' | 'y';
type CanvasSnapCandidate = { value: number; target: number; distance: number; snapType: AlignmentGuide['snapType'] };

function getAlignedCanvasPosition(
  activeLayerId: string,
  layers: MGLayer[],
  rawPosition: { x: number; y: number },
  container: HTMLElement,
  activeElement: HTMLElement | null,
) {
  const containerRect = container.getBoundingClientRect();
  if (!containerRect.width || !containerRect.height) return { position: rawPosition, guides: [] as AlignmentGuide[] };

  const activeRect = activeElement?.getBoundingClientRect();
  const activeHalf = {
    x: ((activeRect?.width ?? 0) / containerRect.width) * 50,
    y: ((activeRect?.height ?? 0) / containerRect.height) * 50,
  };

  const resolveAxis = (axis: CanvasAxis, raw: number): CanvasSnapCandidate | null => {
    const half = activeHalf[axis];
    const candidates: CanvasSnapCandidate[] = [];
    const addTarget = (target: number, snapType: AlignmentGuide['snapType']) => {
      candidates.push(
        { value: target, target, distance: Math.abs(raw - target), snapType },
        { value: target + half, target, distance: Math.abs(raw - half - target), snapType },
        { value: target - half, target, distance: Math.abs(raw + half - target), snapType },
      );
    };

    addTarget(50, 'canvas-center');
    for (const candidateLayer of layers) {
      if (candidateLayer.id === activeLayerId) continue;
      const candidateElement = container.querySelector<HTMLElement>(`[data-motion-layer-id="${candidateLayer.id}"]`);
      if (!candidateElement) continue;
      const candidateRect = candidateElement.getBoundingClientRect();
      const candidateHalf = ((axis === 'x' ? candidateRect.width : candidateRect.height) / (axis === 'x' ? containerRect.width : containerRect.height)) * 50;
      const position = candidateLayer.position[axis];
      addTarget(position, 'element-center');
      addTarget(position - candidateHalf, 'element-edge');
      addTarget(position + candidateHalf, 'element-edge');
    }

    return candidates
      .filter((candidate) => candidate.value >= 0 && candidate.value <= 100 && candidate.distance <= (8 / (axis === 'x' ? containerRect.width : containerRect.height)) * 100)
      .sort((a, b) => a.distance - b.distance)[0] ?? null;
  };

  const x = resolveAxis('x', rawPosition.x);
  const y = resolveAxis('y', rawPosition.y);
  const guides: AlignmentGuide[] = [];
  if (x) guides.push({ id: `motion-x-${x.target.toFixed(2)}`, type: 'vertical', positionPercent: x.target, snapType: x.snapType });
  if (y) guides.push({ id: `motion-y-${y.target.toFixed(2)}`, type: 'horizontal', positionPercent: y.target, snapType: y.snapType });

  return {
    position: { x: x?.value ?? rawPosition.x, y: y?.value ?? rawPosition.y },
    guides,
  };
}

// Curtain-style transitions: the PREVIOUS scene is on top and gets masked/clipped
// to progressively reveal the incoming scene underneath.

// Style for the INCOMING (new) scene – always fully visible underneath
function getIncomingSceneStyle(): React.CSSProperties {
  return { opacity: 1 };
}

// Style for the OUTGOING (previous) scene – gets masked/clipped/faded to reveal new scene
export function getOutgoingTransitionStyle(transition: SceneTransition, progress: number): React.CSSProperties {
  const eased = 1 - Math.pow(1 - progress, 2); // easeOutQuad

  switch (transition) {
    case 'fade':
      return { opacity: 1 - eased };

    case 'slide-left':
      return { transform: `translateX(-${eased * 100}%)` };

    case 'slide-right':
      return { transform: `translateX(${eased * 100}%)` };

    case 'slide-up':
      return { transform: `translateY(-${eased * 100}%)` };

    case 'slide-down':
      return { transform: `translateY(${eased * 100}%)` };

    case 'zoom':
      return { transform: `scale(${1 + eased * 0.5})`, opacity: 1 - eased };

    case 'blur':
      return { filter: `blur(${eased * 24}px)`, opacity: 1 - eased };

    case 'clip-wipe':
      // Wipe from left to right: previous scene clips away from left
      return { clipPath: `inset(0 0 0 ${eased * 100}%)` };

    case 'iris': {
      // Circle shrinks from full to nothing, centered
      const maxRadius = 75;
      const radius = maxRadius * (1 - eased);
      if (radius < 0.5) return { opacity: 0 };
      return {
        clipPath: `circle(${radius}% at 50% 50%)`,
      };
    }

    case 'iris-click': {
      const maxRadius = 80;
      const radius = maxRadius * (1 - eased);
      if (radius < 0.5) return { opacity: 0 };
      return {
        clipPath: `circle(${radius}% at 60% 45%)`,
      };
    }

    case 'loading-line': {
      // Black screen phase then reveal
      const revealPhase = Math.max((progress - 0.7) / 0.3, 0);
      const revealEased = 1 - Math.pow(1 - revealPhase, 2);
      // During line phase, show fully opaque (black will be overlaid)
      // During reveal phase, fade out
      return { opacity: 1 - revealEased };
    }

    default:
      return { opacity: 1 };
  }
}

// Loading line transition needs an overlay for the line animation
function LoadingLineOverlay({ progress }: { progress: number }) {
  if (progress >= 1) return null;
  const linePhase = Math.min(progress / 0.7, 1);
  const revealPhase = Math.max((progress - 0.7) / 0.3, 0);
  const revealEased = 1 - Math.pow(1 - revealPhase, 2);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
      {/* Black overlay that fades out */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#000',
        opacity: 1 - revealEased,
      }} />
      {/* Loading line */}
      {revealPhase < 1 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '10%',
          width: '80%',
          height: '3px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '2px',
          transform: 'translateY(-50%)',
          opacity: 1 - revealEased,
        }}>
          <div style={{
            height: '100%',
            width: `${linePhase * 100}%`,
            background: 'linear-gradient(90deg, #a855f7, #6366f1)',
            borderRadius: '2px',
            boxShadow: '0 0 8px rgba(168, 85, 247, 0.6)',
          }} />
        </div>
      )}
    </div>
  );
}

function SelectionCornerHandles({
  onScaleStart,
}: {
  onScaleStart: (e: React.PointerEvent, corner: 'tl' | 'tr' | 'bl' | 'br') => void;
}) {
  const corners: { id: 'tl' | 'tr' | 'bl' | 'br'; style: React.CSSProperties; cursor: string }[] = [
    { id: 'tl', style: { top: '-4px', left: '-4px' }, cursor: 'nwse-resize' },
    { id: 'tr', style: { top: '-4px', right: '-4px' }, cursor: 'nesw-resize' },
    { id: 'bl', style: { bottom: '-4px', left: '-4px' }, cursor: 'nesw-resize' },
    { id: 'br', style: { bottom: '-4px', right: '-4px' }, cursor: 'nwse-resize' },
  ];

  return (
    <>
      {corners.map((c) => (
        <div
          key={c.id}
          onPointerDown={(e) => {
            e.stopPropagation();
            onScaleStart(e, c.id);
          }}
          style={{
            position: 'absolute',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#ffffff',
            border: '1.5px solid #000000',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            cursor: c.cursor,
            zIndex: 50,
            touchAction: 'none',
            ...c.style,
          }}
        />
      ))}
    </>
  );
}

function calculateCornerDragDelta(
  corner: 'tl' | 'tr' | 'bl' | 'br',
  startMouseX: number,
  startMouseY: number,
  currentMouseX: number,
  currentMouseY: number
): number {
  let dx = currentMouseX - startMouseX;
  let dy = currentMouseY - startMouseY;
  if (corner === 'tl') {
    dx = -dx;
    dy = -dy;
  } else if (corner === 'tr') {
    dy = -dy;
  } else if (corner === 'bl') {
    dx = -dx;
  }
  return (dx + dy) * 0.7071;
}

// Module-level drag state — survives React re-renders/re-mounts
const _canvasDragState = { isDragging: false, draggedLayerId: null as string | null };

function TextLayerRenderer({
  layer,
  zIndex,
  isVisible,
  isExiting,
  sceneId,
  sceneLayers,
  localTime,
}: {
  layer: MGTextLayer;
  zIndex?: number;
  isVisible: boolean;
  isExiting: boolean;
  sceneId: string;
  sceneLayers: MGLayer[];
  localTime: number;
}) {
  const { state, dispatch, updateLayer, seekTo, play, getSceneStartTime } = useMGState();
  const { setActiveGuides } = useAlignmentGuides();
  const [triggerKey, setTriggerKey] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number } | null>(null);
  const hasMovedRef = useRef(false);
  const lastDragTimeRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneLayersRef = useRef(sceneLayers);
  sceneLayersRef.current = sceneLayers;
  const isSelected = state.selectedLayerId === layer.id;
  const prevVisibleRef = useRef(false);

  useEffect(() => {
    if (isVisible && !prevVisibleRef.current) {
      requestAnimationFrame(() => {
        setTriggerKey((k) => k + 1);
      });
    }
    prevVisibleRef.current = isVisible;
  }, [isVisible]);

  if (!isVisible && !isDragging) return null;

  const AnimComp = animationMap[layer.animationType];
  const basePacingSpeed = layer.pacingPreset === 'snappy' ? 1.8 : layer.pacingPreset === 'cinematic' ? 0.75 : 1.0;
  const durationSpeedBoost = (layer.duration && layer.duration < 2.5)
    ? Math.max(1, 2.5 / Math.max(0.3, layer.duration))
    : 1;
  const wordCount = (layer.text || '').split(/\s+/).filter(Boolean).length || 1;
  const wordLengthBoost = wordCount > 4 ? 1 + (wordCount - 4) * 0.15 : 1;
  const effectiveSpeed = basePacingSpeed * durationSpeedBoost * wordLengthBoost;

  const effectiveEnterDur = Math.min((layer.enterDuration ?? 1.0) / effectiveSpeed, (layer.duration || 1) * 0.4);
  const effectiveExitDur = Math.min((layer.exitDuration ?? 1.0) / effectiveSpeed, (layer.duration || 1) * 0.4);

  return (
    <div
      ref={containerRef}
      data-motion-layer-id={layer.id}
      onClick={(e) => {
        e.stopPropagation();
        // Only select if this layer was NOT just dragged
        if (_canvasDragState.draggedLayerId !== layer.id) {
          dispatch({ selectedLayerId: layer.id, activeSceneId: sceneId, activeSidebarTab: 'components' });
        }
        // Reset after click is handled
        if (_canvasDragState.draggedLayerId === layer.id) {
          _canvasDragState.draggedLayerId = null;
        }
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        const sStart = getSceneStartTime(sceneId);
        const compStart = sStart + layer.startTime;
        const compEnd = compStart + layer.duration;
        dispatch({
          selectedLayerId: layer.id,
          activeSceneId: sceneId,
          activeSidebarTab: 'components',
          playbackRange: { start: compStart, end: compEnd },
        });
        seekTo(compStart);
        play();
      }}
      onPointerDown={(e) => {
        if (!e.isPrimary || e.button !== 0) return;
        e.stopPropagation();

        const targetEl = e.currentTarget as HTMLElement;
        if (targetEl && 'setPointerCapture' in targetEl) {
          try {
            targetEl.setPointerCapture(e.pointerId);
          } catch {
            // ignore capture error
          }
        }

        const startMouseX = e.clientX;
        const startMouseY = e.clientY;
        const startPosX = layer.position.x;
        const startPosY = layer.position.y;
        let moved = false;
        setIsDragging(true);

        const handleMove = (moveEvent: PointerEvent) => {
          const dist = Math.hypot(moveEvent.clientX - startMouseX, moveEvent.clientY - startMouseY);
          if (dist > 3 && !moved) {
            moved = true;
            _canvasDragState.isDragging = true;
            _canvasDragState.draggedLayerId = layer.id;
          }

          if (!moved) return;

          const parent = containerRef.current?.parentElement;
          if (!parent) return;
          const rect = parent.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return;

          const deltaX = ((moveEvent.clientX - startMouseX) / rect.width) * 100;
          const deltaY = ((moveEvent.clientY - startMouseY) / rect.height) * 100;

          const rawPosition = {
            x: Math.max(0, Math.min(100, startPosX + deltaX)),
            y: Math.max(0, Math.min(100, startPosY + deltaY)),
          };

          const snapped = getAlignedCanvasPosition(layer.id, sceneLayersRef.current, rawPosition, parent, containerRef.current);
          setActiveGuides(snapped.guides);
          updateLayer(layer.id, { position: snapped.position } as any);
        };

        const handleUp = (upEvent: PointerEvent) => {
          window.removeEventListener('pointermove', handleMove);
          window.removeEventListener('pointerup', handleUp);
          if (targetEl && 'releasePointerCapture' in targetEl) {
            try {
              targetEl.releasePointerCapture(upEvent.pointerId);
            } catch {
              // ignore
            }
          }
          setIsDragging(false);
          setActiveGuides([]);
          _canvasDragState.isDragging = false;
          // Note: draggedLayerId is NOT cleared here — it's cleared in onClick
          // so the click event that fires after pointerup can check it
        };

        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
      }}
      style={(() => {
        const hasKf = layer.keyframes && layer.keyframes.length > 0;
        const relTime = Math.max(0, Math.min(layer.duration, localTime - layer.startTime));
        const kfPosX = hasKf ? interpolateProperty(layer.keyframes, 'posX', relTime, layer.position.x) : layer.position.x;
        const kfPosY = hasKf ? interpolateProperty(layer.keyframes, 'posY', relTime, layer.position.y) : layer.position.y;
        const kfScale = hasKf ? interpolateProperty(layer.keyframes, 'scale', relTime, 1) : 1;
        const kfRotation = hasKf ? interpolateProperty(layer.keyframes, 'rotation', relTime, 0) : 0;
        const kfOpacity = hasKf ? interpolateProperty(layer.keyframes, 'opacity', relTime, 1) : 1;
        return {
          position: 'absolute' as const,
          zIndex: isSelected ? 1000 : (zIndex ?? 10),
          left: `${kfPosX}%`,
          top: `${kfPosY}%`,
          transform: `translate(-50%, -50%) scale(${kfScale}) rotate(${kfRotation}deg)`,
          opacity: kfOpacity,
          width: 'max-content',
          maxWidth: 'none',
          flexShrink: 0,
          color: layer.color,
          fontSize: `${layer.fontSize}px`,
          fontFamily: layer.fontFamily,
          letterSpacing: layer.letterSpacing !== undefined ? `${layer.letterSpacing}px` : undefined,
          fontWeight: layer.isBold ? 800 : 400,
          fontStyle: layer.isItalic ? 'italic' : 'normal',
          cursor: isDragging ? 'grabbing' : 'grab',
          border: isSelected ? '2px solid #000000' : '2px solid transparent',
          outline: isSelected ? '2px dashed #70FFD2' : 'none',
          outlineOffset: isSelected ? '-2px' : '0',
          boxShadow: 'none',
          borderRadius: '4px',
          padding: '8px 16px',
          transition: 'border-color 0.15s ease',
          whiteSpace: 'pre-wrap' as const,
          textAlign: 'center' as const,
          userSelect: 'none' as const,
          touchAction: 'none' as const,
        };
      })()}
    >
      <EnterAnimationWrapper
        enterAnimation={layer.enterAnimation || 'none'}
        enterDuration={effectiveEnterDur}
        exitAnimation={layer.exitAnimation || 'none'}
        exitDuration={effectiveExitDur}
        triggerKey={triggerKey}
        isExiting={isExiting}
        localTime={localTime}
        layerStartTime={layer.startTime}
        layerDuration={layer.duration}
      >
        {layer.animationType === 'none' || !AnimComp ? (
          <span>{layer.text}</span>
        ) : (
          <AnimComp
            key={triggerKey}
            speed={effectiveSpeed}
            localTime={localTime}
            layerStartTime={layer.startTime}
            layerDuration={layer.duration}
          >
            {layer.text}
          </AnimComp>
        )}
      </EnterAnimationWrapper>
      {isSelected && (
        <SelectionCornerHandles
          onScaleStart={(e, corner) => {
            const handleEl = e.currentTarget as HTMLElement;
            if (handleEl && 'setPointerCapture' in handleEl) {
              try { handleEl.setPointerCapture(e.pointerId); } catch {}
            }

            const startMouseX = e.clientX;
            const startMouseY = e.clientY;
            const initialFontSize = layer.fontSize || 32;

            const handleMove = (moveEvent: PointerEvent) => {
              const effectiveDelta = calculateCornerDragDelta(corner, startMouseX, startMouseY, moveEvent.clientX, moveEvent.clientY);
              const newFontSize = Math.round(Math.max(1, Math.min(300, initialFontSize + effectiveDelta * 0.5)));
              updateLayer(layer.id, { fontSize: newFontSize } as any);
            };

            const handleUp = (upEvent: PointerEvent) => {
              window.removeEventListener('pointermove', handleMove);
              window.removeEventListener('pointerup', handleUp);
              if (handleEl && 'releasePointerCapture' in handleEl) {
                try { handleEl.releasePointerCapture(upEvent.pointerId); } catch {}
              }
            };

            window.addEventListener('pointermove', handleMove);
            window.addEventListener('pointerup', handleUp);
          }}
        />
      )}
    </div>
  );
}

function ComponentLayerRenderer({
  layer,
  zIndex,
  isVisible,
  isExiting,
  sceneId,
  sceneLayers,
  localTime,
}: {
  layer: MGComponentLayer;
  zIndex?: number;
  isVisible: boolean;
  isExiting: boolean;
  sceneId: string;
  sceneLayers: MGLayer[];
  localTime: number;
}) {
  const { state, dispatch, updateLayer, seekTo, play, getSceneStartTime } = useMGState();
  const { setActiveGuides } = useAlignmentGuides();
  const [triggerKey, setTriggerKey] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number } | null>(null);
  const hasMovedRef = useRef(false);
  const lastDragTimeRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneLayersRef = useRef(sceneLayers);
  sceneLayersRef.current = sceneLayers;
  const isSelected = state.selectedLayerId === layer.id;
  const prevVisibleRef = useRef(false);

  useEffect(() => {
    if (isVisible && !prevVisibleRef.current) {
      requestAnimationFrame(() => {
        setTriggerKey((k) => k + 1);
      });
    }
    prevVisibleRef.current = isVisible;
  }, [isVisible]);

  if (!isVisible && !isDragging) return null;
  if (layer.templateId === 'phone-device') return null;

  const componentPacing = layer.pacingPreset || 'balanced';
  const basePacingSpeed = componentPacing === 'snappy' ? 1.8 : componentPacing === 'cinematic' ? 0.75 : 1.0;
  const durationSpeedBoost = (layer.duration && layer.duration < 2.5)
    ? Math.max(1, 2.5 / Math.max(0.3, layer.duration))
    : 1;
  const speed = basePacingSpeed * durationSpeedBoost;

  const effectiveEnterDur = Math.min((layer.enterDuration ?? 1.0) / speed, (layer.duration || 1) * 0.4);
  const effectiveExitDur = Math.min((layer.exitDuration ?? 1.0) / speed, (layer.duration || 1) * 0.4);

  const renderComponent = () => {
    switch (layer.templateId) {
      case 'count-up':
        return <CountUp key={triggerKey} to={layer.props.to ?? 100} from={layer.props.from ?? 0} duration={layer.props.duration ?? 2} speed={speed} separator={layer.props.separator ?? ','} color={layer.props.color ?? '#ffffff'} isBold={layer.props.isBold ?? true} isItalic={layer.props.isItalic ?? false} fontFamily={layer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'} fontSize={layer.props.fontSize ?? 64} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'animated-list':
        return <AnimatedList key={triggerKey} items={layer.props.items} speed={speed} itemBg={layer.props.itemBg} textColor={layer.props.textColor} fontSize={layer.props.fontSize ?? 16} borderRadius={layer.props.borderRadius ?? 10} isBold={layer.props.isBold ?? false} isItalic={layer.props.isItalic ?? false} fontFamily={layer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'logo-loop':
        return <LogoLoop key={`${triggerKey}-${layer.props.speed ?? 1}`} items={layer.props.items} speed={speed * (layer.props.speed ?? 1)} direction={layer.props.direction} gap={layer.props.gap} logoHeight={layer.props.logoHeight ?? 38} textColor={layer.props.textColor ?? '#ffffff'} isBold={layer.props.isBold ?? true} isItalic={layer.props.isItalic ?? false} fontFamily={layer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'ai-loader':
        return <AILoader key={`${triggerKey}-${layer.props.speed ?? 1}`} variant={layer.props.variant ?? 'dots'} speed={speed * (layer.props.speed ?? 1)} color={layer.props.color ?? '#ffffff'} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'bubble-menu':
        return <BubbleMenu key={triggerKey} items={layer.props.items} speed={speed} menuBg="transparent" radius={layer.props.radius ?? 130} bubbleSize={layer.props.bubbleSize ?? 58} centerImageUrl={layer.props.centerImageUrl} centerBg={layer.props.centerBg} centerSize={layer.props.centerSize} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'unlumen-animated-list':
        return <UnlumenAnimatedList key={`${triggerKey}-${layer.props.speed ?? 1}`} items={layer.props.items} count={layer.props.count} speed={speed * (layer.props.speed ?? 1)} isBold={layer.props.isBold ?? true} isItalic={layer.props.isItalic ?? false} fontFamily={layer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'word-rotate':
        return <WordRotate key={`${triggerKey}-${layer.props.speed ?? 1}`} items={layer.props.items} speed={speed * (layer.props.speed ?? 1)} color={layer.props.color ?? '#ffffff'} fontSize={layer.props.fontSize ?? 48} fontFamily={layer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'} isBold={layer.props.isBold ?? true} isItalic={layer.props.isItalic ?? false} isLoop={layer.props.isLoop ?? true} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'highlighter':
        return <Highlighter key={triggerKey} text={layer.props.text ?? 'My name is World'} highlightWords={layer.props.highlightWords ?? 'World'} action={layer.props.action ?? 'highlight'} color={layer.props.color ?? '#ffd1dc'} textColor={layer.props.textColor ?? '#ffffff'} highlightTextColor={layer.props.highlightTextColor ?? ''} strokeWidth={layer.props.strokeWidth ?? 2} animationDuration={layer.props.animationDuration ?? 600} speed={speed} fontSize={layer.props.fontSize ?? 44} isBold={layer.props.isBold ?? true} isItalic={layer.props.isItalic ?? false} fontFamily={layer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'animated-beam':
        return <AnimatedBeam key={triggerKey} variant={layer.props.variant ?? 'unidirectional'} nodes={layer.props.nodes} centerNode={layer.props.centerNode} curvature={layer.props.curvature ?? 50} duration={layer.props.duration ?? 5} pathColor={layer.props.pathColor ?? 'gray'} pathWidth={layer.props.pathWidth ?? 2} pathOpacity={layer.props.pathOpacity ?? 0.2} gradientStartColor={layer.props.gradientStartColor ?? '#ffaa40'} gradientStopColor={layer.props.gradientStopColor ?? '#9c40ff'} speed={speed} width={layer.props.width ?? 600} height={layer.props.height ?? 300} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'orbiting-circles':
        return <OrbitingCircles key={`${triggerKey}-${layer.props.speed ?? 1}`} items={layer.props.items} radius={layer.props.radius ?? 120} speed={speed * (layer.props.speed ?? 1)} iconSize={layer.props.iconSize ?? 48} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'text-reveal':
        return <TextReveal key={triggerKey} text={layer.props.text ?? 'Reveal This Text'} speed={speed} color={layer.props.color ?? '#ffffff'} revealColor={layer.props.revealColor ?? '#FF9137'} fontSize={layer.props.fontSize ?? 48} fontFamily={layer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'} isBold={layer.props.isBold ?? true} isItalic={layer.props.isItalic ?? false} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'dia-text-reveal': {
        const diaText = layer.props.text ?? 'Design Systems';
        const parsedDiaText = Array.isArray(diaText) ? diaText : (typeof diaText === 'string' && diaText.includes('\n') ? diaText.split('\n').map(s => s.trim()).filter(Boolean) : diaText);
        const diaColors = layer.props.colors && layer.props.colors.length > 0 ? layer.props.colors : ['#c679c4', '#fa3d1d', '#ffb005', '#e1e1fe', '#0358f7'];
        return (
          <div key={triggerKey} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: `${layer.props.fontSize ?? 48}px`, fontFamily: layer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif', fontWeight: (layer.props.isBold ?? true) ? 800 : 400, fontStyle: (layer.props.isItalic ?? false) ? 'italic' : 'normal' }}>
             <DiaTextRevealUI
               text={parsedDiaText}
               colors={diaColors}
               textColor={layer.props.textColor ?? '#ffffff'}
               duration={1.5 / (speed * (layer.props.speed ?? 1))}
               repeat={layer.props.repeat ?? true}
               repeatDelay={layer.props.repeatDelay ?? 0.5}
               startOnView={false}
               localTime={localTime}
               layerStartTime={layer.startTime}
               layerDuration={layer.duration}
             />
          </div>
        );
      }
      case 'skeleton-shimmer':
        return <SkeletonShimmer key={`${triggerKey}-${layer.props.color ?? '#ffffff'}-${layer.props.speed ?? 1}`} lines={layer.props.lines ?? 3} showAvatar={layer.props.showAvatar ?? true} showImage={layer.props.showImage ?? false} color={layer.props.color ?? '#ffffff'} baseColor={layer.props.baseColor} shimmerColor={layer.props.shimmerColor} speed={speed * (layer.props.speed ?? 1)} borderRadius={layer.props.borderRadius ?? 6} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'text-3d-flip':
        return <Text3DFlip key={`${triggerKey}-${layer.props.rotateDirection ?? 'top'}-${layer.props.staggerFrom ?? 'first'}-${layer.props.isLoop ?? true}-${layer.props.speed ?? 1}`} text={layer.props.text ?? 'Stay hungry, stay foolish'} flippedText={layer.props.flippedText ?? ''} color={layer.props.color ?? '#ffffff'} flipColor={layer.props.flipColor ?? '#a855f7'} fontSize={layer.props.fontSize ?? 52} fontFamily={layer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'} isBold={layer.props.isBold ?? true} isItalic={layer.props.isItalic ?? false} staggerFrom={layer.props.staggerFrom ?? 'first'} rotateDirection={layer.props.rotateDirection ?? 'top'} speed={speed * (layer.props.speed ?? 1)} autoPlay={true} isLoop={layer.props.isLoop ?? true} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'camera-zoom':
        return <div style={{ width: '150px', height: '100px' }} />;
      case 'media-upload':
        return (
          <MediaUploadComponent
            src={layer.props.src}
            mediaType={layer.props.mediaType ?? 'image'}
            objectFit={layer.props.objectFit ?? 'contain'}
            borderRadius={layer.props.borderRadius ?? 8}
            width={layer.props.width ?? 300}
            height={layer.props.height ?? 200}
          />
        );
      case 'video-upload':
        return (
          <VideoUploadComponent
            src={layer.props.src}
            autoPlay={true}
            loop={layer.props.loop ?? true}
            muted={layer.props.muted ?? true}
            controls={false}
            objectFit={layer.props.objectFit ?? 'contain'}
            width={layer.props.width ?? 360}
            height={layer.props.height ?? 240}
            borderRadius={layer.props.borderRadius ?? 12}
            borderWidth={layer.props.borderWidth ?? 0}
            borderColor={layer.props.borderColor ?? '#a855f7'}
            playbackRate={layer.props.speed ?? 1}
            poster={layer.props.poster}
            localTime={localTime}
            layerStartTime={layer.startTime}
            layerDuration={layer.duration}
            originalDuration={layer.props.originalDuration}
            isPlaying={state.isPlaying}
            onUpload={(file) => {
              applyVideoFileToLayer(file, (updates: any) => updateLayer(layer.id, updates), layer.props);
            }}
          />
        );
      case 'image':
        return (
          <ImageUploadComponent
            src={layer.props.src}
            objectFit={layer.props.objectFit ?? 'contain'}
            width={layer.props.width ?? 300}
            height={layer.props.height ?? 200}
            borderRadius={layer.props.borderRadius ?? 8}
            onUpload={(file) => {
              applyImageFileToLayer(file, (updates: any) => updateLayer(layer.id, updates), layer.props);
            }}
          />
        );
      case 'phone-device':
        return null;
      case 'masked-heading':
        return (
          <MaskedHeadingComponent
            key={triggerKey}
            text={layer.props.text ?? 'Designed in the details'}
            mediaType={layer.props.mediaType ?? 'image'}
            src={layer.props.src ?? ''}
            poster={layer.props.poster ?? ''}
            fillScale={layer.props.fillScale ?? 1.25}
            parallax={layer.props.parallax ?? 26}
            drift={layer.props.drift ?? 18}
            brightness={layer.props.brightness ?? 1}
            saturation={layer.props.saturation ?? 1}
            grayscale={layer.props.grayscale ?? false}
            reveal={layer.props.reveal ?? 'rise'}
            trigger="mount"
            duration={(layer.props.duration ?? 1.1) / speed}
            stagger={(layer.props.stagger ?? 0.09) / speed}
            align={layer.props.align ?? 'center'}
            weight={layer.props.weight ?? 700}
            isItalic={layer.props.isItalic ?? false}
            fontFamily={layer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'}
            tracking={layer.props.tracking ?? -0.03}
            lineHeight={layer.props.lineHeight ?? 1.06}
            textScale={layer.props.textScale ?? 0.115}
            layerDuration={layer.duration}
            localTime={localTime}
            layerStartTime={layer.startTime}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      data-motion-layer-id={layer.id}
      onClick={(e) => {
        e.stopPropagation();
        // Only select if this layer was NOT just dragged
        if (_canvasDragState.draggedLayerId !== layer.id) {
          dispatch({ selectedLayerId: layer.id, activeSceneId: sceneId, activeSidebarTab: 'components' });
        }
        // Reset after click is handled
        if (_canvasDragState.draggedLayerId === layer.id) {
          _canvasDragState.draggedLayerId = null;
        }
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        const sStart = getSceneStartTime(sceneId);
        const compStart = sStart + layer.startTime;
        const compEnd = compStart + layer.duration;
        dispatch({
          selectedLayerId: layer.id,
          activeSceneId: sceneId,
          activeSidebarTab: 'components',
          playbackRange: { start: compStart, end: compEnd },
        });
        seekTo(compStart);
        play();
      }}
      onPointerDown={(e) => {
        if (!e.isPrimary || e.button !== 0) return;
        e.stopPropagation();

        const targetEl = e.currentTarget as HTMLElement;
        if (targetEl && 'setPointerCapture' in targetEl) {
          try {
            targetEl.setPointerCapture(e.pointerId);
          } catch {
            // ignore capture error
          }
        }

        const startMouseX = e.clientX;
        const startMouseY = e.clientY;
        const startPosX = layer.position.x;
        const startPosY = layer.position.y;
        let moved = false;
        setIsDragging(true);

        const handleMove = (moveEvent: PointerEvent) => {
          const dist = Math.hypot(moveEvent.clientX - startMouseX, moveEvent.clientY - startMouseY);
          if (dist > 3 && !moved) {
            moved = true;
            _canvasDragState.isDragging = true;
            _canvasDragState.draggedLayerId = layer.id;
          }

          if (!moved) return;

          const parent = containerRef.current?.parentElement;
          if (!parent) return;
          const rect = parent.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return;

          const deltaX = ((moveEvent.clientX - startMouseX) / rect.width) * 100;
          const deltaY = ((moveEvent.clientY - startMouseY) / rect.height) * 100;

          const rawPosition = {
            x: Math.max(0, Math.min(100, startPosX + deltaX)),
            y: Math.max(0, Math.min(100, startPosY + deltaY)),
          };

          const snapped = getAlignedCanvasPosition(layer.id, sceneLayersRef.current, rawPosition, parent, containerRef.current);
          setActiveGuides(snapped.guides);

          if (layer.templateId === 'phone-device') {
            const calcX = Number(((snapped.position.x - 50) / 40).toFixed(2));
            const calcY = Number((-(snapped.position.y - 50) / 40).toFixed(2));
            updateLayer(layer.id, {
              position: snapped.position,
              props: { ...layer.props, posX: calcX, posY: calcY },
            } as any);
          } else {
            updateLayer(layer.id, { position: snapped.position } as any);
          }
        };

        const handleUp = (upEvent: PointerEvent) => {
          window.removeEventListener('pointermove', handleMove);
          window.removeEventListener('pointerup', handleUp);
          if (targetEl && 'releasePointerCapture' in targetEl) {
            try {
              targetEl.releasePointerCapture(upEvent.pointerId);
            } catch {
              // ignore
            }
          }
          setIsDragging(false);
          setActiveGuides([]);
          _canvasDragState.isDragging = false;
        };

        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
      }}
      style={(() => {
        const hasKf = layer.keyframes && layer.keyframes.length > 0;
        const relTime = Math.max(0, Math.min(layer.duration, localTime - layer.startTime));
        const kfPosX = hasKf ? interpolateProperty(layer.keyframes, 'posX', relTime, layer.position.x) : layer.position.x;
        const kfPosY = hasKf ? interpolateProperty(layer.keyframes, 'posY', relTime, layer.position.y) : layer.position.y;
        const kfScale = hasKf ? interpolateProperty(layer.keyframes, 'scale', relTime, layer.scale ?? 1) : (layer.scale ?? 1);
        const kfRotation = hasKf ? interpolateProperty(layer.keyframes, 'rotation', relTime, 0) : 0;
        const kfOpacity = hasKf ? interpolateProperty(layer.keyframes, 'opacity', relTime, 1) : 1;
        return {
          position: 'absolute' as const,
          zIndex: isSelected ? 1000 : (zIndex ?? 10),
          left: `${kfPosX}%`,
          top: `${kfPosY}%`,
          transform: `translate(-50%, -50%) scale(${kfScale}) rotate(${kfRotation}deg)`,
          opacity: kfOpacity,
          width: 'max-content',
          maxWidth: 'none',
          flexShrink: 0,
          cursor: isDragging ? 'grabbing' : 'grab',
          border: isSelected ? '2px solid #000000' : '2px solid transparent',
          outline: isSelected ? '2px dashed #70FFD2' : 'none',
          outlineOffset: isSelected ? '-2px' : '0',
          boxShadow: 'none',
          borderRadius: layer.templateId === 'image' || layer.templateId === 'media-upload' || layer.templateId === 'video-upload' ? `${layer.props.borderRadius ?? 8}px` : '8px',
          padding: layer.templateId === 'image' || layer.templateId === 'media-upload' || layer.templateId === 'video-upload' ? '0' : '8px',
          transition: 'border-color 0.15s ease',
          userSelect: 'none' as const,
          touchAction: 'none' as const,
        };
      })()}
    >
      <EnterAnimationWrapper
        enterAnimation={layer.enterAnimation || 'none'}
        enterDuration={effectiveEnterDur}
        exitAnimation={layer.exitAnimation || 'none'}
        exitDuration={effectiveExitDur}
        triggerKey={triggerKey}
        isExiting={isExiting}
        localTime={localTime}
        layerStartTime={layer.startTime}
        layerDuration={layer.duration}
      >
        {renderComponent()}
      </EnterAnimationWrapper>
      {isSelected && (
        <SelectionCornerHandles
          onScaleStart={(e, corner) => {
            const handleEl = e.currentTarget as HTMLElement;
            if (handleEl && 'setPointerCapture' in handleEl) {
              try { handleEl.setPointerCapture(e.pointerId); } catch {}
            }

            const startMouseX = e.clientX;
            const startMouseY = e.clientY;
            const initialScale = layer.templateId === 'phone-device'
              ? (layer.props.deviceSize ?? layer.scale ?? 1)
              : (layer.scale ?? 1);

            const handleMove = (moveEvent: PointerEvent) => {
              const effectiveDelta = calculateCornerDragDelta(corner, startMouseX, startMouseY, moveEvent.clientX, moveEvent.clientY);
              const newScale = Number((Math.max(0.05, Math.min(5.0, initialScale + (effectiveDelta / 150)))).toFixed(2));
              if (layer.templateId === 'phone-device') {
                updateLayer(layer.id, { scale: newScale, props: { ...layer.props, deviceSize: newScale } } as any);
              } else {
                updateLayer(layer.id, { scale: newScale } as any);
              }
            };

            const handleUp = (upEvent: PointerEvent) => {
              window.removeEventListener('pointermove', handleMove);
              window.removeEventListener('pointerup', handleUp);
              if (handleEl && 'releasePointerCapture' in handleEl) {
                try { handleEl.releasePointerCapture(upEvent.pointerId); } catch {}
              }
            };

            window.addEventListener('pointermove', handleMove);
            window.addEventListener('pointerup', handleUp);
          }}
        />
      )}
    </div>
  );
}

function SceneRenderer({ scene, localTime, style }: { scene: MGScene; localTime: number; style?: React.CSSProperties }) {
  const { state, dispatch } = useMGState();
  const { scenes } = state;

  // Calculate camera zoom from active camera-zoom layers
  let cameraScale = 1;
  let cameraOriginX = 50;
  let cameraOriginY = 50;
  const hasCameraZoom = scene.layers.some((l) => l.type === 'component' && l.templateId === 'camera-zoom');
  if (hasCameraZoom) {
    scene.layers.forEach((layer) => {
      if (layer.type === 'component' && layer.templateId === 'camera-zoom') {
        const layerEnd = layer.startTime + layer.duration;
        const zoomOutDuration = 0.5;
        if (localTime >= layer.startTime && localTime < layerEnd) {
          const duration = layer.duration || 1;
          const progress = (localTime - layer.startTime) / duration;
          const zoomScale = layer.props.zoomScale ?? 0;
          const t = Math.min(progress / 0.3, 1);
          const eased = t * t * (3 - 2 * t);
          cameraScale = 1 + (zoomScale - 1) * eased;
          cameraOriginX = layer.position.x;
          cameraOriginY = layer.position.y;
        } else if (localTime >= layerEnd && localTime < layerEnd + zoomOutDuration) {
          const zoomScale = layer.props.zoomScale ?? 0;
          const outProgress = (localTime - layerEnd) / zoomOutDuration;
          const t = 1 - outProgress;
          const eased = t * t * (3 - 2 * t);
          cameraScale = 1 + (zoomScale - 1) * eased;
          cameraOriginX = layer.position.x;
          cameraOriginY = layer.position.y;
        }
      }
    });
  }

  return (
    <div
      onClick={() => {
        if (_canvasDragState.draggedLayerId) { _canvasDragState.draggedLayerId = null; return; }
        dispatch({ selectedLayerId: null });
      }}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: scene.bgImage ? undefined : scene.bgColor,
        backgroundImage: scene.bgImage ? `url(${scene.bgImage})` : undefined,
        backgroundSize: scene.bgImage ? 'cover' : undefined,
        backgroundPosition: scene.bgImage ? 'center' : undefined,
        overflow: 'hidden',
        ...style,
      }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        transform: cameraScale !== 1 ? `scale(${cameraScale})` : undefined,
        transformOrigin: `${cameraOriginX}% ${cameraOriginY}%`,
        transition: 'none',
        overflow: 'hidden',
        borderRadius: 'inherit',
      }}>
      {scene.layers.map((layer, index) => {
        // Layer visibility is strictly within this scene's local time
        const layerEnd = Math.min(layer.startTime + layer.duration, getSceneDuration(scene, scenes.length));
        const isVisible = localTime >= layer.startTime && localTime < layerEnd;
        // Determine if layer is in its exit window using accurate scaled duration
        const basePacing = layer.pacingPreset === 'snappy' ? 1.8 : layer.pacingPreset === 'cinematic' ? 0.75 : 1.0;
        const durBoost = (layer.duration && layer.duration < 2.5) ? Math.max(1, 2.5 / Math.max(0.3, layer.duration)) : 1;
        const wordCount = layer.type === 'text' ? ((layer.text || '').split(/\s+/).filter(Boolean).length || 1) : 1;
        const wordBoost = layer.type === 'text' && wordCount > 4 ? 1 + (wordCount - 4) * 0.15 : 1;
        const layerSpeed = basePacing * durBoost * wordBoost;

        const rawExitDur = ('exitDuration' in layer ? layer.exitDuration : 1.0) || 1.0;
        const effectiveExitDur = Math.min(rawExitDur / layerSpeed, (layer.duration || 1) * 0.4);
        const isExiting = isVisible && (layerEnd - localTime) <= effectiveExitDur;
        const zIndex = (scene.layers.length - index) * 10;

        if (layer.type === 'component') {
          return (
            <ComponentLayerRenderer
              key={layer.id}
              layer={layer}
              zIndex={zIndex}
              isVisible={isVisible}
              isExiting={isExiting}
              sceneId={scene.id}
              sceneLayers={scene.layers}
              localTime={localTime}
            />
          );
        }

        return (
          <TextLayerRenderer
            key={layer.id}
            layer={layer}
            zIndex={zIndex}
            isVisible={isVisible}
            isExiting={isExiting}
            sceneId={scene.id}
            sceneLayers={scene.layers}
            localTime={localTime}
          />
        );
      })}
      </div>
    </div>
  );
}

export default function MotionCanvas() {
  const { state, dispatch, removeLayer, removeLayers, getSceneAtTime, addScene } = useMGState();
  const { scenes, currentTime, selectedLayerId, multiSelectedLayerIds = [], aspectRatio } = state;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const logicalWidth = aspectRatio === '9:16' ? 1080 : 1920;
  const logicalHeight = aspectRatio === '9:16' ? 1920 : 1080;

  // Measure container and compute scale for logical canvas
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      const scaleX = width / logicalWidth;
      const scaleY = height / logicalHeight;
      setScale(Math.min(scaleX, scaleY));
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [logicalWidth, logicalHeight]);

  // Delete selected layer(s) on Delete/Backspace key
  useEffect(() => {
    if (!selectedLayerId && multiSelectedLayerIds.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const toDelete = Array.from(new Set([...(selectedLayerId ? [selectedLayerId] : []), ...multiSelectedLayerIds]));
        if (toDelete.length > 1) {
          removeLayers(toDelete);
        } else if (toDelete.length === 1) {
          removeLayer(toDelete[0]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerId, multiSelectedLayerIds, removeLayer, removeLayers]);

  // Keep an empty selected scene visible without giving it timeline duration.
  const activeScene = scenes.find((scene) => scene.id === state.activeSceneId);
  const currentInfo = activeScene && getSceneDuration(activeScene, scenes.length) === 0
    ? { scene: activeScene, localTime: 0, transitionProgress: 1 }
    : getSceneAtTime(currentTime);

  const currentScene = currentInfo?.scene || activeScene || scenes[0];
  const hasNoLayers = !currentScene || currentScene.layers.length === 0;

  // Find previous scene for exit animation (or dark fallback for initial scene)
  const prevScene = useMemo(() => {
    if (!currentInfo) return null;
    const idx = scenes.findIndex((s) => s.id === currentInfo.scene.id);
    if (idx > 0 && currentInfo.transitionProgress < 1) {
      return scenes[idx - 1];
    }
    return null;
  }, [currentInfo, scenes]);

  const prevLocalTime = useMemo(() => {
    if (!prevScene) return 0;
    // show last frame of previous scene (subtracting 0.001 so localTime < layerEnd stays true)
    return Math.max(0, getSceneDuration(prevScene, scenes.length) - 0.001);
  }, [prevScene, scenes.length]);

  // Collect all active 3D phone devices across incoming scene and transition scene
  const activeDevices = useMemo<ActiveDeviceDescriptor[]>(() => {
    const list: ActiveDeviceDescriptor[] = [];

    // 1. Current / incoming scene devices
    if (currentScene) {
      const localT = currentInfo ? currentInfo.localTime : 0;
      const sceneDur = getSceneDuration(currentScene, scenes.length);
      currentScene.layers?.forEach((l) => {
        if (l.type === 'component' && l.templateId === 'phone-device') {
          const lEnd = Math.min(l.startTime + l.duration, sceneDur);
          if (localT >= l.startTime && (localT < lEnd || Math.abs(localT - lEnd) < 0.001)) {
            list.push({
              layer: l,
              sceneId: currentScene.id,
              localTime: localT,
              isOutgoing: false,
            });
          }
        }
      });
    }

    // 2. Previous / outgoing scene devices during transition
    if (prevScene && currentInfo && currentInfo.transitionProgress < 1) {
      const prevSceneDur = getSceneDuration(prevScene, scenes.length);
      prevScene.layers?.forEach((l) => {
        if (l.type === 'component' && l.templateId === 'phone-device') {
          const lEnd = Math.min(l.startTime + l.duration, prevSceneDur);
          if (prevLocalTime >= l.startTime && (prevLocalTime < lEnd || Math.abs(prevLocalTime - lEnd) < 0.001)) {
            list.push({
              layer: l,
              sceneId: prevScene.id,
              localTime: prevLocalTime,
              isOutgoing: true,
              transitionOpacity: 1 - currentInfo.transitionProgress,
            });
          }
        }
      });
    }

    return list;
  }, [currentScene, currentInfo, prevScene, prevLocalTime, scenes.length]);

  // Calculate the DOM zIndex for the DevicePoolCanvas based on the active phone-device layer's position in scene.layers
  const activeDeviceZIndex = useMemo(() => {
    if (!currentScene || activeDevices.length === 0) return 5;
    const currentDevice = activeDevices.find((d) => !d.isOutgoing) || activeDevices[0];
    if (!currentDevice || !currentDevice.layer) return 5;
    const isSelected = selectedLayerId === currentDevice.layer.id || multiSelectedLayerIds.includes(currentDevice.layer.id);
    if (isSelected) return 1000;
    const idx = currentScene.layers.findIndex((l) => l.id === currentDevice.layer.id);
    if (idx !== -1) {
      return (currentScene.layers.length - idx) * 10;
    }
    return 5;
  }, [currentScene, activeDevices, selectedLayerId, multiSelectedLayerIds]);

  return (
    <div
      ref={containerRef}
      data-motion-canvas-wrapper="true"
      onClick={() => {
        if (_canvasDragState.draggedLayerId) { _canvasDragState.draggedLayerId = null; return; }
        dispatch({ selectedLayerId: null, activeSidebarTab: 'scene' });
      }}
      style={{
        width: 'auto',
        height: '90%',
        aspectRatio: aspectRatio === '9:16' ? '9 / 16' : '16 / 9',
        maxWidth: '95%',
        maxHeight: '90%',
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.15)',
        background: '#12121c',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        data-logical-canvas="true"
        style={{
        width: `${logicalWidth}px`,
        height: `${logicalHeight}px`,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: 'center center',
        flexShrink: 0,
      }}>
      {/* Incoming scene (underneath — revealed as previous scene masks away) */}
      {currentInfo && (
        <SceneRenderer
          scene={currentInfo.scene}
          localTime={currentInfo.localTime}
          style={{
            zIndex: currentInfo.transitionProgress < 1 ? 1 : undefined,
          }}
        />
      )}

      {/* Previous scene (on top — gets masked/clipped/faded to reveal incoming) */}
      {prevScene && currentInfo && currentInfo.transitionProgress < 1 && (
        <SceneRenderer
          scene={prevScene}
          localTime={prevLocalTime}
          style={{
            zIndex: 2,
            ...getOutgoingTransitionStyle(currentInfo.scene.transition, currentInfo.transitionProgress),
          }}
        />
      )}

      {/* Persistent 3D Device Pool Canvas (Single WebGL context, zero lifecycle teardown) */}
      <DevicePoolCanvas activeDevices={activeDevices} zIndex={activeDeviceZIndex} />

      {/* Loading line overlay (only for loading-line transition) */}
      {currentInfo && currentInfo.transitionProgress < 1 && currentInfo.scene.transition === 'loading-line' && (
        <LoadingLineOverlay progress={currentInfo.transitionProgress} />
      )}

      {/* Assisted alignment guides */}
      <AlignmentGuidesOverlay />
      </div>
    </div>
  );
}
