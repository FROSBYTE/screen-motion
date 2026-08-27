'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Download, X, CheckCircle2, Loader2, Zap } from 'lucide-react';
import { useMGState, getSceneDuration } from '../store';
import { Muxer as Mp4Muxer, ArrayBufferTarget as Mp4ArrayBufferTarget } from 'mp4-muxer';

interface ExportVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ClipRect {
  type: 'rect' | 'circle';
  x: number;
  y: number;
  w: number;
  h: number;
  radius?: number;
  cx?: number;
  cy?: number;
}

export default function ExportVideoModal({ isOpen, onClose }: ExportVideoModalProps) {
  const { state, dispatch, seekTo, pause, getSceneAtTime } = useMGState();
  const { scenes } = state;

  const [fps, setFps] = useState<number>(60);
  const resolution = '1080p';

  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [exportedFileName, setExportedFileName] = useState('');

  const isCancelledRef = useRef(false);
  const stepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  // Total project duration in seconds
  const totalDuration = useMemo(() => {
    const dur = scenes.reduce((sum, s) => sum + getSceneDuration(s, scenes.length), 0);
    return Math.max(dur, 2);
  }, [scenes]);

  // Reset state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      isCancelledRef.current = false;
      setDownloadUrl(null);
      setIsExporting(false);
      setProgress(0);
      setStatusText('');
    }
  }, [isOpen]);

  const handleClose = () => {
    isCancelledRef.current = true;
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
      stepTimeoutRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      try {
        recorderRef.current.stop();
      } catch {
        // ignore recorder stop error
      }
    }
    pause();
    setDownloadUrl(null);
    setIsExporting(false);
    setProgress(0);
    setStatusText('');
    onClose();
  };

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    isCancelledRef.current = false;
    setProgress(0);
    setStatusText('0%');
    setDownloadUrl(null);

    const wrapper = (document.querySelector('[data-motion-canvas-wrapper]') ||
      document.querySelector('[data-motion-canvas]')) as HTMLElement | null;

    if (!wrapper) {
      alert('Could not find motion canvas element.');
      setIsExporting(false);
      return;
    }

    try {
      const isPortrait = state.aspectRatio === '9:16';
      
      let targetWidth = 1920;
      let targetHeight = 1080;
      if (isPortrait) {
        targetWidth = resolution === '1080p' ? 1080 : 720;
        targetHeight = resolution === '1080p' ? 1920 : 1280;
      } else {
        targetWidth = resolution === '1080p' ? 1920 : 1280;
        targetHeight = resolution === '1080p' ? 1080 : 720;
      }
      
      const targetBitrate = resolution === '1080p' ? 22_000_000 : 12_000_000;

      // 1. Deselect any active layer so selection borders, resize handles, and alignment guides
      // are NOT rendered into the exported video
      dispatch({ selectedLayerId: null });
      pause();
      seekTo(0);

      // Wait 1 micro-tick for React to clear layer handles
      await new Promise((r) => setTimeout(r, 40));
      if (isCancelledRef.current) return;

      // 2. Pre-cache & pre-decode all asset images across all scenes
      const imageCache = new Map<string, HTMLImageElement>();
      const svgCache = new Map<string, HTMLImageElement>();
      const gradientCache = new Map<string, { type: string; colorStops: { stop: number; color: string }[] }>();

      const getOrLoadImage = (url: string): HTMLImageElement | null => {
        if (!url) return null;
        let img = imageCache.get(url);
        if (!img) {
          img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = url;
          imageCache.set(url, img);
        }
        return img.complete && img.naturalWidth > 0 ? img : null;
      };

      // Ensure web fonts are fully ready before starting export session
      if (typeof document !== 'undefined' && document.fonts) {
        try {
          await document.fonts.ready;
        } catch {}
      }

      // Pre-warm all scene background images
      scenes.forEach((s) => {
        if (s.bgImage) getOrLoadImage(s.bgImage);
        s.layers?.forEach((l) => {
          if (l.type === 'component') {
            if (l.props?.imageUrl) getOrLoadImage(l.props.imageUrl);
            if (l.props?.screenImage) getOrLoadImage(l.props.screenImage);
            if (l.props?.src) getOrLoadImage(l.props.src);
            if (l.props?.iconUrl) getOrLoadImage(l.props.iconUrl);
          }
        });
      });

      // 3. Create offscreen composite canvas for hardware rendering
      const compositeCanvas = document.createElement('canvas');
      compositeCanvas.width = targetWidth;
      compositeCanvas.height = targetHeight;
      const ctx = compositeCanvas.getContext('2d', { willReadFrequently: false, alpha: false })!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const drawCoverImage = (drawCtx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const containerRatio = w / h;
        let sw = img.naturalWidth;
        let sh = img.naturalHeight;
        let sx = 0;
        let sy = 0;
        if (imgRatio > containerRatio) {
          sw = sh * containerRatio;
          sx = (img.naturalWidth - sw) / 2;
        } else {
          sh = sw / containerRatio;
          sy = (img.naturalHeight - sh) / 2;
        }
        drawCtx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
      };

      // Helper to parse CSS clipPath on an element
      const parseClipPath = (clipPathStr: string, tw: number, th: number): ClipRect | null => {
        if (!clipPathStr || clipPathStr === 'none') return null;
        if (clipPathStr.includes('inset')) {
          const match = clipPathStr.match(/inset\(([^)]+)\)/);
          if (match) {
            const parts = match[1].trim().split(/\s+/);
            const topStr = parts[0] || '0';
            const rightStr = parts[1] || topStr;
            const bottomStr = parts[2] || topStr;
            const leftStr = parts[3] || rightStr;
            const parseVal = (str: string, maxDim: number) => {
              if (str.endsWith('%')) return (parseFloat(str) / 100) * maxDim;
              return parseFloat(str) || 0;
            };
            const top = parseVal(topStr, th);
            const right = parseVal(rightStr, tw);
            const bottom = parseVal(bottomStr, th);
            const left = parseVal(leftStr, tw);
            return {
              type: 'rect',
              x: left,
              y: top,
              w: Math.max(0, tw - left - right),
              h: Math.max(0, th - top - bottom),
            };
          }
        } else if (clipPathStr.includes('circle')) {
          const match = clipPathStr.match(/circle\(([^)]+)\)/);
          if (match) {
            const content = match[1];
            const radiusMatch = content.match(/([0-9.]+)%/);
            const atMatch = content.match(/at\s+([0-9.]+)%\s+([0-9.]+)%/);
            if (radiusMatch) {
              const rPercent = parseFloat(radiusMatch[1]);
              const r = (rPercent / 100) * tw;
              const cxPercent = atMatch ? parseFloat(atMatch[1]) : 50;
              const cyPercent = atMatch ? parseFloat(atMatch[2]) : 50;
              return {
                type: 'circle',
                x: 0,
                y: 0,
                w: tw,
                h: th,
                radius: Math.max(0, r),
                cx: (cxPercent / 100) * tw,
                cy: (cyPercent / 100) * th,
              };
            }
          }
        }
        return null;
      };

      // Helper to apply clip to context
      const applyClipToCtx = (drawCtx: CanvasRenderingContext2D, clip: ClipRect) => {
        if (clip.type === 'rect') {
          drawCtx.beginPath();
          drawCtx.rect(clip.x, clip.y, clip.w, clip.h);
          drawCtx.clip();
        } else if (clip.type === 'circle' && clip.radius !== undefined && clip.cx !== undefined && clip.cy !== undefined) {
          drawCtx.beginPath();
          drawCtx.arc(clip.cx, clip.cy, clip.radius, 0, Math.PI * 2);
          drawCtx.clip();
        }
      };

      // Fast linear gradient creator with memoized gradient parameters
      const createCanvasGradient = (
        drawCtx: CanvasRenderingContext2D,
        bgImageStr: string,
        gx: number,
        gy: number,
        gw: number,
        gh: number
      ): CanvasGradient | null => {
        if (!bgImageStr || !bgImageStr.includes('linear-gradient')) return null;
        try {
          let cached = gradientCache.get(bgImageStr);
          if (!cached) {
            const content = bgImageStr.slice(bgImageStr.indexOf('(') + 1, bgImageStr.lastIndexOf(')'));
            const parts = content.split(/,(?![^(]*\))/).map((s) => s.trim());
            if (parts.length < 2) return null;

            let colorStartIndex = 0;
            const firstPart = parts[0].toLowerCase();
            let type = 'to-bottom';

            if (firstPart.includes('to right') || firstPart.includes('90deg')) {
              type = 'to-right';
              colorStartIndex = 1;
            } else if (firstPart.includes('to bottom') || firstPart.includes('180deg')) {
              type = 'to-bottom';
              colorStartIndex = 1;
            } else if (firstPart.includes('to left') || firstPart.includes('270deg')) {
              type = 'to-left';
              colorStartIndex = 1;
            } else if (firstPart.includes('to top') || firstPart.includes('0deg')) {
              type = 'to-top';
              colorStartIndex = 1;
            } else if (firstPart.includes('deg')) {
              type = 'diagonal';
              colorStartIndex = 1;
            }

            const colorParts = parts.slice(colorStartIndex);
            const colorStops = colorParts.map((cp, idx) => {
              const trimmed = cp.trim();
              const lastSpace = trimmed.lastIndexOf(' ');
              let color = trimmed;
              let stop = idx / Math.max(1, colorParts.length - 1);
              if (lastSpace > 0) {
                const stopStr = trimmed.slice(lastSpace + 1).trim();
                if (stopStr.endsWith('%')) {
                  const parsedStop = parseFloat(stopStr) / 100;
                  if (!isNaN(parsedStop)) {
                    stop = Math.max(0, Math.min(1, parsedStop));
                    color = trimmed.slice(0, lastSpace).trim();
                  }
                }
              }
              return { stop, color };
            });

            cached = { type, colorStops };
            gradientCache.set(bgImageStr, cached);
          }

          let grad: CanvasGradient;
          if (cached.type === 'to-right') {
            grad = drawCtx.createLinearGradient(gx, gy, gx + gw, gy);
          } else if (cached.type === 'to-left') {
            grad = drawCtx.createLinearGradient(gx + gw, gy, gx, gy);
          } else if (cached.type === 'to-top') {
            grad = drawCtx.createLinearGradient(gx, gy + gh, gx, gy);
          } else if (cached.type === 'diagonal') {
            grad = drawCtx.createLinearGradient(gx, gy, gx + gw, gy + gh);
          } else {
            grad = drawCtx.createLinearGradient(gx, gy, gx, gy + gh);
          }

          cached.colorStops.forEach((cs) => {
            try {
              grad.addColorStop(cs.stop, cs.color);
            } catch {}
          });

          return grad;
        } catch {
          return null;
        }
      };

      // Fast linear gradient drawer with memoized gradient parameters
      const tryDrawLinearGradient = (
        drawCtx: CanvasRenderingContext2D,
        bgImageStr: string,
        x: number,
        y: number,
        w: number,
        h: number,
        borderRadius: number
      ): boolean => {
        const grad = createCanvasGradient(drawCtx, bgImageStr, x, y, w, h);
        if (!grad) return false;

        drawCtx.fillStyle = grad;
        if (borderRadius > 0) {
          drawCtx.beginPath();
          if (typeof (drawCtx as any).roundRect === 'function') {
            (drawCtx as any).roundRect(x, y, w, h, borderRadius);
          } else {
            drawCtx.rect(x, y, w, h);
          }
          drawCtx.fill();
        } else {
          drawCtx.fillRect(x, y, w, h);
        }
        return true;
      };

      // Asynchronous SVG preloader to guarantee 0 dropped SVG frames
      const preloadSvgElements = async (root: HTMLElement) => {
        const svgs = root.querySelectorAll('svg');
        const promises: Promise<void>[] = [];
        svgs.forEach((svgEl) => {
          try {
            const svgKey = svgEl.outerHTML;
            let svgImg = svgCache.get(svgKey);
            if (!svgImg) {
              let svgString = new XMLSerializer().serializeToString(svgEl);
              if (!svgString.includes('xmlns=')) {
                svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
              }
              const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
              svgImg = new Image();
              svgImg.src = svgUrl;
              svgCache.set(svgKey, svgImg);
            }
            if (!svgImg.complete) {
              promises.push(
                new Promise<void>((resolve) => {
                  if (svgImg) {
                    svgImg.onload = () => resolve();
                    svgImg.onerror = () => resolve();
                  } else {
                    resolve();
                  }
                })
              );
            }
          } catch {}
        });
        if (promises.length > 0) {
          await Promise.all(promises);
        }
      };

      // High-speed O(N) single-pass recursive layer compositor
      const renderSingleFrame = (timeSec: number) => {
        const currentSceneInfo = getSceneAtTime(timeSec);
        const bgColor = currentSceneInfo?.scene.bgColor || '#0f0f0f';

        // 1. Clear background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        if (currentSceneInfo?.scene.bgImage) {
          const bgImg = getOrLoadImage(currentSceneInfo.scene.bgImage);
          if (bgImg) {
            ctx.save();
            drawCoverImage(ctx, bgImg, 0, 0, targetWidth, targetHeight);
            ctx.restore();
          }
        }

        // Target the inner logical canvas directly so scaling is 100% 1:1 pixel-perfect
        const innerCanvas = wrapper.querySelector('div[data-logical-canvas="true"]') as HTMLElement || wrapper.firstElementChild as HTMLElement;
        const innerRect = innerCanvas.getBoundingClientRect();
        if (innerRect.width <= 0 || innerRect.height <= 0) return;

        const logicalWidth = isPortrait ? 1080 : 1920;
        const logicalHeight = isPortrait ? 1920 : 1080;

        const exportScaleX = targetWidth / logicalWidth;
        const exportScaleY = targetHeight / logicalHeight;

        const extractTransformScale = (transformStr: string): { scaleX: number; scaleY: number } => {
          if (!transformStr || transformStr === 'none') return { scaleX: 1, scaleY: 1 };
          const matrix2d = transformStr.match(/matrix\(([^)]+)\)/);
          if (matrix2d) {
            const p = matrix2d[1].split(',').map(Number);
            if (p.length >= 4) {
              const sx = Math.hypot(p[0], p[1]);
              const sy = Math.hypot(p[2], p[3]);
              return { scaleX: isNaN(sx) || sx <= 0 ? 1 : sx, scaleY: isNaN(sy) || sy <= 0 ? 1 : sy };
            }
          }
          const matrix3d = transformStr.match(/matrix3d\(([^)]+)\)/);
          if (matrix3d) {
            const p = matrix3d[1].split(',').map(Number);
            if (p.length >= 16) {
              const sx = Math.hypot(p[0], p[1], p[2]);
              const sy = Math.hypot(p[4], p[5], p[6]);
              return { scaleX: isNaN(sx) || sx <= 0 ? 1 : sx, scaleY: isNaN(sy) || sy <= 0 ? 1 : sy };
            }
          }
          return { scaleX: 1, scaleY: 1 };
        };

        // Recursive tree walker that computes inherited opacity, scale and clip bounds in O(1) per node
        const renderNode = (
          el: HTMLElement,
          parentOpacity: number,
          inheritedClip: ClipRect | null,
          parentScaleX: number = 1,
          parentScaleY: number = 1
        ) => {
          if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
          if (el.getAttribute?.('data-alignment-guides') === 'true') return;

          const cursor = el.style?.cursor;
          if (cursor === 'nwse-resize' || cursor === 'nesw-resize') return;

          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') return;

          const nodeOpacity = parseFloat(style.opacity || '1');
          const totalOpacity = parentOpacity * nodeOpacity;
          if (totalOpacity <= 0.005) return;

          const nodeScale = extractTransformScale(style.transform);
          const totalScaleX = parentScaleX * nodeScale.scaleX;
          const totalScaleY = parentScaleY * nodeScale.scaleY;

          // Check if current element has clip-path (scene transitions)
          let currentClip = inheritedClip;
          if (style.clipPath && style.clipPath !== 'none') {
            const parsed = parseClipPath(style.clipPath, targetWidth, targetHeight);
            if (parsed) currentClip = parsed;
          }

          // 3D WebGL Canvas Layer (PhoneDevice / Android 3D models)
          if (el.tagName === 'CANVAS') {
            if (el === compositeCanvas) return;
            const canvasEl = el as HTMLCanvasElement;
            const cRect = canvasEl.getBoundingClientRect();
            if (cRect.width > 0 && cRect.height > 0) {
              const cx = ((cRect.left - innerRect.left) / innerRect.width) * targetWidth;
              const cy = ((cRect.top - innerRect.top) / innerRect.height) * targetHeight;
              const cw = (cRect.width / innerRect.width) * targetWidth;
              const ch = (cRect.height / innerRect.height) * targetHeight;
              ctx.save();
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.globalAlpha = totalOpacity;
              if (currentClip) applyClipToCtx(ctx, currentClip);
              try {
                ctx.drawImage(canvasEl, cx, cy, cw, ch);
              } catch {}
              ctx.restore();
            }
            return;
          }

          const rect = el.getBoundingClientRect();
          const hasDimensions = rect.width > 0 && rect.height > 0;
          let childrenClip = currentClip;

          if (hasDimensions) {
            const isFullWrapper = rect.width >= innerRect.width - 2 && rect.height >= innerRect.height - 2;
            const x = ((rect.left - innerRect.left) / innerRect.width) * targetWidth;
            const y = ((rect.top - innerRect.top) / innerRect.height) * targetHeight;
            const w = (rect.width / innerRect.width) * targetWidth;
            const h = (rect.height / innerRect.height) * targetHeight;
            const borderRadius = parseFloat(style.borderRadius || '0') * exportScaleY;

            if (!isFullWrapper && (style.overflow === 'hidden' || style.overflowX === 'hidden' || style.overflowY === 'hidden')) {
              const rectClip: ClipRect = {
                type: 'rect',
                x,
                y,
                w,
                h,
              };
              if (childrenClip && childrenClip.type === 'rect') {
                const x1 = Math.max(childrenClip.x, rectClip.x);
                const y1 = Math.max(childrenClip.y, rectClip.y);
                const x2 = Math.min(childrenClip.x + childrenClip.w, rectClip.x + rectClip.w);
                const y2 = Math.min(childrenClip.y + childrenClip.h, rectClip.y + rectClip.h);
                childrenClip = {
                  type: 'rect',
                  x: x1,
                  y: y1,
                  w: Math.max(0, x2 - x1),
                  h: Math.max(0, y2 - y1),
                };
              } else {
                childrenClip = rectClip;
              }
            }

            // Background box shadow
            let hasShadow = false;
            if (style.boxShadow && style.boxShadow !== 'none') {
              const shadowMatch =
                style.boxShadow.match(/(rgba?\([^)]+\)|#[0-9a-fA-F]+)\s+(-?\d+(?:\.\d+)?px)\s+(-?\d+(?:\.\d+)?px)\s+(\d+(?:\.\d+)?px)/) ||
                style.boxShadow.match(/(-?\d+(?:\.\d+)?px)\s+(-?\d+(?:\.\d+)?px)\s+(\d+(?:\.\d+)?px)\s*(rgba?\([^)]+\)|#[0-9a-fA-F]+)/);
              if (shadowMatch) {
                const isColorFirst = shadowMatch[1].startsWith('rgb') || shadowMatch[1].startsWith('#');
                const shadowColor = isColorFirst ? shadowMatch[1] : shadowMatch[4];
                const shadowOffsetX = parseFloat(isColorFirst ? shadowMatch[2] : shadowMatch[1]) * exportScaleX;
                const shadowOffsetY = parseFloat(isColorFirst ? shadowMatch[3] : shadowMatch[2]) * exportScaleY;
                const shadowBlur = parseFloat(isColorFirst ? shadowMatch[4] : shadowMatch[3]) * exportScaleY;

                ctx.save();
                ctx.shadowColor = shadowColor;
                ctx.shadowOffsetX = shadowOffsetX;
                ctx.shadowOffsetY = shadowOffsetY;
                ctx.shadowBlur = shadowBlur;
                hasShadow = true;
              }
            }

            // Background color & border
            const hasBgColor = !isFullWrapper && style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent';
            const borderWidth = parseFloat(style.borderWidth || '0') * exportScaleY;
            const hasBorder = !isFullWrapper && borderWidth > 0 && style.borderStyle && style.borderStyle !== 'none' && style.borderColor && style.borderColor !== 'transparent' && style.borderColor !== 'rgba(0, 0, 0, 0)';

            if (hasBgColor || hasBorder) {
              ctx.save();
              ctx.globalAlpha = totalOpacity;
              if (currentClip) applyClipToCtx(ctx, currentClip);

              if (hasBgColor) {
                ctx.fillStyle = style.backgroundColor;
                if (borderRadius > 0) {
                  ctx.beginPath();
                  if (typeof (ctx as any).roundRect === 'function') {
                    (ctx as any).roundRect(x, y, w, h, borderRadius);
                  } else {
                    drawCtxRect(ctx, x, y, w, h);
                  }
                  ctx.fill();
                } else {
                  ctx.fillRect(x, y, w, h);
                }
              }

              if (hasBorder) {
                ctx.strokeStyle = style.borderColor;
                ctx.lineWidth = borderWidth;
                if (borderRadius > 0) {
                  ctx.beginPath();
                  if (typeof (ctx as any).roundRect === 'function') {
                    (ctx as any).roundRect(x, y, w, h, borderRadius);
                  } else {
                    drawCtxRect(ctx, x, y, w, h);
                  }
                  ctx.stroke();
                } else {
                  ctx.strokeRect(x, y, w, h);
                }
              }
              ctx.restore();
            }

            if (hasShadow) {
              ctx.restore();
            }

            // CSS background gradient & images
            if (style.backgroundImage && style.backgroundImage !== 'none') {
              ctx.save();
              ctx.globalAlpha = totalOpacity;
              if (currentClip) applyClipToCtx(ctx, currentClip);

              const drewGrad = tryDrawLinearGradient(ctx, style.backgroundImage, x, y, w, h, borderRadius);
              if (!drewGrad) {
                const match = style.backgroundImage.match(/url\(["']?([^"']+)["']?\)/);
                if (match && match[1]) {
                  const bgImg = getOrLoadImage(match[1]);
                  if (bgImg) {
                    if (borderRadius > 0) {
                      ctx.beginPath();
                      if (typeof (ctx as any).roundRect === 'function') {
                        (ctx as any).roundRect(x, y, w, h, borderRadius);
                      } else {
                        drawCtxRect(ctx, x, y, w, h);
                      }
                      ctx.clip();
                    }
                    drawCoverImage(ctx, bgImg, x, y, w, h);
                  }
                }
              }
              ctx.restore();
            }

            // <img> element
            if (el.tagName === 'IMG') {
              const imgEl = el as HTMLImageElement;
              if (imgEl.complete && imgEl.naturalWidth > 0) {
                ctx.save();
                ctx.globalAlpha = totalOpacity;
                if (currentClip) applyClipToCtx(ctx, currentClip);
                if (borderRadius > 0) {
                  ctx.beginPath();
                  if (typeof (ctx as any).roundRect === 'function') {
                    (ctx as any).roundRect(x, y, w, h, borderRadius);
                  } else {
                    drawCtxRect(ctx, x, y, w, h);
                  }
                  ctx.clip();
                }
                ctx.drawImage(imgEl, x, y, w, h);
                ctx.restore();
              }
            }

            // <video> element
            if (el.tagName === 'VIDEO') {
              const videoEl = el as HTMLVideoElement;
              if (videoEl.readyState >= 1) {
                ctx.save();
                ctx.globalAlpha = totalOpacity;
                if (currentClip) applyClipToCtx(ctx, currentClip);
                if (borderRadius > 0) {
                  ctx.beginPath();
                  if (typeof (ctx as any).roundRect === 'function') {
                    (ctx as any).roundRect(x, y, w, h, borderRadius);
                  } else {
                    drawCtxRect(ctx, x, y, w, h);
                  }
                  ctx.clip();
                }
                ctx.drawImage(videoEl, x, y, w, h);
                ctx.restore();
              }
            }

            // <svg> element with pre-buffered SVG texture cache
            if (el.tagName === 'svg' || el.tagName === 'SVG') {
              try {
                const svgKey = el.outerHTML;
                let svgImg = svgCache.get(svgKey);
                if (!svgImg) {
                  const svgEl = el as unknown as SVGElement;
                  let svgString = new XMLSerializer().serializeToString(svgEl);
                  if (!svgString.includes('xmlns=')) {
                    svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
                  }
                  const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
                  svgImg = new Image();
                  svgImg.src = svgUrl;
                  svgCache.set(svgKey, svgImg);
                }
                if (svgImg.complete && svgImg.naturalWidth > 0) {
                  ctx.save();
                  ctx.globalAlpha = totalOpacity;
                  if (currentClip) applyClipToCtx(ctx, currentClip);
                  ctx.drawImage(svgImg, x, y, w, h);
                  ctx.restore();
                }
              } catch {}
            }

            // Leaf text container rendering with full typographic, gradient and spacing fidelity
            const hasElementChild = Array.from(el.children).some((c) => c.tagName !== 'BR');
            if (!hasElementChild) {
              let textContent = '';
              for (let i = 0; i < el.childNodes.length; i++) {
                const node = el.childNodes[i];
                if (node.nodeType === Node.TEXT_NODE && node.textContent) {
                  textContent += node.textContent;
                }
              }

              // Render text preserving non-breaking spaces (\u00A0) and regular spaces without stripping
              if (textContent.length > 0 && (textContent.trim().length > 0 || textContent.includes('\u00A0') || textContent === ' ')) {
                const computedFontSize = Math.max(8, parseFloat(style.fontSize || '16') * exportScaleY * totalScaleY);
                let fontFamily = style.fontFamily || '"Plus Jakarta Sans", sans-serif';
                if (!fontFamily.includes('sans-serif') && !fontFamily.includes('serif') && !fontFamily.includes('monospace')) {
                  fontFamily = `${fontFamily}, sans-serif`;
                }
                const fontWeight = style.fontWeight || '700';
                const fontStyle = style.fontStyle || 'normal';

                const paddingTop = parseFloat(style.paddingTop || '0') * exportScaleY * totalScaleY;
                const paddingLeft = parseFloat(style.paddingLeft || '0') * exportScaleX * totalScaleX;
                const paddingRight = parseFloat(style.paddingRight || '0') * exportScaleX * totalScaleX;

                let drawX = x + paddingLeft;
                let drawY = y + paddingTop;

                // Accurate text alignment handling
                const textAlign = (style.textAlign || 'left') as CanvasTextAlign;
                let canvasTextAlign: CanvasTextAlign = 'left';
                if (textAlign === 'center') {
                  canvasTextAlign = 'center';
                  drawX = x + w / 2;
                } else if (textAlign === 'right') {
                  canvasTextAlign = 'right';
                  drawX = x + w - paddingRight;
                }

                // Accurate flex vertical centering
                const parentDisplay = el.parentElement ? window.getComputedStyle(el.parentElement).display : '';
                const parentAlign = el.parentElement ? window.getComputedStyle(el.parentElement).alignItems : '';
                if ((style.display === 'flex' && style.alignItems === 'center') || (parentDisplay === 'flex' && parentAlign === 'center')) {
                  if (h > computedFontSize) {
                    drawY = y + (h - computedFontSize) / 2;
                  }
                }

                // Check for gradient text & background-clip: text (e.g. DiaTextReveal, MaskedHeading)
                const hasBackgroundClipText = style.webkitBackgroundClip === 'text' || style.backgroundClip === 'text';
                const isTransparentColor = !style.color || style.color === 'transparent' || style.color === 'rgba(0, 0, 0, 0)';

                let fillStyle: string | CanvasGradient = style.color || '#ffffff';

                if ((hasBackgroundClipText || isTransparentColor) && style.backgroundImage && style.backgroundImage.includes('gradient')) {
                  const grad = createCanvasGradient(ctx, style.backgroundImage, x, y, w, h);
                  if (grad) {
                    fillStyle = grad;
                  } else if (isTransparentColor) {
                    fillStyle = '#ffffff';
                  }
                } else if (isTransparentColor) {
                  fillStyle = '#ffffff';
                }

                ctx.save();
                ctx.globalAlpha = totalOpacity;
                if (currentClip) applyClipToCtx(ctx, currentClip);
                ctx.font = `${fontStyle} ${fontWeight} ${computedFontSize}px ${fontFamily}`;
                ctx.fillStyle = fillStyle;
                ctx.textAlign = canvasTextAlign;
                ctx.textBaseline = 'top';

                if (style.letterSpacing && style.letterSpacing !== 'normal') {
                  const ls = parseFloat(style.letterSpacing) * exportScaleX * totalScaleX;
                  if (!isNaN(ls) && typeof (ctx as any).letterSpacing !== 'undefined') {
                    (ctx as any).letterSpacing = `${ls}px`;
                  }
                }

                ctx.fillText(textContent, drawX, drawY);
                ctx.restore();
              }
            }
          }

          // Recurse on children with computed state in O(N)
          for (let i = 0; i < el.children.length; i++) {
            renderNode(el.children[i] as HTMLElement, totalOpacity, childrenClip, totalScaleX, totalScaleY);
          }
        };

        const drawCtxRect = (c: CanvasRenderingContext2D, rx: number, ry: number, rw: number, rh: number) => {
          c.rect(rx, ry, rw, rh);
        };

        for (let i = 0; i < innerCanvas.children.length; i++) {
          renderNode(innerCanvas.children[i] as HTMLElement, 1, null, 1, 1);
        }
      };

      const filename = `motion-graphic-${Date.now()}.mp4`;
      setExportedFileName(filename);

      const totalFrames = Math.ceil(totalDuration * fps);
      const frameStep = 1 / fps;
      const frameDurationMicroseconds = Math.round(1_000_000 / fps);

      // ─────────────────────────────────────────────────────────────
      // PIPELINE A: Hardware-Accelerated WebCodecs VideoEncoder + mp4-muxer
      // ─────────────────────────────────────────────────────────────
      if (typeof VideoEncoder !== 'undefined' && typeof VideoFrame !== 'undefined') {
        const target = new Mp4ArrayBufferTarget();
        const muxer = new Mp4Muxer({
          target,
          video: {
            codec: 'avc',
            width: targetWidth,
            height: targetHeight,
          },
          fastStart: 'in-memory',
          firstTimestampBehavior: 'offset',
        });

        const codecsToTry = ['avc1.64002a', 'avc1.4d002a', 'avc1.42001f', 'avc1.42E01E'];
        let selectedCodec = 'avc1.4d002a';
        for (const c of codecsToTry) {
          try {
            const res = await VideoEncoder.isConfigSupported({
              codec: c,
              width: targetWidth,
              height: targetHeight,
              bitrate: targetBitrate,
              framerate: fps,
            });
            if (res && res.supported) {
              selectedCodec = c;
              break;
            }
          } catch {}
        }

        let encodeError: any = null;
        const encoder = new VideoEncoder({
          output: (chunk, meta) => {
            try {
              muxer.addVideoChunk(chunk, meta);
            } catch (err) {
              console.error('Muxer addVideoChunk error:', err);
            }
          },
          error: (e) => {
            console.error('VideoEncoder error:', e);
            encodeError = e;
          },
        });

        encoder.configure({
          codec: selectedCodec,
          width: targetWidth,
          height: targetHeight,
          bitrate: targetBitrate,
          framerate: fps,
          hardwareAcceleration: 'prefer-hardware',
          latencyMode: 'quality',
        });

        // Check if there is an active 3D WebGL device canvas in the project
        const has3DCanvas = !!wrapper.querySelector('canvas');

        for (let currentFrame = 0; currentFrame <= totalFrames; currentFrame++) {
          if (isCancelledRef.current || encodeError) {
            try {
              encoder.close();
            } catch {}
            return;
          }

          const timeSec = Math.min(currentFrame * frameStep, totalDuration);

          // 1. Synchronously update timeline state and flush DOM update immediately
          flushSync(() => {
            seekTo(timeSec);
          });

          // 2. Preload dynamic SVGs and yield rAF if 3D canvas is present
          await preloadSvgElements(wrapper);

          if (has3DCanvas) {
            await new Promise((r) => requestAnimationFrame(r));
          }

          if (isCancelledRef.current) {
            try {
              encoder.close();
            } catch {}
            return;
          }

          // 3. Render frame to composite canvas
          renderSingleFrame(timeSec);

          // 4. Encode frame
          const timestampMicroseconds = currentFrame * frameDurationMicroseconds;
          const videoFrame = new VideoFrame(compositeCanvas, {
            timestamp: timestampMicroseconds,
            duration: frameDurationMicroseconds,
          });

          const isKeyframe = currentFrame % (fps * 2) === 0;
          encoder.encode(videoFrame, { keyFrame: isKeyframe });
          videoFrame.close();

          // 5. Backpressure control: keep hardware encoder queue saturated without blocking
          if (encoder.encodeQueueSize > 12) {
            await new Promise<void>((r) => queueMicrotask(() => r()));
            if (encoder.encodeQueueSize > 24) {
              await new Promise<void>((r) => requestAnimationFrame(() => r()));
            }
          }

          // 6. Smooth throttled progress reporting
          if (currentFrame % 8 === 0 || currentFrame === totalFrames) {
            const percent = Math.min(Math.floor((currentFrame / totalFrames) * 92) + 5, 98);
            setProgress(percent);
            setStatusText(`${percent}%`);
          }
        }

        await encoder.flush();
        encoder.close();
        muxer.finalize();

        const buffer = target.buffer;
        const blob = new Blob([buffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);

        // Auto trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setStatusText('Video Export Complete!');
        setIsExporting(false);
        return;
      }

      // ─────────────────────────────────────────────────────────────
      // PIPELINE B: MediaRecorder Fallback (for older browsers)
      // ─────────────────────────────────────────────────────────────
      const stream = compositeCanvas.captureStream(fps);
      let mimeType = 'video/mp4;codecs=avc1.42E01E';
      if (typeof MediaRecorder !== 'undefined') {
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=h264';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = '';
      }

      const recorder = new MediaRecorder(
        stream,
        mimeType
          ? { mimeType, videoBitsPerSecond: targetBitrate }
          : { videoBitsPerSecond: targetBitrate }
      );
      recorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (isCancelledRef.current) return;

        const blob = new Blob(chunks, { type: mimeType.includes('mp4') ? 'video/mp4' : 'video/webm' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setStatusText('Export Complete!');
        setIsExporting(false);
      };

      let currentFrame = 0;
      recorder.start();

      const stepFrame = async () => {
        if (isCancelledRef.current) {
          if (recorder.state === 'recording') recorder.stop();
          return;
        }

        if (currentFrame > totalFrames) {
          if (recorder.state === 'recording') recorder.stop();
          return;
        }

        const timeSec = Math.min(currentFrame * frameStep, totalDuration);
        flushSync(() => {
          seekTo(timeSec);
        });

        await preloadSvgElements(wrapper);

        renderSingleFrame(timeSec);

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack && 'requestFrame' in videoTrack) {
          (videoTrack as any).requestFrame();
        }

        if (currentFrame % 6 === 0 || currentFrame === totalFrames) {
          const p = Math.min(Math.floor((currentFrame / totalFrames) * 90) + 10, 99);
          setProgress(p);
          setStatusText(`${p}%`);
        }

        currentFrame++;
        stepTimeoutRef.current = setTimeout(stepFrame, 4);
      };

      stepTimeoutRef.current = setTimeout(stepFrame, 10);

    } catch (err) {
      console.error('Export video error:', err);
      alert('An error occurred during video export. Please try again.');
      setIsExporting(false);
      pause();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#FFFFFF',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        borderRadius: '16px',
        boxShadow: '0 24px 64px -12px rgba(15, 23, 42, 0.2), 0 8px 24px -4px rgba(15, 23, 42, 0.08)',
        overflow: 'hidden',
        color: '#0F172A',
        fontFamily: '"Plus Jakarta Sans", sans-serif',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FAFAF7',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/Icon.png" alt="Screen Motion" style={{ width: '18px', height: '18px', objectFit: 'contain', borderRadius: '4px' }} />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
              Export Video
            </h3>
          </div>
          {!isExporting && (
            <button
              onClick={handleClose}
              className="mg-btn-interactive"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0F172A';
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#64748B';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {!isExporting && !downloadUrl && (
            <>
              {/* Duration */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px' }}>
                <span style={{ color: '#64748B', fontWeight: 500 }}>Duration</span>
                <span style={{ color: '#0F172A', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>
                  {totalDuration.toFixed(1)}s
                </span>
              </div>

              {/* Resolution Selection (1080p Fixed) */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Resolution
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: 'rgba(15, 23, 42, 0.03)',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                }}>
                  <span>
                    {state.aspectRatio === '9:16'
                      ? '1080p (Vertical 1080×1920)'
                      : '1080p (Full HD 1920×1080)'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, background: 'rgba(15, 23, 42, 0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                    {state.aspectRatio === '9:16' ? '9:16' : '16:9'}
                  </span>
                </div>
              </div>

              {/* Framerate Selection (60 FPS & 30 FPS Buttons) */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Framerate
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setFps(60)}
                    className="mg-btn-interactive"
                    style={{
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: fps === 60 ? '1.5px solid #FF9137' : '1px solid rgba(15, 23, 42, 0.12)',
                      background: fps === 60 ? 'rgba(255, 145, 55, 0.1)' : 'rgba(15, 23, 42, 0.03)',
                      color: fps === 60 ? '#FF9137' : '#0F172A',
                      fontSize: '13px',
                      fontWeight: fps === 60 ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    60 FPS
                  </button>
                  <button
                    type="button"
                    onClick={() => setFps(30)}
                    className="mg-btn-interactive"
                    style={{
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: fps === 30 ? '1.5px solid #FF9137' : '1px solid rgba(15, 23, 42, 0.12)',
                      background: fps === 30 ? 'rgba(255, 145, 55, 0.1)' : 'rgba(15, 23, 42, 0.03)',
                      color: fps === 30 ? '#FF9137' : '#0F172A',
                      fontSize: '13px',
                      fontWeight: fps === 30 ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    30 FPS
                  </button>
                </div>
              </div>

              <button
                onClick={handleExport}
                className="mg-btn-interactive"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#FF9137',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#0F172A',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(255, 145, 55, 0.35)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E6791E';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 145, 55, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FF9137';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 145, 55, 0.35)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Download size={15} color="#0F172A" /> Export {fps} FPS Video (MP4)
              </button>
            </>
          )}

          {/* Export Progress */}
          {isExporting && (
            <div style={{ textAlign: 'center', padding: '24px 12px 16px' }}>
              <div style={{ width: '48px', height: '48px', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={42} className="animate-spin" style={{ color: '#FF9137' }} />
              </div>

              <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                Rendering Video
              </h4>

              <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                {statusText}
              </p>

              <div style={{
                width: '100%',
                height: '6px',
                background: '#F4F5EE',
                borderRadius: '3px',
                overflow: 'hidden',
                marginTop: '20px',
              }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: '#FF9137',
                  borderRadius: '3px',
                  transition: 'width 0.15s ease',
                }} />
              </div>
            </div>
          )}

          {/* Export Complete View */}
          {!isExporting && downloadUrl && (
            <div style={{ textAlign: 'center', padding: '24px 12px 16px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(112, 255, 210, 0.25)',
                border: '1px solid #70FFD2',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}>
                <CheckCircle2 size={26} />
              </div>

              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                Export Complete!
              </h4>

              <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#64748B' }}>
                Your {fps} FPS video has been rendered and saved.
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={downloadUrl}
                  download={exportedFileName}
                  className="mg-btn-interactive"
                  style={{
                    flex: 1,
                    padding: '11px',
                    background: '#FF9137',
                    borderRadius: '8px',
                    color: '#0F172A',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 4px 14px rgba(255, 145, 55, 0.35)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#E6791E';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 145, 55, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FF9137';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 145, 55, 0.35)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Download size={14} color="#0F172A" /> Download MP4
                </a>
                <button
                  onClick={handleClose}
                  className="mg-btn-interactive"
                  style={{
                    padding: '11px 20px',
                    background: '#F4F5EE',
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                    borderRadius: '8px',
                    color: '#0F172A',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#E2E8F0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F4F5EE';
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
