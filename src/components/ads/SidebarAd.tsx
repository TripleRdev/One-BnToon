import { useEffect, useRef } from "react";

interface SidebarAdProps {
  /** Unique container ID for the ad script */
  containerId: string;
  /** Script URL from ad network */
  scriptUrl: string;
  /** Optional additional className */
  className?: string;
}

/**
 * Sidebar ad component - async loading, non-blocking
 * Safe for sidebar placements only
 * NEVER use inside reader pages
 */
export function SidebarAd({ containerId, scriptUrl, className = "" }: SidebarAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || loadedRef.current) return;

    if (container.querySelector("script")) return;

    loadedRef.current = true;

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    
    container.appendChild(script);

    return () => {
      if (container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, [scriptUrl]);

  return (
    <div
      ref={containerRef}
      id={containerId}
      className={`ad-sidebar rounded-lg overflow-hidden ${className}`}
      aria-label="Advertisement"
      role="complementary"
    />
  );
}
