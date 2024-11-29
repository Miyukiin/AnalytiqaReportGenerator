// src/types/index.ts

export type ChartType = "Scatter" | "Histogram" | "Radar" | "Stacked Line" | "Waterfall";

export interface ScatterDataPoint {
  x: number;
  y: number;
}

export interface HistogramDataPoint {
  name: string;
  value: number;
}

export interface RadarDataPoint {
  subject: string;
  value: number;
}

export interface StackedLineDataPoint {
  name: string;
  uv: number;
  pv: number;
}

export type ChartData =
  | ScatterDataPoint[]
  | HistogramDataPoint[]
  | RadarDataPoint[]
  | StackedLineDataPoint[]
  | any[]; // Replace `any[]` with a specific type for Waterfall when implemented

export interface Chart {
  id: number;
  type: ChartType;
  data: ChartData;
  x: number;
  y: number;
  width: number;
  height: number;
}
