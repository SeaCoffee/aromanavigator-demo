import MediaImage from '@/app/components/images/MediaImage';

type Props = {
  src?: string | null;
  alt?: string;
  initial: string;
  className: string;
  fallbackClassName: string;
};

export default function AvatarImage({
  src,
  alt = '',
  initial,
  className,
  fallbackClassName,
}: Props) {
  return (
    <MediaImage
      src={src}
      alt={alt}
      className={className}
      fallbackClassName={fallbackClassName}
      fallback={initial}
    />
  );
}
