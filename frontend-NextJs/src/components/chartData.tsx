// src/components/chartData.tsx
import { Chart, ScatterDataPoint, HistogramDataPoint, RadarDataPoint, StackedLineDataPoint, RadialBarDataPoint } from "@/types";
import { generateSampleData } from "@/utils/chartUtils";

const isScatterData = (data: any): data is ScatterDataPoint[] => {
  return Array.isArray(data) && data.every(point => 'x' in point && 'y' in point);
};
const isHistogramData = (data: any): data is HistogramDataPoint[] => {
  return Array.isArray(data) && data.every(point => 'name' in point && 'value' in point);
};

{/*This should be dynamic, changing the check depending on how many rows are selected, not hardcoded as row1 and row 2 */}
const isRadarData = (data: any): data is RadarDataPoint[] => {
  return Array.isArray(data) && data.every(point => 'header' in point && 'row1' in point && 'row2' in point);
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
  // Validate the dataset for the given field
  const dataForField = (field: string | undefined) =>
    field && Array.isArray(dataset[field]) ? dataset[field] : undefined;

  const xData = dataForField(xField);
  const yData = dataForField(yField);

  // Generate scatter plot data
  return (xData || yData) ? (xData || yData)!.map((_, index) => {
    const prevDataPoint = previousData[index] || { x: 0, y: 0 };

    // Check for DefaultScatter condition
    if (xField === "DefaultScatter" || yField === "DefaultScatter") {
      const defaultPoint = { x: 0, y: 0 }; // Handle missing index gracefully

      return {
        x: xField === "DefaultScatter" ? defaultPoint.x : prevDataPoint.x,
        y: yField === "DefaultScatter" ? defaultPoint.y : prevDataPoint.y,
      } as ScatterDataPoint;
    }

    // Or Update x and/or y based on whether fields are undefined
    const newDataPoint = {
      x: xField && xData ? Number(xData[index]) : prevDataPoint.x,
      y: yField && yData ? Number(yData[index]) : prevDataPoint.y,
    };

    return newDataPoint as ScatterDataPoint;
  }) : [];
};
const constructHistogramData = (
  dataset: Record<string, string[]>,
  xField: string | undefined,
) => {
  return (xField) ? dataset[(xField) as string].map((value, index) => {

    // Generate Datapoint for Column X with Structure {name: ColumnName, value: rowValue} for all rows of that column
    const newDataPoint = {
      name: xField,
      value: Number(dataset[xField][index])
    };

    return newDataPoint as HistogramDataPoint;
  }) : [];
}

const constructRadarData = (
  dataset: Record<string, string[]>,
  RadarColumns: Array<string> | undefined,
  RowsSelected: Array<number> | undefined
): RadarDataPoint[] => {  // Ensure the return type is an array of RadarDataPoint



  // Check if RowsSelected is null, undefined, or empty
  if (!RowsSelected || RowsSelected.length === 0) {
    // If so, set row1 and row2 to 0
    return RadarColumns?.map((column) => ({
      header: column,
      row1: 0,
      row2: 0,
    })) || []; // Return empty array if RadarColumns is undefined
  }

  // If RadarColumns is null or empty, return an empty array
  if (!RadarColumns || RadarColumns.length === 0) {
    return [];
  }

  const radarData: RadarDataPoint[] = [];

  // Loop through each column specified in RadarColumns
  RadarColumns.forEach((column) => {
    if (dataset[column] && dataset[column].length >= 2) {
      // Retrieve column value of selected row from Dataset
      const dataPoints: number[] = RowsSelected.map((rowIndex) => {
        return Number(dataset[column][rowIndex]) || 0; // Use 0 as fallback if value is NaN
      });
      // Structure the dataPoint RadarDataPoint.
      if (dataPoints) {
        radarData.push({
          header: column,  // Column header as subject
          row1: dataPoints[0],  // First value from RowsSelected
          row2: dataPoints[1],  // Second value from RowsSelected
        });
      }
    }
  });
  console.log("Printing RadarData Array", radarData)
  return radarData as RadarDataPoint[]; 
};



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
  { xField = undefined, yField = undefined, RadarColumns = undefined, RowsSelected = undefined}: 
  { xField?: string | undefined, yField?: string | undefined, RadarColumns?: Array<string> | undefined, RowsSelected?: Array<number> | undefined},  
  previousData: ScatterDataPoint[],

  ) => {
  // Switch over the chart type to return the correct data type
  switch (chart.type) {
    case "Scatter":
        // Assumes that the xfield and yfield data are numeric, or string that can be converted to numeric (0 => 0, "0" => 0)
        return constructScatterPlotData(dataset, xField, yField, previousData) as ScatterDataPoint[]
      
    case "Histogram":

        return constructHistogramData(dataset, xField) as HistogramDataPoint[];
      
    case "Radar":
        return constructRadarData(dataset, RadarColumns, RowsSelected) as RadarDataPoint[];
      
    case "StackedLine":

        return constructStackedLineData() as StackedLineDataPoint[];
      
    case "RadialBar":

        return constructRadialBarData() as RadialBarDataPoint[];

    default:
        return [];
  }
};

export { createChartData, isScatterData, isHistogramData, isRadarData, isStackedLineData, isRadialBarData };
