'use client';

import React from 'react';

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
  isBold?: boolean;
  isItalic?: boolean;
  fontFamily?: string;
  className?: string;
  layerDuration?: number;
  localTime?: number;
  layerStartTime?: number;
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
  gap = 56,
  logoHeight = 38,
  textColor = '#ffffff',
  isBold = true,
  isItalic = false,
  fontFamily = '"Plus Jakarta Sans", sans-serif',
  className = '',
  layerDuration,
  localTime,
  layerStartTime = 0,
}: LogoLoopProps) {
  const baseItems = items && items.length > 0 ? items : DEFAULT_ITEMS;
  
  // Ensure enough items to smoothly overflow width
  let displayItems = baseItems;
  while (displayItems.length < 6) {
    displayItems = [...displayItems, ...baseItems];
  }

  const duration = Math.max(3, (displayItems.length * 3) / Math.max(0.1, speed));
  const animName = direction === 'right' ? 'logoLoopScrollRight' : 'logoLoopScrollLeft';

  const deterministicTranslate = localTime !== undefined
    ? (() => {
        const elapsed = Math.max(0, localTime - layerStartTime);
        const offsetPercent = ((elapsed % duration) / duration) * 100;
        return direction === 'right'
          ? `calc(-${100 - offsetPercent}% - ${(1 - offsetPercent / 100) * gap}px)`
          : `calc(-${offsetPercent}% - ${(offsetPercent / 100) * gap}px)`;
      })()
    : null;

  const renderItem = (item: LogoLoopItem, key: string | number) => (
    <div
      key={key}
      style={{
        flexShrink: 0,
        height: `${logoHeight}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: item.type === 'text' ? '0 16px' : '0',
        fontSize: '16px',
        fontWeight: isBold ? 800 : 500,
        fontStyle: isItalic ? 'italic' : 'normal',
        fontFamily,
        color: textColor,
        background: item.type === 'text' ? 'rgba(255,255,255,0.05)' : 'transparent',
        borderRadius: '8px',
        border: item.type === 'text' ? '1px solid rgba(255,255,255,0.1)' : 'none',
      }}
    >
      {item.type === 'image' && item.value ? (
        <img src={item.value} alt="" style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
      ) : (
        item.type === 'text' ? item.value : null
      )}
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes logoLoopScrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% - ${gap}px));
          }
        }
        @keyframes logoLoopScrollRight {
          0% {
            transform: translateX(calc(-100% - ${gap}px));
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
      <div
        className={className}
        style={{
          overflow: 'hidden',
          width: '100%',
          maxWidth: '780px',
          display: 'flex',
          gap: `${gap}px`,
          userSelect: 'none',
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexShrink: 0,
            gap: `${gap}px`,
            alignItems: 'center',
            animation: deterministicTranslate !== null ? 'none' : `${animName} ${duration}s linear infinite`,
            transform: deterministicTranslate !== null ? `translateX(${deterministicTranslate})` : undefined,
            willChange: 'transform',
          }}
        >
          {displayItems.map((item, i) => renderItem(item, `t1-${i}`))}
        </div>
        <div
          style={{
            display: 'flex',
            flexShrink: 0,
            gap: `${gap}px`,
            alignItems: 'center',
            animation: deterministicTranslate !== null ? 'none' : `${animName} ${duration}s linear infinite`,
            transform: deterministicTranslate !== null ? `translateX(${deterministicTranslate})` : undefined,
            willChange: 'transform',
          }}
          aria-hidden="true"
        >
          {displayItems.map((item, i) => renderItem(item, `t2-${i}`))}
        </div>
      </div>
    </>
  );
}
