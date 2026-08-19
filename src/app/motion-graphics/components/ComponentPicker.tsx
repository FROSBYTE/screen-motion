'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Film, Image as ImageIcon } from 'lucide-react';
import { COMPONENT_TEMPLATES, ComponentTemplateName } from './templates';
import { MGTextAnimationType } from '../store';
import CountUp from './templates/CountUp';
import AnimatedList from './templates/AnimatedList';
import LogoLoop from './templates/LogoLoop';
import AILoader from './templates/AILoader';
import BubbleMenu from './templates/BubbleMenu';
import Folder from './templates/Folder';
import UnlumenAnimatedList from './templates/UnlumenAnimatedList';
import WordRotate from './templates/WordRotate';
import Highlighter from './templates/Highlighter';
import AnimatedBeam from './templates/AnimatedBeam';
import OrbitingCircles from './templates/OrbitingCircles';
import TextReveal from './templates/TextReveal';
import SkeletonShimmer from './templates/SkeletonShimmer';
import Text3DFlip from './templates/Text3DFlip';
import PhoneDevice from './templates/PhoneDevice';
import VideoUpload from './templates/VideoUpload';
import DiaTextReveal from './templates/DiaTextReveal';
import DiaTextRevealUI from '@/components/ui/dia-text-reveal';
import BottomUpLetters from '@/components/smoothui/bottom-up-letters';
import KineticCenterBuild from '@/components/smoothui/kinetic-center-build';
import LineByLineSlide from '@/components/smoothui/line-by-line-slide';
import MaskRevealUp from '@/components/smoothui/mask-reveal-up';
import RevealText from '@/components/smoothui/reveal-text';
import ShortSlideDown from '@/components/smoothui/short-slide-down';
import BlurOutUp from '@/components/smoothui/blur-out-up';
import DepthParallaxWords from '@/components/smoothui/depth-parallax-words';
import FadeThrough from '@/components/smoothui/fade-through';
import FocusBlurResolve from '@/components/smoothui/focus-blur-resolve';
import SoftBlurIn from '@/components/smoothui/soft-blur-in';
import SpringScaleIn from '@/components/smoothui/spring-scale-in';
import StaggerFromCenter from '@/components/smoothui/stagger-from-center';
import MicroScaleFade from '@/components/smoothui/micro-scale-fade';
import ScaleDownFade from '@/components/smoothui/scale-down-fade';
import PerCharacterRise from '@/components/smoothui/per-character-rise';
import PerWordCrossfade from '@/components/smoothui/per-word-crossfade';

const PHONE_ANIMATION_PRESETS = [
  { id: 'anim-orbit', name: 'Orbit', video: '/animation-card-videos/orbit-template.webm' },
  { id: 'anim-hero-reveal', name: 'Hero Reveal', video: '/animation-card-videos/hero-reveal-template.webm' },
  { id: 'anim-float', name: 'Float', video: '/animation-card-videos/float-template.webm' },
  { id: 'anim-flip', name: 'Flip & Land', video: '/animation-card-videos/flip-template.webm' },
  { id: 'anim-rise', name: 'Rise', video: '/animation-card-videos/rise-template.webm' },
  { id: 'anim-tilt-shift', name: 'Tilt Shift', video: '/animation-card-videos/tilt-shift-template.webm' },
  { id: 'anim-bounce-drop', name: 'Bounce Drop', video: '/animation-card-videos/bounce-drop-template.webm' },
  { id: 'anim-slide-in', name: 'Slide In', video: '/animation-card-videos/slide-in-template.webm' },
  { id: 'anim-spiral', name: 'Spiral', video: '/animation-card-videos/spiral-template.webm' },
  { id: 'anim-cinematic-pan', name: 'Cinematic Pan', video: '/animation-card-videos/cinematic-pan-template.webm' },
  { id: 'anim-slow-pan', name: 'Slow Pan', video: '/animation-card-videos/slow-pan-template.webm' },
  { id: 'anim-horizontal-slide', name: 'Horizontal Slide', video: '/animation-card-videos/horizontal-slide-template.webm' },
  { id: 'anim-infinity-loop', name: 'Infinity Loop', video: '/animation-card-videos/infinity-loop-template.webm' },
  { id: 'anim-dynamic-showcase', name: 'Dynamic Showcase', video: '/animation-card-videos/dynamic-showcase-template.webm' },
  { id: 'anim-corkscrew-reveal', name: 'Corkscrew Reveal', video: '/animation-card-videos/corkscrew-reveal-template.webm' },
  { id: 'anim-depth-zoom', name: 'Depth Zoom', video: '/animation-card-videos/depth-zoom-template.webm' },
  { id: 'anim-corner-drop', name: 'Corner Drop', video: '/animation-card-videos/corner-drop-template.webm' },
];

