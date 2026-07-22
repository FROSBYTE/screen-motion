'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '@/store';
import { TEMPLATES, TemplateName } from '@/types';
import { trackMixpanelEvent } from '@/lib/mixpanel';

// Helper to map template names to clean minimal SVGs representing their motion
function TemplateIcon({ name }: { name: TemplateName }) {
  switch (name) {
    case 'orbit':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <circle cx="12" cy="12" r="6" />
          <path d="M12 2a10 10 0 0 1 10 10" strokeDasharray="3 3" />
          <path d="M22 12l-3-3m3 3l-3 3" />
        </svg>
      );
    case 'hero-reveal':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    case 'float':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M2 12c3-3 6-3 9 0s6 3 9 0" />
          <path d="M2 17c3-3 6-3 9 0s6 3 9 0" />
        </svg>
      );
    case 'flip':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M12 3v18M3 12h18" />
        </svg>
      );
    case 'rise':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      );
    case 'tilt-shift':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M4 18L20 6M4 6l16 12M12 2v20" />
        </svg>
      );
    case 'bounce-drop':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M12 3v12M8 11l4 4 4-4M4 21h16" />
        </svg>
      );
    case 'slide-in':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M2 12h16M14 8l4 4-4 4" />
        </svg>
      );
    case 'spiral':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M12 12a3 3 0 1 0-3-3M12 12a6 6 0 1 1-6-6M12 12a9 9 0 1 0-9-9" />
        </svg>
      );
    case 'cinematic-pan':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M7 12h10M7 8h4M7 16h6" />
        </svg>
      );
    case 'slow-pan':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M4 12h16M4 12l4-4m-4 4l4 4m12-8l4 4m-4 4l4-4" />
        </svg>
      );
    case 'minimal-sway':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M12 3v18M19 17L12 10 5 17" />
        </svg>
      );
    case 'horizontal-slide':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M2 17h20M17 13l4 4-4 4M7 9L3 13l4 4" />
          <rect x="7" y="2" width="10" height="15" rx="1.5" />
        </svg>
      );
    default:
      return null;
  }
}

export default function TemplateSelector() {
  const { state, dispatch } = useAppState();
  const activeTemplate = TEMPLATES.find((t) => t.id === state.template);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {activeTemplate && (
        <motion.div
          key={activeTemplate.id}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '10px var(--space-md)',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 'bold', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{activeTemplate.name}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 'normal' }}>
              ({activeTemplate.duration}s loop)
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
            {activeTemplate.description}
          </div>
        </motion.div>
      )}

      <div className="template-grid" id="template-selector">
        {TEMPLATES.map((t) => {
          const isActive = state.template === t.id;
          return (
            <motion.button
              key={t.id}
              className={`template-card-compact${isActive ? ' active' : ''}`}
              onClick={() => {
                dispatch({ template: t.id });
                trackMixpanelEvent('template_selected', {
                  template_id: t.id,
                  template_name: t.name,
                  template_duration: t.duration,
                });
              }}
              title={`${t.name} (${t.duration}s)`}
              id={`template-${t.id}-btn`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ position: 'relative' }}
            >
              <TemplateIcon name={t.id} />
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  style={{
                    position: 'absolute',
                    inset: '-1px',
                    border: '1.5px solid var(--accent-primary)',
                    borderRadius: 'var(--radius-md)',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
