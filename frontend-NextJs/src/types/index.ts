// src/types/index.ts

export type ChartType = "Scatter" | "PositiveNegativeBar" | "Radar" | "StackedLine" | "RadialBar";

export interface ScatterDataPoint {
  x: number;
  y: number;
}

export interface PositiveNegativeBarDataPoint { 
  PNBname: string;
  PNBvalue1: number;
  PNBvalue2?: number;
  PNBvalue3?: number;
  PNBvalue4?: number;
  PNBvalue5?: number;
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
  | PositiveNegativeBarDataPoint[]
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

  xAxis1?: string;                  // PositiveNegativeBar First x Axis.
  
  NumericColumns?: Array<string>;   // Radar All Numeric Columns Selected
  RowsSelected?:  Array<number>;    // Radar All Rows indexes Selected To be Shown in Radar
  
  RadialColumn?: string;            // Radial Bar Selected Column

  StackedLineColumns?: Array<string>;       // Stacked Line Selected Numeric Column
  LineXAxes?: Array<number>         // StackedLine All X Axis Row Indexes

  PNBColumns?: Array<string>;       // PositiveNegativeBar Selected Numeric Column
  PNBLineXAxes?: Array<number>         // PositiveNegativeBar All X Axis Row Indexes
}

export interface Page {
  id: number;
  name: string;
  charts: Chart[];
  remark: string;
}
