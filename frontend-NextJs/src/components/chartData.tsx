// src/components/chartData.tsx
import { Chart, ScatterDataPoint, PositiveNegativeBarDataPoint, RadarDataPoint, StackedLineDataPoint, RadialBarDataPoint } from "@/types";
import { generateSampleData } from "@/utils/chartUtils";
import { fetchCsrfToken } from "./csrfToken";

const isScatterData = (data: any): data is ScatterDataPoint[] => {
  return Array.isArray(data) && data.every(point => 'x' in point && 'y' in point);
};
const isPositiveNegativeBarData = (data: any): data is PositiveNegativeBarDataPoint[] => {
  return Array.isArray(data) && data.every(point => 'PNBname' in point && ('PNBvalue1' in point || 'PNBvalue2' in point || 'PNBvalue3' in point || 'PNBvalue4' in point || 'PNBvalue5'));
};

{/*This should be dynamic, changing the check depending on how many rows are selected, not hardcoded as row1 and row 2 */}
const isRadarData = (data: any): data is RadarDataPoint[] => {
  return Array.isArray(data) && data.every(point => 'header' in point && 'row1' in point && 'row2' in point);
};

const isStackedLineData = (data: any): data is StackedLineDataPoint[] => {
  return Array.isArray(data) && data.every(point => 'SLname' in point && ('SLvalue1' in point || 'SLvalue2' in point || 'SLvalue3' in point || 'SLvalue4' in point || 'SLvalue5'));
};

const isRadialBarData = (data: any): data is RadialBarDataPoint[] => {
  return Array.isArray(data) && data.every(point => 'name' in point && 'value' in point && 'fill' in point);
};

