'use client';

// Suppress three.js deprecation & HMR development warnings coming from react-three-fiber and Turbopack internals
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('THREE.Clock: This module has been deprecated.') ||
       message.includes('THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated.') ||
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
} from 'lucide-react';
import { MotionGraphicsProvider, useMGState } from './store';
import { AlignmentProvider } from '@/context/AlignmentContext';
import MotionCanvas from './components/MotionCanvas';
import VideoEditorPanel from './components/VideoEditorPanel';
import HierarchyPanel from './components/HierarchyPanel';
import PropertiesPanel from './components/PropertiesPanel';
import ExportVideoModal from './components/ExportVideoModal';
import { createProject, listProjects } from '@/lib/storage/indexedDb';

export function MotionGraphicsStudioContent() {
  const router = useRouter();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { saveStatus, hasUnsavedChanges, saveCurrentProject, title, setTitle, projectId } = useMGState();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

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
      router.push(`/motion-graphics/${newProj.id}`);
    } catch (err) {
      console.error('Failed to create new project:', err);
    }
  };

  return (
    <>
      <style>{`html, body { overflow: hidden; }`}</style>

      {/* Main App Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        width: '100vw',
        overflow: 'hidden',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              <img src="/icon-transparent.png" alt="Screen Motion" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
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
              <span>Projects</span>
            </Link>

            <div style={{ height: '16px', width: '1px', background: 'var(--border-color)', margin: '0 2px' }} />

            {/* Editable Project Title */}
            {isEditingTitle ? (
              <form onSubmit={handleTitleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
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
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                title="Click to rename project"
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  {title || 'Untitled Project'}
                </span>
                <Edit2 size={12} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
              </div>
            )}

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
          </div>

          {/* Right: Actions (Export) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="mg-btn-interactive"
              style={{
                background: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                color: '#000000',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 10px rgba(255,255,255,0.2)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,255,255,0.4)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              title="Export Full Video (MP4 / WebM)"
            >
              <Download size={14} style={{ color: '#000000' }} />
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

      {/* Export Video Modal */}
      <ExportVideoModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </>
  );
}

export default function MotionGraphicsPage() {
  const router = useRouter();

  useEffect(() => {
    // If arriving at /motion-graphics directly, redirect to the most recent project or /projects
    listProjects().then((projects) => {
      if (projects.length > 0) {
        router.replace(`/motion-graphics/${projects[0].id}`);
      } else {
        createProject('Untitled Video').then((p) => {
          router.replace(`/motion-graphics/${p.id}`);
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
