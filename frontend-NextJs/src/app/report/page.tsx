"use client";

import React from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import BarChartIcon from "@mui/icons-material/BarChart";
import RadarIcon from "@mui/icons-material/Radar";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import WaterfallChartIcon from "@mui/icons-material/WaterfallChart";
import TableChartIcon from "@mui/icons-material/TableChart";
import GetAppIcon from "@mui/icons-material/GetApp"; // Export Icon
import AddIcon from "@mui/icons-material/Add"; // Add Icon for Pagination
import DescriptionIcon from "@mui/icons-material/Description"; // Page Icon

const icons = [
  { icon: <ScatterPlotIcon />, label: "Scatter" },
  { icon: <BarChartIcon />, label: "Histogram" },
  { icon: <RadarIcon />, label: "Radar" },
  { icon: <ShowChartIcon />, label: "Stacked Line" },
  { icon: <WaterfallChartIcon />, label: "Waterfall" },
];

const tables = [
  "Car Sale",
  "Retained Header (Car ...)",
  "Table1",
  "Table3",
  "Table4",
  "Table5",
  "Table6",
];

// Reusable Divider component
const FullWidthDivider = () => (
  <Divider
    sx={{
      width: "calc(100% + 32px)",
      ml: -2,
      mr: -2,
      my: 1.5,
    }}
  />
);

const ReportLayout = () => {
  const [remark, setRemark] = React.useState(
    "This is an auto-generated remark. You can edit this section manually."
  );

  return (
    <>
      <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "#ffffff" }}>
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
            VIZULIZATIONS
          </Typography>
          <FullWidthDivider />
          <Grid container spacing={1} sx={{ mb: 2 }}>
            {icons.map((item, index) => (
              <Grid item xs={4} key={index}>
                <IconButton
                  sx={{
                    width: "100%",
                    height: 40,
                    bgcolor: "#e9ecef",
                    border: "1px solid #adb5bd",
                    borderRadius: 1,
                  }}
                >
                  {item.icon}
                </IconButton>
              </Grid>
            ))}
          </Grid>
          <FullWidthDivider />
          <Typography
            variant="h6"
            fontWeight="bold"
            align="center"
            sx={{ textTransform: "uppercase", mb: 0 }}
          >
            VALUES
          </Typography>
          <FullWidthDivider />
          {["Title", "Y-axis", "X-axis"].map((field) => (
            <Box sx={{ mb: 1 }} key={field}>
              <Typography variant="caption" fontWeight="bold">
                {field}
              </Typography>
              {field === "Title" ? (
                <TextField
                  fullWidth
                  placeholder={`Enter ${field.toLowerCase()} here`}
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
                />
              ) : (
                <Select
                  fullWidth
                  displayEmpty
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
                  defaultValue=""
                  size="small"
                >
                  <MenuItem value="">
                    <em>Add data fields here</em>
                  </MenuItem>
                </Select>
              )}
            </Box>
          ))}
        </Paper>

        {/* Visualization Area */}
        <Box sx={{ flex: 1, p: 2, bgcolor: "#ECECEC" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              BUILD VISUALS
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<GetAppIcon />} // Added Export Icon
            >
              Export
            </Button>
          </Box>
          <FullWidthDivider />
          <Box
            sx={{
              height: "80vh", // Increased height from 70vh to 80vh
              bgcolor: "#ffffff",
              border: "2px dashed #adb5bd",
              borderRadius: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden", // Ensure content doesn't overflow
            }}
          >
            {/* Visualization Placeholder */}
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
              }}
            >
              {/* Add your visualization components here */}
            </Box>

            {/* Remarks Section at the Bottom */}
            <Box
              sx={{
                p: 0.5, // Reduced padding for compactness
                borderTop: "1px solid #adb5bd",
                bgcolor: "#f8f9fa",
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                Remarks
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={1} // Reduced number of rows for compactness
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Add your chart remarks here..."
                sx={{
                  bgcolor: "#ffffff",
                  borderRadius: 1,
                  fontSize: "0.65rem", // Reduced font size
                  "& .MuiInputBase-input": {
                    padding: "4px 6px", // Reduced padding
                  },
                }}
              />
            </Box>
          </Box>
          {/* Pagination */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mt: 3,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<DescriptionIcon />} // Added Page Icon
              sx={{
                mx: 0.5,
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "0.75rem", // Reduced font size
                px: 1, // Reduced horizontal padding
                py: 0.5, // Reduced vertical padding
              }}
            >
              Page 1
            </Button>

            <Button
              variant="outlined"
              startIcon={<AddIcon />} // Replaced "+" with Add Icon
              sx={{
                mx: 0.5,
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "0.75rem", // Reduced font size
                px: 1, // Reduced horizontal padding
                py: 0.5, // Reduced vertical padding
                display: "flex",
                alignItems: "center",
              }}
            >
              Add Page
            </Button>
          </Box>
        </Box>

        {/* Right Sidebar */}
        <Paper
          sx={{
            width: 200,
            display: "flex",
            flexDirection: "column",
            p: 2,
            borderLeft: "1px solid #ccc",
            bgcolor: "#ECECEC",
          }}
        >
          <Typography variant="h6" fontWeight="bold" align="center">
            DATA PANEL
          </Typography>
          <FullWidthDivider />
          <TextField
            fullWidth
            placeholder="Search..."
            size="small"
            sx={{
              mb: 2,
              bgcolor: "#f8f9fa",
              borderRadius: 1,
              "& .MuiInputBase-input": {
                padding: "6px 8px",
                fontSize: "0.75rem",
              },
            }}
          />
          <List dense>
            {tables.map((table) => (
              <ListItem key={table} disablePadding>
                <ListItemIcon>
                  <TableChartIcon
                    sx={{
                      color: "rgba(0, 0, 0, 0.6)", // Faint black color
                      fontSize: "1rem", // Adjusted icon size if needed
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={table}
                  sx={{
                    "& .MuiTypography-root": {
                      fontSize: "0.8rem", // Further reduced font size
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
          <FullWidthDivider />
          <Typography
            variant="h6"
            fontWeight="bold"
            align="center"
            sx={{ textTransform: "uppercase", mb: 0 }}
          >
            FILTER
          </Typography>
          <FullWidthDivider />
          <Box
            sx={{
              mt: 1,
              p: 1, // Reduced padding for compactness
              bgcolor: "#f8f9fa",
              border: "1px solid #adb5bd",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
              Fuels
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.65rem" }}>
              is (All)
            </Typography>
            <Button
              size="small"
              sx={{
                mt: 0.5,
                fontSize: "0.65rem",
                padding: "2px 6px",
              }}
            >
              Add filter
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default ReportLayout;
