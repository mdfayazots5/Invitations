import React, {useId} from 'react';

/** Embossed ivory damask texture, used as the envelope fallback. */
export const Damask: React.FC<{
  width: number;
  height: number;
  base: string;
  ink?: string;
  opacity?: number;
}> = ({width, height, base, ink = '#D9C7A8', opacity = 0.35}) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
      <defs>
        <pattern id={`dm${id}`} width="180" height="220" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={ink} strokeWidth="1.6" opacity={opacity}>
            {/* central fleur */}
            <path d="M90,20 C110,50 120,80 90,110 C60,80 70,50 90,20 Z" />
            <path d="M90,110 C120,100 150,110 160,140 C130,150 105,135 90,110 Z" />
            <path d="M90,110 C60,100 30,110 20,140 C50,150 75,135 90,110 Z" />
            <path d="M90,110 L90,180 M75,170 C80,160 100,160 105,170" />
            <circle cx="90" cy="70" r="6" />
            {/* corner scrolls (tile seamlessly) */}
            <path d="M0,0 C20,10 25,30 10,40 C0,45 -10,35 0,25" />
            <path d="M180,0 C160,10 155,30 170,40 C180,45 190,35 180,25" />
            <path d="M0,220 C20,210 25,190 10,180" />
            <path d="M180,220 C160,210 155,190 170,180" />
          </g>
          <g fill="#FFFFFF" opacity={opacity * 0.9}>
            <path d="M91,22 C108,50 117,78 91,106 C100,80 100,50 91,22 Z" />
          </g>
        </pattern>
        <radialGradient id={`dv${id}`} cx="50%" cy="45%" r="75%">
          <stop offset="60%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#6B4B2A" stopOpacity={0.12} />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill={base} />
      <rect width={width} height={height} fill={`url(#dm${id})`} />
      <rect width={width} height={height} fill={`url(#dv${id})`} />
    </svg>
  );
};
