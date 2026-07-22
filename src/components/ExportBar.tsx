'use client';

import React from 'react';
import { useAppState } from '@/store';
import { Resolution, TEMPLATES } from '@/types';
import { trackMixpanelEvent } from '@/lib/mixpanel';

export default function ExportBar() {
  const { state, dispatch } = useAppState();
  const { resolution, exportStatus, exportProgress, screenshotUrl } = state;

  const isExporting = exportStatus === 'rendering' || exportStatus === 'encoding';
  const canExport = !!screenshotUrl && !isExporting;

  const handleExport = async () => {
    if (!canExport) return;

    dispatch({ exportStatus: 'rendering', exportProgress: 0 });

    try {
      const canvas = document.querySelector('#preview-3d canvas') as HTMLCanvasElement;
      if (!canvas) {
        throw new Error('Canvas element not found');
      }

      // Find the current template config to get duration
      const templateConfig = TEMPLATES.find((t) => t.id === state.template) || { duration: 3 };
      const baseDuration = templateConfig.duration || 3;
      const actualDurationMs = (baseDuration / state.speed) * 1000;

      // Collect recorded data chunks
      const chunks: Blob[] = [];
      const stream = canvas.captureStream(30); // 30 FPS recording
      
      let mimeType = 'video/mp4;codecs=avc1.42E01E';
      if (typeof MediaRecorder !== 'undefined') {
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=h264';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = '';
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `screen-motion-${state.template}-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        trackMixpanelEvent('export_completed', {
          template: state.template,
          device: state.device,
          resolution: state.resolution,
          orientation: state.orientation,
          speed: state.speed,
          duration_seconds: Number((actualDurationMs / 1000).toFixed(1)),
        });

        dispatch({ exportStatus: 'done', exportProgress: 100 });
        setTimeout(() => {
          dispatch({ exportStatus: 'idle', exportProgress: 0 });
        }, 3000);
      };

      // Start recording
      recorder.start();

      // Trigger animation restart in PhoneModel
      dispatch({ exportStatus: 'rendering', exportProgress: 10 });

      // Animate progress bar over the actual duration
      const updateInterval = 100; // update every 100ms
      let elapsed = 0;
      const interval = setInterval(() => {
        elapsed += updateInterval;
        const progress = Math.min(Math.floor((elapsed / actualDurationMs) * 90) + 10, 99);
        dispatch({
          exportStatus: elapsed < actualDurationMs * 0.7 ? 'rendering' : 'encoding',
          exportProgress: progress,
        });
      }, updateInterval);

      // Stop recorder after the duration expires
      setTimeout(() => {
        clearInterval(interval);
        recorder.stop();
      }, actualDurationMs);

    } catch (err) {
      console.error(err);
      dispatch({ exportStatus: 'error', exportProgress: 0 });
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
          onClick={() => dispatch({ resolution: '1080p' as Resolution })}
          id="resolution-1080p-btn"
        >
          1080p HD
        </button>
        <button
          className={resolution === '4k' ? 'active' : ''}
          onClick={() => dispatch({ resolution: '4k' as Resolution })}
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
