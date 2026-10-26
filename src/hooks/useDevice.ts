import { useState, useEffect } from 'react';

export interface DeviceInfo {
  isMobile: boolean; // width < 768px (smartphones)
  isTablet: boolean; // 768px <= width < 1024px (iPads / tablets)
  isDesktop: boolean; // width >= 1024px (laptops & desktops)
  isTouch: boolean;
  orientation: 'portrait' | 'landscape';
  width: number;
  height: number;
}

export function useDevice(): DeviceInfo {
  const getDeviceInfo = (): DeviceInfo => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouch: false,
        orientation: 'landscape',
        width: 1200,
        height: 800,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      isTouch,
      orientation: height > width ? 'portrait' : 'landscape',
      width,
      height,
    };
  };

  const [device, setDevice] = useState<DeviceInfo>(getDeviceInfo);

  useEffect(() => {
    const handleResize = () => {
      setDevice(getDeviceInfo());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return device;
}
