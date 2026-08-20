'use client';

import React, { useEffect, useState, useMemo, useRef, Suspense } from 'react';
import { motion } from 'motion/react';
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
import AlignmentGuidesOverlay from '@/components/AlignmentGuidesOverlay';
import type { AlignmentGuide } from '@/types';
import { useGLTF, Center } from '@react-three/drei';
import { createAnimation, AnimationTarget, TemplateAnimation } from '@/templates/animations';
import type { TemplateName } from '@/types';
import * as THREE from 'three';

// iPhone screen mesh name
const IPHONE_SCREEN_MESH = 'Object_18';
const ANDROID_SCREEN_MESH = 'S22_Ultra001_2';

function IPhoneModel({ deviceColor, screenImage, screenVideo }: { deviceColor: string; screenImage?: string; screenVideo?: string }) {
  const { scene, materials } = useGLTF('/models/iphone16.gltf') as any;
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const initialColors = useRef<Record<string, THREE.Color>>({});
  const appliedColor = useRef('');
  const uvFixed = useRef(false);

  useEffect(() => {
    if (uvFixed.current) return;
    const screenMesh = cloned.getObjectByName(IPHONE_SCREEN_MESH) as THREE.Mesh | null;
    if (!screenMesh) return;
    const geometry = screenMesh.geometry;
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box) return;

    const posAttr = geometry.attributes.position;
    const uvAttr = geometry.attributes.uv;
    if (!posAttr || !uvAttr) return;

    const minX = box.min.x;
    const maxX = box.max.x;
    const minY = box.min.y;
    const maxY = box.max.y;
    const width = maxX - minX;
    const height = maxY - minY;

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      uvAttr.setXY(i, (x - minX) / width, (y - minY) / height);
    }
    uvAttr.needsUpdate = true;
    uvFixed.current = true;
  }, [cloned]);

  useEffect(() => {
    cloned.traverse((child: any) => {
      if (!child.isMesh) return;
      if (child.name === IPHONE_SCREEN_MESH) return;

      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat: any) => {
        if (!mat || !mat.color) return;
        if (mat.name === 'Display_ActiveArea' || mat.name === 'Screen' || mat.name === 'Object_18') return;
        if (mat.emissive && (mat.emissive.r > 0.2 || mat.emissive.g > 0.2)) return;

        const name = (mat.name || '').toLowerCase();
        const isNotchOrLens =
          mat.name === 'Lens_Glass' || mat.name === 'Flash' || name.includes('notch') ||
          name.includes('island') || name.includes('hole') || name.includes('camera') ||
          name.includes('lens') || name.includes('sensor') || name.includes('speaker') ||
          name.includes('bezel');

        if (isNotchOrLens) {
          mat.color.set('#000000');
          if (mat.map) mat.map = null;
        } else {
          mat.color.set(deviceColor);
          if (mat.map) mat.map = null;
        }
        mat.needsUpdate = true;
      });
    });
  }, [deviceColor, cloned]);

  useEffect(() => {
    const screenMesh = cloned.getObjectByName(IPHONE_SCREEN_MESH) as THREE.Mesh | null;
    if (!screenMesh) return;

    if (screenVideo) {
      const video = document.createElement('video');
      video.src = screenVideo;
      video.crossOrigin = 'anonymous';
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.play().catch(() => {});
      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.colorSpace = THREE.SRGBColorSpace;
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.flipY = true;
      screenMesh.material = new THREE.MeshBasicMaterial({ map: videoTexture, toneMapped: false });
    } else {
      const imgUrl = screenImage || '/Drag_And_Drop.png';
      const loader = new THREE.TextureLoader();
      loader.load(imgUrl, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.flipY = true;
        screenMesh.material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
      });
    }
  }, [screenImage, screenVideo, cloned]);

  return <primitive object={cloned} />;
}

