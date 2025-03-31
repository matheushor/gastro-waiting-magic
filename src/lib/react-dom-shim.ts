
/**
 * This file is a workaround for React 18 compatibility with Radix UI components
 * that expect a default export from react-dom
 */
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';

// Create a compatibility layer for components expecting a default export
const reactDomCompat = {
  ...ReactDOM,
  ...ReactDOMClient,
  // Ensure createPortal is accessible
  createPortal: ReactDOM.createPortal
};

export default reactDomCompat;
export * from 'react-dom';
