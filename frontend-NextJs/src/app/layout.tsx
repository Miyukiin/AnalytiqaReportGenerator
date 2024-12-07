"use client";

import React from "react";
import './globals.css';
import { usePathname } from "next/navigation"; // To get the current route
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme"; // Adjust the path based on your project structure
import { VisitorIdProvider } from "../context/visitorIDManager"; // Import the VisitorIdProvider
import Link from "next/link"; // Import Link for navigation
import UploadFileIcon from '@mui/icons-material/UploadFile'; // Import MUI UploadFileIcon

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define routes where the global header/footer should not appear
  const noGlobalLayoutRoutes = ["/none"];

  // Check if the current route is in the exception list
  const isNoGlobalLayout = noGlobalLayoutRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Determine if the current page is /home
  const isHomePage = pathname === "/home";

  return (
    <html lang="en">
      <head>
        <title>ANALYTIQA</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Wix+Madefor+Text:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-wix bg-white">
        {/* Render Global Header only if not in noGlobalLayoutRoutes */}
        {!isNoGlobalLayout && (
          <header className="bg-white shadow-md top-0 left-0 right-0 z-10">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
              {/* Logo on the left, center it when on the home page */}
              <div className={`flex-shrink-0 ${isHomePage ? "mx-auto" : ""}`}>
                <Link href="/">
                  <img
                    src="/images/analytiqa_header.png"
                    alt="Analytiqa Logo"
                    className="h-10 w-auto"
                  />
                </Link>
              </div>

              {/* Upload CSV Button on the right, hidden on /home */}
              {!isHomePage && (
                <div>
                  <Link href="/home">
                    <button
                      className="flex items-center bg-mainblue-default hover:bg-[#2c5056] text-white px-4 py-2 rounded-md transition transform hover:scale-105"
                      aria-label="Upload New CSV"
                    >
                      <UploadFileIcon className="w-5 h-5 mr-2" />
                      Upload Another CSV
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </header>
        )}

        {/* Main Content */}

        <main

          className={`${

            isNoGlobalLayout
              ? "flex-grow"
              : isHomePage
              ? "mt-8 flex-grow"
              : "mt-0 flex-grow"

          }`}
        >
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <VisitorIdProvider>
              {children}
            </VisitorIdProvider>
          </ThemeProvider>
        </main>

        {/* Render Global Footer only if not in noGlobalLayoutRoutes */}
        {!isNoGlobalLayout && (
          <footer className="bg-gray-900 text-white text-center py-6">
            <p className="text-sm mt-2">&copy; 2024, ANALYTIQA. All rights reserved.</p>
          </footer>
        )}
      </body>
    </html>
  );
}
