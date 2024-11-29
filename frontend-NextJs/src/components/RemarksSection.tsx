// components/RemarksSection.tsx

import React from "react";
import { Typography, TextField, Box } from "@mui/material";

interface RemarksSectionProps {
  remark: string;
  setRemark: (remark: string) => void;
}

const RemarksSection: React.FC<RemarksSectionProps> = ({ remark, setRemark }) => {
  return (
    <Box
      sx={{
        p: 0.25, // Reduced padding
        borderTop: "1px solid #adb5bd",
        bgcolor: "#f8f9fa",
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.25, fontSize: '0.7rem' }}>
        Remarks
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={1} // Reduced number of rows
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        placeholder="Add your chart remarks here..."
        sx={{
          bgcolor: "#ffffff",
          borderRadius: 1,
          fontSize: "0.6rem", // Smaller font size
          "& .MuiInputBase-input": {
            padding: "2px 4px", // Smaller padding
          },
        }}
      />
    </Box>
  );
};

export default RemarksSection;
