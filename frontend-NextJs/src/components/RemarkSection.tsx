import React, { useState } from "react";
import { Box, Typography, TextField, useTheme, useMediaQuery } from "@mui/material";

interface RemarkSectionProps {
  remark: string;
  onChange: (newRemark: string) => void;
}

const RemarkSection: React.FC<RemarkSectionProps> = ({ remark, onChange }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [fontSize, setFontSize] = useState(14); // Default font size
  const [isEditing, setIsEditing] = useState(false);
  const renderRemarkText = (text: string) => {
    if (!text) return null;

    const phrasesToBold = ["For Chart Name", "For Chart Type:"];

    // Create a regex to match the phrases
    const regex = new RegExp(`(${phrasesToBold.join("|")})`, 'g');

    // Split the text by the phrases, keeping the phrases in the result
    const parts = text.split(regex);

    return parts.map((part, index) =>
      phrasesToBold.includes(part) ? (
        <strong key={index}>{part}</strong>
      ) : (
        <React.Fragment key={index}>{part}</React.Fragment>
      )
    );
  };

  // Function to dynamically resize text if it exceeds the container
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    const maxLength = isSmallScreen ? 300 : 650; // Maximum allowed characters for small/large screens
    if (text.length > maxLength && fontSize > 10) {
      setFontSize(fontSize - 1); // Reduce font size
    } else if (text.length <= maxLength && fontSize < 14) {
      setFontSize(14); // Reset font size
    }
    onChange(text);
  };

  const finishEditingPage = () => {
    setIsEditing(false);
  };

  return (
    <Box
      sx={{
        position: "absolute", // Makes the box absolutely positioned
        bottom: 0,
        left: 0,
        right: 0,
        height: isSmallScreen ? "700px" : "530px", // Increased height for full visibility
        borderTop: "1px solid #adb5bd",
        bgcolor: "#f8f9fa",
        p: 2, // Padding for better spacing
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      <Typography
        variant="subtitle2"
        fontWeight="bold"
        sx={{ mb: 1, fontSize: "0.9rem" }}
      >
        Remarks
      </Typography>
      {isEditing ? (
        <TextField
          fullWidth
          multiline
          inputProps={{
            style: {
              fontSize: `${fontSize}px`,
              lineHeight: "1",
              whiteSpace: "pre-wrap", // Preserve whitespace and allow wrapping
              wordBreak: "break-word", // Break long words if necessary
            },
          }}
          rows={isSmallScreen ? 6 : 8} // Adjust rows for export visibility
          value={remark}
          onChange={handleInputChange}
          onBlur={finishEditingPage}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); // Prevent newline on Enter
              finishEditingPage();
            }
          }}
          placeholder="Add your chart remarks here..."
          autoFocus
          sx={{
            bgcolor: "#ffffff",
            borderRadius: 1,
            fontStyle: "italic",
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              borderColor: "#adb5bd",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderWidth: "1px",
            },
          }}
        />
      ) : (
        <Typography
          variant="body2"
          sx={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            cursor: "pointer",
            fontSize: isSmallScreen ? "10px": `11px`,
            lineHeight: "1.05",
            fontStyle: "",
            flexGrow: 1, // Allow the text to take up available space
          }}
          onDoubleClick={() => setIsEditing(true)}
        >
          {renderRemarkText(remark) || "Add your chart remarks here... (Double-click to edit)"}
        </Typography>
      )}
    </Box>
  );
};

export default RemarkSection;
