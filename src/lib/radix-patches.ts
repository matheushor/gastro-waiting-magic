
/**
 * This file contains patches for Radix UI components to work with React 18
 * It must be imported before any Radix UI components are used
 */

// Apply patches to make Radix UI work with React 18
// This involves intercepting imports for 'react-dom'
import './react-dom-patch-loader';

// Export a dummy function to ensure the file is included in the bundle
export function applyRadixPatches() {
  console.debug('Applied Radix UI patches for React 18 compatibility');
}
