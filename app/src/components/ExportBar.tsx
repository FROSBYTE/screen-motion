'use client';

import React from 'react';
import { useAppState } from '@/store';
import { Resolution } from '@/types';

export default function ExportBar() {
  const { state, dispatch } = useAppState();
  const { resolution, exportStatus, exportProgress, screenshotUrl } = state;

  const isExporting = exportStatus === 'rendering' || exportStatus === 'encoding';
  const canExport = !!screenshotUrl && !isExporting;

  const handleExport = async () => {
    if (!canExport) return;

    dispatch({ type: 'SET_EXPORT_STATUS', status: 'rendering', progress: 0 });

    try {
      // Simulate export progress (will be replaced with real FFmpeg pipeline)
      const totalSteps = 100;
      for (let i = 0; i <= totalSteps; i++) {
        await new Promise((r) => setTimeout(r, 50));
        const status = i < 70 ? 'rendering' : 'encoding';
        dispatch({
          type: 'SET_EXPORT_STATUS',
          status: status,
          progress: i,
        });
      }

      // Create a download from the canvas frames (placeholder)
      dispatch({ type: 'SET_EXPORT_STATUS', status: 'done', progress: 100 });

      // Reset after a delay
      setTimeout(() => {
        dispatch({ type: 'SET_EXPORT_STATUS', status: 'idle', progress: 0 });
      }, 3000);
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Export failed. Please try again or refresh the page.' });
      dispatch({ type: 'SET_EXPORT_STATUS', status: 'error', progress: 0 });
    }
  };

  const statusLabel = () => {
    switch (exportStatus) {
      case 'rendering':
        return 'Rendering frames…';
      case 'encoding':
        return 'Encoding MP4…';
      case 'done':
        return 'Export complete!';
      case 'error':
        return 'Export failed';
      default:
        return '';
    }
  };

  return (
    <div className="export-bar" id="export-bar">
      {/* Resolution Selector */}
      <div className="export-resolution" id="resolution-selector">
        <button
          className={resolution === '1080p' ? 'active' : ''}
          onClick={() => dispatch({ type: 'SET_RESOLUTION', resolution: '1080p' as Resolution })}
          id="resolution-1080p-btn"
        >
          1080p HD
        </button>
        <button
          className={resolution === '4k' ? 'active' : ''}
          onClick={() => dispatch({ type: 'SET_RESOLUTION', resolution: '4k' as Resolution })}
          id="resolution-4k-btn"
        >
          4K UHD
        </button>
      </div>

      {/* Progress */}
      {isExporting && (
        <div className="progress-container" id="export-progress">
          <div className="progress-label">
            <span>{statusLabel()}</span>
            <span>{exportProgress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
        </div>
      )}

      {exportStatus === 'done' && (
        <div style={{ color: 'var(--success)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {statusLabel()}
        </div>
      )}

      {/* Export Button */}
      <button
        className="export-btn"
        onClick={handleExport}
        disabled={!canExport}
        id="export-btn"
      >
        {isExporting ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
              <line x1="2" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
            </svg>
            Exporting…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export MP4
          </>
        )}
      </button>
    </div>
  );
}
