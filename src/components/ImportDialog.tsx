/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { z } from 'zod';
import { formSchema as YouthSchema } from '@/lib/schema';
import { standardizeRecordFields } from '@/lib/standardize'; // Corrected import

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (records: any[]) => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({ open, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [validData, setValidData] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    setDuplicates([]);
    setValidData([]);
    setParsedData([]);
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
        processData(jsonData);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('Unsupported file format. Please upload a CSV or Excel file.');
    }
  };

  const processData = (data: any[]) => {
    const seen = new Set();
    const duplicatesList: any[] = [];
    const validList: any[] = [];

    const cleanedData = data.map(row => {
      const cleanedRow: any = {};
      Object.entries(row).forEach(([key, value]) => {
        cleanedRow[key.trim()] = typeof value === 'string' ? value.trim() : value;
      });
      return standardizeRecordFields(cleanedRow); // Use the standardized record
    });

    for (const record of cleanedData) {
      const result = YouthSchema.safeParse(record);
      if (result.success) {
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
    setValidData(validList);
    setDuplicates(duplicatesList);

    if (validList.length === 0) {
      setError('No valid records found. Please check your file format and data.');
    }
  };

  const handleImport = () => {
    if (validData.length > 0) {
      onImport(validData);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Youth Records</DialogTitle>
      <DialogContent>
        <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileChange} />
        <Button onClick={parseFile} variant="contained" sx={{ mt: 2 }}>Parse File</Button>

        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

        {parsedData.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle1">Total Parsed Records: {parsedData.length}</Typography>
            <Typography variant="subtitle1" color="green">Valid Records: {validData.length}</Typography>
            <Typography variant="subtitle1" color="orange">Duplicates: {duplicates.length}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleImport} variant="contained" disabled={validData.length === 0}>
          Import Valid Records
        </Button>
      </DialogActions>
    </Dialog>
  );
};