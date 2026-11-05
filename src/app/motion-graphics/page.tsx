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

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  FolderOpen,
  Download,
  Film,
  Plus,
  Check,
  Loader2,
  CloudAlert,
  Edit2,
  Save,
  Undo2,
  Redo2,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { MotionGraphicsProvider, useMGDoc } from './store';
import { AlignmentProvider } from '@/context/AlignmentContext';
import MotionCanvas from './components/MotionCanvas';
import VideoEditorPanel from './components/VideoEditorPanel';
import HierarchyPanel from './components/HierarchyPanel';
import PropertiesPanel from './components/PropertiesPanel';
import { createProject, listProjects } from '@/lib/storage/indexedDb';

const ExportVideoModal = dynamic(() => import('./components/ExportVideoModal'), { ssr: false });

export function MotionGraphicsStudioContent() {
  const router = useRouter();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { state, saveStatus, hasUnsavedChanges, saveCurrentProject, title, setTitle, projectId, undo, redo, canUndo, canRedo, setAspectRatio } = useMGDoc();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  const { scenes } = state;
  const totalLayers = scenes.reduce((sum, s) => sum + (s.layers?.length || 0), 0);
  const isExportDisabled = scenes.length <= 1 && totalLayers === 0;

  useEffect(() => {
    setTempTitle(title);
  }, [title]);

  const handleTitleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (tempTitle.trim()) {
      setTitle(tempTitle.trim());
    } else {
      setTempTitle(title);
    }
    setIsEditingTitle(false);
  };

  const handleCreateNew = async () => {
    try {
      const newProj = await createProject('Untitled Video');
      router.push(`/motion-graphics/project?id=${newProj.id}`);
    } catch (err) {
      console.error('Failed to create new project:', err);
    }
  };

  return (
    <>
      <style>{`
        html, body { overflow: hidden; }
        
        /* Custom High-Contrast Scrollbars */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.04);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(15, 23, 42, 0.25);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #FF9137;
        }
        ::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>

      {/* Main App Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        width: '100vw',
        minWidth: '1024px',
        overflowX: 'auto',
        overflowY: 'hidden',
        background: 'var(--bg-primary)',
      }}>
        {/* Top Header Navigation Bar */}
        <header style={{
          height: '48px',
          flexShrink: 0,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 100,
        }}>
          {/* Left: App Logo + Projects Link + Editable Title + Save Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#FFFFFF',
                textDecoration: 'none',
                padding: '2px',
              }}
              title="Screen Motion Home"
            >
              <img src="/logo.svg" alt="Screen Motion" style={{ width: '22px', height: '22px', objectFit: 'contain', filter: 'invert(1)' }} />
            </Link>

            <Link
              href="/projects"
              className="mg-btn-interactive"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '8px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              title="Return to Projects Dashboard"
            >
              <FolderOpen size={14} style={{ color: 'var(--accent-primary)' }} />
              <span>Back To Projects</span>
            </Link>

            <div style={{ height: '16px', width: '1px', background: 'var(--border-color)', margin: '0 2px' }} />

            {/* Editable Project Title */}
            {isEditingTitle ? (
              <form onSubmit={handleTitleSubmit} style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={() => handleTitleSubmit()}
                  autoFocus
                  style={{
                    padding: '3px 8px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--accent-primary)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: 700,
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </form>
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                className="mg-btn-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'background 0.15s ease',
                  border: '1px solid transparent',
                  minWidth: 0,
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                title="Click to rename project"
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {title || 'Untitled Project'}
                </span>
                <Edit2 size={12} style={{ color: 'var(--text-muted)', opacity: 0.6, flexShrink: 0 }} />
              </div>
            )}

            <div style={{ height: '16px', width: '1px', background: 'var(--border-color)', margin: '0 2px' }} />

            {/* Aspect Ratio Switcher */}
            <div
              className="mg-btn-interactive"
              onClick={() => setAspectRatio(state.aspectRatio === '16:9' ? '9:16' : '16:9')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                borderRadius: '6px',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title={`Current Orientation: ${state.aspectRatio === '16:9' ? 'Landscape (1920x1080)' : 'Portrait (1080x1920)'}. Click to switch.`}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(15, 23, 42, 0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {state.aspectRatio === '16:9' ? <Monitor size={14} color="var(--text-muted)" /> : <Smartphone size={14} color="var(--text-muted)" />}
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{state.aspectRatio}</span>
            </div>

            {/* Manual Save Button & Shortcut */}
            <button
              onClick={() => saveCurrentProject()}
              disabled={saveStatus === 'saving'}
              className="mg-btn-interactive"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '8px',
                background: hasUnsavedChanges
                  ? 'rgba(239, 68, 68, 0.12)'
                  : 'rgba(34, 197, 94, 0.12)',
                border: hasUnsavedChanges
                  ? '1px solid rgba(239, 68, 68, 0.35)'
                  : '1px solid rgba(34, 197, 94, 0.35)',
                color: hasUnsavedChanges ? '#f87171' : '#4ade80',
                fontSize: '12px',
                fontWeight: 600,
                cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                marginLeft: '4px',
              }}
              title={hasUnsavedChanges ? 'Unsaved changes (Ctrl + S to save)' : 'All changes saved (Ctrl + S)'}
            >
              {saveStatus === 'saving' ? (
                <>
                  <Loader2 size={13} className="animate-spin" style={{ color: '#fbbf24' }} />
                  <span style={{ color: '#fbbf24' }}>Saving…</span>
                </>
              ) : saveStatus === 'saved' && !hasUnsavedChanges ? (
                <>
                  <Check size={13} style={{ color: '#4ade80' }} />
                  <span style={{ color: '#4ade80' }}>Saved</span>
                  <kbd style={{
                    fontSize: '10px',
                    fontFamily: 'inherit',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: 'rgba(74, 222, 128, 0.12)',
                    color: '#86efac',
                    marginLeft: '2px',
                  }}>
                    Ctrl+S
                  </kbd>
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <CloudAlert size={13} style={{ color: '#ef4444' }} />
                  <span style={{ color: '#ef4444' }}>Save Failed</span>
                </>
              ) : (
                <>
                  <Save size={13} style={{ color: '#f87171' }} />
                  <span style={{ color: '#f87171' }}>Unsaved</span>
                  <kbd style={{
                    fontSize: '10px',
                    fontFamily: 'inherit',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#fca5a5',
                    marginLeft: '2px',
                  }}>
                    Ctrl+S
                  </kbd>
                </>
              )}
            </button>
            {/* Undo / Redo */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: 'auto', paddingRight: '10px' }}>
              <button
                className="mg-btn-interactive"
                disabled={!canUndo}
                onClick={undo}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '4px', borderRadius: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: canUndo ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: canUndo ? 'pointer' : 'not-allowed',
                  opacity: canUndo ? 1 : 0.5,
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (canUndo) e.currentTarget.style.background = 'rgba(15, 23, 42, 0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={14} />
              </button>
              <button
                className="mg-btn-interactive"
                disabled={!canRedo}
                onClick={redo}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '4px', borderRadius: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: canRedo ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: canRedo ? 'pointer' : 'not-allowed',
                  opacity: canRedo ? 1 : 0.5,
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (canRedo) e.currentTarget.style.background = 'rgba(15, 23, 42, 0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 size={14} />
              </button>
            </div>
          </div>

          {/* Right: Actions (Export) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                if (!isExportDisabled) setIsExportModalOpen(true);
              }}
              disabled={isExportDisabled}
              className={isExportDisabled ? '' : 'mg-btn-interactive'}
              style={{
                background: isExportDisabled ? '#F4F5EE' : '#FF9137',
                border: isExportDisabled ? '1px solid rgba(15, 23, 42, 0.08)' : 'none',
                borderRadius: '8px',
                color: isExportDisabled ? '#94A3B8' : '#0F172A',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: isExportDisabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isExportDisabled ? 'none' : '0 2px 10px rgba(255, 145, 55, 0.3)',
                transition: 'all 0.15s ease',
                opacity: isExportDisabled ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isExportDisabled) {
                  e.currentTarget.style.background = '#E6791E';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 145, 55, 0.45)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isExportDisabled) {
                  e.currentTarget.style.background = '#FF9137';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(255, 145, 55, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
              title={isExportDisabled ? 'Add components or a second scene to export video' : 'Export Full Video (MP4 / WebM)'}
            >
              <Download size={14} style={{ color: isExportDisabled ? '#94A3B8' : '#0F172A' }} />
              <span>Export</span>
            </button>
          </div>
        </header>

        {/* Workspace Body */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, width: '100%', overflow: 'hidden' }}>
          {/* Left & Center Container (Hierarchy + Canvas + Video Editor) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
            
            {/* Top Area: Hierarchy Panel + Canvas */}
            <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {/* Hierarchy Panel */}
              <HierarchyPanel />

              {/* Canvas Area */}
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                minHeight: 0,
                minWidth: '400px',
                overflow: 'hidden',
              }}>
                <MotionCanvas />
              </div>
            </div>

            {/* Bottom Area: Video Editor Panel */}
            <VideoEditorPanel />
          </div>

          {/* Right Sidebar (Properties Panel) */}
          <PropertiesPanel />
        </div>
      </div>

      {/* Export Video Modal (Lazy loaded on demand) */}
      {isExportModalOpen && (
        <ExportVideoModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </>
  );
}

export default function MotionGraphicsPage() {
  const router = useRouter();

  useEffect(() => {
    // If arriving at /motion-graphics directly, redirect to the most recent project or /projects
    listProjects().then((projects) => {
      if (projects.length > 0) {
        router.replace(`/motion-graphics/project?id=${projects[0].id}`);
      } else {
        createProject('Untitled Video', undefined, '16:9').then((p) => {
          router.replace(`/motion-graphics/project?id=${p.id}`);
        });
      }
    });
  }, [router]);

  return (
    <MotionGraphicsProvider>
      <AlignmentProvider>
        <MotionGraphicsStudioContent />
      </AlignmentProvider>
    </MotionGraphicsProvider>
  );
}
