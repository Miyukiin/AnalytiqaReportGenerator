// src/types/index.ts

export type ChartType = "Scatter" | "Histogram" | "Radar" | "StackedLine" | "RadialBar";

export interface ScatterDataPoint {
  x: number;
  y: number;
}

export interface HistogramDataPoint { 
  name: string;
  A: number;
}

export interface RadarDataPoint {
  subject: string;
  A: number;
  fullMark?: number;
}

export interface StackedLineDataPoint {
  name: string;
  line1: number;
  line2: number;
  line3: number;
}

export interface RadialBarDataPoint {
  name: string;
  uv: number;
  pv: number;
  fill?: string;
}

export type ChartData =
  | ScatterDataPoint[]
  | HistogramDataPoint[]
  | RadarDataPoint[]
  | StackedLineDataPoint[]
  | RadialBarDataPoint[];

export interface Chart {
  id: number;
  type: ChartType;
  title?: string;
  xAxis?: string;          // For charts needing an X-axis field
  yAxis?: string;          // For charts needing a Y-axis field
  xAxisColor?: string;
  yAxisColor?: string;
  uvAxis?: string;         // For charts needing a UV field (RadialBar)
  pvAxis?: string;         // For charts needing a PV field (RadialBar)
  line1Axis?: string;      // For StackedLine chart's Line 1
  line2Axis?: string;      // For StackedLine chart's Line 2
  line3Axis?: string;      // For StackedLine chart's Line 3
  subjectAxis?: string;
  nameAxis?: string;    
  aAxis?: string;      
  data: ChartData;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Page {
  id: number;
  name: string;
  charts: Chart[];
  remark: string;
}
