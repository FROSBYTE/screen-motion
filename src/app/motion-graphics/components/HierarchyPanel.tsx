'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Type,
  Layers,
  Film,
  ChevronDown,
  ChevronRight,
  Box,
  GripVertical,
  FolderInput,
} from 'lucide-react';
import { useMGDoc, getSceneDuration, MGLayer } from '../store';
import { COMPONENT_TEMPLATES } from './templates';
import { Reorder, motion, AnimatePresence } from 'framer-motion';
import ComponentPicker from './ComponentPicker';

export default React.memo(function HierarchyPanel() {
  const {
    state,
    dispatch,
    addScene,
    removeScene,
    updateScene,
    duplicateScene,
    setScenes,
    addLayer,
    addComponentLayer,
    removeLayer,
    removeLayers,
    updateLayer,
    duplicateLayer,
    setLayers,
    seekTo,
    getSceneStartTime,
  } = useMGDoc();

  const { scenes, activeSceneId, selectedLayerId, multiSelectedLayerIds = [] } = state;

  // Set of collapsed scene IDs (empty by default -> all scenes are expanded)
  const [collapsedSceneIds, setCollapsedSceneIds] = useState<Set<string>>(new Set());
  const [pickerTargetSceneId, setPickerTargetSceneId] = useState<string | null>(null);

  const pickerOpen = state.isPickerOpen || false;
  const setPickerOpen = (open: boolean) => dispatch({ isPickerOpen: open });

  // Auto-expand scene if selected layer is inside it
  useEffect(() => {
    if (selectedLayerId && activeSceneId) {
      setCollapsedSceneIds((prev) => {
        if (prev.has(activeSceneId)) {
          const next = new Set(prev);
          next.delete(activeSceneId);
          return next;
        }
        return prev;
      });
    }
  }, [selectedLayerId, activeSceneId]);

  const toggleSceneExpand = (sceneId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCollapsedSceneIds((prev) => {
      const next = new Set(prev);
      if (next.has(sceneId)) {
        next.delete(sceneId);
      } else {
        next.add(sceneId);
      }
      return next;
    });
  };

  const expandScene = (sceneId: string) => {
    setCollapsedSceneIds((prev) => {
      if (prev.has(sceneId)) {
        const next = new Set(prev);
        next.delete(sceneId);
        return next;
      }
      return prev;
    });
  };

  const toggleAllScenes = () => {
    if (collapsedSceneIds.size === 0) {
      // Collapse all
      setCollapsedSceneIds(new Set(scenes.map((s) => s.id)));
    } else {
      // Expand all
      setCollapsedSceneIds(new Set());
    }
  };

  const handleOpenPickerForScene = (sceneId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPickerTargetSceneId(sceneId);
    expandScene(sceneId);
    dispatch({ activeSceneId: sceneId });
    setPickerOpen(true);
  };

  const totalLayersCount = scenes.reduce((acc, s) => acc + s.layers.length, 0);

  const allSelectedLayerIds = useMemo(() => {
    return Array.from(new Set([...(selectedLayerId ? [selectedLayerId] : []), ...multiSelectedLayerIds]));
  }, [selectedLayerId, multiSelectedLayerIds]);

  return (
    <div
      style={{
        width: 'clamp(260px, 18vw, 320px)',
        minWidth: '260px',
        height: '100%',
        background: 'var(--theme-bg-panel, #FFFFFF)',
        borderRight: '1px solid var(--theme-border, rgba(15, 23, 42, 0.08))',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >

      {/* Component Picker Dialog */}
      <ComponentPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(id, props) => {
          const targetScene = pickerTargetSceneId || activeSceneId;
          addComponentLayer(id, props, targetScene);
          expandScene(targetScene);
        }}
        onAddText={(animationType) => {
          const targetScene = pickerTargetSceneId || activeSceneId;
          addLayer({ animationType }, targetScene);
          expandScene(targetScene);
        }}
      />

      {/* Multi-Selection Action Banner */}
      {allSelectedLayerIds.length > 1 && (
        <div
          style={{
            margin: '10px 10px 0 10px',
            padding: '8px 12px',
            background: '#FFF5EB',
            border: '1px solid #FED7AA',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            boxShadow: '0 2px 6px rgba(255, 145, 55, 0.1)',
          }}
        >
          <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#C2410C' }}>
            {allSelectedLayerIds.length} components selected
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeLayers(allSelectedLayerIds);
              }}
              style={{
                background: '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '5px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.25)',
              }}
              title="Delete all selected components (Delete key)"
            >
              <Trash2 size={11} />
              Delete ({allSelectedLayerIds.length})
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ selectedLayerId: null, multiSelectedLayerIds: [] });
              }}
              style={{
                background: 'transparent',
                color: '#78350F',
                border: 'none',
                fontSize: '11px',
                cursor: 'pointer',
                padding: '2px 4px',
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Hierarchy Tree List */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px' }}>
        <Reorder.Group
          axis="y"
          values={scenes}
          onReorder={setScenes}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: 0,
            margin: 0,
            listStyle: 'none',
          }}
        >
          {scenes.map((scene, sceneIndex) => {
            const isSceneActive = activeSceneId === scene.id;
            const isSceneSelected = isSceneActive && !selectedLayerId;
            const isCollapsed = collapsedSceneIds.has(scene.id);
            const durationSec = getSceneDuration(scene, scenes.length);

            return (
              <Reorder.Item
                key={scene.id}
                value={scene}
                layout="position"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                className="hierarchy-scene-card"
                style={{
                  borderRadius: 8,
                  background: isSceneSelected
                    ? 'rgba(37, 99, 235, 0.06)'
                    : isSceneActive
                    ? '#FFFFFF'
                    : '#FFFFFF',
                  border: isSceneSelected
                    ? '1px solid #2563EB'
                    : isSceneActive
                    ? '1px solid rgba(15, 23, 42, 0.15)'
                    : '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: isSceneSelected ? '0 4px 14px -2px rgba(37, 99, 235, 0.15)' : '0 2px 6px rgba(15, 23, 42, 0.03)',
                  transition: 'background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                  overflow: 'hidden',
                  transformOrigin: 'top',
                }}
              >
                {/* Scene Header Row */}
                <div
                  onClick={() => {
                    dispatch({ activeSceneId: scene.id, selectedLayerId: null, activeSidebarTab: 'scene' });
                    seekTo(getSceneStartTime(scene.id));
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0 8px',
                    height: '36px',
                    minHeight: '36px',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: isSceneSelected ? 'rgba(255,255,255,0.04)' : 'transparent',
                  }}
                >
                  {/* Expand / Collapse Chevron */}
                  <button
                    onClick={(e) => toggleSceneExpand(scene.id, e)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                      transition: 'transform 0.15s ease, color 0.15s ease',
                    }}
                    title={isCollapsed ? 'Expand Scene Components' : 'Collapse Scene'}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FF9137')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                  </button>

                  {/* Drag Grip Handle */}
                  <div
                    style={{
                      cursor: 'grab',
                      display: 'flex',
                      alignItems: 'center',
                      color: 'var(--text-muted)',
                      opacity: 0.6,
                    }}
                    title="Drag to reorder Scene"
                  >
                    <GripVertical size={13} />
                  </div>

                  {/* Scene Icon */}
                  <Film
                    size={13}
                    style={{
                      color: isSceneActive ? 'var(--accent-primary, #c084fc)' : 'var(--text-muted)',
                      flexShrink: 0,
                    }}
                  />

                  {/* Editable Scene Name */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative', minWidth: 0 }}>
                    <input
                      type="text"
                      value={scene.name}
                      maxLength={15}
                      onChange={(e) => updateScene(scene.id, { name: e.target.value.slice(0, 15) })}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLElement).blur();
                      }}
                      style={{
                        width: '100%',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        background: 'transparent',
                        border: '1px solid transparent',
                        borderRadius: '4px',
                        padding: '2px 4px',
                        outline: 'none',
                        transition: 'all 0.15s ease',
                      }}
                      onFocus={(e) => {
                        e.target.style.background = 'var(--bg-primary, #111118)';
                        e.target.style.borderColor = 'var(--accent-primary, #a855f7)';
                      }}
                      onBlur={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.borderColor = 'transparent';
                      }}
                      title="Click to rename scene"
                    />
                    <span
                      style={{
                        fontSize: '9px',
                        color: scene.name.length >= 15 ? '#ef4444' : 'rgba(255,255,255,0.3)',
                        fontWeight: scene.name.length >= 15 ? 700 : 500,
                        marginLeft: '2px',
                        flexShrink: 0,
                        userSelect: 'none',
                      }}
                    >
                      {scene.name.length}/15
                    </span>
                  </div>

                  {/* Action Buttons Toolbar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {/* Duplicate Scene */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateScene(scene.id);
                      }}
                      className="mg-btn-interactive"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '3px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#FF9137';
                        e.currentTarget.style.background = 'rgba(15, 23, 42, 0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.background = 'transparent';
                      }}
                      title="Duplicate Scene"
                    >
                      <Copy size={13} />
                    </button>

                    {/* Delete Scene */}
                    {scenes.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeScene(scene.id);
                        }}
                        className="delete-btn-hover"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '3px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                        title="Delete Scene"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Indented Child Components Section */}
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                      style={{
                        overflow: 'hidden',
                        borderTop: '1px solid rgba(15, 23, 42, 0.06)',
                        background: '#F4F5EE',
                        transformOrigin: 'top',
                      }}
                    >
                      <div style={{ padding: '6px 8px 8px 8px' }}>
                        {scene.layers.length === 0 ? (
                          <div
                            onClick={(e) => handleOpenPickerForScene(scene.id, e)}
                            style={{
                              padding: '12px',
                              textAlign: 'center',
                              border: '1px dashed rgba(15, 23, 42, 0.12)',
                              borderRadius: '8px',
                              color: 'var(--text-muted)',
                              fontSize: '11px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#FF9137';
                              e.currentTarget.style.color = '#FF9137';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.12)';
                              e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                          >
                            + Add Component
                          </div>
                        ) : (
                          <Reorder.Group
                            axis="y"
                            values={scene.layers}
                            onReorder={(newLayers) => setLayers(newLayers, scene.id)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              padding: 0,
                              margin: 0,
                              listStyle: 'none',
                            }}
                          >
                            <AnimatePresence>
                              {scene.layers.map((layer) => {
                                const isLayerSelected = selectedLayerId === layer.id || multiSelectedLayerIds.includes(layer.id);
                                const layerDisplayName = layer.name !== undefined && layer.name !== ''
                                  ? layer.name
                                  : layer.type === 'text'
                                  ? ((layer as any).text.substring(0, 15) || 'Text')
                                  : layer.templateId === 'phone-device'
                                  ? (layer.props?.deviceType === 'iphone' ? 'iPhone' : layer.props?.deviceType === 'android' ? 'Android' : 'Phone')
                                  : COMPONENT_TEMPLATES.find((t) => t.id === layer.templateId)?.name || layer.templateId;

                                return (
                                  <Reorder.Item
                                    key={layer.id}
                                    value={layer}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (e.ctrlKey) {
                                        let currentMulti = multiSelectedLayerIds;
                                        let currentPrimary = selectedLayerId;
                                        const isCurrentlySelected = currentPrimary === layer.id || currentMulti.includes(layer.id);
                                        if (isCurrentlySelected) {
                                          if (currentPrimary === layer.id) {
                                            currentPrimary = null;
                                            if (currentMulti.length > 0) {
                                              currentPrimary = currentMulti[0];
                                              currentMulti = currentMulti.slice(1);
                                            }
                                          } else {
                                            currentMulti = currentMulti.filter(id => id !== layer.id);
                                          }
                                        } else {
                                          currentMulti = [...currentMulti, layer.id];
                                          if (!currentPrimary) {
                                            currentPrimary = layer.id;
                                            currentMulti = currentMulti.filter(id => id !== layer.id);
                                          }
                                        }
                                        dispatch({ selectedLayerId: currentPrimary, multiSelectedLayerIds: currentMulti });
                                      } else {
                                        dispatch({
                                          activeSceneId: scene.id,
                                          selectedLayerId: layer.id,
                                          multiSelectedLayerIds: [],
                                          activeSidebarTab: 'components',
                                        });
                                      }
                                    }}
                                    className="mg-btn-interactive"
                                    style={{
                                      padding: '5px 8px',
                                      borderRadius: '6px',
                                      background: isLayerSelected ? '#FFF8F1' : '#FFFFFF',
                                      border: isLayerSelected ? '1px solid #FF9137' : '1px solid rgba(15, 23, 42, 0.08)',
                                      boxShadow: isLayerSelected ? '0 2px 8px rgba(255, 145, 55, 0.2)' : 'none',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      userSelect: 'none',
                                      transition: 'all 0.15s ease',
                                      position: 'relative',
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!isLayerSelected) {
                                        e.currentTarget.style.borderColor = 'rgba(255, 145, 55, 0.5)';
                                        e.currentTarget.style.background = '#FFFDE6';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isLayerSelected) {
                                        e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.08)';
                                        e.currentTarget.style.background = '#FFFFFF';
                                      }
                                    }}
                                  >
                                    {/* Drag Handle */}
                                    <div
                                      style={{
                                        cursor: 'grab',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: 'var(--text-muted)',
                                        opacity: 0.6,
                                      }}
                                      title="Drag to reorder component"
                                    >
                                      <GripVertical size={12} />
                                    </div>

                                    {/* Type Icon */}
                                    {layer.type === 'component' ? (
                                      <Box size={12} style={{ color: '#FF9137', flexShrink: 0 }} />
                                    ) : (
                                      <Type size={12} style={{ color: '#0284C7', flexShrink: 0 }} />
                                    )}

                                    {/* Editable Layer Name */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <input
                                        type="text"
                                        value={layerDisplayName}
                                        onChange={(e) => updateLayer(layer.id, { name: e.target.value } as any)}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') (e.target as HTMLElement).blur();
                                        }}
                                        style={{
                                          width: '100%',
                                          fontSize: '11px',
                                          fontWeight: 600,
                                          color: 'var(--text-primary)',
                                          background: 'transparent',
                                          border: '1px solid transparent',
                                          borderRadius: '3px',
                                          padding: '1px 3px',
                                          outline: 'none',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }}
                                        onFocus={(e) => {
                                          e.target.style.background = '#FFFFFF';
                                          e.target.style.borderColor = '#FF9137';
                                        }}
                                        onBlur={(e) => {
                                          e.target.style.background = 'transparent';
                                          e.target.style.borderColor = 'transparent';
                                        }}
                                        title="Click to rename component"
                                      />
                                    </div>

                                    {/* Duplicate Layer */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch({ activeSceneId: scene.id });
                                        duplicateLayer(layer.id);
                                      }}
                                      className="mg-btn-interactive"
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: '3px',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                      title="Duplicate Component"
                                    >
                                      <Copy size={11} />
                                    </button>

                                    {/* Delete Layer */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const allSelected = Array.from(new Set([...(selectedLayerId ? [selectedLayerId] : []), ...multiSelectedLayerIds]));
                                        if (allSelected.includes(layer.id) && allSelected.length > 1) {
                                          removeLayers(allSelected);
                                        } else {
                                          removeLayer(layer.id);
                                        }
                                      }}
                                      className="delete-btn-hover"
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: '3px',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                      title={allSelectedLayerIds.length > 1 && allSelectedLayerIds.includes(layer.id) ? `Delete ${allSelectedLayerIds.length} Selected Components` : "Delete Component"}
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </Reorder.Item>
                                );
                              })}
                            </AnimatePresence>
                          </Reorder.Group>
                        )}

                        {/* Inline Add Component Button when scene is empty (0 components) */}
                        {scene.layers.length === 0 && (
                          <button
                            onClick={(e) => handleOpenPickerForScene(scene.id, e)}
                            className="mg-btn-interactive"
                            style={{
                              width: '100%',
                              padding: '7px 10px',
                              borderRadius: '6px',
                              background: '#FF9137',
                              border: 'none',
                              color: '#0F172A',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              marginTop: '4px',
                              boxShadow: '0 2px 10px rgba(255, 145, 55, 0.3)',
                              fontFamily: '"Plus Jakarta Sans", sans-serif',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#E6791E';
                              e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 145, 55, 0.45)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#FF9137';
                              e.currentTarget.style.boxShadow = '0 2px 10px rgba(255, 145, 55, 0.3)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <Plus size={13} strokeWidth={2.5} style={{ color: '#0F172A' }} />
                            <span>Add Component</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </div>

      {/* Pinned Bottom Add Scene Button */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--theme-border, rgba(15, 23, 42, 0.08))', background: 'var(--theme-bg-panel, #FFFFFF)', flexShrink: 0 }}>
        <button
          onClick={() => addScene()}
          className="mg-btn-interactive"
          style={{
            width: '100%',
            height: '36px',
            background: '#FFCC4D',
            color: '#0F172A',
            border: '1px solid rgba(15, 23, 42, 0.1)',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 2px 6px rgba(255, 204, 77, 0.3)',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F5B800';
            e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFCC4D';
            e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.1)';
          }}
          title="Add a new scene"
        >
          <Plus size={14} strokeWidth={2.5} style={{ color: '#0F172A' }} />
          Add Scene
        </button>
      </div>
    </div>
  );
});
