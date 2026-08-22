'use client';

import { useEffect, useRef, useState } from 'react';
import { saveDraft } from '@/lib/storage/indexedDb';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions<T> {
  key?: string;
  data: T;
  assetIds?: string[];
  enabled?: boolean;
  debounceMs?: number;
  saveFn?: () => Promise<void>;
  onSave?: () => void;
  onError?: (err: any) => void;
}

export function useAutoSave<T>({
  key,
  data,
  assetIds,
  enabled = true,
  debounceMs = 600,
  saveFn,
  onSave,
  onError,
}: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const isFirstRender = useRef(true);
  const dataRef = useRef(data);
  dataRef.current = data;
  const assetIdsRef = useRef(assetIds);
  assetIdsRef.current = assetIds;
  const saveFnRef = useRef(saveFn);
  saveFnRef.current = saveFn;

  useEffect(() => {
    // Skip the very first render to prevent overwriting stored data before hydration
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled) return;

    setStatus('saving');

    const timer = setTimeout(async () => {
      try {
        if (saveFnRef.current) {
          await saveFnRef.current();
        } else if (key) {
          await saveDraft(key, dataRef.current, assetIdsRef.current);
        }
        setStatus('saved');
        onSave?.();
      } catch (err) {
        console.error(`[useAutoSave] Failed to save draft:`, err);
        setStatus('error');
        onError?.(err);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [key, data, assetIds, enabled, debounceMs, onSave, onError]);

  return { status, setStatus };
}
