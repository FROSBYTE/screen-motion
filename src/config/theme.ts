/**
 * Video Editor & Motion Graphics Theme Palette Configuration
 * 
 * Centralized color tokens for seamless theme switching across the application.
 * Components consume CSS variables (--bg-primary, --text-primary, --accent-primary, etc.)
 * which are dynamically mapped to these theme definitions.
 */

export interface ThemePalette {
  id: string;
  name: string;
  type: 'dark' | 'light';
  colors: {
    bgBase: string;
    bgPanel: string;
    bgInset: string;
    bgCard: string;
    bgCardHover: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textAccent: string;
    accentPrimary: string;
    accentHover: string;
    accentSecondary: string;
    border: string;
    borderHover: string;
  };
}

/**
 * Industry-Standard Pro Video Editor Dark Theme
 * Modeled after DaVinci Resolve, Adobe Premiere Pro, and modern Motion Design tools.
 */
export const PRO_VIDEO_EDITOR_DARK: ThemePalette = {
  id: 'pro-dark',
  name: 'Pro Video Editor Dark (Default)',
  type: 'dark',
  colors: {
    bgBase: '#0e0e14',          // Deep void backdrop for accurate visual contrast
    bgPanel: '#181824',         // Sleek slate panel background
    bgInset: '#222232',         // Input controls & dropdown background
    bgCard: '#1c1c2b',          // Card container background
    bgCardHover: 'rgba(250, 204, 21, 0.12)', // Subtle yellow glow hover
    textPrimary: '#f8fafc',      // High-contrast off-white primary text
    textSecondary: '#94a3b8',    // Slate gray secondary text
    textMuted: '#64748b',       // Muted sub-text & icons
    textAccent: '#facc15',      // Studio Warm Yellow text accent
    accentPrimary: '#facc15',    // Studio Warm Yellow primary brand accent
    accentHover: '#fde047',      // Bright yellow hover state
    accentSecondary: '#eab308',  // Golden Yellow secondary accent
    border: 'rgba(255, 255, 255, 0.1)', // Clean dark border line
    borderHover: 'rgba(250, 204, 21, 0.4)', // Glowing border on hover
  },
};

/**
 * Studio Warm Light Theme
 */
export const STUDIO_LIGHT: ThemePalette = {
  id: 'studio-light',
  name: 'Studio Light (Cream & Slate)',
  type: 'light',
  colors: {
    bgBase: '#fcf9ea',
    bgPanel: '#ffffff',
    bgInset: '#badfdb',
    bgCard: '#ffffff',
    bgCardHover: 'rgba(186, 223, 219, 0.2)',
    textPrimary: '#111827',
    textSecondary: '#4b5563',
    textMuted: '#9ca3af',
    textAccent: '#111827',
    accentPrimary: '#ffa4a4',
    accentHover: '#ffbdbd',
    accentSecondary: '#badfdb',
    border: 'rgba(0, 0, 0, 0.08)',
    borderHover: 'rgba(0, 0, 0, 0.15)',
  },
};

/**
 * OLED Midnight Black Theme
 */
export const OLED_MIDNIGHT: ThemePalette = {
  id: 'oled-midnight',
  name: 'OLED Midnight Black',
  type: 'dark',
  colors: {
    bgBase: '#050508',
    bgPanel: '#0f0f17',
    bgInset: '#171724',
    bgCard: '#12121c',
    bgCardHover: 'rgba(6, 182, 212, 0.12)',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#475569',
    textAccent: '#06b6d4',
    accentPrimary: '#06b6d4',     // Cyan Glow accent
    accentHover: '#22d3ee',
    accentSecondary: '#3b82f6',
    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(6, 182, 212, 0.4)',
  },
};

export const AVAILABLE_THEMES = [PRO_VIDEO_EDITOR_DARK, STUDIO_LIGHT, OLED_MIDNIGHT];

/**
 * Helper function to inject theme CSS variables onto document root
 */
export function applyTheme(theme: ThemePalette) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.setAttribute('data-theme', theme.id);
  if (theme.type === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }

  root.style.setProperty('--theme-bg-base', theme.colors.bgBase);
  root.style.setProperty('--theme-bg-panel', theme.colors.bgPanel);
  root.style.setProperty('--theme-bg-inset', theme.colors.bgInset);
  root.style.setProperty('--theme-bg-card', theme.colors.bgCard);
  root.style.setProperty('--theme-bg-card-hover', theme.colors.bgCardHover);

  root.style.setProperty('--theme-text-light', theme.colors.textPrimary);
  root.style.setProperty('--theme-text-muted', theme.colors.textSecondary);
  root.style.setProperty('--theme-text-dark', theme.colors.textMuted);
  root.style.setProperty('--theme-text-accent', theme.colors.textAccent);

  root.style.setProperty('--theme-accent-primary', theme.colors.accentPrimary);
  root.style.setProperty('--theme-accent-hover', theme.colors.accentHover);
  root.style.setProperty('--theme-accent-secondary', theme.colors.accentSecondary);
  root.style.setProperty('--theme-border', theme.colors.border);
  root.style.setProperty('--theme-border-hover', theme.colors.borderHover);
}
