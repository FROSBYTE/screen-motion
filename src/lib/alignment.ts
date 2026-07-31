import type { AlignmentGuide, ElementBounds3D, SnapResult } from '@/types';

export interface OverlayElementRef {
  id: string;
  position: [number, number, number];
  domElement: HTMLElement | null;
}

/**
 * Converts screen/DOM dimensions and 3D positions into 3D bounding boxes.
 */
export function getElementBounds3D(
  id: string,
  position: [number, number, number],
  domElement: HTMLElement | null,
  containerWidthPx: number,
  containerHeightPx: number
): ElementBounds3D {
  const aspect = containerHeightPx > 0 ? containerWidthPx / containerHeightPx : 1.777;
  const viewHeight = 3.3;
  const viewWidth = 3.3 * aspect;

  const rect = domElement ? domElement.getBoundingClientRect() : { width: 100, height: 40 };
  const width3D = (rect.width * viewWidth) / containerWidthPx;
  const height3D = (rect.height * viewHeight) / containerHeightPx;

  const x = position[0];
  const y = position[1];
  const hw = width3D / 2;
  const hh = height3D / 2;

  return {
    id,
    x,
    y,
    width3D,
    height3D,
    left: x - hw,
    right: x + hw,
    top: y + hh,
    bottom: y - hh,
  };
}

/**
 * Calculates snapped position [x, y] and active alignment guidelines for dragging elements.
 */
