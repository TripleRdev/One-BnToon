import { useEffect, useMemo, useRef } from "react";

interface AdsterraAdProps {
  /** Unique Adsterra ad key */
  adKey: string;
  /** Ad width in pixels */
  width: number;
  /** Ad height in pixels */
  height: number;
  /** Optional className for wrapper */
  className?: string;
  /** Unique placement ID for tracking */
  placementId: string;
}

/**
 * Adsterra ad component using in-page script injection.
 */
export function AdUnit({
  adKey,
  width,
  height,
  className = "",
  placementId,
}: AdsterraAdProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    (window as typeof window & { atOptions?: Record<string, unknown> }).atOptions = {
      key: adKey,
      format: "iframe",
      height,
      width,
      params: {},
    };

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [adKey, height, width]);

  return (
    <div 
      className={`flex justify-center items-center ${className}`}
      data-ad-placement={placementId}
    >
      <div
        ref={containerRef}
        style={{
          width,
          height,
          overflow: "hidden",
          display: "block",
        }}
        aria-label={`Advertisement - ${placementId}`}
      />
    </div>
  );
}

/**
 * Native/Banner ad component using container ID approach
 * For ads that require a specific container element
 */
export function NativeAdUnit({
  adKey,
  width,
  height,
  className = "",
  placementId,
}: AdsterraAdProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerId = useMemo(() => `container-${adKey}`, [adKey]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    const adContainer = document.createElement("div");
    adContainer.id = containerId;
    container.appendChild(adContainer);

    const script = document.createElement("script");
    script.async = true;
    script.type = "text/javascript";
    script.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
    script.dataset.cfasync = "false";
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [adKey, containerId]);

  return (
    <div 
      className={`flex justify-center items-center ${className}`}
      data-ad-placement={placementId}
    >
      <div
        ref={containerRef}
        style={{
          width,
          height,
          overflow: "hidden",
          display: "block",
        }}
        aria-label={`Advertisement - ${placementId}`}
      />
    </div>
  );
}
