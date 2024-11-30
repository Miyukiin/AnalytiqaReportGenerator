// src/components/Toolbar.tsx

import React from "react";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import {
  PictureAsPdf as PictureAsPdfIcon,
  Image as ImageIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

interface ToolbarProps {
  exportPNG: () => void;
  exportPDF: () => void; // Added exportPDF prop
  deletePage: () => void;
  isDeleteDisabled: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  exportPNG,
  exportPDF,
  deletePage,
  isDeleteDisabled,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between", // Align left and right
        alignItems: "center",
        mt: 2,
        mb: 2,
        flexWrap: "wrap",
        gap: 1,
      }}
    >
      {/* Left Side - BUILD VISUALS */}
      <Typography variant="h6" fontWeight="bold">
        BUILD VISUALS
      </Typography>

      {/* Right Side - Export and Delete Buttons */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {isSmallScreen ? (
          <>
            <Tooltip title="Export PNG">
              <IconButton
                color="primary"
                onClick={exportPNG}
                sx={{
                  bgcolor: "#50727F",
                  color: "#fff",
                  "&:hover": { bgcolor: "#115293" },
                  width: 40, // Increased size
                  height: 40, // Increased size
                }}
              >
                <ImageIcon fontSize="large" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export PDF">
              <IconButton
                color="secondary"
                onClick={exportPDF}
                sx={{
                  bgcolor: "#50727F",
                  color: "#fff",
                  "&:hover": { bgcolor: "#9a0007" },
                  width: 40, // Increased size
                  height: 40, // Increased size
                }}
              >
                <PictureAsPdfIcon fontSize="large" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Page">
              <IconButton
                color="error"
                onClick={deletePage}
                disabled={isDeleteDisabled}
                sx={{
                  bgcolor: isDeleteDisabled ? "#f0f0f0" : "#d32f2f",
                  color: isDeleteDisabled ? "#a0a0a0" : "#fff",
                  "&:hover": {
                    bgcolor: isDeleteDisabled ? "#f0f0f0" : "#9a0007",
                  },
                  width: 40, // Increased size
                  height: 40, // Increased size
                }}
              >
                <CloseIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ImageIcon />}
              onClick={exportPNG}
              sx={{ mr: 1 }}
            >
              Export PNG
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PictureAsPdfIcon />}
              onClick={exportPDF}
              sx={{ mr: 1 }}
            >
              Export PDF
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CloseIcon />}
              onClick={deletePage}
              disabled={isDeleteDisabled}
            >
              Delete Page
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Toolbar;
