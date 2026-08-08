'use client';

import React, { useRef, useEffect, useState } from 'react';

export interface LogoLoopItem {
  type: 'text' | 'image';
  value: string;
}

export interface LogoLoopProps {
  items?: LogoLoopItem[];
  speed?: number;
  direction?: 'left' | 'right';
  gap?: number;
  logoHeight?: number;
  textColor?: string;
  className?: string;
}

const DEFAULT_ITEMS: LogoLoopItem[] = [
  { type: 'text', value: 'React' },
  { type: 'text', value: 'Next.js' },
  { type: 'text', value: 'TypeScript' },
  { type: 'text', value: 'Tailwind' },
  { type: 'text', value: 'Vercel' },
  { type: 'text', value: 'Docker' },
];

export default function LogoLoop({
  items = DEFAULT_ITEMS,
  speed = 1,
  direction = 'left',
  gap = 48,
  logoHeight = 28,
  textColor = '#ffffff',
  className = '',
}: LogoLoopProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [halfWidth, setHalfWidth] = useState(0);

  // Measure the actual rendered width of one set of items
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    // Total scrollWidth is both sets; half is one set
    const measure = () => setHalfWidth(el.scrollWidth / 2);
    measure();
    // Re-measure after fonts load
    if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {});
  }, [items, gap, logoHeight]);

  const duration = halfWidth > 0 ? halfWidth / (80 * speed) : 5;
  const dir = direction === 'left' ? '-' : '';
  const keyframeName = `logoScroll-${halfWidth}`;
  const keyframes = halfWidth > 0
    ? `@keyframes ${keyframeName} { 0% { transform: translateX(0); } 100% { transform: translateX(${dir}${halfWidth}px); } }`
    : '';

  const allItems = [...items, ...items];

  return (
    <>
      {keyframes && <style>{keyframes}</style>}
      <div className={className} style={{ overflow: 'hidden', width: '100%', maxWidth: '500px' }}>
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            gap: `${gap}px`,
            whiteSpace: 'nowrap',
            alignItems: 'center',
            animation: halfWidth > 0 ? `${keyframeName} ${duration}s linear infinite` : 'none',
          }}
        >
          {allItems.map((item, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                height: `${logoHeight}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: item.type === 'text' ? '0 12px' : '0',
                fontSize: '14px',
                fontWeight: 600,
                color: textColor,
                background: item.type === 'text' ? 'rgba(255,255,255,0.05)' : 'transparent',
                borderRadius: '6px',
                border: item.type === 'text' ? '1px solid rgba(255,255,255,0.1)' : 'none',
              }}
            >
              {item.type === 'image' && item.value ? (
                <img src={item.value} alt="" style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
              ) : (
                item.type === 'text' ? item.value : null
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
