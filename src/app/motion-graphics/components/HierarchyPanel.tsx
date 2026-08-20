'use client';

import React from 'react';
import { Plus, Trash2, Copy, Type, Layers, Film, ChevronRight, Box, GripVertical } from 'lucide-react';
import { useMGState, getSceneDuration, SceneTransition } from '../store';
import { COMPONENT_TEMPLATES } from './templates';
import { Reorder } from 'motion/react';
import ComponentPicker from './ComponentPicker';

const TRANSITION_OPTIONS: { id: SceneTransition; label: string; icon: string }[] = [
  { id: 'none', label: 'None (Cut)', icon: '⚡' },
  { id: 'clip-wipe', label: 'Clip Wipe', icon: '◧' },
  { id: 'fade', label: 'Fade', icon: '🌫️' },
  { id: 'slide-left', label: 'Slide Left', icon: '⬅' },
  { id: 'slide-right', label: 'Slide Right', icon: '➡' },
  { id: 'slide-up', label: 'Slide Up', icon: '⬆' },
  { id: 'slide-down', label: 'Slide Down', icon: '⬇' },
  { id: 'zoom', label: 'Zoom', icon: '🔍' },
  { id: 'blur', label: 'Blur', icon: '💠' },
  { id: 'iris', label: 'Iris', icon: '⊙' },
  { id: 'iris-click', label: 'Iris Click', icon: '◎' },
  { id: 'loading-line', label: 'Loading Line', icon: '━' },
];

