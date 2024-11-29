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
      {/* Custom Header */}
      <header className="bg-white shadow-md top-0 left-0 w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
          <img
            src="/images/analytiqa_header2.png"
            alt="Report Header Logo"
            className="h-10 sm:h-11 w-auto"
          />
          {/* Optional: Add navigation links or a hamburger menu here for mobile */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gray-100 min-h-screen">
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </main>

      {/* Custom Footer */}
      <footer className="bg-gray-900 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row flex-wrap justify-between items-center space-y-6 lg:space-y-0">
          {/* Left Section: Logo */}
          <div className="flex items-center justify-center lg:justify-start">
            <img
              src="/images/analytiqa_footer2.png"
              alt="Footer Logo"
              className="h-10 w-auto"
            />
          </div>

          {/* Center Section: Links */}
          <div className="flex flex-col items-center lg:items-start space-y-2">
            <a href="/help" className="text-sm text-gray-400 hover:text-white">
              Help
            </a>
            <a
              href="/terms-and-conditions"
              className="text-sm text-gray-400 hover:text-white"
            >
              Terms & Conditions
            </a>
            <a href="/policy" className="text-sm text-gray-400 hover:text-white">
              Policy
            </a>
          </div>

          {/* Right Section: Contact and Icons */}
          <div className="flex flex-col items-center lg:items-end space-y-2">
            {/* Email */}
            <div className="flex items-center space-x-2">
              <EmailIcon className="text-gray-400 hover:text-white" />
              <span className="text-sm">info@analytiqa.com</span>
            </div>
            {/* Social Icons */}
            <div className="flex space-x-2">
              <InstagramIcon className="text-gray-400 hover:text-white" />
              <FacebookIcon className="text-gray-400 hover:text-white" />
              <GithubIcon className="text-gray-400 hover:text-white" />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default ReportLayout;
