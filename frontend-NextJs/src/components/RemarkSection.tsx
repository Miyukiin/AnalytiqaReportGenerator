// src/components/RemarkSection.tsx

import React from "react";
import { Box, Typography, TextField } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

interface RemarkSectionProps {
  remark: string;
  onChange: (newRemark: string) => void;
}

const RemarkSection: React.FC<RemarkSectionProps> = ({ remark, onChange }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: isSmallScreen ? "80px" : "100px", // Adjust height based on screen size
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
        rows={isSmallScreen ? 2 : 3} // Adjust number of rows based on screen size
        value={remark}
        onChange={(e) => onChange(e.target.value)}
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
  );
};

export default RemarkSection;
