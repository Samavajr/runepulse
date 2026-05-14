'use client';

import { useState, type ReactNode } from 'react';

type AssetImageProps = {
  src: string | null;
  alt?: string;
  className: string;
  fallback: ReactNode;
  fallbackClassName: string;
};

export default function AssetImage({
  src,
  alt = '',
  className,
  fallback,
  fallbackClassName
}: AssetImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className={fallbackClassName}>{fallback}</div>;
  }

  return <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />;
}
