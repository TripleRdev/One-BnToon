 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/components/ads/AdUnit.tsx b/src/components/ads/AdUnit.tsx
index 33bc119485f77c20f3a33360cde9f73fe9280327..d6a6af4041312a5147c25dbb6b710e58b0cbc9c3 100644
--- a/src/components/ads/AdUnit.tsx
+++ b/src/components/ads/AdUnit.tsx
@@ -13,121 +13,118 @@ interface AdUnitProps {
   width: number;
   /** Ad height in pixels */
   height: number;
   /** Optional className for wrapper */
   className?: string;
   /** Unique placement ID (e.g., "home-banner", "browse-sidebar") */
   placementId: string;
 }
 
 /**
  * Unified Adsterra ad component with:
  * - Singleton script loading (no duplicates)
  * - StrictMode-safe mounting
  * - Scoped atOptions (no global conflicts)
  * - Graceful ad-blocker fallback
  * - SPA routing compatible
  */
 export function AdUnit({
   adKey,
   width,
   height,
   className = "",
   placementId,
 }: AdUnitProps) {
   const containerRef = useRef<HTMLDivElement>(null);
-  const mountedRef = useRef(false);
   const [adBlocked, setAdBlocked] = useState(false);
 
   // Stable container ID based on placement
   const containerId = `adsterra-${placementId}`;
 
   useEffect(() => {
-    // Prevent StrictMode double-mount
-    if (mountedRef.current) return;
-    mountedRef.current = true;
+    setAdBlocked(false);
 
     // Check if this placement already loaded
     if (adRegistry.has(containerId)) {
       return;
     }
 
     const container = containerRef.current;
     if (!container) return;
 
     // Mark as loading
     adRegistry.set(containerId, true);
 
     // Clear any existing content
     container.innerHTML = "";
 
     // Create unique namespace for this ad's options
     const optionsVarName = `atOptions_${placementId.replace(/-/g, "_")}`;
 
     // Inline config script with SCOPED variable
     const configScript = document.createElement("script");
     configScript.type = "text/javascript";
     configScript.textContent = `
       window['${optionsVarName}'] = {
         'key': '${adKey}',
         'format': 'iframe',
         'height': ${height},
         'width': ${width},
         'params': {}
       };
       window.atOptions = window['${optionsVarName}'];
     `;
 
     // Invoke script (Adsterra domain)
     const invokeScript = document.createElement("script");
     const scriptUrl = `https://www.topcreativeformat.com/${adKey}/invoke.js`;
     invokeScript.src = scriptUrl;
-    invokeScript.async = true;
+    invokeScript.async = false;
+    invokeScript.defer = false;
     invokeScript.setAttribute("data-cfasync", "false");
 
     // Error handling for ad blockers
     invokeScript.onerror = () => {
       setAdBlocked(true);
       adRegistry.delete(containerId);
     };
 
     // Timeout fallback for silent blocks
     const timeout = setTimeout(() => {
       if (container.children.length <= 2) {
         // Only our scripts, no ad iframe
         setAdBlocked(true);
+        adRegistry.delete(containerId);
+        container.innerHTML = "";
       }
     }, 5000);
 
     container.appendChild(configScript);
     container.appendChild(invokeScript);
 
     return () => {
       clearTimeout(timeout);
-      // Don't remove from registry on unmount - keeps ad persistent during SPA navigation
+      adRegistry.delete(containerId);
     };
   }, [adKey, width, height, containerId, placementId]);
 
-  // Graceful fallback when blocked
-  if (adBlocked) {
-    return null; // Silent fail, no broken UI
-  }
-
   return (
     <div
       id={containerId}
       ref={containerRef}
-      className={`flex justify-center items-center ${className}`}
-      style={{ minHeight: height, minWidth: width }}
+      className={`flex justify-center items-center ${className} ${
+        adBlocked ? "hidden" : ""
+      }`}
+      style={adBlocked ? undefined : { minHeight: height, minWidth: width }}
       aria-label="Advertisement"
       role="complementary"
     />
   );
 }
 
 /**
  * Clear ad registry (useful for testing or forced refresh)
  */
 export function resetAdRegistry() {
   adRegistry.clear();
   loadedScripts.clear();
 }
 
EOF
)
