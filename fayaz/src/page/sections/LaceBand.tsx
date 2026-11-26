import React from 'react';
import {P} from '../../theme';

/** 60px scalloped lace divider between the hero and the page body. */
export const LaceBand: React.FC = () => (
  <svg width={1080} height={60} viewBox="0 0 1080 60" style={{display: 'block'}}>
    <defs>
      <pattern id="lace" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M0,0 L60,0 L60,22 C60,44 40,52 30,52 C20,52 0,44 0,22 Z" fill={P.ivory} />
        <path d="M4,20 C4,40 22,48 30,48 C38,48 56,40 56,20" fill="none" stroke={P.goldLight} strokeWidth={1.5} />
        <circle cx="30" cy="26" r="7" fill="none" stroke={P.gold} strokeWidth={1.2} />
        <circle cx="30" cy="26" r="2" fill={P.gold} />
        <circle cx="12" cy="12" r="2" fill={P.goldLight} />
        <circle cx="48" cy="12" r="2" fill={P.goldLight} />
      </pattern>
    </defs>
    <rect width="1080" height="60" fill={P.page} />
    <rect width="1080" height="60" fill="url(#lace)" />
    <line x1="0" y1="4" x2="1080" y2="4" stroke={P.gold} strokeWidth={2} />
  </svg>
);
