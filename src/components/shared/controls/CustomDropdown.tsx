'use client';

import React, { useState } from 'react';
import BasicDropdown, { DropdownItem } from '@/components/smoothui/basic-dropdown';

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
      <div style={{ position: 'relative', width: '82px', minWidth: '82px', flexShrink: 0, ...style }}>
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
          autoFocus
          style={{
            boxSizing: 'border-box',
            width: '100%',
            padding: '7px 8px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--accent-primary, #ffffff)',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '12px',
            outline: 'none',
          }}
        />
      </div>
    );
  }

  const dropdownItems: DropdownItem[] = [
    ...options.map((opt) => ({
      id: String(opt.value),
      label: opt.label,
    })),
    {
      id: 'custom',
      label: 'Custom...',
    },
  ];

  return (
    <div style={{ width: '82px', minWidth: '82px', flexShrink: 0, ...style }}>
      <BasicDropdown
        compact
        items={dropdownItems}
        value={String(value)}
        onChange={(selectedId) => {
          if (selectedId === 'custom') {
            setIsCustom(true);
            setCustomValue(String(value));
          } else {
            onChange(Number(selectedId));
          }
        }}
        buttonStyle={{
          padding: '7px 8px',
          fontSize: '12px',
          width: '100%',
        }}
      />
    </div>
  );
}
