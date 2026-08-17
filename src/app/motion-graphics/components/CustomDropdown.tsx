'use client';

import React, { useState } from 'react';

interface CustomDropdownProps {
  value: number;
  onChange: (value: number) => void;
  options: { value: number; label: string }[];
  style?: React.CSSProperties;
}

export default function CustomDropdown({ value, onChange, options, style }: CustomDropdownProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState(String(value));

  const isInOptions = options.some((o) => o.value === value);

  if (isCustom || !isInOptions) {
    return (
      <input
        type="number"
        value={customValue}
        onChange={(e) => {
          setCustomValue(e.target.value);
          const num = parseFloat(e.target.value);
          if (!isNaN(num) && num >= 0) onChange(num);
        }}
        onBlur={() => {
          const num = parseFloat(customValue);
          if (!isNaN(num) && options.some((o) => o.value === num)) setIsCustom(false);
        }}
        step="0.1"
        min="0"
        style={{
          boxSizing: 'border-box',
          width: '82px',
          minWidth: '82px',
          flexShrink: 0,
          padding: '7px 8px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--accent-primary)',
          borderRadius: '6px',
          color: 'var(--text-primary)',
          fontSize: '12px',
          outline: 'none',
          ...style,
        }}
      />
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        if (e.target.value === 'custom') {
          setIsCustom(true);
          setCustomValue(String(value));
        } else {
          onChange(Number(e.target.value));
        }
      }}
      style={{
        boxSizing: 'border-box',
        width: '82px',
        minWidth: '82px',
        flexShrink: 0,
        padding: '7px 4px 7px 8px',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        color: 'var(--text-primary)',
        fontSize: '12px',
        outline: 'none',
        cursor: 'pointer',
        ...style,
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>{opt.label}</option>
      ))}
      <option value="custom" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Custom...</option>
    </select>
  );
}
