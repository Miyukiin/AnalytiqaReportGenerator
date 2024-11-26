// pages/SummaryPage.tsx

"use client";

import React, { useEffect, useState, useMemo, ChangeEvent } from "react";
import { useRouter } from 'next/navigation';
import { useGlobalContext } from "@/context/GlobalContext";
import StatRow from "@/components/StatRow";
import CloseCircleIcon from "@/components/icons/CloseCircleIcon";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme,
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
  value: number;
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

  const stats: Stat[] = [
    { label: "Number of Rows", value: fileData.row_count },
    { label: "Number of Columns", value: fileData.column_count },
    { label: "Number of Duplicate Values", value: fileData.duplicate_count },
    { label: "Number of Unique Values", value: fileData.unique_count },
    { label: "Number of Blank Cells", value: fileData.total_number_blank_cells },
  ];

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
                  backgroundColor: "grey.700", // Uses theme's primary.main
                  "&:hover": { backgroundColor: "primary.main" }, // Uses theme's primary.dark
                  color: "white",
                  fontWeight: "bold",
                  padding: "5px 12px",
                  width: { xs: "100%", sm: "auto" }, // Full width on mobile
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
                  backgroundColor: "grey.700", // Uses theme's primary.main
                  "&:hover": { backgroundColor: "primary.main" }, // Uses theme's primary.dark
                  color: "white",
                  fontWeight: "bold",
                  padding: "5px 12px",
                  width: { xs: "100%", sm: "auto" }, // Full width on mobile
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

// Reusable DataTable Component
interface DataTableProps {
  columns: Column[];
  data: Array<{ [key: string]: any }>;
  visibleColumns: string[];
  order: Order;
  orderBy: string;
  onRequestSort: (property: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  visibleColumns,
  order,
  orderBy,
  onRequestSort,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => (
  <Paper sx={{ width: '100%', overflow: 'hidden', flexGrow: 1 }}>
    <TableContainer sx={{ maxHeight: 440 }}>
      <Table stickyHeader aria-label="data table" className="min-w-full">
        <TableHead>
          <TableRow>
            {columns.map(column => (
              visibleColumns.includes(column.id) && (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={orderBy === column.id ? order : false}
                  className="whitespace-nowrap"
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : 'asc'}
                    onClick={() => onRequestSort(column.id)}
                  >
                    {column.label}
                    {orderBy === column.id ? (
                      <span className="visually-hidden">
                        {`\u00A0- Sorted ${order === 'desc' ? 'Descending' : 'Ascending'}`}
                      </span>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              )
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, rowIndex) => (
            <TableRow
              hover
              role="checkbox"
              tabIndex={-1}
              key={rowIndex}
              className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              {columns.map(column => (
                visibleColumns.includes(column.id) && (
                  <TableCell key={`${rowIndex}-${column.id}`} align={column.align} className="whitespace-nowrap">
                    {column.format ? column.format(row[column.id]) : row[column.id] || ""}
                  </TableCell>
                )
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <TablePagination
      rowsPerPageOptions={[10, 25, 50, 100]}
      component="div"
      count={data.length}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      className="bg-gray-100"
    />
  </Paper>
);

// NextStepSection Component
interface NextStepSectionProps {
  title: string;
  description: string;
}

const NextStepSection: React.FC<NextStepSectionProps> = ({ title, description }) => (
  <div className="mb-8 flex flex-col items-center text-center">
    <h3 className="font-bold text-lg text-gray-800 mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

// FullscreenModal Component
interface FullscreenModalProps extends DataTableProps {
  open: boolean;
  onClose: () => void;
}

const FullscreenModal: React.FC<FullscreenModalProps> = ({
  open,
  onClose,
  columns,
  data,
  visibleColumns,
  order,
  orderBy,
  onRequestSort,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      aria-labelledby="fullscreen-dialog-title"
      maxWidth="xl"
      fullWidth
    >
      {fullScreen ? (
        <AppBar sx={{ position: 'relative', backgroundColor: '#FFFFFF' }}>
          <Toolbar className="flex justify-between">
          <Typography
              sx={{ ml: 2, flex: 1, color: (theme) => theme.palette.grey[600] }} // Ensures theme-based gray color
              variant="h6"
              component="div"
            >
              Data Table
            </Typography>
            <button
              onClick={onClose}
              className="p-2 bg-transparent border-none cursor-pointer"
              aria-label="Close Fullscreen"
            >
              <CloseCircleIcon className="w-6 h-6 text-gray-500 hover:text-red-700" />
            </button>
          </Toolbar>
        </AppBar>
      ) : (
        <DialogTitle id="fullscreen-dialog-title" className="relative">
          <Typography sx={{ color: (theme) => theme.palette.grey[600] }}>
            Data Table
          </Typography>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-2 bg-transparent border-none cursor-pointer"
            aria-label="Close Fullscreen"
          >
            <CloseCircleIcon className="w-6 h-6 text-gray-500 hover:text-red-700" />
          </button>
        </DialogTitle>
      )}
      <DialogContent dividers sx={{ padding: theme.spacing(2) }}>
        <DataTable
          columns={columns}
          data={data}
          visibleColumns={visibleColumns}
          order={order}
          orderBy={orderBy}
          onRequestSort={onRequestSort}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </DialogContent>
    </Dialog>
  );
};

// ManageColumnsDialog Component
interface ManageColumnsDialogProps {
  open: boolean;
  onClose: () => void;
  columns: Column[];
  visibleColumns: string[];
  toggleColumn: (columnId: string) => void;
  allSelected: boolean;
  handleSelectAll: () => void;
}

const ManageColumnsDialog: React.FC<ManageColumnsDialogProps> = ({
  open,
  onClose,
  columns,
  visibleColumns,
  toggleColumn,
  allSelected,
  handleSelectAll,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby="manage-columns-dialog-title"
    fullWidth
    maxWidth="sm"
  >
    <DialogTitle id="manage-columns-dialog-title">Manage Columns</DialogTitle>
    <DialogContent dividers>
      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={allSelected}
              onChange={handleSelectAll}
              color="success"
              indeterminate={visibleColumns.length > 0 && visibleColumns.length < columns.length}
            />
          }
          label="Select All"
        />
      </Box>
      <Box mt={2} sx={{ maxHeight: '400px', overflowY: 'auto' }}>
        <Grid container spacing={1}>
          {columns.map(column => (
            <Grid item xs={12} sm={6} key={column.id}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={visibleColumns.includes(column.id)}
                    onChange={() => toggleColumn(column.id)}
                    name={column.id}
                    color="success"
                  />
                }
                label={column.label}
                sx={{
                  margin: 0,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem',
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary" variant="contained">
        Done
      </Button>
    </DialogActions>
  </Dialog>
);
