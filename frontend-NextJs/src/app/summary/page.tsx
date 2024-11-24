"use client";

import { useGlobalContext } from "@/context/GlobalContext";
import { useEffect } from "react";
import { redirect, useRouter } from 'next/navigation';
import StatRow from "@/components/StatRow";
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import React from "react";


export default function SummaryPage() {
  const { fileData, setFileData } = useGlobalContext();
  const router = useRouter();
  
  interface Column {
    id: string;
    label: string;
    minWidth?: number;
    align?: 'left';
    format?: (value: number) => string;
  }
  
  // Mapping to Column array
  const columns: Column[] = Object.entries(fileData.headers_types).map(([key, type]) => {
    const column: Column = {
      id: key, 
      label: key, 
      minWidth: 170,
      align: 'left'
    };
  
    // Add alignment and format based on type
    if (type === "number") {
      column.format = (value: number) => value.toLocaleString(); // Format numbers with commas
    }
  
    return column;
  });

  const stats = [
    { label: "Number of Rows", value: fileData?.row_count },
    { label: "Number of Columns", value: fileData?.column_count },
    { label: "Number of Duplicate Values", value: fileData?.duplicate_count },
    { label: "Number of Unique Values", value: fileData?.unique_count },
    { label: "Number of Blank Cells", value: fileData?.total_number_blank_cells },
  ]; // Does not include numeric data, because each numeric column can have different set of numeric data mean median mode etc.

  // Redirect to home, if filename is not set, meaning there is no filedata
  useEffect(() => {
    if (!fileData.name) {
      router.push("/home"); 
    }
  }, [fileData, router]);

  // Prevent rendering if no file name is set
  if (!fileData.name) {
    return null; // Do not render anything until redirection
  }


  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Left Panel */}
      <div className="flex-1 p-6 lg:p-12 bg-gray-100">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6">Summary</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 gap-x-8">
          {/* Rows */}
          {stats.map((stat, idx) => (
            <StatRow key={idx} label={stat.label} value={stat.value} />
          ))}
        </div>
        <div className="mt-8 flex flex-col items-start">
          <h2 className="text-gray-800 font-bold text-lg mb-2 text-center">
             Previewing "{fileData.name}" 
          </h2>
          <div className="rounded-lg h-64 w-full lg:w-full shadow-sm">
            <Paper sx={{ width: '100%', overflowX: 'auto', flexGrow: 1 }}>
              <TableContainer sx={{ maxHeight: 440}}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          style={{ minWidth: column.minWidth }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fileData.data
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, rowIndex) => (
                        <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                          {columns.map((column, colIndex) => {
                            const value = row[column.id];
                            return (
                              <TableCell key={`${rowIndex}-${colIndex}`} align={column.align}>
                                {column.format && typeof value === 'number' ? column.format(value) : value || ""}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={fileData.data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </div>
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
