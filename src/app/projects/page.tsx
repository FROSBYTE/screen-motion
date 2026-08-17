'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Film,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Copy,
  Edit2,
  Layers,
  Clock,
  ExternalLink,
  Smartphone,
  FolderOpen,
} from 'lucide-react';
import {
  listProjects,
  createProject,
  duplicateProject,
  deleteProject,
  renameProject,
  MGProjectSummary,
} from '@/lib/storage/indexedDb';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<MGProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const list = await listProjects();
      setProjects(list);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const handleCreateNew = async () => {
    try {
      setIsCreating(true);
      const newProj = await createProject('Untitled Video');
      router.push(`/motion-graphics/${newProj.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
      setIsCreating(false);
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(null);
    try {
      await duplicateProject(id);
      await fetchProjects();
    } catch (err) {
      console.error('Failed to duplicate project:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setActiveMenuId(null);
    if (window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      try {
        await deleteProject(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
  };

  const startRename = (e: React.MouseEvent, proj: MGProjectSummary) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setEditingId(proj.id);
    setEditingTitle(proj.title);
  };

  const saveRename = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingId || !editingTitle.trim()) {
      setEditingId(null);
      return;
    }
    const targetId = editingId;
    const targetTitle = editingTitle.trim();
    setEditingId(null);

    try {
      await renameProject(targetId, targetTitle);
      setProjects((prev) =>
        prev.map((p) => (p.id === targetId ? { ...p, title: targetTitle, updatedAt: Date.now() } : p))
      );
    } catch (err) {
      console.error('Failed to rename project:', err);
    }
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter((p) => p.title.toLowerCase().includes(q));
  }, [projects, searchQuery]);

  const formatRelativeTime = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      color: '#FFFFFF',
      fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Header Navigation */}
      <header style={{
        height: '56px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: '#0a0a0a',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* Left: Brand / Home Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '17px',
              letterSpacing: '-0.03em',
            }}
          >
            <span>screen<span style={{ color: '#FFFFFF', opacity: 0.85 }}>motion</span></span>
          </Link>

          <span style={{ color: '#71717A', fontSize: '13px' }}>/</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#A1A1AA' }}>
            Motion Graphics Projects
          </span>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/editor"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: '#141414',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#A1A1AA',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Smartphone size={14} />
            3D Device Mockup
          </Link>

          <button
            onClick={handleCreateNew}
            disabled={isCreating}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#FFFFFF',
              color: '#000000',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isCreating ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 12px rgba(255, 255, 255, 0.2)',
              transition: 'all 0.15s ease',
              opacity: isCreating ? 0.7 : 1,
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            {isCreating ? 'Creating...' : 'New Project'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{
        flex: 1,
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        {/* Page Hero & Search Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '28px',
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#FFFFFF' }}>
              Your Projects
            </h1>
            <p style={{ fontSize: '13px', color: '#A1A1AA', margin: '4px 0 0 0' }}>
              {projects.length} {projects.length === 1 ? 'project' : 'projects'} saved locally in browser
            </p>
          </div>

          {/* Search Box */}
          <div style={{
            position: 'relative',
            width: '280px',
            maxWidth: '100%',
          }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#71717A',
              }}
            />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                background: '#141414',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Projects Grid / Content */}
        {isLoading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: '220px',
                  borderRadius: '12px',
                  background: '#0d0d0d',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  opacity: 0.5,
                }}
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 20px',
            textAlign: 'center',
            background: '#0a0a0a',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            marginTop: '12px',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: '16px',
            }}>
              <FolderOpen size={30} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px 0', color: '#FFFFFF' }}>
              {searchQuery ? 'No matching projects' : 'No projects yet'}
            </h3>
            <p style={{ fontSize: '13px', color: '#A1A1AA', maxWidth: '360px', margin: '0 0 20px 0' }}>
              {searchQuery
                ? `No projects found matching "${searchQuery}". Try searching for something else.`
                : 'Create your first motion graphics video with animated text, 3D device mockups, and smooth transitions.'}
            </p>
            <button
              onClick={handleCreateNew}
              disabled={isCreating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '8px',
                background: '#FFFFFF',
                color: '#000000',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(255, 255, 255, 0.2)',
              }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Create New Project
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {/* New Project Card CTA */}
            <div
              onClick={handleCreateNew}
              style={{
                borderRadius: '12px',
                border: '1px dashed rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.02)',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FFFFFF';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}>
                <Plus size={22} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>New Video Project</span>
              <span style={{ fontSize: '12px', color: '#71717A', marginTop: '4px' }}>Start from blank studio</span>
            </div>

            {/* Existing Project Cards */}
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => router.push(`/motion-graphics/${proj.id}`)}
                style={{
                  position: 'relative',
                  borderRadius: '12px',
                  background: '#0d0d0d',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '240px',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.6)';
                }}
              >
                {/* Visual Thumbnail Area */}
                <div style={{
                  height: '140px',
                  width: '100%',
                  background: proj.thumbnailBg || '#050505',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                }}>
                  {/* Subtle Grid Accent */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                    opacity: 0.3,
                  }} />

                  <Film size={36} color="rgba(255,255,255,0.25)" />

                  {/* Badges on Thumbnail */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    display: 'flex',
                    gap: '6px',
                  }}>
                    <span style={{
                      padding: '3px 7px',
                      borderRadius: '6px',
                      background: 'rgba(0, 0, 0, 0.8)',
                      backdropFilter: 'blur(8px)',
                      color: '#A1A1AA',
                      fontSize: '10px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}>
                      <Layers size={11} /> {proj.sceneCount} {proj.sceneCount === 1 ? 'Scene' : 'Scenes'}
                    </span>
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                  }}>
                    <span style={{
                      padding: '3px 7px',
                      borderRadius: '6px',
                      background: 'rgba(0, 0, 0, 0.85)',
                      backdropFilter: 'blur(8px)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}>
                      <Clock size={11} /> {proj.duration.toFixed(1)}s
                    </span>
                  </div>
                </div>

                {/* Card Bottom: Title & Actions */}
                <div style={{
                  padding: '12px 14px',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#0d0d0d',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {editingId === proj.id ? (
                      <form
                        onSubmit={saveRename}
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          autoFocus
                          onBlur={() => saveRename()}
                          style={{
                            width: '100%',
                            padding: '3px 6px',
                            background: '#000000',
                            border: '1px solid #FFFFFF',
                            borderRadius: '4px',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            fontWeight: 600,
                            outline: 'none',
                          }}
                        />
                      </form>
                    ) : (
                      <>
                        <h4 style={{
                          margin: 0,
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {proj.title}
                        </h4>
                        <span style={{ fontSize: '11px', color: '#71717A', marginTop: '2px', display: 'block' }}>
                          Edited {formatRelativeTime(proj.updatedAt)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Card Options Menu */}
                  <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === proj.id ? null : proj.id);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#71717A',
                        padding: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenuId === proj.id && (
                      <div
                        style={{
                          position: 'absolute',
                          right: 0,
                          bottom: '100%',
                          marginBottom: '6px',
                          width: '140px',
                          background: '#0a0a0a',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
                          padding: '4px',
                          zIndex: 100,
                        }}
                      >
                        <button
                          onClick={() => router.push(`/motion-graphics/${proj.id}`)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '7px 10px',
                            border: 'none',
                            background: 'transparent',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <ExternalLink size={13} /> Open
                        </button>

                        <button
                          onClick={(e) => startRename(e, proj)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '7px 10px',
                            border: 'none',
                            background: 'transparent',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <Edit2 size={13} /> Rename
                        </button>

                        <button
                          onClick={(e) => handleDuplicate(e, proj.id)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '7px 10px',
                            border: 'none',
                            background: 'transparent',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <Copy size={13} /> Duplicate
                        </button>

                        <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '4px 0' }} />

                        <button
                          onClick={(e) => handleDelete(e, proj.id, proj.title)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '7px 10px',
                            border: 'none',
                            background: 'transparent',
                            color: '#ef4444',
                            fontSize: '12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
