'use client';

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

export interface ImageUploadProps {
  src?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  borderRadius?: number;
  width?: number;
  height?: number;
  className?: string;
  onUpload?: (file: File) => void;
}

export default function ImageUpload({
  src,
  objectFit = 'contain',
  borderRadius = 8,
  width = 300,
  height,
  className = '',
  onUpload,
}: ImageUploadProps) {
  const [aspectRatio, setAspectRatio] = React.useState<number | null>(null);

  if (!src) {
    return (
      <label
        className={className}
        style={{
          width: `${width}px`,
          height: `${height ?? 200}px`,
          borderRadius: `${borderRadius}px`,
          background: 'rgba(255, 255, 255, 0.04)',
          border: '2px dashed rgba(255, 255, 255, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '13px',
          fontWeight: 600,
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <ImageIcon size={24} style={{ opacity: 0.6 }} />
        <span>Upload Image</span>
        <span style={{ fontSize: '10px', fontWeight: 400, opacity: 0.5 }}>PNG, JPG, SVG, WEBP</span>
        {onUpload && (
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
        )}
      </label>
    );
  }

  const computedHeight = aspectRatio
    ? Math.round(width * aspectRatio)
    : height && height !== 200
    ? height
    : undefined;

  return (
    <img
      src={src}
      alt="Uploaded graphics"
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
        display: 'block',
        pointerEvents: 'none',
        userSelect: 'none',
        WebkitUserDrag: 'none',
      } as React.CSSProperties}
    />
  );
}
