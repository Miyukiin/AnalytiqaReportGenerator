// components/FullWidthDivider.tsx

import React from "react";
import { Divider } from "@mui/material";

const FullWidthDivider: React.FC = () => (
  <Divider
    sx={{
      width: "calc(100% + 32px)",
      ml: -2,
      mr: -2,
      my: 1.5,
    }}
  />
);

export default FullWidthDivider;
