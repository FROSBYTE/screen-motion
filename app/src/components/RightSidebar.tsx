'use client';

import React, { useState } from 'react';
import DeviceOrientation from './DeviceOrientation';
import TemplateSelector from './TemplateSelector';

export default function RightSidebar() {
  const [tab, setTab] = useState<'mobile' | 'computer'>('mobile');

  return (
    <div className="right-sidebar">
      {/* Device/Orientation toggle */}
      <div style={{ padding: 'var(--space-lg)' }}>
        <DeviceOrientation />
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', margin: '0 var(--space-lg)' }} />

      {/* Animations Section */}
      <div style={{ padding: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Animations</span>
        </div>
        
        {/* Mobile / Computer Tabs Mock */}
        <div className="toggle-group" style={{ marginBottom: 'var(--space-lg)' }}>
          <button 
            className={`toggle-btn ${tab === 'mobile' ? 'active' : ''}`}
            onClick={() => setTab('mobile')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
            Mobile
          </button>
          <button 
            className={`toggle-btn ${tab === 'computer' ? 'active' : ''}`}
            onClick={() => setTab('computer')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            Computer
          </button>
        </div>

        {tab === 'mobile' ? (
          <TemplateSelector />
        ) : (
          <div style={{ padding: 'var(--space-xl) 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            Computer models coming soon.
          </div>
        )}
      </div>
    </div>
  );
}
