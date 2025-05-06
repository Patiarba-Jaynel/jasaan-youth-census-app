import { useState } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { format } from "date-fns";
import { toast } from "@/components/ui/sonner";
import { formSchema, generateTemplateData } from "@/lib/schema";
import { pbClient, YouthRecord } from "@/lib/pb-client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FileSpreadsheet, Download, Upload } from "lucide-react";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const ImportDialog = ({
  isOpen,
  onClose,
  onImportComplete,
}: ImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validRecords, setValidRecords] = useState<any[]>([]);
  const [invalidRecords, setInvalidRecords] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [skipInvalid, setSkipInvalid] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);

    // Reset states
    setParsedData([]);
    setValidRecords([]);
    setInvalidRecords([]);

    const fileExt = selectedFile.name.split(".").pop()?.toLowerCase();

    if (fileExt === "csv") {
      // Parse CSV
      Papa.parse(selectedFile, {
        header: true,
        complete: (results) => {
          handleParsedData(results.data);
        },
        error: (error) => {
          toast.error("Error parsing CSV file", {
            description: error.message,
          });
          setIsProcessing(false);
        },
      });
    } else if (fileExt === "xlsx" || fileExt === "xls") {
      // Parse Excel
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          handleParsedData(jsonData);
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          toast.error("Error parsing Excel file");
          setIsProcessing(false);
        }
      };
      reader.readAsBinaryString(selectedFile);
    } else {
      toast.error("Invalid file format", {
        description: "Please upload a CSV or Excel file.",
      });
      setIsProcessing(false);
      setFile(null);
    }
  };

  const handleParsedData = (data: any[]) => {
    setParsedData(data);

    // Validate each record against the schema
    const valid: any[] = [];
    const invalid: any[] = [];

    data.forEach((row, index) => {
      try {
        // Process date field specifically
        let processedRow = { ...row };
        if (row.birthday) {
          try {
            // Try to parse the date
            const parsedDate = new Date(row.birthday);
            if (!isNaN(parsedDate.getTime())) {
              processedRow.birthday = parsedDate;
            } else {
              throw new Error("Invalid date format");
            }
          } catch (e) {
            throw new Error(`Invalid birthday format at row ${index + 1}`);
          }
        }

        // Convert kk_assemblies_attended to number
        if (processedRow.kk_assemblies_attended !== undefined) {
          const numValue = Number(processedRow.kk_assemblies_attended);
          if (isNaN(numValue)) {
            throw new Error(
              `Invalid kk_assemblies_attended at row ${index + 1}`
            );
          }
          processedRow.kk_assemblies_attended = numValue;
        }

        // Validate against schema
        formSchema.parse(processedRow);
        valid.push(processedRow);
      } catch (error) {
        console.error(`Validation error at row ${index + 1}:`, error);
        invalid.push({
          row,
          index,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    setValidRecords(valid);
    setInvalidRecords(invalid);
    setIsProcessing(false);
  };

  const handleImport = async () => {
    if (validRecords.length === 0) {
      toast.error("No valid records to import");
      return;
    }

    setIsUploading(true);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const record of validRecords) {
        try {
          await pbClient.youth.create(record);
          successCount++;
        } catch (error) {
          console.error("Error creating record:", error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} records`, {
          description:
            errorCount > 0
              ? `Failed to import ${errorCount} records.`
              : undefined,
        });
        onImportComplete();
        onClose();
      } else {
        toast.error("Failed to import any records");
      }
    } catch (error) {
      toast.error("Error during import process");
      console.error("Import error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = (format: "csv" | "xlsx") => {
    const { headers, sampleRow } = generateTemplateData();

    if (format === "csv") {
      // Generate CSV
      const csvData = Papa.unparse({
        fields: headers,
        data: [Object.values(sampleRow)],
      });

      // Create download link
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "youth-census-template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Generate Excel
      const worksheet = XLSX.utils.json_to_sheet([sampleRow], {
        header: headers,
      });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
      XLSX.writeFile(workbook, "youth-census-template.xlsx");
    }

    toast.success("Template downloaded successfully");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Youth Records</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file with youth records data. Download a
            template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Template Downloads */}
          <div>
            <h3 className="font-medium mb-2">Download Template</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => downloadTemplate("csv")}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                CSV Template
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadTemplate("xlsx")}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Excel Template
              </Button>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <h3 className="font-medium mb-2">Upload File</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileSpreadsheet className="h-6 w-6 text-blue-500" />
                  <span>{file.name}</span>
                  <Badge variant="secondary">
                    {(file.size / 1024).toFixed(2)} KB
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <>
                  <FileSpreadsheet className="mx-auto h-10 w-10 text-gray-400" />
                  <label
                    htmlFor="file-upload"
                    className="mt-2 cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                      disabled={isProcessing}
                    />
                  </label>
                  <p className="text-xs text-gray-500">
                    CSV, XLS or XLSX files up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="text-center py-4">
              <p>Processing file...</p>
            </div>
          )}

          {/* Validation Results */}
          {!isProcessing && parsedData.length > 0 && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 p-4 border rounded-md bg-green-50">
                  <h4 className="font-medium text-green-700">Valid Records</h4>
                  <p className="text-2xl font-bold">{validRecords.length}</p>
                </div>

                <div className="flex-1 p-4 border rounded-md bg-red-50">
                  <h4 className="font-medium text-red-700">Invalid Records</h4>
                  <p className="text-2xl font-bold">{invalidRecords.length}</p>
                </div>
              </div>

              {invalidRecords.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Validation Errors</h4>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                    {invalidRecords.map((item, idx) => (
                      <div key={idx} className="text-sm text-red-600 mb-1">
                        <span className="font-medium">
                          Row {item.index + 1}:
                        </span>{" "}
                        {item.error}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="skip-invalid"
                      checked={skipInvalid}
                      onCheckedChange={(checked) => setSkipInvalid(!!checked)}
                    />
                    <label
                      htmlFor="skip-invalid"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Skip invalid records and import only valid ones
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={validRecords.length === 0 || isUploading}
            className="flex items-center gap-1"
          >
            <Upload size={16} />
            {isUploading
              ? "Importing..."
              : `Import ${validRecords.length} Records`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
