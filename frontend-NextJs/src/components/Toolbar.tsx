import React from "react";
import { Box, Button, Typography } from "@mui/material";
import {
  PictureAsPdf as PictureAsPdfIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  TipsAndUpdates as TipsAndUpdatesIcon,
} from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

interface ToolbarProps {
  exportPNG: () => void;
  exportPDF: () => void;
  deletePage: () => void;
  isDeleteDisabled: boolean;
  generateRemarks: () => void; // Add prop for Generate Remarks
}

const Toolbar: React.FC<ToolbarProps> = ({
  exportPNG,
  exportPDF,
  deletePage,
  isDeleteDisabled,
  generateRemarks, // Use the new prop
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 2,
        mb: 1,
        flexWrap: "wrap",
        gap: 1,
      }}
    >
      {/* Left Side - BUILD VISUALS */}
      <Typography
        variant={isSmallScreen ? "h6" : "h4"}
        fontWeight="bold"
        style={{ textAlign: "center" }}
      >
        BUILD DATA VISUALIZATION
      </Typography>

      {/* Right Side - Buttons */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          justifyContent: isSmallScreen ? "center" : "flex-end",
          flexWrap: isSmallScreen ? "wrap" : "nowrap",
          width: isSmallScreen ? "100%" : "auto",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<ImageIcon />}
          onClick={exportPNG}
          sx={{ width: isSmallScreen ? "100%" : "135px", mr: isSmallScreen ? 0 : 0.5 }}
        >
          Export PNG
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PictureAsPdfIcon />}
          onClick={exportPDF}
          sx={{ width: isSmallScreen ? "100%" : "135px", mr: isSmallScreen ? 0 : 0.5 }}
        >
          Export PDF
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<TipsAndUpdatesIcon />}
          onClick={generateRemarks}
          sx={{ width: isSmallScreen ? "100%" : "180px", mr: isSmallScreen ? 0 : 0.5 }}
        >
          Generate Remarks
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<CloseIcon />}
          onClick={deletePage}
          disabled={isDeleteDisabled}
          sx={{ width: isSmallScreen ? "100%" : "auto" }}
        >
          Delete Page
        </Button>
      </Box>
    </Box>
  );
};

export default Toolbar;
