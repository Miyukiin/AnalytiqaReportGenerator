// src/components/chartData.tsx
import { Chart, ScatterDataPoint, HistogramDataPoint, RadarDataPoint, StackedLineDataPoint, RadialBarDataPoint } from "@/types";

const isScatterData = (data: any): data is ScatterDataPoint[] => {
  return Array.isArray(data) && data.every(point => 'x' in point && 'y' in point);
};
const isHistogramData = (data: any): data is HistogramDataPoint[] => {
  return Array.isArray(data) && data.every(point => 'name' in point && 'value' in point);
};

const isRadarData = (data: any): data is RadarDataPoint[] => {
  return Array.isArray(data) && data.every(point => 'subject' in point && 'value' in point);
};

const isStackedLineData = (data: any): data is StackedLineDataPoint[] => {
  return Array.isArray(data) && data.every(point => 'name' in point && 'uv' in point && 'pv' in point);
};

const isRadialBarData = (data: any): data is RadialBarDataPoint[] => {
  return Array.isArray(data) && data.every(point => 'name' in point && 'uv' in point && 'pv' in point && 'fill' in point);
};

const constructScatterPlotData = (
  dataset: Record<string, string[]>,
  xField: string | undefined,
  yField: string | undefined,
  previousData: ScatterDataPoint[] // To retain previous values
) => {
  return (xField || yField) ? dataset[(xField || yField) as string].map((value, index) => {
    const prevDataPoint = previousData[index] || { x: 0, y: 0 };

    // Update x and/or y based on whether fields are undefined
    const newDataPoint = {
      x: xField ? Number(dataset[xField][index]) : prevDataPoint.x,
      y: yField ? Number(dataset[yField][index]) : prevDataPoint.y,
    };

    return newDataPoint as ScatterDataPoint;
  }) : [];
};

const constructHistogramData = () => {
  const newDataPoint: HistogramDataPoint[] = []
  return newDataPoint
}
const constructRadarData = () => {
  const newDataPoint: RadarDataPoint[] = []
  return newDataPoint

}
const constructStackedLineData = () => {
  const newDataPoint: StackedLineDataPoint[] = []
  return newDataPoint

}

const constructRadialBarData = () => {
  const newDataPoint: RadialBarDataPoint[] = []
  return newDataPoint

}


const createChartData = (
  dataset: Record<string, string[]> = {}, 
  chart: Chart, 
  { xField = undefined, yField = undefined}: 
  { xField?: string | undefined, yField?: string | undefined},  
  previousData: ScatterDataPoint[],

  ) => {
  // Switch over the chart type to return the correct data type
  switch (chart.type) {
    case "Scatter":
        // Assumes that the xfield and yfield data are numeric, or string that can be converted to numeric (0 => 0, "0" => 0)
        return constructScatterPlotData(dataset, xField, yField, previousData) as ScatterDataPoint[]
      
    case "Histogram":

        return constructHistogramData() as HistogramDataPoint[];
      
    case "Radar":

        return constructRadarData() as RadarDataPoint[];
      
    case "StackedLine":

        return constructStackedLineData() as StackedLineDataPoint[];
      
    case "RadialBar":

        return constructRadialBarData() as RadialBarDataPoint[];

    default:
        return [];
  }
};

export { createChartData, isScatterData, isHistogramData, isRadarData, isStackedLineData, isRadialBarData };
