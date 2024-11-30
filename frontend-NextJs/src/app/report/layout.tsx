// src/app/report/layout.tsx
"use client";

import React, { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../../theme"; // Ensure this path is correct
import EmailIcon from "@/components/icons/EmailIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";
import FacebookIcon from "@/components/icons/FacebookIcon";
import GithubIcon from "@/components/icons/GithubIcon";

interface ReportLayoutProps {
  children: ReactNode;
}

const ReportLayout: React.FC<ReportLayoutProps> = ({ children }) => {
  return (
    <>
      {/* Header positioned above content */}
      <header className="bg-white shadow-md absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-4">
          {/* Logo */}
          <img
            src="/images/analytiqa_header.png"
            alt="Analytiqa Logo"
            className="h-10 w-auto"
          />
        </div>
      </header>

      {/* Gray Background Under the Header */}
      <div className="bg-gray-800 pt-16">
        {/* Content Under the Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Additional content */}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow bg-gray-100 min-h-screen">
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </main>

      {/* Custom Footer */}
      <footer className="bg-gray-900 text-white text-center py-6">
        <p className="text-sm mt-2">&copy; 2024, ANALYTIQA. All rights reserved.</p>
      </footer>
    </>
  );
};

export default ReportLayout;
