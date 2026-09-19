/* eslint-disable react-hooks/immutability */
'use client';

/*
  Apple iPhone Duo Fold Star White GLB Model.
  Preserves intact bone hierarchy for AnimationMixer (open-close / close-open folding clips)
  while supporting dynamic screenshots, video textures, device color customization,
  and dynamic OLED screen area reveal as the phone opens and closes.
*/

import * as THREE from 'three';
import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, useVideoTexture } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import { usePlaceholderTexture } from '@/hooks/usePlaceholderTexture';
import { AppContext } from '@/store';
import type { MediaType } from '@/types';

/**
 * Injects dynamic OLED screen reveal shader chunk into MeshBasicMaterial.
 * The display illuminates and expands outward from the hinge as the phone opens,
 * and powers down to black when folded shut.
 */
function applyFoldRevealShader(mat: THREE.MeshBasicMaterial, foldUniform: { value: number }) {
  mat.customProgramCacheKey = () => 'iphone-duo-oled-reveal';

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uFoldProgress = foldUniform;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `
      #include <common>
      uniform float uFoldProgress;
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `
      #include <map_fragment>

      // Dynamic OLED reveal sweeping from right to left as phone opens (1.0 = open, 0.0 = closed)
      float openProg = 1.0 - uFoldProgress;

      // Right-to-left sweep across (1.0 - vMapUv.x): 0.0 at right edge, 1.0 at left edge
      float distFromRight = 1.0 - vMapUv.x;
      float revealProg = clamp((openProg - 0.02) / 0.88, 0.0, 1.0);
      float sweep = revealProg * 1.35;
      float edgeDist = sweep - distFromRight;
      float revealFactor = smoothstep(-0.12, 0.40, edgeDist);

      // Translucent screen visibility with 40% more black tint (~7% dim translucency)
      float baseTranslucency = 0.07;
      float screenBrightness = mix(baseTranslucency, 1.0, revealFactor);

      // Smooth power-down only when phone is completely shut (< 5 degrees)
      float shutDim = smoothstep(0.0, 0.06, openProg);
      float finalFactor = screenBrightness * shutDim;

      // Pure screen image colors without any white tint or artificial beam
      diffuseColor.rgb = diffuseColor.rgb * finalFactor;
      `
    );
  };
}

function StaticScreenMaterial({
  screenMesh,
  url,
  foldUniform,
}: {
  screenMesh: THREE.SkinnedMesh;
  url: string;
  foldUniform: { value: number };
}) {
  const texture = useTexture(url);

  React.useLayoutEffect(() => {
    if (!texture || !screenMesh) return;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.flipY = true;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.repeat.set(1, 1);
    texture.offset.set(0, 0);
    texture.needsUpdate = true;

    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      toneMapped: false,
      depthWrite: true,
      depthTest: true,
    });
    applyFoldRevealShader(mat, foldUniform);

    screenMesh.material = mat;
    screenMesh.renderOrder = 10;
    mat.needsUpdate = true;

    return () => {
      mat.dispose();
    };
  }, [texture, screenMesh, foldUniform]);

  return null;
}

function VideoScreenMaterial({
  screenMesh,
  url,
  foldUniform,
  onVideoRestart,
}: {
  screenMesh: THREE.SkinnedMesh;
  url: string;
  foldUniform: { value: number };
  onVideoRestart?: (restart: () => void) => void;
}) {
  const texture = useVideoTexture(url, {
    loop: false,
    start: true,
    muted: true,
    playsInline: true,
  });

  React.useLayoutEffect(() => {
    if (!texture || !screenMesh) return;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.flipY = true;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.repeat.set(1, 1);
    texture.offset.set(0, 0);
    texture.needsUpdate = true;

    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      toneMapped: false,
      depthWrite: true,
      depthTest: true,
    });
    applyFoldRevealShader(mat, foldUniform);

    screenMesh.material = mat;
    screenMesh.renderOrder = 10;
    mat.needsUpdate = true;

    return () => {
      mat.dispose();
    };
  }, [texture, screenMesh, foldUniform]);

  React.useEffect(() => {
    if (onVideoRestart && texture && texture.image) {
      const video = texture.image as HTMLVideoElement;
      onVideoRestart(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
      });
    }
  }, [onVideoRestart, texture]);

  return null;
}

function DirectTextureMaterial({
  screenMesh,
  texture,
  foldUniform,
}: {
  screenMesh: THREE.SkinnedMesh;
  texture: THREE.Texture;
  foldUniform: { value: number };
}) {
  React.useLayoutEffect(() => {
    if (!texture || !screenMesh) return;
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      toneMapped: false,
      depthWrite: true,
      depthTest: true,
    });
    applyFoldRevealShader(mat, foldUniform);

    screenMesh.material = mat;
    screenMesh.renderOrder = 10;
    mat.needsUpdate = true;

    return () => {
      mat.dispose();
    };
  }, [texture, screenMesh, foldUniform]);

  return null;
}

function PlaceholderMaterial({
  screenMesh,
  placeholderTexture,
  foldUniform,
}: {
  screenMesh: THREE.SkinnedMesh;
  placeholderTexture: THREE.Texture | null;
  foldUniform: { value: number };
}) {
  React.useLayoutEffect(() => {
    if (!placeholderTexture || !screenMesh) return;
    const mat = new THREE.MeshBasicMaterial({
      map: placeholderTexture,
      toneMapped: false,
      depthWrite: true,
      depthTest: true,
    });
    applyFoldRevealShader(mat, foldUniform);

    screenMesh.material = mat;
    screenMesh.renderOrder = 10;
    mat.needsUpdate = true;

    return () => {
      mat.dispose();
    };
  }, [placeholderTexture, screenMesh, foldUniform]);

  return null;
}

function ScreenManager({
  screenMesh,
  screenshotUrl,
  texture,
  mediaType,
  placeholderTexture,
  foldUniform,
  onVideoRestart,
}: {
  screenMesh: THREE.SkinnedMesh | null;
  screenshotUrl?: string | null;
  texture?: THREE.Texture | null;
  mediaType?: MediaType;
  placeholderTexture: THREE.Texture | null;
  foldUniform: { value: number };
  onVideoRestart?: (restart: () => void) => void;
}) {
  if (!screenMesh) return null;

  if (texture) {
    return <DirectTextureMaterial screenMesh={screenMesh} texture={texture} foldUniform={foldUniform} />;
  }

  if (screenshotUrl && mediaType === 'video') {
    return (
      <React.Suspense fallback={<PlaceholderMaterial screenMesh={screenMesh} placeholderTexture={placeholderTexture} foldUniform={foldUniform} />}>
        <VideoScreenMaterial screenMesh={screenMesh} url={screenshotUrl} foldUniform={foldUniform} onVideoRestart={onVideoRestart} />
      </React.Suspense>
    );
  }

  if (screenshotUrl) {
    return (
      <React.Suspense fallback={<PlaceholderMaterial screenMesh={screenMesh} placeholderTexture={placeholderTexture} foldUniform={foldUniform} />}>
        <StaticScreenMaterial screenMesh={screenMesh} url={screenshotUrl} foldUniform={foldUniform} />
      </React.Suspense>
    );
  }

  return <PlaceholderMaterial screenMesh={screenMesh} placeholderTexture={placeholderTexture} foldUniform={foldUniform} />;
}

function StaticCoverMaterial({
  mesh,
  url,
}: {
  mesh: THREE.Mesh;
  url: string;
}) {
  const texture = useTexture(url);

  React.useLayoutEffect(() => {
    if (!texture || !mesh) return;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.flipY = true;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.repeat.set(1, 1);
    texture.offset.set(0, 0);
    texture.needsUpdate = true;

    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      toneMapped: false,
      depthWrite: true,
      depthTest: true,
    });
    mesh.material = mat;
    mesh.renderOrder = 10;
    mat.needsUpdate = true;

    return () => {
      mat.dispose();
    };
  }, [texture, mesh]);

  return null;
}

function VideoCoverMaterial({
  mesh,
  url,
}: {
  mesh: THREE.Mesh;
  url: string;
}) {
  const texture = useVideoTexture(url, {
    loop: true,
    start: true,
    muted: true,
    playsInline: true,
  });

  React.useLayoutEffect(() => {
    if (!texture || !mesh) return;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.flipY = true;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.repeat.set(1, 1);
    texture.offset.set(0, 0);
    texture.needsUpdate = true;

    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      toneMapped: false,
      depthWrite: true,
      depthTest: true,
    });
    mesh.material = mat;
    mesh.renderOrder = 10;
    mat.needsUpdate = true;

    return () => {
      mat.dispose();
    };
  }, [texture, mesh]);

  return null;
}

function PlaceholderCoverMaterial({
  mesh,
  placeholderTexture,
}: {
  mesh: THREE.Mesh;
  placeholderTexture: THREE.Texture | null;
}) {
  React.useLayoutEffect(() => {
    if (!placeholderTexture || !mesh) return;
    const mat = new THREE.MeshBasicMaterial({
      map: placeholderTexture,
      toneMapped: false,
      depthWrite: true,
      depthTest: true,
    });
    mesh.material = mat;
    mesh.renderOrder = 10;
    mat.needsUpdate = true;

    return () => {
      mat.dispose();
    };
  }, [placeholderTexture, mesh]);

  return null;
}

function CoverScreenManager({
  mesh,
  screenshotUrl,
  mediaType,
  placeholderTexture,
}: {
  mesh: THREE.Mesh | null;
  screenshotUrl?: string | null;
  mediaType?: MediaType;
  placeholderTexture: THREE.Texture | null;
}) {
  if (!mesh) return null;

  if (screenshotUrl && mediaType === 'video') {
    return (
      <React.Suspense fallback={<PlaceholderCoverMaterial mesh={mesh} placeholderTexture={placeholderTexture} />}>
        <VideoCoverMaterial key={screenshotUrl} mesh={mesh} url={screenshotUrl} />
      </React.Suspense>
    );
  }

  if (screenshotUrl) {
    return (
      <React.Suspense fallback={<PlaceholderCoverMaterial mesh={mesh} placeholderTexture={placeholderTexture} />}>
        <StaticCoverMaterial key={screenshotUrl} mesh={mesh} url={screenshotUrl} />
      </React.Suspense>
    );
  }

  return <PlaceholderCoverMaterial mesh={mesh} placeholderTexture={placeholderTexture} />;
}

const MODEL_PATH = '/models/apple-iphone-duo-fold/source/apple_iphone_duo_fold_star_white.glb';

export function Model({
  screenshotUrl,
  closeScreenshotUrl,
  screenRef,
  texture,
  mediaType,
  closeMediaType,
  deviceColor,
  onVideoRestart,
  ...props
}: React.ComponentPropsWithoutRef<'group'> & {
  screenshotUrl?: string | null;
  closeScreenshotUrl?: string | null;
  screenRef?: React.RefObject<THREE.Mesh | THREE.SkinnedMesh>;
  texture?: THREE.Texture | null;
  mediaType?: MediaType;
  closeMediaType?: MediaType;
  deviceColor?: string;
  onVideoRestart?: (restart: () => void) => void;
}) {
  const { scene, animations } = useGLTF(MODEL_PATH) as any;
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const placeholderTexture = usePlaceholderTexture();

  const appCtx = React.useContext(AppContext);
  const state = appCtx?.state;

  const activeDeviceColor = deviceColor || state?.deviceColor || '#ffffff';
  const foldUniformRef = React.useRef({ value: 0 });

  const isDynamicSame = state?.useSameImageForClose !== false;
  const effectiveCloseUrl = isDynamicSame
    ? (screenshotUrl || null)
    : (closeScreenshotUrl || state?.closeScreenshotUrl || screenshotUrl || null);
  const effectiveCloseMediaType = isDynamicSame
    ? (mediaType || 'image')
    : (closeMediaType || state?.closeMediaType || mediaType || 'image');

  const screenMesh = React.useMemo(() => {
    return (clone.getObjectByName('Front_Screen') as THREE.SkinnedMesh) || null;
  }, [clone]);

  const backScreenMesh = React.useMemo(() => {
    return (clone.getObjectByName('Back_Screen_Display') as THREE.Mesh) || null;
  }, [clone]);

  // UV reprojection for Back_Screen_Display so cover screen maps upright and edge-to-edge
  const backUvFixedRef = React.useRef(false);
  React.useLayoutEffect(() => {
    if (backUvFixedRef.current || !backScreenMesh) return;
    const geometry = backScreenMesh.geometry;
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box) return;

    const posAttr = geometry.attributes.position;
    const uvAttr = geometry.attributes.uv;

    if (posAttr && uvAttr) {
      const minX = box.min.x;
      const maxX = box.max.x;
      const minY = box.min.y;
      const maxY = box.max.y;
      const width = maxX - minX;
      const height = maxY - minY;

      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);

        const u = (x - minX) / width;
        const v = (y - minY) / height;

        uvAttr.setXY(i, u, v);
      }
      uvAttr.needsUpdate = true;
      backUvFixedRef.current = true;
    }
  }, [backScreenMesh]);

  // Forward screenRef if provided
  React.useEffect(() => {
    if (screenRef && screenMesh) {
      (screenRef as any).current = screenMesh;
    }
  }, [screenRef, screenMesh]);

  // Apply device color to body materials (frame, back panels, hinge axle, buttons)
  React.useEffect(() => {
    if (!clone) return;
    const bodyKeys = new Set([
      'C_StarWhite_Side',
      'C_StarWhite_Backpanel',
      'C_SW_Backpanel_Inner',
      'C_SW_ButtonCap',
      'C_SW_Side_Matte',
      'C_SW_CamGloss',
    ]);

    clone.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const mat = child.material;
        if (bodyKeys.has(mat.name) && mat.color) {
          mat.color.set(activeDeviceColor);
          mat.needsUpdate = true;
        }
      }
    });
  }, [clone, activeDeviceColor]);

  // Re-project UV coordinates for the screen mesh so screenshots map upright and edge-to-edge
  const uvFixedRef = React.useRef(false);
  React.useLayoutEffect(() => {
    if (uvFixedRef.current || !screenMesh) return;
    const geometry = screenMesh.geometry;
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box) return;

    const posAttr = geometry.attributes.position;
    const uvAttr = geometry.attributes.uv;

    if (posAttr && uvAttr) {
      const minX = box.min.x;
      const maxX = box.max.x;
      const minY = box.min.y;
      const maxY = box.max.y;
      const width = maxX - minX;
      const height = maxY - minY;

      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);

        const u = (x - minX) / width;
        const v = (y - minY) / height;

        uvAttr.setXY(i, u, v);
      }
      uvAttr.needsUpdate = true;
      uvFixedRef.current = true;
    }
  }, [screenMesh]);

  const mixerRef = React.useRef<THREE.AnimationMixer | null>(null);
  const actionRef = React.useRef<THREE.AnimationAction | null>(null);

  // Setup AnimationMixer for the open-close clip embedded in the GLTF
  React.useEffect(() => {
    if (!clone || !animations || animations.length === 0) return;
    const mixer = new THREE.AnimationMixer(clone);
    mixerRef.current = mixer;

    const clip = animations[0]; // 'open-close' (duration 2.0s)
    const action = mixer.clipAction(clip);
    action.play();
    actionRef.current = action;

    return () => {
      action.stop();
      mixer.stopAllAction();
      mixer.uncacheRoot(clone);
      mixerRef.current = null;
      actionRef.current = null;
    };
  }, [clone, animations]);

  // Drive animation per frame from GSAP timeline or hold static fold angle, and update dynamic OLED reveal
  useFrame(() => {
    if (!mixerRef.current || !actionRef.current) return;

    let targetProgress = state?.foldProgress ?? 0;

    // Check if the current template animates fold progress on a parent group's userData
    if (state?.template === 'open-close' || state?.template === 'close-open') {
      let obj: THREE.Object3D | null = clone;
      while (obj) {
        if (obj.userData && typeof obj.userData.foldProgress === 'number') {
          targetProgress = obj.userData.foldProgress;
          break;
        }
        obj = obj.parent;
      }
    }

    // Safe clamp to avoid wrapping at duration 2.0s
    // 0 = 0s (180° flat open display), 1 = 1.999s (0° fully closed)
    const safeTime = Math.min(1.999, Math.max(0, targetProgress * 2.0));
    actionRef.current.paused = false;
    mixerRef.current.setTime(safeTime);
    actionRef.current.paused = true;

    // Update dynamic screen reveal uniform
    foldUniformRef.current.value = targetProgress;
  });

  // Proportional scale: nicely framed in portrait (70) and landscape (88.58)
  const orientation = state?.orientation ?? 'landscape';
  const scale = orientation === 'portrait' ? 70 : 88.58;

  return (
    <group
      {...props}
      dispose={null}
      scale={scale}
      position={[0, -0.05913 * scale, 0.00306 * scale]}
    >
      <primitive object={clone} />
      <ScreenManager
        screenMesh={screenMesh}
        screenshotUrl={screenshotUrl}
        texture={texture}
        mediaType={mediaType}
        placeholderTexture={placeholderTexture}
        foldUniform={foldUniformRef.current}
        onVideoRestart={onVideoRestart}
      />
      <CoverScreenManager
        mesh={backScreenMesh}
        screenshotUrl={effectiveCloseUrl}
        mediaType={effectiveCloseMediaType}
        placeholderTexture={placeholderTexture}
      />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
