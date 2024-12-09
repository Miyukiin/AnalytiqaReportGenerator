// src/components/MainCanvas.tsx

import React from "react";
import { Box } from "@mui/material";
import ChartItem from "./ChartItem";
import { Chart } from "../types";

interface MainCanvasProps {
  charts: Chart[];
  removeChart: (id: number) => void;
  onDragStop: (id: number, x: number, y: number) => void;
  onResizeStop: (id: number, width: number, height: number) => void;
  onSelectChart: (id: number) => void;
  selectedChartId: number | null;
}

const MainCanvas: React.FC<MainCanvasProps> = ({
  charts,
  removeChart,
  onDragStop,
  onResizeStop,
  onSelectChart,
  selectedChartId,
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "#ffffff",
      }}
    >
      {charts.map((chart) => (
        <ChartItem
          key={chart.id}
          {...chart}
          onRemove={removeChart}
          onDragStop={onDragStop}
          onResizeStop={onResizeStop}
          onSelectChart={onSelectChart}
          isSelected={selectedChartId === chart.id}
          xAxisColor={chart?.xAxisColor || ""} // If xAxisColor is undefined, add default
          yAxisColor={chart?.yAxisColor || ""} // If xAxisColor is undefined, add default
        />
      ))}
    </Box>
  );
};

export default MainCanvas;
