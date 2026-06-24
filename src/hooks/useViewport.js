import { useEffect, useState } from "react";

// Breakpoints (see docs/mobile-pwa-plan.md §1.3)
export const MOBILE_MAX = 640;
export const TABLET_MAX = 1024;

function read() {
  if (typeof window === "undefined") {
    return { width: 1280, isMobile: false, isTablet: false, isDesktop: true };
  }
  const width = window.innerWidth;
  return {
    width,
    isMobile: width <= MOBILE_MAX,
    isTablet: width > MOBILE_MAX && width <= TABLET_MAX,
    isDesktop: width > TABLET_MAX,
  };
}

// Single shared viewport hook. Returns { width, isMobile, isTablet, isDesktop }.
export function useViewport() {
  const [vp, setVp] = useState(read);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let frame = null;
    const onResize = () => {
      // throttle to one update per animation frame
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        setVp(read());
      });
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return vp;
}
