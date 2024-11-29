// components/MainCanvas.tsx

import React from "react";
import { Box } from "@mui/material";
import ChartItem from "./ChartItem";
import { Chart } from "../types";

interface MainCanvasProps {
  charts: Chart[];
  removeChart: (id: number) => void;
  onDragStop: (id: number, x: number, y: number) => void;
  onResizeStop: (id: number, width: number, height: number) => void;
}

const MainCanvas: React.FC<MainCanvasProps> = ({
  charts,
  removeChart,
  onDragStop,
  onResizeStop,
}) => {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        bgcolor: "#ffffff",
      }}
    >
      {charts.map((chart) => (
        <ChartItem
          key={chart.id}
          {...chart}
          onRemove={removeChart}
          onDragStop={onDragStop}
          onResizeStop={onResizeStop}
        />
      ))}
    </Box>
  );
};

export default MainCanvas;
