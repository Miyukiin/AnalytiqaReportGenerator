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
  ResponsiveContainer,
} from "recharts";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Chart, ScatterDataPoint, HistogramDataPoint, RadarDataPoint, StackedLineDataPoint } from "../types";

interface ChartItemProps extends Chart {
  onRemove: (id: number) => void;
  onDragStop: (id: number, x: number, y: number) => void;
  onResizeStop: (id: number, width: number, height: number) => void;
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
}) => {
  const renderChart = () => {
    switch (type) {
      case "Scatter":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid />
              <XAxis dataKey="x" />
              <YAxis dataKey="y" />
              <Tooltip />
              <Scatter name="Sample Scatter" data={data as ScatterDataPoint[]} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case "Histogram":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data as HistogramDataPoint[]}>
              <CartesianGrid />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        );
      case "Radar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius="80%" data={data as RadarDataPoint[]}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar
                name="Mike"
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        );
      case "Stacked Line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data as StackedLineDataPoint[]}>
              <CartesianGrid />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="pv" stroke="#8884d8" />
              <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        );
      case "Waterfall":
        // Implement Waterfall Chart as needed
        return <div>Waterfall Chart Placeholder</div>;
      default:
        return <div>Unsupported Chart Type</div>;
    }
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
        border: "1px solid #ccc",
        background: "#fff",
        padding: "8px",
        boxSizing: "border-box",
        borderRadius: "4px",
        position: "absolute",
        zIndex: 1,
      }}
    >
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <IconButton
          size="small"
          onClick={() => onRemove(id)}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 2,
            background: "rgba(255, 255, 255, 0.7)",
          }}
          aria-label={`Remove ${type} Chart`}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        {renderChart()}
      </div>
    </Rnd>
  );
};

export default ChartItem;
