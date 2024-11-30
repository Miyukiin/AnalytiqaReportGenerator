// src/components/RightSidebar.tsx

import React, { useState } from "react";
import {
  Typography,
  Paper,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Box,
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import FullWidthDivider from "./FullWidthDivider";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const RightSidebar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const tables: string[] = [
    "Car Sale",
    "Retained Header (Car ...)",
    "Table1",
    "Table3",
    "Table4",
    "Table5",
    "Table6",
  ];

  const filteredTables = tables.filter((table) =>
    table.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Paper
      sx={{
        width: 240,
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
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
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
        {filteredTables.map((table) => (
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
      <Box sx={{ px: 2, mb: 1 }}>
        <Typography variant="h6" fontWeight="bold" align="center" sx={{ mb: 1 }}>
          FILTER
        </Typography>
        <Box
          sx={{
            p: 1,
            bgcolor: "#f8f9fa",
            border: "1px solid #adb5bd",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
            Fuels
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontSize: "0.65rem" }}
          >
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
      </Box>
    </Paper>
  );
};

export default RightSidebar;
