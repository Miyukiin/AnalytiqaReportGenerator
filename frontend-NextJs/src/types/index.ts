// src/types/index.ts

export type ChartType = "Scatter" | "Histogram" | "Radar" | "StackedLine" | "RadialBar";

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

export interface RadialBarDataPoint {
  name: string;
  uv: number;
  pv: number;
  fill: string;
}

export type ChartData =
  | ScatterDataPoint[]
  | HistogramDataPoint[]
  | RadarDataPoint[]
  | StackedLineDataPoint[]
  | RadialBarDataPoint[];

export interface Chart {
  xAxisColor: string;
  yAxisColor: string;
  id: number;
  type: ChartType;
  title: string;
  xAxis: string;
  yAxis: string;
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
