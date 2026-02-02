import { useEffect, useRef } from "react";

/**
 * 728x90 Banner Ad (Propeller / Hilltop / Monetag style)
 * Safe for top & mid-page placements
 * Do NOT use more than once per containerId
 */
export function AdBanner728({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (!ref.current || loaded.current) return;
    loaded.current = true;

    // Inject atOptions globally (required by ad script)
    (window as any).atOptions = {
      key: "55df5565f644bb1aefe96eefc0393e90",
      format: "iframe",
      height: 90,
      width: 728,
      params: {},
    };

    const script = document.createElement("script");
    script.src =
      "https://openairtowhardworking.com/55df5565f644bb1aefe96eefc0393e90/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");

    ref.current.appendChild(script);

    return () => {
      if (ref.current?.contains(script)) {
        ref.current.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`w-full flex justify-center items-center min-h-[90px] ${className}`}
      aria-label="Advertisement"
      role="complementary"
    />
  );
}
