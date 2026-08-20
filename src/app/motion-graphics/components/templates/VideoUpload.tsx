'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Upload } from 'lucide-react';

export interface VideoUploadProps {
  src?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill';
  width?: number;
  height?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  playbackRate?: number;
  poster?: string;
  className?: string;
  onUpload?: (file: File) => void;
  localTime?: number;
  layerStartTime?: number;
  layerDuration?: number;
  originalDuration?: number;
  isPlaying?: boolean;
}

export default function VideoUpload({
  src,
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
  objectFit = 'contain',
  width = 360,
  height = 240,
  borderRadius = 12,
  borderWidth = 0,
  borderColor = '#a855f7',
  playbackRate = 1,
  poster,
  className = '',
  onUpload,
  localTime,
  layerStartTime = 0,
  layerDuration = 10,
  originalDuration,
  isPlaying = false,
}: VideoUploadProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [nativeDuration, setNativeDuration] = useState<number | null>(originalDuration || null);

  const origDur = originalDuration || nativeDuration || layerDuration || 1;
  const effectiveSpeed = Math.max(0.1, Math.min(16, (origDur / Math.max(0.1, layerDuration)) * playbackRate));

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    video.playbackRate = effectiveSpeed;
    video.muted = muted;
    video.loop = loop;

    if (localTime !== undefined) {
      const elapsed = Math.max(0, localTime - layerStartTime);
      const progress = elapsed / Math.max(0.01, layerDuration);
      const targetTime = loop
        ? (progress % 1) * origDur
        : Math.min(origDur, progress * origDur);

      if (!isPlaying) {
        video.pause();
        if (Math.abs(video.currentTime - targetTime) > 0.04) {
          try { video.currentTime = targetTime; } catch {}
        }
      } else {
        if (Math.abs(video.currentTime - targetTime) > 0.3) {
          try { video.currentTime = targetTime; } catch {}
        }
        video.play().catch(() => {});
      }
    } else {
      if (isPlaying) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }, [src, localTime, layerStartTime, layerDuration, origDur, isPlaying, effectiveSpeed, loop, muted]);

  useEffect(() => {
    if (videoRef.current && videoRef.current.videoWidth && videoRef.current.videoHeight) {
      setAspectRatio(videoRef.current.videoWidth / videoRef.current.videoHeight);
    }
  }, [src]);

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.videoWidth && video.videoHeight) {
      setAspectRatio(video.videoWidth / video.videoHeight);
    }
    if (video.duration && isFinite(video.duration) && video.duration > 0) {
      setNativeDuration(video.duration);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/') && onUpload) {
      onUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // If no src is provided, show the drag & drop upload target UI
  if (!src) {
    return (
      <div
        className={className}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: `${borderRadius}px`,
          background: isDragOver ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255, 255, 255, 0.04)',
          border: isDragOver
            ? '2px dashed #a855f7'
            : borderWidth > 0
            ? `${borderWidth}px solid ${borderColor}`
            : '2px dashed rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          userSelect: 'none',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a855f7',
            marginBottom: '12px',
          }}
        >
          <Upload size={22} />
        </div>

        <span
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '4px',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            textAlign: 'center',
          }}
        >
          Upload Video
        </span>

        <span
          style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.5)',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            textAlign: 'center',
          }}
        >
          Drag & drop MP4, WEBM, or MOV
        </span>
      </div>
    );
  }

  // Loaded video view - matching aspect ratio without black bars
  const computedHeight = aspectRatio ? width / aspectRatio : undefined;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: `${width}px`,
        height: computedHeight ? `${computedHeight}px` : 'auto',
        aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
        borderRadius: `${borderRadius}px`,
        border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
        overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls={false}
        playsInline
        onLoadedMetadata={handleLoadedMetadata}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: `${Math.max(0, borderRadius - borderWidth)}px`,
          display: 'block',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    </div>
  );
}
