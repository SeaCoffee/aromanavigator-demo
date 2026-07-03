'use client';

import { useEffect, useState, type ImgHTMLAttributes, type ReactNode } from 'react';

import { normalizeMediaUrl } from '@/app/utils/MediaUrlUtils';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null;
  fallback?: ReactNode;
  fallbackClassName?: string;
};

export default function MediaImage({
  src,
  alt,
  className,
  fallback,
  fallbackClassName,
  loading = 'lazy',
  decoding = 'async',
  ...props
}: Props) {
  const imageSrc = normalizeMediaUrl(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [imageSrc]);

  if (!imageSrc || failed) {
    return (
      <div className={fallbackClassName ?? className} aria-hidden={alt ? undefined : true}>
        {fallback ?? 'Р‘РµР· С„РѕС‚Рѕ'}
      </div>
    );
  }

  return (
    <img
      {...props}
      src={imageSrc}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      onError={() => setFailed(true)}
    />
  );
}
