'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';

/**
 * Custom hook that creates a THREE.VideoTexture from a video URL.
 * The video plays exactly 1 cycle (no looping).
 * Provides a `restart()` function to replay from the beginning.
 */
export function useVideoTexture(url: string | null) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);

  useEffect(() => {
    if (!url) {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
        videoRef.current = null;
      }
      return;
    }

    let isCancelled = false;
    const textureRef = { current: false };
    
    // Create and attach video to DOM to force browser decoding
    const video = document.createElement('video');
    video.style.display = 'none';
    video.loop = false; // Single cycle
    video.muted = true;
    video.playsInline = true;
    
    // Only set crossOrigin if it's a remote http/https URL, not for blob URLs
    if (!url.startsWith('blob:')) {
      video.crossOrigin = 'anonymous';
    }

    document.body.appendChild(video);

    const initTextureAndPlay = () => {
      if (isCancelled || textureRef.current) return;
      textureRef.current = true;
      
      const newTexture = new THREE.VideoTexture(video);
      newTexture.colorSpace = THREE.SRGBColorSpace;
      newTexture.minFilter = THREE.LinearFilter;
      newTexture.magFilter = THREE.LinearFilter;
      newTexture.flipY = true;
      newTexture.wrapS = THREE.ClampToEdgeWrapping;
      newTexture.wrapT = THREE.ClampToEdgeWrapping;

      videoRef.current = video;
      setTexture(newTexture);

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          if (!isCancelled) console.warn("Video play failed:", e);
        });
      }
    };

    video.addEventListener('canplay', initTextureAndPlay);
    video.addEventListener('loadeddata', initTextureAndPlay);
    
    video.src = url;
    video.load();

    // Blob URLs often load instantly (readyState >= 2), so handle it if event already fired
    if (video.readyState >= 2) {
      initTextureAndPlay();
    }

    return () => {
      isCancelled = true;
      video.removeEventListener('canplay', initTextureAndPlay);
      video.removeEventListener('loadeddata', initTextureAndPlay);
      video.pause();
      
      if (document.body.contains(video)) {
        document.body.removeChild(video);
      }
      
      setTexture((prev) => {
        if (prev) prev.dispose();
        return null;
      });
      videoRef.current = null;
    };
  }, [url]);

  const restart = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return { texture, restart };
}
