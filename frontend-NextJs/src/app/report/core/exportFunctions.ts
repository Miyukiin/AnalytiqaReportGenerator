// src/app/report/core/exportFunctions.ts

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Exports a given HTML element as a PDF document.
 * The PDF size matches the element's size, including charts and remarks.
 * @param element - The HTML element to export.
 * @param filename - The desired filename for the exported PDF.
 */
export const exportAsPDF = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    if (!element) {
      console.error("No element provided for export.");
      return;
    }

    // Check if the element has any charts
    const hasCharts = element.querySelectorAll('.chart-item').length > 0;
    if (!hasCharts) {
      alert("No charts to export.");
      return;
    }

    // Get the element's dimensions
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Convert pixels to millimeters (1 inch = 25.4 mm, 1 inch = 96 px)
    const pxToMm = (px: number) => (px * 25.4) / 96;

    const pdfWidth = pxToMm(width);
    const pdfHeight = pxToMm(height);

    // Capture the element with html2canvas
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2, // Increase scale for better resolution
      useCORS: true, // Enable cross-origin images
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");

    // Initialize jsPDF with the element's size
    const orientation: "portrait" | "landscape" = width > height ? "landscape" : "portrait";
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format: [pdfWidth, pdfHeight],
    });

    // Add the image to the PDF
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    // Save the PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Failed to export as PDF:", error);
    alert("An error occurred while exporting as PDF.");
  }
};

/**
 * Exports a given HTML element as a PNG image.
 * @param element - The HTML element to export.
 * @param filename - The desired filename for the exported image.
 */
export const exportAsPNG = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    // Check if the element has any charts
    const hasCharts = element.querySelectorAll('.chart-item').length > 0;
    if (!hasCharts) {
      alert("No charts to export.");
      return;
    }

    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2, // Increase scale for better resolution
      useCORS: true, // Enable cross-origin images
    });
    const dataURL = canvas.toDataURL("image/png"); // Ensure using 'image/png'
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `${filename}.png`;
    link.click();
  } catch (error) {
    console.error("Failed to export as PNG:", error);
    alert("An error occurred while exporting as PNG.");
  }
};
