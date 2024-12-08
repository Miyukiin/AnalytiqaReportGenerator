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
  LabelList,
  ReferenceLine, // Import LabelList for displaying values
} from "recharts";
import { IconButton, Typography, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Chart,
  ScatterDataPoint,
  PositiveNegativeBarDataPoint,
  RadarDataPoint,
  StackedLineDataPoint,
  RadialBarDataPoint,
} from "../types";
import { isStackedLineData } from "./chartData";

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
    RowsSelected?:  Array<number>,
    StackedLineColumns?: Array<string>,
    LineXAxes?: Array<number>,
    PNBColumns?: Array<string>,
    PNBLineXAxes?: Array<number>
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
  LineXAxes,
  StackedLineColumns,
  PNBColumns,
  PNBLineXAxes,
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
      left: marginSize + 14 * scalingFactor, // Increased left margin
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
            margin
            <XAxis
              type="number"

              dataKey="x"
              label={{
                value: xAxis,
                offset: -10 * scalingFactor, // Dynamically adjusted offset
                position: "insideBottom",
                style: {
                  fontSize: commonChartProps.fontSize*0.85,
                  fill: xAxisColor || "#000",
                },
              }}
              tick={{
                fontSize: commonChartProps.fontSize*0.7,
                fill: xAxisColor || "#000",
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              label={{
                angle: -90, // Rotate the label to display it vertically
                value: yAxis,
                offset: -25 * scalingFactor, // Dynamically adjusted offset
                position: "insideLeft",
                style: {
                  fontSize: commonChartProps.fontSize*0.85 ,
                  fill: yAxisColor || "#000",
                },
              }}
              tick={{
                fontSize: commonChartProps.fontSize *0.7,
                fill: yAxisColor || "#000",
              }}
            />
            <Tooltip {...tooltipStyle} />
            <Scatter name={title ? title : "Placeholder Title"} data={data as ScatterDataPoint[]} fill="#8884d8"/>
          </ScatterChart>
        );

      case "PositiveNegativeBar":
        return (
          <BarChart 
            {...commonChartProps} 
            data={data as PositiveNegativeBarDataPoint[]} 
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="PNBname"/>
            <YAxis/>
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={legendStyle} />
            <ReferenceLine y={0} stroke="#000" />

            {/* Access index, only if corresponding PNBColumn index is defined . Check is isStackedlineData before accessing its PNBname as the name of the line*/}
            {/* Added fallback in the case that a new chart is added of PNB. When newly added, there is no PNBColumn, so fallback condition is to still display a two bars whose PNBvalue1 and PNBvalue2 is from generatesampledata.*/}
            {PNBColumns?.[0]? <Bar type="monotone" dataKey={`PNBvalue1`} name={PNBColumns[0]} fill="#8884d8" /> : <Bar type="monotone" dataKey={`PNBvalue1`} name={"Sample"} fill="#8884d8" />}
            {PNBColumns?.[1]? <Bar type="monotone" dataKey={`PNBvalue2`} name={PNBColumns[1]} fill='#83a6ed' /> : <Bar type="monotone" dataKey={`PNBvalue1`} name={"Sample"} fill='#83a6ed' />}
            {PNBColumns?.[2]? <Bar type="monotone" dataKey={`PNBvalue3`} name={PNBColumns[2]} fill='#8dd1e1' />: null}
            {PNBColumns?.[3]? <Bar type="monotone" dataKey={`PNBvalue4`} name={PNBColumns[4]} fill='#82ca9d' /> : null}
            {PNBColumns?.[4]? <Bar type="monotone" dataKey={`PNBvalue5`} name={PNBColumns[5]} fill='#a4de6c' /> : null}

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
        console.log("isStackedLineData:", StackedLineColumns?.[0]); 
        return (
          <LineChart {...commonChartProps} data={data as StackedLineDataPoint[]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="SLname" /> {/* Access SLname directly */}
            <YAxis
            />
            <Tooltip {...tooltipStyle} />
            {/* Access index, only if corresponding StackedLineColumn index is defined . Check is isStackedlineData before accessing its SLname as the name of the line*/}
            {/* Added fallback in the case that a new chart is added of StackedLine. When newly added, there is no StackedLineColumn, so fallback condition is to still display a line whose SLvalue1 is from generatesampledata.*/}
            {StackedLineColumns?.[0]? <Line type="monotone" dataKey={`SLvalue1`} name={StackedLineColumns[0]} stroke="#8884d8" /> : <Line type="monotone" dataKey={`SLvalue1`} name={"Sample"} stroke="#8884d8" />}
            {StackedLineColumns?.[1]? <Line type="monotone" dataKey={`SLvalue2`} name={StackedLineColumns[1]} stroke='#83a6ed' /> : null}
            {StackedLineColumns?.[2]? <Line type="monotone" dataKey={`SLvalue3`} name={StackedLineColumns[2]} stroke='#8dd1e1' />: null}
            {StackedLineColumns?.[3]? <Line type="monotone" dataKey={`SLvalue4`} name={StackedLineColumns[4]} stroke='#82ca9d' /> : null}
            {StackedLineColumns?.[4]? <Line type="monotone" dataKey={`SLvalue5`} name={StackedLineColumns[5]} stroke='#a4de6c' /> : null}

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
