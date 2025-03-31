
/**
 * Custom type declarations to help with incompatible type definitions
 */

// Fix for d3 type issues by declaring modules without using their problematic type definitions
declare module 'd3-scale' {
  export * from 'd3-scale';
}

declare module 'd3-shape' {
  export * from 'd3-shape';
}

// Handle recharts components that depend on d3
declare module 'recharts' {
  export * from 'recharts';
}

// If there are any other problematic modules, we can add them here

// Declare global types if needed
interface Window {
  // Add any window extensions here if needed
}
