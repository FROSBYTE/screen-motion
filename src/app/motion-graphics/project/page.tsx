'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MotionGraphicsProvider } from '../store';
import { AlignmentProvider } from '@/context/AlignmentContext';
import { MotionGraphicsStudioContent } from '../page';

function ProjectContent() {
  const id = useSearchParams().get('id') ?? undefined;

  return (
    <MotionGraphicsProvider projectId={id}>
      <AlignmentProvider>
        <MotionGraphicsStudioContent />
      </AlignmentProvider>
    </MotionGraphicsProvider>
  );
}

export default function MotionGraphicsProjectPage() {
  return (
    <Suspense fallback={null}>
      <ProjectContent />
    </Suspense>
  );
}
