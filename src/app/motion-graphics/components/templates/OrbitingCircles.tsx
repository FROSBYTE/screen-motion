'use client';

import React from 'react';
import { motion } from 'motion/react';

export interface OrbitItem {
  imageUrl?: string;
  imageAssetId?: string;
}

export interface OrbitingCirclesProps {
  items?: OrbitItem[];
  radius?: number;
  speed?: number;
  iconSize?: number;
  className?: string;
  layerDuration?: number;
  localTime?: number;
  layerStartTime?: number;
}

const DEFAULT_ITEMS: OrbitItem[] = [
  { imageUrl: undefined },
  { imageUrl: undefined },
  { imageUrl: undefined },
  { imageUrl: undefined },
  { imageUrl: undefined },
];

export default function OrbitingCircles({
  items = DEFAULT_ITEMS,
  radius = 100,
  speed = 1,
  iconSize = 36,
  className = '',
  layerDuration,
  localTime,
  layerStartTime = 0,
}: OrbitingCirclesProps) {
  const duration = 6 / Math.max(0.05, speed);
  const totalItems = Math.max(1, items.length);

  const deterministicRotation = localTime !== undefined
    ? ((Math.max(0, localTime - layerStartTime) / duration) * 360) % 360
    : null;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: `${radius * 2 + iconSize}px`,
        height: `${radius * 2 + iconSize}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Orbiting items dynamically distributed around circle */}
      {items.map((item, i) => {
        const baseAngle = (i / totalItems) * 360;
        const currentAngle = deterministicRotation !== null ? (baseAngle + deterministicRotation) % 360 : null;

        if (currentAngle !== null) {
          return (
            <div
              key={`orbit-${totalItems}-${i}`}
              style={{
                position: 'absolute',
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                top: '50%',
                left: '50%',
                marginTop: `-${radius}px`,
                marginLeft: `-${radius}px`,
                pointerEvents: 'none',
                transform: `rotate(${currentAngle}deg)`,
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: `${iconSize}px`,
                height: `${iconSize}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    transform: `rotate(${-currentAngle}deg)`,
                  }}
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.35)', fontSize: `${Math.max(10, iconSize * 0.28)}px`, fontWeight: 600 }}>
                      Img
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }

        return (
          <motion.div
            key={`orbit-${totalItems}-${i}`}
            animate={{ rotate: [baseAngle, baseAngle + 360] }}
            transition={{
              duration,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              width: `${radius * 2}px`,
              height: `${radius * 2}px`,
              top: '50%',
              left: '50%',
              marginTop: `-${radius}px`,
              marginLeft: `-${radius}px`,
              pointerEvents: 'none',
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: `${iconSize}px`,
              height: `${iconSize}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <motion.div
                animate={{ rotate: [-baseAngle, -baseAngle - 360] }}
                transition={{ duration, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.35)', fontSize: `${Math.max(10, iconSize * 0.28)}px`, fontWeight: 600 }}>
                    Img
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
