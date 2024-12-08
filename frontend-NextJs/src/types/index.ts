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
  header: string;
  row1: number;
  row2: number;
}

export interface StackedLineDataPoint {
  SLname: string;
  SLvalue1: number;
  SLvalue2?: number;
  SLvalue3?: number;
  SLvalue4?: number;
  SLvalue5?: number;
}

export interface RadialBarDataPoint {
  name: string;
  value: number;
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

  xAxis1?: string;                  // Histogram First x Axis.
  
  NumericColumns?: Array<string>;   // Radar All Numeric Columns Selected
  RowsSelected?:  Array<number>;    // Radar All Rows indexes Selected To be Shown in Radar
  
  RadialColumn?: string;            // Radial Bar Selected Column

  StackedLineColumns?: Array<string>;       // Stacked Line Selected Numeric Column
  LineXAxes?: Array<number>         // StackedLine All X Axis Row Indexes

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
