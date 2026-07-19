'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useAppState } from '@/store';
import { Text, TransformControls, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { TextOverlay } from '@/types';
import * as THREE from 'three';

function AnimatedText({ 
  config, 
  speed,
  isSelected,
  onSelect,
  updateConfig 
}: { 
  config: TextOverlay; 
  speed: number; 
  isSelected: boolean;
  onSelect: () => void;
  updateConfig: (updates: Partial<TextOverlay>) => void;
}) {
  const textRef = useRef<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate'>('translate');

  useFrame((state) => {
    if (!textRef.current || isSelected) return; // Pause animation while selected/editing to avoid jumpiness
    
    const t = state.clock.elapsedTime * speed;
    
    switch (config.animationType) {
      case 'fade':
        textRef.current.fillOpacity = 0.5 + Math.sin(t * 2) * 0.5;
        break;
      case 'slide-up':
        textRef.current.position.y = config.position[1] + Math.sin(t * 2) * 0.5;
        break;
      case 'scale':
        const scale = 1 + Math.sin(t * 3) * 0.2;
        textRef.current.scale.set(scale, scale, scale);
        break;
      case 'typewriter':
        const length = config.text.length;
        const charsToShow = Math.floor((t * 5) % (length + 5)); 
        if (charsToShow <= length) {
          textRef.current.text = config.text.substring(0, charsToShow);
        } else {
          textRef.current.text = config.text;
        }
        break;
      case 'none':
      default:
        textRef.current.fillOpacity = 1;
        textRef.current.position.y = config.position[1];
        textRef.current.scale.set(1, 1, 1);
        if (textRef.current.text !== config.text) {
          textRef.current.text = config.text;
        }
        break;
    }
  });

  // Ensure position/rotation are synchronized when not animating
  useEffect(() => {
    if (textRef.current && isSelected) {
      textRef.current.position.set(...config.position);
      textRef.current.rotation.set(...config.rotation);
      textRef.current.text = config.text;
      textRef.current.fillOpacity = 1;
      textRef.current.scale.set(1, 1, 1);
    }
  }, [isSelected, config]);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    onSelect();
  };

  const handleDoubleClick = (e: any) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  return (
    <>
      <Text
        ref={textRef}
        position={config.position}
        rotation={config.rotation}
        fontSize={config.fontSize}
        color={config.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? '' : config.text}
      </Text>

      {isSelected && !isEditing && (
        <>
          <TransformControls
            object={textRef}
            mode={transformMode}
            onMouseUp={() => {
              if (textRef.current) {
                updateConfig({
                  position: textRef.current.position.toArray() as [number, number, number],
                  rotation: [
                    textRef.current.rotation.x,
                    textRef.current.rotation.y,
                    textRef.current.rotation.z
                  ] as [number, number, number]
                });
              }
            }}
          />
          <Html position={[config.position[0], config.position[1] + config.fontSize + 0.2, config.position[2]]} center>
            <div style={{ display: 'flex', gap: 4, background: '#111', padding: 4, borderRadius: 6, border: '1px solid #333' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); setTransformMode('translate'); }}
                style={{ background: transformMode === 'translate' ? '#333' : 'transparent', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}
              >
                Move
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setTransformMode('rotate'); }}
                style={{ background: transformMode === 'rotate' ? '#333' : 'transparent', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}
              >
                Rotate
              </button>
            </div>
          </Html>
        </>
      )}

      {isEditing && (
        <Html position={config.position} center transform>
          <input
            autoFocus
            defaultValue={config.text}
            onPointerDown={(e) => e.stopPropagation()}
            onBlur={(e) => {
              setIsEditing(false);
              updateConfig({ text: e.target.value });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setIsEditing(false);
                updateConfig({ text: e.currentTarget.value });
              }
            }}
            style={{
              background: 'transparent',
              border: '1px dashed #ffffff',
              color: config.color,
              fontSize: `${config.fontSize * 100}px`,
              textAlign: 'center',
              outline: 'none',
              padding: '0 8px',
              fontFamily: 'inherit',
              minWidth: '200px'
            }}
          />
        </Html>
      )}
    </>
  );
}

export default function SceneTexts() {
  const { state, dispatch } = useAppState();
  const { texts, textSpeed = 1.0 } = state.scene;
  const { selectedTextId } = state;

  if (!texts || texts.length === 0) return null;

  return (
    <>
      {texts.map((t) => (
        <AnimatedText 
          key={t.id} 
          config={t} 
          speed={textSpeed} 
          isSelected={selectedTextId === t.id}
          onSelect={() => dispatch({ selectedTextId: t.id })}
          updateConfig={(updates) => {
            const newTexts = texts.map(text => text.id === t.id ? { ...text, ...updates } : text);
            dispatch({ scene: { texts: newTexts } });
          }}
        />
      ))}
    </>
  );
}
