
/**
 * This file is a shim for react-dom to provide compatibility with Radix UI components
 * that expect a default export from react-dom in React 18
 */
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';

// Create a compatibility layer for components expecting a default export
const reactDomCompat = {
  ...ReactDOM,
  ...ReactDOMClient,
  // Ensure createPortal is accessible
  createPortal: ReactDOM.createPortal,
  // Ensure default is also available on the export itself
  default: ReactDOM
};

// Export as both named and default
export default reactDomCompat;
export * from 'react-dom';
