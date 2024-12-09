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
  FormControl,
  InputLabel,
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
import { ChartType, Page, Chart, ScatterDataPoint, PositiveNegativeBarDataPoint, RadarDataPoint, StackedLineDataPoint, RadialBarDataPoint } from "../../types";
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
import { createChartData, isScatterData, isPositiveNegativeBarData, isRadarData, isStackedLineData, isRadialBarData } from "../../components/chartData"

const icons = [
  { icon: <ScatterPlotIcon />, label: "Scatter", displayName: "Scatter Plot" },
  { icon: <BarChartIcon />, label: "PositiveNegativeBar", displayName: "Positive-Negative Bar" },
  { icon: <RadarIcon />, label: "Radar", displayName: "Radar Chart" },
  { icon: <ShowChartIcon />, label: "StackedLine", displayName: "Stacked Line Chart" },
  { icon: <LayersIcon />, label: "RadialBar", displayName: "Radial Bar" },
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
  const updateSelectedChart = async (
    property: keyof Chart,
    value: any
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
          const fullUrl = new URL("https://miyukiin.pythonanywhere.com/api/report/retrieve-chart-data/");
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
      finally {
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

  // Handle dropdown values change of either of the any data chart types. 
  const handleChange = async (e: SelectChangeEvent<string | number>, property: string, selectIndex?: number) => {

    // Handle ScatterPlot X or Y Axis.
    if (property === 'xAxis' || property === 'yAxis') {
      if (property === 'yAxis') {
        await updateSelectedChart("yAxis", e.target.value);
        setIsDropdownChange(true); // Mark that this change is coming from the dropdown
      } else {
        await updateSelectedChart("xAxis", e.target.value);
        setIsDropdownChange(true); 
      }
    } 
    // Handle PositiveNegativeBar
    else if (property === "xAxis1"){
      await updateSelectedChart("xAxis1", e.target.value);
      setIsDropdownChange(true);
    }
    // Handle Radar
    else if (property === "NumericColumns" || property === "RowsSelected"){
      if (selectedChart && typeof selectIndex === "number") {
        if (property === "NumericColumns"){
          let updatedNumericColumns;
          if (!selectedChart.NumericColumns || selectedChart.NumericColumns.length === 0) {
            // If NumericColumns is empty, initialize it with the selected value
            updatedNumericColumns = [e.target.value];
          } 
          else {
            // If NumericColumns has existing values, update or append based on selectIndex
            updatedNumericColumns = [...selectedChart.NumericColumns];
      
            // Replace value if updatedNumericColumns[selectIndex] already has a value.
            if (updatedNumericColumns[selectIndex] !== undefined) {
              updatedNumericColumns[selectIndex] = e.target.value as string;
            } 
            else {
              updatedNumericColumns.push(e.target.value as string);
            }
          }

          // Update the chart with the new array of numeric columns
          await updateSelectedChart("NumericColumns", updatedNumericColumns);
          setIsDropdownChange(true);

        } 
        else if (property ==="RowsSelected"){
          let updatedRowsSelected;
          if (!selectedChart.RowsSelected || selectedChart.RowsSelected.length === 0) {
            // If RowsSelected is empty, initialize it with the selected value
            updatedRowsSelected = [Number(e.target.value)];
          } 
          else {
            // If RowsSelected has existing values, update or append based on selectIndex
            updatedRowsSelected = [...selectedChart.RowsSelected];
      
            // Replace value if updatedRowsSelected[selectIndex] already has a value.
            if (updatedRowsSelected[selectIndex] !== undefined) {
              updatedRowsSelected[selectIndex] = Number(e.target.value);
            } 
            else {
              updatedRowsSelected.push(Number(e.target.value));
            }
          }

          // Update the chart with the new array of numeric columns
          await updateSelectedChart("RowsSelected", updatedRowsSelected);
          setIsDropdownChange(true);

        }
        
      }
    }
    // Handle RadialBar
    else if (property === "RadialColumn"){
      if (selectedChart){
        // Update the chart with the new array of numeric columns
        await updateSelectedChart("RadialColumn", e.target.value);
        console.log("Printing UpdatedRadialColumn!", e.target.value)
        setIsDropdownChange(true);
      }
    }
    // Handle StackedLine Chart
    else if (property === "StackedLineColumns" || property === "LineXAxes"){
      if (property === "LineXAxes"){
        if (selectedChart && typeof selectIndex === "number") {
          let updatedLineXAxes;
          if (!selectedChart.LineXAxes || selectedChart.LineXAxes.length === 0) {
            // If LineXAxes is empty, initialize it with the selected value
            updatedLineXAxes = [Number(e.target.value)];
          } 
          else {
            // If LineXAxes has existing values, update or append based on selectIndex
            updatedLineXAxes = [...selectedChart.LineXAxes];
      
            // Replace value if updatedLineXAxes[selectIndex] already has a value.
            if (updatedLineXAxes[selectIndex] !== undefined) {
              updatedLineXAxes[selectIndex] = Number(e.target.value);
            } 
            else {
              updatedLineXAxes.push(Number(e.target.value));
            }
          }
          // Update the chart with the new array of line axes
          await updateSelectedChart("LineXAxes", updatedLineXAxes);
          setIsDropdownChange(true);
        }
      }
      else if (property === "StackedLineColumns"){
        if (selectedChart && typeof selectIndex === "number"){
          let updatedStackedLineColumns;
          if (!selectedChart.StackedLineColumns || selectedChart.StackedLineColumns.length === 0) {
            // If StackedLineColumns is empty, initialize it with the selected value
            updatedStackedLineColumns = [e.target.value];
          } 
          else {
            // If StackedLineColumns has existing values, update or append based on selectIndex
            updatedStackedLineColumns = [...selectedChart.StackedLineColumns];
      
            // Replace value if updatedStackedLineColumns[selectIndex] already has a value.
            if (updatedStackedLineColumns[selectIndex] !== undefined) {
              updatedStackedLineColumns[selectIndex] = e.target.value as string;
            } 
            else {
              updatedStackedLineColumns.push(e.target.value as string);
            }
          }

          // Update the chart with the new array of numeric columns
          await updateSelectedChart("StackedLineColumns", updatedStackedLineColumns);
          setIsDropdownChange(true);
        }
      }
    }
    // Handle Positive Negative Bar Chart
    else if (property === "PNBColumns" || property ==="PNBLineXAxes"){
      if (property === "PNBLineXAxes"){
        if (selectedChart && typeof selectIndex === "number") {
          let updatedPNBLineXAxes;
          if (!selectedChart.PNBLineXAxes || selectedChart.PNBLineXAxes.length === 0) {
            // If LineXAxes is empty, initialize it with the selected value
            updatedPNBLineXAxes = [Number(e.target.value)];
          } 
          else {
            // If LineXAxes has existing values, update or append based on selectIndex
            updatedPNBLineXAxes = [...selectedChart.PNBLineXAxes];
      
            // Replace value if updatedLineXAxes[selectIndex] already has a value.
            if (updatedPNBLineXAxes[selectIndex] !== undefined) {
              updatedPNBLineXAxes[selectIndex] = Number(e.target.value);
            } 
            else {
              updatedPNBLineXAxes.push(Number(e.target.value));
            }
          }
          // Update the chart with the new array of line axes
          await updateSelectedChart("PNBLineXAxes", updatedPNBLineXAxes);
          setIsDropdownChange(true);
        }
      }
      else if (property === "PNBColumns"){
        if (selectedChart && typeof selectIndex === "number"){
          let updatedPNBColumns;
          if (!selectedChart.PNBColumns || selectedChart.PNBColumns.length === 0) {
            // If PNBColumns is empty, initialize it with the selected value
            updatedPNBColumns = [e.target.value];
          } 
          else {
            // If PNBColumns has existing values, update or append based on selectIndex
            updatedPNBColumns = [...selectedChart.PNBColumns];
      
            // Replace value if updatedPNBColumns[selectIndex] already has a value.
            if (updatedPNBColumns[selectIndex] !== undefined) {
              updatedPNBColumns[selectIndex] = e.target.value as string;
            } 
            else {
              updatedPNBColumns.push(e.target.value as string);
            }
          }
          // Update the chart with the new array of numeric columns
          await updateSelectedChart("PNBColumns", updatedPNBColumns);
          setIsDropdownChange(true);
        }
      }
    }
  }

  const previousDataRef = useRef<ScatterDataPoint[]>([]); // Ref to hold previous data without causing re-renders
  useEffect(() => {
    if (selectedChart) {
      // Handle data update depending on data type of selectedChart.
      if ((selectedChart.yAxis || selectedChart.xAxis) && (isScatterData(selectedChart.data) || (!selectedChart.data || selectedChart.data.length === 0))) {
        // Step 1: Set previousData before running update, because we'll use this in determining the values in case of x only updated or y only updated.
        if(selectedChart.data){
          previousDataRef.current = selectedChart.data as ScatterDataPoint[]; // Temporarily store previous data in ref
        }

        // Step 2: Calculate updatedData based on previousData and passed xFields or yFields
        const updatedData = createChartData(menuItemsData, selectedChart, {
          xField: selectedChart.xAxis ? selectedChart.xAxis : undefined,
          yField: selectedChart.yAxis ? selectedChart.yAxis : undefined,
        }, previousDataRef.current); // Use ref value for previous data

        // Step 3: Update chart data
        updateSelectedChart('data', updatedData);

        // Reset the flag after processing the update
        setIsDropdownChange(false);
      }
      else if (isRadarData(selectedChart.data)){
        // Possible to update headers with no rows selected, but no update other way around.
        if (selectedChart.NumericColumns){
        // Step 1: Calculate updatedData based on passed dataset, the selected passed RadarColumns, and the column specific data of selected rows.
         const updatedData = createChartData(menuItemsData, selectedChart, {
          RadarColumns: selectedChart.NumericColumns, RowsSelected: selectedChart.RowsSelected
        }, previousDataRef.current)
        // Step 2: Update chart data
        updateSelectedChart('data', updatedData);
        }
        
        // Reset the flag after processing the update
        setIsDropdownChange(false);
      }
      else if (isStackedLineData(selectedChart.data)){
        // Possible to update chart with no rows selected (StackedLineColumn only value), and possible to update chart if both StackedLineColumn and LineXAxes are defined.
        if (selectedChart.StackedLineColumns || (selectedChart.StackedLineColumns && selectedChart.LineXAxes)){
          // Step 1: Calculate updatedData based on passed dataset, the selected passed StackedLineColumn, and the column specific data of selected rows.
           const updatedData = createChartData(menuItemsData, selectedChart, {
            StackedLineColumns: selectedChart.StackedLineColumns, LineXAxes: selectedChart.LineXAxes
          }, previousDataRef.current)
          // Step 2: Update chart data
          console.log("UPDATED DATA STACKED", updatedData);
          updateSelectedChart('data', updatedData);
        }
        // Reset the flag after processing the update
        setIsDropdownChange(false);
      }
      else if (isRadialBarData(selectedChart.data)){
        if (selectedChart.RadialColumn) {
          // Step 1: Calculate updatedData based on passed dataset, and the selected passed RadialColumn.
          Promise.resolve(createChartData(menuItemsData, selectedChart, {
            RadialColumn: selectedChart.RadialColumn
          }, previousDataRef.current))
            .then(updatedData => {
              // Step 2: Update chart data
              updateSelectedChart('data', updatedData);  // Assuming this is a function to update the chart
            })
            .catch(error => {
              console.error('Error updating chart data:', error);
            });
          // Reset the flag after processing the update
          setIsDropdownChange(false);
        }
      }
      else if (isPositiveNegativeBarData(selectedChart.data)){
         // Possible to update chart with no rows selected (PNBColumn only value), and possible to update chart if both PNBColumn and PNBLineXAxes are defined.
         if (selectedChart.PNBColumns || (selectedChart.PNBColumns && selectedChart.PNBLineXAxes)){
          // Step 1: Calculate updatedData based on passed dataset, the selected passed PNBColumn, and the column specific data of selected rows.
           const updatedData = createChartData(menuItemsData, selectedChart, {
            PNBColumns: selectedChart.PNBColumns, PNBLineXAxes: selectedChart.PNBLineXAxes
          }, previousDataRef.current)
          // Step 2: Update chart data
          console.log("UPDATED DATA PNB", updatedData);
          updateSelectedChart('data', updatedData);
        }
        // Reset the flag after processing the update
        setIsDropdownChange(false);
      }
    }
  }, [isDropdownChange]); // Run when Dropdown values change

// Generate AI Remarks
const sendChartData = async () => {
  // Extract the charts for the current page
  const currentPage = pages[currentPageIndex]; // Access the current page using currentPageIndex
  if (!currentPage || !currentPage.charts) {
    console.error('No charts found on the current page.');
    return;
  }

  const chart_array_on_page = currentPage.charts.map(chart => ({
    data: chart.data,
    type: chart.type,
    title: chart.title,
  }));

  console.log("Printing Chart Array On Page", chart_array_on_page)

  try {
    const response = await fetch("https://miyukiin.pythonanywhere.com/api/report/generate-ai-remarks/", {
      method: 'POST',
      headers: {
        'X-CSRFToken': await fetchCsrfToken(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chart_array_on_page, menuItemsData}),
    });

    const aiRemarks = await response.json();
    handleRemarkChange(aiRemarks.remarks);
  } catch (error) {
    console.error('Error sending chart data:', error);
  }
};

  // Dynamic Radar Select
  // Add a new Select when a column is selected
  const renderSelect = (index: number, chart: Chart) => (
    <FormControl fullWidth size="small" sx={{ mt: 1 }} key={index}>
      <Select
        labelId={`select-label-${index}`}
        value={(chart.NumericColumns || [])[index] || ""}
        onChange={(e) => handleChange(e, "NumericColumns", index)}
        displayEmpty
        sx={{
          bgcolor: "#f8f9fa",
          border: "1px solid #adb5bd",
          borderRadius: "4px",
          "& .MuiSelect-select": {
            padding: "6px 8px",
            fontSize: "0.75rem",
          },
        }}
      >
        <MenuItem value="">
          <em>Select a Numerical Column</em>
        </MenuItem>
        {Object.keys(menuItemsData).map((key) =>
          // Check if the values in the menuItemsData[key] array are numeric
          menuItemsData[key].every((item) => typeof item === 'number') ? (
            <MenuItem key={key} value={key}>
              {key}
            </MenuItem>
          ) : null
        )}
      </Select>
    </FormControl>
  );

  // Function to render chart-specific fields based on chart type
  const renderChartSpecificFields = (chart: Chart) => {
    switch (chart.type) {
      case "Scatter":
        return (
          <>
            {/* X-Axis Input */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                X-axis (Numeric)
              </Typography>
              <Select
                fullWidth
                displayEmpty
                value={chart.xAxis || "DefaultScatter"}
                onChange={(e) => handleChange(e, "xAxis")}
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
                <MenuItem value="DefaultScatter">
                  <em>Select X-axis field</em>
                </MenuItem>
                {Object.keys(menuItemsData).map((key) =>
                  // Check if the values in the menuItemsData[key] array are numeric
                  menuItemsData[key].every((item) => typeof item === 'number') ? (
                    <MenuItem key={key} value={key}>
                      {key}
                    </MenuItem>
                  ) : null
                )}
              </Select>
            </Box>
            {/* Y-Axis Input*/}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Y-axis (Numeric)
              </Typography>
              <Select
                fullWidth
                displayEmpty
                value={chart.yAxis || "DefaultScatter"}
                onChange={(e) => handleChange(e, "yAxis")}
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
                <MenuItem value="DefaultScatter">
                  <em>Select Y-axis field</em>
                </MenuItem>

                {Object.keys(menuItemsData).map((key) =>
                  // Check if the values in the menuItemsData[key] array are numeric
                  menuItemsData[key].every((item) => typeof item === 'number') ? (
                    <MenuItem key={key} value={key}>
                      {key}
                    </MenuItem>
                  ) : null
                )}
              </Select>
            </Box>
          </>
        );
      case "Radar":
        return (
          <>
            {/* Numeric Column Input*/}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Select Numeric Columns
              </Typography>

              {/* 
              // Initial Logic for Dynamic Rendering of Select Boxes.
              {renderSelect(0, chart)} // Render the first select
              {(selectedChart?.NumericColumns ?? []).map((_, index) => 
                index > 0 && renderSelect(index, chart) // Render additional selects only when the previous one is populated
              )}
              */}

              {/*This should be dynamic, changing depending on if previous select is populated, not hardcoded as 3 selects */}
              <Select
                fullWidth
                displayEmpty
                value={chart.NumericColumns ? chart.NumericColumns[0] || "" : ""}
                onChange={(e) => handleChange(e, "NumericColumns", 0)}
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
                  <em>Select Numeric Column</em>
                </MenuItem>
                {Object.keys(menuItemsData).map((key) =>
                // Check if the values in the menuItemsData[key] array are numeric
                  menuItemsData[key].every((item) => typeof item === 'number') ? (
                    <MenuItem key={key} value={key}>
                      {key}
                    </MenuItem>
                  ) : null
                )}
              </Select>

              <Select
                fullWidth
                displayEmpty
                value={chart.NumericColumns ? chart.NumericColumns[1] || "" : ""}
                onChange={(e) => handleChange(e, "NumericColumns", 1)}
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
                  <em>Select Numeric Column</em>
                </MenuItem>
                {Object.keys(menuItemsData).map((key) =>
                // Check if the values in the menuItemsData[key] array are numeric
                menuItemsData[key].every((item) => typeof item === 'number') ? (
                  <MenuItem key={key} value={key}>
                    {key}
                  </MenuItem>
                ) : null
              )}
              </Select>
              <Select
                fullWidth
                displayEmpty
                value={chart.NumericColumns ? chart.NumericColumns[2] || "" : ""}
                onChange={(e) => handleChange(e, "NumericColumns", 2)}
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
                  <em>Select Numeric Column</em>
                </MenuItem>
                {Object.keys(menuItemsData).map((key) =>
                // Check if the values in the menuItemsData[key] array are numeric
                menuItemsData[key].every((item) => typeof item === 'number') ? (
                  <MenuItem key={key} value={key}>
                    {key}
                  </MenuItem>
                ) : null
              )}
              </Select>
            </Box>

            {/* Row Input 1 & 2 */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Value
              </Typography>
              {/*This should be dynamic, changing depending on if previous select is populated, not hardcoded as 2 selects. 
              Further, they should not be selects in the first place. But rather modal of table where user can select rows*/}
              <Select
                fullWidth
                displayEmpty
                value={chart.RowsSelected?.[0] ?? ""} 
                onChange={(e) => handleChange(e, "RowsSelected", 0)}
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
                  <em>Select a Row</em>
                </MenuItem>

                {menuItemsData[Object.keys(menuItemsData)[0]]?.map((_, index) => (
                  <MenuItem key={`Row ${index + 1}`} value={index}>
                    Row {index + 1}
                  </MenuItem>
                  ))
                }
              </Select>

              <Select
                fullWidth
                displayEmpty
                value={chart.RowsSelected?.[1] ?? ""} 
                onChange={(e) => handleChange(e, "RowsSelected", 1)}
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
                  <em>Select a Row</em>
                </MenuItem>

                {menuItemsData[Object.keys(menuItemsData)[0]]?.map((_, index) => (
                  <MenuItem key={`Row ${index + 1}`} value={index}>
                    Row {index + 1}
                  </MenuItem>
                  ))
                }
              </Select>

            </Box>
          </>
        );
      case "RadialBar":
        return (
          <>
            {/* Name Input*/}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Select Columns
              </Typography>
              {/* 5 Hard Coded Select Fields for Columns */}
              <Select
                fullWidth
                displayEmpty
                value={chart.RadialColumn ? chart.RadialColumn || "" : ""}
                onChange={(e) => handleChange(e, "RadialColumn")}
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
                  <em>Select a Column</em>
                </MenuItem>
                {Object.keys(menuItemsData).map((key) =>
                  key ? (
                    <MenuItem key={key} value={key}>
                      {key}
                    </MenuItem>
                  ) : null
                )}
              </Select>         
            </Box>
          </>
        );
      case "PositiveNegativeBar":
        return (
          <>
            {/* Numeric Column for Positive Negative Bar Chart's Values */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Numeric Column 1
              </Typography>
              <Select
                fullWidth
                displayEmpty
                value={chart.PNBColumns ? chart.PNBColumns [0] || "" : ""}
                onChange={(e) => handleChange(e, "PNBColumns", 0)}
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
                  <em>Select a Numeric Column</em>
                </MenuItem>
                {Object.keys(menuItemsData).map((key) =>
                // Check if the values in the menuItemsData[key] array are numeric
                  menuItemsData[key].every((item) => typeof item === 'number') ? (
                    <MenuItem key={key} value={key}>
                      {key}
                    </MenuItem>
                  ) : null
                )}
              </Select>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Numeric Column 2
              </Typography>
              <Select
                fullWidth
                displayEmpty
                value={chart.PNBColumns ? chart.PNBColumns [1] || "" : ""}
                onChange={(e) => handleChange(e, "PNBColumns", 1)}
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
                  <em>Select a Numeric Column</em>
                </MenuItem>
                {Object.keys(menuItemsData).map((key) =>
                // Check if the values in the menuItemsData[key] array are numeric
                  menuItemsData[key].every((item) => typeof item === 'number') ? (
                    <MenuItem key={key} value={key}>
                      {key}
                    </MenuItem>
                  ) : null
                )}
              </Select>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Numeric Column 3
              </Typography>
              <Select
                fullWidth
                displayEmpty
                value={chart.PNBColumns ? chart.PNBColumns[2] || "" : ""}
                onChange={(e) => handleChange(e, "PNBColumns", 2)}
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
                  <em>Select a Numeric Column</em>
                </MenuItem>
                {Object.keys(menuItemsData).map((key) =>
                // Check if the values in the menuItemsData[key] array are numeric
                  menuItemsData[key].every((item) => typeof item === 'number') ? (
                    <MenuItem key={key} value={key}>
                      {key}
                    </MenuItem>
                  ) : null
                )}
              </Select>
            </Box>

            {/* Line Input 1*/}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Data Point 1
              </Typography>

              {/* Hardcoded as Five Possible Lines */}
              <Select
                fullWidth
                displayEmpty
                value={chart.PNBLineXAxes?.[0] ?? ""} 
                onChange={(e) => handleChange(e, "PNBLineXAxes", 1)}
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
                {menuItemsData[Object.keys(menuItemsData)[0]]?.map((_, index) => (
                  <MenuItem key={`Row ${index + 1}`} value={index}>
                    Row {index + 1}
                  </MenuItem>
                  ))
                }
              </Select>
            </Box>
              {/* Line Input 2*/}
              <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Data Point 2
              </Typography>
              {/* Hardcoded as Five Possible Lines */}
              <Select
                fullWidth
                displayEmpty
                value={chart.PNBLineXAxes?.[1] ?? ""} 
                onChange={(e) => handleChange(e, "PNBLineXAxes", 1)}
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
                {menuItemsData[Object.keys(menuItemsData)[0]]?.map((_, index) => (
                  <MenuItem key={`Row ${index + 1}`} value={index}>
                    Row {index + 1}
                  </MenuItem>
                  ))
                }
              </Select>
            </Box>
            {/* Line Input 3*/}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Data Point 3
              </Typography>

              {/* Hardcoded as Five Possible Lines */}
              <Select
                fullWidth
                displayEmpty
                value={chart.PNBLineXAxes?.[2] ?? ""} 
                onChange={(e) => handleChange(e, "PNBLineXAxes", 2)}
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
                {menuItemsData[Object.keys(menuItemsData)[0]]?.map((_, index) => (
                  <MenuItem key={`Row ${index + 1}`} value={index}>
                    Row {index + 1}
                  </MenuItem>
                  ))
                }
              </Select>
            </Box>
            {/* Line Input 4 */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Data Point 4
              </Typography>

              {/* Hardcoded as Five Possible Lines */}
              <Select
                fullWidth
                displayEmpty
                value={chart.PNBLineXAxes?.[3] ?? ""} 
                onChange={(e) => handleChange(e, "PNBLineXAxes", 3)}
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
                {menuItemsData[Object.keys(menuItemsData)[0]]?.map((_, index) => (
                  <MenuItem key={`Row ${index + 1}`} value={index}>
                    Row {index + 1}
                  </MenuItem>
                  ))
                }
              </Select>
            </Box>
            {/* Line Input 5*/}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Data Point 5
              </Typography>

              {/* Hardcoded as Five Possible Lines */}
              <Select
                fullWidth
                displayEmpty
                value={chart.PNBLineXAxes?.[4] ?? ""} 
                onChange={(e) => handleChange(e, "PNBLineXAxes", 4)}
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
                {menuItemsData[Object.keys(menuItemsData)[0]]?.map((_, index) => (
                  <MenuItem key={`Row ${index + 1}`} value={index}>
                    Row {index + 1}
                  </MenuItem>
                  ))
                }
              </Select>
            </Box>                
          </>
        );
      case "StackedLine":
        return (
          <>
            {/* Numeric Column for Stacked Line Chart's Values */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Numeric Column 1
              </Typography>
              <Select
                fullWidth
                displayEmpty
                value={chart.StackedLineColumns ? chart.StackedLineColumns [0] || "" : ""}
                onChange={(e) => handleChange(e, "StackedLineColumns", 0)}
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
                  <em>Select a Numeric Column</em>
                </MenuItem>
                {Object.keys(menuItemsData).map((key) =>
                // Check if the values in the menuItemsData[key] array are numeric
                  menuItemsData[key].every((item) => typeof item === 'number') ? (
                    <MenuItem key={key} value={key}>
                      {key}
                    </MenuItem>
                  ) : null
                )}
              </Select>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Numeric Column 2
              </Typography>
              <Select
                fullWidth
                displayEmpty
                value={chart.StackedLineColumns ? chart.StackedLineColumns [1] || "" : ""}
                onChange={(e) => handleChange(e, "StackedLineColumns", 1)}
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
                  <em>Select a Numeric Column</em>
                </MenuItem>
                {Object.keys(menuItemsData).map((key) =>
                // Check if the values in the menuItemsData[key] array are numeric
                  menuItemsData[key].every((item) => typeof item === 'number') ? (
                    <MenuItem key={key} value={key}>
                      {key}
                    </MenuItem>
                  ) : null
                )}
              </Select>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Numeric Column 3
              </Typography>
              <Select
                fullWidth
                displayEmpty
                value={chart.StackedLineColumns ? chart.StackedLineColumns [2] || "" : ""}
                onChange={(e) => handleChange(e, "StackedLineColumns", 2)}
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
                  <em>Select a Numeric Column</em>
                </MenuItem>
                {Object.keys(menuItemsData).map((key) =>
                // Check if the values in the menuItemsData[key] array are numeric
                  menuItemsData[key].every((item) => typeof item === 'number') ? (
                    <MenuItem key={key} value={key}>
                      {key}
                    </MenuItem>
                  ) : null
                )}
              </Select>
            </Box>

            {/* Line Input 1*/}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Data Point 1
              </Typography>

              {/* Hardcoded as Five Possible Lines */}
              <Select
                fullWidth
                displayEmpty
                value={chart.LineXAxes?.[0] ?? ""} 
                onChange={(e) => handleChange(e, "LineXAxes", 1)}
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
                {menuItemsData[Object.keys(menuItemsData)[0]]?.map((_, index) => (
                  <MenuItem key={`Row ${index + 1}`} value={index}>
                    Row {index + 1}
                  </MenuItem>
                  ))
                }
              </Select>
            </Box>
              {/* Line Input 2*/}
              <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Data Point 2
              </Typography>
              {/* Hardcoded as Five Possible Lines */}
              <Select
                fullWidth
                displayEmpty
                value={chart.LineXAxes?.[1] ?? ""} 
                onChange={(e) => handleChange(e, "LineXAxes", 1)}
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
                {menuItemsData[Object.keys(menuItemsData)[0]]?.map((_, index) => (
                  <MenuItem key={`Row ${index + 1}`} value={index}>
                    Row {index + 1}
                  </MenuItem>
                  ))
                }
              </Select>
            </Box>
            {/* Line Input 3*/}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Data Point 3
              </Typography>

              {/* Hardcoded as Five Possible Lines */}
              <Select
                fullWidth
                displayEmpty
                value={chart.LineXAxes?.[2] ?? ""} 
                onChange={(e) => handleChange(e, "LineXAxes", 2)}
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
                {menuItemsData[Object.keys(menuItemsData)[0]]?.map((_, index) => (
                  <MenuItem key={`Row ${index + 1}`} value={index}>
                    Row {index + 1}
                  </MenuItem>
                  ))
                }
              </Select>
            </Box>
            {/* Line Input 4 */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Data Point 4
              </Typography>

              {/* Hardcoded as Five Possible Lines */}
              <Select
                fullWidth
                displayEmpty
                value={chart.LineXAxes?.[3] ?? ""} 
                onChange={(e) => handleChange(e, "LineXAxes", 3)}
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
                {menuItemsData[Object.keys(menuItemsData)[0]]?.map((_, index) => (
                  <MenuItem key={`Row ${index + 1}`} value={index}>
                    Row {index + 1}
                  </MenuItem>
                  ))
                }
              </Select>
            </Box>
            {/* Line Input 5*/}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold">
                Data Point 5
              </Typography>

              {/* Hardcoded as Five Possible Lines */}
              <Select
                fullWidth
                displayEmpty
                value={chart.LineXAxes?.[4] ?? ""} 
                onChange={(e) => handleChange(e, "LineXAxes", 4)}
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
                {menuItemsData[Object.keys(menuItemsData)[0]]?.map((_, index) => (
                  <MenuItem key={`Row ${index + 1}`} value={index}>
                    Row {index + 1}
                  </MenuItem>
                  ))
                }
              </Select>
            </Box>                
          </>
        );
    
      default:
        return (
          <Typography variant="caption" align="center" sx={{ mt: 2 }}>
            No customization available for this chart type.
          </Typography>
        );
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
        height: "200%",
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
                title={item.displayName}
                aria-label={`Add ${item.displayName} Chart`}
              >
                {item.icon}
              </IconButton>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {item.displayName}
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
          {/* Render chart-specific fields */}
          {renderChartSpecificFields(selectedChart)}
        </>
      ) : (
        <Typography variant="caption" align="center" sx={{ mt: 2 }}>
          Select a chart to edit its values.
        </Typography>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: isSmallScreen ? "300vh" : "200vh",
        display: "flex",
        bgcolor: "#ECECEC",
      }}
>      {/* Left Sidebar */}
      {!isSmallScreen ? (
        <Paper
          sx={{
            height: "200vh",
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
                    aria-label={`Add ${item.displayName} Chart`}
                  >
                    {item.icon}
                  </IconButton>
                  {/* Display the chart name next to the icon */}
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {item.displayName}
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
              {/* Render chart-specific fields */}
              {renderChartSpecificFields(selectedChart)}
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
          generateRemarks={sendChartData} // Pass the generateRemarks function
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
                paddingBottom: isSmallScreen ? "670px" : "500px" , // Space for remarks
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
        </Box>
      )}
    </Box>
  );
};

export default ReportLayout;