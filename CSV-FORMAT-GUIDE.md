# CSV Format Guide

This guide explains the CSV format requirements for uploading attendance and syllabus data to Compliance Companion.

## Required Column

Your CSV file MUST contain at least one of these column headers:
- `percentage`
- `percent`
- `value`

The system will automatically calculate the average of all numeric values in this column.

## Supported Formats

### Format 1: Simple Percentage Column
```csv
percentage
85.5
92.0
78.5
95.0
```

### Format 2: With Student/Topic IDs
```csv
id,percentage
001,85.5
002,92.0
003,78.5
```

### Format 3: With Additional Information
```csv
student_id,name,percentage
001,John Doe,85.5
002,Jane Smith,92.0
003,Bob Johnson,78.5
```

### Format 4: Using "percent" or "value"
```csv
topic,value
Introduction,100
Arrays,95
Trees,90
```

## Important Notes

1. The column name is case-insensitive (percentage, Percentage, PERCENTAGE all work)
2. Only the percentage/percent/value column is used for calculations
3. Other columns are ignored but can be included for your reference
4. Decimal values are supported (e.g., 85.5, 92.3)
5. The system calculates the average of all values automatically

## Sample Files

Two sample CSV files are included in this project:
- `sample-attendance.csv` - Example attendance data
- `sample-syllabus.csv` - Example syllabus coverage data

## Validation Rules

- File must be in CSV format
- Must contain at least one of the required column headers
- At least one valid numeric value must be present
- Invalid rows or non-numeric values are skipped
- The average is calculated from all valid numeric values

## Tips

- Keep your CSV files simple and clean
- Remove any special characters or formatting
- Use plain text CSV format (not Excel XLSX)
- Test with sample files first
- Check the upload history for validation errors

## What Happens After Upload

1. CSV is parsed and validated
2. Average percentage is calculated
3. New course is created with the calculated percentages
4. Compliance percentage is automatically computed
5. Status is assigned (Compliant/Pending/At-Risk)
6. Reminders are generated if compliance is below 75%

## Need Help?

If your CSV upload fails:
1. Check that you have the required column header
2. Verify all percentage values are numeric
3. Ensure the file is saved as CSV (not Excel)
4. Look at the upload history for specific error messages
5. Try using one of the sample files to verify the system is working
