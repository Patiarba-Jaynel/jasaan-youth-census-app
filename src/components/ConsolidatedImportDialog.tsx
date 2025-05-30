
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
    const template = [{
      BARANGAY: "APLAYA",
      "UNDER 1 M": 62,
      "UNDER 1 F": 61,
      "UNDER 1 TOTAL": 123,
      "1-4 M": 273,
      "1-4 F": 265,
      "1-4 TOTAL": 538,
      "5-9 M": 297,
      "5-9 F": 310,
      "5-9 TOTAL": 607,
      "10-14 M": 380,
      "10-14 F": 299,
      "10-14 TOTAL": 679,
      "15-19 M": 365,
      "15-19 F": 319,
      "15-19 TOTAL": 684,
      "20-24 M": 277,
      "20-24 F": 339,
      "20-24 TOTAL": 616,
      "25-29 M": 295,
      "25-29 F": 0,
      "25-29 TOTAL": 295,
      "TOTAL M": 1949,
      "TOTAL F": 1593,
      "TOTAL": 3542
    }];

    // Add a few more sample rows
    enumOptions.barangay.slice(1, 4).forEach(barangay => {
      template.push({
        BARANGAY: barangay,
        "UNDER 1 M": 0,
        "UNDER 1 F": 0,
        "UNDER 1 TOTAL": 0,
        "1-4 M": 0,
        "1-4 F": 0,
        "1-4 TOTAL": 0,
        "5-9 M": 0,
        "5-9 F": 0,
        "5-9 TOTAL": 0,
        "10-14 M": 0,
        "10-14 F": 0,
        "10-14 TOTAL": 0,
        "15-19 M": 0,
        "15-19 F": 0,
        "15-19 TOTAL": 0,
        "20-24 M": 0,
        "20-24 F": 0,
        "20-24 TOTAL": 0,
        "25-29 M": 0,
        "25-29 F": 0,
        "25-29 TOTAL": 0,
        "TOTAL M": 0,
        "TOTAL F": 0,
        "TOTAL": 0
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Consolidated Data Template");

    XLSX.writeFile(workbook, "consolidated_data_template.xlsx");
  };

  const validateData = (data: any[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const requiredColumns = [
      "BARANGAY", "UNDER 1 M", "UNDER 1 F", "1-4 M", "1-4 F", 
      "5-9 M", "5-9 F", "10-14 M", "10-14 F", "15-19 M", "15-19 F",
      "20-24 M", "20-24 F", "25-29 M", "25-29 F"
    ];

    data.forEach((row, index) => {
      // Check if barangay is valid
      if (!enumOptions.barangay.includes(row.BARANGAY)) {
        errors.push({
          row: index + 1,
          field: "BARANGAY",
          issue: `Invalid barangay name. Must be one of: ${enumOptions.barangay.join(', ')}`,
          value: row.BARANGAY
        });
      }

      // Check required columns
      requiredColumns.forEach(column => {
        if (column === "BARANGAY") return;
        
        const value = row[column];
        if (value === undefined || value === null || value === '') {
          errors.push({
            row: index + 1,
            field: column,
            issue: "Missing required value",
            value: value
          });
        } else if (isNaN(Number(value)) || Number(value) < 0) {
          errors.push({
            row: index + 1,
            field: column,
            issue: "Must be a non-negative number",
            value: value
          });
        }
      });

      // Validate totals if provided
      const ageGroups = ["UNDER 1", "1-4", "5-9", "10-14", "15-19", "20-24", "25-29"];
      ageGroups.forEach(ageGroup => {
        const maleKey = `${ageGroup} M`;
        const femaleKey = `${ageGroup} F`;
        const totalKey = `${ageGroup} TOTAL`;
        
        const maleVal = Number(row[maleKey]) || 0;
        const femaleVal = Number(row[femaleKey]) || 0;
        const totalVal = Number(row[totalKey]) || 0;
        
        if (totalVal !== 0 && totalVal !== (maleVal + femaleVal)) {
          errors.push({
            row: index + 1,
            field: totalKey,
            issue: `Total (${totalVal}) doesn't match sum of Male (${maleVal}) + Female (${femaleVal})`,
            value: totalVal
          });
        }
      });
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
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log('Parsed data:', jsonData);
        setParsedData(jsonData as any[]);

        // Validate the data
        const errors = validateData(jsonData as any[]);
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
                  <p className="text-sm text-gray-600">Get the correct Excel format for importing consolidated data</p>
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
