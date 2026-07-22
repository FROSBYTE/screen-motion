import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Loads the Drag_And_Drop.png placeholder texture for device screens.
 */
export function usePlaceholderTexture(): THREE.Texture {
  const texture = useTexture('/Drag_And_Drop.png');
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.flipY = true;
  texture.needsUpdate = true;
  return texture;
}