function AndroidModelComponent({ deviceColor, screenImage, screenVideo }: { deviceColor: string; screenImage?: string; screenVideo?: string }) {
  const { scene } = useGLTF('/models/S22Ultra.glb') as any;
  const cloned = useMemo(() => scene.clone(true), [scene]);

  const uvFixed = useRef(false);

  useEffect(() => {
    if (uvFixed.current) return;
    const screenMesh = cloned.getObjectByName(ANDROID_SCREEN_MESH) as THREE.Mesh | null;
    if (!screenMesh) return;

    const geo = screenMesh.geometry;
    geo.computeBoundingBox();
    const box = geo.boundingBox;
    if (!box) return;

    const width = box.max.x - box.min.x;
    const height = box.max.y - box.min.y;
    const minX = box.min.x;
    const minY = box.min.y;

    const posAttr = geo.attributes.position;
    const uvAttr = geo.attributes.uv;

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      uvAttr.setXY(i, (x - minX) / width, (y - minY) / height);
    }
    uvAttr.needsUpdate = true;
    uvFixed.current = true;
  }, [cloned]);

  useEffect(() => {
    cloned.traverse((child: any) => {
      if (!child.isMesh) return;
      if (child.name === ANDROID_SCREEN_MESH) return;

      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat: any) => {
        if (!mat || !mat.color) return;
        if (mat.name === 'Display_ActiveArea' || mat.name === 'Screen' || mat.name === 'S22_Ultra001_2') return;
        if (mat.emissive && (mat.emissive.r > 0.2 || mat.emissive.g > 0.2)) return;

        const isBodyPart =
          mat.name === 'Rearcase' ||
          mat.name === 'Back_Cover_Glass' ||
          mat.name === 'BackCamDeco' ||
          mat.name === 'Cam_Body' ||
          mat.name === 'Rearcase_hole' ||
          mat.name === 'BackCover_Glass_hole' ||
          child.name === 'S22_Ultra001' ||
          child.name === 'S22_Ultra001_16' ||
          child.name === 'S22_Ultra001_17' ||
          child.name === 'S22_Ultra001_10';

        if (isBodyPart) {
          mat.color.set(deviceColor);
          if (mat.map) mat.map = null;
          mat.needsUpdate = true;
          return;
        }

        const isHardware =
          mat.name === 'Zoom_Cam' || mat.name === 'Flash' || mat.name === 'Cam_lens' ||
          mat.name === 'Black_hole' || mat.name === 'Sensor' || mat.name === 'Bezel' ||
          mat.name === 'Cam_Bezel' || mat.name === 'Cam_Glass' || mat.name === 'Flash_Glass' ||
          mat.name === 'Usb_1' || mat.name === 'Usb_2' || mat.name === 'Antenna_Plastic' ||
          mat.name === 'Speaker/Mic';

        if (isHardware) {
          mat.color.set('#000000');
          if (mat.map) mat.map = null;
          mat.needsUpdate = true;
          return;
        }

        mat.color.set(deviceColor);
        if (mat.map) mat.map = null;
        mat.needsUpdate = true;
      });
    });
  }, [deviceColor, cloned]);

  useEffect(() => {
    const screenMesh = cloned.getObjectByName(ANDROID_SCREEN_MESH) as THREE.Mesh | null;
    if (!screenMesh) return;

    if (screenVideo) {
      const video = document.createElement('video');
      video.src = screenVideo;
      video.crossOrigin = 'anonymous';
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.play().catch(() => {});
      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.colorSpace = THREE.SRGBColorSpace;
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.flipY = true;
      screenMesh.material = new THREE.MeshBasicMaterial({ map: videoTexture, toneMapped: false });
    } else {
      const imgUrl = screenImage || '/Drag_And_Drop.png';
      const loader = new THREE.TextureLoader();
      loader.load(imgUrl, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.flipY = true;
        screenMesh.material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
      });
    }
  }, [screenImage, screenVideo, cloned]);

  return (
    <group position={[0, -7.3704, 0]} scale={88.58}>
      <primitive object={cloned} />
    </group>
  );
}

