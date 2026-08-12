/* eslint-disable react-hooks/immutability */
/*
Auto-generated & adapted for S22 Ultra GLB model.
*/

import * as THREE from 'three'
import React from 'react'
import { useGLTF, useTexture, useVideoTexture } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { usePlaceholderTexture } from '@/hooks/usePlaceholderTexture'
import { useAppState } from '@/store'
import type { MediaType } from '@/types'

function ScreenMaterial({ url }: { url: string }) {
  const texture = useTexture(url);

  React.useLayoutEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.flipY = true;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.repeat.set(1, 1);
      texture.offset.set(0, 0);
      texture.needsUpdate = true;
    }
  }, [texture]);

  return (
    <meshBasicMaterial
      map={texture}
      toneMapped={false}
    />
  );
}

function VideoScreenMaterial({ url, onTextureReady }: { url: string; onTextureReady?: (restart: () => void) => void }) {
  const texture = useVideoTexture(url, {
    loop: false,
    start: true,
    muted: true,
    playsInline: true,
  });

  React.useLayoutEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.flipY = true;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.repeat.set(1, 1);
      texture.offset.set(0, 0);
      texture.needsUpdate = true;
    }
  }, [texture]);

  React.useEffect(() => {
    if (onTextureReady && texture && texture.image) {
      const video = texture.image as HTMLVideoElement;
      onTextureReady(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
      });
    }
  }, [onTextureReady, texture]);

  return (
    <meshBasicMaterial
      map={texture}
      toneMapped={false}
    />
  );
}

type GLTFResult = GLTF & {
  nodes: {
    S22_Ultra001: THREE.Mesh
    S22_Ultra001_1: THREE.Mesh
    S22_Ultra001_2: THREE.Mesh
    S22_Ultra001_3: THREE.Mesh
    S22_Ultra001_4: THREE.Mesh
    S22_Ultra001_5: THREE.Mesh
    S22_Ultra001_6: THREE.Mesh
    S22_Ultra001_7: THREE.Mesh
    S22_Ultra001_8: THREE.Mesh
    S22_Ultra001_9: THREE.Mesh
    S22_Ultra001_10: THREE.Mesh
    S22_Ultra001_11: THREE.Mesh
    S22_Ultra001_12: THREE.Mesh
    S22_Ultra001_13: THREE.Mesh
    S22_Ultra001_14: THREE.Mesh
    S22_Ultra001_15: THREE.Mesh
    S22_Ultra001_16: THREE.Mesh
    S22_Ultra001_17: THREE.Mesh
    S22_Ultra001_18: THREE.Mesh
    S22_Ultra001_19: THREE.Mesh
    S22_Ultra001_20: THREE.Mesh
    S22_Ultra001_21: THREE.Mesh
    S22_Ultra001_22: THREE.Mesh
  }
  materials: {
    Rearcase: THREE.MeshStandardMaterial
    Bezel: THREE.MeshStandardMaterial
    Display_ActiveArea: THREE.MeshStandardMaterial
    Cam_lens: THREE.MeshStandardMaterial
    Flash: THREE.MeshStandardMaterial
    Sensor: THREE.MeshStandardMaterial
    SAMSUNG_LOGO: THREE.MeshStandardMaterial
    Antenna_Plastic: THREE.MeshStandardMaterial
    Black_hole: THREE.MeshStandardMaterial
    Flash_Glass: THREE.MeshStandardMaterial
    Cam_Body: THREE.MeshStandardMaterial
    Rearcase_hole: THREE.MeshStandardMaterial
    Zoom_Cam: THREE.MeshStandardMaterial
    Usb_1: THREE.MeshStandardMaterial
    Usb_2: THREE.MeshStandardMaterial
    Cam_Bezel: THREE.MeshStandardMaterial
    BackCamDeco: THREE.MeshStandardMaterial
    Back_Cover_Glass: THREE.MeshStandardMaterial
    BackCover_Glass_hole: THREE.MeshStandardMaterial
    Cam_Glass: THREE.MeshStandardMaterial
    Gray: THREE.MeshStandardMaterial
    Red: THREE.MeshStandardMaterial
    ['Speaker/Mic']: THREE.MeshStandardMaterial
  }
  animations: THREE.AnimationClip[]
}

