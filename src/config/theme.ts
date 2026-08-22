/**
 * Video Editor & Motion Graphics Theme Palette Configuration
 * 
 * Centralized color tokens for Pitch Black & White (#000000 & #FFFFFF) Monochrome design system.
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
 * Pitch Black & Pure White Monochrome Theme (Default)
 */
export const PITCH_BLACK_MONO: ThemePalette = {
  id: 'pitch-black',
  name: 'Pitch Black & White (Default)',
  type: 'dark',
  colors: {
    bgBase: '#000000',          // True Pitch Black OLED
    bgPanel: '#0a0a0a',         // Deep dark surface
    bgInset: '#141414',         // Recessed control background
    bgCard: '#0d0d0d',          // Card container background
    bgCardHover: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#FFFFFF',      // High-contrast pure white
    textSecondary: '#A1A1AA',    // Slate/Zinc light gray
    textMuted: '#71717A',       // Neutral muted text
    textAccent: '#FFFFFF',      // White accent
    accentPrimary: '#FFFFFF',    // Pure White primary CTA
    accentHover: '#E4E4E7',      // Soft off-white hover
    accentSecondary: '#27272A',  // Subtle gray secondary accent
    border: 'rgba(255, 255, 255, 0.12)', // Clean hairline border
    borderHover: 'rgba(255, 255, 255, 0.35)', // Crisp glow on hover
  },
};

export const PRO_VIDEO_EDITOR_DARK = PITCH_BLACK_MONO;

export const AVAILABLE_THEMES = [PITCH_BLACK_MONO];

/**
 * Helper function to inject theme CSS variables onto document root
 */
export function applyTheme(theme: ThemePalette = PITCH_BLACK_MONO) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.setAttribute('data-theme', theme.id);
  root.classList.add('dark');
  root.classList.remove('light');

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
