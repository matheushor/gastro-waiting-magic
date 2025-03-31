
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
  export const curveLinear: any; // Fixed from function to const
  // Add any other d3-shape functions you're using
}

declare module 'd3-time' {
  export function timeDay(): any;
  export function timeMonth(): any;
  export function timeYear(): any;
}

declare module 'd3-path' {
  export function path(): any;
}

// Bypass recharts that depends on d3
declare module 'recharts' {
  import { ComponentType, ReactNode } from 'react';
  
  // Define basic component props
  interface BaseProps {
    className?: string;
    style?: React.CSSProperties;
    children?: ReactNode;
  }
  
  // Add LegendProps interface
  export interface LegendProps extends BaseProps {
    payload?: any[];
    verticalAlign?: string;
    height?: number;
    width?: number;
    iconSize?: number;
    layout?: 'horizontal' | 'vertical';
    align?: 'left' | 'center' | 'right';
    iconType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye';
    // Add other necessary properties
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
  export const Legend: ComponentType<LegendProps & any>;
  export const ResponsiveContainer: ComponentType<BaseProps & any>;
  
  // Add any other recharts components you're using
}

// Add declaration for prop-types
declare module 'prop-types' {
  const propTypes: any;
  export default propTypes;
}

// Declare global types if needed
interface Window {
  // Add any window extensions here if needed
}
