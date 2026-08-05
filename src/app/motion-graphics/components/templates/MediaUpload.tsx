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
  height = 200,
  className = '',
}: MediaUploadProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!src) {
    return (
      <div
        className={className}
        style={{
          width: `${width}px`,
          height: `${height}px`,
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
        {mediaType === 'video' ? '🎬 Upload Video' : '🖼️ Upload Image'}
      </div>
    );
  }

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
        style={{
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: `${borderRadius}px`,
          objectFit,
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: `${borderRadius}px`,
        objectFit,
      }}
    />
  );
}
