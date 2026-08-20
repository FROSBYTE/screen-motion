'use client';

import React, { useRef, useState, useEffect } from 'react';

interface ColorPickerControlProps {
  label?: string;
  value: string;
  onChange: (color: string) => void;
  showHex?: boolean;
  style?: React.CSSProperties;
  height?: string | number;
}

function normalizeHex(color: string): string {
  if (!color) return '#000000';
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) return color;
  if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }
  return '#000000';
}

export default function ColorPickerControl({
  label,
  value,
  onChange,
  showHex = true,
  style,
  height = '32px',
}: ColorPickerControlProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const colorVal = value || '#000000';
  const [hexInput, setHexInput] = useState(colorVal);

  useEffect(() => {
    setHexInput(colorVal);
  }, [colorVal]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setHexInput(newVal);
    // Validate hex format (#123456 or #fff or 123456)
    if (/^#([0-9A-F]{3}){1,2}$/i.test(newVal)) {
      if (newVal.toLowerCase() !== colorVal.toLowerCase()) {
        onChange(newVal);
      }
    } else if (/^[0-9A-F]{6}$/i.test(newVal)) {
      const formatted = `#${newVal}`;
      if (formatted.toLowerCase() !== colorVal.toLowerCase()) {
        onChange(formatted);
      }
    }
  };

  const handleHexBlur = () => {
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(hexInput) && !/^[0-9A-F]{6}$/i.test(hexInput)) {
      setHexInput(colorVal);
    }
  };

  return (
    <div style={{ flex: 1, ...style }}>
      {label && (
        <label style={{ fontSize: '13px', color: '#ffffff', marginBottom: '5px', display: 'block', fontWeight: 600 }}>
          {label}
        </label>
      )}
      <div
        className="mg-btn-interactive"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 6px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          height,
          transition: 'all 0.15s ease',
          position: 'relative',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.28)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
      >
        {/* Clickable Swatch Dot */}
        <div
          onClick={() => colorInputRef.current?.click()}
          className="mg-color-swatch-card"
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            backgroundColor: colorVal,
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)',
            flexShrink: 0,
            cursor: 'pointer',
          }}
          title="Click to open color picker"
        />

        {/* Editable Hex Input Field */}
        {showHex ? (
          <input
            type="text"
            value={hexInput}
            onChange={handleHexChange}
            onBlur={handleHexBlur}
            style={{
              flex: 1,
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: 600,
              textTransform: 'uppercase',
              outline: 'none',
              padding: 0,
            }}
            placeholder="#000000"
            title="Type custom hex value"
          />
        ) : null}

        {/* Hidden Native Picker */}
        <input
          ref={colorInputRef}
          type="color"
          value={normalizeHex(colorVal)}
          onChange={(e) => {
            if (e.target.value.toLowerCase() !== colorVal.toLowerCase()) {
              onChange(e.target.value);
              setHexInput(e.target.value);
            }
          }}
          style={{ opacity: 0, width: 0, height: 0, position: 'absolute', pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
}
