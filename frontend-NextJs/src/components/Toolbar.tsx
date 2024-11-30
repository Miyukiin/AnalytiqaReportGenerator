// src/components/report/Toolbar.tsx

import React from "react";
import { Box, Button, Typography } from "@mui/material";
import {
  PictureAsPdf as PictureAsPdfIcon,
  Image as ImageIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

interface ToolbarProps {
  exportPNG: () => void;
  exportPDF: () => void;
  deletePage: () => void;
  isDeleteDisabled: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  exportPNG,
  exportPDF,
  deletePage,
  isDeleteDisabled,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 2,
        mb: 2,
      }}
    >
      {/* Left-aligned text */}
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        BUILD VISUALS
      </Typography>

      {/* Right-aligned buttons */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
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
      </Box>
    </Box>
  );
};

export default Toolbar;
