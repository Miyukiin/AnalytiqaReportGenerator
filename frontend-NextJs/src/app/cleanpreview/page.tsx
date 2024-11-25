// src/app/CleanPreviewPage.tsx

"use client"; // Ensure this is a Client Component

import React from "react";
import { Box, Typography, Paper, Button, IconButton } from "@mui/material";
import ExpandIcon from "@/components/icons/ExpandIcon"; // Adjust the path as needed

export default function CleanPreviewPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "grey.100", // Uses theme's background color
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Main Content */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          paddingX: { xs: 3, sm: 6 },
          paddingY: 4,
        }}
      >
        {/* Original Data Section */}
        <Box sx={{ marginBottom: 6 }}>
          <Typography
            variant="h5"
            align="center"
            sx={{
              fontWeight: "bold",
              color: "grey.800", // Uses theme's grey.800
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Original Data
          </Typography>
          <Paper
            elevation={0} // No shadow
            sx={{
              backgroundColor: "grey.200", // Uses theme's grey.300
              height: 300,
              borderRadius: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            <Typography variant="h6" color="textSecondary">
              📄 CSV
            </Typography>
            <IconButton
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "grey.700", // Uses theme's grey.700
              }}
            >
              <ExpandIcon />
            </IconButton>
          </Paper>
        </Box>

        {/* Cleaned Data Section */}
        <Box sx={{ marginBottom: 6 }}>
          <Typography
            variant="h5"
            align="center"
            sx={{
              fontWeight: "bold",
              color: "grey.800", // Uses theme's grey.800
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Cleaned Data
          </Typography>
          <Paper
            elevation={0} // No shadow
            sx={{
              backgroundColor: "grey.200", // Uses theme's grey.300
              height: 300,
              borderRadius: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            <Typography variant="h6" color="textSecondary">
              📄 CSV
            </Typography>
            <IconButton
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "grey.700", // Uses theme's grey.700
              }}
            >
              <ExpandIcon />
            </IconButton>
          </Paper>
        </Box>

        {/* Summary of Changes Section */}
        <Box sx={{ marginBottom: 6 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "grey.800", // Uses theme's grey.800
              marginBottom: 2,
            }}
          >
            Summary of Changes:
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "grey.700", // Uses theme's grey.700
              marginBottom: 2,
              lineHeight: "1.8",
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "grey.700", // Uses theme's grey.700
              lineHeight: "1.8",
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" }, // Stack vertically on xs, row on sm+
            alignItems: { xs: "flex-start", sm: "center" }, // Left align on xs, center on sm+
            justifyContent: { xs: "flex-start", sm: "flex-end" }, // Start on xs, end on sm+
            gap: 2,
          }}
        >
          <Button
            disableElevation
            variant="contained"
            sx={{
              backgroundColor: "grey.700", // Uses theme's primary.main
              "&:hover": { backgroundColor: "primary.main" }, // Uses theme's primary.dark
              color: "white",
              fontWeight: "bold",
              padding: "10px 20px",
              width: { xs: "100%", sm: "auto" }, // Full width on mobile
            }}
          >
            Save as CSV
          </Button>
          <Button
            disableElevation
            variant="contained"
            sx={{
              backgroundColor: "grey.700", // Uses theme's primary.main
              "&:hover": { backgroundColor: "primary.main" }, // Uses theme's primary.dark
              color: "white",
              fontWeight: "bold",
              padding: "10px 20px",
              width: { xs: "100%", sm: "auto" }, // Full width on mobile
            }}
          >
            Proceed to Report Creation
          </Button>
          <Button
            disableElevation
            variant="outlined"
            sx={{
              borderColor: "grey.800", // Custom border color
              color: "grey.800", // Custom text color
              "&:hover": {
                borderColor: "grey.900", // Custom hover border color
                color: "grey.900", // Custom hover text color
              },
              fontWeight: "bold",
              padding: "10px 20px",
              width: { xs: "100%", sm: "auto" }, // Full width on mobile
            }}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
