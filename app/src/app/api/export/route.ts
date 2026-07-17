import { NextRequest, NextResponse } from 'next/server';

// POST /api/export
// In MVP, export is handled client-side (frame capture → download).
// This route exists as a placeholder for the backend FFmpeg pipeline.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resolution, template, orientation, device, speed, scene } = body;

    // Validate required fields
    if (!resolution || !template || !orientation || !device) {
      return NextResponse.json(
        { error: 'Missing required fields: resolution, template, orientation, device' },
        { status: 400 }
      );
    }

    // For MVP: return a response acknowledging the export request
    // In production, this would:
    // 1. Receive frame data (base64 images) from the frontend
    // 2. Use FFmpeg to encode them into an MP4
    // 3. Return a signed download URL

    return NextResponse.json({
      status: 'accepted',
      message: 'Export request received. Client-side export will be used in MVP.',
      config: {
        resolution,
        template,
        orientation,
        device,
        speed,
        scene,
        codec: 'H.264',
        fps: 30,
        format: 'mp4',
      },
    });
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Export failed. Please try again or refresh the page.' },
      { status: 500 }
    );
  }
}

// GET /api/export — health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'MockCraft Export API',
    version: '1.0.0',
    supportedResolutions: ['1080p', '4k'],
    supportedFormats: ['mp4'],
  });
}
