// pages/SummaryPage.tsx

"use client";

import React, { useEffect, useState, useMemo, ChangeEvent } from "react";
import { useRouter } from 'next/navigation';
import { useGlobalContext } from "@/context/GlobalContext";
import StatRow from "@/components/StatRow";
import DataTable from "@/components/DataTable";
import NextStepSection from "@/components/NextStepSection";
import FullscreenModal from "@/components/FullscreenModal";
import ManageColumnsDialog from "@/components/ManageColumnsDialog";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

type Order = 'asc' | 'desc';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => string;
}

interface FileData {
  name: string;
  headers_types: { [key: string]: string };
  row_count: number;
  column_count: number;
  duplicate_count: number;
  unique_count: number;
  total_number_blank_cells: number;
  data: Array<{ [key: string]: any }>;
}

interface Stat {
  label: string;
  value: number | string;
}

export default function SummaryPage() {
  const { fileData } = useGlobalContext() as { fileData: FileData };
  const router = useRouter();

  // Redirect to home if no file data
  useEffect(() => {
    if (!fileData.name) {
      router.push("/home");
    }
  }, [fileData, router]);

  if (!fileData.name) return null;

  // Define columns based on fileData headers
  const columns: Column[] = useMemo(() => (
    Object.entries(fileData.headers_types).map(([key, type]) => ({
      id: key,
      label: key,
      minWidth: 150,
      align: 'left' as const,
      format: type === "number" ? (value: number) => value.toLocaleString() : undefined,
    }))
  ), [fileData.headers_types]);

  // State for selected column
  const [selectedColumn, setSelectedColumn] = useState<string>('');

  // Compute stats including mean, median, mode if applicable
  const stats = useMemo(() => {
    const baseStats: Stat[] = [
      { label: "Number of Rows", value: fileData.row_count },
      { label: "Number of Columns", value: fileData.column_count },
      { label: "Number of Duplicate Values", value: fileData.duplicate_count },
      { label: "Number of Unique Values", value: fileData.unique_count },
      { label: "Number of Blank Cells", value: fileData.total_number_blank_cells },
    ];

    if (selectedColumn) {
      const columnType = fileData.headers_types[selectedColumn];
      const columnData = fileData.data
        .map(row => row[selectedColumn])
        .filter(value => value !== null && value !== undefined && value !== 0);
    
      if (columnData.length > 0) {
        if (columnType === 'number') {
          // Compute numerical stats (mean, median, mode)
          const numericData = columnData.map(Number).filter(value => !isNaN(value) && value !== 0);
          const mean = numericData.reduce((sum, val) => sum + val, 0) / numericData.length;
          const sortedData = [...numericData].sort((a, b) => a - b);
          const mid = Math.floor(sortedData.length / 2);
          const median = sortedData.length % 2 === 0 ? (sortedData[mid - 1] + sortedData[mid]) / 2 : sortedData[mid];
    
          const frequencyMap: { [key: number]: number } = {};
          let maxFreq = 0;
          numericData.forEach(num => {
            frequencyMap[num] = (frequencyMap[num] || 0) + 1;
            maxFreq = Math.max(maxFreq, frequencyMap[num]);
          });
          const numericModes = Object.keys(frequencyMap)
            .filter(num => frequencyMap[Number(num)] === maxFreq && Number(num) !== 0)
            .map(Number);
          const formattedMode = maxFreq === 1 ? "No mode" : numericModes.join(', ');
    
          baseStats.push(
            { label: "Mean", value: mean.toFixed(2) },
            { label: "Median", value: median.toFixed(2) },
            { label: "Mode", value: formattedMode }
          );
        } else {
          // Compute qualitative mode
          const frequencyMap: { [key: string]: number } = {};
          let maxFreq = 0;
    
          columnData.forEach(value => {
            const stringValue = String(value);
            frequencyMap[stringValue] = (frequencyMap[stringValue] || 0) + 1;
            maxFreq = Math.max(maxFreq, frequencyMap[stringValue]);
          });
    
          const modes = Object.keys(frequencyMap)
            .filter(value => frequencyMap[value] === maxFreq && value !== '0' && value !== '');
    
          const formattedMode = maxFreq === 1 ? "No Mode" : modes.join(', ');
    
          baseStats.push(
            { label: "Mode", value: formattedMode }
          );
        }
      }
    }
    
    return baseStats;
  }, [fileData, selectedColumn]);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Sorting state
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>(columns[0]?.id || '');

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const comparator = useMemo(() => (
    (a: any, b: any) => {
      if (b[orderBy] < a[orderBy]) return order === 'desc' ? -1 : 1;
      if (b[orderBy] > a[orderBy]) return order === 'desc' ? 1 : -1;
      return 0;
    }
  ), [order, orderBy]);

  const sortedData = useMemo(() => (
    [...fileData.data].sort(comparator)
  ), [fileData.data, comparator]);

  // Manage Columns state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map(col => col.id));
  const [isManageColumnsOpen, setIsManageColumnsOpen] = useState(false);

  const handleManageColumnsOpen = () => setIsManageColumnsOpen(true);
  const handleManageColumnsClose = () => setIsManageColumnsOpen(false);
  const toggleColumn = (columnId: string) => {
    setVisibleColumns(prev =>
      prev.includes(columnId) ? prev.filter(id => id !== columnId) : [...prev, columnId]
    );
  };

  // Select All functionality
  const allSelected = visibleColumns.length === columns.length;
  const handleSelectAll = () => {
    if (allSelected) {
      setVisibleColumns([]);
    } else {
      setVisibleColumns(columns.map(col => col.id));
    }
  };

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => setIsFullscreen(prev => !prev);

  // Close fullscreen on Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Handlers for navigation
  const handleCleanData = () => {
    router.push("/cleanpreview");
  };

  const handleCreateReport = () => {
    router.push("/report");
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Left Panel */}
      <div className="flex-1 p-6 lg:p-12 bg-gray-100 overflow-hidden">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6">Summary</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 gap-x-8">
          {stats.map((stat, idx) => (
            <StatRow key={idx} label={stat.label} value={stat.value} />
          ))}
        </div>

        {/* Column Selection Dropdown */}
        <div className="mt-4 w-full">
          <FormControl fullWidth variant="outlined">
            <InputLabel id="select-column-label">Select Column for Statistics</InputLabel>
            <Select
              labelId="select-column-label"
              id="select-column"
              value={selectedColumn}
              label="Select Column for Statistics"
              onChange={(event) => setSelectedColumn(event.target.value)}
              sx={{ backgroundColor: 'white' }}
            >
              {columns.map((column) => (
                <MenuItem key={column.id} value={column.id}>
                  {column.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="mt-8 flex flex-col items-start">
          <div className="flex flex-col md:flex-row justify-between items-center w-full mb-4 space-y-4 md:space-y-0">
            <h2 className="text-gray-800 font-bold text-lg text-center">
              Preview of "{fileData.name}"
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0 w-full sm:w-auto">
              {/* Manage Columns Button */}
              <Button
                variant="outlined"
                onClick={handleManageColumnsOpen}
                aria-controls={isManageColumnsOpen ? 'manage-columns-dialog' : undefined}
                aria-haspopup="true"
                aria-expanded={isManageColumnsOpen ? 'true' : undefined}
                sx={{
                  backgroundColor: "grey.700",
                  "&:hover": { backgroundColor: "primary.main" },
                  color: "white",
                  fontWeight: "bold",
                  padding: "5px 12px",
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Manage Columns
              </Button>

              {/* Fullscreen Toggle Button */}
              <Button
                variant="outlined"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                sx={{
                  backgroundColor: "grey.700",
                  "&:hover": { backgroundColor: "primary.main" },
                  color: "white",
                  fontWeight: "bold",
                  padding: "5px 12px",
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className={`rounded-lg w-full shadow-sm transition-all duration-300 overflow-x-auto`}>
            <DataTable
              columns={columns}
              data={sortedData}
              visibleColumns={visibleColumns}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-96 p-6 lg:p-12 bg-gray-200 flex-shrink-0">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">NEXT STEPS</h2>
        <NextStepSection
          title="Data Cleaning"
          description="Data cleaning is the process of fixing or removing incorrect, corrupted, incorrectly formatted, duplicate, or incomplete data within a dataset. When combining multiple data sources, there are many opportunities for data to be duplicated or mislabeled."
        />
        <NextStepSection
          title="Create Report"
          description="A data analysis report is a type of business report in which you present quantitative and qualitative data to evaluate your strategies and performance. Based on this data, you give recommendations for further steps and business decisions while using the data as evidence that backs up your evaluation."
        />
        <div className="flex flex-col space-y-4">
          <button
            onClick={handleCleanData}
            className="w-full py-2 bg-gray-800 text-white text-sm font-bold rounded-lg hover:bg-gray-900 transition-colors"
          >
            + Clean My Data
          </button>
          <p className="text-sm text-center text-gray-600">Or go straight to</p>
          <button
            onClick={handleCreateReport}
            className="w-full py-2 bg-gray-800 text-white text-sm font-bold rounded-lg hover:bg-gray-900 transition-colors"
          >
            + Create Report
          </button>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <FullscreenModal
        open={isFullscreen}
        onClose={toggleFullscreen}
        columns={columns}
        data={sortedData}
        visibleColumns={visibleColumns}
        order={order}
        orderBy={orderBy}
        onRequestSort={handleRequestSort}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Manage Columns Dialog */}
      <ManageColumnsDialog
        open={isManageColumnsOpen}
        onClose={handleManageColumnsClose}
        columns={columns}
        visibleColumns={visibleColumns}
        toggleColumn={toggleColumn}
        allSelected={allSelected}
        handleSelectAll={handleSelectAll}
      />
    </div>
  );
}
