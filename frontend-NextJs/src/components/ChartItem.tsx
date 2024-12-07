// src/components/charts/ChartItem.tsx

import React, { useState, useEffect, useMemo } from "react";
import { Rnd } from "react-rnd";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
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
  LabelList, // Import LabelList for displaying values
} from "recharts";
import { IconButton, Typography, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Chart,
  ScatterDataPoint,
  HistogramDataPoint,
  RadarDataPoint,
  StackedLineDataPoint,
  RadialBarDataPoint,
} from "../types";

interface ChartItemProps extends Chart {
  onRemove: (id: number) => void;
  onDragStop: (id: number, x: number, y: number) => void;
  onResizeStop: (
    id: number,
    width: number,
    height: number,
    x: number,
    y: number,
    NumericColumns?: Array<string>,
    RowsSelected?:  Array<any>,
  ) => void;
  onSelectChart: (id: number) => void;
  isSelected: boolean;
  xAxisColor: string; // Added for X-axis color
  yAxisColor: string; // Added for Y-axis color
}

const baseWidth = 400;
const baseHeight = 300;
const baseFontSize = 12;

const ChartItem: React.FC<ChartItemProps> = React.memo(({
  id,
  type,
  data,
  x,
  y,
  width,
  height,
  NumericColumns,
  RowsSelected,
  onRemove,
  onDragStop,
  onResizeStop,
  onSelectChart,
  title,
  xAxis,
  yAxis,
  isSelected,
  xAxisColor,
  yAxisColor,
}) => {
  const [currentWidth, setCurrentWidth] = useState(width);
  const [currentHeight, setCurrentHeight] = useState(height);

  useEffect(() => {
    setCurrentWidth(width);
    setCurrentHeight(height);
  }, [width, height]);

  const scalingFactor = useMemo(
    () => Math.min(currentWidth / baseWidth, currentHeight / baseHeight),
    [currentWidth, currentHeight]
  );
  const marginSize = 20 * scalingFactor;

  const commonChartProps = {
    margin: {
      top: marginSize,
      right: marginSize,
      bottom: marginSize,
      left: marginSize,
    },
    style: { backgroundColor: "transparent" },
    fontSize: baseFontSize * scalingFactor,
  };

  const renderChart = () => {
    const tooltipStyle = {
      contentStyle: { fontSize: baseFontSize * scalingFactor },
      itemStyle: { fontSize: baseFontSize * scalingFactor },
      labelStyle: { fontSize: baseFontSize * scalingFactor },
    };
  
    const legendStyle = { fontSize: baseFontSize * scalingFactor };
  
    switch (type) {
      case "Scatter":
        return (
          <ScatterChart {...commonChartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              label={{
                value: xAxis,
                offset: -10 * scalingFactor, // Dynamically adjusted offset
                position: "insideBottom",
                style: {
                  fontSize: commonChartProps.fontSize,
                  fill: xAxisColor || "#000",
                },
              }}
              tick={{
                fontSize: commonChartProps.fontSize,
                fill: xAxisColor || "#000",
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              label={{
                value: yAxis,
                offset: -10 * scalingFactor, // Dynamically adjusted offset
                position: "insideLeft",
                style: {
                  fontSize: commonChartProps.fontSize,
                  fill: yAxisColor || "#000",
                },
              }}
              tick={{
                fontSize: commonChartProps.fontSize,
                fill: yAxisColor || "#000",
              }}
            />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={legendStyle} />
            <Scatter name={title ? title : "Placeholder Title"} data={data as ScatterDataPoint[]} fill="#8884d8"/>
          </ScatterChart>
        );

      case "Histogram":
        return (
          <BarChart 
            {...commonChartProps} 
            data={data as HistogramDataPoint[]} 
            barCategoryGap="1%" // Removes space between categories
            barGap="0%" // Removes space between bars
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              scale="band" // Using band scale for categorical data
              padding={{ left: 0, right: 0 }} // Reduced padding for compact bars
              label={{
                value: xAxis, // Using xAxis prop for label
                position: "insideBottomRight",
                offset: -10 * scalingFactor, // Dynamically adjusted offset
                style: {
                  fontSize: commonChartProps.fontSize,
                  fill: xAxisColor || "#000",
                },
              }}
              tick={{
                fontSize: commonChartProps.fontSize,
                fill: xAxisColor || "#000",
              }}
            />
            <YAxis
              label={{
                value: yAxis,
                angle: -90,
                position: "insideLeft",
                offset: -10 * scalingFactor, // Dynamically adjusted offset
                style: {
                  fontSize: commonChartProps.fontSize,
                  fill: yAxisColor || "#000",
                },
              }}
              tick={{
                fontSize: commonChartProps.fontSize,
                fill: yAxisColor || "#000",
              }}
            />
            <Tooltip {...tooltipStyle} />
            <Bar 
              dataKey="value" 
              fill="#82ca9d" 
              background={{ fill: "#eee" }} // Background for better visual separation
            >
              <LabelList 
                dataKey="value" 
                position="top" // Position labels above the bars
                style={{ 
                  fontSize: baseFontSize * scalingFactor, 
                  fill: yAxisColor || "#000" 
                }} 
              />
            </Bar>
            <Legend wrapperStyle={legendStyle} />
          </BarChart>
        );

      case "Radar":
        const radarOuterRadius =
          ((Math.min(currentWidth, currentHeight) - marginSize * 2) / 2) * 0.8;
        return (
          <RadarChart
            {...commonChartProps}
            data={data as RadarDataPoint[]}
            cx="50%"
            cy="50%"
            outerRadius={radarOuterRadius}
          >
            <PolarGrid />
            <PolarAngleAxis
              dataKey={"header"}
              tick={{
                fontSize: commonChartProps.fontSize,
                fill: xAxisColor || "#000",
              }}
            />
            <PolarRadiusAxis
              tick={{
                fontSize: commonChartProps.fontSize,
                fill: yAxisColor || "#000",
              }}
            />
            {/*This should be dynamic, changing depending on how many selects are populated, not hardcoded as Radar 1, Radar 2 */}
            <Radar
              name={RowsSelected ? `Row ${RowsSelected[0]}` : "Row1"}
              dataKey="row1"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Radar
              name={RowsSelected ? `Row ${RowsSelected[1]}` : "Row2"}
              dataKey="row2"
              stroke="#82ca9d" 
              fill="#82ca9d"
              fillOpacity={0.6}
            />
            
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={legendStyle} />
          </RadarChart>
        );

      case "StackedLine":
        return (
          <LineChart {...commonChartProps} data={data as StackedLineDataPoint[]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={xAxis || "name"}
              label={{
                value: xAxis || "X-axis",
                position: "insideBottomRight",
                offset: -10 * scalingFactor, // Dynamically adjusted offset
                style: {
                  fontSize: commonChartProps.fontSize,
                  fill: xAxisColor || "#000",
                },
              }}
              tick={{
                fontSize: commonChartProps.fontSize,
                fill: xAxisColor || "#000",
              }}
            />
            <YAxis
              label={{
                value: yAxis || "Y-axis",
                angle: -90,
                position: "insideLeft",
                offset: -10 * scalingFactor, // Dynamically adjusted offset
                style: {
                  fontSize: commonChartProps.fontSize,
                  fill: yAxisColor || "#000",
                },
              }}
              tick={{
                fontSize: commonChartProps.fontSize,
                fill: yAxisColor || "#000",
              }}
            />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="pv" stroke="#8884d8" />
            <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
            <Legend wrapperStyle={legendStyle} />
          </LineChart>
        );

      case "RadialBar":
        const radialOuterRadius =
          ((Math.min(currentWidth, currentHeight) - marginSize * 2) / 2) * 0.8;
        return (
          <RadialBarChart
            {...commonChartProps}
            data={data as RadialBarDataPoint[]}
            innerRadius="10%"
            outerRadius={radialOuterRadius}
          >
            <RadialBar
              dataKey="value"
              fill="#8884d8"
              background
              label={{
                position: "insideStart",
                fill: "#fff",
                fontSize: commonChartProps.fontSize,
              }}
            />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={legendStyle} />
          </RadialBarChart>
        );

      default:
        return (
          <Typography variant="body2" color="error">
            Unsupported Chart Type
          </Typography>
        );
    }
  };  

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onSelectChart(id);
  };

  return (
    <Rnd
      size={{ width: currentWidth, height: currentHeight }}
      position={{ x, y }}
      bounds="parent"
      minWidth={200}
      minHeight={200}
      onDragStop={(e: any, d: { x: number; y: number }) => onDragStop(id, d.x, d.y)}
      onResize={(e: any, direction: any, ref: HTMLElement) => {
        setCurrentWidth(ref.offsetWidth);
        setCurrentHeight(ref.offsetHeight);
      }}
      onResizeStop={(e: any, direction: any, ref: HTMLElement, delta: any, position: { x: number; y: number }) => {
        onResizeStop(
          id,
          ref.offsetWidth,
          ref.offsetHeight,
          position.x,
          position.y
        );
      }}
      style={{
        border: isSelected ? "2px solid #1976d2" : "none",
        background: "transparent",
        padding: "8px",
        boxSizing: "border-box",
        borderRadius: "4px",
        position: "absolute",
        zIndex: 2,
        cursor: "move",
      }}
      onClick={handleClick}
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
    >
      <Box
        className="chart-item" // Added className for exporting
        sx={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "transparent",
        }}
      >
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
          <Typography
            variant="subtitle1"
            align="center"
            gutterBottom
            sx={{
              fontSize: `${0.9 * scalingFactor}em`,
              backgroundColor: "transparent",
            }}
          >
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
});

export default ChartItem;
