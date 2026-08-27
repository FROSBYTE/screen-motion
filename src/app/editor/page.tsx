'use client';

// Suppress three.js deprecation, shader compiler info logs & HMR development warnings
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('THREE.Clock: This module has been deprecated.') ||
       message.includes('THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated.') ||
       message.includes('THREE.WebGLProgram: Program Info Log:') ||
       message.includes('warning X4122:') ||
       message.includes('cannot be represented accurately in double precision') ||
       message.includes('Unexpected import of module') ||
       message.includes('deleted by an HMR update'))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Home as HomeIcon } from 'lucide-react';
import { AppProvider, useAppState } from '@/store';
import RightSidebar from '@/components/3d-editor/panels/RightSidebar';

// Dynamic import for 3D preview (no SSR)
const Preview3D = dynamic(() => import('@/components/3d-editor/models/Preview3D'), {
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

  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        dispatch({ error: null });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state.error, dispatch]);

  if (!state.error) return null;

  return (
    <div className="error-toast" id="error-toast">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6, flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
      {state.error}
    </div>
  );
}

function AppContent() {
  return (
    <>
      <style>{`html, body { overflow: hidden; }`}</style>
      
      {/* Top-Left Home Icon Navigation */}
      <Link
        href="/"
        className="home-nav-btn"
        title="Return to Home"
        aria-label="Home"
      >
        <img src="/logo.svg" alt="Screen Motion" style={{ width: '20px', height: '20px', objectFit: 'contain', filter: 'invert(1)' }} />
      </Link>

      <div className="app-layout" id="app-container" style={{ position: 'relative' }}>
        <div className="main-container">
          {/* Center Canvas */}
          <div className="preview-panel" id="preview-panel">
            <Preview3D />
          </div>

          <RightSidebar />
        </div>
      </div>

      <ErrorToast />
    </>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
