# 3D Mockup Video Generator - MVP Specification

## Product Overview
Build a web-based tool that generates high-quality Android & iOS device mockup 
videos with customizable animations. Users upload a screenshot, select a template 
and orientation (portrait/landscape), customize basic settings, and export an 
MP4 video.

No animation editor. Templates are predefined. Users only tweak parameters.

---

## Core Features (MVP Scope)

### 1. User Workflow
1. **Upload Screenshot** → PNG/JPG file input (max 10MB)
2. **Select Device** → iOS or Android (radio selector)
3. **Choose Orientation** → Portrait or Landscape (toggle)
4. **Select Template** → Dropdown of 3 templates (Orbit, Spin, Hero Reveal)
5. **Customize Settings** → Adjust exposed parameters (speed, BG color, light color)
6. **Preview** → Real-time 60fps 3D preview on loop
7. **Export** → Choose resolution (1080p HD or 4K), then render & download MP4

### 2. Device Models
- **iOS Device:** 1 high-quality GLB model (already acquired)
- **Android Device:** 1 high-quality GLB model (already acquired)
- Device size fixed; only position/rotation changes per orientation
- Screenshot automatically applied as texture to screen mesh

### 3. Orientations
Each template has **portrait and landscape variants**:

**Portrait Mode:**
- Device upright, camera front-facing
- Scene configured for portrait framing
- Specific background gradient/colors

**Landscape Mode:**
- Device rotated 90°, camera side-on
- Scene configured for landscape framing
- Different background gradient/colors
- Orientation swap is **instant** (no transition animation)

### 4. Templates (3 Required)
Each template includes:
- Predefined GSAP animation timeline (camera + device movement)
- Portrait variant (camera position, device rotation, BG, lights)
- Landscape variant (camera position, device rotation, BG, lights)
- Editable parameters (speed, BG color, light color, etc.)

**Template 1: Orbit**
- Camera orbits around the device
- Device slowly rotates on axis
- Duration: 3 seconds

**Template 2: Spin**
- Device spins 360° around vertical axis
- Camera static, slight angle
- Duration: 2.5 seconds

**Template 3: Hero Reveal**
- Camera zooms in from far away
- Device scales up, rotates slightly
- Fade-in effect on screen content
- Duration: 3.5 seconds

### 5. Scene Settings (Global)
These apply to all templates:
- **Background:** Solid color or linear gradient (user-editable)
- **Ambient Light:** Intensity control (0–1)
- **Directional Light:** Color + intensity
- **Rim Light:** Color + intensity (optional glow effect)
- **Shadows:** Strength control (0–1)

### 6. Preview System
- Real-time 3D preview in browser (React Three Fiber)
- Target: 60fps interactive performance
- Preview auto-loops the animation
- Read-only (no camera drag; fixed to template view)
- Orientation toggle updates preview instantly

### 7. Export Pipeline
**Input:**
- Scene config (BG, lights, etc.)
- Template variant (portrait/landscape)
- User settings (speed, colors, etc.)
- Screenshot texture

**Process:**
1. Apply scene settings to Three.js scene
2. Load template animation (GSAP timeline)
3. Apply user customizations (speed scaling, color swaps)
4. Render animation frames to Canvas
5. Encode frames to MP4 using FFmpeg (backend API call)
6. Return download link

**Output:**
- MP4 video (H.264 codec, 30fps)
- Resolutions: 1080p (HD) or 4K (2160p)
- File size: ~5–20MB depending on resolution

**Performance Target:**
- 1080p export: <60 seconds
- 4K export: <3 minutes

### 8. Screenshot Handling
- Users upload PNG/JPG/WEBP (max 10MB)
- Auto-detect orientation (portrait vs. landscape)
- If orientation mismatches selected mode, show warning:
  - *"Portrait screenshot detected for landscape mode — will be cropped. Continue?"*
- Crop or letterbox to fit device screen aspect ratio
- Apply as texture to phone screen mesh

### 9. Error Handling (MVP)
- Invalid file format → "Please upload PNG, JPG, or WEBP"
- File too large → "File must be under 10MB"
- WebGL not supported → "Your browser doesn't support WebGL. Use Chrome or Firefox."
- Export fails → "Export failed. Please try again or refresh the page."
- No retries; user refreshes to restart

### 10. UI/UX
- Clean, minimal interface
- Single-page app (no routing)
- Left panel: Controls (upload, device, orientation, template, settings)
- Right panel: 3D preview
- Bottom: Export button + progress indicator
- Responsive: Desktop only (not mobile)
- Dark mode or light mode (designer's choice)

---

## Technical Requirements

### Frontend (Next.js + React Three Fiber)
- Load GLB phone models with Three.js
- Real-time preview rendering (60fps target)
- GSAP timeline playback with speed control
- Dynamic UI generation from template settings
- Screenshot file upload + validation
- Export UI with resolution selector + progress bar
- API calls to backend `/api/export` endpoint

### Backend (Node.js + FFmpeg)
- REST API endpoint: `/api/export`
- Input: scene config, template, user settings, screenshot (base64)
- Process:
  1. Render animation frames (or receive frame data from frontend)
  2. Encode frames to MP4 using FFmpeg
  3. Return MP4 file or signed download URL
- Timeout: 2 minutes max per export
- Concurrency: Handle 1 export at a time (queue others or reject)

### 3D Assets
- Load phone models from `/public/models/` (GLB format)
- Ensure separate screen mesh for texture mapping
- Optimize geometry (keep poly count <200k per model)

---

## Success Criteria (MVP Done When...)

✅ Users can upload a screenshot
✅ Preview renders in real-time (60fps) on both devices & orientations
✅ All 3 templates animate smoothly in both portrait & landscape
✅ Scene settings (BG, lights) update preview instantly
✅ Export generates MP4 video (1080p: <60s, 4K: <3min)
✅ Video quality looks professional (sharp screen texture, smooth motion)
✅ Tool is deployed and publicly accessible
✅ No crashes or unhandled errors

---

## Out of Scope (Post-MVP)

- Custom animation editor
- Multiple device model variants
- User accounts / project persistence
- Batch exports
- Advanced 3D environment scenes
- Mobile browser support
- Social sharing integration
- Analytics / usage tracking

---

## Estimated Timeline
- **Week 1:** Frontend setup, 3D model integration, preview rendering
- **Week 2:** Template system, GSAP animations (all 3 templates)
- **Week 3:** Backend FFmpeg pipeline, export API
- **Week 4:** Polish, testing, deployment

Total: **~4 weeks** (full-time development)
