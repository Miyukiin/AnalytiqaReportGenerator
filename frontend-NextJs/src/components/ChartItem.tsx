// components/ChartItem.tsx

import React from "react";
import { Rnd } from "react-rnd";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { IconButton, Typography, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Chart, ScatterDataPoint, HistogramDataPoint, RadarDataPoint, StackedLineDataPoint, RadialBarDataPoint } from "../types";

interface ChartItemProps extends Chart {
  onRemove: (id: number) => void;
  onDragStop: (id: number, x: number, y: number) => void;
  onResizeStop: (id: number, width: number, height: number) => void;
  onSelectChart: (id: number) => void;
  isSelected: boolean; // Determines if the chart is selected
}

const ChartItem: React.FC<ChartItemProps> = ({
  id,
  type,
  data,
  x,
  y,
  width,
  height,
  onRemove,
  onDragStop,
  onResizeStop,
  onSelectChart,
  title,
  xAxis,
  yAxis,
  isSelected,
}) => {
  const renderChart = () => {
    let chartComponent;

    switch (type) {
      case "Scatter":
        chartComponent = (
          <ScatterChart>
            <CartesianGrid />
            <XAxis
              dataKey={xAxis || "x"}
              label={{
                value: xAxis || "X-axis",
                position: "insideBottomRight",
                offset: 0,
              }}
            />
            <YAxis
              dataKey={yAxis || "y"}
              label={{
                value: yAxis || "Y-axis",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Scatter name={title || "Scatter"} data={data as ScatterDataPoint[]} fill="#8884d8" />
            <Legend />
          </ScatterChart>
        );
        break;
      case "Histogram":
        chartComponent = (
          <BarChart data={data as HistogramDataPoint[]}>
            <CartesianGrid />
            <XAxis
              dataKey={xAxis || "name"}
              label={{
                value: xAxis || "X-axis",
                position: "insideBottomRight",
                offset: 0,
              }}
            />
            <YAxis
              label={{
                value: yAxis || "Y-axis",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" />
            <Legend />
          </BarChart>
        );
        break;
      case "Radar":
        chartComponent = (
          <RadarChart outerRadius="80%" data={data as RadarDataPoint[]}>
            <PolarGrid />
            <PolarAngleAxis dataKey={xAxis || "subject"} />
            <PolarRadiusAxis />
            <Radar
              name={title || "Radar"}
              dataKey="value"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Legend />
          </RadarChart>
        );
        break;
      case "Stacked Line":
        chartComponent = (
          <LineChart data={data as StackedLineDataPoint[]}>
            <CartesianGrid />
            <XAxis
              dataKey={xAxis || "name"}
              label={{
                value: xAxis || "X-axis",
                position: "insideBottomRight",
                offset: 0,
              }}
            />
            <YAxis
              label={{
                value: yAxis || "Y-axis",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Line type="monotone" dataKey="pv" stroke="#8884d8" />
            <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
            <Legend />
          </LineChart>
        );
        break;
      case "RadialBar":
        const radialBarStyle = {
          top: '50%',
          right: 0,
          transform: 'translate(0, -50%)',
          lineHeight: '24px',
        };
        chartComponent = (
          <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={10} data={data as RadialBarDataPoint[]}>
            <RadialBar
              minPointSize={15} // Replaced 'minAngle' with 'minPointSize'
              label={{ position: 'insideStart', fill: '#fff' }}
              background
              dataKey="uv"
            />
            <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={radialBarStyle} />
          </RadialBarChart>
        );
        break;
      default:
        chartComponent = <div>Unsupported Chart Type</div>;
    }

    return chartComponent;
  };

  return (
    <Rnd
      size={{ width, height }}
      position={{ x, y }}
      bounds="parent"
      minWidth={200}
      minHeight={200}
      onDragStop={(e, d) => onDragStop(id, d.x, d.y)}
      onResizeStop={(e, direction, ref, delta, position) => {
        onResizeStop(id, ref.offsetWidth, ref.offsetHeight);
      }}
      style={{
        border: isSelected ? "2px solid #1976d2" : "1px solid #ccc", // Highlight border if selected
        background: "#fff",
        padding: "8px",
        boxSizing: "border-box",
        borderRadius: "4px",
        position: "absolute",
        zIndex: 2, // Higher z-index for better visibility
        cursor: "move",
      }}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => { // Explicitly type 'e'
        e.stopPropagation(); // Prevent parent click
        onSelectChart(id);
      }} // Select chart on click
    >
      <Box sx={{ width: "100%", height: "100%", position: "relative", display: "flex", flexDirection: "column" }}>
        {isSelected && (
          <IconButton
            size="small"
            onClick={() => onRemove(id)}
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              zIndex: 3,
              background: "rgba(255, 255, 255, 0.7)",
            }}
            aria-label={`Remove ${type} Chart`}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
        {title && (
          <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontSize: '0.9em' }}>
            {title}
          </Typography>
        )}
        <Box sx={{ flexGrow: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </Box>
      </Box>
    </Rnd>
  );
};

export default ChartItem;
