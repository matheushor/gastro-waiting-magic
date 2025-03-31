
/**
 * This file sets up Vite's import.meta.glob to patch react-dom imports
 * It must be imported before any Radix UI components are used
 */

// Import our shim
import reactDomShim from './react-dom-shim';

// In Vite/browser environments, we can patch the global module system
// by adding a script tag that intercepts imports before they happen
if (typeof window !== 'undefined') {
  // Create a script element to inject our patch
  const script = document.createElement('script');
  
  // This script will run before any other module loads
  script.textContent = `
    // Store the original import function
    const originalImport = window.import || Function.prototype;
    
    // Override the import function
    window.import = async function(specifier) {
      // If trying to import react-dom, return our shim instead
      if (specifier.includes('react-dom')) {
        return { 
          default: ${JSON.stringify(reactDomShim)},
          ...${JSON.stringify(reactDomShim)}
        };
      }
      // Otherwise, use the original import
      return originalImport.apply(this, arguments);
    };
  `;
  
  // Add the script to the document head
  document.head.prepend(script);
  
  // Store the shim on window for debug purposes
  (window as any).__REACT_DOM_SHIM__ = reactDomShim;
}

// Export nothing - this file is solely for its side effects
export {};
