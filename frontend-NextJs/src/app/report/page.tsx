// src/app/report/page.tsx

"use client";

import React, { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  Grid,
  Tabs,
  Tab,
  IconButton,
  useMediaQuery,
  Drawer,
  SelectChangeEvent,
  Button,
} from "@mui/material";
import {
  ScatterPlot as ScatterPlotIcon,
  BarChart as BarChartIcon,
  Radar as RadarIcon,
  ShowChart as ShowChartIcon,
  Layers as LayersIcon,
  Add as AddIcon,
  Image as ImageIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Close as CloseIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { ChartType, Page, Chart, ScatterDataPoint } from "../../types";
import FullWidthDivider from "../../components/FullWidthDivider";
import MainCanvas from "../../components/MainCanvas";
import RightSidebar from "../../components/RightSidebar";
import RemarkSection from "../../components/RemarkSection";
import Toolbar from "../../components/Toolbar";
import { exportAsPNG, exportAsPDF } from "./core/exportFunctions";
import {
  addPage as addPageFn,
  deleteCurrentPage as deleteCurrentPageFn,
} from "./core/pageFunctions";
import {
  addChart as addChartFn,
  removeChart as removeChartFn,
  updateChartPosition as updateChartPositionFn,
  updateChartSize as updateChartSizeFn,
  updateChartProperty as updateChartPropertyFn,
} from "./core/chartFunctions";
import { useVisitorId } from "@/context/visitorIDManager";
import { useRouter } from "next/navigation";
import { fetchCsrfToken } from '../../components/csrfToken'
import { ChartData } from "../../types";
import createChartData from "../../components/chartData"

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
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // State variables for sidebars
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  // Handlers for sidebars
  const handleOpenLeftSidebar = () => {
    setLeftSidebarOpen(true);
  };

  const handleCloseLeftSidebar = () => {
    setLeftSidebarOpen(false);
  };

  const handleOpenRightSidebar = () => {
    setRightSidebarOpen(true);
  };

  const handleCloseRightSidebar = () => {
    setRightSidebarOpen(false);
  };

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
  const updateSelectedChart = async( 
    property: keyof Chart,
    value: string | number | ChartData
  ) => {
    if (selectedChartId === null) return;
    updateChartPropertyFn(
      selectedChartId,
      property,
      value,
      pages,
      currentPageIndex,
      setPages
    );
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
  const selectedChart = pages[currentPageIndex].charts.find(
    (chart) => chart.id === selectedChartId
  );
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


  // Retrieve visitorId
  const router = useRouter();
  const visitorId = useVisitorId();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ error: "", success: "" }); 
  
  useEffect(() => {
    if (visitorId) {
      try {
        const fetchMenuItems = async () => {
          const fullUrl = new URL("http://127.0.0.1:8000/api/report/retrieve-chart-data/");
            fullUrl.searchParams.append('uuid', visitorId);

          const response = await fetch(fullUrl.toString(), {
            method: 'GET',
            headers: {
              'X-CSRFToken': await fetchCsrfToken(),
            },
            credentials: 'include',
          });

          const data = await response.json()

          if (!response.ok) {
            setStatus({ error: data["error"] || "Error Fetching Data", success: "" });
            return null;
          }

          setMenuItemsData(data)
        };

        fetchMenuItems();
    
      } 
      catch (error) {
        if (error instanceof Error) {
          setStatus({ error: error.message, success: "" });
        }
      }
      finally{
        setLoading(false); 
      }
    }
      else if (visitorId === "") { // Wait to resolve, from initial state empty string.
        console.log("Waiting for visitor ID...");
    } else if (visitorId === null && router !== null) { // If it is set to null, then the localstorage return nothing.
        router.push('/home'); // Redirect if visitorId is not available, meaning it is a new user with no prior csv uploads or progress.
    }
  }, [visitorId]);

  // Initialize Menu Items to be used as X or Y Axis values.
  const [menuItemsData, setMenuItemsData] = useState<Record<string, string[]>>({});
  const [isDropdownChange, setIsDropdownChange] = useState(false);

  // Handle X or Y axis values change
  const handleChange = async (e: SelectChangeEvent<string>, axis: "Y" | "X") => {
    const value = e.target.value as string;
    
    if (axis === 'Y') {
      await updateSelectedChart("yAxis", value);
      setIsDropdownChange(true); // Mark that this change is coming from the dropdown
    } else {
      await updateSelectedChart("xAxis", value);
      setIsDropdownChange(true); // Mark that this change is coming from the dropdown
    }
  };

  const previousDataRef = useRef<ScatterDataPoint[]>([]); // Ref to hold previous data without causing re-renders
  
  useEffect(() => {
    if (selectedChart) {
      // Define ScatterData
      const isScatterData = (data: any): data is ScatterDataPoint[] => {
        return Array.isArray(data) && data.every(point => 'x' in point && 'y' in point);
      };
      // ScatterPlotData Handling
      if ((selectedChart.yAxis || selectedChart.xAxis) && isScatterData(selectedChart.data)) {

        // Step 1: Set previousData before running update, because we'll use this in determining the values in case of x only updated or y only updated.
        previousDataRef.current = selectedChart.data; // Temporarily store previous data in ref
        
        // Step 2: Calculate updatedData based on previousData and passed xFields or yFields
        const updatedData = createChartData(menuItemsData, selectedChart, {
          xField: selectedChart.xAxis ? selectedChart.xAxis : undefined,
          yField: selectedChart.yAxis ? selectedChart.yAxis : undefined,
        }, previousDataRef.current); // Use ref value for previous data

        console.log(updatedData);
        
        // Step 3: Update chart data
        updateSelectedChart('data', updatedData);

        // Reset the flag after processing the update
        setIsDropdownChange(false);
      }
      // Else if Histogram
      // Else if Radar
      // Else if Stacked Line
      // Else if RadialBar
    }
  }, [isDropdownChange]); // Run when Dropdown values change


  // Generate AI Remarks
  const sendChartData = async () => {
    const chartData = [
      { x: 34.5, y: 7.8292 },
      { x: 47, y: 7 },
      { x: 62, y: 9.6875 },
      { x: 27, y: 8.6625 },
      { x: 22, y: 12.2875 },
      // ... TEMPORARY SHOULD GET FROM SELECTED CHART
    ];
  
    const chartType = "scatter";  // TEMPORARY SHOULD GET FROM SELECTED CHART
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/report/generate-ai-remarks/", {
        method: 'POST',
        headers: {
          'X-CSRFToken': await fetchCsrfToken(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chart_type: chartType,
          chart_data: chartData,
        }),
      });
  
      const aiRemarks = await response.json();
      handleRemarkChange(aiRemarks.remarks)
  
    } catch (error) {
      console.error('Error sending chart data:', error);
    }
  };

  // Left Sidebar content
  const leftSidebarContent = (
    <Box
      sx={{
        width: 200,
        display: "flex",
        flexDirection: "column",
        p: 2,
        bgcolor: "#ECECEC",
        height: "100%",
      }}
      role="presentation"
    >
      <Typography variant="h6" fontWeight="bold" align="center">
        VISUALIZATIONS
      </Typography>
      <FullWidthDivider />
      <Grid container spacing={1} sx={{ mb: 2 }} flexDirection="column">
        {icons.map((item, index) => (
          <Grid item xs="auto" key={index}>
            {/* Flex container to align icon and label horizontally */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',  // Align icon and label horizontally
                alignItems: 'center',   // Vertically align icon and label
                width: '100%',          // Ensure full width of the container
                mb: 1,                  // Optional spacing between items
              }}
            >
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
                  width: 40,  // Set the width of the icon
                  height: 40,
                  bgcolor: "#e9ecef",
                  border: "1px solid #adb5bd",
                  borderRadius: 1,
                  mr: 1,  // Space between icon and text
                }}
                title={item.label}
                aria-label={`Add ${item.label} Chart`}
              >
                {item.icon}
              </IconButton>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {item.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      <FullWidthDivider />
      {/* Values Section */}
      {selectedChart ? (
        <>
        <Typography
          variant="h6"
          fontWeight="bold"
          align="center"
          sx={{ textTransform: "uppercase", mb: 0 }}
        >
          VALUES
        </Typography>
        <FullWidthDivider />
        {/* Title Input */}
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

        {/* Y-Axis Input and Color Picker */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" fontWeight="bold">
            Y-axis
          </Typography>
          <Select
            fullWidth
            displayEmpty
            value={selectedChart.yAxis || ""}
            onChange={(e) =>
              updateSelectedChart("yAxis", e.target.value as string)
            }
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

          {/* Y-axis Color Customization */}
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" fontWeight="bold" sx={{ mr: 2 }}>
              Pick Color
            </Typography>
            <TextField
              type="color"
              value={selectedChart.yAxisColor || "#000000"}
              onChange={(e) => updateSelectedChart("yAxisColor", e.target.value)}
              sx={{
                width: 90,
                height: 30,
                bgcolor: "#fff",
                mt: 0.5,
                '& input': {
                  height: '100%',
                  width: '100%',
                  padding: 1,
                },
              }}
            />
          </Box>
        </Box>

        {/* X-Axis Input and Color Picker */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" fontWeight="bold">
            X-axis
          </Typography>
          <Select
            fullWidth
            displayEmpty
            value={selectedChart.xAxis || ""}
            onChange={(e) =>{
              updateSelectedChart("xAxis", e.target.value as string)

              }
            }
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

          {/* X-axis Color Customization */}
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" fontWeight="bold" sx={{ mr: 2 }}>
              Pick Color
            </Typography>
            <TextField
              type="color"
              value={selectedChart.xAxisColor || "#000000"}
              onChange={(e) => updateSelectedChart("xAxisColor", e.target.value)}
              sx={{
                width: 90,
                height: 30,
                bgcolor: "#fff",
                mt: 0.5,
                '& input': {
                  height: '100%',
                  width: '100%',
                  padding: 1,
                },
              }}
            />
          </Box>
        </Box>
      </>
    ) : (
      <Typography variant="caption" align="center" sx={{ mt: 2 }}>
        Select a chart to edit its values.
      </Typography>
    )}
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "#ECECEC" }}>
      {/* Left Sidebar */}
      {!isSmallScreen ? (
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
          {/* Temporary Button */}
          <Button variant='contained' onClick={() => { sendChartData(); }}>
            Generate Remarks
          </Button>

          <Typography variant="h6" fontWeight="bold" align="center">
            VISUALIZATIONS
          </Typography>
          <FullWidthDivider />
          
          {/* Updated Grid Container to display icons vertically */}
          <Grid container spacing={0} sx={{ mb: 1, flexDirection: 'column' }}>
            {icons.map((item, index) => (
              <Grid item xs="auto" key={index}>
                {/* Flex container to align icon and label */}
                <Box 
                  sx={{
                    display: 'flex', 
                    alignItems: 'center',  // Vertically align icon and text
                    width: '100%',  // Ensure full width of the container
                    mb: 1  // Optional spacing between icons
                  }}
                >
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
                      width: 40,  // Set the width of the icon
                      height: 40,
                      bgcolor: "#e9ecef",
                      border: "1px solid #adb5bd",
                      borderRadius: 1,
                      mr: 1, // Space between icon and text
                    }}
                    title={item.label}
                    aria-label={`Add ${item.label} Chart`}
                  >
                    {item.icon}
                  </IconButton>
                  {/* Display the chart name next to the icon */}
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {item.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <FullWidthDivider />
          {/* Values Section */}
          {selectedChart ? (
            <>
              <Typography
                variant="h6"
                fontWeight="bold"
                align="center"
                sx={{ textTransform: "uppercase", mb: 0 }}
              >
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
                  onChange={(e) => handleChange(e, "Y")} 
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

                  {Object.keys(menuItemsData).map((key) =>
                      key ? (
                        <MenuItem key={key} value={key}>
                          {key}
                        </MenuItem>
                      ) : null
                    )}

                </Select>
                {/* Y-axis Color Customization */}
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="caption" fontWeight="bold" sx={{ mr: 2 }}>
                    Pick Color
                  </Typography>
                  <TextField
                    type="color"
                    value={selectedChart.yAxisColor || "#000000"}
                    onChange={(e) => updateSelectedChart("yAxisColor", e.target.value)}
                    sx={{
                      width: 90, 
                      height: 30, 
                      bgcolor: "#fff",
                      mt: 0.5,
                      '& input': {
                        height: '100%', 
                        width: '100%',
                        padding: 1,  
                      },
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" fontWeight="bold">
                  X-axis
                </Typography>
                <Select
                  fullWidth
                  displayEmpty
                  value={selectedChart.xAxis || ""}
                  onChange={(e) => handleChange(e, "X")} 
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

                  {Object.keys(menuItemsData).map((key) =>
                      key ? (
                        <MenuItem key={key} value={key}>
                          {key}
                        </MenuItem>
                      ) : null
                    )}

                </Select>
                {/* X-axis Color Customization */}
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="caption" fontWeight="bold" sx={{ mr: 2 }}>
                    Pick Color
                  </Typography>
                  <TextField
                    type="color"
                    value={selectedChart.xAxisColor || "#000000"}
                    onChange={(e) => updateSelectedChart("xAxisColor", e.target.value)}
                    sx={{
                      width: 90, 
                      height: 30, 
                      bgcolor: "#fff",
                      mt: 0.5,
                      '& input': {
                        height: '100%', 
                        width: '100%',
                        padding: 1,  
                      },
                    }}
                  />
                </Box>
              </Box>
            </>
          ) : (
            <Typography variant="caption" align="center" sx={{ mt: 2 }}>
              Select a chart to edit its values.
            </Typography>
          )}
        </Paper>
      ) : (
        <>
          <Drawer
            anchor="left"
            open={leftSidebarOpen}
            onClose={handleCloseLeftSidebar}
          >
            {leftSidebarContent}
          </Drawer>
        </>
      )}

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
                      onDoubleClick={() =>
                        startEditingPage(page.id, page.name)
                      }
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
          exportPDF={exportPDF}
          deletePage={() =>
            deleteCurrentPageFn(
              pages,
              currentPageIndex,
              setPages,
              setCurrentPageIndex
            )
          }
          isDeleteDisabled={pages.length === 1}
        />
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
                paddingBottom: "50px", // Space for remarks
              }}
            >
              <MainCanvas
                charts={currentPage.charts}
                removeChart={(id) =>
                  removeChartFn(
                    id,
                    pages,
                    currentPageIndex,
                    setPages,
                    setSelectedChartId
                  )
                }
                onDragStop={(id, x, y) =>
                  updateChartPositionFn(
                    id,
                    x,
                    y,
                    pages,
                    currentPageIndex,
                    setPages
                  )
                }
                onResizeStop={(id, width, height) =>
                  updateChartSizeFn(
                    id,
                    width,
                    height,
                    pages,
                    currentPageIndex,
                    setPages
                  )
                }
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
      {!isSmallScreen ? (
        <RightSidebar />
      ) : (
        <>
          <Drawer
            anchor="right"
            open={rightSidebarOpen}
            onClose={handleCloseRightSidebar}
          >
            <Box
              sx={{
                width: isSmallScreen ? '100%' : '250px', // make drawer width dynamic
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                bgcolor: '#ECECEC',
                height: '100%',
              }}
              role="presentation"
            >
              <RightSidebar />
            </Box>
          </Drawer>
        </>
      )}

      {/* Floating Icons for Mobile View */}
      {isSmallScreen && (
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <IconButton
            onClick={handleOpenLeftSidebar}
            color="primary"
            sx={{
              bgcolor: "white",
              "&:hover": {
                bgcolor: "grey.200",
              },
              boxShadow: 5,
            }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            onClick={handleOpenRightSidebar}
            color="primary"
            sx={{
              bgcolor: "white",
              "&:hover": {
                bgcolor: "grey.200",
              },
              boxShadow: 5,
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default ReportLayout;
