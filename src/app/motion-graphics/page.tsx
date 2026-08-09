'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home as HomeIcon, Download, Film } from 'lucide-react';
import { MotionGraphicsProvider } from './store';
import { AlignmentProvider } from '@/context/AlignmentContext';
import MotionCanvas from './components/MotionCanvas';
import MotionTimeline from './components/MotionTimeline';
import MotionSidebar from './components/MotionSidebar';
import ExportVideoModal from './components/ExportVideoModal';

export default function MotionGraphicsPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <MotionGraphicsProvider>
      <AlignmentProvider>
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
          {/* Left: Home + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                transition: 'all 0.15s ease',
              }}
              title="Return to Home"
            >
              <HomeIcon size={16} />
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Motion Graphics Studio
              </span>
            </div>
          </div>

          {/* Right: Export Video Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            style={{
              background: 'var(--accent-primary)',
              border: 'none',
              borderRadius: '8px',
              color: '#0f172a',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              transition: 'all 0.15s ease',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
            title="Export motion graphic as MP4 video"
          >
            <Film size={14} />
            <span>Export Video</span>
            <Download size={13} style={{ opacity: 0.85 }} />
          </button>
        </header>

        {/* Workspace Body */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, width: '100%', overflow: 'hidden' }}>
          {/* Left: Canvas + Timeline stacked */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
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

            {/* Timeline */}
            <MotionTimeline />
          </div>

          {/* Right Sidebar */}
          <MotionSidebar />
        </div>
      </div>

      {/* Export Video Modal */}
      <ExportVideoModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
      </AlignmentProvider>
    </MotionGraphicsProvider>
  );
}
