
// Apply patches before any other imports
import './lib/radix-patches';

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure we're using React 18's createRoot API
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Failed to find root element");
}
