'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Film, Image as ImageIcon, Smartphone } from 'lucide-react';
import { COMPONENT_TEMPLATES, ComponentTemplateName } from './templates';
import { MGTextAnimationType } from '../store';
import CountUp from './templates/CountUp';
import AnimatedList from './templates/AnimatedList';
import LogoLoop from './templates/LogoLoop';
import AILoader from './templates/AILoader';
import BubbleMenu from './templates/BubbleMenu';
import UnlumenAnimatedList from './templates/UnlumenAnimatedList';
import WordRotate from './templates/WordRotate';
import Highlighter from './templates/Highlighter';
import AnimatedBeam from './templates/AnimatedBeam';
import OrbitingCircles from './templates/OrbitingCircles';
import TextReveal from './templates/TextReveal';
import SkeletonShimmer from './templates/SkeletonShimmer';
import Text3DFlip from './templates/Text3DFlip';
import VideoUpload from './templates/VideoUpload';

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
];

function TextAnimationPreview({ animationId, isHovered }: { animationId: string; isHovered: boolean }) {
  switch (animationId) {
    case 'bottom-up-letters':
      return <BottomUpLetters className="text-[#0F172A] text-lg font-semibold" triggerOnView={false}>Sample Text</BottomUpLetters>;
    case 'kinetic-center-build':
      return <KineticCenterBuild className="text-[#0F172A] text-lg font-semibold">Sample Text</KineticCenterBuild>;
    case 'line-by-line-slide':
      return <LineByLineSlide className="text-[#0F172A] text-lg font-semibold" triggerOnView={false}>Sample Text</LineByLineSlide>;
    case 'mask-reveal-up':
      return <MaskRevealUp className="text-[#0F172A] text-lg font-semibold" triggerOnView={false}>Sample Text</MaskRevealUp>;
    case 'reveal-text':
      return <RevealText className="text-[#0F172A] text-lg font-semibold" triggerOnView={false}>Sample Text</RevealText>;
    case 'short-slide-down':
      return <ShortSlideDown phrases={['Sample Text', 'Animation']} className="text-[#0F172A] text-lg font-semibold" />;
    case 'blur-out-up':
      return <BlurOutUp className="text-[#0F172A] text-lg font-semibold" triggerOnView={false}>Sample Text</BlurOutUp>;
    case 'soft-blur-in':
      return <SoftBlurIn className="text-[#0F172A] text-lg font-semibold" triggerOnView={false}>Sample Text</SoftBlurIn>;
    case 'spring-scale-in':
      return <SpringScaleIn className="text-[#0F172A] text-lg font-semibold" triggerOnView={false}>Sample Text</SpringScaleIn>;
    case 'stagger-from-center':
      return <StaggerFromCenter className="text-[#0F172A] text-lg font-semibold" triggerOnView={false}>Sample Text</StaggerFromCenter>;
    case 'depth-parallax-words':
      return <DepthParallaxWords className="text-[#0F172A] text-lg font-semibold" triggerOnView={false}>Sample Text</DepthParallaxWords>;
    case 'fade-through':
      return <FadeThrough className="text-[#0F172A] text-lg font-semibold">Sample Text</FadeThrough>;
    case 'focus-blur-resolve':
      return <FocusBlurResolve className="text-[#0F172A] text-lg font-semibold" triggerOnView={false}>Sample Text</FocusBlurResolve>;
    case 'micro-scale-fade':
      return <MicroScaleFade className="text-[#0F172A] text-lg font-semibold" triggerOnView={false}>Sample Text</MicroScaleFade>;
    case 'scale-down-fade':
      return <ScaleDownFade className="text-[#0F172A] text-lg font-semibold" triggerOnView={false}>Sample Text</ScaleDownFade>;
    case 'per-character-rise':
      return <PerCharacterRise className="text-[#0F172A] text-lg font-semibold" triggerOnView={false}>Sample Text</PerCharacterRise>;
    case 'per-word-crossfade':
      return <PerWordCrossfade className="text-[#0F172A] text-lg font-semibold" triggerOnView={false}>Sample Text</PerWordCrossfade>;
    case 'dia-text-reveal':
      return <DiaTextRevealUI text="Sample Text" duration={1.5} repeat={true} className="text-[#0F172A] text-lg font-semibold" />;
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
      return <CountUp to={100} from={0} duration={2} speed={1} color="#0F172A" isBold fontSize={18} isItalic={false} fontFamily='"Plus Jakarta Sans", sans-serif' />;
    case 'animated-list':
      return <AnimatedList items={['Notification 1', 'Notification 2']} speed={1.5} />;
    case 'logo-loop':
      return <LogoLoop items={[{ type: 'text', value: 'Logo' }, { type: 'text', value: 'Brand' }]} speed={1} direction="left" gap={20} logoHeight={18} textColor="#0F172A" />;
    case 'ai-loader':
      return <AILoader variant="dots" speed={1} color="#FF9137" />;
    case 'bubble-menu':
      return <BubbleMenu items={[{ imageUrl: undefined }, { imageUrl: undefined }, { imageUrl: undefined }]} speed={1} menuBg="transparent" radius={36} bubbleSize={20} />;
    case 'unlumen-animated-list':
      return <UnlumenAnimatedList items={[
        { title: 'New Message', description: 'You have received a message', bgColor: '#FFFFFF', titleColor: '#0F172A', descriptionColor: '#64748B', accentColor: '#FF9137' },
        { title: 'Payment Received', description: '$250.00 from client', bgColor: '#FFFFFF', titleColor: '#0F172A', descriptionColor: '#64748B', accentColor: '#FF9137' },
        { title: 'Task Complete', description: 'Design review finished', bgColor: '#FFFFFF', titleColor: '#0F172A', descriptionColor: '#64748B', accentColor: '#FF9137' }
      ]} count={3} speed={1.5} />;
    case 'word-rotate':
      return <WordRotate items={[{ text: 'Hello' }, { text: 'World' }]} speed={1.5} color="#0F172A" fontSize={16} />;
    case 'highlighter':
      return <Highlighter text="Highlight me" highlightWords="Highlight" action="highlight" color="#FFFC8C" textColor="#0F172A" highlightTextColor="" strokeWidth={2} animationDuration={600} speed={1} fontSize={14} />;
    case 'orbiting-circles':
      return <OrbitingCircles items={[{ imageUrl: undefined }, { imageUrl: undefined }, { imageUrl: undefined }]} radius={45} speed={1} iconSize={24} />;
    case 'text-reveal':
      return <TextReveal text="Reveal" speed={1} color="#0F172A" revealColor="#FF9137" fontSize={16} fontFamily='"Plus Jakarta Sans", sans-serif' />;
    case 'skeleton-shimmer':
      return <SkeletonShimmer lines={2} showAvatar={false} showImage={false} baseColor="rgba(15, 23, 42, 0.08)" shimmerColor="rgba(15, 23, 42, 0.16)" speed={1} borderRadius={4} />;
    case 'text-3d-flip':
      return <Text3DFlip text="Flip" flippedText="" color="#0F172A" flipColor="#FF9137" fontSize={16} fontFamily='"Plus Jakarta Sans", sans-serif' staggerDuration={0.05} staggerFrom="first" rotateDirection="top" speed={1} autoPlay />;
    case 'camera-zoom':
      return <div style={{ width: '36px', height: '24px', border: '2px dashed rgba(255,145,55,0.6)', borderRadius: '4px' }} />;
    case 'media-upload':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '50px', height: '35px', borderRadius: '4px', background: '#FFFFFF', border: '1px dashed rgba(15,23,42,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ImageIcon size={15} style={{ opacity: 0.6 }} />
          </div>
          <span style={{ fontSize: '8px', color: '#64748B' }}>Image / Video</span>
        </div>
      );
    case 'video-upload':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '54px', height: '36px', borderRadius: '6px', background: 'rgba(255,145,55,0.12)', border: '1px dashed #FF9137', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9137' }}>
            <Film size={16} />
          </div>
          <span style={{ fontSize: '9px', fontWeight: 600, color: '#0F172A' }}>Video Upload</span>
        </div>
      );
    case 'image':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '54px', height: '36px', borderRadius: '6px', background: 'rgba(255,204,77,0.15)', border: '1px dashed #FFCC4D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9137' }}>
            <ImageIcon size={16} />
          </div>
          <span style={{ fontSize: '9px', fontWeight: 600, color: '#0F172A' }}>Image</span>
        </div>
      );
    case 'phone-device':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '40px', height: '52px', borderRadius: '8px', background: 'linear-gradient(135deg, #1E293B, #0F172A)', border: '1.5px solid rgba(255,145,55,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9137', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <Smartphone size={20} />
          </div>
          <span style={{ fontSize: '9px', fontWeight: 600, color: '#0F172A' }}>3D Phone</span>
        </div>
      );
    case 'masked-heading':
      return (
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.03em', textAlign: 'center', lineHeight: 1.1, background: 'linear-gradient(135deg, #FF9137, #FFCC4D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
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
  
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF', 
          border: '1px solid rgba(15, 23, 42, 0.08)',
          borderRadius: '12px', padding: '24px',
          width: '80vw', height: '80vh',
          overflow: 'hidden',
          boxShadow: '0 24px 64px -12px rgba(15, 23, 42, 0.2), 0 8px 24px -4px rgba(15, 23, 42, 0.08)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid rgba(15, 23, 42, 0.08)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <button
                onClick={() => setActiveTab('text')}
                style={{
                  fontSize: '14px', fontWeight: 800, letterSpacing: '0.06em',
                  border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                  background: 'transparent', 
                  color: activeTab === 'text' ? '#FF9137' : '#334155',
                  borderBottom: activeTab === 'text' ? '2.5px solid #FF9137' : '2.5px solid transparent',
                  padding: '4px 2px 8px 2px',
                  transition: 'all 0.15s ease',
                  textTransform: 'uppercase',
                  opacity: activeTab === 'text' ? 1 : 0.85,
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'text') {
                    e.currentTarget.style.color = '#0F172A';
                    e.currentTarget.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'text') {
                    e.currentTarget.style.color = '#334155';
                    e.currentTarget.style.opacity = '0.85';
                  }
                }}
              >
                Text
              </button>
              <button
                onClick={() => setActiveTab('component')}
                style={{
                  fontSize: '14px', fontWeight: 800, letterSpacing: '0.06em',
                  border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                  background: 'transparent', 
                  color: activeTab === 'component' ? '#FF9137' : '#334155',
                  borderBottom: activeTab === 'component' ? '2.5px solid #FF9137' : '2.5px solid transparent',
                  padding: '4px 2px 8px 2px',
                  transition: 'all 0.15s ease',
                  textTransform: 'uppercase',
                  opacity: activeTab === 'component' ? 1 : 0.85,
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'component') {
                    e.currentTarget.style.color = '#0F172A';
                    e.currentTarget.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'component') {
                    e.currentTarget.style.color = '#334155';
                    e.currentTarget.style.opacity = '0.85';
                  }
                }}
              >
                Component
              </button>
              <button
                onClick={() => setActiveTab('devices')}
                style={{
                  fontSize: '14px', fontWeight: 800, letterSpacing: '0.06em',
                  border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                  background: 'transparent', 
                  color: activeTab === 'devices' ? '#FF9137' : '#334155',
                  borderBottom: activeTab === 'devices' ? '2.5px solid #FF9137' : '2.5px solid transparent',
                  padding: '4px 2px 8px 2px',
                  transition: 'all 0.15s ease',
                  textTransform: 'uppercase',
                  opacity: activeTab === 'devices' ? 1 : 0.85,
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'devices') {
                    e.currentTarget.style.color = '#0F172A';
                    e.currentTarget.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'devices') {
                    e.currentTarget.style.color = '#334155';
                    e.currentTarget.style.opacity = '0.85';
                  }
                }}
              >
                Devices
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="mg-btn-interactive"
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#0F172A';
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#64748B';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Grid - 4 columns, horizontal rectangle items */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridAutoRows: 'minmax(180px, auto)',
          gap: '12px',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: '24px',
        }}>
          {activeTab === 'text' ? (
            // Text animations
            TEXT_ANIMATION_OPTIONS.map((animation) => (
              <div
                key={animation.id}
                role="button"
                tabIndex={0}
                onClick={() => { onAddText(animation.id as MGTextAnimationType); onClose(); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onAddText(animation.id as MGTextAnimationType);
                    onClose();
                  }
                }}
                onMouseEnter={() => setHoveredItem(animation.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  background: hoveredItem === animation.id ? '#FFFDE6' : '#FFFFFF',
                  border: hoveredItem === animation.id ? '1px solid #FF9137' : '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: hoveredItem === animation.id ? '0 4px 14px rgba(255, 145, 55, 0.2)' : '0 1px 3px rgba(15, 23, 42, 0.04)',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden',
                  position: 'relative',
                  outline: 'none',
                }}
              >
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '12px', background: '#F4F5EE', borderRadius: '6px' }}>
                  <div style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}>
                    <HoverLoopWrapper isHovered={hoveredItem === animation.id}>
                      <TextAnimationPreview animationId={animation.id} isHovered={hoveredItem === animation.id} />
                    </HoverLoopWrapper>
                  </div>
                </div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: hoveredItem === animation.id ? '#FF9137' : '#0F172A', textAlign: 'center', fontFamily: 'var(--font-mono)', marginTop: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {animation.name}
                </div>
              </div>
            ))
          ) : activeTab === 'devices' ? (
            // Devices section: phone animations + media upload
            <>
              {/* Phone Animation Presets */}
              {PHONE_ANIMATION_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => { onSelect('phone-device', { animationTemplate: preset.id.replace('anim-', '') }); onClose(); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect('phone-device', { animationTemplate: preset.id.replace('anim-', '') });
                      onClose();
                    }
                  }}
                  onMouseEnter={() => setHoveredItem(preset.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    background: hoveredItem === preset.id ? '#FFFDE6' : '#FFFFFF',
                    border: hoveredItem === preset.id ? '1px solid #FF9137' : '1px solid rgba(15, 23, 42, 0.08)',
                    boxShadow: hoveredItem === preset.id ? '0 4px 14px rgba(255, 145, 55, 0.2)' : '0 1px 3px rgba(15, 23, 42, 0.04)',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden',
                    position: 'relative',
                    outline: 'none',
                  }}
                >
                  <div style={{
                    flex: 1, width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', pointerEvents: 'none',
                    background: '#F4F5EE', borderRadius: '6px',
                    marginBottom: '8px',
                  }}>
                    <video
                      src={preset.video}
                      autoPlay={hoveredItem === preset.id}
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
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
                  <span style={{ fontSize: '10px', fontWeight: 600, color: hoveredItem === preset.id ? '#FF9137' : '#0F172A', textAlign: 'center', lineHeight: 1.2, fontFamily: 'var(--font-mono)', marginTop: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {preset.name}
                  </span>
                </div>
              ))}
            </>
          ) : (
            // Component templates (exclude items shown in Devices tab)
            COMPONENT_TEMPLATES.filter((t) => t.id !== 'media-upload' && t.id !== 'phone-device').map((template) => (
              <div
                key={template.id}
                role="button"
                tabIndex={0}
                onClick={() => { onSelect(template.id); onClose(); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(template.id);
                    onClose();
                  }
                }}
                onMouseEnter={() => setHoveredItem(template.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  background: hoveredItem === template.id ? '#FFFDE6' : '#FFFFFF',
                  border: hoveredItem === template.id ? '1px solid #FF9137' : '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: hoveredItem === template.id ? '0 4px 14px rgba(255, 145, 55, 0.2)' : '0 1px 3px rgba(15, 23, 42, 0.04)',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden',
                  position: 'relative',
                  outline: 'none',
                }}
              >
                <div style={{
                  flex: 1, width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', pointerEvents: 'none',
                  background: '#F4F5EE', borderRadius: '6px',
                  padding: '16px 10px',
                  marginBottom: '8px',
                }}>
                  <HoverLoopWrapper isHovered={hoveredItem === template.id}>
                    <MiniPreview templateId={template.id} isHovered={hoveredItem === template.id} />
                  </HoverLoopWrapper>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 600, color: hoveredItem === template.id ? '#FF9137' : '#0F172A', textAlign: 'center', lineHeight: 1.2, fontFamily: 'var(--font-mono)', marginTop: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {template.name}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
