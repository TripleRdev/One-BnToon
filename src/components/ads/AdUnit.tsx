import { useMemo } from "react";

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
 * Adsterra ad component using iframe srcdoc for complete isolation.
 * Each ad gets its own window context, preventing atOptions conflicts.
 */
export function AdUnit({
  adKey,
  width,
  height,
  className = "",
  placementId,
}: AdsterraAdProps) {
  // Generate the isolated HTML document for the ad
  const adHTML = useMemo(() => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      display: flex; 
      justify-content: center; 
      align-items: center;
      min-height: 100%;
      background: transparent;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key': '${adKey}',
      'format': 'iframe',
      'height': ${height},
      'width': ${width},
      'params': {}
    };
  </script>
  <script type="text/javascript" src="//www.highperformanceformat.com/${adKey}/invoke.js"></script>
</body>
</html>
    `.trim();
  }, [adKey, width, height]);

  return (
    <div 
      className={`flex justify-center items-center ${className}`}
      data-ad-placement={placementId}
    >
      <iframe
        srcDoc={adHTML}
        width={width}
        height={height}
        style={{
          border: "none",
          overflow: "hidden",
          display: "block",
        }}
        scrolling="no"
        title={`Advertisement - ${placementId}`}
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
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
  const adHTML = useMemo(() => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      display: flex; 
      justify-content: center; 
      align-items: center;
      min-height: 100%;
      background: transparent;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <script async="async" data-cfasync="false" src="//www.highperformanceformat.com/${adKey}/invoke.js"></script>
  <div id="container-${adKey}"></div>
</body>
</html>
    `.trim();
  }, [adKey]);

  return (
    <div 
      className={`flex justify-center items-center ${className}`}
      data-ad-placement={placementId}
    >
      <iframe
        srcDoc={adHTML}
        width={width}
        height={height}
        style={{
          border: "none",
          overflow: "hidden",
          display: "block",
        }}
        scrolling="no"
        title={`Advertisement - ${placementId}`}
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}
