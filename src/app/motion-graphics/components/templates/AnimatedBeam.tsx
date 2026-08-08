'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'motion/react';

export type BeamVariant = 'unidirectional' | 'bidirectional' | 'multiple-inputs' | 'multiple-outputs';

export interface BeamNode {
  imageUrl?: string;
  emoji?: string;
}

export interface AnimatedBeamProps {
  variant?: BeamVariant;
  nodes?: BeamNode[];
  centerNode?: BeamNode;
  curvature?: number;
  duration?: number;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  speed?: number;
  width?: number;
  height?: number;
  className?: string;
}

function SingleBeam({ id, pathD, pathColor, pathWidth, pathOpacity, gradientStartColor, gradientStopColor, duration, reverse }: {
  id: string; pathD: string; pathColor: string; pathWidth: number; pathOpacity: number;
  gradientStartColor: string; gradientStopColor: string; duration: number; reverse: boolean;
}) {
  const gradientCoordinates = reverse
    ? { x1: ['90%', '-10%'], x2: ['100%', '0%'], y1: ['0%', '0%'], y2: ['0%', '0%'] }
    : { x1: ['10%', '110%'], x2: ['0%', '100%'], y1: ['0%', '0%'], y2: ['0%', '0%'] };

  return (
    <>
      <path d={pathD} stroke={pathColor} strokeWidth={pathWidth} strokeOpacity={pathOpacity} strokeLinecap="round" fill="none" />
      <path d={pathD} strokeWidth={pathWidth} stroke={`url(#${id})`} strokeOpacity="1" strokeLinecap="round" fill="none" />
      <defs>
        <motion.linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={{ x1: '0%', x2: '0%', y1: '0%', y2: '0%' }}
          animate={{ x1: gradientCoordinates.x1, x2: gradientCoordinates.x2, y1: gradientCoordinates.y1, y2: gradientCoordinates.y2 }}
          transition={{ duration, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatDelay: 0 }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </>
  );
}

function NodeCircle({ node, x, y, size }: { node: BeamNode; x: number; y: number; size: number }) {
  return (
    <div style={{
      position: 'absolute', left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)',
      width: `${size}px`, height: `${size}px`, borderRadius: '10px',
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', zIndex: 2,
    }}>
      {node.imageUrl ? (
        <img src={node.imageUrl} alt="" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
      ) : (
        <span style={{ fontSize: `${size * 0.45}px` }}>{node.emoji || '⚡'}</span>
      )}
    </div>
  );
}

export default function AnimatedBeam({
  variant = 'unidirectional',
  nodes = [{ emoji: '📄' }, { emoji: '🔗' }, { emoji: '💬' }],
  centerNode = { emoji: '🎯' },
  curvature = 50,
  duration = 5,
  pathColor = 'gray',
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = '#ffaa40',
  gradientStopColor = '#9c40ff',
  speed = 1,
  width = 400,
  height = 200,
  className = '',
}: AnimatedBeamProps) {
  const baseId = useId();
  const effectiveDuration = duration / speed;
  const nodeSize = 40;
  const centerX = width / 2;
  const centerY = height / 2;

  // Calculate node positions based on variant
  const getNodePositions = () => {
    const leftNodes: { x: number; y: number }[] = [];
    const rightNodes: { x: number; y: number }[] = [];

    if (variant === 'unidirectional' || variant === 'bidirectional') {
      leftNodes.push({ x: 50, y: centerY });
      rightNodes.push({ x: width - 50, y: centerY });
    } else if (variant === 'multiple-inputs') {
      const count = nodes.length;
      for (let i = 0; i < count; i++) {
        const y = (height / (count + 1)) * (i + 1);
        leftNodes.push({ x: 50, y });
      }
      rightNodes.push({ x: width - 50, y: centerY });
    } else if (variant === 'multiple-outputs') {
      leftNodes.push({ x: 50, y: centerY });
      const count = nodes.length;
      for (let i = 0; i < count; i++) {
        const y = (height / (count + 1)) * (i + 1);
        rightNodes.push({ x: width - 50, y });
      }
    }

    return { leftNodes, rightNodes };
  };

  const { leftNodes, rightNodes } = getNodePositions();

  // Generate beam paths
  const beams: { pathD: string; reverse: boolean; id: string }[] = [];

  if (variant === 'unidirectional') {
    const d = `M ${leftNodes[0].x},${leftNodes[0].y} Q ${centerX},${leftNodes[0].y - curvature} ${rightNodes[0].x},${rightNodes[0].y}`;
    beams.push({ pathD: d, reverse: false, id: `${baseId}-beam-0` });
  } else if (variant === 'bidirectional') {
    const d1 = `M ${leftNodes[0].x},${leftNodes[0].y} Q ${centerX},${leftNodes[0].y - curvature} ${rightNodes[0].x},${rightNodes[0].y}`;
    const d2 = `M ${leftNodes[0].x},${leftNodes[0].y} Q ${centerX},${leftNodes[0].y + curvature} ${rightNodes[0].x},${rightNodes[0].y}`;
    beams.push({ pathD: d1, reverse: false, id: `${baseId}-beam-0` });
    beams.push({ pathD: d2, reverse: true, id: `${baseId}-beam-1` });
  } else if (variant === 'multiple-inputs') {
    leftNodes.forEach((ln, i) => {
      const d = `M ${ln.x},${ln.y} Q ${centerX},${ln.y - curvature * (i % 2 === 0 ? 1 : -0.5)} ${rightNodes[0].x},${rightNodes[0].y}`;
      beams.push({ pathD: d, reverse: false, id: `${baseId}-beam-${i}` });
    });
  } else if (variant === 'multiple-outputs') {
    rightNodes.forEach((rn, i) => {
      const d = `M ${leftNodes[0].x},${leftNodes[0].y} Q ${centerX},${rn.y - curvature * (i % 2 === 0 ? 1 : -0.5)} ${rn.x},${rn.y}`;
      beams.push({ pathD: d, reverse: false, id: `${baseId}-beam-${i}` });
    });
  }

  // Determine which nodes to show
  const displayLeftNodes = variant === 'multiple-inputs' ? nodes : [nodes[0] || { emoji: '⚡' }];
  const displayRightNodes = variant === 'multiple-outputs' ? nodes : [centerNode];

  return (
    <div className={className} style={{ position: 'relative', width: `${width}px`, height: `${height}px` }}>
      {/* Left side nodes */}
      {leftNodes.map((pos, i) => (
        <NodeCircle key={`left-${i}`} node={displayLeftNodes[i] || displayLeftNodes[0]} x={pos.x} y={pos.y} size={nodeSize} />
      ))}

      {/* Right side nodes */}
      {rightNodes.map((pos, i) => (
        <NodeCircle key={`right-${i}`} node={displayRightNodes[i] || displayRightNodes[0]} x={pos.x} y={pos.y} size={nodeSize} />
      ))}

      {/* SVG Beams */}
      <svg
        fill="none"
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {beams.map((beam) => (
          <SingleBeam
            key={beam.id}
            id={beam.id}
            pathD={beam.pathD}
            pathColor={pathColor}
            pathWidth={pathWidth}
            pathOpacity={pathOpacity}
            gradientStartColor={gradientStartColor}
            gradientStopColor={gradientStopColor}
            duration={effectiveDuration}
            reverse={beam.reverse}
          />
        ))}
      </svg>
    </div>
  );
}
