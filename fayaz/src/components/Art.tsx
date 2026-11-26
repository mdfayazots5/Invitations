import React from 'react';
import {getStaticFiles, Img, staticFile} from 'remotion';

const warned = new Set<string>();

export const hasArt = (name: string): boolean => {
  const ok = getStaticFiles().some((f) => f.name === `art/${name}`);
  if (!ok && !warned.has(name)) {
    warned.add(name);
    console.warn(`[invite] public/art/${name} not found, using drawn fallback`);
  }
  return ok;
};

/** Shows public/art/<name> if it exists, otherwise the drawn fallback. */
export const Art: React.FC<{
  name: string;
  fallback: React.ReactNode;
  style?: React.CSSProperties;
}> = ({name, fallback, style}) => {
  if (!hasArt(name)) return <>{fallback}</>;
  return (
    <Img
      src={staticFile(`art/${name}`)}
      style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style}}
    />
  );
};
