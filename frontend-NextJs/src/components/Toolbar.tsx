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
        mb: 1,
        flexWrap: "wrap",
        gap: 1,
      }}
    >
      {/* Left Side - BUILD VISUALS */}
      <Typography variant="h4" fontWeight="bold" style={{ textAlign: 'center' }}>
        BUILD DATA VISUALIZATION
      </Typography>

      {/* Right Side - Export and Delete Buttons */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          justifyContent: "center", // Center the buttons
          flexGrow: 1, // Allow the Box to take available space
        }}
      >
        <>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ImageIcon />}
            onClick={exportPNG}
            sx={{ width: '135px', mr: 0.5 }}
          >
            Export PNG
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdfIcon />}
            onClick={exportPDF}
            sx={{ width: '135px', mr: 0.5 }}
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
      </Box>
    </Box>
  );
};

export default Toolbar;
