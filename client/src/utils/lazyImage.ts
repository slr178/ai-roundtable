// Utility for lazy loading images with performance optimization
export const lazyLoadImage = (src: string, priority: 'high' | 'low' = 'low'): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Set loading strategy based on priority
    if (priority === 'low') {
      img.loading = 'lazy';
    }
    
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Preload critical images for faster rendering
export const preloadCriticalImages = (images: string[]): Promise<HTMLImageElement[]> => {
  return Promise.all(images.map(src => lazyLoadImage(src, 'high')));
};

// Load images in batches to avoid overwhelming the network
export const batchLoadImages = async (images: string[], batchSize: number = 3): Promise<void> => {
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);
    await Promise.all(batch.map(src => lazyLoadImage(src, 'low')));
    // Small delay between batches to prevent blocking
    if (i + batchSize < images.length) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
};

// Intersection Observer for lazy loading images when they come into viewport
export const createLazyImageObserver = (callback: (entry: IntersectionObserverEntry) => void) => {
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver
    return null;
  }

  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, {
    rootMargin: '50px 0px', // Start loading 50px before image enters viewport
    threshold: 0.1
  });
}; 