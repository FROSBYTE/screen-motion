'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { MotionGraphicsProvider } from '../store';
import { AlignmentProvider } from '@/context/AlignmentContext';
import { MotionGraphicsStudioContent } from '../page';

export default function MotionGraphicsProjectPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;

  return (
    <MotionGraphicsProvider projectId={id}>
      <AlignmentProvider>
        <MotionGraphicsStudioContent />
      </AlignmentProvider>
    </MotionGraphicsProvider>
  );
}
