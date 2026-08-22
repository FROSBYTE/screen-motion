import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a clean, numbered duplicate name (e.g., "Scene 1 (1)", "Scene 1 (2)").
 * Strips legacy "(Copy)" and existing numeric "(N)" suffixes to prevent chained "(Copy) (Copy)" or "(1) (1)".
 *
 * @param originalName The source item's name (e.g. "Scene 1", "Scene 1 (Copy)", "Scene 1 (1)")
 * @param existingNames Array of existing item names to prevent duplicate collisions
 * @returns Numbered duplicate name (e.g. "Scene 1 (1)", "Scene 1 (2)")
 */
export function getDuplicateName(originalName: string, existingNames: string[] = []): string {
  const raw = (originalName || '').trim();
  // Strip trailing "(Copy)", "(Copy 1)", "(1)", "(2)", etc. (also tolerant of unclosed '(' like "(Copy")
  const baseName = raw.replace(/(?:\s*\((?:Copy(?:\s*\d+)?|\d+)\)?)+$/i, '').trim() || raw || 'Scene';

  const nameSet = new Set(existingNames.map((n) => (n || '').trim().toLowerCase()));

  let counter = 1;
  while (nameSet.has(`${baseName} (${counter})`.toLowerCase())) {
    counter++;
  }
  return `${baseName} (${counter})`;
}
