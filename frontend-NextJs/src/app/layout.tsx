// src/app/layout.tsx

"use client"; // Ensure this is a Client Component

import React from "react";
import './globals.css';
import { GlobalProvider } from "../context/GlobalContext";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme"; // Adjust the path based on your project structure

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>ANALYTIQA</title>
        {/* Import Wix Madefor Text font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Wix+Madefor+Text:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-wix bg-white">
        {/* Container for positioning */}
        <div className="relative">

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
          <div className="bg-gray-800 pt-16"> {/* Added pt-20 to push content down */}
            {/* Content Under the Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Additional content */}
            </div>
          </div>
          
        </div>

        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center">
          <div className="w-full">
            <ThemeProvider theme={theme}>
              {/* CssBaseline provides a consistent baseline for styling */}
              <CssBaseline />
              <GlobalProvider>{children}</GlobalProvider>
            </ThemeProvider>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white text-center py-6">
          <p className="text-sm mt-2">&copy; 2024, ANALYTIQA. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
