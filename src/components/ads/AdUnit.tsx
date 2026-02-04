import { useEffect, useRef, useState } from "react";
import { deleteAdRegistry, hasAdRegistry, setAdRegistry } from "./adRegistry";

interface AdUnitProps {
  /** Unique Adsterra ad key */
  adKey: string;
  /** Ad width in pixels */
  width: number;
  /** Ad height in pixels */
  height: number;
  /** Optional className for wrapper */
  className?: string;
  /** Unique placement ID (e.g., "home-banner", "browse-sidebar") */
  placementId: string;
  /** Use Adsterra's required container id (e.g., container-<adKey>) */
  usesContainerId?: boolean;
}

/**
 * Unified Adsterra ad component with:
 * - Singleton script loading (no duplicates)
 * - StrictMode-safe mounting
 * - Graceful ad-blocker fallback
 * - SPA routing compatible
 */
export function AdUnit({
  adKey,
  width,
  height,
  className = "",
  placementId,
  usesContainerId = false,
}: AdUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [adBlocked, setAdBlocked] = useState(false);

  // Stable container ID based on placement
  const containerId = usesContainerId ? `container-${adKey}` : `adsterra-${placementId}`;

  useEffect(() => {
    setAdBlocked(false);
    let isActive = true;

    // Check if this placement already loaded
    if (hasAdRegistry(containerId)) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Mark as loading
    setAdRegistry(containerId);

    // Clear any existing content
    container.innerHTML = "";

    // For non-container ads, we need to set atOptions BEFORE loading script
    if (!usesContainerId) {
      // Create inline script to set atOptions
      const optionsScript = document.createElement("script");
      optionsScript.textContent = `
        window.atOptions = {
          'key': '${adKey}',
          'format': 'iframe',
          'height': ${height},
          'width': ${width},
          'params': {}
        };
      `;
      container.appendChild(optionsScript);
    }

    // Invoke script (Adsterra domain)
    const invokeScript = document.createElement("script");
    invokeScript.src = `https://openairtowhardworking.com/${adKey}/invoke.js`;
    invokeScript.async = true;
    invokeScript.setAttribute("data-cfasync", "false");

    // Error handling for ad blockers
    invokeScript.onerror = () => {
      if (isActive) {
        setAdBlocked(true);
      }
      deleteAdRegistry(containerId);
    };

    container.appendChild(invokeScript);

    // Timeout fallback for silent blocks (e.g., network issues)
    const timeout = setTimeout(() => {
      // Check if ad iframe was created
      const hasIframe = container.querySelector("iframe");
      if (!hasIframe && isActive) {
        setAdBlocked(true);
        deleteAdRegistry(containerId);
        container.innerHTML = "";
      }
    }, 8000);

    return () => {
      isActive = false;
      clearTimeout(timeout);
      deleteAdRegistry(containerId);
    };
  }, [adKey, width, height, containerId, placementId, usesContainerId]);

  return (
    <div
      id={containerId}
      ref={containerRef}
      className={`flex justify-center items-center ${className} ${
        adBlocked ? "hidden" : ""
      }`}
      style={adBlocked ? undefined : { minHeight: height, minWidth: width }}
      aria-label="Advertisement"
      role="complementary"
    />
  );
}