const TEXT_ANIMATION_OPTIONS = [
  { id: 'bottom-up-letters', name: 'Bottom Up Letters' },
  { id: 'kinetic-center-build', name: 'Kinetic Center Build' },
  { id: 'line-by-line-slide', name: 'Line By Line Slide' },
  { id: 'mask-reveal-up', name: 'Mask Reveal Up' },
  { id: 'reveal-text', name: 'Reveal Text' },
  { id: 'text-reveal', name: 'Text Reveal' },
  { id: 'short-slide-down', name: 'Short Slide Down' },
  { id: 'blur-out-up', name: 'Blur Out Up' },
  { id: 'soft-blur-in', name: 'Soft Blur In' },
  { id: 'spring-scale-in', name: 'Spring Scale In' },
  { id: 'stagger-from-center', name: 'Stagger Center' },
  { id: 'depth-parallax-words', name: 'Depth Parallax' },
  { id: 'fade-through', name: 'Fade Through' },
  { id: 'focus-blur-resolve', name: 'Focus Blur Resolve' },
  { id: 'micro-scale-fade', name: 'Micro Scale Fade' },
  { id: 'scale-down-fade', name: 'Scale Down Fade' },
  { id: 'per-character-rise', name: 'Per Char Rise' },
  { id: 'per-word-crossfade', name: 'Per Word Crossfade' },
  { id: 'dia-text-reveal', name: 'Dia Text Reveal' },
];

function TextAnimationPreview({ animationId, isHovered }: { animationId: string; isHovered: boolean }) {
  switch (animationId) {
    case 'bottom-up-letters':
      return <BottomUpLetters className="text-white text-lg font-semibold" triggerOnView={false}>Sample Text</BottomUpLetters>;
    case 'kinetic-center-build':
      return <KineticCenterBuild className="text-white text-lg font-semibold">Sample Text</KineticCenterBuild>;
    case 'line-by-line-slide':
      return <LineByLineSlide className="text-white text-lg font-semibold" triggerOnView={false}>Sample Text</LineByLineSlide>;
    case 'mask-reveal-up':
      return <MaskRevealUp className="text-white text-lg font-semibold" triggerOnView={false}>Sample Text</MaskRevealUp>;
    case 'reveal-text':
      return <RevealText className="text-white text-lg font-semibold" triggerOnView={false}>Sample Text</RevealText>;
    case 'text-reveal':
      return <TextReveal text="Reveal Text" speed={1} color="#ffffff" revealColor="#a855f7" fontSize={16} fontFamily='"Plus Jakarta Sans", sans-serif' />;
    case 'short-slide-down':
      return <ShortSlideDown phrases={['Sample Text', 'Animation']} className="text-white text-lg font-semibold" />;
    case 'blur-out-up':
      return <BlurOutUp className="text-white text-lg font-semibold" triggerOnView={false}>Sample Text</BlurOutUp>;
    case 'soft-blur-in':
      return <SoftBlurIn className="text-white text-lg font-semibold" triggerOnView={false}>Sample Text</SoftBlurIn>;
    case 'spring-scale-in':
      return <SpringScaleIn className="text-white text-lg font-semibold" triggerOnView={false}>Sample Text</SpringScaleIn>;
    case 'stagger-from-center':
      return <StaggerFromCenter className="text-white text-lg font-semibold" triggerOnView={false}>Sample Text</StaggerFromCenter>;
    case 'depth-parallax-words':
      return <DepthParallaxWords className="text-white text-lg font-semibold" triggerOnView={false}>Sample Text</DepthParallaxWords>;
    case 'fade-through':
      return <FadeThrough className="text-white text-lg font-semibold">Sample Text</FadeThrough>;
    case 'focus-blur-resolve':
      return <FocusBlurResolve className="text-white text-lg font-semibold" triggerOnView={false}>Sample Text</FocusBlurResolve>;
    case 'micro-scale-fade':
      return <MicroScaleFade className="text-white text-lg font-semibold" triggerOnView={false}>Sample Text</MicroScaleFade>;
    case 'scale-down-fade':
      return <ScaleDownFade className="text-white text-lg font-semibold" triggerOnView={false}>Sample Text</ScaleDownFade>;
    case 'per-character-rise':
      return <PerCharacterRise className="text-white text-lg font-semibold" triggerOnView={false}>Sample Text</PerCharacterRise>;
    case 'per-word-crossfade':
      return <PerWordCrossfade className="text-white text-lg font-semibold" triggerOnView={false}>Sample Text</PerWordCrossfade>;
    case 'dia-text-reveal':
      return <DiaTextRevealUI text="Sample Text" duration={1.5} repeat={true} className="text-white text-lg font-semibold" />;
    default:
      return null;
  }
}
function HoverLoopWrapper({ children, isHovered }: { children: React.ReactNode; isHovered: boolean }) {
  const [key, setKey] = useState(0);
  const prevHoveredRef = useRef(isHovered);

  useEffect(() => {
    if (!isHovered) {
      prevHoveredRef.current = false;
      return;
    }

    // Only start looping when transitioning from not hovered to hovered
    if (!prevHoveredRef.current && isHovered) {
      setKey(k => k + 1);
      prevHoveredRef.current = true;
    }

    const id = setInterval(() => setKey((k) => k + 1), 3000);
    return () => clearInterval(id);
  }, [isHovered]);

  return <React.Fragment key={isHovered ? key : 'paused'}>{children}</React.Fragment>;
}

