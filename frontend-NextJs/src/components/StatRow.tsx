"use client";

import { useState } from "react";

interface StatRowProps {
  label: string;
  value: string | number | null | undefined;
}

export default function StatRow({ label, value }: StatRowProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="bg-gray-300 text-center align-middle text-sm lg:text-sm w-32 h-6 rounded flex items-center justify-between px-2">
        <p className="truncate flex-1">
          {value !== null && value !== undefined ? value.toString() : "N/A"}
        </p>
        {value !== null &&
          value !== undefined &&
          value.toString().length > 15 && (
            <button
              onClick={handleModalToggle}
              className="flex-shrink-0 p-1"
              title="View Full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-fullscreen"
              >
                <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                <rect width="10" height="8" x="7" y="8" rx="1" />
              </svg>
            </button>
          )}
      </span>

      {isModalOpen && value && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleModalToggle}
        >
          <div
            className="bg-white p-4 rounded shadow-lg max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">{label}</h3>
            <p className="text-sm">{value}</p>
            <button
              className="mt-4 px-4 py-2 bg-gray-700 text-white rounded"
              onClick={handleModalToggle}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
