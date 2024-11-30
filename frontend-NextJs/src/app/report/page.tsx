// src/app/report/page.tsx

"use client";

import React, { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from "react";
import {
  Box,Typography,Paper,TextField,Select,MenuItem,Grid,Tabs,Tab,IconButton,} from "@mui/material";
import {
  ScatterPlot as ScatterPlotIcon, BarChart as BarChartIcon, Radar as RadarIcon,
  ShowChart as ShowChartIcon, Layers as LayersIcon, Add as AddIcon, Image as ImageIcon,
  PictureAsPdf as PictureAsPdfIcon, Close as CloseIcon,} from "@mui/icons-material";
import { ChartType, Page, Chart } from "../../types";
import FullWidthDivider from "../../components/FullWidthDivider";
import MainCanvas from "../../components/MainCanvas";
import RightSidebar from "../../components/RightSidebar";
import RemarkSection from "../../components/RemarkSection";
import Toolbar from "../../components/Toolbar";
import { exportAsPNG, exportAsPDF } from "./core/exportFunctions";
import { addPage as addPageFn, deleteCurrentPage as deleteCurrentPageFn, } from "./core/pageFunctions";
import { addChart as addChartFn, removeChart as removeChartFn, 
updateChartPosition as updateChartPositionFn, updateChartSize as updateChartSizeFn,
updateChartProperty as updateChartPropertyFn, } from "./core/chartFunctions";

const icons = [
  { icon: <ScatterPlotIcon />, label: "Scatter" }, { icon: <BarChartIcon />, label: "Histogram" },
  { icon: <RadarIcon />, label: "Radar" }, { icon: <ShowChartIcon />, label: "Stacked Line" },
  { icon: <LayersIcon />, label: "RadialBar" }, ];

const ReportLayout: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([
    {
      id: Date.now(),
      name: "Page 1",
      charts: [],
      remark: "This is an auto-generated remark. You can edit this section manually.",
    },
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [selectedChartId, setSelectedChartId] = useState<number | null>(null);
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [editingPageName, setEditingPageName] = useState<string>("");
  const visualizationAreaRef = useRef<HTMLDivElement>(null); // Reference to the visualization area

  // Load pages from localStorage on mount
  useEffect(() => {
    const savedPages = localStorage.getItem("reportPages");
    if (savedPages) {
      try {
        const parsedPages = JSON.parse(savedPages);
        if (Array.isArray(parsedPages) && parsedPages.length > 0) {
          const initializedPages: Page[] = parsedPages.map((page: any) => ({
            ...page,
            remark:
              page.remark ||
              "This is an auto-generated remark. You can edit this section manually.",
          }));
          setPages(initializedPages);
          setCurrentPageIndex((prevIndex) =>
            prevIndex < initializedPages.length ? prevIndex : 0
          );
        } else {
          console.warn("Saved pages are not in expected format. Using default page.");
        }
      } catch (e) {
        console.error("Error parsing saved pages:", e);
      }
    }
  }, []);

  // Save pages to localStorage whenever pages state changes
  useEffect(() => {
    localStorage.setItem("reportPages", JSON.stringify(pages));
  }, [pages]);

  /**
   * Exports the visualization area as PNG.
   */
  const exportPNG = () => {
    if (!visualizationAreaRef.current) return;
    exportAsPNG(visualizationAreaRef.current, pages[currentPageIndex].name);
  };

  /**
   * Exports the current page as a PDF.
   */
  const exportPDF = () => {
    if (!visualizationAreaRef.current) return;
    exportAsPDF(visualizationAreaRef.current, pages[currentPageIndex].name);
  };

  /**
   * Handles chart selection.
   * @param id - The ID of the chart to select/deselect.
   */
  const selectChart = (id: number) => {
    setSelectedChartId((prevId) => (prevId === id ? null : id));
  };

  /**
   * Updates the selected chart's property.
   * @param property - The property to update (e.g., title, xAxis, yAxis).
   * @param value - The new value for the property.
   */
  const updateSelectedChart = (property: keyof Omit<Chart, "data">, value: string | number) => {
    if (selectedChartId === null) return;
    updateChartPropertyFn(selectedChartId, property, value, pages, currentPageIndex, setPages);
  };

  /**
   * Initiates the editing mode for a page's name.
   * @param pageId - The ID of the page to edit.
   * @param currentName - The current name of the page.
   */
  const startEditingPage = (pageId: number, currentName: string) => {
    setEditingPageId(pageId);
    setEditingPageName(currentName);
  };

  /**
   * Handles changes to the page name input.
   * @param e - The change event from the input.
   */
  const handlePageNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditingPageName(e.target.value);
  };

  /**
   * Finishes the editing mode and updates the page name.
   */
  const finishEditingPage = () => {
    if (editingPageId === null) return;
    const trimmedName = editingPageName.trim();
    if (trimmedName === "") {
      alert("Page name cannot be empty.");
      return;
    }
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === editingPageId ? { ...page, name: trimmedName } : page
      )
    );
    setEditingPageId(null);
    setEditingPageName("");
  };

  /**
   * Handles keypress events in the page name input.
   * @param e - The keyboard event.
   */
  const handleTabKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      finishEditingPage();
    }
  };

  /**
   * Handles changes to the remarks section.
   * @param newRemark - The updated remark text.
   */
  const handleRemarkChange = (newRemark: string) => {
    setPages((prevPages) =>
      prevPages.map((page, index) =>
        index === currentPageIndex ? { ...page, remark: newRemark } : page
      )
    );
  };

  // Retrieve the selected chart and current page
  const selectedChart = pages[currentPageIndex]?.charts.find((chart) => chart.id === selectedChartId);
  const currentPage = pages[currentPageIndex];

  if (!currentPage) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="error">
          Current page not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "#ECECEC" }}>
      {/* Left Sidebar */}
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
                onClick={() =>
                  addChartFn(
                    item.label as ChartType,
                    pages,
                    currentPageIndex,
                    setPages,
                    setSelectedChartId
                  )
                }
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
        {/* Values Section */}
        {selectedChart ? (
          <>
            <Typography variant="h6" fontWeight="bold" align="center" sx={{ textTransform: "uppercase", mb: 0 }}>
              VALUES
            </Typography>
            <FullWidthDivider />
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Title
              </Typography>
              <TextField
                fullWidth
                value={selectedChart.title || ""}
                onChange={(e) => updateSelectedChart("title", e.target.value)}
                size="small"
                sx={{
                  mt: 0.5,
                  bgcolor: "#f8f9fa",
                  borderRadius: 1,
                  "& .MuiInputBase-input": {
                    padding: "6px 8px",
                    fontSize: "0.75rem",
                  },
                }}
                placeholder="Enter title here"
              />
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Y-axis
              </Typography>
              <Select
                fullWidth
                displayEmpty
                value={selectedChart.yAxis || ""}
                onChange={(e) => updateSelectedChart("yAxis", e.target.value as string)}
                sx={{
                  mt: 0.5,
                  bgcolor: "#f8f9fa",
                  border: "1px solid #adb5bd",
                  borderRadius: "4px",
                  "& .MuiSelect-select": {
                    padding: "6px 8px",
                    fontSize: "0.75rem",
                  },
                }}
                size="small"
              >
                <MenuItem value="">
                  <em>Select Y-axis field</em>
                </MenuItem>
                {selectedChart.data.length > 0 &&
                  Object.keys(selectedChart.data[0]).map((key) =>
                    key !== "fill" ? (
                      <MenuItem key={key} value={key}>
                        {key}
                      </MenuItem>
                    ) : null
                  )}
              </Select>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                X-axis
              </Typography>
              <Select
                fullWidth
                displayEmpty
                value={selectedChart.xAxis || ""}
                onChange={(e) => updateSelectedChart("xAxis", e.target.value as string)}
                sx={{
                  mt: 0.5,
                  bgcolor: "#f8f9fa",
                  border: "1px solid #adb5bd",
                  borderRadius: "4px",
                  "& .MuiSelect-select": {
                    padding: "6px 8px",
                    fontSize: "0.75rem",
                  },
                }}
                size="small"
              >
                <MenuItem value="">
                  <em>Select X-axis field</em>
                </MenuItem>
                {selectedChart.data.length > 0 &&
                  Object.keys(selectedChart.data[0]).map((key) =>
                    key !== "fill" ? (
                      <MenuItem key={key} value={key}>
                        {key}
                      </MenuItem>
                    ) : null
                  )}
              </Select>
            </Box>
          </>
        ) : (
          <Typography variant="caption" align="center" sx={{ mt: 2 }}>
            Select a chart to edit its values.
          </Typography>
        )}
      </Paper>

      {/* Visualization Area */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          bgcolor: "#ECECEC",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Tabs for Pages */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentPageIndex}
            onChange={(event, newValue) => {
              if (newValue === pages.length) {
                addPageFn(pages, setPages);
              } else {
                setCurrentPageIndex(newValue);
                setSelectedChartId(null);
              }
            }}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="report pages tabs"
          >
            {pages.map((page, index) => (
              <Tab
                key={page.id}
                label={
                  editingPageId === page.id ? (
                    <TextField
                      value={editingPageName}
                      onChange={handlePageNameChange}
                      onBlur={finishEditingPage}
                      onKeyPress={handleTabKeyPress}
                      autoFocus
                      size="small"
                      sx={{
                        width: 100,
                        "& .MuiInputBase-input": {
                          padding: "2px 4px",
                          fontSize: "0.75rem",
                        },
                      }}
                    />
                  ) : (
                    <Box
                      onDoubleClick={() => startEditingPage(page.id, page.name)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      <Typography variant="body2">{page.name}</Typography>
                    </Box>
                  )
                }
              />
            ))}
            <Tab
              icon={<AddIcon />}
              aria-label="Add Page"
              sx={{ minWidth: 40 }}
              disableRipple
            />
          </Tabs>
        </Box>

        {/* Toolbar */}
        <Toolbar
          exportPNG={exportPNG}
          exportPDF={exportPDF} // Added exportPDF
          deletePage={() => deleteCurrentPageFn(pages, currentPageIndex, setPages, setCurrentPageIndex)}
          isDeleteDisabled={pages.length === 1}
        />
        <FullWidthDivider />

        {/* Main Visualization and Remarks */}
        <Box
          sx={{
            flex: 1, display: "flex", flexDirection: "column", position: "relative",
          }}
        >
          {/* Main Visualization Area */}
          <Box
            ref={visualizationAreaRef} // Reference to the visualization area
            sx={{
              flexGrow: 1,
              position: "relative",
              bgcolor: "#ffffff",
              border: "2px dashed #adb5bd",
              borderRadius: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center",
              p: 2,
              height: "100%",
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                width: "100%",
                position: "relative",
                paddingBottom: "50px", // Space for remarks
              }}
            >
              <MainCanvas
                charts={currentPage.charts}
                removeChart={(id) => removeChartFn(id, pages, currentPageIndex, setPages, setSelectedChartId)}
                onDragStop={(id, x, y) => updateChartPositionFn(id, x, y, pages, currentPageIndex, setPages)}
                onResizeStop={(id, width, height) => updateChartSizeFn(id, width, height, pages, currentPageIndex, setPages)}
                onSelectChart={selectChart}
                selectedChartId={selectedChartId}
              />
            </Box>
            {/* Remarks Section inside the visualization area */}
            <RemarkSection
              remark={currentPage.remark}
              onChange={handleRemarkChange}
            />
          </Box>
        </Box>
      </Box>

      {/* Right Sidebar */}
      <RightSidebar />
    </Box>
  );
};

export default ReportLayout;
