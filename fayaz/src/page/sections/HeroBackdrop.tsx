import React from 'react';
import {Leaf, Peony} from '../../components/Peony';

/**
 * Painted-style fallback for art/hero.jpg: pastel sky, sun rays, drifting clouds,
 * lavender hills, a lake and a floral nikah stage. 1080×1920.
 */
export const HeroBackdrop: React.FC<{frame: number}> = ({frame}) => {
  const ray = Math.sin(frame / 60) * 6;
  const cloudA = Math.sin(frame / 90) * 20;
  const cloudB = Math.cos(frame / 110) * 20;
  const tones = ['blush', 'ivory', 'rose'] as const;

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, #9FC3DE 0%, #BBD4E8 28%, #DCE6F0 46%, #F6E4E0 60%, #F8E9DF 68%)',
        }}
      />
      {/* sun rays, top-left */}
      <div
        style={{
          position: 'absolute',
          left: -700,
          top: -700,
          width: 1600,
          height: 1600,
          transform: `rotate(${ray}deg)`,
          background:
            'repeating-conic-gradient(from 100deg at 50% 50%, rgba(255,246,214,0.55) 0deg 3deg, rgba(255,246,214,0) 6deg 13deg)',
          WebkitMaskImage: 'radial-gradient(circle, black 0%, rgba(0,0,0,0.5) 25%, transparent 60%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -260,
          top: -260,
          width: 720,
          height: 720,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,252,236,1) 0%, rgba(255,240,200,0.6) 25%, rgba(255,240,200,0) 65%)',
        }}
      />
      {/* clouds */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="cloudBlur" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B9A9CC" />
            <stop offset="100%" stopColor="#D8CCE0" />
          </linearGradient>
          <linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9E8FB8" />
            <stop offset="100%" stopColor="#C8BBD6" />
          </linearGradient>
          <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9DCEB" />
            <stop offset="100%" stopColor="#E9EEF2" />
          </linearGradient>
          <linearGradient id="stageFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF9F1" />
            <stop offset="100%" stopColor="#EADBC8" />
          </linearGradient>
        </defs>
        <g filter="url(#cloudBlur)" fill="#FFFFFF">
          <g transform={`translate(${cloudA} 0)`} opacity={0.85}>
            <ellipse cx="220" cy="420" rx="200" ry="60" />
            <ellipse cx="330" cy="390" rx="140" ry="70" />
            <ellipse cx="820" cy="300" rx="220" ry="55" />
            <ellipse cx="900" cy="270" rx="120" ry="60" />
          </g>
          <g transform={`translate(${cloudB} 0)`} opacity={0.7}>
            <ellipse cx="620" cy="620" rx="260" ry="50" />
            <ellipse cx="120" cy="700" rx="180" ry="45" />
            <ellipse cx="980" cy="760" rx="200" ry="50" />
          </g>
        </g>
        {/* distant hills */}
        <path d="M0,1080 C160,960 300,990 420,1030 C560,940 700,930 820,1010 C920,960 1010,970 1080,1000 L1080,1220 L0,1220 Z" fill="url(#hill1)" opacity={0.85} />
        <path d="M0,1130 C200,1060 340,1090 520,1120 C700,1060 880,1080 1080,1110 L1080,1240 L0,1240 Z" fill="url(#hill2)" opacity={0.75} />
        {/* lake */}
        <rect x="0" y="1200" width="1080" height="380" fill="url(#lake)" />
        {[1240, 1280, 1320, 1360].map((y, i) => (
          <line key={y} x1={140 + i * 60 + Math.sin(frame / 30 + i) * 20} y1={y} x2={360 + i * 80} y2={y} stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={2} />
        ))}
        <g transform="translate(0 170)">
        {/* stage */}
        <path d="M0,1400 L1080,1400 L1080,1920 L0,1920 Z" fill="url(#stageFloor)" />
        <path d="M120,1400 L120,1120 C120,960 330,890 540,830 C750,890 960,960 960,1120 L960,1400" fill="none" stroke="#FFFFFF" strokeWidth={26} opacity={0.95} />
        <path d="M120,1400 L120,1120 C120,960 330,890 540,830 C750,890 960,960 960,1120 L960,1400" fill="none" stroke="#E3C27A" strokeWidth={3} />
        {/* drapes */}
        <path d="M150,1130 C220,1250 240,1340 200,1400 L150,1400 Z" fill="#FFFFFF" opacity={0.85} />
        <path d="M930,1130 C860,1250 840,1340 880,1400 L930,1400 Z" fill="#FFFFFF" opacity={0.85} />
        {/* sofa */}
        <rect x="380" y="1290" width="320" height="90" rx="40" fill="#FFF6EA" stroke="#E3C27A" strokeWidth={2} />
        <rect x="400" y="1260" width="280" height="60" rx="30" fill="#FFFBF3" stroke="#E3C27A" strokeWidth={2} />
        {/* steps */}
        <rect x="200" y="1400" width="680" height="40" fill="#FFFBF4" stroke="#E3C27A" strokeWidth={1.5} />
        <rect x="150" y="1440" width="780" height="40" fill="#FBF4EA" stroke="#E3C27A" strokeWidth={1.5} />
        {/* flowers along the arch */}
        {Array.from({length: 13}).map((_, i) => {
          const t = i / 12;
          // sample the arch roughly: up the left side, over the top, down the right
          const pts: [number, number][] = [
            [120, 1400], [120, 1250], [130, 1100], [200, 990], [330, 905], [440, 860], [540, 830],
            [640, 860], [750, 905], [880, 990], [950, 1100], [960, 1250], [960, 1400],
          ];
          const [x, y] = pts[i];
          return (
            <g key={i}>
              <Leaf x={x - 20} y={y + 10} size={36} rotate={-60 + t * 120} grow={1} />
              <Peony x={x} y={y} size={i % 2 ? 34 : 44} bloom={1} tone={tones[i % 3]} rotate={i * 31} />
            </g>
          );
        })}
        {/* petals on steps */}
        {Array.from({length: 14}).map((_, i) => (
          <ellipse key={i} cx={220 + ((i * 97) % 640)} cy={1410 + ((i * 37) % 70)} rx={7} ry={4} fill={i % 2 ? '#E8A9B3' : '#F4C9CF'} transform={`rotate(${i * 40} ${220 + ((i * 97) % 640)} ${1410 + ((i * 37) % 70)})`} />
        ))}
        {/* lanterns */}
        {[260, 820].map((x, i) => (
          <g key={x} transform={`translate(${x} 1320) rotate(${Math.sin(frame / 20 + i) * 3})`}>
            <rect x={-16} y={0} width={32} height={50} rx={6} fill="#F5D88C" stroke="#B88A3E" strokeWidth={2} />
            <circle cx={0} cy={25} r={30} fill="#FFE7A8" opacity={0.35} />
          </g>
        ))}
        </g>
        {/* foreground floral mounds */}
        {[
          [60, 1700, 120],
          [180, 1800, 90],
          [1020, 1690, 120],
          [900, 1810, 90],
          [540, 1880, 70],
        ].map(([x, y, s], i) => (
          <g key={i}>
            <Leaf x={x - s * 0.6} y={y + 20} size={s} rotate={-70} grow={1} />
            <Leaf x={x + s * 0.6} y={y + 20} size={s} rotate={70} grow={1} />
            <Peony x={x} y={y} size={s} bloom={1} tone={tones[i % 3]} rotate={i * 50} />
          </g>
        ))}
      </svg>
      {/* soften the top half so white text reads */}
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(40,60,90,0.18) 0%, rgba(40,60,90,0.08) 45%, rgba(0,0,0,0) 60%)'}} />
    </div>
  );
};
