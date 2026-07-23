'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  id: string;
  label: string;
}

interface BasicDropdownProps {
  items: DropdownItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function BasicDropdown({ items, value, onChange, placeholder = 'Select...' }: BasicDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find((item) => item.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-primary, #111827)',
          backgroundColor: 'var(--bg-secondary, #f3f4f6)',
          border: '1px solid var(--border-color, #e5e7eb)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: '"Google Sans", sans-serif',
          transition: 'all 0.15s ease'
        }}
      >
        <span>{selectedItem ? selectedItem.label : placeholder}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          zIndex: 99,
          maxHeight: '200px',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          padding: '4px'
        }}>
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onChange(item.id);
                setIsOpen(false);
              }}
              style={{
                padding: '6px 10px',
                fontSize: '13px',
                fontWeight: item.id === value ? 700 : 500,
                color: item.id === value ? '#111827' : '#4b5563',
                backgroundColor: item.id === value ? 'rgba(0,0,0,0.05)' : 'transparent',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
