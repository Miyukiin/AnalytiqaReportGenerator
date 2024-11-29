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

const ReportPage: React.FC = () => {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "#ffffff" }}>
      {/* Left Sidebar */}
      <Paper
        sx={{
          width: 220,
          display: "flex",
          flexDirection: "column",
          p: 3, // Increased padding
          borderRight: "1px solid #ccc",
          bgcolor: "#ffffff",
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          VIZULIZATIONS
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { icon: <ScatterPlotIcon />, label: "Scatter" },
            { icon: <BarChartIcon />, label: "Histogram" },
            { icon: <RadarIcon />, label: "Radar" },
            { icon: <ShowChartIcon />, label: "Stacked Line" },
            { icon: <WaterfallChartIcon />, label: "Waterfall" },
          ].map((item, index) => (
            <Grid item xs={4} key={index}>
              <IconButton
                sx={{
                  width: "100%",
                  height: 50,
                  bgcolor: "#e9ecef",
                  border: "1px solid #adb5bd",
                  borderRadius: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {item.icon}
              </IconButton>
            </Grid>
          ))}
        </Grid>
        <Typography variant="body1" fontWeight="bold">
          Values
        </Typography>
        {/* Title Field */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" fontWeight="bold">
            Title
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter title here"
            size="small"
            sx={{
              mt: 1,
              bgcolor: "#f8f9fa",
              borderRadius: 1,
            }}
          />
        </Box>
        {/* Y-axis Field */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" fontWeight="bold">
            Y-axis
          </Typography>
          <Select
            fullWidth
            displayEmpty
            sx={{
              mt: 1,
              bgcolor: "#f8f9fa",
              border: "1px solid #adb5bd",
              borderRadius: "4px",
            }}
            defaultValue=""
            size="small"
          >
            <MenuItem value="">Add data fields here</MenuItem>
          </Select>
        </Box>
        {/* X-axis Field */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" fontWeight="bold">
            X-axis
          </Typography>
          <Select
            fullWidth
            displayEmpty
            sx={{
              mt: 1,
              bgcolor: "#f8f9fa",
              border: "1px solid #adb5bd",
              borderRadius: "4px",
            }}
            defaultValue=""
            size="small"
          >
            <MenuItem value="">Add data fields here</MenuItem>
          </Select>
        </Box>
      </Paper>

      {/* Visualization Area */}
      <Box sx={{ flex: 1, p: 3, bgcolor: "#ffffff" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Build Visuals
          </Typography>
          <Button variant="contained" color="primary">
            + Export
          </Button>
        </Box>
        <Box
          sx={{
            height: "75vh",
            bgcolor: "#ffffff", // White background
            border: "2px dashed #adb5bd",
            borderRadius: 1,
          }}
        ></Box>
      </Box>

      {/* Right Sidebar */}
      <Paper
        sx={{
          width: 220,
          display: "flex",
          flexDirection: "column",
          p: 3, // Increased padding
          borderLeft: "1px solid #ccc",
          bgcolor: "#ffffff",
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          DATA PANEL
        </Typography>
        <TextField
          fullWidth
          placeholder="Search..."
          size="small"
          sx={{
            mb: 3,
            bgcolor: "#f8f9fa",
            borderRadius: 1,
          }}
        />
        <List dense>
          {[
            "Car Sale",
            "Retained Header (Car ...)",
            "Table1",
            "Table3",
            "Table4",
            "Table5",
            "Table6",
          ].map((table) => (
            <ListItem key={table} disablePadding>
              <ListItemIcon>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    bgcolor: "#4caf50",
                    borderRadius: "50%",
                  }}
                />
              </ListItemIcon>
              <ListItemText primary={table} />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body1" fontWeight="bold">
          Filter
        </Typography>
        <Box
          sx={{
            mt: 2,
            p: 3, // Increased padding inside the filter box
            bgcolor: "#f8f9fa",
            border: "1px solid #adb5bd",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2">Fuels</Typography>
          <Typography variant="body2" color="textSecondary">
            is (All)
          </Typography>
          <Button size="small" sx={{ mt: 1 }}>
            Add filter
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ReportPage;
