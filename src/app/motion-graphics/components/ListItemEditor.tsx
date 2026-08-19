'use client';

import React from 'react';
import { Plus, Trash2, GripVertical, Copy } from 'lucide-react';

interface ListItemEditorProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  createNewItem: () => T;
  renderItem: (item: T, index: number, update: (patch: Partial<T> | T) => void) => React.ReactNode;
  addLabel?: string;
}

export default function ListItemEditor<T>({
  items,
  onChange,
  createNewItem,
  renderItem,
  addLabel = '+ Add Item',
}: ListItemEditorProps<T>) {
  const handleUpdate = (index: number, patch: Partial<T> | T) => {
    const next = [...items];
    const current = next[index];
    if (
      typeof patch === 'object' && patch !== null && !Array.isArray(patch) &&
      typeof current === 'object' && current !== null && !Array.isArray(current)
    ) {
      next[index] = { ...current, ...patch };
    } else {
      next[index] = patch as T;
    }
    onChange(next);
  };

  const handleDuplicate = (index: number) => {
    const next = [...items];
    const current = next[index];
    let clone: T;
    if (typeof current === 'object' && current !== null) {
      clone = Array.isArray(current) ? ([...current] as unknown as T) : ({ ...current });
    } else {
      clone = current;
    }
    next.splice(index + 1, 0, clone);
    onChange(next);
  };

  const handleRemove = (index: number) => {
    const next = [...items];
    next.splice(index, 1);
    onChange(next);
  };

  const handleAdd = () => {
    onChange([...items, createNewItem()]);
  };

  return (
    <div style={{ marginBottom: '10px' }}>
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px',
            marginBottom: '6px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
          }}
        >
          <GripVertical size={12} style={{ color: 'var(--text-muted)', flexShrink: 0, cursor: 'grab' }} />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {renderItem(item, idx, (patch) => handleUpdate(idx, patch))}
          </div>
          <button
            onClick={() => handleDuplicate(idx)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
            title="Duplicate item"
          >
            <Copy size={13} />
          </button>
          <button
            className="delete-btn-hover"
            onClick={() => handleRemove(idx)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
            title="Remove item"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        onClick={handleAdd}
        style={{
          width: '100%',
          padding: '8px',
          background: 'rgba(168, 85, 247, 0.12)',
          border: '1px dashed rgba(168, 85, 247, 0.5)',
          borderRadius: '6px',
          color: '#a855f7',
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
        }}
      >
        <Plus size={12} /> {addLabel}
      </button>
    </div>
  );
}
