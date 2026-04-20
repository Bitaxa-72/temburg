/**
 * WordPress-aware Image component
 * Automatically resolves image paths through WordPress Media Library
 * Falls back to local images if WordPress is unavailable
 */

import { useImage, useResponsiveImage } from '@/hooks/useImage';

interface WPImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Image path (relative like "saunas/russian.jpg" or absolute like "/images/saunas/russian.jpg") */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Size variant to request from WordPress */
  size?: 'thumbnail' | 'medium' | 'large' | 'full' | 'webp';
  /** Use responsive image with srcSet */
  responsive?: boolean;
}

/**
 * Image component that automatically resolves paths through WordPress Media Library
 *
 * @example
 * // Basic usage
 * <WPImage src="saunas/russian.jpg" alt="Russian sauna" />
 *
 * @example
 * // With specific size
 * <WPImage src="saunas/russian.jpg" alt="Russian sauna" size="large" />
 *
 * @example
 * // With responsive srcSet
 * <WPImage src="saunas/russian.jpg" alt="Russian sauna" responsive />
 */
export function WPImage({
  src,
  alt,
  size,
  responsive = false,
  className,
  ...props
}: WPImageProps) {
  // Use appropriate hook based on responsive flag
  const simpleUrl = useImage(src, size);
  const responsiveData = useResponsiveImage(src);

  if (responsive) {
    return (
      <picture>
        {responsiveData.webpSrc && (
          <source
            type="image/webp"
            srcSet={responsiveData.webpSrcSet || responsiveData.webpSrc}
          />
        )}
        <img
          src={responsiveData.src}
          srcSet={responsiveData.srcSet}
          alt={alt}
          className={className}
          {...props}
        />
      </picture>
    );
  }

  return (
    <img
      src={simpleUrl}
      alt={alt}
      className={className}
      {...props}
    />
  );
}

export default WPImage;
