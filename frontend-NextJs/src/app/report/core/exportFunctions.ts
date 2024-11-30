// src/app/report/core/exportFunctions.ts

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

    // Use html2canvas to capture the element
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2, // Increase scale for better resolution
      useCORS: true, // Enable cross-origin images
    });

    // Convert the canvas to a data URL
    const dataURL = canvas.toDataURL("image/png");

    // Create a temporary link to trigger the download
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to export as PNG:", error);
    alert("An error occurred while exporting as PNG.");
  }
};

/**
 * Exports a given HTML element as a PDF document.
 * The PDF size matches the element's size, including charts and remarks.
 * @param element - The HTML element to export.
 * @param filename - The desired filename for the exported PDF.
 */
export const exportAsPDF = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
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

    // Convert pixels to points (1 pt = 1/72 inch, 1 inch = 96 px)
    const pxToPt = (px: number) => (px * 72) / 96;
    const pdfWidth = pxToPt(width);
    const pdfHeight = pxToPt(height);

    // Use html2canvas to capture the element
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2, // Increase scale for better resolution
      useCORS: true, // Enable cross-origin images
    });

    // Convert the canvas to a data URL
    const imgData = canvas.toDataURL("image/png");

    // Initialize jsPDF with the element's size
    const orientation = width > height ? "landscape" : "portrait";
    const pdf = new jsPDF({
      orientation: orientation,
      unit: "pt",
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