const constructScatterPlotData = (
  dataset: Record<string, string[]>,
  xField: string | undefined,
  yField: string | undefined,
  previousData: ScatterDataPoint[] // To retain previous values
): ScatterDataPoint[] => {
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
const constructPositiveNegativeBarData = (
  dataset: Record<string, string[]>, 
  PNBColumns: Array<string> | undefined, 
  PNBLineXAxes: Array<number> | undefined
): PositiveNegativeBarDataPoint[] => {  
  // Check if PNBColumns is undefined or empty
  if (!PNBColumns || PNBColumns.length === 0) {
    console.error("PNBColumns is undefined. Cannot construct data.");
    return [];
  }
  console.log("Printing PNBColumns:", PNBColumns);
  console.log("Printing PNBLineXAxes:", PNBLineXAxes);

  const newDataPoint: PositiveNegativeBarDataPoint[] = [];

  // If PNBLineXAxes is undefined or empty, populate with default 0 values
  if (!PNBLineXAxes || PNBLineXAxes.length === 0) {
    console.log("No rows selected for PNBLineXAxes, creating default data with SLvalues set to 0.");
    for (let i = 0; i < PNBColumns.length; i++) {
      const dataPoint: PositiveNegativeBarDataPoint = { 
        PNBname: `Row ${i + 1}`,
        PNBvalue1: 0, // Default value for PNBvalue1 because its the only one required, it will be updated later.
       };

      PNBColumns.forEach((_, colIndex) => {
        (dataPoint as any)[`PNBvalue${colIndex + 1}`] = 0; // Set all SLvalues to 0
      });

      newDataPoint.push(dataPoint);
    }
    return newDataPoint; // Return the default data
  }

  // Loop through each row (student) index specified in PNBLineXAxes
  PNBLineXAxes.forEach((rowIndex) => {
    const dataPoint: PositiveNegativeBarDataPoint = { 
      PNBname: `Row ${rowIndex + 1}`,
      PNBvalue1: 0, // Default value for SLvalue1 because its the only one required, it will be updated later.
    } 

    // Loop through each column (subject) specified in PNBColumns
    PNBColumns.forEach((column, colIndex) => {
      // Retrieve the column value for the given row
      const rowData = dataset[column]?.[rowIndex];

      // Convert the value to a number or use 0 if invalid
      const value = Number(rowData) || 0;

      // Assign the value to the corresponding PNBvalue property
      (dataPoint as any)[`PNBvalue${colIndex + 1}`] = value;
    });

    newDataPoint.push(dataPoint);
  });

  console.log("Constructed PositiveNegativeBar data Array:", newDataPoint);
  return newDataPoint;
};

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

const constructStackedLineData = ( 
  dataset: Record<string, string[]>, 
  StackedLineColumns: Array<string> | undefined, 
  LineXAxes: Array<number> | undefined
): StackedLineDataPoint[] => {  
  // Check if StackedLineColumns is undefined or empty
  if (!StackedLineColumns || StackedLineColumns.length === 0) {
    console.error("StackedLineColumns is undefined. Cannot construct data.");
    return [];
  }
  console.log("Printing StackedLineColumns:", StackedLineColumns);
  console.log("Printing LineXAxes:", LineXAxes);

  const newDataPoint: StackedLineDataPoint[] = [];

  // If LineXAxes is undefined or empty, populate with default 0 values
  if (!LineXAxes || LineXAxes.length === 0) {
    console.log("No rows selected for LineXAxes, creating default data with SLvalues set to 0.");
    for (let i = 0; i < StackedLineColumns.length; i++) {
      const dataPoint: StackedLineDataPoint = { 
        SLname: `Row ${i + 1}`,
        SLvalue1: 0, // Default value for SLvalue1 because its the only one required, it will be updated later.
       };

      StackedLineColumns.forEach((_, colIndex) => {
        (dataPoint as any)[`SLvalue${colIndex + 1}`] = 0; // Set all SLvalues to 0
      });

      newDataPoint.push(dataPoint);
    }
    return newDataPoint; // Return the default data
  }

  // Loop through each row (student) index specified in LineXAxes
  LineXAxes.forEach((rowIndex) => {
    const dataPoint: StackedLineDataPoint = { 
      SLname: `Row ${rowIndex + 1}`,
      SLvalue1: 0, // Default value for SLvalue1 because its the only one required, it will be updated later.
    } 

    // Loop through each column (subject) specified in StackedLineColumns
    StackedLineColumns.forEach((column, colIndex) => {
      // Retrieve the column value for the given row
      const rowData = dataset[column]?.[rowIndex];

      // Convert the value to a number or use 0 if invalid
      const value = Number(rowData) || 0;

      // Assign the value to the corresponding SLvalue property
      (dataPoint as any)[`SLvalue${colIndex + 1}`] = value;
    });

    newDataPoint.push(dataPoint);
  });

  console.log("Constructed StackedLineDataPoint Array:", newDataPoint);
  return newDataPoint;
};





const constructRadialBarData = async (
  dataset: Record<string, string[]>,
  RadialColumn: string | undefined) : Promise<RadialBarDataPoint[]> => {
    let RadialBarData: RadialBarDataPoint[] = []

    if(RadialColumn && dataset){
      try {
        const response = await fetch("https://miyukiin.pythonanywhere.com/api/report/calculate-radial-data/", {
          method: 'POST',
          headers: {
            'X-CSRFToken': await fetchCsrfToken(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ RadialColumn, dataset }),
        });
    
        const data = await response.json();
        const column_values_data: NameValueData = data['radialBarData']

        interface NameValueData {
          [key: string]: number;
        }
        const name_values_data = column_values_data[RadialColumn]
        const colors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c']; 
        Object.entries(name_values_data).forEach(([name, value], i) => {
          RadialBarData.push({
            name: name,
            value: value as number,
            fill: colors[i % colors.length],  // Cycle through colors array
          });
        });


        
      } catch (error) {
        console.error('Error sending chart data:', error);
      }
    }
    return RadialBarData
}

const createChartData = (
  dataset: Record<string, string[]> = {}, 
  chart: Chart, 
  { xField = undefined, yField = undefined, 
    RadarColumns = undefined, RowsSelected = undefined, 
    RadialColumn = undefined, 
    StackedLineColumns = undefined, LineXAxes = undefined,
    PNBColumns = undefined, PNBLineXAxes = undefined

  }: 
  { xField?: string | undefined, yField?: string | undefined, 
    RadarColumns?: Array<string> | undefined, RowsSelected?: Array<number> | undefined, 
    RadialColumn?: string
    StackedLineColumns?: Array<string> | undefined, LineXAxes?: Array<number> | undefined,
    PNBColumns?: Array<string> | undefined, PNBLineXAxes?: Array<number> | undefined,

  },  
  previousData: ScatterDataPoint[],

  ) => {
  // Switch over the chart type to return the correct data type
  switch (chart.type) {
    case "Scatter":
        // Assumes that the xfield and yfield data are numeric, or string that can be converted to numeric (0 => 0, "0" => 0)
        return constructScatterPlotData(dataset, xField, yField, previousData) as ScatterDataPoint[]
      
    case "PositiveNegativeBar":

        return constructPositiveNegativeBarData(dataset, PNBColumns, PNBLineXAxes) as PositiveNegativeBarDataPoint[];
      
    case "Radar":
        return constructRadarData(dataset, RadarColumns, RowsSelected) as RadarDataPoint[];
      
    case "StackedLine":
        return constructStackedLineData(dataset, StackedLineColumns, LineXAxes) as StackedLineDataPoint[];
      
    case "RadialBar":
      return constructRadialBarData(dataset, RadialColumn) 
      .then((data) => data) 
      .catch((error) => {
        console.error('Error generating RadialBar data:', error);
        return []; // Return an empty array in case of error
      });

    default:
        return [];
  }
};

export { createChartData, isScatterData, isPositiveNegativeBarData, isRadarData, isStackedLineData, isRadialBarData };
