import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Generates a canvas-drawn placeholder texture for device screens.
 * Displays "Your Screenshot Here" with a subtle upload icon.
 * The texture is drawn once and memoized.
 */
export function usePlaceholderTexture(width = 720, height = 1280): THREE.CanvasTexture {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Background – dark gradient to match device screen aesthetic
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#0d0d12');
    bgGradient.addColorStop(0.5, '#111118');
    bgGradient.addColorStop(1, '#0a0a0f');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle grid pattern for visual interest
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const cx = width / 2;
    const cy = height / 2;

    // Upload icon – rounded rectangle with arrow
    const iconSize = Math.min(width, height) * 0.12;
    const iconY = cy - iconSize * 1.1;

    // Icon container circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, iconY, iconSize * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(186, 223, 219, 0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(186, 223, 219, 0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Arrow pointing up
    const arrowLen = iconSize * 0.4;
    const arrowHeadSize = iconSize * 0.18;
    ctx.save();
    ctx.strokeStyle = 'rgba(186, 223, 219, 0.5)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Vertical shaft
    ctx.beginPath();
    ctx.moveTo(cx, iconY + arrowLen * 0.5);
    ctx.lineTo(cx, iconY - arrowLen * 0.5);
    ctx.stroke();

    // Arrow head
    ctx.beginPath();
    ctx.moveTo(cx - arrowHeadSize, iconY - arrowLen * 0.5 + arrowHeadSize);
    ctx.lineTo(cx, iconY - arrowLen * 0.5);
    ctx.lineTo(cx + arrowHeadSize, iconY - arrowLen * 0.5 + arrowHeadSize);
    ctx.stroke();

    // Base line (tray)
    const trayWidth = iconSize * 0.45;
    ctx.beginPath();
    ctx.moveTo(cx - trayWidth, iconY + arrowLen * 0.65);
    ctx.lineTo(cx + trayWidth, iconY + arrowLen * 0.65);
    ctx.stroke();
    ctx.restore();

    // Main text
    const fontSize = Math.round(width * 0.05);
    ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(252, 249, 234, 0.65)';
    ctx.fillText('Your Screenshot Here', cx, cy + iconSize * 0.35);

    // Sub text
    const subFontSize = Math.round(width * 0.03);
    ctx.font = `400 ${subFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = 'rgba(186, 223, 219, 0.35)';
    ctx.fillText('Click anywhere to upload', cx, cy + iconSize * 0.35 + fontSize * 1.3);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.flipY = true;
    tex.needsUpdate = true;

    return tex;
  }, [width, height]);

  return texture;
}
