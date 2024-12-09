// src/app/CleanPreviewPage.tsx

"use client"; // Ensure this is a Client Component

import React, { useState, useEffect, ChangeEvent, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { Box, Typography, Button, IconButton} from "@mui/material";
import ExpandIcon from "@/components/icons/ExpandIcon"; // Adjust the path as needed
import { useVisitorId } from "@/context/visitorIDManager";
import { fetchCsrfToken } from '../../components/csrfToken'
import DataTable from "@/components/DataTable";
import SummaryChanges from "@/components/summaryChanges"
import FullscreenModal from "@/components/FullscreenModal";
import ManageColumnsDialog from "@/components/ManageColumnsDialog";


// Shared fetch function
const fetchData = async (url: string, uuid: string, csrfToken: string, setStatus: React.Dispatch<any>,  method: string = 'GET') => {
  try {
    const fullUrl = new URL(url);
    fullUrl.searchParams.append('uuid', uuid);

    const response = await fetch(fullUrl.toString(), {
      method,
      headers: {
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
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

export default function CleanPreviewPage() {
  const router = useRouter();
  const visitorId = useVisitorId();
  const [loading, setLoading] = useState(true); 
  const [status, setStatus] = useState({ error: "", success: "" });
  const [fileName, setFileName] = useState("");
  const [origPreviewData, setOrigPreviewData] = useState<{
    data: { [key: string]: string | number | null | boolean; }[];
    headers_types: { [key:string]: string | number | null | boolean} | {};
  }>({ data: [], headers_types: {} });

  const [cleanedPreviewData, setCleanedPreviewData] = useState<{
    name: string | "";
    data: { [key: string]: string | number | null | boolean; }[];
    headers_types: { [key:string]: string | number | null | boolean} | {};
  }>({ name: "", data: [], headers_types: {} });

  const [summaryChangesData, setSummaryChangesData] = useState<{
    data: {
      rows_removed: number | null;
      missing_values_replaced: number | null;
      column_changes: { [key: string]: number | null };
      removed_columns: string[];
      non_ascii_values: number | null;
    };
  }>({
    data: {
      rows_removed: null,
      missing_values_replaced: null,
      column_changes: {},
      removed_columns: [],
      non_ascii_values: null,
    }
  });

  useEffect(() => {
    if (visitorId) {
      // Fetch data sequentially or in parallel
      try{
        get_preview_data(visitorId);
        get_clean_preview_data(visitorId);
        get_summary_changes(visitorId);
      }
      finally{
        setLoading(false); 
      }
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
    const data = await fetchData("https://miyukiin.pythonanywhere.com/api/csv/get-table-preview-data/", uuid, csrfToken, setStatus);
    // const data = await fetchData(`${process.env.NEXT_PUBLIC_API_URL}/api/get-table-preview-data/`, uuid, csrfToken, setStatus);
    if (data) {
      setOrigPreviewData(data);
      setStatus({ error: '', success: 'Getting Preview Data Successful' });
    }
  };

  // Clean PreviewData API Call
  const get_clean_preview_data = async (uuid: string) => {
    setStatus({ error: '', success: '' }); 
    const csrfToken = await fetchCsrfToken();
    const data = await fetchData("https://miyukiin.pythonanywhere.com/api/csv/get-cleaned-table-preview-data/", uuid, csrfToken, setStatus);
    // const data = await fetchData(`${process.env.NEXT_PUBLIC_API_URL}/api/get-table-preview-data/`, uuid, csrfToken, setStatus);
    if (data) {
      setCleanedPreviewData(data);
      setFileName(data.name)
      setStatus({ error: '', success: 'Getting Cleaned Preview Data Successful' });
    }
  };

  // Download CSV API Call
  const handleDownloadCleanedCSV = async (uuid: string) => {
    setStatus({ error: '', success: '' }); 
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await fetch(`https://miyukiin.pythonanywhere.com/api/csv/download-cleaned-csv/?uuid=${uuid}`, {
        method: 'GET',
        headers: {
          'X-CSRFToken': csrfToken,
        },
      });


      if (!response.ok) {
        throw new Error('Failed to fetch the CSV file.');
      }
      const contentDisposition = response.headers.get('Content-Disposition');

      if (contentDisposition) {
        const fileName = contentDisposition.split('filename=')[1].replace(/"/g, ''); // Get the filename

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName); 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // Cleanup
        
        setStatus({ error: '', success: 'Downloading Successful' });
      } else {
        setStatus({ error: 'Error: Could not determine file name', success: '' });
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);
      setStatus({ error: 'Failed to download the file.', success: '' });
    }
  }

  // Handle summary changes between original and cleaned table
  const get_summary_changes = async (uuid: string) => {
    setStatus({ error: '', success: '' }); 
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await fetch(`https://miyukiin.pythonanywhere.com/api/csv/get-summary-changes/?uuid=${uuid}`, {
        method: 'GET',
        headers: {
          'X-CSRFToken': csrfToken,
        },
      });

      const data = await response.json();

      if (data) {
        setSummaryChangesData({
          data: data
        });
        setStatus({ error: '', success: 'Getting Cleaned Preview Data Successful' });
      }
      
    } catch (error) {
      console.error('Error downloading CSV:', error);
      setStatus({ error: 'Failed to download the file.', success: '' });
    }
  }

  // Handle Go Back Button Logic of Deleting Clean CSV, and Redirecting
  const handleDeleteAndNavigate = async (uuid: string) => {
    setStatus({ error: '', success: '' }); 
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await fetch(`https://miyukiin.pythonanywhere.com/api/csv/delete-clean-csv/${uuid}/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setStatus({ error: 'Failed to delete the clean CSV file.', success: '' });
      } else {
        setStatus({ error: '', success: 'Deleting Clean CSV Successful' });
        console.log("Deletion Successful")
        router.push("/summary")
      }
    } catch (error) {
      console.error('Error Deleting Clean CSV:', error);
      setStatus({ error: 'Failed to delete the clean CSV file.', success: '' });
    }
  };
  
  // Original Table and Cleaned Table Pagination States
  // Original Table Pagination state
  const [pageOrigTable, setPageOrigTable] = useState(0);
  const [rowsPerPageOrigTable, setRowsPerPageOrigTable] = useState(10);

  const handleChangePageOrigTable = (event: unknown, newPage: number) => setPageOrigTable(newPage);
  const handleChangeRowsPerPageOrigTable = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPageOrigTable(+event.target.value);
    setPageOrigTable(0);
  };

  // Cleaned Table Pagination state
  const [pageCleanedTable, setPageCleanedTable] = useState(0);
  const [rowsPerPageCleanedTable, setRowsPerPageCleanedTable] = useState(10);

  const handleChangePageCleanedTable = (event: unknown, newPage: number) => setPageCleanedTable(newPage);
  const handleChangeRowsPerPageCleanedTable = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPageCleanedTable(+event.target.value);
    setPageCleanedTable(0);
  };

  // Columns Initialization
  // Initialization of Original Table Columns
  const [columnsOrigTable, setColumnsOrigTable] = useState<Column[]>([]); 
  const [visibleColumnsOrigTable, setVisibleColumnsOrigTable] = useState<string[]>([]); // Initially empty, because first render of this component does not have previewData yet.

  // Initialization of Cleaned Table Columns
  const [columnsCleanedTable, setColumnsCleanedTable] = useState<Column[]>([]); 
  const [visibleColumnsCleanedTable, setVisibleColumnsCleanedTable] = useState<string[]>([]); // Initially empty, because first render of this component does not have previewData yet.

  interface Column {
    id: string;
    label: string;
    minWidth?: number;
    align?: 'left';
    format?: (value: number | boolean) => string;
  }
  
  // Hook for column mapping, and setting visible columns to all columns of passed API Data.
  useEffect(() => {
    if (origPreviewData.headers_types && cleanedPreviewData.headers_types) {
      const generateColumns = (headers: { [key: string]: string | number | boolean | null }): Column[] => {
        return Object.entries(headers).map(([key, type]) => {
          const column: Column = {
            id: key,
            label: key,
            minWidth: 170,
            align: 'left',
          };
  
          // Conditionally add the format function for number or boolean types
          if (type === "number" || type === "boolean") {
            column.format = (value: number | boolean) => value.toLocaleString();
          }
  
          return column;
        });
      };
  
      const OrigRenderedColumns = generateColumns(origPreviewData.headers_types);
      const CleanedRenderedColumns = generateColumns(cleanedPreviewData.headers_types);
  
      setColumnsOrigTable(OrigRenderedColumns); // Set columns for original table
      setVisibleColumnsOrigTable(OrigRenderedColumns.map(col => col.id)); // Set visible columns for original table
      
      setColumnsCleanedTable(CleanedRenderedColumns); // Set columns for cleaned table
      setVisibleColumnsCleanedTable(CleanedRenderedColumns.map(col => col.id)); // Set visible columns for cleaned table
    }
  }, [origPreviewData, cleanedPreviewData]); // When previewDatas change, run this hook
  

  // State handling column management. NOT IMPLEMENTED. REFACTORING NEEDED
  // Original Table
  const [isManageColumnsOpenOrigTable, setIsManageColumnsOpenOrigTable] = useState(false);

  const handleManageColumnsOpenOrigTable = () => setIsManageColumnsOpenOrigTable(true);
  const handleManageColumnsCloseOrigTable = () => setIsManageColumnsOpenOrigTable(false);
  
  const toggleColumnOrigTable = (columnId: string) => {
    setVisibleColumnsOrigTable(prev =>
      prev.includes(columnId) ? prev.filter(id => id !== columnId) : [...prev, columnId]
    );
  };
  const toggleColumn = (columnId: string) => {
    setVisibleColumns(prev =>
      prev.includes(columnId) ? prev.filter(id => id !== columnId) : [...prev, columnId]
    );
  };


  // Initialization of Columns
  const [columns, setColumns] = useState<Column[]>([]); 
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  // Cleaned Table
  const [isManageColumnsOpenCleanedTable, setIsManageColumnsOpenCleanedTable] = useState(false);

  const handleManageColumnsOpenCleanedTable = () => setIsManageColumnsOpenCleanedTable(true);
  const handleManageColumnsCloseCleanedTable = () => setIsManageColumnsOpenCleanedTable(false);
  const toggleColumnCleanedTable = (columnId: string) => {
    setVisibleColumnsCleanedTable(prev =>
      prev.includes(columnId) ? prev.filter(id => id !== columnId) : [...prev, columnId]
    );
  };

  // Select All functionality. NOT IMPLEMENTED. REFACTORING NEEDED
  const allSelected = visibleColumns.length === columns.length; // If the number of visible columns is equal to the full length of columns, it means that all columns are visible.
  const handleSelectAll = () => {
    if (allSelected) {
      setVisibleColumns([]);
    } else {
      setVisibleColumns(columns.map(col => col.id));
    }
  };
  
  // Original Table
  const allSelectedOrigTable = visibleColumnsOrigTable.length === columnsOrigTable.length; // If the number of visible columns is equal to the full length of columns, it means that all columns are visible.
  const handleSelectAllOrigTable = () => {
    if (allSelectedOrigTable) {
      setVisibleColumnsOrigTable([]);
    } else {
      setVisibleColumnsOrigTable(columnsOrigTable.map(col => col.id));
    }
  };

  // Cleaned Table
  const allSelectedCleanedTable = visibleColumnsCleanedTable.length === columnsCleanedTable.length; // If the number of visible columns is equal to the full length of columns, it means that all columns are visible.
  const handleSelectAllCleanedTable = () => {
    if (allSelectedCleanedTable) {
      setVisibleColumnsCleanedTable([]);
    } else {
      setVisibleColumnsCleanedTable(columnsCleanedTable.map(col => col.id));
    }
  };

  // Sorting state. REFACTORING NEEDED
  type Order = 'asc' | 'desc';

  // Original Table
  const [orderOrigTable, setOrderOrigTable] = useState<Order>('asc');
  const [orderByOrigTable, setOrderByOrigTable] = useState<string>(columnsOrigTable[0]?.id || '');

  const handleRequestSortOrigTable = (property: string) => {
    const isAsc = orderByOrigTable === property && orderOrigTable === 'asc';
    setOrderOrigTable(isAsc ? 'desc' : 'asc');
    setOrderByOrigTable(property);
  };

  const comparatorOrigTable = useMemo(() => (
    (a: any, b: any) => {
      if (b[orderByOrigTable] < a[orderByOrigTable]) return orderOrigTable === 'desc' ? -1 : 1;
      if (b[orderByOrigTable] > a[orderByOrigTable]) return orderOrigTable === 'desc' ? 1 : -1;
      return 0;
    }
  ), [orderOrigTable, orderByOrigTable]);

  const sortedDataOrigTable = useMemo(() => (
    [...origPreviewData.data].sort(comparatorOrigTable)
  ), [origPreviewData.data, comparatorOrigTable]);

  // Cleaned Table
  const [orderCleanedTable, setOrderCleanedTable] = useState<Order>('asc');
  const [orderByCleanedTable, setOrderByCleanedTable] = useState<string>(columnsCleanedTable[0]?.id || '');

  const handleRequestSortCleanedTable = (property: string) => {
    const isAsc = orderByCleanedTable === property && orderCleanedTable === 'asc';
    setOrderCleanedTable(isAsc ? 'desc' : 'asc');
    setOrderByCleanedTable(property);
  };

  const comparatorCleanedTable = useMemo(() => (
    (a: any, b: any) => {
      if (b[orderByCleanedTable] < a[orderByCleanedTable]) return orderCleanedTable === 'desc' ? -1 : 1;
      if (b[orderByCleanedTable] > a[orderByCleanedTable]) return orderCleanedTable === 'desc' ? 1 : -1;
      return 0;
    }
  ), [orderCleanedTable, orderByCleanedTable]);

  const sortedDataCleanedTable = useMemo(() => (
    [...cleanedPreviewData.data].sort(comparatorCleanedTable)
  ), [cleanedPreviewData.data, comparatorCleanedTable]);

  
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => setIsFullscreen(prev => !prev);

  // Original Table
  const [isFullscreenOrigTable, setIsFullscreenOrigTable] = useState(false);
  const toggleFullscreenOrigTable = () => setIsFullscreenOrigTable(prev => !prev);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenOrigTable) setIsFullscreenOrigTable(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenOrigTable]);

  // Cleaned Table
  const [isFullscreenCleanedTable, setIsFullscreenCleanedTable] = useState(false);
  const toggleFullscreenCleanedTable = () => setIsFullscreenCleanedTable(prev => !prev);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenCleanedTable) setIsFullscreenCleanedTable(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenCleanedTable]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "grey.100", // Uses theme's background color
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Main Content */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          paddingX: { xs: 3, sm: 6 },
          paddingY: 4,
        }}
      >
      {/* Original Data Section */}
      <Box sx={{ marginBottom: 5 }}>
        <Typography
          variant="h5"
          align="center"
          sx={{
            fontWeight: "bold",
            color: "grey.800",
            textTransform: "uppercase",
            marginBottom: 2,
            fontSize: "2.25rem",
          }}
        >
          Original {fileName}
        </Typography>

        {/* Manage Columns Button and Fullscreen Toggle Button below the title */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center", 
            gap: 2, 
            marginBottom: 3,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          {/* Manage Columns Button */}
          <Button
            variant="outlined"
            onClick={handleManageColumnsOpenOrigTable}
            aria-controls={isManageColumnsOpenOrigTable ? 'manage-columns-dialog' : undefined}
            aria-haspopup="true"
            aria-expanded={isManageColumnsOpenOrigTable ? 'true' : undefined}
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
        </Box>

        <div className={`rounded-lg w-full shadow-sm transition-all duration-300 overflow-x-auto`}>
          <DataTable
            columns={columnsOrigTable}
            data={sortedDataOrigTable}
            visibleColumns={visibleColumnsOrigTable}
            order={orderOrigTable}
            orderBy={orderByOrigTable}
            onRequestSort={handleRequestSortOrigTable}
            page={pageOrigTable}
            rowsPerPage={rowsPerPageOrigTable}
            onPageChange={handleChangePageOrigTable}
            onRowsPerPageChange={handleChangeRowsPerPageOrigTable}
          />
        </div>

        <IconButton
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "grey.700", // Uses theme's grey.700
          }}
        >
          <ExpandIcon />
        </IconButton>
      </Box>

      {/* Fullscreen Modal */}
      <FullscreenModal
        open={isFullscreen}
        onClose={toggleFullscreen}
        columns={columnsOrigTable}
        data={sortedDataOrigTable}
        visibleColumns={visibleColumnsOrigTable}
        order={orderOrigTable}
        orderBy={orderByOrigTable}
        onRequestSort={handleRequestSortOrigTable}
        page={pageOrigTable}
        rowsPerPage={rowsPerPageOrigTable}
        onPageChange={handleChangePageOrigTable}
        onRowsPerPageChange={handleChangeRowsPerPageOrigTable}
      />

      {/* Manage Columns Dialog */}
      <ManageColumnsDialog
        open={isManageColumnsOpenOrigTable}
        onClose={handleManageColumnsCloseOrigTable}
        columns={columnsOrigTable}
        visibleColumns={visibleColumnsOrigTable}
        toggleColumn={toggleColumnOrigTable}
        allSelected={allSelectedOrigTable}
        handleSelectAll={handleSelectAllOrigTable}
      />

      {/* Cleaned Data Section */}
      <Box sx={{ marginBottom: 5 }}>
        <Typography
          variant="h5"
          align="center"
          sx={{
            fontWeight: "bold",
            color: "grey.700", // Uses theme's grey.700
            textTransform: "uppercase",
            marginBottom: 2,
            fontSize: "2.25rem",
          }}
        >
          Cleaned {fileName}
        </Typography>

        {/* Manage Columns Button and Fullscreen Toggle Button below the title */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center", // Center the buttons horizontally
            gap: 2, // Space between buttons
            marginBottom: 3, // Space between title and table
            flexDirection: { xs: "column", sm: "row" }, // Stack buttons on smaller screens
          }}
        >
          {/* Manage Columns Button */}
          <Button
            variant="outlined"
            onClick={handleManageColumnsOpenCleanedTable}
            aria-controls={isManageColumnsOpenCleanedTable ? 'manage-columns-dialog' : undefined}
            aria-haspopup="true"
            aria-expanded={isManageColumnsOpenCleanedTable ? 'true' : undefined}
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
        </Box>

        {/* Table for Cleaned Data */}
        <div className={`rounded-lg w-full shadow-sm transition-all duration-300 overflow-x-auto`}>
          <DataTable
            columns={columnsCleanedTable}
            data={sortedDataCleanedTable}
            visibleColumns={visibleColumnsCleanedTable}
            order={orderCleanedTable}
            orderBy={orderByCleanedTable}
            onRequestSort={handleRequestSortCleanedTable}
            page={pageCleanedTable}
            rowsPerPage={rowsPerPageCleanedTable}
            onPageChange={handleChangePageCleanedTable}
            onRowsPerPageChange={handleChangeRowsPerPageCleanedTable}
          />
        </div>

        <IconButton
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "grey.700", // Uses theme's grey.700
          }}
        >
          <ExpandIcon />
        </IconButton>
      </Box>

      {/* Fullscreen Modal for Cleaned Data */}
      <FullscreenModal
        open={isFullscreen}
        onClose={toggleFullscreen}
        columns={columnsCleanedTable}
        data={sortedDataCleanedTable}
        visibleColumns={visibleColumnsCleanedTable}
        order={orderCleanedTable}
        orderBy={orderByCleanedTable}
        onRequestSort={handleRequestSortCleanedTable}
        page={pageCleanedTable}
        rowsPerPage={rowsPerPageCleanedTable}
        onPageChange={handleChangePageCleanedTable}
        onRowsPerPageChange={handleChangeRowsPerPageCleanedTable}
      />

      {/* Manage Columns Dialog for Cleaned Data */}
      <ManageColumnsDialog
        open={isManageColumnsOpenCleanedTable}
        onClose={handleManageColumnsCloseCleanedTable}
        columns={columnsCleanedTable}
        visibleColumns={visibleColumnsCleanedTable}
        toggleColumn={toggleColumnCleanedTable}
        allSelected={allSelectedCleanedTable}
        handleSelectAll={handleSelectAllCleanedTable}
      />

        {/* Summary of Changes Section */}
        <Box sx={{ marginBottom: 6 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "grey.800", // Uses theme's grey.800
              marginBottom: 2,
              fontSize: "1.75rem",
            }}
          >
            What's the Difference?
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontWeight: "medium",
              color: "grey.800", // Uses theme's grey.800
              marginBottom: 2,
              fontSize: "1rem",
            }}
          >
            In cleaning <b>{fileName}</b> we performed the following cleaning steps:
          </Typography>
          <SummaryChanges summaryChangesData={summaryChangesData} />
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" }, // Stack vertically on xs, row on sm+
            alignItems: { xs: "flex-start", sm: "center" }, // Left align on xs, center on sm+
            justifyContent: { xs: "flex-start", sm: "flex-end" }, // Start on xs, end on sm+
            gap: 2,
          }}
        >
          <Button
            disableElevation
            variant="outlined"

            onClick={() => handleDeleteAndNavigate(visitorId)}

            sx={{
              borderColor: "primary.main", // Custom border color
              color: "grey.800", // Custom text color
              "&:hover": {
                backgroundColor: "primary.main", // Custom hover border color
                color: "white", // Custom hover text color
                borderColor: "primary.main",
              },
              fontWeight: "bold",
              padding: "5px 15px",
              width: { xs: "100%", sm: "auto" }, // Full width on mobile
            }}
          >
            Go Back
          </Button>
          <Button
            disableElevation
            variant="outlined"
            onClick={() => handleDownloadCleanedCSV(visitorId)}
            sx={{
              borderColor: "primary.main", 
              color: "grey.800", 
              "&:hover": {
                backgroundColor: "primary.main",
                color: "white", 
                borderColor: "primary.main",
              },
              fontWeight: "bold",
              padding: "5px 15px",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Save as CSV File
          </Button>
          <Button
            disableElevation
            variant="contained"
            onClick={() => router.push("/report")}
            sx={{
              backgroundColor: "grey.700", // Uses theme's primary.main
              "&:hover": { backgroundColor: "primary.main" }, // Uses theme's primary.dark
              color: "white",
              fontWeight: "bold",
              padding: "10px 20px",
              width: { xs: "100%", sm: "auto" }, // Full width on mobile
            }}
          >
            Proceed to Report Creation
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
