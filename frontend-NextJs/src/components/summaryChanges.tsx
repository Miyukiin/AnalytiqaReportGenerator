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
        <Typography variant="body1" sx={{ color: 'grey.800', marginBottom: 2, lineHeight: '1.8' }}>
            {rows_removed!== null ? `Rows removed: ${rows_removed}` : null}
        </Typography>
        <Typography variant="body1" sx={{ color: 'grey.800', marginBottom: 2, lineHeight: '1.8' }}>
            {missing_values_replaced !== null ? `Missing values replaced: ${missing_values_replaced}` : null}
        </Typography>
        <Typography variant="body1" sx={{ color: 'grey.800', marginBottom: 2, lineHeight: '1.8' }}>
            {Object.keys(column_changes).length > 0 ? `Column changes:` : null}
        </Typography>
        {Object.entries(column_changes).map(([column, changes]) => (
            <Typography key={column} variant="body2" sx={{ color: 'grey.700', marginBottom: 1, marginLeft: 2 }}>
                {`- ${column}: ${changes} changes`}
            </Typography>
        ))}
        <Typography variant="body1" sx={{ color: 'grey.800', marginBottom: 2, lineHeight: '1.8' }}>
            {removed_columns.length > 0 ? `Removed columns: ${removed_columns.join(', ')}` : null}
        </Typography>
    </div>

    );
};

export default SummaryChanges;
