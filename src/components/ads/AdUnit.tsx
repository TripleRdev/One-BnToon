 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/components/ads/AdUnit.tsx b/src/components/ads/AdUnit.tsx
index 33bc119485f77c20f3a33360cde9f73fe9280327..5740a4384ddbc295c15eee726ae51cb08488312c 100644
--- a/src/components/ads/AdUnit.tsx
+++ b/src/components/ads/AdUnit.tsx
@@ -1,133 +1,167 @@
 import { useEffect, useRef, useState } from "react";
+import { deleteAdRegistry, hasAdRegistry, setAdRegistry } from "./adRegistry";
+let adLoadQueue: Promise<void> = Promise.resolve();
 
-/**
- * Singleton registry to track loaded ad units and prevent duplicates
- */
-const adRegistry = new Map<string, boolean>();
-const loadedScripts = new Set<string>();
+const enqueueAdLoad = (load: () => Promise<void>) => {
+  adLoadQueue = adLoadQueue.then(load).catch(() => undefined);
+  return adLoadQueue;
+};
 
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
+  /** Use Adsterra's required container id (e.g., container-<adKey>) */
+  usesContainerId?: boolean;
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
+  usesContainerId = false,
 }: AdUnitProps) {
   const containerRef = useRef<HTMLDivElement>(null);
-  const mountedRef = useRef(false);
   const [adBlocked, setAdBlocked] = useState(false);
 
   // Stable container ID based on placement
-  const containerId = `adsterra-${placementId}`;
+  const containerId = usesContainerId ? `container-${adKey}` : `adsterra-${placementId}`;
 
   useEffect(() => {
-    // Prevent StrictMode double-mount
-    if (mountedRef.current) return;
-    mountedRef.current = true;
+    setAdBlocked(false);
+    let isActive = true;
 
     // Check if this placement already loaded
-    if (adRegistry.has(containerId)) {
+    if (hasAdRegistry(containerId)) {
       return;
     }
 
     const container = containerRef.current;
     if (!container) return;
 
     // Mark as loading
-    adRegistry.set(containerId, true);
+    setAdRegistry(containerId);
 
     // Clear any existing content
     container.innerHTML = "";
 
     // Create unique namespace for this ad's options
     const optionsVarName = `atOptions_${placementId.replace(/-/g, "_")}`;
-
-    // Inline config script with SCOPED variable
-    const configScript = document.createElement("script");
-    configScript.type = "text/javascript";
-    configScript.textContent = `
-      window['${optionsVarName}'] = {
-        'key': '${adKey}',
-        'format': 'iframe',
-        'height': ${height},
-        'width': ${width},
-        'params': {}
-      };
-      window.atOptions = window['${optionsVarName}'];
-    `;
+    const adOptions = {
+      key: adKey,
+      format: "iframe",
+      height,
+      width,
+      params: {},
+    };
+    const globalWindow = window as typeof window & { [key: string]: unknown };
+    if (!usesContainerId) {
+      globalWindow[optionsVarName] = adOptions;
+    }
 
     // Invoke script (Adsterra domain)
     const invokeScript = document.createElement("script");
-    const scriptUrl = `https://www.topcreativeformat.com/${adKey}/invoke.js`;
+    const scriptUrl = `https://openairtowhardworking.com/${adKey}/invoke.js`;
     invokeScript.src = scriptUrl;
-    invokeScript.async = true;
+    invokeScript.async = usesContainerId;
+    if (!usesContainerId) {
+      invokeScript.defer = false;
+    }
     invokeScript.setAttribute("data-cfasync", "false");
+    invokeScript.referrerPolicy = "no-referrer-when-downgrade";
+    invokeScript.crossOrigin = "anonymous";
 
     // Error handling for ad blockers
-    invokeScript.onerror = () => {
-      setAdBlocked(true);
-      adRegistry.delete(containerId);
+    let resolved = false;
+    let resolveLoad: (() => void) | null = null;
+    const finalize = () => {
+      if (resolved) return;
+      resolved = true;
+      if (invokeScript.parentNode) {
+        invokeScript.parentNode.removeChild(invokeScript);
+      }
+      if (!usesContainerId && window.atOptions === adOptions) {
+        delete window.atOptions;
+      }
     };
 
     // Timeout fallback for silent blocks
     const timeout = setTimeout(() => {
       if (container.children.length <= 2) {
         // Only our scripts, no ad iframe
-        setAdBlocked(true);
+        if (isActive) {
+          setAdBlocked(true);
+        }
+        deleteAdRegistry(containerId);
+        container.innerHTML = "";
+        resolveLoad?.();
+        void finalize();
       }
     }, 5000);
 
-    container.appendChild(configScript);
-    container.appendChild(invokeScript);
+    void enqueueAdLoad(
+      () =>
+        new Promise((resolve) => {
+          resolveLoad = resolve;
+          if (!containerRef.current) {
+            resolve();
+            return;
+          }
+
+          invokeScript.onload = () => {
+            resolve();
+            void finalize();
+          };
+          invokeScript.onerror = () => {
+            if (isActive) {
+              setAdBlocked(true);
+            }
+            deleteAdRegistry(containerId);
+            resolve();
+            void finalize();
+          };
+
+          if (!usesContainerId) {
+            window.atOptions = adOptions;
+          }
+          container.appendChild(invokeScript);
+        })
+    );
 
     return () => {
+      isActive = false;
       clearTimeout(timeout);
-      // Don't remove from registry on unmount - keeps ad persistent during SPA navigation
+      deleteAdRegistry(containerId);
     };
-  }, [adKey, width, height, containerId, placementId]);
-
-  // Graceful fallback when blocked
-  if (adBlocked) {
-    return null; // Silent fail, no broken UI
-  }
+  }, [adKey, width, height, containerId, placementId, usesContainerId]);
 
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
-
-/**
- * Clear ad registry (useful for testing or forced refresh)
- */
-export function resetAdRegistry() {
-  adRegistry.clear();
-  loadedScripts.clear();
-}
 
EOF
)
