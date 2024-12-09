"use client";

import { useState, createContext, useContext, use } from "react";
import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import BadgeCheckIcon from "../../components/icons/BadgeCheckIcon";
import FilePlusIcon from "../../components/icons/FilePlusIcon";
import ChevronDownIcon from "../../components/icons/ChevronDownIcon";
import { useVisitorId } from '../../context/visitorIDManager';
import { fetchCsrfToken } from '../../components/csrfToken'

export default function DataReportGenerator() {
  const [fileData, setFileData] = useState<{ name: string; size: number | null; csv_file: null | File }>({
    name: "",
    size: null,
    csv_file: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const visitorId = useVisitorId();

  const validateFile = (file: File) => {
    const fileType = file.name.split(".").pop()?.toLowerCase();
    const maxFileSize = 100 * 1024 ** 2; // 100 MB in bytes

    if (fileType !== "csv") return "Unsupported file format. Please upload a .csv file.";
    if (file.size > maxFileSize) return "File size exceeds 1GB limit.";
    return ""; // No Error
  };

  const handleFileUpload = (uuid: string, file: File | null) => {
    if (!file) return;
    const error = validateFile(file);

    if (error) {
      setStatus({ error, success: "" });
      setFileData({name: "", size: null, csv_file: null});
      return;
    } 
    else if (uuid && file){
      setFileData({ name: file.name, size: file.size, csv_file: file});
      setStatus({ error: "", success: "" });
      simulateUpload(uuid, file);
    }
  };

  const simulateUpload = async (uuid: string, file: File) => {
    setLoading(true); // Set loading to true

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uuid", uuid);
      formData.append('file_name', file.name ? file.name : fileData.name)

      const response = await fetch("http://127.0.0.1:8000/api/csv-upload/", { // pass to api
        method: "PUT",
        headers: {
          "X-CSRFToken": await fetchCsrfToken() || "", // 
        },
        body: formData,
        credentials: "include",
      });
      
      if (response.ok) {
        setStatus({ error: "", success: "File uploaded successfully!" });
        const apiData = await response.json();

        router.push("/summary"); 
      } 
      else {
        const error = await response.json();
        setFileData({name: "", size: null, csv_file: null});
        setStatus({ error: error.error || "Upload failed. Please try again.", success: "" });
      }

    } 
    catch (error) {
      if (error instanceof Error) {
        setStatus({ error: error.message, success: "" });
      } 
      else {
        setStatus({ error: "An unexpected error occurred.", success: "" });
      }
      setFileData({name: "", size: null, csv_file: null});
    } 
    finally {
      setLoading(false); // After upload logic, regardless of fail or success, stop loading spinner.
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>, dragging: boolean) => {
    e.preventDefault();
    setIsDragging(dragging);
  };

  return (
    <div className="relative flex flex-col items-center text-center px-4 w-full">
      <Head>
        {/* Set the favicon for the tab */}

        <link rel="icon" href="logo.png" />
        <title>Data Report Generator</title> {/* Optional: You can also set the title */}

      </Head>

      <h2 className="text-4xl sm:text-4xl font-bold text-gray-600 my-6 mt-16">DATA REPORT GENERATOR</h2>


      {/* Full-screen Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative flex flex-col items-center">
            {/* Spoke Spinner */}
            <div className="spinner">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index}></div> // Each spoke of the spinner
              ))}
            </div>
            <p className="text-white text-5xl font-medium mt-4">Uploading...</p>
          </div>
        </div>
      )}
      
      <div
        className={`w-full max-w-lg border-2 ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
        } border-dashed rounded-lg p-6 flex flex-col items-center space-y-3 transition-all`}
        onDrop={(e) => {
          handleDrag(e, false);
          handleFileUpload(visitorId,e.dataTransfer.files?.[0] || null);
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
            onChange={(e) => handleFileUpload(visitorId,e.target.files?.[0] || null)}
            className="hidden"
            aria-label="File upload input"
          />
          <div className="flex items-center justify-center bg-transparent text-white px-4 py-3 rounded-md">
          <div className="flex items-center h-[40px] px-4 rounded-l-lg bg-mainblue-default mr-[1px] hover:bg-[#2c5056] transition w-[150px]">
              <FilePlusIcon className="w-5 h-5 mr-3" />
              <span className="truncate break-words w-full">{fileData.name || "Choose File"}</span>
            </div>
            <div className="flex items-center h-[40px] px-2 rounded-r-lg bg-mainblue-default hover:bg-[#2c5056] transition">
              <ChevronDownIcon className="w-5 h-5" />
            </div>
          </div>
        </label>
        <p className="text-gray-500 text-sm">or drag your file here</p>

        <p className="text-gray-500 text-sm">Max file size 100 MB. <br /> File must be in .csv format and comma-separated.</p>
        {fileData.size && <p className="text-gray-500 text-sm">File size: {(fileData.size / 1024 ** 2).toFixed(2)} MB</p>}
        {status.error && <p className="text-red-500 text-sm mt-2">{status.error}</p>}
        {status.success && <p className="text-green-500 text-sm mt-2">{status.success}</p>}
      </div>

      <ul className="mt-8 text-[11px] ml-4 md:ml text-left md:text-center text-black space-y-2 md:text-[13px]">
        {[
          "Create visually engaging dashboards and reports",
          "Supporting data-driven decision-making",
          "Customizable visualization options",
          "Allows efficient data cleaning features",
        ].map((feature, idx) => (
          <li key={idx} className="flex items-center gap-x-2">
            <BadgeCheckIcon size={22} color="#65974F" checkColor="white" />
            {feature}
          </li>
        ))}
      </ul>
      <span className="mt-12 text-gray-600 font-bold mb-12 text-sm md:text-xl">
        ANALYTIQA is a comprehensive data visualization and reporting tool designed to transform complex data into clear, actionable insights.
      </span>
    </div>
  );
}
