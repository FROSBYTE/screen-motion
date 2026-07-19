'use client';

import React, { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '@/store';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone() {
  const { state, uploadScreenshot, dispatch } = useAppState();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) uploadScreenshot(file);
    },
    [uploadScreenshot]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadScreenshot(file);
      // Reset input so the same file can be re-selected
      e.target.value = '';
    },
    [uploadScreenshot]
  );

  const hasFile = !!state.screenshotUrl;

  return (
    <div className="section">
      <div className="section-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Screenshot
      </div>

      <div
        className={`upload-zone${hasFile ? ' has-file' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !hasFile && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        id="upload-zone"
        style={{ overflow: 'hidden', position: 'relative' }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleChange}
          hidden
          id="screenshot-input"
        />

        <AnimatePresence mode="wait">
          {hasFile ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="upload-preview"
              style={{ width: '100%' }}
            >
              <img src={state.screenshotUrl!} alt="Screenshot preview" />
              <div className="upload-preview-info">
                <div className="upload-preview-name">{state.screenshot!.name}</div>
                <div className="upload-preview-size">
                  {formatSize(state.screenshot!.size)}
                  {state.screenshotOrientation && ` • ${state.screenshotOrientation}`}
                </div>
              </div>
              <button
                className="upload-replace"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                title="Replace screenshot"
                id="replace-screenshot-btn"
                style={{ marginRight: 6 }}
              >
                Replace
              </button>
              <button
                className="upload-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ screenshot: null, screenshotUrl: null, screenshotOrientation: null, orientationMismatch: false });
                }}
                title="Remove screenshot"
                id="remove-screenshot-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
            >
              <div className="upload-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div className="upload-text">
                <strong>Click to upload</strong> or drag and drop
              </div>
              <div className="upload-hint">PNG, JPG, or WEBP (max 10MB)</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {state.orientationMismatch && (
        <div className="warning-banner" style={{ marginTop: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {state.screenshotOrientation} screenshot for {state.orientation} mode — will be cropped
        </div>
      )}
    </div>
  );
}
