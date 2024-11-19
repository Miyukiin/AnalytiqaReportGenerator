import { CheckCircle } from 'lucide-react';

export default function DataReportGenerator() {
  return (
    <div className="flex flex-col items-center text-center px-4">
      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
        Data Report Generator
      </h2>

      {/* File Upload Section */}
      <div className="w-full max-w-lg border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 flex flex-col items-center justify-center">
        <button className="bg-[#38666e] flex items-center justify-center gap-2 text-white px-6 py-3 rounded-md hover:bg-[#2c5056] transition">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Choose File
        </button>
        <p className="text-gray-500 mt-4">or drag file here</p>
        <p className="text-gray-400 text-sm mt-1">
          Max file size 1GB. File must only be in .csv format.
        </p>
      </div>

      {/* Features List */}
      <ul className="mt-8 text-left text-gray-700 space-y-3 max-w-lg">
        <li className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <span>Create dynamic, visually engaging dashboards and reports</span>
        </li>
        <li className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <span>
            Supporting data-driven decision-making with customizable visualization options
          </span>
        </li>
        <li className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <span>Allows efficient data cleaning features</span>
        </li>
      </ul>

      {/* Description */}
      <p className="mt-8 text-gray-600 text-center font-bold w-full max-w-3xl">
        ANALYTIQA is a comprehensive data visualization and reporting tool designed to transform
        complex data into clear, actionable insights.
      </p>
    </div>
  );
}