function MiniPreview({ templateId, isHovered }: { templateId: ComponentTemplateName; isHovered: boolean }) {
  switch (templateId) {
    case 'count-up':
      return <CountUp to={100} from={0} duration={2} speed={1} color="#ffffff" isBold fontSize={18} isItalic={false} fontFamily='"Plus Jakarta Sans", sans-serif' />;
    case 'animated-list':
      return <AnimatedList items={['Notification 1', 'Notification 2']} speed={1.5} />;
    case 'logo-loop':
      return <LogoLoop items={[{ type: 'text', value: 'Logo' }, { type: 'text', value: 'Brand' }]} speed={1} direction="left" gap={20} logoHeight={18} textColor="#ffffff" />;
    case 'ai-loader':
      return <AILoader variant="dots" speed={1} color="#a855f7" />;
    case 'bubble-menu':
      return <BubbleMenu items={[{ imageUrl: undefined }, { imageUrl: undefined }, { imageUrl: undefined }]} speed={1} menuBg="transparent" radius={36} bubbleSize={20} />;
    case 'folder':
      return <Folder color="#5227ff" size={0.6} items={[{ text: 'Doc', bgColor: '#fff', textColor: '#000' }]} speed={1} />;
    case 'unlumen-animated-list':
      return <UnlumenAnimatedList items={[
        { title: 'New Message', description: 'You have received a message', bgColor: '#1e1e2e', titleColor: '#fff', descriptionColor: '#aaa', accentColor: '#a855f7' },
        { title: 'Payment Received', description: '$250.00 from client', bgColor: '#1e1e2e', titleColor: '#fff', descriptionColor: '#aaa', accentColor: '#a855f7' },
        { title: 'Task Complete', description: 'Design review finished', bgColor: '#1e1e2e', titleColor: '#fff', descriptionColor: '#aaa', accentColor: '#a855f7' }
      ]} count={3} speed={1.5} />;
    case 'word-rotate':
      return <WordRotate items={[{ text: 'Hello' }, { text: 'World' }]} speed={1.5} color="#ffffff" fontSize={16} />;
    case 'highlighter':
      return <Highlighter text="Highlight me" highlightWords="Highlight" action="highlight" color="#ffd1dc" textColor="#ffffff" highlightTextColor="" strokeWidth={2} animationDuration={600} speed={1} fontSize={14} />;
    case 'orbiting-circles':
      return <OrbitingCircles items={[{ imageUrl: undefined }, { imageUrl: undefined }, { imageUrl: undefined }]} radius={45} speed={1} iconSize={24} />;
    case 'text-reveal':
      return <TextReveal text="Reveal" speed={1} color="#ffffff" revealColor="#a855f7" fontSize={16} fontFamily='"Plus Jakarta Sans", sans-serif' />;
    case 'dia-text-reveal':
      return <DiaTextReveal text="Dia Reveal" speed={1} fontSize={16} repeat={true} />;
    case 'skeleton-shimmer':
      return <SkeletonShimmer lines={2} showAvatar={false} showImage={false} baseColor="rgba(255,255,255,0.08)" shimmerColor="rgba(255,255,255,0.15)" speed={1} borderRadius={4} />;
    case 'text-3d-flip':
      return <Text3DFlip text="Flip" flippedText="" color="#ffffff" flipColor="#a855f7" fontSize={16} fontFamily='"Plus Jakarta Sans", sans-serif' staggerDuration={0.05} staggerFrom="first" rotateDirection="top" speed={1} autoPlay />;
    case 'camera-zoom':
      return <div style={{ width: '36px', height: '24px', border: '2px dashed rgba(168,85,247,0.6)', borderRadius: '4px' }} />;
    case 'media-upload':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '50px', height: '35px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ImageIcon size={15} style={{ opacity: 0.6 }} />
          </div>
          <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)' }}>Image / Video</span>
        </div>
      );
    case 'video-upload':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '54px', height: '36px', borderRadius: '6px', background: 'rgba(168,85,247,0.15)', border: '1px dashed #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
            <Film size={16} />
          </div>
          <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Video Upload</span>
        </div>
      );
    case 'image':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '54px', height: '36px', borderRadius: '6px', background: 'rgba(250,204,21,0.15)', border: '1px dashed #facc15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#facc15' }}>
            <ImageIcon size={16} />
          </div>
          <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Image</span>
        </div>
      );
    case 'phone-device':
      return <PhoneDevice deviceType="iphone" deviceColor="#1a1a1a" size={0.35} />;
    case 'masked-heading':
      return (
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', textAlign: 'center', lineHeight: 1.1, background: 'linear-gradient(135deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Masked
        </div>
      );
    default:
      return null;
  }
}

