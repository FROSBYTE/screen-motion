'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

export interface DropdownItem {
  id: string | number;
  label: string;
  icon?: React.ReactNode;
  fontFamily?: string;
}

export interface BasicDropdownProps {
  items: DropdownItem[];
  value?: string | number;
  onChange?: (value: any) => void;
  label?: string;
  placeholder?: string;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  dropdownStyle?: React.CSSProperties;
  disabled?: boolean;
}

const DROPDOWN_OFFSET = 4;
const ROTATION_ANGLE_OPEN = 180;

export default function BasicDropdown({
  items,
  value,
  onChange,
  label,
  placeholder = 'Select...',
  compact = false,
  className = '',
  style,
  buttonStyle,
  dropdownStyle,
  disabled = false,
}: BasicDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [position, setPosition] = useState({ left: 0, top: 0, width: 0, isAbove: false });
  const [mounted, setMounted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const selectedItem = items.find((item) => String(item.id) === String(value));

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = Math.min(260, items.length * (compact ? 32 : 38) + 16);
    const spaceBelow = window.innerHeight - rect.bottom;
    const isAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    setPosition({
      left: Math.max(8, Math.min(window.innerWidth - rect.width - 8, rect.left)),
      top: isAbove ? rect.top - DROPDOWN_OFFSET : rect.bottom + DROPDOWN_OFFSET,
      width: Math.max(rect.width, compact ? 82 : 120),
      isAbove,
    });
  }, [items.length, compact]);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  const handleItemSelect = (item: DropdownItem) => {
    setIsOpen(false);
    setFocusedIndex(-1);
    onChange?.(item.id);
  };

  // Keep position accurate during scroll or resize
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        portalRef.current &&
        !portalRef.current.contains(target)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) {
        if ((event.key === 'Enter' || event.key === ' ') && document.activeElement === buttonRef.current) {
          event.preventDefault();
          handleToggle();
        }
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setFocusedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
      } else if (event.key === 'Enter' && focusedIndex >= 0) {
        event.preventDefault();
        const item = items[focusedIndex];
        if (item) {
          handleItemSelect(item);
        }
      } else if (event.key === 'Home') {
        event.preventDefault();
        setFocusedIndex(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        setFocusedIndex(items.length - 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, focusedIndex]);

  // Scroll focused element into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const children = listRef.current.children;
      if (children[focusedIndex]) {
        (children[focusedIndex] as HTMLElement).scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex]);

  const dropdownContent = (
    <AnimatePresence>
      {isOpen ? (
        <div ref={portalRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999 }}>
          <motion.div
            initial={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 0, scaleY: 0.85, y: position.isAbove ? 10 : -10 }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, scaleY: 1, y: 0 }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scaleY: 0.85, y: position.isAbove ? 10 : -10, transition: { duration: 0.15 } }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: 'spring', damping: 25, stiffness: 350 }
            }
            style={{
              position: 'fixed',
              left: `${position.left}px`,
              top: position.isAbove ? 'auto' : `${position.top}px`,
              bottom: position.isAbove ? `${window.innerHeight - position.top}px` : 'auto',
              width: `${position.width}px`,
              minWidth: `${position.width}px`,
              maxWidth: `${position.width}px`,
              transformOrigin: position.isAbove ? 'bottom' : 'top',
              pointerEvents: 'auto',
              backgroundColor: '#FFFFFF',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              borderRadius: '8px',
              boxShadow: '0 16px 48px -8px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.05)',
              padding: '4px',
              maxHeight: '260px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              ...dropdownStyle,
            }}
          >
            <ul
              ref={listRef}
              role="listbox"
              aria-label={label || 'Dropdown options'}
              style={{
                margin: 0,
                padding: '2px',
                listStyle: 'none',
                maxHeight: '252px',
                overflowY: 'auto',
                overflowX: 'hidden',
                width: '100%',
                boxSizing: 'border-box',
                scrollbarGutter: 'stable',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(15, 23, 42, 0.15) transparent',
              }}
            >
              {items.map((item, index) => {
                const isSelected = String(selectedItem?.id) === String(item.id);
                const isFocused = index === focusedIndex;

                return (
                  <motion.li
                    key={String(item.id)}
                    role="option"
                    aria-selected={isSelected}
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -6 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.12, delay: index * 0.012 }}
                    style={{ listStyle: 'none', margin: '1px 0', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}
                  >
                    <button
                      type="button"
                      onClick={() => handleItemSelect(item)}
                      onMouseEnter={() => setFocusedIndex(index)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: compact ? '5px 8px' : '7px 10px',
                        fontSize: compact ? '11px' : '12.5px',
                        fontWeight: isSelected ? 700 : 500,
                        fontFamily: item.fontFamily || '"Plus Jakarta Sans", sans-serif',
                        color: isSelected ? '#0F172A' : isFocused ? '#0F172A' : '#334155',
                        backgroundColor: isSelected
                          ? '#FFFDE6'
                          : isFocused
                          ? '#F4F5EE'
                          : 'transparent',
                        border: isSelected ? '1px solid #FF9137' : '1px solid transparent',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.12s ease, color 0.12s ease, border-color 0.12s ease',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        {item.icon && <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{item.icon}</span>}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.label}
                        </span>
                      </span>

                      {isSelected && (
                        <motion.span
                          initial={shouldReduceMotion ? {} : { scale: 0 }}
                          animate={shouldReduceMotion ? {} : { scale: 1 }}
                          style={{
                            marginLeft: '8px',
                            color: '#FF9137',
                            display: 'flex',
                            alignItems: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Check size={compact ? 12 : 14} strokeWidth={2.5} />
                        </motion.span>
                      )}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div
      ref={dropdownRef}
      className={className}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={handleToggle}
        className="mg-btn-interactive"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          width: '100%',
          padding: compact ? '6px 8px' : '7px 10px',
          fontSize: compact ? '11px' : '12px',
          fontWeight: 600,
          color: selectedItem ? '#0F172A' : '#64748B',
          backgroundColor: '#FFFFFF',
          border: isOpen ? '1px solid #FF9137' : '1px solid rgba(15, 23, 42, 0.12)',
          borderRadius: '6px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          fontFamily: selectedItem?.fontFamily || '"Plus Jakarta Sans", sans-serif',
          transition: 'all 0.15s ease',
          outline: 'none',
          boxSizing: 'border-box',
          ...buttonStyle,
        }}
        onMouseEnter={(e) => {
          if (!isOpen && !disabled) e.currentTarget.style.borderColor = '#FF9137';
        }}
        onMouseLeave={(e) => {
          if (!isOpen && !disabled) e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.12)';
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            textAlign: 'left',
          }}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? ROTATION_ANGLE_OPEN : 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: isOpen ? '#FF9137' : '#64748B' }}
        >
          <ChevronDown size={compact ? 12 : 14} />
        </motion.div>
      </button>

      {mounted && typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
    </div>
  );
}