function AnimatedDeviceInline({
  deviceType,
  deviceColor,
  screenImage,
  screenVideo,
  animationTemplate,
  speed = 1,
  deviceSize = 1,
  posX = 0,
  posY = 0,
  rotX = 0,
  rotY = 0,
  localTime = 0,
}: {
  deviceType: string;
  deviceColor: string;
  screenImage?: string;
  screenVideo?: string;
  animationTemplate: string;
  speed: number;
  deviceSize: number;
  posX: number;
  posY: number;
  rotX: number;
  rotY: number;
  localTime?: number;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const innerGroupRef = useRef<THREE.Group>(null!);
  const animRef = useRef<TemplateAnimation | null>(null);
  const { camera } = useThree();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!groupRef.current || !camera) return;

    if (groupRef.current) {
      groupRef.current.visible = false;
    }

    // Kill previous animation
    if (animRef.current) {
      animRef.current.timeline.kill();
    }

    // Reset transforms - groupRef is the animation target
    groupRef.current.position.set(0, 0, 0);
    groupRef.current.rotation.set(0, 0, 0);
    groupRef.current.scale.setScalar(1);

    // Get screen mesh from inner group
    const screenMesh = groupRef.current.getObjectByName('Object_18') as THREE.Mesh 
      || groupRef.current.getObjectByName('Object_9') as THREE.Mesh 
      || groupRef.current.getObjectByName('S22_Ultra001_2') as THREE.Mesh 
      || groupRef.current.getObjectByName('Display_ActiveArea') as THREE.Mesh 
      || null;

    const target: AnimationTarget = {
      camera: camera as THREE.PerspectiveCamera,
      device: groupRef.current,
      screenMesh: screenMesh,
    };

    try {
      const anim = createAnimation(animationTemplate as TemplateName, 'portrait', target, speed);
      animRef.current = anim;
      const dur = anim.duration || 3;
      const progress = Math.max(0, Math.min(localTime / dur, 1));
      anim.timeline.progress(progress);
      anim.timeline.pause();
    } catch {
      animRef.current = null;
    }

    if (groupRef.current) {
      groupRef.current.visible = true;
    }
    setIsReady(true);

    return () => {
      if (animRef.current) animRef.current.timeline.kill();
    };
  }, [animationTemplate, camera, speed]);

  useEffect(() => {
    if (animRef.current) {
      animRef.current.timeline.timeScale(speed);
    }
  }, [speed]);

  // Sync GSAP timeline progress with scene localTime for frame-accurate playback & export across all templates
  useEffect(() => {
    if (animRef.current && animRef.current.timeline) {
      const dur = animRef.current.duration || 3;
      const progress = Math.max(0, Math.min(localTime / dur, 1));
      animRef.current.timeline.progress(progress);
      animRef.current.timeline.pause();
    }
  }, [localTime]);

  function CameraOffsetController({ posX = 0, posY = 0 }: { posX: number; posY: number }) {
    const { camera, size } = useThree();

    useFrame(() => {
      const cam = camera as THREE.PerspectiveCamera;
      if (posX !== 0 || posY !== 0) {
        const pxX = -posX * (size.width / 5);
        const pxY = posY * (size.height / 5);
        cam.setViewOffset(size.width, size.height, pxX, pxY, size.width, size.height);
      } else {
        if (cam.view) cam.clearViewOffset();
      }
    });

    return null;
  }

  const baseScale = 0.15 * (deviceSize || 1);

  return (
    <group ref={groupRef} visible={isReady}>
      <CameraOffsetController posX={posX} posY={posY} />
      <group ref={innerGroupRef} position={[0, 0, 0]}>
        <group 
          scale={[baseScale, baseScale, baseScale]}
          rotation-x={(rotX * Math.PI) / 180}
          rotation-y={(rotY * Math.PI) / 180}
        >
          {deviceType === 'iphone' ? (
            <IPhoneModel deviceColor={deviceColor} screenImage={screenImage} screenVideo={screenVideo} />
          ) : (
            <AndroidModelComponent deviceColor={deviceColor} screenImage={screenImage} screenVideo={screenVideo} />
          )}
        </group>
      </group>
    </group>
  );
}

