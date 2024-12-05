// src/components/chartData.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Chart, ScatterDataPoint, HistogramDataPoint, RadarDataPoint, StackedLineDataPoint, RadialBarDataPoint } from "@/types";

const createChartData = (dataset: Record<string, string[]> = {}, chart: Chart, { xField, yField }: { xField: string | undefined, yField: string | undefined},  previousData: ScatterDataPoint[]) => {
  // Switch over the chart type to return the correct data type
  switch (chart.type) {
    case "Scatter":
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

          return newDataPoint;
        }) : [];
      };

        // Assumes that the xfield and yfield data are numeric, or string that can be converted to numeric (0 => 0, "0" => 0)
        return constructScatterPlotData(dataset, xField, yField, previousData) as ScatterDataPoint[]
      
    case "Histogram":

        return chart.data as HistogramDataPoint[];
      
    case "Radar":

        return chart.data as RadarDataPoint[];
      
    case "StackedLine":

        return chart.data as StackedLineDataPoint[];
      
    case "RadialBar":

        return chart.data as RadialBarDataPoint[];

    default:
        return [];
  }
};

export default createChartData;
