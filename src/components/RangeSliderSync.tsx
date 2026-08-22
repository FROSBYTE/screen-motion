'use client';

import { useEffect } from 'react';

/**
 * Automatically updates `--range-fill` on all HTML <input type="range"> sliders
 * so that the left (filled) side is pure white and the right (non-filled) side is pitch black.
 */
export default function RangeSliderSync() {
  useEffect(() => {
    const updateSlider = (el: HTMLInputElement) => {
      const min = parseFloat(el.min) || 0;
      const max = parseFloat(el.max) || 100;
      const val = parseFloat(el.value) || 0;
      const range = max - min;
      const pct = range <= 0 ? 0 : Math.max(0, Math.min(100, ((val - min) / range) * 100));
      el.style.setProperty('--range-fill', `${pct}%`);
    };

    const updateAll = () => {
      document.querySelectorAll<HTMLInputElement>('input[type="range"]').forEach(updateSlider);
    };

    // Initial update
    updateAll();

    // Listen to all input events globally
    const handleInput = (e: Event) => {
      if (e.target instanceof HTMLInputElement && e.target.type === 'range') {
        updateSlider(e.target);
      }
    };

    window.addEventListener('input', handleInput, { passive: true });
    window.addEventListener('change', handleInput, { passive: true });

    // Mutation observer for dynamically rendered panels / sidebars
    const observer = new MutationObserver(() => {
      updateAll();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['value', 'min', 'max'],
    });

    return () => {
      window.removeEventListener('input', handleInput);
      window.removeEventListener('change', handleInput);
      observer.disconnect();
    };
  }, []);

  return null;
}