function ShortSlideDownWrapper({ children, speed = 1 }: { children?: string; speed?: number }) {
  const text = children || '';
  return <ShortSlideDown phrases={[text]} interval={2500 / speed} />;
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

function easeCubicOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeCubicInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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
    const t = easeCubicOut(Math.max(0, Math.min(1, relTime / enterDuration)));
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
    const t = easeCubicInOut(Math.max(0, Math.min(1, (exitDuration - timeUntilEnd) / exitDuration)));
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
  'text-reveal': (props: any) => <TextReveal text={props.children} speed={props.speed || 1} color={props.color || '#ffffff'} revealColor="#a855f7" fontSize={props.fontSize} fontFamily={props.fontFamily} />,
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

// Module-level drag state — survives React re-renders/re-mounts
const _canvasDragState = { isDragging: false, draggedLayerId: null as string | null };

function TextLayerRenderer({ layer, isVisible, isExiting, sceneId, sceneLayers, localTime }: { layer: MGTextLayer; isVisible: boolean; isExiting: boolean; sceneId: string; sceneLayers: MGLayer[]; localTime: number }) {
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
          border: isSelected ? '2px dashed #a855f7' : '2px solid transparent',
          outline: isSelected ? '1px solid #000000' : 'none',
          boxShadow: isSelected ? '0 0 0 1px #000000' : 'none',
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
          <AnimComp key={triggerKey} speed={effectiveSpeed}>
            {layer.text}
          </AnimComp>
        )}
      </EnterAnimationWrapper>
      {isSelected && (
        <SelectionCornerHandles
          onScaleStart={(e, _corner) => {
            const handleEl = e.currentTarget as HTMLElement;
            if (handleEl && 'setPointerCapture' in handleEl) {
              try { handleEl.setPointerCapture(e.pointerId); } catch {}
            }

            const startMouseX = e.clientX;
            const startMouseY = e.clientY;
            const initialFontSize = layer.fontSize || 32;

            const parentEl = containerRef.current;
            if (!parentEl) return;
            const rect = parentEl.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const initialDist = Math.hypot(startMouseX - centerX, startMouseY - centerY);

            const handleMove = (moveEvent: PointerEvent) => {
              const currentDist = Math.hypot(moveEvent.clientX - centerX, moveEvent.clientY - centerY);
              const ratio = currentDist / Math.max(10, initialDist);
              const newFontSize = Math.round(Math.max(12, Math.min(200, initialFontSize * ratio)));
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

function ComponentLayerRenderer({ layer, isVisible, isExiting, sceneId, sceneLayers, localTime }: { layer: MGComponentLayer; isVisible: boolean; isExiting: boolean; sceneId: string; sceneLayers: MGLayer[]; localTime: number }) {
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
        return <CountUp key={triggerKey} to={layer.props.to ?? 100} from={layer.props.from ?? 0} duration={layer.props.duration ?? 2} speed={speed} separator={layer.props.separator ?? ','} color={layer.props.color ?? '#ffffff'} isBold={layer.props.isBold ?? true} isItalic={layer.props.isItalic ?? false} fontFamily={layer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'} fontSize={layer.props.fontSize ?? 48} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'animated-list':
        return <AnimatedList key={`${triggerKey}-${layer.props.speed ?? 1}`} items={layer.props.items} speed={speed * (layer.props.speed ?? 1)} itemBg={layer.props.itemBg} textColor={layer.props.textColor} fontSize={layer.props.fontSize} borderRadius={layer.props.borderRadius} isBold={layer.props.isBold} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'logo-loop':
        return <LogoLoop key={`${triggerKey}-${layer.props.speed ?? 1}`} items={layer.props.items} speed={speed * (layer.props.speed ?? 1)} direction={layer.props.direction} gap={layer.props.gap} logoHeight={layer.props.logoHeight} textColor={layer.props.textColor ?? '#ffffff'} isBold={layer.props.isBold ?? true} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'ai-loader':
        return <AILoader key={`${triggerKey}-${layer.props.speed ?? 1}`} variant={layer.props.variant ?? 'dots'} speed={speed * (layer.props.speed ?? 1)} color={layer.props.color ?? '#ffffff'} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'bubble-menu':
        return <BubbleMenu key={triggerKey} items={layer.props.items} speed={speed} menuBg="transparent" radius={layer.props.radius ?? 90} bubbleSize={layer.props.bubbleSize ?? 44} centerImageUrl={layer.props.centerImageUrl} centerBg={layer.props.centerBg} centerSize={layer.props.centerSize} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'unlumen-animated-list':
        return <UnlumenAnimatedList key={`${triggerKey}-${layer.props.speed ?? 1}`} items={layer.props.items} count={layer.props.count} speed={speed * (layer.props.speed ?? 1)} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'word-rotate':
        return <WordRotate key={`${triggerKey}-${layer.props.speed ?? 1}`} items={layer.props.items} speed={speed * (layer.props.speed ?? 1)} color={layer.props.color ?? '#ffffff'} fontSize={layer.props.fontSize ?? 32} fontFamily={layer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'} isBold={layer.props.isBold ?? true} isItalic={layer.props.isItalic ?? false} isLoop={layer.props.isLoop ?? true} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'highlighter':
        return <Highlighter key={triggerKey} text={layer.props.text ?? 'My name is World'} highlightWords={layer.props.highlightWords ?? 'World'} action={layer.props.action ?? 'highlight'} color={layer.props.color ?? '#ffd1dc'} textColor={layer.props.textColor ?? '#ffffff'} highlightTextColor={layer.props.highlightTextColor ?? ''} strokeWidth={layer.props.strokeWidth ?? 2} animationDuration={layer.props.animationDuration ?? 600} speed={speed} fontSize={layer.props.fontSize ?? 32} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'animated-beam':
        return <AnimatedBeam key={triggerKey} variant={layer.props.variant ?? 'unidirectional'} nodes={layer.props.nodes} centerNode={layer.props.centerNode} curvature={layer.props.curvature ?? 50} duration={layer.props.duration ?? 5} pathColor={layer.props.pathColor ?? 'gray'} pathWidth={layer.props.pathWidth ?? 2} pathOpacity={layer.props.pathOpacity ?? 0.2} gradientStartColor={layer.props.gradientStartColor ?? '#ffaa40'} gradientStopColor={layer.props.gradientStopColor ?? '#9c40ff'} speed={speed} width={layer.props.width ?? 400} height={layer.props.height ?? 200} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'orbiting-circles':
        return <OrbitingCircles key={`${triggerKey}-${layer.props.speed ?? 1}`} items={layer.props.items} radius={layer.props.radius ?? 80} speed={speed * (layer.props.speed ?? 1)} iconSize={layer.props.iconSize ?? 36} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'text-reveal':
        return <TextReveal key={triggerKey} text={layer.props.text ?? 'Reveal This Text'} speed={speed} color={layer.props.color ?? '#ffffff'} revealColor={layer.props.revealColor ?? '#a855f7'} fontSize={layer.props.fontSize ?? 32} fontFamily={layer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'skeleton-shimmer':
        return <SkeletonShimmer key={`${triggerKey}-${layer.props.color ?? '#ffffff'}-${layer.props.speed ?? 1}`} lines={layer.props.lines ?? 3} showAvatar={layer.props.showAvatar ?? true} showImage={layer.props.showImage ?? false} color={layer.props.color ?? '#ffffff'} baseColor={layer.props.baseColor} shimmerColor={layer.props.shimmerColor} speed={speed * (layer.props.speed ?? 1)} borderRadius={layer.props.borderRadius ?? 6} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
      case 'text-3d-flip':
        return <Text3DFlip key={`${triggerKey}-${layer.props.rotateDirection ?? 'top'}-${layer.props.staggerFrom ?? 'first'}-${layer.props.isLoop ?? true}-${layer.props.speed ?? 1}`} text={layer.props.text ?? 'Stay hungry, stay foolish'} flippedText={layer.props.flippedText ?? ''} color={layer.props.color ?? '#ffffff'} flipColor={layer.props.flipColor ?? '#a855f7'} fontSize={layer.props.fontSize ?? 36} fontFamily={layer.props.fontFamily ?? '"Plus Jakarta Sans", sans-serif'} staggerFrom={layer.props.staggerFrom ?? 'first'} rotateDirection={layer.props.rotateDirection ?? 'top'} speed={speed * (layer.props.speed ?? 1)} autoPlay={true} isLoop={layer.props.isLoop ?? true} layerDuration={layer.duration} localTime={localTime} layerStartTime={layer.startTime} />;
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
            const calcX = Number(((snapped.position.x - 50) / 12.5).toFixed(2));
            const calcY = Number((-(snapped.position.y - 50) / 12.5).toFixed(2));
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
          left: `${kfPosX}%`,
          top: `${kfPosY}%`,
          transform: `translate(-50%, -50%) scale(${kfScale}) rotate(${kfRotation}deg)`,
          opacity: kfOpacity,
          width: 'max-content',
          maxWidth: 'none',
          flexShrink: 0,
          cursor: isDragging ? 'grabbing' : 'grab',
          border: isSelected ? '2px dashed #a855f7' : '2px solid transparent',
          outline: isSelected ? '1px solid #000000' : 'none',
          boxShadow: isSelected ? '0 0 0 1px #000000' : 'none',
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
          onScaleStart={(e, _corner) => {
            const handleEl = e.currentTarget as HTMLElement;
            if (handleEl && 'setPointerCapture' in handleEl) {
              try { handleEl.setPointerCapture(e.pointerId); } catch {}
            }

            const startMouseX = e.clientX;
            const startMouseY = e.clientY;
            const initialScale = layer.templateId === 'phone-device'
              ? (layer.props.deviceSize ?? layer.scale ?? 1)
              : (layer.scale ?? 1);

            const parentEl = containerRef.current;
            if (!parentEl) return;
            const rect = parentEl.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const initialDist = Math.hypot(startMouseX - centerX, startMouseY - centerY);

            const handleMove = (moveEvent: PointerEvent) => {
              const currentDist = Math.hypot(moveEvent.clientX - centerX, moveEvent.clientY - centerY);
              const ratio = currentDist / Math.max(10, initialDist);
              const newScale = Number((Math.max(0.2, Math.min(5.0, initialScale * ratio))).toFixed(2));
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
  const { dispatch } = useMGState();

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
      <div style={{ width: '100%', height: '100%', transform: `scale(${cameraScale})`, transformOrigin: `${cameraOriginX}% ${cameraOriginY}%`, transition: 'none', overflow: 'hidden', borderRadius: 'inherit' }}>
      {scene.layers.map((layer) => {
        // Layer visibility is strictly within this scene's local time
        const layerEnd = Math.min(layer.startTime + layer.duration, getSceneDuration(scene));
        const isVisible = localTime >= layer.startTime && localTime < layerEnd;
        // Determine if layer is in its exit window (capped at max 40% of layer duration)
        const rawExitDur = ('exitDuration' in layer ? layer.exitDuration : 1.0) || 1.0;
        const exitDur = Math.min(rawExitDur, layer.duration * 0.4);
        const isExiting = isVisible && (layerEnd - localTime) <= exitDur;

        if (layer.type === 'component') {
          return (
            <ComponentLayerRenderer
              key={layer.id}
              layer={layer}
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
            isVisible={isVisible}
            isExiting={isExiting}
            sceneId={scene.id}
            sceneLayers={scene.layers}
            localTime={localTime}
          />
        );
      })}
      </div>
      {/* Phone device - full screen canvas overlay with Enter/Exit animations */}
      {scene.layers.map((layer) => {
        if (layer.type !== 'component' || layer.templateId !== 'phone-device') return null;
        const layerEnd = Math.min(layer.startTime + layer.duration, getSceneDuration(scene));
        const isVisible = localTime >= layer.startTime && localTime < layerEnd;
        const pacing = layer.pacingPreset || 'balanced';
        const basePacingSpeed = pacing === 'snappy' ? 1.8 : pacing === 'cinematic' ? 0.75 : 1.0;
        const durationSpeedBoost = (layer.duration && layer.duration < 2.5)
          ? Math.max(1, 2.5 / Math.max(0.3, layer.duration))
          : 1;
        const speed = basePacingSpeed * durationSpeedBoost;
        const effectiveEnterDur = Math.min((layer.enterDuration ?? 1.0) / speed, (layer.duration || 1) * 0.4);
        const effectiveExitDur = Math.min((layer.exitDuration ?? 1.0) / speed, (layer.duration || 1) * 0.4);
        const isExiting = isVisible && (layerEnd - localTime) <= effectiveExitDur;

        if (!isVisible) return null;

        return (
          <div
            key={layer.id}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <EnterAnimationWrapper
              enterAnimation={layer.enterAnimation || 'none'}
              enterDuration={effectiveEnterDur}
              exitAnimation={layer.exitAnimation || 'none'}
              exitDuration={effectiveExitDur}
              triggerKey={1}
              isExiting={isExiting}
              localTime={localTime}
              layerStartTime={layer.startTime}
              layerDuration={layer.duration}
              style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 'inherit' }}
            >
              <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                <Canvas
                  camera={{ position: [0, 0, 4], fov: 45 }}
                  gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
                  style={{ background: 'transparent', pointerEvents: 'none' }}
                  dpr={[1, 2]}
                >
                  <ambientLight intensity={0.7} />
                  <directionalLight position={[5, 5, 5]} intensity={1} />
                  <directionalLight position={[-3, 3, -2]} intensity={0.4} />
                  <Suspense fallback={null}>
                    <AnimatedDeviceInline
                      deviceType={layer.props.deviceType ?? 'iphone'}
                      deviceColor={layer.props.deviceColor ?? '#1a1a1a'}
                      screenImage={layer.props.screenImage}
                      screenVideo={layer.props.screenVideo}
                      animationTemplate={layer.props.animationTemplate ?? 'float'}
                      speed={(layer.pacingPreset === 'snappy' ? 1.8 : layer.pacingPreset === 'cinematic' ? 0.75 : 1.0) * ((layer.duration && layer.duration < 2.5) ? Math.max(1, 2.5 / Math.max(0.3, layer.duration)) : 1)}
                      deviceSize={layer.props.deviceSize ?? layer.props.size ?? layer.scale ?? 1}
                      posX={layer.props.posX ?? 0}
                      posY={layer.props.posY ?? 0}
                      rotX={layer.props.rotX ?? 0}
                      rotY={layer.props.rotY ?? 0}
                      localTime={localTime - layer.startTime}
                    />
                  </Suspense>
                </Canvas>
              </div>
            </EnterAnimationWrapper>
          </div>
        );
      })}
    </div>
  );
}

export default function MotionCanvas() {
  const { state, dispatch, removeLayer, getSceneAtTime } = useMGState();
  const { scenes, currentTime, selectedLayerId } = state;

  // Delete selected layer on Delete/Backspace key
  useEffect(() => {
    if (!selectedLayerId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        removeLayer(selectedLayerId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerId, removeLayer]);

  // Keep an empty selected scene visible without giving it timeline duration.
  const activeScene = scenes.find((scene) => scene.id === state.activeSceneId);
  const currentInfo = activeScene && getSceneDuration(activeScene) === 0
    ? { scene: activeScene, localTime: 0, transitionProgress: 1 }
    : getSceneAtTime(currentTime);

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
    return Math.max(0, getSceneDuration(prevScene) - 0.001);
  }, [prevScene]);

  return (
    <div
      data-motion-canvas-wrapper="true"
      onClick={() => {
        if (_canvasDragState.draggedLayerId) { _canvasDragState.draggedLayerId = null; return; }
        dispatch({ selectedLayerId: null, activeSidebarTab: 'scene' });
      }}
      style={{
        width: 'auto',
        height: '85%',
        aspectRatio: '16 / 9',
        maxWidth: '90%',
        maxHeight: '85%',
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.15)',
        background: '#12121c',
        border: '1px solid var(--border-color)',
      }}
    >
      {/* Incoming scene (underneath — revealed as previous scene masks away) */}
      {currentInfo && (
        <SceneRenderer
          scene={currentInfo.scene}
          localTime={currentInfo.localTime}
          style={{
            zIndex: 1,
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

      {/* Loading line overlay (only for loading-line transition) */}
      {currentInfo && currentInfo.transitionProgress < 1 && currentInfo.scene.transition === 'loading-line' && (
        <LoadingLineOverlay progress={currentInfo.transitionProgress} />
      )}

      {/* Assisted alignment guides */}
      <AlignmentGuidesOverlay />

      {scenes.length === 0 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '16px',
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        }}>
          Add scenes to get started
        </div>
      )}
    </div>
  );
}
