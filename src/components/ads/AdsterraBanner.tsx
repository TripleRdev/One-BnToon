import { useEffect, useRef } from "react";

interface AdsterraBannerProps {
  adKey: string;
  width: number;
  height: number;
  className?: string;
}

export function AdsterraBanner({
  adKey,
  width,
  height,
  className = "",
}: AdsterraBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    // VERY IMPORTANT: isolate atOptions
    (window as any).atOptions = {
      key: adKey,
      format: "iframe",
      height,
      width,
      params: {},
    };

    const script = document.createElement("script");
    script.src = `https://openairtowhardworking.com/${adKey}/invoke.js`;
    script.async = true;
    script.setAttribute("data-cfasync", "false");

    containerRef.current?.appendChild(script);
  }, [adKey, width, height]);

  return (
    <div
      ref={containerRef}
      className={`flex justify-center items-center ${className}`}
      style={{ minHeight: height }}
      aria-label="Advertisement"
    />
  );
}
