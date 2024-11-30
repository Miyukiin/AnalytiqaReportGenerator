// components/DataTable.tsx

import React, { ChangeEvent } from 'react';
import {Paper,TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  TableBody,
  TablePagination,
} from '@mui/material';

type Order = 'asc' | 'desc';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => string;
}

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

export default DataTable;
