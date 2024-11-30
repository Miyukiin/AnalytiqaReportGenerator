// src/components/report/ExportablePage.tsx

import React from "react";
import { Box } from "@mui/material";
import MainCanvas from "../MainCanvas";
import RemarkSection from "../RemarkSection";
import { Page } from "../../types";

interface ExportablePageProps {
  page: Page;
}

const ExportablePage: React.FC<ExportablePageProps> = ({ page }) => {
  return (
    <Box
      sx={{
        width: "100%", // Ensures it takes the full width of the container
        height: "100%", // Ensures it takes the full height of the container
        position: "relative",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        p: 2,
        boxSizing: "border-box",
      }}
    >
      {/* Charts Section */}
      <Box
        sx={{
          flexGrow: 1,
          width: "100%",
          position: "relative",
          paddingBottom: "50px", // Space for remarks
        }}
      >
        <MainCanvas
          charts={page.charts}
          removeChart={() => {}}
          onDragStop={() => {}}
          onResizeStop={() => {}}
          onSelectChart={() => {}}
          selectedChartId={null}
        />
      </Box>
      {/* Remarks Section */}
      <RemarkSection
        remark={page.remark}
        onChange={() => {}}
      />
    </Box>
  );
};

export default ExportablePage;
