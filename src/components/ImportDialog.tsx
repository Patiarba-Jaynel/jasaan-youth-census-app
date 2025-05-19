
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { z } from 'zod';
import { formSchema as YouthSchema } from '@/lib/schema';
import { standardizeRecordFields } from '@/lib/standardize';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { pbClient } from '@/lib/pb-client';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (records: any[]) => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({ open, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [duplicatesInFile, setDuplicatesInFile] = useState<any[]>([]);
  const [validData, setValidData] = useState<any[]>([]);
  const [duplicatesInDb, setDuplicatesInDb] = useState<any[]>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
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
      setShowDuplicateDialog(false);
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    setDuplicatesInFile([]);
    setValidData([]);
    setParsedData([]);
    setDuplicatesInDb([]);
    setFile(selectedFile || null);
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

    // First, clean and standardize the data
    const cleanedData = data.map(row => {
      const cleanedRow: any = {};
      Object.entries(row).forEach(([key, value]) => {
        cleanedRow[key.trim()] = typeof value === 'string' ? value.trim() : value;
      });
      return standardizeRecordFields(cleanedRow);
    });

    // Check for duplicates within the imported file
    for (const record of cleanedData) {
      const result = YouthSchema.safeParse(record);
      if (result.success) {
        // Create a unique key based on first name, last name, and birthday
        const key = `${record.first_name?.toLowerCase()}|${record.last_name?.toLowerCase()}|${record.birthday}`;
        
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
    
    // Proceed to check for duplicates in the database
    if (validList.length > 0) {
      try {
        // Get all existing records from the database
        const existingRecords = await pbClient.youth.getAll();
        
        // Check for duplicates between valid records and existing database records
        const dbDuplicates = [];
        const finalValidList = [];
        
        for (const newRecord of validList) {
          // For each new record, check if it already exists in the database
          const isDuplicate = existingRecords.some(dbRecord => 
            dbRecord.first_name?.toLowerCase() === newRecord.first_name?.toLowerCase() &&
            dbRecord.last_name?.toLowerCase() === newRecord.last_name?.toLowerCase() &&
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
        
        // If there are duplicates in DB, show the resolution dialog
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

  const handleImport = async () => {
    let recordsToImport = [...validData];
    
    // Handle duplicates based on user choice
    if (duplicatesInDb.length > 0) {
      if (duplicateAction === 'merge' || duplicateAction === 'overwrite') {
        // Add duplicates to the import list for merge or overwrite
        recordsToImport = [...recordsToImport, ...duplicatesInDb];
      }
      // For 'ignore', we don't add duplicates to recordsToImport
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
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Youth Records</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div>
            <Input 
              type="file"
              accept=".csv, .xlsx, .xls" 
              onChange={handleFileChange}
              className="w-full"
            />
          </div>
          
          <Button onClick={parseFile} disabled={!file}>
            Parse File
          </Button>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {parsedData.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-sm">Total Parsed Records: <span className="font-medium">{parsedData.length}</span></div>
              <div className="text-sm text-green-600">Valid Records: <span className="font-medium">{validData.length}</span></div>
              <div className="text-sm text-amber-600">Duplicates in File: <span className="font-medium">{duplicatesInFile.length}</span></div>
              <div className="text-sm text-orange-500">Duplicates in Database: <span className="font-medium">{duplicatesInDb.length}</span></div>
            </div>
          )}
          
          {showDuplicateDialog && (
            <div className="mt-4 border rounded-md p-4 bg-amber-50">
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
            </div>
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
