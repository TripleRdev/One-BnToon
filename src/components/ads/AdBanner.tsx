import { useEffect, useRef } from "react";

interface AdBannerProps {
  /** Unique container ID for the ad script */
  containerId: string;
  /** Script URL from ad network */
  scriptUrl: string;
  /** Optional additional className */
  className?: string;
}

/**
 * Horizontal banner ad component - async loading, non-blocking
 * Safe placements: header area, between sections, footer area
 * NEVER use inside reader pages or between chapter images
 */
export function AdBanner({ containerId, scriptUrl, className = "" }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || loadedRef.current) return;

    // Check if container already has the script
    if (container.querySelector("script")) return;

    loadedRef.current = true;

    // Create script element with async loading
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    
    // Append to container, not body - keeps ads contained
    container.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, [scriptUrl]);

  return (
    <div
      ref={containerRef}
      id={containerId}
      className={`ad-banner w-full flex items-center justify-center min-h-[90px] ${className}`}
      aria-label="Advertisement"
      role="complementary"
    />
  );
}

