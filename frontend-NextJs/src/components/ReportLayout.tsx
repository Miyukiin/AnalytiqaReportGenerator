// components/ReportLayout.tsx
"use client";

import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import LeftSidebar from "./LeftSidebar";
import MainCanvas from "./MainCanvas";
import RightSidebar from "./RightSidebar";
import {
  Chart,
  ChartType,
  ScatterDataPoint,
  HistogramDataPoint,
  RadarDataPoint,
  StackedLineDataPoint,
} from "../types"; // Ensure this path is correct

const ReportLayout: React.FC = () => {
  const [charts, setCharts] = useState<Chart[]>([]); // Explicitly type the state

  const addChart = (type: ChartType) => { // Explicitly type the parameter
    const newChart: Chart = {
      id: Date.now(),
      type,
      data: generateSampleData(type),
      x: 50, // Starting position
      y: 50,
      width: 300,
      height: 300,
    };
    setCharts((prevCharts) => [...prevCharts, newChart]); // Type-safe state update
  };

  const removeChart = (id: number) => { // Explicitly type the parameter
    setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== id));
  };

  const updateChartPosition = (id: number, x: number, y: number) => { // Explicitly type the parameters
    setCharts((prevCharts) =>
      prevCharts.map((chart) =>
        chart.id === id ? { ...chart, x, y } : chart
      )
    );
  };

  const updateChartSize = (id: number, width: number, height: number) => { // Explicitly type the parameters
    setCharts((prevCharts) =>
      prevCharts.map((chart) =>
        chart.id === id ? { ...chart, width, height } : chart
      )
    );
  };

  const generateSampleData = (type: ChartType): Chart["data"] => { // Explicitly type the parameter and return type
    switch (type) {
      case "Scatter":
        return [
          { x: 100, y: 200 },
          { x: 120, y: 100 },
          { x: 170, y: 300 },
          { x: 140, y: 250 },
          { x: 150, y: 400 },
          { x: 110, y: 280 },
        ] as ScatterDataPoint[];
      case "Histogram":
        return [
          { name: "A", value: 400 },
          { name: "B", value: 300 },
          { name: "C", value: 300 },
          { name: "D", value: 200 },
          { name: "E", value: 278 },
          { name: "F", value: 189 },
        ] as HistogramDataPoint[];
      case "Radar":
        return [
          { subject: "Math", value: 120 },
          { subject: "Chinese", value: 98 },
          { subject: "English", value: 86 },
          { subject: "Geography", value: 99 },
          { subject: "Physics", value: 85 },
          { subject: "History", value: 65 },
        ] as RadarDataPoint[];
      case "Stacked Line":
        return [
          { name: "Page A", uv: 4000, pv: 2400 },
          { name: "Page B", uv: 3000, pv: 1398 },
          { name: "Page C", uv: 2000, pv: 9800 },
          { name: "Page D", uv: 2780, pv: 3908 },
          { name: "Page E", uv: 1890, pv: 4800 },
          { name: "Page F", uv: 2390, pv: 3800 },
          { name: "Page G", uv: 3490, pv: 4300 },
        ] as StackedLineDataPoint[];
      case "Waterfall":
        // Implement Waterfall Chart as needed
        return [];
      default:
        return [];
    }
  };

  const exportLayout = () => {
    try {
      const layout = charts.map(({ id, type, data, x, y, width, height }) => ({
        id,
        type,
        data,
        x,
        y,
        width,
        height,
      }));
      const blob = new Blob([JSON.stringify(layout, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "layout.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export layout:", error);
      alert("An error occurred while exporting the layout.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "#ffffff" }}>
      {/* Left Sidebar */}
      <LeftSidebar onAddChart={addChart} />

      {/* Visualization Area */}
      <Box sx={{ flex: 1, p: 2, bgcolor: "#ECECEC", position: "relative" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            BUILD VISUALS
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GetAppIcon />} // Export Icon
            onClick={exportLayout}
          >
            Export
          </Button>
        </Box>
        <Box
          sx={{
            height: "80vh",
            bgcolor: "#ffffff",
            border: "2px dashed #adb5bd",
            borderRadius: 1,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <MainCanvas
            charts={charts}
            removeChart={removeChart}
            onDragStop={updateChartPosition}
            onResizeStop={updateChartSize}
          />
        </Box>
        {/* Pagination and other controls can be added here */}
      </Box>

      {/* Right Sidebar */}
      <RightSidebar />
    </Box>
  );
};

export default ReportLayout;
