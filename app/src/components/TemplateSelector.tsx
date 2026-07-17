'use client';

import React from 'react';
import { useAppState } from '@/store';
import { TEMPLATES, TemplateName } from '@/types';

export default function TemplateSelector() {
  const { state, dispatch } = useAppState();

  return (
    <div className="section">
      <div className="section-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        Template
      </div>
      <div className="template-list" id="template-selector">
        {TEMPLATES.map((t) => (
          <div
            key={t.id}
            className={`template-card${state.template === t.id ? ' active' : ''}`}
            onClick={() => dispatch({ type: 'SET_TEMPLATE', template: t.id as TemplateName })}
            role="button"
            tabIndex={0}
            id={`template-${t.id}-btn`}
          >
            <div className="template-icon">{t.icon}</div>
            <div className="template-info">
              <h4>{t.name}</h4>
              <p>{t.description} • {t.duration}s</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
