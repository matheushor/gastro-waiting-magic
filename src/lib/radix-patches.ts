
/**
 * This file contains patches for Radix UI components to work with React 18
 * It must be imported before any Radix UI components are used
 */

// Apply the react-dom shim to window object to intercept imports
import reactDomShim from './react-dom-shim';

// Define a non-enumerable property on window to avoid polluting the global namespace
Object.defineProperty(window, '__REACT_DOM_SHIM__', {
  value: reactDomShim,
  writable: false,
  enumerable: false
});

// Export a dummy function to ensure the file is not tree-shaken
export function applyRadixPatches() {
  // This function is just a marker to ensure this file is included
  console.debug('Applied Radix UI patches for React 18 compatibility');
}
