import { useState } from 'react';

export function useImageError() {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = (src: string) => {
    setFailedImages(prev => new Set([...prev, src]));
  };

  const isImageFailed = (src: string) => failedImages.has(src);

  return {
    handleImageError,
    isImageFailed,
  };
}