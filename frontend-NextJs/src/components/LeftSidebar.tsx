// components/LeftSidebar.tsx

import React from "react";
import { Typography, Paper, Grid, IconButton } from "@mui/material";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import BarChartIcon from "@mui/icons-material/BarChart";
import RadarIcon from "@mui/icons-material/Radar";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import WaterfallChartIcon from "@mui/icons-material/WaterfallChart";
import FullWidthDivider from "./FullWidthDivider";
import { ChartType } from "../types";

interface LeftSidebarProps {
  onAddChart: (type: ChartType) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onAddChart }) => {
  const icons = [
    { icon: <ScatterPlotIcon />, label: "Scatter" },
    { icon: <BarChartIcon />, label: "Histogram" },
    { icon: <RadarIcon />, label: "Radar" },
    { icon: <ShowChartIcon />, label: "Stacked Line" },
    { icon: <WaterfallChartIcon />, label: "Waterfall" },
  ];

  return (
    <Paper
      sx={{
        width: 200,
        display: "flex",
        flexDirection: "column",
        p: 2,
        borderRight: "1px solid #ccc",
        bgcolor: "#ECECEC",
      }}
    >
      <Typography variant="h6" fontWeight="bold" align="center">
        VISUALIZATIONS
      </Typography>
      <FullWidthDivider />
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {icons.map((item, index) => (
          <Grid item xs={4} key={index}>
            <IconButton
              onClick={() => onAddChart(item.label as ChartType)}
              sx={{
                width: "100%",
                height: 40,
                bgcolor: "#e9ecef",
                border: "1px solid #adb5bd",
                borderRadius: 1,
              }}
              title={item.label}
              aria-label={`Add ${item.label} Chart`}
            >
              {item.icon}
            </IconButton>
          </Grid>
        ))}
      </Grid>
      <FullWidthDivider />
      {/* Additional configurations (Title, Y-axis, X-axis) can be added here */}
    </Paper>
  );
};

export default LeftSidebar;
