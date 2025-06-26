// Performance monitoring utility for tracking loading times
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Mark the start of a performance measurement
  markStart(name: string): void {
    performance.mark(`${name}-start`);
  }

  // Mark the end and calculate duration
  markEnd(name: string): number {
    performance.mark(`${name}-end`);
    try {
      performance.measure(name, `${name}-start`, `${name}-end`);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      const duration = measure.duration;
      this.metrics.set(name, duration);
      
      // Log slow operations in development
      if (process.env.NODE_ENV === 'development' && duration > 100) {
        console.warn(`⚠️ Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error);
      return 0;
    }
  }

  // Get all collected metrics
  getMetrics(): Map<string, number> {
    return new Map(this.metrics);
  }

  // Monitor resource loading performance
  monitorResourceLoading(): void {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const resource = entry as PerformanceResourceTiming;
        
        // Log slow-loading resources
        if (resource.duration > 500) {
          console.warn(`🐌 Slow resource: ${resource.name} took ${resource.duration.toFixed(2)}ms`);
        }
        
        // Track critical resource types
        if (resource.name.includes('.gif') || 
            resource.name.includes('.mp3') || 
            resource.name.includes('.png') ||
            resource.name.includes('.jpg')) {
          this.metrics.set(`resource-${resource.name.split('/').pop()}`, resource.duration);
        }
      });
    });

    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.set('resource', resourceObserver);
  }

  // Monitor navigation performance
  monitorNavigation(): void {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    const navObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const nav = entry as PerformanceNavigationTiming;
        
        const metrics = {
          'dns-lookup': nav.domainLookupEnd - nav.domainLookupStart,
          'tcp-connect': nav.connectEnd - nav.connectStart,
          'server-response': nav.responseStart - nav.requestStart,
          'dom-content-loaded': nav.domContentLoadedEventEnd - nav.fetchStart,
          'page-load': nav.loadEventEnd - nav.fetchStart
        };

        Object.entries(metrics).forEach(([name, duration]) => {
          this.metrics.set(name, duration);
          
          // Warn about slow navigation steps
          if (duration > 1000) {
            console.warn(`🐌 Slow navigation step: ${name} took ${duration.toFixed(2)}ms`);
          }
        });
      });
    });

    navObserver.observe({ entryTypes: ['navigation'] });
    this.observers.set('navigation', navObserver);
  }

  // Report performance summary
  reportSummary(): void {
    if (process.env.NODE_ENV === 'development') {
      console.group('📊 Performance Summary');
      
      this.metrics.forEach((duration, name) => {
        const emoji = duration > 1000 ? '🔴' : duration > 500 ? '🟡' : '🟢';
        console.log(`${emoji} ${name}: ${duration.toFixed(2)}ms`);
      });
      
      console.groupEnd();
    }
  }

  // Clean up observers
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Convenience functions
export const monitor = PerformanceMonitor.getInstance();

export const measureAsyncOperation = async <T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> => {
  monitor.markStart(name);
  try {
    const result = await operation();
    monitor.markEnd(name);
    return result;
  } catch (error) {
    monitor.markEnd(name);
    throw error;
  }
};

export const measureSyncOperation = <T>(
  name: string,
  operation: () => T
): T => {
  monitor.markStart(name);
  try {
    const result = operation();
    monitor.markEnd(name);
    return result;
  } catch (error) {
    monitor.markEnd(name);
    throw error;
  }
}; 