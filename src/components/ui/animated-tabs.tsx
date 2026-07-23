'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface AnimatedTabsProps {
  tabs: TabItem[];
  value: string | null;
  onValueChange: (value: string | null) => void;
  variant?: 'underline' | 'pill' | 'segment';
  className?: string;
}

export function AnimatedTabs({
  tabs,
  value,
  onValueChange,
  variant = 'segment',
  className = '',
}: AnimatedTabsProps) {
  const handleTabClick = (tabId: string) => {
    // If clicking the active tab, toggle it closed (set to null)
    if (value === tabId) {
      onValueChange(null);
    } else {
      onValueChange(tabId);
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Editor controls"
      className={`animated-tabs-container variant-${variant} ${className}`}
      style={{
        display: 'flex',
        position: 'relative',
        background: 'transparent',
        borderRadius: '9999px',
        padding: '2px',
        gap: '2px',
        userSelect: 'none',
      }}
    >
      {tabs.map((tab) => {
        const isActive = value === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => handleTabClick(tab.id)}
            className={`animated-tab-btn ${isActive ? 'active' : ''}`}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: isActive ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              position: 'relative',
              borderRadius: '9999px',
              outline: 'none',
              transition: 'color 0.2s ease',
              zIndex: 1,
            }}
          >
            {/* Sliding Indicator Background */}
            {isActive && (
              <motion.div
                layoutId="active-tab-indicator"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.06)',
                  borderRadius: '9999px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  zIndex: -1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}

            {tab.icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
