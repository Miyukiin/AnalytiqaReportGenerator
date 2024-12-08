// pages/SummaryPage.tsx

"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { redirect, useRouter } from 'next/navigation';
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
  Snackbar, 
  Alert
} from '@mui/material';


import { useVisitorId } from "@/context/visitorIDManager";
import { fetchCsrfToken } from '../../components/csrfToken'

// Shared fetch function
const fetchData = async (url: string, uuid: string, csrfToken: string, setStatus: React.Dispatch<any>,  method: string = 'GET', body: any = null) => {
  try {
    const fullUrl = new URL(url);
    fullUrl.searchParams.append('uuid', uuid);

    const response = await fetch(fullUrl.toString(), {
      method,
      headers: {
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: method !== 'GET' && body ? JSON.stringify(body) : null, // Add body for non-GET requests
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus({ error: data["error"] || "Error Fetching Data", success: "" });
      return null;
    }
    return data;

  } 
  catch (error) {
    if (error instanceof Error) {
      setStatus({ error: error.message, success: "" });
    }
  }
};

export default function SummaryPage() {
  const router = useRouter();
  const visitorId = useVisitorId();
  const [loading, setLoading] = useState(true); 
  const [status, setStatus] = useState({ error: "", success: "" });
  const [previewData, setPreviewData] = useState<{
    data: { [key: string]: string | number | null | boolean; }[];
    headers_types: { [key:string]: string | number | null | boolean} | {};
  }>({ data: [], headers_types: {} });
  const [summaryData, setSummaryData] = useState<{
    name?: string;
    row_count?: number;
    column_count?: number;
    duplicate_count?: number;
    unique_count?: number;
    total_number_blank_cells?: number; 
    numeric_columns_stats?: {
      [key: string]: {
        Min: number;
        Max: number;
        Standard_Deviation: number;
        Variance: number;
        Mean: number;
        Median: number;
        Mode: number | null;
        Quartiles: {
          Q1: number;
          Q2: number;
          Q3: number;
        };
      };
    };
  }
  >();
  // Visitor ID Check
  useEffect(() => {
    if (visitorId){
      get_summary_statistics(visitorId);
      get_preview_data(visitorId);
      setLoading(false); // Visitor ID is resolved, stop loading now.
    }
      else if (visitorId === "") { // Wait to resolve, from initial state empty string.
        console.log("Waiting for visitor ID...");
    } else if (visitorId === null) { // If it is set to null, then the localstorage return nothing.
        router.push('/home'); // Redirect if visitorId is not available, meaning it is a new user with no prior csv uploads or progress.
    }
  }, [visitorId]);

  // PreviewData API Call
  const get_preview_data = async (uuid: string) => {
    setStatus({ error: '', success: '' }); 
    const csrfToken = await fetchCsrfToken();
    const data = await fetchData("http://127.0.0.1:8000/api/csv/get-table-preview-data/", uuid, csrfToken, setStatus);
    // const data = await fetchData(`${process.env.NEXT_PUBLIC_API_URL}/api/get-table-preview-data/`, uuid, csrfToken, setStatus);
    if (data) {
      setPreviewData(data);
      console.log("Getting Preview Data", data)
      setStatus({ error: '', success: 'Getting Preview Data Successful' });
    }
  };

  // SummaryData API Call
  const get_summary_statistics = async (uuid: string) => {
    setStatus({ error: '', success: '' });
    const csrfToken = await fetchCsrfToken(); 
    const data = await fetchData("http://127.0.0.1:8000/api/csv/get-summary-statistics/", uuid, csrfToken, setStatus);

    // const data = await fetchData(`${process.env.NEXT_PUBLIC_API_URL}/api/get-summary-statistics/`, uuid, csrfToken, setStatus);
    if (data) {
      setSummaryData(data);

      setStatus({ error: '', success: 'Getting Summary Statistics Successful' });
    }
  };

  // CleanCSV API Call
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  const clean_csv = async (uuid: string) => {
    console.log("Calling Clean API");
    setStatus({ error: '', success: '' });
    const csrfToken = await fetchCsrfToken(); 
    const data = await fetchData(
      "http://127.0.0.1:8000/api/csv/clean/",
      uuid,
      csrfToken,
      setStatus,
      'PUT' 
    );
  
    if (data) {
      setStatus({ error: '', success: 'Cleaning successful' });
      setSnackbarMessage('Successfull Data Cleaning!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true); 
    } else {
      setSnackbarMessage('Error Data Cleaning!');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };
  

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Initialization of Columns
  const [columns, setColumns] = useState<Column[]>([]); 
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]); // Initially empty, because first render of this component does not have previewData yet.

  interface Column {
    id: string;
    label: string;
    minWidth?: number;
    align?: 'left';
    format?: (value: number | boolean) => string;
  }
  
  // Hook for column mapping, and setting visible columns to all columns of passed API Data.
  useEffect(() => {
    if (previewData.headers_types) {
      // For each column in passed API data, we create a Column object.
      const RenderedColumns: Column[] = Object.entries(previewData.headers_types).map(([key, type]) => {
        const column: Column = {
          id: key, 
          label: key, 
          minWidth: 170,
          align: 'left',
        };
        if (type === "number" || type === "boolean") {
          column.format = (value: number | boolean) => value.toLocaleString(); // Format numbers and boolean values
        }
        return column;
      });
      setColumns(RenderedColumns); // Then we set our columns after creating the Column Objects we need.
      setVisibleColumns(RenderedColumns.map(col => col.id)); // Here we set all Column Objects as our visible columns. Initial state if passed API data contains columns.
    }
  }, [previewData]); // When previewData changes, run this hook. Ensures that columns are visible when previewData is loaded.

  // State handling column management.
  const [isManageColumnsOpen, setIsManageColumnsOpen] = useState(false);

  const handleManageColumnsOpen = () => setIsManageColumnsOpen(true);
  const handleManageColumnsClose = () => setIsManageColumnsOpen(false);
  const toggleColumn = (columnId: string) => {
    setVisibleColumns(prev =>
      prev.includes(columnId) ? prev.filter(id => id !== columnId) : [...prev, columnId]
    );
  };

  // Select All functionality
  const allSelected = visibleColumns.length === columns.length; // If the number of visible columns is equal to the full length of columns, it means that all columns are visible.
  const handleSelectAll = () => {
    if (allSelected) {
      setVisibleColumns([]);
    } else {
      setVisibleColumns(columns.map(col => col.id));
    }
  };

  // Sorting state
  type Order = 'asc' | 'desc';
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
    [...previewData.data].sort(comparator)
  ), [previewData.data, comparator]);

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
    clean_csv(visitorId);
    setTimeout(() => {
      router.push("/clean");
    }, 3000);
  };

  const handleCreateReport = () => {
    router.push("/report");
  };

  // Dropdown Selected Column Stats Management
  const [selectedColumn, setSelectedColumn] = useState<string>('');

  // Handle Summary Statistics
  const GenStats = [
    { label: "Number of Rows", value: summaryData?.row_count },
    { label: "Number of Columns", value: summaryData?.column_count },
    { label: "Number of Duplicate Values", value: summaryData?.duplicate_count },
    { label: "Number of Unique Values", value: summaryData?.unique_count },
    { label: "Number of Blank Cells", value: summaryData?.total_number_blank_cells },
  ];
  
  const NumStats = useMemo(() => {
    // Quantitative stats handling
    const stats = []
    if (selectedColumn) {
      // Type-checking. get columntype of currently selected column only if its structure follows as defined.
      const columnType = (previewData.headers_types as { [key: string]: string | number | boolean | null })[selectedColumn]
      const columnData = previewData.data
        .map(row => row[selectedColumn])
        .filter(value => value !== null && value !== undefined && value !== 0);
    
      if (columnData.length > 0 && (columnType === 'number' && (summaryData && summaryData.numeric_columns_stats))) {
        // If columnData has more than zero rows, columnType is number, and summaryData is not empty. 
          // Get the selectedColumn's numerical statistics
          stats.push(
            { label: "Min", value: summaryData.numeric_columns_stats[selectedColumn]['Min'] },
            { label: "Max", value: summaryData.numeric_columns_stats[selectedColumn]['Max'] },
            { label: "Standard Deviation", value: summaryData.numeric_columns_stats[selectedColumn]['Standard_Deviation'] },
            { label: "Variance", value: summaryData.numeric_columns_stats[selectedColumn]['Variance'] },
            { label: "Mean", value: summaryData.numeric_columns_stats[selectedColumn]['Mean'] },
            { label: "Median", value: summaryData.numeric_columns_stats[selectedColumn]['Median'] },
            { label: "Mode", value: summaryData?.numeric_columns_stats[selectedColumn]['Mode'] || undefined},
            { label: "Quartiles (1)", value: summaryData.numeric_columns_stats[selectedColumn]['Quartiles']['Q1'] },
            { label: "Quartiles (2)", value: summaryData.numeric_columns_stats[selectedColumn]['Quartiles']['Q2'] },
            { label: "Quartiles (3)", value: summaryData.numeric_columns_stats[selectedColumn]['Quartiles']['Q3'] },
          );
        }
      }
    
    return stats;
  }, [previewData, summaryData, selectedColumn]);
  

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Left Panel */}
      <div className="flex-1 p-6 lg:p-12 bg-gray-100 overflow-hidden">
        <h1 className="text-4xl lg:text-3xl font-bold text-gray-800 mb-6">DATA SUMMARY</h1>
        {/* Gen Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 gap-x-8">
          {GenStats.map((stat, idx) => (
            <StatRow key={idx} label={stat.label} value={stat.value} />
          ))}
        </div>

        {/* Column Selection Dropdown */}
        <div className="mt-5 w-full">
          <FormControl fullWidth variant="outlined">
            <InputLabel id="select-column-label">
              Select A Numeric Column
            </InputLabel>
            <Select
              labelId="select-column-label"
              id="select-column"
              value={selectedColumn}
              label="Select Column for Statistics"
              onChange={(event) => setSelectedColumn(event.target.value)}
              sx={{ backgroundColor: 'white' }}
            >
              {/* Filter columns where headers_types is "number" */}
              {columns
                .filter((column) => (previewData.headers_types as { [key: string]: string | number | boolean | null })[column.id] === 'number') // Filter numeric columns
                .map((column) => (
                  <MenuItem key={column.id} value={column.id}>
                    {column.label}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </div>
        {/* Num Stats */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-y-4 gap-x-8">
          {NumStats.map((stat, idx) => (
            <StatRow key={idx} label={stat.label} value={stat.value} />
          ))}
        </div>

        <div className="mt-7 flex flex-col items-start">
          <div className="flex flex-col md:flex-row justify-between items-center w-full mb-4 space-y-4 md:space-y-0">
            <h2 className="text-gray-800 font-bold text-lg text-center">
              Preview of "{summaryData?.name}"
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
          {/* Snackbar for feedback */}
            <Snackbar
            open={openSnackbar}
            autoHideDuration={3000}
            onClose={() => setOpenSnackbar(false)}
            message={snackbarMessage}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{
              '& .MuiSnackbarContent-root': {
                backgroundColor: 'green',
                color: 'white',
              },
            }}
          >
            <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
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

