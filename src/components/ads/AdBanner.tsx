import { useEffect, useRef } from "react";

interface AdBannerProps {
  /** Optional className for spacing */
  className?: string;
}

/**
 * Adsterra 320x50 Display Banner
 * Safe placements: between sections, header/footer areas
 * DO NOT use inside reader pages
 */
export function AdBanner({ className = "" }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || loadedRef.current) return;

    loadedRef.current = true;

    // Define Adsterra options (required)
    // @ts-ignore
    window.atOptions = {
      key: "60b102fe0a6bd36b3aa4e1cf27080918",
      format: "iframe",
      height: 50,
      width: 320,
      params: {},
    };

    const script = document.createElement("script");
    script.src =
      "https://openairtowhardworking.com/60b102fe0a6bd36b3aa4e1cf27080918/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");

    container.appendChild(script);

    return () => {
      if (container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`ad-banner w-full flex justify-center items-center min-h-[50px] ${className}`}
      aria-label="Advertisement"
      role="complementary"
    />
  );
}
