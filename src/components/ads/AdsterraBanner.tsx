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

    // define global atOptions BEFORE script loads
    (window as any).atOptions = {
      key: adKey,
      format: "iframe",
      width,
      height,
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
      className={`w-full flex justify-center items-center min-h-[${height}px] ${className}`}
      aria-label="Advertisement"
    />
  );
}
