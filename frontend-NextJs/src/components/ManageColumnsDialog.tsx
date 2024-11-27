// components/ManageColumnsDialog.tsx

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  FormControlLabel,
  Checkbox,
  Grid,
  DialogActions,
  Button,
} from '@mui/material';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => string;
}

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

export default ManageColumnsDialog;
