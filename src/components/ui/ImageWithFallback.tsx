import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fallbackComponent?: React.ReactNode;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = '/placeholder-image.jpg',
  fallbackComponent,
  className,
  alt,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (hasError && fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={cn('absolute inset-0 bg-gray-200 animate-pulse rounded', className)} />
      )}
      <img
        src={hasError ? fallbackSrc : src}
        alt={alt}
        className={cn(className, isLoading && 'opacity-0')}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
};