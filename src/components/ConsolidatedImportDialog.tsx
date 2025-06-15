
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { enumOptions } from '@/lib/schema';

interface ConsolidatedImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
}

interface ValidationError {
  row: number;
  field: string;
  issue: string;
  value: any;
}

export const ConsolidatedImportDialog: React.FC<ConsolidatedImportDialogProps> = ({ 
  open, 
  onClose, 
  onImport 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [error, setError] = useState<string | null>(null);

  const downloadTemplate = () => {
    // Create template that matches the collection structure exactly
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    
    const template = [];
    
    // Create sample records for different age brackets and genders - with parentheses to prevent date conversion
    const ageBrackets = ["(UNDER 1)", "(1-4)", "(5-9)", "(10-14)", "(15-19)", "(20-24)", "(25-29)", "(30-34)", "(35-39)", "(40-44)", "(45-49)", "(50-54)", "(55-59)", "(60-64)", "(65-69)", "(70-74)", "(75-79)", "(80-84)", "(85-89)", "(90-above)"];
    const genders = ["Male", "Female"];
    
    // Add sample data for first few barangays
    enumOptions.barangay.slice(0, 3).forEach(barangay => {
      ageBrackets.forEach(ageBracket => {
        genders.forEach(gender => {
          template.push({
            barangay: barangay,
            age_bracket: ageBracket,
            gender: gender,
            year: currentYear,
            month: currentMonth,
            count: Math.floor(Math.random() * 50) // Sample data
          });
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(template);
    
    // Set column widths and format age_bracket as text to prevent Excel conversion
    const columnWidths = [
      { wch: 15 }, // barangay
      { wch: 12 }, // age_bracket
      { wch: 8 },  // gender
      { wch: 6 },  // year
      { wch: 12 }, // month
      { wch: 8 }   // count
    ];
    worksheet['!cols'] = columnWidths;

    // Force age_bracket column to be text format
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let row = 1; row <= range.e.r; row++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: 1 }); // Column B (age_bracket)
      if (worksheet[cellRef]) {
        worksheet[cellRef].t = 's'; // Force string type
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Consolidated Data Template");

    XLSX.writeFile(workbook, "consolidated_data_template.xlsx");
  };

  // Normalize age bracket to handle different formats including parentheses
  const normalizeAgeBracket = (value: any): string => {
    if (!value) return '';
    
    let str = String(value).trim();
    
    // Remove parentheses if present
    str = str.replace(/[()]/g, '');
    
    // Handle Excel date conversion back to age bracket
    if (str.includes('/') || str.includes('-') && str.length > 5) {
      console.log('Detected potential date conversion for age bracket:', str);
      // Try to extract numbers from date-like strings
      const numbers = str.match(/\d+/g);
      if (numbers && numbers.length >= 2) {
        const firstNum = parseInt(numbers[0]);
        const secondNum = parseInt(numbers[1]);
        if (firstNum < 100 && secondNum < 100) {
          str = `${Math.min(firstNum, secondNum)}-${Math.max(firstNum, secondNum)}`;
        }
      }
    }
    
    // Handle various age bracket formats and map to new format
    if (str.match(/^\d+\s*-\s*\d+$/)) {
      // Format like "0-4", "5 - 9", etc.
      const parts = str.split(/\s*-\s*/);
      const start = parseInt(parts[0]);
      const end = parseInt(parts[1]);
      
      // Map old format to new format
      if (start === 0 && end <= 4) return "1-4";
      if (start === 5 && end === 9) return "5-9";
      if (start === 10 && end === 14) return "10-14";
      if (start === 15 && end === 19) return "15-19";
      if (start === 20 && end === 24) return "20-24";
      if (start === 25 && end === 29) return "25-29";
      if (start === 30 && end === 34) return "30-34";
      if (start === 35 && end === 39) return "35-39";
      if (start === 40 && end === 44) return "40-44";
      if (start === 45 && end === 49) return "45-49";
      if (start === 50 && end === 54) return "50-54";
      if (start === 55 && end === 59) return "55-59";
      if (start === 60 && end === 64) return "60-64";
      if (start === 65 && end === 69) return "65-69";
      if (start === 70 && end === 74) return "70-74";
      if (start === 75 && end === 79) return "75-79";
      if (start === 80 && end === 84) return "80-84";
      if (start === 85 && end <= 89) return "85-89";
      
      return `${start}-${end}`;
    } else if (str.match(/^\d+\+$/) || str === '85+' || str === '85 +') {
      return '90-above';
    } else if (str.toLowerCase().includes('under') || str === '0' || str === 'UNDER 1') {
      return 'UNDER 1';
    } else if (str === '90-above' || str.toLowerCase().includes('above')) {
      return '90-above';
    }
    
    return str;
  };

  const validateData = (data: any[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const validAgeBrackets = ["UNDER 1", "1-4", "5-9", "10-14", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75-79", "80-84", "85-89", "90-above"];
    const validGenders = ["Male", "Female"];
    const validMonths = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    data.forEach((row, index) => {
      // Check if barangay is valid
      if (!row.barangay || !enumOptions.barangay.includes(row.barangay)) {
        errors.push({
          row: index + 1,
          field: "barangay",
          issue: `Invalid barangay name. Must be one of: ${enumOptions.barangay.join(', ')}`,
          value: row.barangay
        });
      }

      // Check age_bracket
      if (!row.age_bracket || !validAgeBrackets.includes(row.age_bracket)) {
        errors.push({
          row: index + 1,
          field: "age_bracket",
          issue: `Invalid age bracket. Must be one of: ${validAgeBrackets.join(', ')}`,
          value: row.age_bracket
        });
      }

      // Check gender
      if (!row.gender || !validGenders.includes(row.gender)) {
        errors.push({
          row: index + 1,
          field: "gender",
          issue: `Invalid gender. Must be 'Male' or 'Female'`,
          value: row.gender
        });
      }

      // Check year
      const year = Number(row.year);
      if (!year || isNaN(year) || year < 2020 || year > 2030) {
        errors.push({
          row: index + 1,
          field: "year",
          issue: "Year must be a number between 2020 and 2030",
          value: row.year
        });
      }

      // Check month
      if (!row.month || !validMonths.includes(row.month)) {
        errors.push({
          row: index + 1,
          field: "month",
          issue: `Invalid month. Must be one of: ${validMonths.join(', ')}`,
          value: row.month
        });
      }

      // Check count
      const count = Number(row.count);
      if (isNaN(count) || count < 0) {
        errors.push({
          row: index + 1,
          field: "count",
          issue: "Count must be a non-negative number",
          value: row.count
        });
      }
    });

    return errors;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
    setParsedData([]);
    setValidationErrors([]);
    setError(null);
  };

  const parseFile = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: false, cellText: false });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });

        console.log('Raw parsed data:', jsonData);
        
        // Transform the data to match collection structure with improved age_bracket handling
        const transformedData = (jsonData as any[]).map((row, index) => {
          const normalizedAgeBracket = normalizeAgeBracket(row.age_bracket);
          
          console.log(`Row ${index + 1} age_bracket transformation:`, {
            original: row.age_bracket,
            normalized: normalizedAgeBracket
          });

          return {
            barangay: String(row.barangay || '').trim(),
            age_bracket: normalizedAgeBracket,
            gender: String(row.gender || '').trim(),
            year: parseInt(String(row.year)) || new Date().getFullYear(),
            month: String(row.month || '').trim(),
            count: parseInt(String(row.count)) || 0
          };
        });
         
        console.log('Transformed data:', transformedData);
        setParsedData(transformedData);

        // Validate the transformed data
        const errors = validateData(transformedData);
        setValidationErrors(errors);

        if (errors.length === 0) {
          setError(null);
        } else {
          setError(`Found ${errors.length} validation errors. Please fix them before importing.`);
        }
      } catch (err) {
        console.error('Error parsing file:', err);
        setError('Error parsing Excel file. Please check the file format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = () => {
    if (validationErrors.length > 0) {
      setError('Please fix all validation errors before importing.');
      return;
    }

    onImport(parsedData);
    onClose();
  };

  const resetDialog = () => {
    setFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) { resetDialog(); onClose(); } }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Consolidated Data</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Template Download */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Download Template</h3>
                  <p className="text-sm text-gray-600">
                    Get the correct Excel format with columns: barangay, age_bracket (with parentheses to prevent date conversion), gender, year, month, count
                  </p>
                </div>
                <Button onClick={downloadTemplate} variant="outline" className="flex items-center gap-2">
                  <Download size={16} />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Excel File</label>
            <div className="flex items-center gap-2">
              <Input 
                type="file"
                accept=".xlsx, .xls" 
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button onClick={parseFile} disabled={!file} className="flex items-center gap-2">
                <Upload size={16} />
                Parse
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle size={16} />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {parsedData.length > 0 && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="text-sm">
                  <div>Parsed Records: <span className="font-medium">{parsedData.length}</span></div>
                  <div className="text-red-600">Validation Errors: <span className="font-medium">{validationErrors.length}</span></div>
                </div>
              </div>

              {validationErrors.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-4">
                    <h3 className="font-medium text-red-800 mb-3">Validation Errors</h3>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {validationErrors.slice(0, 10).map((error, index) => (
                        <div key={index} className="text-sm p-2 bg-white rounded border">
                          <div className="font-medium">Row {error.row}: {error.field}</div>
                          <div className="text-gray-600">{error.issue}</div>
                          <div className="text-xs text-gray-500">Value: {String(error.value)}</div>
                        </div>
                      ))}
                      {validationErrors.length > 10 && (
                        <div className="text-sm text-gray-500">...and {validationErrors.length - 10} more errors</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Preview of transformed data */}
              {parsedData.length > 0 && validationErrors.length === 0 && (
                <Card>
                  <CardContent className="pt-4">
                    <h3 className="font-medium mb-3">Preview (First 5 records)</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Barangay</th>
                            <th className="text-left p-2">Age Bracket</th>
                            <th className="text-left p-2">Gender</th>
                            <th className="text-left p-2">Year</th>
                            <th className="text-left p-2">Month</th>
                            <th className="text-left p-2">Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedData.slice(0, 5).map((record, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{record.barangay}</td>
                              <td className="p-2">{record.age_bracket}</td>
                              <td className="p-2">{record.gender}</td>
                              <td className="p-2">{record.year}</td>
                              <td className="p-2">{record.month}</td>
                              <td className="p-2">{record.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetDialog(); onClose(); }}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={parsedData.length === 0 || validationErrors.length > 0}
          >
            Import Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
