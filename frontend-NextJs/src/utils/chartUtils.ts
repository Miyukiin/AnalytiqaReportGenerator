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
      { subject: "Math", value: 120 },
      { subject: "Chinese", value: 98 },
      { subject: "English", value: 86 },
      { subject: "Geography", value: 99 },
      { subject: "Physics", value: 85 },
      { subject: "History", value: 65 },
    ],
    "Stacked Line": [
      { name: "Page A", uv: 4000, pv: 2400 },
      { name: "Page B", uv: 3000, pv: 1398 },
      { name: "Page C", uv: 2000, pv: 9800 },
      { name: "Page D", uv: 2780, pv: 3908 },
      { name: "Page E", uv: 1890, pv: 4800 },
      { name: "Page F", uv: 2390, pv: 3800 },
      { name: "Page G", uv: 3490, pv: 4300 },
    ],
    RadialBar: [
      { name: "18-24", uv: 31.47, pv: 2400, fill: "#8884d8" },
      { name: "25-29", uv: 26.69, pv: 4567, fill: "#83a6ed" },
      { name: "30-34", uv: 15.69, pv: 1398, fill: "#8dd1e1" },
      { name: "35-39", uv: 8.22, pv: 9800, fill: "#82ca9d" },
      { name: "40-49", uv: 8.63, pv: 3908, fill: "#a4de6c" },
      { name: "50+", uv: 2.63, pv: 4800, fill: "#d0ed57" },
      { name: "Unknown", uv: 6.67, pv: 4800, fill: "#ffc658" },
    ],
  };
  return sampleData[type] || [];
};
