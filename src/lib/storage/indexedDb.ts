/**
 * Client-side IndexedDB persistence for project drafts, multi-project storage, and binary media assets.
 * Zero-dependency, asynchronous, and supports large media files without memory limits.
 */

const DB_NAME = 'screen_motion_db';
const DB_VERSION = 2;

const STORES = {
  DRAFTS: 'drafts',
  ASSETS: 'assets',
  PROJECTS: 'projects',
} as const;

export interface ProjectDraft<T = any> {
  version: number;
  timestamp: number;
  data: T;
  assetIds?: string[];
}

export interface StoredAsset {
  id: string;
  blob: Blob;
  mimeType: string;
  name?: string;
  updatedAt: number;
}

export interface MGProjectSummary {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  sceneCount: number;
  layerCount: number;
  duration: number;
  thumbnailBg?: string;
}

export interface MGProjectData {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  scenes: any[];
  assetIds?: string[];
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is only available in browser environment.'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORES.DRAFTS)) {
        db.createObjectStore(STORES.DRAFTS);
      }
      if (!db.objectStoreNames.contains(STORES.ASSETS)) {
        db.createObjectStore(STORES.ASSETS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
        db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

// ----------------- DRAFTS STORE (Single-key / 3D Editor) -----------------

export async function saveDraft<T>(key: string, data: T, assetIds?: string[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.DRAFTS, 'readwrite');
    const store = tx.objectStore(STORES.DRAFTS);
    const draft: ProjectDraft<T> = {
      version: 1,
      timestamp: Date.now(),
      data,
      assetIds,
    };
    const req = store.put(draft, key);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function loadDraft<T>(key: string): Promise<ProjectDraft<T> | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.DRAFTS, 'readonly');
    const store = tx.objectStore(STORES.DRAFTS);
    const req = store.get(key);

    req.onsuccess = () => {
      resolve((req.result as ProjectDraft<T>) || null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearDraft(key: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.DRAFTS, 'readwrite');
    const store = tx.objectStore(STORES.DRAFTS);
    const req = store.delete(key);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ----------------- MULTI-PROJECTS STORE (Motion Graphics) -----------------

function generateProjectId(): string {
  return `mg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * List all motion graphics projects with metadata summary, sorted newest first.
 */
export async function listProjects(): Promise<MGProjectSummary[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PROJECTS, 'readonly');
    const store = tx.objectStore(STORES.PROJECTS);
    const req = store.getAll();

    req.onsuccess = () => {
      const items: MGProjectData[] = req.result || [];
      const summaries: MGProjectSummary[] = items.map((p) => {
        let totalDuration = 0;
        let layerCount = 0;
        let thumbnailBg = '#0f0f0f';

        if (Array.isArray(p.scenes)) {
          p.scenes.forEach((s) => {
            if (s.bgColor) thumbnailBg = s.bgColor;
            if (Array.isArray(s.layers)) {
              layerCount += s.layers.length;
              const sceneEnd = Math.max(0, ...s.layers.map((l: any) => (l.startTime || 0) + (l.duration || 0)));
              totalDuration += sceneEnd;
            }
          });
        }

        return {
          id: p.id,
          title: p.title || 'Untitled Project',
          createdAt: p.createdAt || Date.now(),
          updatedAt: p.updatedAt || Date.now(),
          sceneCount: Array.isArray(p.scenes) ? p.scenes.length : 1,
          layerCount,
          duration: totalDuration || 3,
          thumbnailBg,
        };
      });

      summaries.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(summaries);
    };

    req.onerror = () => reject(req.error);
  });
}

/**
 * Get a specific project by ID.
 */
export async function getProject(id: string): Promise<MGProjectData | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PROJECTS, 'readonly');
    const store = tx.objectStore(STORES.PROJECTS);
    const req = store.get(id);

    req.onsuccess = () => {
      resolve((req.result as MGProjectData) || null);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Save / Upsert a project.
 */
export async function saveProject(project: MGProjectData, assetIds?: string[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PROJECTS, 'readwrite');
    const store = tx.objectStore(STORES.PROJECTS);
    const data: MGProjectData = {
      ...project,
      updatedAt: Date.now(),
      assetIds: assetIds || project.assetIds,
    };
    const req = store.put(data);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Create a new empty motion graphics project.
 */
export async function createProject(title: string = 'Untitled Project', initialScenes?: any[]): Promise<MGProjectData> {
  const newProject: MGProjectData = {
    id: generateProjectId(),
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    scenes: initialScenes || [
      {
        id: `scene-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: 'Scene 1',
        bgColor: '#0f0f0f',
        layers: [],
        transition: 'none',
        transitionDuration: 0.5,
      },
    ],
  };

  await saveProject(newProject);
  return newProject;
}

/**
 * Duplicate an existing project.
 */
export async function duplicateProject(id: string): Promise<MGProjectData> {
  const original = await getProject(id);
  if (!original) throw new Error(`Project ${id} not found.`);

  const duplicated: MGProjectData = {
    ...JSON.parse(JSON.stringify(original)),
    id: generateProjectId(),
    title: `${original.title} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await saveProject(duplicated);
  return duplicated;
}

/**
 * Rename an existing project.
 */
export async function renameProject(id: string, newTitle: string): Promise<void> {
  const project = await getProject(id);
  if (!project) return;
  project.title = newTitle;
  project.updatedAt = Date.now();
  await saveProject(project);
}

/**
 * Delete a project by ID.
 */
export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PROJECTS, 'readwrite');
    const store = tx.objectStore(STORES.PROJECTS);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ----------------- ASSETS STORE (Binary Files) -----------------

export async function saveAsset(id: string, blob: Blob, name?: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.ASSETS, 'readwrite');
    const store = tx.objectStore(STORES.ASSETS);
    const asset: StoredAsset = {
      id,
      blob,
      mimeType: blob.type,
      name,
      updatedAt: Date.now(),
    };
    const req = store.put(asset);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAsset(id: string): Promise<Blob | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.ASSETS, 'readonly');
    const store = tx.objectStore(STORES.ASSETS);
    const req = store.get(id);

    req.onsuccess = () => {
      const asset = req.result as StoredAsset | undefined;
      resolve(asset ? asset.blob : null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getAssets(ids: string[]): Promise<Record<string, Blob>> {
  const result: Record<string, Blob> = {};
  if (!ids || ids.length === 0) return result;

  await Promise.all(
    ids.map(async (id) => {
      const blob = await getAsset(id);
      if (blob) {
        result[id] = blob;
      }
    })
  );

  return result;
}

export async function deleteAsset(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.ASSETS, 'readwrite');
    const store = tx.objectStore(STORES.ASSETS);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
