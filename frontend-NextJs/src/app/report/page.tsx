"use client";

import React, { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Select,
  MenuItem,
  Grid,
  Tabs,
  Tab,
  IconButton,
} from "@mui/material";
import {
  ScatterPlot as ScatterPlotIcon,
  BarChart as BarChartIcon,
  Radar as RadarIcon,
  ShowChart as ShowChartIcon,
  Layers as LayersIcon,
  GetApp as GetAppIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Image as ImageIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Chart, ChartType, Page } from "../../types";
import FullWidthDivider from "../../components/FullWidthDivider";
import MainCanvas from "../../components/MainCanvas";
import RightSidebar from "../../components/RightSidebar";
import { generateSampleData } from "../../components/chartUtils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const icons = [
  { icon: <ScatterPlotIcon />, label: "Scatter" },
  { icon: <BarChartIcon />, label: "Histogram" },
  { icon: <RadarIcon />, label: "Radar" },
  { icon: <ShowChartIcon />, label: "Stacked Line" },
  { icon: <LayersIcon />, label: "RadialBar" },
];

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

  useEffect(() => {
    localStorage.setItem("reportPages", JSON.stringify(pages));
  }, [pages]);

  const addChart = (type: ChartType) => {
    const newChart: Chart = {
      id: Date.now(),
      type,
      title: "",
      xAxis: "",
      yAxis: "",
      data: generateSampleData(type),
      x: 50,
      y: 50,
      width: 200,
      height: 200,
    };
    setPages((prevPages) => {
      const updatedPages = prevPages.map((page, index) =>
        index === currentPageIndex
          ? { ...page, charts: [...page.charts, newChart] }
          : page
      );
      return updatedPages;
    });
    setSelectedChartId(newChart.id);
  };

  const removeChart = (id: number) => {
    setPages((prevPages) =>
      prevPages.map((page, index) =>
        index === currentPageIndex
          ? { ...page, charts: page.charts.filter((chart) => chart.id !== id) }
          : page
      )
    );
    if (selectedChartId === id) {
      setSelectedChartId(null);
    }
  };

  const updateChartPosition = (id: number, x: number, y: number) => {
    setPages((prevPages) =>
      prevPages.map((page, index) =>
        index === currentPageIndex
          ? {
              ...page,
              charts: page.charts.map((chart) =>
                chart.id === id ? { ...chart, x, y } : chart
              ),
            }
          : page
      )
    );
  };

  const updateChartSize = (id: number, width: number, height: number) => {
    setPages((prevPages) =>
      prevPages.map((page, index) =>
        index === currentPageIndex
          ? {
              ...page,
              charts: page.charts.map((chart) =>
                chart.id === id ? { ...chart, width, height } : chart
              ),
            }
          : page
      )
    );
  };

  // Function to export the visualization area as PNG
  const exportAsPNG = async () => {
    try {
      if (!visualizationAreaRef.current) return;
      const canvas = await html2canvas(visualizationAreaRef.current, {
        backgroundColor: "#ffffff",
        scale: 2, // Increase scale for better resolution
      });
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `${pages[currentPageIndex].name}.png`;
      link.click();
    } catch (error) {
      console.error("Failed to export as PNG:", error);
      alert("An error occurred while exporting as PNG.");
    }
  };

  // Function to export the visualization area as PDF
  const exportAsPDF = async () => {
    try {
      if (!visualizationAreaRef.current) return;
      const canvas = await html2canvas(visualizationAreaRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${pages[currentPageIndex].name}.pdf`);
    } catch (error) {
      console.error("Failed to export as PDF:", error);
      alert("An error occurred while exporting as PDF.");
    }
  };

  const selectChart = (id: number) => {
    setSelectedChartId((prevId) => (prevId === id ? null : id));
  };

  const updateSelectedChart = (property: keyof Omit<Chart, "data">, value: string | number) => {
    if (selectedChartId === null) return;
    setPages((prevPages) =>
      prevPages.map((page, index) =>
        index === currentPageIndex
          ? {
              ...page,
              charts: page.charts.map((chart) =>
                chart.id === selectedChartId ? { ...chart, [property]: value } : chart
              ),
            }
          : page
      )
    );
  };

  const addPage = () => {
    const newPage: Page = {
      id: Date.now(),
      name: `Page ${pages.length + 1}`,
      charts: [],
      remark: "This is an auto-generated remark. You can edit this section manually.",
    };
    setPages((prevPages) => [...prevPages, newPage]);
    setCurrentPageIndex(pages.length);
    setSelectedChartId(null);
  };

  const deleteCurrentPage = () => {
    if (pages.length === 1) {
      alert("Cannot delete the only remaining page.");
      return;
    }
    const confirmDelete = window.confirm(`Are you sure you want to delete ${pages[currentPageIndex].name}?`);
    if (!confirmDelete) return;
    setPages((prevPages) => {
      const newPages = prevPages.filter((_, index) => index !== currentPageIndex);
      const newIndex = currentPageIndex >= newPages.length ? newPages.length - 1 : currentPageIndex;
      setCurrentPageIndex(newIndex);
      setSelectedChartId(null);
      return newPages;
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    if (newValue === pages.length) {
      addPage();
    } else {
      setCurrentPageIndex(newValue);
      setSelectedChartId(null);
    }
  };

  const startEditingPage = (pageId: number, currentName: string) => {
    setEditingPageId(pageId);
    setEditingPageName(currentName);
  };

  const handlePageNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditingPageName(e.target.value);
  };

  const finishEditingPage = () => {
    if (editingPageId === null) return;
    const trimmedName = editingPageName.trim();
    if (trimmedName === "") {
      alert("Page name cannot be empty.");
      return;
    }
    setPages((prevPages) =>
      prevPages.map((page) => (page.id === editingPageId ? { ...page, name: trimmedName } : page))
    );
    setEditingPageId(null);
    setEditingPageName("");
  };

  const handleTabKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      finishEditingPage();
    }
  };

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
                onClick={() => addChart(item.label as ChartType)}
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
                value={selectedChart.title}
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
            onChange={handleTabChange}
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            BUILD VISUALS
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ImageIcon />}
              onClick={exportAsPNG}
              sx={{ mr: 1 }}
            >
              Export PNG
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PictureAsPdfIcon />}
              onClick={exportAsPDF}
              sx={{ mr: 1 }}
            >
              Export PDF
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CloseIcon />}
              onClick={deleteCurrentPage}
              disabled={pages.length === 1}
            >
              Delete Page
            </Button>
          </Box>
        </Box>
        <FullWidthDivider />

        {/* Main Visualization and Remarks */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative",
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
                paddingBottom: "100px",
              }}
            >
              <MainCanvas
                charts={currentPage.charts}
                removeChart={removeChart}
                onDragStop={updateChartPosition}
                onResizeStop={updateChartSize}
                onSelectChart={selectChart}
                selectedChartId={selectedChartId}
              />
            </Box>
            {/* Remarks Section inside the visualization area */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "100px",
                borderTop: "1px solid #adb5bd",
                bgcolor: "#f8f9fa",
                p: 1,
                boxSizing: "border-box",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{ mb: 0.5, fontSize: "0.8rem" }}
              >
                Remarks
              </Typography>
              <TextField
                fullWidth
                multiline
                inputProps={{ style: { fontSize: 12 } }}
                rows={3}
                value={currentPage.remark}
                onChange={(e) => {
                  const newRemark = e.target.value;
                  setPages((prevPages) =>
                    prevPages.map((page, index) =>
                      index === currentPageIndex ? { ...page, remark: newRemark } : page
                    )
                  );
                }}
                placeholder="Add your chart remarks here..."
                sx={{
                  bgcolor: "#ffffff",
                  borderRadius: 1,
                  fontSize: "0.8rem",
                  "& .MuiInputBase-input": {
                    padding: "4px 6px",
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right Sidebar */}
      <RightSidebar />
    </Box>
  );
};

export default ReportLayout;
