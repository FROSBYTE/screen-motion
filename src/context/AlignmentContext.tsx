'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { AlignmentGuide } from '@/types';

interface AlignmentContextValue {
  activeGuides: AlignmentGuide[];
  setActiveGuides: (guides: AlignmentGuide[]) => void;
  clearGuides: () => void;
}

const AlignmentContext = createContext<AlignmentContextValue | null>(null);

export function AlignmentProvider({ children }: { children: ReactNode }) {
  const [activeGuides, setActiveGuides] = useState<AlignmentGuide[]>([]);

  const clearGuides = () => {
    setActiveGuides((prev) => (prev.length > 0 ? [] : prev));
  };

  return (
    <AlignmentContext.Provider value={{ activeGuides, setActiveGuides, clearGuides }}>
      {children}
    </AlignmentContext.Provider>
  );
}

export function useAlignmentGuides() {
  const ctx = useContext(AlignmentContext);
  if (!ctx) {
    return {
      activeGuides: [],
      setActiveGuides: () => {},
      clearGuides: () => {},
    };
  }
  return ctx;
}
