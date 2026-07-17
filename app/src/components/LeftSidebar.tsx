'use client';

import React from 'react';
import { useAppState } from '@/store';
import { ActiveTool } from '@/types';

export default function LeftSidebar() {
  const { state, dispatch } = useAppState();

  const handleToolClick = (tool: ActiveTool) => {
    // Toggle off if clicking the already active tool
    if (state.activeTool === tool) {
      dispatch({ type: 'SET_ACTIVE_TOOL', tool: null });
    } else {
      dispatch({ type: 'SET_ACTIVE_TOOL', tool });
    }
  };

  return (
    <div className="left-sidebar">
      <button 
        className={`tool-btn ${state.activeTool === 'upload' ? 'active' : ''}`}
        onClick={() => handleToolClick('upload')}
        title="Upload Image/Video"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span>Upload</span>
      </button>

      <button 
        className={`tool-btn ${state.activeTool === 'scene' ? 'active' : ''}`}
        onClick={() => handleToolClick('scene')}
        title="Scene Controls"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span>Scene</span>
      </button>

      {/* Adding a placeholder for Glare since it was mentioned in the prompt */}
      <button 
        className="tool-btn"
        onClick={() => {}}
        title="Glare Settings (Coming Soon)"
        style={{ opacity: 0.5, cursor: 'not-allowed' }}
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <span>Glare</span>
      </button>

      <div style={{ flex: 1 }} />

      <button 
        className={`tool-btn ${state.activeTool === 'export' ? 'active' : ''}`}
        onClick={() => handleToolClick('export')}
        title="Export Video"
        style={{ marginBottom: '16px' }}
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Export</span>
      </button>
    </div>
  );
}
