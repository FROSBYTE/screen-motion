'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
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
  Download,
  Upload,
} from 'lucide-react';
import {
  listProjects,
  createProject,
  duplicateProject,
  deleteProject,
  renameProject,
  getProject,
  saveProject,
  MGProjectSummary,
} from '@/lib/storage/indexedDb';
import NewProjectModal from './components/NewProjectModal';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<MGProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCreateNew = () => {
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (title: string, aspectRatio: '16:9' | '9:16') => {
    setIsModalOpen(false);
    try {
      setIsCreating(true);
      const newProj = await createProject(title, undefined, aspectRatio);
      router.push(`/motion-graphics/${newProj.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
      setIsCreating(false);
    }
  };

  const handleImportProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonStr = event.target?.result as string;
        const projectData = JSON.parse(jsonStr);

        if (!projectData.id || !projectData.scenes) {
          throw new Error('Invalid project file format');
        }

        // Generate new ID to avoid overwriting existing
        const newId = `mg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
        projectData.id = newId;
        projectData.title = `${projectData.title} (Imported)`;
        projectData.createdAt = Date.now();
        projectData.updatedAt = Date.now();

        await saveProject(projectData);
        await fetchProjects();
      } catch (err) {
        console.error('Failed to import project:', err);
        alert('Failed to import project. The file might be corrupted or invalid.');
      }
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
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

  const handleExportProject = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setActiveMenuId(null);
    try {
      const projectData = await getProject(id);
      if (!projectData) {
        console.error('Project not found');
        return;
      }
      
      const jsonStr = JSON.stringify(projectData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      // Sanitize filename
      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `project_${safeTitle}.json`;
      
      document.body.appendChild(a);
      a.click();
      
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export project:', err);
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
      background: 'var(--theme-bg-base, #FAFAF7)',
      color: '#0F172A',
      fontFamily: 'var(--font-sans), -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Header Navigation */}
      <header style={{
        height: '56px',
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(24px)',
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
              color: '#0F172A',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '17px',
              letterSpacing: '-0.03em',
            }}
          >
            <img src="/logo.svg" alt="Screen Motion" style={{ width: '22px', height: '22px', objectFit: 'contain', filter: 'invert(1)' }} />
            <span>screen<span style={{ color: '#0F172A', opacity: 0.85 }}>motion</span></span>
          </Link>

          <span style={{ color: 'rgba(15, 23, 42, 0.2)', fontSize: '13px' }}>/</span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Workspace / Projects
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
              borderRadius: '6px',
              background: '#F4F5EE',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              color: '#475569',
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
            onClick={() => fileInputRef.current?.click()}
            disabled={isCreating}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid rgba(15, 23, 42, 0.12)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isCreating ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
              transition: 'all 0.15s ease',
              opacity: isCreating ? 0.7 : 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F4F5EE')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
          >
            <Upload size={16} strokeWidth={2.5} />
            Import
          </button>

          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImportProject}
            style={{ display: 'none' }}
          />

          <button
            onClick={handleCreateNew}
            disabled={isCreating}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              background: '#FF9137',
              color: '#0F172A',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isCreating ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(255, 145, 55, 0.35)',
              transition: 'all 0.15s ease',
              opacity: isCreating ? 0.7 : 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#E6791E')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#FF9137')}
          >
            <Plus size={16} strokeWidth={2.5} color="#0F172A" />
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
            <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#0F172A' }}>
              Your Projects
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
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
                color: '#64748B',
              }}
            />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 34px 8px 34px',
                borderRadius: '6px',
                background: '#EEF0F5',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                color: '#0F172A',
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
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            padding: '48px 48px',
            minHeight: '400px',
            textAlign: 'left',
            background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(238,240,245,0.8) 100%)',
            border: 'none',
            borderBottom: '1px solid rgba(15, 23, 42, 0.1)',
            borderRadius: '0',
            marginTop: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '2px',
              background: '#0F172A',
              marginBottom: '32px'
            }} />
            <h3 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700, margin: '0 0 16px 0', color: '#0F172A', letterSpacing: '-0.02em', fontFamily: 'var(--font-sans)' }}>
              {searchQuery ? 'No matching projects found.' : 'Initialize your first canvas.'}
            </h3>
            <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '460px', margin: '0 0 32px 0', lineHeight: 1.6 }}>
              {searchQuery
                ? `No projects found matching "${searchQuery}". Try searching for something else.`
                : 'Studio-grade motion graphics running entirely in your browser. No server rendering, no waiting.'}
            </p>
            <button
              onClick={handleCreateNew}
              disabled={isCreating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '8px',
                background: '#FF9137',
                color: '#0F172A',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255, 145, 55, 0.35)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#E6791E')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#FF9137')}
            >
              <Plus size={16} strokeWidth={2.5} color="#0F172A" />
              {isCreating ? 'Creating...' : 'New Project'}
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            <div
              onClick={handleCreateNew}
              style={{
                borderRadius: '8px',
                border: '1px dashed rgba(15, 23, 42, 0.2)',
                background: '#FFFFFF',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FF9137';
                e.currentTarget.style.background = '#FFFDE6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.2)';
                e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(255, 145, 55, 0.15)',
                color: '#FF9137',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}>
                <Plus size={22} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>New Video Project</span>
              <span style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Start from blank studio</span>
            </div>

            {/* Existing Project Cards */}
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => router.push(`/motion-graphics/${proj.id}`)}
                style={{
                  position: 'relative',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '240px',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 4px 14px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.25)';
                  e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(15, 23, 42, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.08)';
                  e.currentTarget.style.boxShadow = '0 4px 14px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03)';
                }}
              >
                {/* Visual Thumbnail Area */}
                <div style={{
                  height: '140px',
                  width: '100%',
                  background: proj.thumbnailBg || '#EEF0F5',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
                  overflow: 'hidden',
                }}>
                  {/* Subtle Grid Accent */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(rgba(15,23,42,0.08) 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                    opacity: 0.6,
                  }} />

                  <Film size={36} color="rgba(15,23,42,0.25)" />

                  {/* Badges on Thumbnail */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    display: 'flex',
                    gap: '6px',
                  }}>
                    {proj.aspectRatio === '9:16' && (
                      <span style={{
                        padding: '2px 6px',
                        background: 'rgba(255, 145, 55, 0.85)',
                        backdropFilter: 'blur(4px)',
                        color: '#0F172A',
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid rgba(255, 145, 55, 0.2)',
                        borderRadius: '4px'
                      }}>
                        <Smartphone size={11} /> 9:16
                      </span>
                    )}
                    <span style={{
                      padding: '2px 6px',
                      background: 'rgba(255, 255, 255, 0.85)',
                      backdropFilter: 'blur(4px)',
                      color: '#0F172A',
                      fontSize: '9px',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid rgba(15, 23, 42, 0.08)',
                      borderRadius: '4px'
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
                      padding: '2px 6px',
                      background: 'rgba(255, 255, 255, 0.85)',
                      backdropFilter: 'blur(4px)',
                      color: '#0F172A',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid rgba(15, 23, 42, 0.08)',
                      borderRadius: '4px'
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
                  background: '#FFFFFF',
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
                            background: '#EEF0F5',
                            border: '1px solid #0F172A',
                            borderRadius: '4px',
                            color: '#0F172A',
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
                          color: '#0F172A',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {proj.title}
                        </h4>
                        <span style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', display: 'block' }}>
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
                        color: '#64748B',
                        padding: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#0F172A')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
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
                          background: '#FFFFFF',
                          border: '1px solid rgba(15, 23, 42, 0.12)',
                          borderRadius: '8px',
                          boxShadow: '0 12px 32px -4px rgba(15, 23, 42, 0.15)',
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
                            color: '#0F172A',
                            fontSize: '12px',
                            fontWeight: 600,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F3F7')}
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
                            color: '#0F172A',
                            fontSize: '12px',
                            fontWeight: 600,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F3F7')}
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
                            color: '#0F172A',
                            fontSize: '12px',
                            fontWeight: 600,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F3F7')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <Copy size={13} /> Duplicate
                        </button>

                        <button
                          onClick={(e) => handleExportProject(e, proj.id, proj.title)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '7px 10px',
                            border: 'none',
                            background: 'transparent',
                            color: '#0F172A',
                            fontSize: '12px',
                            fontWeight: 600,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F3F7')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <Download size={13} /> Export JSON
                        </button>

                        <div style={{ height: '1px', background: 'rgba(15, 23, 42, 0.06)', margin: '4px 0' }} />

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
                            color: '#EF4444',
                            fontSize: '12px',
                            fontWeight: 600,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)')}
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
      
      <NewProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />
    </div>
  );
}
