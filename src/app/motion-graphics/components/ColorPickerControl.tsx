'use client';

import React, { useRef } from 'react';
import { Pencil } from 'lucide-react';

interface ColorPickerControlProps {
  label?: string;
  value: string;
  onChange: (color: string) => void;
  style?: React.CSSProperties;
  height?: string | number;
  title?: string;
}

export function normalizeHex(color: string): string {
  if (!color) return '#000000';
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) return color;
  if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }
  return color.startsWith('#') ? color : '#000000';
}

function getContrastColor(hex: string): string {
  const cleanHex = normalizeHex(hex).replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.88)';
}

export default function ColorPickerControl({
  label,
  value,
  onChange,
  style,
  height = '36px',
  title,
}: ColorPickerControlProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const colorVal = normalizeHex(value || '#000000');
  const iconColor = getContrastColor(colorVal);

  return (
    <div style={{ flex: 1, minWidth: 0, ...style }}>
      {label && (
        <label style={{
          fontSize: '13px',
          color: '#ffffff',
          marginBottom: '5px',
          display: 'block',
          fontWeight: 600,
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        }}>
          {label}
        </label>
      )}
      <div
        onClick={() => colorInputRef.current?.click()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 10px',
          backgroundColor: colorVal,
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: '8px',
          height,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
          cursor: 'pointer',
          position: 'relative',
          userSelect: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.45)';
          e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.2), 0 2px 6px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.25)';
        }}
        title={title || `Color: ${colorVal} (Click to change)`}
      >
        {/* Right-aligned Pencil Edit Icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: iconColor,
          pointerEvents: 'none',
          filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
        }}>
          <Pencil size={13} strokeWidth={2.2} />
        </div>

        {/* Hidden Native Color Picker */}
        <input
          ref={colorInputRef}
          type="color"
          value={colorVal}
          onChange={(e) => {
            if (e.target.value.toLowerCase() !== colorVal.toLowerCase()) {
              onChange(e.target.value);
            }
          }}
          style={{
            opacity: 0,
            width: 0,
            height: 0,
            position: 'absolute',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}