export default function HierarchyPanel() {
  const {
    state, dispatch, addScene, removeScene, updateScene, duplicateScene, setScenes,
    addLayer, addComponentLayer, removeLayer, updateLayer, duplicateLayer, setLayers, seekTo, getSceneStartTime
  } = useMGState();
  const { scenes, activeSceneId, selectedLayerId } = state;
  const activeTab = state.activeSidebarTab || 'scene';
  const setActiveTab = (tab: 'scene' | 'components') => dispatch({ activeSidebarTab: tab });
  const pickerOpen = state.isPickerOpen || false;
  const setPickerOpen = (open: boolean) => dispatch({ isPickerOpen: open });

  const activeScene = scenes.find((s) => s.id === activeSceneId);
  const layers = activeScene?.layers || [];

  return (
    <div style={{
      width: '280px',
      minWidth: '280px',
      height: '100%',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '0 12px' }}>
        {(['scene', 'components'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="mg-btn-interactive"
            style={{
              flex: 1, padding: '12px 0', background: 'none', border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab) e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            {tab === 'scene' ? <Film size={13} /> : <Box size={13} />}
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {/* ===== SCENES TAB ===== */}
        {activeTab === 'scene' && (
          <>
            <Reorder.Group
            axis="y"
            values={scenes}
            onReorder={setScenes}
            style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 0, margin: '0 0 12px 0', listStyle: 'none' }}
          >
            {scenes.map((scene) => {
              const isActive = activeSceneId === scene.id;
              return (
                <Reorder.Item
                  key={scene.id}
                  value={scene}
                  onClick={() => {
                    dispatch({ activeSceneId: scene.id, selectedLayerId: null, activeSidebarTab: 'scene' });
                    seekTo(getSceneStartTime(scene.id));
                  }}
                  className="mg-btn-interactive"
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255,255,255,0.02)',
                    border: isActive ? '1px solid rgba(255, 255, 255, 0.35)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                      <GripVertical size={14} />
                    </div>
                    <Layers size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative', minWidth: 0 }}>
                      <input
                        type="text"
                        value={scene.name}
                        maxLength={20}
                        onChange={(e) => updateScene(scene.id, { name: e.target.value.slice(0, 20) })}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLElement).blur(); }}
                        style={{
                          width: '100%',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          padding: '2px 4px',
                          outline: 'none',
                        }}
                        onFocus={(e) => {
                          e.target.style.background = 'var(--bg-primary)';
                          e.target.style.borderColor = 'var(--border-color)';
                        }}
                        onBlur={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.borderColor = 'var(--border-color)';
                        }}
                        title="Click to edit scene name"
                      />
                      <span style={{
                        fontSize: '9px',
                        color: scene.name.length >= 20 ? '#ef4444' : 'var(--text-muted)',
                        fontWeight: scene.name.length >= 20 ? 700 : 500,
                        marginLeft: '4px',
                        flexShrink: 0,
                        userSelect: 'none',
                      }}>
                        {scene.name.length}/20
                      </span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {getSceneDuration(scene).toFixed(1)}s
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicateScene(scene.id); }}
                      className="mg-btn-interactive"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.background = 'transparent';
                      }}
                      title="Duplicate Scene"
                    >
                      <Copy size={12} />
                    </button>
                    {scenes.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeScene(scene.id); }}
                        className="delete-btn-hover"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Delete Scene"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  {scene.transition !== 'none' && (
                    <div style={{ marginTop: '4px', paddingLeft: '22px', fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ChevronRight size={10} />
                      {TRANSITION_OPTIONS.find((t) => t.id === scene.transition)?.label || 'Cut'} ({scene.transitionDuration}s)
                    </div>
                  )}
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
          <button
            onClick={() => addScene()}
            className="mg-btn-interactive"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px dashed var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '4px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <Plus size={13} strokeWidth={2.5} />
            New Scene
          </button>
        </>
        )}

        {/* ===== COMPONENTS TAB ===== */}
        {activeTab === 'components' && (
          <>
            {activeScene && (
              <div style={{ marginBottom: '14px', fontSize: '13.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Film size={14} /> Editing: <strong style={{ color: 'var(--text-primary)', fontSize: '13.5px' }}>{activeScene.name}</strong>
              </div>
            )}

            <ComponentPicker 
              open={pickerOpen} 
              onClose={() => setPickerOpen(false)} 
              onSelect={(id, props) => addComponentLayer(id, props)}
              onAddText={(animationType) => addLayer({ animationType })}
            />

            <Reorder.Group
              axis="y"
              values={layers}
              onReorder={setLayers}
              style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 0, margin: 0, listStyle: 'none', marginBottom: '8px' }}
            >
              {layers.map((layer) => {
                const isSelected = selectedLayerId === layer.id;
                const layerDisplayName = layer.name !== undefined ? layer.name : (layer.type === 'text' ? layer.text : (COMPONENT_TEMPLATES.find((t) => t.id === layer.templateId)?.name || layer.templateId));
                return (
                  <Reorder.Item
                    key={layer.id}
                    value={layer}
                    onClick={() => dispatch({ selectedLayerId: layer.id })}
                    className="mg-btn-interactive"
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255,255,255,0.02)',
                      border: isSelected ? '1px solid rgba(255, 255, 255, 0.35)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      userSelect: 'none',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                      }
                    }}
                  >
                    <div style={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                      <GripVertical size={14} />
                    </div>
                    {layer.type === 'component' ? (
                      <Box size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    ) : (
                      <Type size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <input
                        type="text"
                        value={layerDisplayName}
                        onChange={(e) => updateLayer(layer.id, { name: e.target.value } as any)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLElement).blur(); }}
                        style={{
                          width: '100%',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          padding: '2px 4px',
                          outline: 'none',
                        }}
                        onFocus={(e) => {
                          e.target.style.background = 'var(--bg-primary)';
                          e.target.style.borderColor = 'var(--border-color)';
                        }}
                        onBlur={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.borderColor = 'transparent';
                        }}
                        title="Click to rename component"
                      />
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.id); }}
                      className="mg-btn-interactive"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.background = 'transparent';
                      }}
                      title="Duplicate Component"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
                      className="delete-btn-hover"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Delete Component"
                    >
                      <Trash2 size={12} />
                    </button>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
            <button
              onClick={() => setPickerOpen(true)}
              className="mg-btn-interactive"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px dashed var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '4px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <Plus size={13} strokeWidth={2.5} />
              New Component
            </button>
          </>
        )}
      </div>
    </div>
  );
}