interface ComponentPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (templateId: ComponentTemplateName, props?: Record<string, any>) => void;
  onAddText: (animationType: MGTextAnimationType) => void;
}

export default function ComponentPicker({ open, onClose, onSelect, onAddText }: ComponentPickerProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'component' | 'devices'>('text');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  if (!open) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#222831', border: '1px solid #393E46',
          borderRadius: '16px', padding: '24px',
          width: '80vw', height: '80vh',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#EEEEEE', fontFamily: '"Plus Jakarta Sans", sans-serif', margin: 0 }}>
              Add Component
            </h2>
            <div style={{ display: 'flex', gap: '2px', background: '#393E46', borderRadius: '8px', padding: '3px' }}>
              <button
                onClick={() => setActiveTab('text')}
                style={{
                  padding: '6px 16px', fontSize: '11px', fontWeight: 600, borderRadius: '6px',
                  border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans", sans-serif',
                  background: activeTab === 'text' ? 'rgba(0,173,181,0.2)' : 'transparent', 
                  color: activeTab === 'text' ? '#00ADB5' : 'rgba(238,238,238,0.5)',
                }}
              >
                Text
              </button>
              <button
                onClick={() => setActiveTab('component')}
                style={{
                  padding: '6px 16px', fontSize: '11px', fontWeight: 600, borderRadius: '6px',
                  border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans", sans-serif',
                  background: activeTab === 'component' ? 'rgba(0,173,181,0.2)' : 'transparent', 
                  color: activeTab === 'component' ? '#00ADB5' : 'rgba(238,238,238,0.5)',
                }}
              >
                Component
              </button>
              <button
                onClick={() => setActiveTab('devices')}
                style={{
                  padding: '6px 16px', fontSize: '11px', fontWeight: 600, borderRadius: '6px',
                  border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans", sans-serif',
                  background: activeTab === 'devices' ? 'rgba(0,173,181,0.2)' : 'transparent', 
                  color: activeTab === 'devices' ? '#00ADB5' : 'rgba(238,238,238,0.5)',
                }}
              >
                Devices
              </button>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#a0aab5', cursor: 'pointer', padding: '4px', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Grid - 4 columns, horizontal rectangle items */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridAutoRows: 'minmax(180px, auto)',
          gap: '10px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          {activeTab === 'text' ? (
            // Text animations
            TEXT_ANIMATION_OPTIONS.map((animation) => (
              <button
                key={animation.id}
                onClick={() => { onAddText(animation.id as MGTextAnimationType); onClose(); }}
                onMouseEnter={() => setHoveredItem(animation.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  background: '#2b303a',
                  border: '1px solid #393E46',
                  borderRadius: '10px',
                  padding: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.15s, background 0.15s',
                  overflow: 'hidden',
                  position: 'relative',
                  borderColor: hoveredItem === animation.id ? 'rgba(0,173,181,0.5)' : '#393E46',
                  backgroundColor: hoveredItem === animation.id ? 'rgba(0,173,181,0.08)' : '#2b303a',
                }}
              >
                <div style={{
                  flex: 1, width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', pointerEvents: 'none',
                  background: '#222831', borderRadius: '8px',
                  padding: '16px 10px',
                }}>
                  <HoverLoopWrapper isHovered={hoveredItem === animation.id}>
                    <TextAnimationPreview animationId={animation.id} isHovered={hoveredItem === animation.id} />
                  </HoverLoopWrapper>
                </div>
                <span style={{ fontSize: '9px', fontWeight: 600, color: '#a0aab5', textAlign: 'center', lineHeight: 1.2, fontFamily: '"Plus Jakarta Sans", sans-serif', marginTop: '4px' }}>
                  {animation.name}
                </span>
              </button>
            ))
          ) : activeTab === 'devices' ? (
            // Devices section: phone animations + media upload
            <>
              {/* Phone Animation Presets */}
              {PHONE_ANIMATION_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => { onSelect('phone-device', { animationTemplate: preset.id.replace('anim-', '') }); onClose(); }}
                  onMouseEnter={() => setHoveredItem(preset.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    background: '#2b303a',
                    border: '1px solid #393E46',
                    borderRadius: '10px',
                    padding: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'border-color 0.15s, background 0.15s',
                    overflow: 'hidden',
                    position: 'relative',
                    borderColor: hoveredItem === preset.id ? 'rgba(0,173,181,0.5)' : '#393E46',
                    backgroundColor: hoveredItem === preset.id ? 'rgba(0,173,181,0.08)' : '#2b303a',
                  }}
                >
                  <div style={{
                    flex: 1, width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', pointerEvents: 'none',
                    background: '#222831', borderRadius: '8px',
                  }}>
                    <video
                      src={preset.video}
                      autoPlay={hoveredItem === preset.id}
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                      ref={(el) => {
                        if (!el) return;
                        if (hoveredItem === preset.id) {
                          el.play().catch(() => {});
                        } else {
                          el.pause();
                          el.currentTime = 0;
                        }
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: '#a0aab5', textAlign: 'center', lineHeight: 1.2, fontFamily: '"Plus Jakarta Sans", sans-serif', marginTop: '4px' }}>
                    {preset.name}
                  </span>
                </button>
              ))}
            </>
          ) : (
            // Component templates (exclude items shown in Devices tab)
            COMPONENT_TEMPLATES.filter((t) => t.id !== 'media-upload' && t.id !== 'phone-device').map((template) => (
              <button
                key={template.id}
                onClick={() => { onSelect(template.id); onClose(); }}
                onMouseEnter={() => setHoveredItem(template.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  background: '#2b303a',
                  border: '1px solid #393E46',
                  borderRadius: '10px',
                  padding: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.15s, background 0.15s',
                  overflow: 'hidden',
                  position: 'relative',
                  borderColor: hoveredItem === template.id ? 'rgba(0,173,181,0.5)' : '#393E46',
                  backgroundColor: hoveredItem === template.id ? 'rgba(0,173,181,0.08)' : '#2b303a',
                }}
              >
                <div style={{
                  flex: 1, width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', pointerEvents: 'none',
                  background: '#222831', borderRadius: '8px',
                  padding: '16px 10px',
                }}>
                  <HoverLoopWrapper isHovered={hoveredItem === template.id}>
                    <MiniPreview templateId={template.id} isHovered={hoveredItem === template.id} />
                  </HoverLoopWrapper>
                </div>
                <span style={{ fontSize: '9px', fontWeight: 600, color: '#a0aab5', textAlign: 'center', lineHeight: 1.2, fontFamily: '"Plus Jakarta Sans", sans-serif', marginTop: '4px' }}>
                  {template.name}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
