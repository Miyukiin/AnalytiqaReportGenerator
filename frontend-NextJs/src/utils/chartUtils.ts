// src/utils/chartUtils.ts

import { ChartType } from "../types";

export const generateSampleData = (type: ChartType): any[] => {
  const sampleData: { [key in ChartType]: any[] } = {
    Scatter: [
      { x: 100, y: 200 },
      { x: 120, y: 100 },
      { x: 170, y: 300 },
      { x: 140, y: 250 },
      { x: 150, y: 400 },
      { x: 110, y: 280 },
    ],
    Histogram: [
      { name: "A", value: 400 },
      { name: "B", value: 300 },
      { name: "C", value: 300 },
      { name: "D", value: 200 },
      { name: "E", value: 278 },
      { name: "F", value: 189 },
    ],
    Radar: [
      { header: "Math", row1: 12, row2: 45},
      { header: "Chinese", row1: 98, row2: 65 },
      { header: "English", row1: 86, row2: 23},
    ],
    StackedLine: [ // Retaining "StackedLine"
      { SLname: "Page A", SLvalue1: 4000 },
      { SLname: "Page B", SLvalue1: 3000 },
      { SLname: "Page C", SLvalue1: 2000 },
      { SLname: "Page D", SLvalue1: 2780 },
      { SLname: "Page E", SLvalue1: 1890 },
      { SLname: "Page F", SLvalue1: 2390 },
      { SLname: "Page G", SLvalue1: 3490 },
    ],
    RadialBar: [
      { name: "18-24", value: 31.47, fill: "#8884d8" },
      { name: "25-29", value: 26.69, fill: "#83a6ed" },
      { name: "30-34", value: 15.69, fill: "#8dd1e1" },
      { name: "35-39", value: 8.22, fill: "#82ca9d" },
      { name: "40-49", value: 8.63, fill: "#a4de6c" },
      { name: "50+", value: 2.63, fill: "#d0ed57" },
      { name: "Unknown", value: 6.67, fill: "#ffc658" },
    ],
  };
  return sampleData[type] || [];
};
