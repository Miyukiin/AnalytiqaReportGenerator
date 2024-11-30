// components/FullscreenModal.tsx

import React, { ChangeEvent } from 'react';
import {
  Dialog,
  AppBar,
  Toolbar,
  Typography,
  DialogTitle,
  DialogContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseCircleIcon from "@/components/icons/CloseCircleIcon";
import DataTable from './DataTable';

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
              sx={{ ml: 2, flex: 1, color: (theme) => theme.palette.grey[700], fontWeight: 'bold' }}
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
          <Typography sx={{ color: (theme) => theme.palette.grey[700], fontWeight: 'bold' }}>
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

export default FullscreenModal;
