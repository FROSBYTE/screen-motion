"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ROTATION_ANGLE_OPEN = 180;
const DROPDOWN_OFFSET = 4;

export interface DropdownItem {
  icon?: React.ReactNode;
  id: string | number;
  label: string;
}

export interface BasicDropdownProps {
  className?: string;
  items: DropdownItem[];
  label: string;
  value?: string | number;
  onChange?: (item: DropdownItem) => void;
}

export default function BasicDropdown({
  label,
  items,
  value,
  onChange,
  className = "",
}: BasicDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localSelectedItem, setLocalSelectedItem] = useState<DropdownItem | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const shouldReduceMotion = useReducedMotion();

  const selectedItem = value !== undefined
    ? items.find((item) => item.id === value) || null
    : localSelectedItem;

  const handleItemSelect = (item: DropdownItem) => {
    setLocalSelectedItem(item);
    setIsOpen(false);
    onChange?.(item);
  };

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + DROPDOWN_OFFSET,
        left: rect.left,
        width: rect.width,
      });
    }
    setIsOpen(!isOpen);
  };

  // Update position on scroll/resize when open
  useEffect(() => {
    if (!(isOpen && buttonRef.current)) {
      return;
    }

    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + DROPDOWN_OFFSET,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  // Close dropdown when clicking outside
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
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) {
        // Open dropdown on Enter or Space when button is focused
        if (
          (event.key === "Enter" || event.key === " ") &&
          document.activeElement === buttonRef.current
        ) {
          event.preventDefault();
          handleToggle();
        }
        return;
      }

      if (event.key === "Escape") {
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setFocusedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
      } else if (event.key === "Enter" && focusedIndex >= 0) {
        event.preventDefault();
        const item = items[focusedIndex];
        if (item) {
          handleItemSelect(item);
        }
      } else if (event.key === "Home") {
        event.preventDefault();
        setFocusedIndex(0);
      } else if (event.key === "End") {
        event.preventDefault();
        setFocusedIndex(items.length - 1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // biome-ignore lint/correctness/useExhaustiveDependencies: Handlers are stable via closure
  }, [isOpen, items, focusedIndex, handleItemSelect, handleToggle]);

  // Reset focused index when items change
  useEffect(() => {
    setFocusedIndex(-1);
  }, []);

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <div ref={portalRef} style={{ zIndex: 9999, position: 'fixed' }}>
          <motion.div
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scaleY: 1 }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : {
                    opacity: 0,
                    y: -10,
                    scaleY: 0.8,
                    transition: { duration: 0.15 },
                  }
            }
            initial={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 0, y: -10, scaleY: 0.8 }
            }
            style={{
              position: 'fixed',
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
              zIndex: 9999,
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              transformOrigin: 'top',
              fontFamily: '"Google Sans", sans-serif',
              boxSizing: 'border-box',
            }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: "spring" as const, bounce: 0.1, duration: 0.25 }
            }
          >
            <ul
              aria-label="Dropdown options"
              style={{
                listStyle: 'none',
                padding: '4px 0',
                margin: 0,
                maxHeight: '240px',
                overflowY: 'auto',
              }}
              id="dropdown-items"
            >
              {items.map((item, index) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <motion.li
                    animate={
                      shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }
                    }
                    aria-selected={isSelected || index === focusedIndex}
                    exit={
                      shouldReduceMotion
                        ? { opacity: 0, transition: { duration: 0 } }
                        : { opacity: 0, x: -10 }
                    }
                    initial={
                      shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -10 }
                    }
                    key={item.id}
                    role="option"
                    style={{ listStyle: 'none', margin: 0, padding: 0 }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : {
                            type: "spring" as const,
                            stiffness: 300,
                            damping: 30,
                            duration: 0.2,
                          }
                    }
                  >
                    <button
                      aria-label={item.label}
                      onClick={() => handleItemSelect(item)}
                      onMouseEnter={() => setFocusedIndex(index)}
                      type="button"
                      style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        border: 'none',
                        background: index === focusedIndex ? 'rgba(0,0,0,0.04)' : 'transparent',
                        color: isSelected ? 'var(--text-accent)' : 'var(--text-primary)',
                        fontWeight: isSelected ? '600' : 'normal',
                        fontSize: '12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                        fontFamily: 'inherit',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.icon && <span>{item.icon}</span>}
                        {item.label}
                      </span>
                      {isSelected && (
                        <svg
                          style={{ width: '14px', height: '14px', color: 'var(--text-accent)' }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M5 13l4 4L19 7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                          />
                        </svg>
                      )}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div className={`relative inline-block ${className}`} ref={dropdownRef} style={{ width: '100%' }}>
        <button
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={selectedItem ? `${label}: ${selectedItem.label}` : label}
          onClick={handleToggle}
          ref={buttonRef}
          type="button"
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            padding: '8px 12px',
            fontSize: '12px',
            textAlign: 'left',
            cursor: 'pointer',
            fontFamily: '"Google Sans", sans-serif',
            boxSizing: 'border-box'
          }}
        >
          <span className="block truncate" style={{ color: 'var(--text-primary)' }}>
            {selectedItem ? selectedItem.label : label}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? ROTATION_ANGLE_OPEN : 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <ChevronDown className="h-3.5 w-3.5" style={{ color: 'var(--text-secondary)' }} />
          </motion.div>
        </button>
      </div>
      {typeof window === "undefined"
        ? null
        : createPortal(dropdownContent, document.body)}
    </>
  );
}
