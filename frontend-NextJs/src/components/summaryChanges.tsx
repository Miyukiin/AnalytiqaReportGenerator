import React from 'react';
import Typography from '@mui/material/Typography';

interface SummaryChangesData {
  data: {
    rows_removed: number | null;
    missing_values_replaced: number | null;
    column_changes: { [key: string]: number | null };
    removed_columns: string[];
    non_ascii_values: number | null;
  };
}

const SummaryChanges: React.FC<{ summaryChangesData: SummaryChangesData }> = ({ summaryChangesData }) => {
    console.log("SummaryChanges received props:", summaryChangesData); 

    if (!summaryChangesData.data) {
        return <div>Loading...</div>;  
    }
    const {rows_removed, missing_values_replaced, column_changes, removed_columns, non_ascii_values } = summaryChangesData.data;

    // Check if everything is null or empty
    const isClean = rows_removed === null && missing_values_replaced === null && Object.keys(column_changes).length === 0 && removed_columns.length === 0 && non_ascii_values === null;

    if (isClean) {
        return <div><span>Your data is already clean! (<b>No Duplicates</b>, <b>Non-Ascii Values</b> or <b>Any Missing Values found</b>.)</span></div>;
    }
    return (

    <div>
        <Typography variant="body1" sx={{ color: 'grey.800', marginBottom: 0, lineHeight: '1.8' }}>
            {rows_removed && rows_removed!== null ? <span>Step 1: We removed <b>{rows_removed}</b> duplicate rows.</span> : <span> Step 1: No duplicates found. </span>}
        </Typography>
        <Typography variant="body1" sx={{ color: 'grey.800', marginBottom: 0, lineHeight: '1.8' }}>
            {missing_values_replaced && missing_values_replaced !== null ? <span>Step 2: We replaced <b>{missing_values_replaced}</b> missing values.</span> : <span> Step 2: No missing values found. </span>}
        </Typography>
        <Typography variant="body1" sx={{ color: 'grey.800', marginBottom: 0, lineHeight: '1.8' }}>
            {non_ascii_values && non_ascii_values !== null ? <span>Step 3: We removed non-ascii characters from <b>{non_ascii_values}</b> cells.</span> : <span> Step 3: No cells containing non-ascii values found. </span>}
        </Typography>
        <Typography variant="body1" sx={{ color: 'grey.800', marginBottom: 0, lineHeight: '1.8' }}>
            {column_changes && Object.keys(column_changes).length > 0 ? <span>Step 4: We identified all columns we changed below, with a count of values or cells modified.</span> : <span> Step 4: No changes to any values of columns found. </span>}
        </Typography>
        {column_changes && Object.entries(column_changes).map(([column, changes]) => (
            <Typography key={column} variant="body1" sx={{ color: 'grey.700', marginBottom: 0, marginLeft: 2 }}>
                {<span> - {column}: <b>{changes}</b> changed values</span>}
            </Typography>
        ))}
        <Typography variant="body1" sx={{ color: 'grey.800', marginTop: 1, lineHeight: '1.8' }}>
            {removed_columns && removed_columns.length > 0 ? <span>Lastly, we also <b>{removed_columns.length}</b> removed columns that did not contain any data: <b>{removed_columns.join(', ')}</b></span> : <span> Step 5: No empty columns found. </span>}
        </Typography>
        
    </div>

    );
};

export default SummaryChanges;