
/**
 * Custom type declarations to help with incompatible type definitions
 */

// Completely bypass the problematic type definition files
declare module 'd3-scale' {
  // Provide minimal definitions needed for the project
  export function scaleLinear(): any;
  export function scaleTime(): any;
  export function scaleBand(): any;
  export function scaleOrdinal(): any;
  // Add any other d3-scale functions you're using
  export const schemeCategory10: readonly string[];
}

declare module 'd3-shape' {
  // Provide minimal definitions needed for the project
  export function line(): any;
  export function area(): any;
  export function arc(): any;
  export function pie(): any;
  export function curveLinear: any;
  // Add any other d3-shape functions you're using
}

// Bypass recharts that depends on d3
declare module 'recharts' {
  import { ComponentType, ReactNode, SVGProps } from 'react';
  
  // Define basic component props
  interface BaseProps {
    className?: string;
    style?: React.CSSProperties;
    children?: ReactNode;
  }
  
  // Export chart components
  export const LineChart: ComponentType<BaseProps & any>;
  export const Line: ComponentType<BaseProps & any>;
  export const BarChart: ComponentType<BaseProps & any>;
  export const Bar: ComponentType<BaseProps & any>;
  export const PieChart: ComponentType<BaseProps & any>;
  export const Pie: ComponentType<BaseProps & any>;
  export const AreaChart: ComponentType<BaseProps & any>;
  export const Area: ComponentType<BaseProps & any>;
  export const XAxis: ComponentType<BaseProps & any>;
  export const YAxis: ComponentType<BaseProps & any>;
  export const CartesianGrid: ComponentType<BaseProps & any>;
  export const Tooltip: ComponentType<BaseProps & any>;
  export const Legend: ComponentType<BaseProps & any>;
  export const ResponsiveContainer: ComponentType<BaseProps & any>;
  
  // Add any other recharts components you're using
}

// Declare global types if needed
interface Window {
  // Add any window extensions here if needed
}
