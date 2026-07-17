'use client';

// Suppress three.js deprecation warnings coming from react-three-fiber internals
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('THREE.Clock: This module has been deprecated.') ||
       message.includes('THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated.'))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AppProvider, useAppState } from '@/store';
import TopBar from '@/components/TopBar';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import UploadZone from '@/components/UploadZone';
import SceneControls from '@/components/SceneControls';
import ExportBar from '@/components/ExportBar';

// Dynamic import for 3D preview (no SSR)
const Preview3D = dynamic(() => import('@/components/Preview3D'), {
  ssr: false,
  loading: () => (
    <div className="preview-canvas-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
    }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading 3D engine…</div>
    </div>
  ),
});

function ErrorToast() {
  const { state, dispatch } = useAppState();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (state.error) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => dispatch({ type: 'SET_ERROR', error: null }), 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state.error, dispatch]);

  if (!state.error) return null;

  return (
    <div
      className="error-toast"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}
      id="error-toast"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6, flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
      {state.error}
    </div>
  );
}

function WebGLCheck({ children }: { children: React.ReactNode }) {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      setSupported(!!gl);
    } catch {
      setSupported(false);
    }
  }, []);

  if (!supported) {
    return (
      <div className="app-container">
        <div className="webgl-error" id="webgl-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <h2 style={{ marginBottom: 8, fontSize: 18 }}>WebGL Not Supported</h2>
            <p>Your browser doesn&apos;t support WebGL. Use Chrome or Firefox.</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AppContent() {
  const { state } = useAppState();

  return (
    <WebGLCheck>
      <div className="app-layout" id="app-container">
        <TopBar />
        
        <div className="main-container">
          <LeftSidebar />

          {/* Expandable Controls Panel */}
          <div className={`controls-panel ${state.activeTool ? 'open' : ''}`}>
            {state.activeTool && (
              <>
                <div className="controls-header">
                  <h2>
                    {state.activeTool === 'upload' && 'Upload Media'}
                    {state.activeTool === 'scene' && 'Scene Environment'}
                    {state.activeTool === 'export' && 'Export Settings'}
                  </h2>
                </div>
                <div className="controls-body">
                  {state.activeTool === 'upload' && <UploadZone />}
                  {state.activeTool === 'scene' && <SceneControls />}
                  {state.activeTool === 'export' && <ExportBar />}
                </div>
              </>
            )}
          </div>

          {/* Center Canvas */}
          <div className="preview-panel" id="preview-panel">
            <Preview3D />
          </div>

          <RightSidebar />
        </div>
      </div>

      <ErrorToast />
    </WebGLCheck>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
