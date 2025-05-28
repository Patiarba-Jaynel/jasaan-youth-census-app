
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { z } from 'zod';
import { formSchema as YouthSchema } from '@/lib/schema';
import { standardizeRecordFields } from '@/lib/standardize';
import { validateAgeConsistency, validateDropdownValue } from '@/lib/validation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { pbClient } from '@/lib/pb-client';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (records: any[]) => void;
}

interface ValidationIssue {
  row: number;
  field: string;
  issue: string;
  value: any;
  suggestion?: string;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({ open, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [duplicatesInFile, setDuplicatesInFile] = useState<any[]>([]);
  const [validData, setValidData] = useState<any[]>([]);
  const [duplicatesInDb, setDuplicatesInDb] = useState<any[]>([]);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [duplicateAction, setDuplicateAction] = useState<'merge' | 'overwrite' | 'ignore'>('ignore');
  
  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setFile(null);
      setParsedData([]);
      setError(null);
      setDuplicatesInFile([]);
      setValidData([]);
      setDuplicatesInDb([]);
      setValidationIssues([]);
      setShowDuplicateDialog(false);
      setShowValidationDialog(false);
    }
  }, [open]);

  const downloadTemplate = () => {
    const template = [
      {
        name: "Juan Dela Cruz",
        age: "25",
        birthday: "1999-01-15",
        sex: "MALE",
        civil_status: "SINGLE",
        barangay: "Aplaya",
        youth_classification: "OSY",
        youth_age_group: "25-30",
        highest_education: "College",
        work_status: "Employed",
        home_address: "123 Main St, Aplaya",
        email_address: "juan@example.com",
        contact_number: "09123456789",
        registered_voter: "Yes",
        voted_last_election: "Yes",
        attended_kk_assembly: "Yes",
        kk_assemblies_attended: "3"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Youth Census Template");
    XLSX.writeFile(wb, "youth_census_template.xlsx");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    setDuplicatesInFile([]);
    setValidData([]);
    setParsedData([]);
    setDuplicatesInDb([]);
    setValidationIssues([]);
    setFile(selectedFile || null);
  };

  const validateRecord = (record: any, index: number): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];
    
    // Enhanced age and birthday validation
    if (record.age && record.birthday) {
      const age = parseInt(record.age);
      const birthdayStr = typeof record.birthday === 'string' ? record.birthday : record.birthday.toISOString?.()?.split('T')[0];
      const youthAgeGroup = record.youth_age_group;
      
      const ageValidation = validateAgeConsistency(age, birthdayStr, youthAgeGroup);
      
      if (!ageValidation.isValid) {
        ageValidation.errors.forEach(error => {
          issues.push({
            row: index + 1,
            field: 'age/birthday/youth_age_group',
            issue: error,
            value: `Age: ${age}, Birthday: ${birthdayStr}, Age Group: ${youthAgeGroup}`,
            suggestion: 'Ensure age matches birthday and age group'
          });
        });
      }
    }

    // Enhanced dropdown validation for fixed answer fields
    const validOptions: Record<string, readonly string[]> = {
      sex: YouthSchema.shape.sex.options,
      civil_status: YouthSchema.shape.civil_status.options,
      youth_classification: YouthSchema.shape.youth_classification.options,
      youth_age_group: YouthSchema.shape.youth_age_group.options,
      highest_education: YouthSchema.shape.highest_education.options,
      work_status: YouthSchema.shape.work_status.options,
      registered_voter: YouthSchema.shape.registered_voter.options,
      voted_last_election: YouthSchema.shape.voted_last_election.options,
      attended_kk_assembly: YouthSchema.shape.attended_kk_assembly.options,
    };

    Object.entries(validOptions).forEach(([field, options]) => {
      const value = record[field];
      if (value && value !== "N/A") {
        const validation = validateDropdownValue(value, options, field);
        if (!validation.isValid) {
          validation.errors.forEach(error => {
            issues.push({
              row: index + 1,
              field: field,
              issue: error,
              value: value,
              suggestion: `Must be one of: ${options.join(', ')}`
            });
          });
        }
      }
    });

    // Email validation
    if (record.email_address && record.email_address !== "N/A" && !record.email_address.includes('@')) {
      issues.push({
        row: index + 1,
        field: 'email_address',
        issue: 'Invalid email format',
        value: record.email_address,
        suggestion: 'Must contain @ symbol'
      });
    }

    return issues;
  };

  const parseFile = async () => {
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processData(results.data as any[]),
        error: () => setError('Error parsing CSV file.'),
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        processData(jsonData as any[]);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('Unsupported file format. Please upload a CSV or Excel file.');
    }
  };

  const processData = async (data: any[]) => {
    const seen = new Set();
    const duplicatesList: any[] = [];
    const validList: any[] = [];
    const allValidationIssues: ValidationIssue[] = [];

    // First, clean and standardize the data
    const cleanedData = data.map((row, index) => {
      const cleanedRow: any = { originalIndex: index };
      Object.entries(row).forEach(([key, value]) => {
        cleanedRow[key.trim()] = typeof value === 'string' ? value.trim() : value;
      });
      const standardized = standardizeRecordFields(cleanedRow);
      
      // Validate each record
      const issues = validateRecord(standardized, index);
      allValidationIssues.push(...issues);
      
      return standardized;
    });

    setValidationIssues(allValidationIssues);

    // Check for duplicates within the imported file
    for (const record of cleanedData) {
      const result = YouthSchema.safeParse(record);
      if (result.success) {
        const key = `${record.name?.toLowerCase()}|${record.birthday}`;
        
        if (seen.has(key)) {
          duplicatesList.push(record);
        } else {
          seen.add(key);
          validList.push(record);
        }
      }
    }

    setParsedData(cleanedData);
    setDuplicatesInFile(duplicatesList);
    
    // Show validation dialog if there are issues
    if (allValidationIssues.length > 0) {
      setShowValidationDialog(true);
      return;
    }

    // Proceed to check for duplicates in the database
    await checkDatabaseDuplicates(validList);
  };

  const checkDatabaseDuplicates = async (validList: any[]) => {
    if (validList.length > 0) {
      try {
        const existingRecords = await pbClient.youth.getAll();
        const dbDuplicates = [];
        const finalValidList = [];
        
        for (const newRecord of validList) {
          const isDuplicate = existingRecords.some(dbRecord => 
            dbRecord.name?.toLowerCase() === newRecord.name?.toLowerCase() &&
            dbRecord.birthday === newRecord.birthday
          );
          
          if (isDuplicate) {
            dbDuplicates.push(newRecord);
          } else {
            finalValidList.push(newRecord);
          }
        }
        
        setValidData(finalValidList);
        setDuplicatesInDb(dbDuplicates);
        
        if (dbDuplicates.length > 0) {
          setShowDuplicateDialog(true);
        }
        
        if (finalValidList.length === 0 && dbDuplicates.length === 0) {
          setError('No valid records found. Please check your file format and data.');
        }
        
      } catch (error) {
        console.error("Error checking database for duplicates:", error);
        setError('Failed to check for duplicates in the database.');
      }
    } else {
      setValidData([]);
      setError('No valid records found. Please check your file format and data.');
    }
  };

  const handleValidationAction = (action: 'ignore' | 'fix') => {
    if (action === 'ignore') {
      setShowValidationDialog(false);
      // Continue with processing even with validation issues
      const validList = parsedData.filter(record => {
        const result = YouthSchema.safeParse(record);
        return result.success;
      });
      checkDatabaseDuplicates(validList);
    } else {
      // For now, just close - user needs to fix the file
      setShowValidationDialog(false);
      setError('Please fix the validation issues in your file and try again.');
    }
  };

  const handleImport = async () => {
    let recordsToImport = [...validData];
    
    if (duplicatesInDb.length > 0) {
      if (duplicateAction === 'merge' || duplicateAction === 'overwrite') {
        recordsToImport = [...recordsToImport, ...duplicatesInDb];
      }
    }
    
    if (recordsToImport.length > 0) {
      onImport(recordsToImport);
      onClose();
    }
  };

  const handleDuplicateAction = (action: 'merge' | 'overwrite' | 'ignore') => {
    setDuplicateAction(action);
    setShowDuplicateDialog(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Youth Records</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          {/* Template Download */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Download Template</h3>
                  <p className="text-sm text-gray-600">Get the correct format for importing data</p>
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
            <label className="text-sm font-medium">Upload File</label>
            <div className="flex items-center gap-2">
              <Input 
                type="file"
                accept=".csv, .xlsx, .xls" 
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
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {parsedData.length > 0 && (
            <div className="mt-4 space-y-2 p-4 bg-gray-50 rounded-md">
              <div className="text-sm">Total Parsed Records: <span className="font-medium">{parsedData.length}</span></div>
              <div className="text-sm text-green-600">Valid Records: <span className="font-medium">{validData.length}</span></div>
              <div className="text-sm text-amber-600">Duplicates in File: <span className="font-medium">{duplicatesInFile.length}</span></div>
              <div className="text-sm text-orange-500">Duplicates in Database: <span className="font-medium">{duplicatesInDb.length}</span></div>
              {validationIssues.length > 0 && (
                <div className="text-sm text-red-600">Validation Issues: <span className="font-medium">{validationIssues.length}</span></div>
              )}
            </div>
          )}

          {/* Validation Issues Dialog */}
          {showValidationDialog && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="text-amber-600" size={20} />
                  <h3 className="font-medium text-amber-800">Validation Issues Found</h3>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {validationIssues.slice(0, 10).map((issue, index) => (
                    <div key={index} className="text-sm p-2 bg-white rounded border">
                      <div className="font-medium">Row {issue.row}: {issue.field}</div>
                      <div className="text-gray-600">{issue.issue}</div>
                      <div className="text-xs text-gray-500">Value: {issue.value}</div>
                      {issue.suggestion && (
                        <div className="text-xs text-blue-600">Suggestion: {issue.suggestion}</div>
                      )}
                    </div>
                  ))}
                  {validationIssues.length > 10 && (
                    <div className="text-sm text-gray-500">...and {validationIssues.length - 10} more issues</div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => handleValidationAction('fix')}>
                    Fix File First
                  </Button>
                  <Button variant="destructive" onClick={() => handleValidationAction('ignore')}>
                    Import Anyway
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Duplicate Resolution Dialog */}
          {showDuplicateDialog && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-4">
                <h3 className="font-medium mb-2">Duplicate Records Found</h3>
                <p className="text-sm mb-4">
                  {duplicatesInDb.length} records already exist in the database. 
                  How would you like to handle these duplicates?
                </p>
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" onClick={() => handleDuplicateAction('merge')}>
                    Merge (Update existing records)
                  </Button>
                  <Button variant="outline" onClick={() => handleDuplicateAction('overwrite')}>
                    Overwrite (Replace existing records)
                  </Button>
                  <Button variant="outline" onClick={() => handleDuplicateAction('ignore')}>
                    Ignore (Skip duplicate records)
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={validData.length === 0 && (duplicatesInDb.length === 0 || duplicateAction === 'ignore')}
          >
            Import Records
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
