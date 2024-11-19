"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import BadgeCheckIcon from "../components/icons/BadgeCheckIcon";
import FilePlusIcon from "../components/icons/FilePlusIcon";
import ChevronDownIcon from "../components/icons/ChevronDownIcon";

export default function DataReportGenerator() {
  const [fileData, setFileData] = useState({ name: "", size: null as number | null });
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(false); // Add loading state

  const router = useRouter(); // Initialize the router

  const validateFile = (file: File) => {
    const fileType = file.name.split(".").pop()?.toLowerCase();
    const maxFileSize = 1024 ** 3; // 1GB in bytes
    if (fileType !== "csv") return "Unsupported file format. Please upload a .csv file.";
    if (file.size > maxFileSize) return "File size exceeds 1GB limit.";
    return "";
  };

  const handleFileUpload = (file: File | null) => {
    if (!file) return;
    const error = validateFile(file);
    if (error) {
      setStatus({ error, success: "" });
      setFileData({ name: "", size: null });
    } else {
      setFileData({ name: file.name, size: file.size });
      setStatus({ error: "", success: "" });
      simulateUpload(); // Simulate the upload process
    }
  };

  const simulateUpload = () => {
    setLoading(true); // Set loading to true
    setTimeout(() => {
      setLoading(false); // Stop loading after 2 seconds (simulated upload time)
      setStatus({ error: "", success: "File uploaded successfully!" });
      router.push("/summary"); // Navigate to the summary page
    }, 2000); // Simulated delay
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>, dragging: boolean) => {
    e.preventDefault();
    setIsDragging(dragging);
  };

  return (
    <div className="relative flex flex-col items-center text-center px-4 w-full">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 my-6">Data Report Generator</h2>

      {/* Full-screen Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative flex flex-col items-center">
            {/* Modern Custom Loading Spinner */}
            <div className="relative flex items-center justify-center">
              <div className="modern-loader"></div>
            </div>
            <p className="text-white text-lg font-medium mt-4">Uploading...</p>
          </div>
        </div>
      )}

      <div
        className={`w-full max-w-lg border-2 ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
        } border-dashed rounded-lg p-6 flex flex-col items-center space-y-3 transition-all`}
        onDrop={(e) => {
          handleDrag(e, false);
          handleFileUpload(e.dataTransfer.files?.[0] || null);
        }}
        onDragOver={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
        aria-label="Drag and drop file upload area"
      >
        <label htmlFor="file-upload" className="relative w-full max-w-xs cursor-pointer">
          <input
            type="file"
            accept=".csv"
            id="file-upload"
            onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
            className="hidden"
            aria-label="File upload input"
          />
          <div className="flex items-center justify-center bg-transparent text-white px-4 py-3 rounded-md">
            <div className="flex items-center h-[40px] px-4 rounded-l-lg bg-mainblue-default mr-[1px] hover:bg-[#2c5056] transition">
              <FilePlusIcon className="w-5 h-5 mr-3" />
              <span>{fileData.name || "Choose File"}</span>
            </div>
            <div className="flex items-center h-[40px] px-2 rounded-r-lg bg-mainblue-default hover:bg-[#2c5056] transition">
              <ChevronDownIcon className="w-5 h-5" />
            </div>
          </div>
        </label>
        <p className="text-gray-500 text-sm">or drag file here</p>
        <p className="text-gray-400 text-xs">Max file size 1GB. <br /> File must only be in .csv format.</p>
        {fileData.size && <p className="text-gray-500 text-xs">File size: {(fileData.size / 1024 ** 2).toFixed(2)} MB</p>}
        {status.error && <p className="text-red-500 text-sm mt-2">{status.error}</p>}
        {status.success && <p className="text-green-500 text-sm mt-2">{status.success}</p>}
      </div>

      <ul className="mt-8 text-left md:text-center text-black space-y-2 text-sm">
        {[
          "Create dynamic, visually engaging dashboards and reports",
          "Supporting data-driven decision-making with customizable visualization options",
          "Allows efficient data cleaning features",
        ].map((feature, idx) => (
          <li key={idx} className="flex items-center gap-x-2">
            <BadgeCheckIcon size={22} color="#65974F" checkColor="white" />
            {feature}
          </li>
        ))}
      </ul>
      <span className="mt-8 text-gray-600 font-bold mb-12 text-sm md:text-md">
        ANALYTIQA is a comprehensive data visualization and reporting tool designed to transform complex data into clear, actionable insights.
      </span>
    </div>
  );
}
