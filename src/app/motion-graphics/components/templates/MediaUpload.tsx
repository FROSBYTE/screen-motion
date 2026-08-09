'use client';

import React, { useRef } from 'react';

export interface MediaUploadProps {
  src?: string;
  mediaType?: 'image' | 'video';
  objectFit?: 'cover' | 'contain' | 'fill';
  borderRadius?: number;
  width?: number;
  height?: number;
  className?: string;
}

export default function MediaUpload({
  src,
  mediaType = 'image',
  objectFit = 'contain',
  borderRadius = 8,
  width = 300,
  height,
  className = '',
}: MediaUploadProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [aspectRatio, setAspectRatio] = React.useState<number | null>(null);

  if (!src) {
    return (
      <div
        className={className}
        style={{
          width: `${width}px`,
          height: `${height ?? 200}px`,
          borderRadius: `${borderRadius}px`,
          background: 'rgba(255,255,255,0.05)',
          border: '2px dashed rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '13px',
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        }}
      >
        {mediaType === 'video' ? 'Upload Video' : 'Upload Image'}
      </div>
    );
  }

  const computedHeight = aspectRatio
    ? Math.round(width * aspectRatio)
    : height && height !== 200
    ? height
    : undefined;

  if (mediaType === 'video') {
    return (
      <video
        ref={videoRef}
        src={src}
        className={className}
        autoPlay
        loop
        muted
        playsInline
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          if (v.videoWidth && v.videoHeight) {
            setAspectRatio(v.videoHeight / v.videoWidth);
          }
        }}
        style={{
          width: `${width}px`,
          height: computedHeight ? `${computedHeight}px` : 'auto',
          maxWidth: 'none',
          maxHeight: 'none',
          flexShrink: 0,
          borderRadius: `${borderRadius}px`,
          objectFit,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      onLoad={(e) => {
        const img = e.currentTarget;
        if (img.naturalWidth && img.naturalHeight) {
          setAspectRatio(img.naturalHeight / img.naturalWidth);
        }
      }}
      className={className}
      style={{
        width: `${width}px`,
        height: computedHeight ? `${computedHeight}px` : 'auto',
        maxWidth: 'none',
        maxHeight: 'none',
        flexShrink: 0,
        borderRadius: `${borderRadius}px`,
        objectFit,
        pointerEvents: 'none',
        userSelect: 'none',
        WebkitUserDrag: 'none',
      } as React.CSSProperties}
    />
  );
}
