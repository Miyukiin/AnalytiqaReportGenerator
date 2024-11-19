"use client";

export default function SummaryPage() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Left Panel */}
      <div className="flex-1 p-6 lg:p-12 bg-gray-100">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6">Summarization</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 gap-x-8">
          {/* Rows */}
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Number of Rows:</span>
            <span className="bg-gray-300 text-center align-middle w-16 h-6 rounded"> <p> x </p> </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Number of Columns:</span>
            <span className="bg-gray-300 text-center align-middle w-16 h-6 rounded"> <p> x </p> </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Number of Duplicate Values:</span>
            <span className="bg-gray-300 text-center align-middle w-16 h-6 rounded"> <p> x </p> </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Number of Unique Values:</span>
            <span className="bg-gray-300 text-center align-middle w-16 h-6 rounded"> <p> x </p> </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Number of Blank Cells:</span>
            <span className="bg-gray-300 text-center align-middle w-16 h-6 rounded"> <p> x </p> </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Min & Max Values:</span>
            <span className="bg-gray-300 text-center align-middle w-16 h-6 rounded"> <p> x </p> </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Standard Deviation:</span>
            <span className="bg-gray-300 text-center align-middle w-16 h-6 rounded"> <p> x </p> </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Variance:</span>
            <span className="bg-gray-300 text-center align-middle w-16 h-6 rounded"> <p> x </p> </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Mean:</span>
            <span className="bg-gray-300 text-center align-middle w-16 h-6 rounded"> <p> x </p> </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Median:</span>
            <span className="bg-gray-300 text-center align-middle w-16 h-6 rounded"> <p> x </p> </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Mode:</span>
            <span className="bg-gray-300 text-center align-middle w-16 h-6 rounded"> <p> x </p> </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Quartiles:</span>
            <span className="bg-gray-300 text-center align-middle w-16 h-6 rounded"> <p> x </p> </span>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-start">
          <h2 className="text-gray-800 font-bold text-lg mb-2 text-center">
            &lt;FileName&gt; Data Table | &lt;Sheet Name&gt;
          </h2>
          <div className="bg-white rounded-lg p-4 h-64 w-full lg:w-full shadow-sm"></div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-96 p-6 lg:p-12 bg-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Next Steps</h2>
        <div className="mb-8 flex flex-col items-center text-center">
          <h3 className="font-bold text-lg text-gray-800 mb-2">Data Cleaning</h3>
          <p className="text-sm text-gray-600">
            Data cleaning is the process of fixing or removing incorrect, corrupted, incorrectly
            formatted, duplicate, or incomplete data within a dataset. When combining multiple data
            sources, there are many opportunities for data to be duplicated or mislabeled.
          </p>
        </div>
        <div className="mb-8 flex flex-col items-center text-center">
          <h3 className="font-bold text-lg text-gray-800 mb-2">Create Report</h3>
          <p className="text-sm text-gray-600">
            A data analysis report is a type of business report in which you present quantitative and
            qualitative data to evaluate your strategies and performance. Based on this data, you give
            recommendations for further steps and business decisions while using the data as evidence
            that backs up your evaluation.
          </p>
        </div>
        <div className="flex flex-col space-y-4">
          <button className="w-full py-2 bg-gray-800 text-white text-sm font-bold rounded-lg hover:bg-gray-900">
            + Clean My Data
          </button>
          <p className="text-sm text-center text-gray-600">Or go straight to</p>
          <button className="w-full py-2 bg-gray-800 text-white text-sm font-bold rounded-lg hover:bg-gray-900">
            + Create Report
          </button>
        </div>
      </div>
    </div>
  );
}