export function calculateSnapPosition(
  activeId: string,
  rawX: number,
  rawY: number,
  activeWidthPx: number,
  activeHeightPx: number,
  otherElements: ElementBounds3D[],
  containerWidthPx: number,
  containerHeightPx: number,
  snapThresholdPx: number = 7
): SnapResult {
  const aspect = containerHeightPx > 0 ? containerWidthPx / containerHeightPx : 1.777;
  const viewHeight = 3.3;
  const viewWidth = 3.3 * aspect;

  const thresholdX = (snapThresholdPx * viewWidth) / containerWidthPx;
  const thresholdY = (snapThresholdPx * viewHeight) / containerHeightPx;

  const hw = ((activeWidthPx * viewWidth) / containerWidthPx) / 2;
  const hh = ((activeHeightPx * viewHeight) / containerHeightPx) / 2;

  let snappedX = rawX;
  let snappedY = rawY;

  const guides: AlignmentGuide[] = [];

  // ----------------------------------------------------
  // 1. X-AXIS SNAPPING (Vertical Guidelines)
  // ----------------------------------------------------
  interface CandidateX {
    targetX: number;
    newActiveX: number;
    dist: number;
    snapType: 'canvas-center' | 'element-center' | 'element-edge';
    label: string;
  }

  const candidateXs: CandidateX[] = [];

  // Canvas Horizontal Center (X = 0)
  const canvasCenterX = 0;
  // Center to Center
  if (Math.abs(rawX - canvasCenterX) <= thresholdX) {
    candidateXs.push({
      targetX: canvasCenterX,
      newActiveX: canvasCenterX,
      dist: Math.abs(rawX - canvasCenterX),
      snapType: 'canvas-center',
      label: 'Canvas Center X',
    });
  }
  // Left to Canvas Center
  if (Math.abs((rawX - hw) - canvasCenterX) <= thresholdX) {
    candidateXs.push({
      targetX: canvasCenterX,
      newActiveX: canvasCenterX + hw,
      dist: Math.abs((rawX - hw) - canvasCenterX),
      snapType: 'canvas-center',
      label: 'Left Edge to Canvas Center',
    });
  }
  // Right to Canvas Center
  if (Math.abs((rawX + hw) - canvasCenterX) <= thresholdX) {
    candidateXs.push({
      targetX: canvasCenterX,
      newActiveX: canvasCenterX - hw,
      dist: Math.abs((rawX + hw) - canvasCenterX),
      snapType: 'canvas-center',
      label: 'Right Edge to Canvas Center',
    });
  }

  // Inter-Element Alignments (X)
  for (const elem of otherElements) {
    if (elem.id === activeId) continue;

    // Center to Center
    const distCenter = Math.abs(rawX - elem.x);
    if (distCenter <= thresholdX) {
      candidateXs.push({
        targetX: elem.x,
        newActiveX: elem.x,
        dist: distCenter,
        snapType: 'element-center',
        label: 'Center Alignment',
      });
    }

    // Left to Left
    const distLeftLeft = Math.abs((rawX - hw) - elem.left);
    if (distLeftLeft <= thresholdX) {
      candidateXs.push({
        targetX: elem.left,
        newActiveX: elem.left + hw,
        dist: distLeftLeft,
        snapType: 'element-edge',
        label: 'Left Edge Alignment',
      });
    }

    // Right to Right
    const distRightRight = Math.abs((rawX + hw) - elem.right);
    if (distRightRight <= thresholdX) {
      candidateXs.push({
        targetX: elem.right,
        newActiveX: elem.right - hw,
        dist: distRightRight,
        snapType: 'element-edge',
        label: 'Right Edge Alignment',
      });
    }

    // Left to Right
    const distLeftRight = Math.abs((rawX - hw) - elem.right);
    if (distLeftRight <= thresholdX) {
      candidateXs.push({
        targetX: elem.right,
        newActiveX: elem.right + hw,
        dist: distLeftRight,
        snapType: 'element-edge',
        label: 'Edge Snapped',
      });
    }

    // Right to Left
    const distRightLeft = Math.abs((rawX + hw) - elem.left);
    if (distRightLeft <= thresholdX) {
      candidateXs.push({
        targetX: elem.left,
        newActiveX: elem.left - hw,
        dist: distRightLeft,
        snapType: 'element-edge',
        label: 'Edge Snapped',
      });
    }
  }

  if (candidateXs.length > 0) {
    candidateXs.sort((a, b) => a.dist - b.dist);
    const bestX = candidateXs[0];
    snappedX = bestX.newActiveX;

    const leftPercent = 50 + (bestX.targetX / viewWidth) * 100;
    guides.push({
      id: `v-${bestX.targetX.toFixed(3)}`,
      type: 'vertical',
      positionPercent: leftPercent,
      snapType: bestX.snapType,
      label: bestX.label,
    });
  }

  // ----------------------------------------------------
  // 2. Y-AXIS SNAPPING (Horizontal Guidelines)
  // ----------------------------------------------------
  interface CandidateY {
    targetY: number;
    newActiveY: number;
    dist: number;
    snapType: 'canvas-center' | 'element-center' | 'element-edge';
    label: string;
  }

  const candidateYs: CandidateY[] = [];

  // Canvas Vertical Middle (Y = 0)
  const canvasCenterY = 0;
  if (Math.abs(rawY - canvasCenterY) <= thresholdY) {
    candidateYs.push({
      targetY: canvasCenterY,
      newActiveY: canvasCenterY,
      dist: Math.abs(rawY - canvasCenterY),
      snapType: 'canvas-center',
      label: 'Canvas Middle Y',
    });
  }
  if (Math.abs((rawY + hh) - canvasCenterY) <= thresholdY) {
    candidateYs.push({
      targetY: canvasCenterY,
      newActiveY: canvasCenterY - hh,
      dist: Math.abs((rawY + hh) - canvasCenterY),
      snapType: 'canvas-center',
      label: 'Top Edge to Canvas Middle',
    });
  }
  if (Math.abs((rawY - hh) - canvasCenterY) <= thresholdY) {
    candidateYs.push({
      targetY: canvasCenterY,
      newActiveY: canvasCenterY + hh,
      dist: Math.abs((rawY - hh) - canvasCenterY),
      snapType: 'canvas-center',
      label: 'Bottom Edge to Canvas Middle',
    });
  }

  // Inter-Element Alignments (Y)
  for (const elem of otherElements) {
    if (elem.id === activeId) continue;

    // Center to Center
    const distCenter = Math.abs(rawY - elem.y);
    if (distCenter <= thresholdY) {
      candidateYs.push({
        targetY: elem.y,
        newActiveY: elem.y,
        dist: distCenter,
        snapType: 'element-center',
        label: 'Center Alignment',
      });
    }

    // Top to Top
    const distTopTop = Math.abs((rawY + hh) - elem.top);
    if (distTopTop <= thresholdY) {
      candidateYs.push({
        targetY: elem.top,
        newActiveY: elem.top - hh,
        dist: distTopTop,
        snapType: 'element-edge',
        label: 'Top Edge Alignment',
      });
    }

    // Bottom to Bottom
    const distBottomBottom = Math.abs((rawY - hh) - elem.bottom);
    if (distBottomBottom <= thresholdY) {
      candidateYs.push({
        targetY: elem.bottom,
        newActiveY: elem.bottom + hh,
        dist: distBottomBottom,
        snapType: 'element-edge',
        label: 'Bottom Edge Alignment',
      });
    }

    // Top to Bottom
    const distTopBottom = Math.abs((rawY + hh) - elem.bottom);
    if (distTopBottom <= thresholdY) {
      candidateYs.push({
        targetY: elem.bottom,
        newActiveY: elem.bottom - hh,
        dist: distTopBottom,
        snapType: 'element-edge',
        label: 'Edge Snapped',
      });
    }

    // Bottom to Top
    const distBottomTop = Math.abs((rawY - hh) - elem.top);
    if (distBottomTop <= thresholdY) {
      candidateYs.push({
        targetY: elem.top,
        newActiveY: elem.top + hh,
        dist: distBottomTop,
        snapType: 'element-edge',
        label: 'Edge Snapped',
      });
    }
  }

  if (candidateYs.length > 0) {
    candidateYs.sort((a, b) => a.dist - b.dist);
    const bestY = candidateYs[0];
    snappedY = bestY.newActiveY;

    // Top percent: 50 - (targetY / viewHeight) * 100
    const topPercent = 50 - (bestY.targetY / viewHeight) * 100;
    guides.push({
      id: `h-${bestY.targetY.toFixed(3)}`,
      type: 'horizontal',
      positionPercent: topPercent,
      snapType: bestY.snapType,
      label: bestY.label,
    });
  }

  return {
    x: snappedX,
    y: snappedY,
    guides,
  };
}
