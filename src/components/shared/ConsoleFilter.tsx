'use client';


// Suppress three.js deprecation, shader compiler info logs & HMR development warnings
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('THREE.Clock: This module has been deprecated.') ||
       message.includes('THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated.') ||
       message.includes('THREE.WebGLProgram: Program Info Log:') ||
       message.includes('warning X4122:') ||
       message.includes('cannot be represented accurately in double precision') ||
       message.includes('Unexpected import of module') ||
       message.includes('deleted by an HMR update'))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

export default function ConsoleFilter() {
  return null;
}
