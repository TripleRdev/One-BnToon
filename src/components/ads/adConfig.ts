/**
 * Ad configuration - centralized ad network settings
 * 
 * IMPORTANT: Only use non-intrusive ad types
 * - Banner ads ✓
 * - Sidebar ads ✓
 * - Footer ads ✓
 * 
 * FORBIDDEN:
 * - Pop-under/pop-up ads ✗
 * - Click-redirect ads ✗
 * - Full-page takeover ads ✗
 * - Ads between chapter images ✗
 */

export const AD_CONFIG = {
  // Native banner ad (horizontal)
  nativeBanner: {
    containerId: "container-c35c6f6f42ee902bbfca715ccd1d497f",
    scriptUrl: "https://pl28562322.effectivegatecpm.com/c35c6f6f42ee902bbfca715ccd1d497f/invoke.js",
  },
  
  // Sidebar ad placeholder - configure when you have a sidebar ad unit
  sidebar: {
    containerId: "container-sidebar-ad",
    scriptUrl: "", // Add sidebar ad script URL when available
  },
  
  // Footer ad placeholder
  footer: {
    containerId: "container-footer-ad", 
    scriptUrl: "", // Add footer ad script URL when available
  },
} as const;

/**
 * Pages where ads are ALLOWED
 */
export const AD_ALLOWED_PAGES = [
  "/",
  "/browse",
  "/series/*",
  "/dmca",
] as const;

/**
 * Pages where ads are FORBIDDEN (reader must be distraction-free)
 */
export const AD_FORBIDDEN_PAGES = [
  "/read/*",
  "/admin/*",
] as const;
