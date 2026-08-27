import React, { useState } from 'react';
import { X, Smartphone, Monitor } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, aspectRatio: '16:9' | '9:16') => void;
}

export default function NewProjectModal({ isOpen, onClose, onSubmit }: NewProjectModalProps) {
  const [title, setTitle] = useState('Untitled Video');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        width: '400px',
        maxWidth: '90vw',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>New Project</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B',
              display: 'flex',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
              Project Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(15, 23, 42, 0.15)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
              Orientation
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div
                onClick={() => setAspectRatio('16:9')}
                style={{
                  flex: 1,
                  border: aspectRatio === '16:9' ? '2px solid #FF9137' : '1px solid rgba(15, 23, 42, 0.15)',
                  background: aspectRatio === '16:9' ? '#FFFDE6' : '#FFFFFF',
                  borderRadius: '8px',
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Monitor size={28} color={aspectRatio === '16:9' ? '#FF9137' : '#64748B'} style={{ marginBottom: '8px' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Landscape</span>
                <span style={{ fontSize: '11px', color: '#64748B' }}>1920 × 1080</span>
              </div>
              
              <div
                onClick={() => setAspectRatio('9:16')}
                style={{
                  flex: 1,
                  border: aspectRatio === '9:16' ? '2px solid #FF9137' : '1px solid rgba(15, 23, 42, 0.15)',
                  background: aspectRatio === '9:16' ? '#FFFDE6' : '#FFFFFF',
                  borderRadius: '8px',
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Smartphone size={28} color={aspectRatio === '9:16' ? '#FF9137' : '#64748B'} style={{ marginBottom: '8px' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Portrait</span>
                <span style={{ fontSize: '11px', color: '#64748B' }}>1080 × 1920</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(15, 23, 42, 0.08)',
          background: '#F8FAFC',
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid rgba(15, 23, 42, 0.15)',
              background: '#FFFFFF',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(title || 'Untitled Video', aspectRatio)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#FF9137',
              color: '#0F172A',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(255, 145, 55, 0.3)',
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
