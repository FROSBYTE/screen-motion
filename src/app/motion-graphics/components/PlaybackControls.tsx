'use client';

import React from 'react';
import { Rewind, FastForward } from 'lucide-react';
import { useMGState } from '../store';

export default function PlaybackControls() {
  const { state, play, pause, seekTo, totalDuration } = useMGState();
  const { currentTime, isPlaying } = state;

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      padding: '8px 24px', 
      background: 'var(--bg-secondary)', 
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      width: '100%',
      maxWidth: 'calc(90% - 48px)', /* matching canvas max width */
      marginTop: '16px',
      flexShrink: 0
    }}>
      <button
        onClick={() => seekTo(currentTime - 5)}
        className="mg-btn-interactive"
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
          borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#FF9137'; e.currentTarget.style.background = 'rgba(15, 23, 42, 0.06)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
        title="-5s"
      >
        <Rewind size={16} />
      </button>
      <button
        onClick={() => isPlaying ? pause() : play()}
        className="mg-btn-interactive"
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
          borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.06)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--text-primary)"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--text-primary)"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>
      <button
        onClick={() => seekTo(currentTime + 5)}
        className="mg-btn-interactive"
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
          borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#FF9137'; e.currentTarget.style.background = 'rgba(15, 23, 42, 0.06)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
        title="+5s"
      >
        <FastForward size={16} />
      </button>

      <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 600 }}>
        {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
        {Math.floor(currentTime % 60).toString().padStart(2, '0')}:
        {Math.floor((currentTime % 1) * 100).toString().padStart(2, '0')}
      </span>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 4px' }}>/</span>
      <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
        {Math.floor(totalDuration / 60).toString().padStart(2, '0')}:
        {Math.floor(totalDuration % 60).toString().padStart(2, '0')}:
        {Math.floor((totalDuration % 1) * 100).toString().padStart(2, '0')}
      </span>
      
      {/* Scrubber */}
      <div
        style={{
          flex: 1, height: '6px', background: '#E2E8F0',
          border: '1px solid rgba(15, 23, 42, 0.08)', borderRadius: '9999px',
          position: 'relative', cursor: 'pointer', marginLeft: '8px',
          overflow: 'hidden', touchAction: 'none',
        }}
        onPointerDown={(e) => {
          pause();
          const r = e.currentTarget.getBoundingClientRect();
          const time = Math.max(0, Math.min(totalDuration, ((e.clientX - r.left) / r.width) * totalDuration));
          seekTo(time);
          const targetEl = e.currentTarget;
          const handleMove = (moveEvent: PointerEvent) => {
            pause();
            const moveR = targetEl.getBoundingClientRect();
            const moveTime = Math.max(0, Math.min(totalDuration, ((moveEvent.clientX - moveR.left) / moveR.width) * totalDuration));
            seekTo(moveTime);
          };
          const handleUp = () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
          };
          window.addEventListener('pointermove', handleMove);
          window.addEventListener('pointerup', handleUp);
        }}
      >
        <div style={{
          width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%`,
          height: '100%', background: '#FF9137', borderRadius: '9999px',
        }} />
      </div>
    </div>
  );
}
