import { useEffect, useRef } from "react";

interface AdsterraSidebarProps {
  containerId: string;
  scriptUrl: string;
  className?: string;
}

export function AdsterraSidebar({
  containerId,
  scriptUrl,
  className = "",
}: AdsterraSidebarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.setAttribute("data-cfasync", "false");

    containerRef.current?.appendChild(script);
  }, [scriptUrl]);

  return (
    <div className={className}>
      <div
        id={containerId}
        ref={containerRef}
        className="flex justify-center"
        aria-label="Advertisement"
      />
    </div>
  );
}
