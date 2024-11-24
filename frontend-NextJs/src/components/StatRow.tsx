"use client";

interface StatRowProps {
  label: string;
  value: string | number | null | undefined; 
}

export default function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="bg-gray-300 text-center align-middle w-16 h-6 rounded">
        <p>{value || "N/A"}</p>
      </span>
    </div>
  );
}