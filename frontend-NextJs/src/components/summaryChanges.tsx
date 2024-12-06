import React from 'react';
import Typography from '@mui/material/Typography';

interface SummaryChangesData {
  data: {
    rows_removed: number | null;
    missing_values_replaced: number | null;
    column_changes: { [key: string]: number | null };
    removed_columns: string[];
  };
}

const SummaryChanges: React.FC<{ summaryChangesData: SummaryChangesData }> = ({ summaryChangesData }) => {
    console.log("SummaryChanges received props:", summaryChangesData); 

    if (!summaryChangesData.data) {
        return <div>Loading...</div>;  
    }
    const {rows_removed, missing_values_replaced, column_changes, removed_columns } = summaryChangesData.data;

    // Check if everything is null or empty
    const isClean = rows_removed === null && missing_values_replaced === null && Object.keys(column_changes).length === 0 && removed_columns.length === 0;

    if (isClean) {
        return <div><span>Your data is already clean! (<b>No Duplicates</b>, or <b>Any Missing Values found</b>.)</span></div>;
    }

    return (

    <div>
        <Typography variant="body1" sx={{ color: 'grey.800', marginBottom: 0, lineHeight: '1.8' }}>
            {rows_removed!== null ? <span>Step 1: We removed <b>{rows_removed}</b> duplicate rows.</span> : null}
        </Typography>
        <Typography variant="body1" sx={{ color: 'grey.800', marginBottom: 0, lineHeight: '1.8' }}>
            {missing_values_replaced !== null ? <span>Step 2: We replaced <b>{missing_values_replaced}</b> missing values.</span> : null}
        </Typography>
        <Typography variant="body1" sx={{ color: 'grey.800', marginBottom: 0, lineHeight: '1.8' }}>
        {column_changes && Object.keys(column_changes).length > 0 ? (
            <span>Step 3: We identified all columns we changed below, with a count of values or cells modified.</span>
        ) : null
        }

        </Typography>
        {column_changes && Object.entries(column_changes).map(([column, changes]) => (
            <Typography key={column} variant="body1" sx={{ color: 'grey.700', marginBottom: 0, marginLeft: 2 }}>
                {<span> - {column}: <b>{changes}</b> changed values</span>}
            </Typography>
        ))}
        <Typography variant="body1" sx={{ color: 'grey.800', marginTop: 1, lineHeight: '1.8' }}>
            {removed_columns && removed_columns.length > 0 ? <span>Lastly, we also <b>{removed_columns.length}</b> removed columns that did not contain any data: <b>{removed_columns.join(', ')}</b></span> : null}
        </Typography>
    </div>

    );
};

export default SummaryChanges;