export function Model({ screenshotUrl, screenRef, texture, mediaType, onVideoRestart, ...props }: React.ComponentPropsWithoutRef<'group'> & { screenshotUrl?: string | null, screenRef?: React.RefObject<THREE.Mesh>, texture?: THREE.Texture | null, mediaType?: MediaType, onVideoRestart?: (restart: () => void) => void }) {
  const { nodes, materials } = useGLTF('/models/S22Ultra.glb') as unknown as GLTFResult
  const placeholderTexture = usePlaceholderTexture();
  const { state } = useAppState();

  const bodyMaterial = React.useMemo(() => {
    Object.values(materials).forEach((mat) => {
      if ('color' in mat && mat.color) {
        const color = (mat as any).color as THREE.Color;
        
        // Skip display screen material
        if (mat.name === 'Display_ActiveArea' || mat.name === 'Screen') return;

        // Skip dark lenses, sensors, black hole
        if (
          mat.name === 'Cam_lens' ||
          mat.name === 'Sensor' ||
          mat.name === 'Black_hole' ||
          mat.name === 'Zoom_Cam' ||
          mat.name === 'Cam_Glass' ||
          mat.name === 'Flash_Glass'
        ) {
          return;
        }

        // Skip flash and emissive elements
        if (
          mat.name === 'Flash' ||
          ('emissive' in mat && (mat as any).emissive && ((mat as any).emissive.r > 0.2 || (mat as any).emissive.g > 0.2))
        ) {
          return;
        }

        color.set(state.deviceColor);

        if ((mat as any).map) {
          (mat as any).map = null;
        }
      }
    });
    return materials.Rearcase;
  }, [materials, state.deviceColor]);

  // Re-project UV coordinates for the screen mesh so user screenshots align perfectly
  React.useLayoutEffect(() => {
    if (!nodes.S22_Ultra001_2) return;
    const geometry = nodes.S22_Ultra001_2.geometry;
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
        const v = 1 - (y - minY) / height;

        uvAttr.setXY(i, u, v);
      }
      uvAttr.needsUpdate = true;
    }
  }, [nodes.S22_Ultra001_2]);

  return (
    <group {...props} dispose={null} scale={88.58}>
      <mesh geometry={nodes.S22_Ultra001.geometry} material={bodyMaterial} />
      <mesh geometry={nodes.S22_Ultra001_1.geometry} material={materials.Bezel} />
      
      {/* Screen Mesh */}
      <mesh
        ref={screenRef}
        geometry={nodes.S22_Ultra001_2.geometry}
        name="S22_Ultra001_2"
      >
        {texture ? (
          <meshBasicMaterial
            map={texture}
            toneMapped={false}
          />
        ) : screenshotUrl && mediaType === 'video' ? (
          <React.Suspense fallback={<meshBasicMaterial color="#0f0f1a" toneMapped={false} />}>
            <VideoScreenMaterial url={screenshotUrl} onTextureReady={onVideoRestart} />
          </React.Suspense>
        ) : screenshotUrl ? (
          <React.Suspense fallback={<meshBasicMaterial color="#0f0f1a" toneMapped={false} />}>
            <ScreenMaterial url={screenshotUrl} />
          </React.Suspense>
        ) : (
          <meshBasicMaterial
            map={placeholderTexture}
            toneMapped={false}
          />
        )}
      </mesh>

      <mesh geometry={nodes.S22_Ultra001_3.geometry} material={materials.Cam_lens} />
      <mesh geometry={nodes.S22_Ultra001_4.geometry} material={materials.Flash} />
      <mesh geometry={nodes.S22_Ultra001_5.geometry} material={materials.Sensor} />
      <mesh geometry={nodes.S22_Ultra001_6.geometry} material={materials.SAMSUNG_LOGO} />
      <mesh geometry={nodes.S22_Ultra001_7.geometry} material={materials.Antenna_Plastic} />
      <mesh geometry={nodes.S22_Ultra001_8.geometry} material={materials.Black_hole} />
      <mesh geometry={nodes.S22_Ultra001_9.geometry} material={materials.Flash_Glass} />
      <mesh geometry={nodes.S22_Ultra001_10.geometry} material={materials.Cam_Body} />
      <mesh geometry={nodes.S22_Ultra001_11.geometry} material={materials.Rearcase_hole} />
      <mesh geometry={nodes.S22_Ultra001_12.geometry} material={materials.Zoom_Cam} />
      <mesh geometry={nodes.S22_Ultra001_13.geometry} material={materials.Usb_1} />
      <mesh geometry={nodes.S22_Ultra001_14.geometry} material={materials.Usb_2} />
      <mesh geometry={nodes.S22_Ultra001_15.geometry} material={materials.Cam_Bezel} />
      <mesh geometry={nodes.S22_Ultra001_16.geometry} material={materials.BackCamDeco} />
      <mesh geometry={nodes.S22_Ultra001_17.geometry} material={bodyMaterial} />
      <mesh geometry={nodes.S22_Ultra001_18.geometry} material={materials.BackCover_Glass_hole} />
      <mesh geometry={nodes.S22_Ultra001_19.geometry} material={materials.Cam_Glass} />
      <mesh geometry={nodes.S22_Ultra001_20.geometry} material={materials.Gray} />
      <mesh geometry={nodes.S22_Ultra001_21.geometry} material={materials.Red} />
      <mesh geometry={nodes.S22_Ultra001_22.geometry} material={materials['Speaker/Mic']} />
    </group>
  )
}

useGLTF.preload('/models/S22Ultra.glb')
