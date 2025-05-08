
import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formSchema } from "@/lib/schema";
import { pbClient, YouthRecord } from "@/lib/pb-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Download, FileSpreadsheet, FileUp, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { generateTemplateData } from "@/lib/schema";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: () => void;
}

export function ImportDialog({ open, onOpenChange, onImportSuccess }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<Record<string, any>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFile(null);
      setParsedData([]);
      setParseErrors([]);
      setIsUploading(false);
    }
    onOpenChange(isOpen);
  };

  // Process the uploaded file
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    parseFile(selectedFile);
  };

  // Parse CSV or Excel file
  const parseFile = (file: File) => {
    setParseErrors([]);
    setParsedData([]);
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          validateData(results.data as Record<string, any>[]);
        },
        error: (error) => {
          setParseErrors([`Error parsing CSV: ${error.message}`]);
        }
      });
    } 
    else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          validateData(json as Record<string, any>[]);
        } catch (error) {
          setParseErrors([`Error parsing Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`]);
        }
      };
      
      reader.readAsArrayBuffer(file);
    } 
    else {
      setParseErrors(['Unsupported file format. Please upload a CSV or Excel file.']);
    }
  };

  // Validate the parsed data against schema
  const validateData = (data: Record<string, any>[]) => {
    if (!data.length) {
      setParseErrors(['File contains no data']);
      return;
    }
    
    const errors: string[] = [];
    const requiredFields = ['name', 'age', 'sex', 'barangay', 'youth_classification', 'youth_age_group'];
    
    // Check first row for required fields
    const firstRow = data[0];
    const missingFields = requiredFields.filter(field => !Object.keys(firstRow).includes(field));
    
    if (missingFields.length) {
      errors.push(`Missing required columns: ${missingFields.join(', ')}`);
    }
    
    // Validate each record
    data.forEach((record, index) => {
      // Check sex values
      if (record.sex && !formSchema.shape.sex.options.includes(record.sex)) {
        errors.push(`Row ${index + 2}: Invalid sex value "${record.sex}" (must be one of ${formSchema.shape.sex.options.join(', ')})`);
      }
      
      // Check youth_classification values
      if (record.youth_classification && !formSchema.shape.youth_classification.options.includes(record.youth_classification)) {
        errors.push(`Row ${index + 2}: Invalid youth classification "${record.youth_classification}"`);
      }
      
      // Check youth_age_group values
      if (record.youth_age_group && !formSchema.shape.youth_age_group.options.includes(record.youth_age_group)) {
        errors.push(`Row ${index + 2}: Invalid youth age group "${record.youth_age_group}"`);
      }
    });
    
    if (errors.length) {
      setParseErrors(errors);
    } else {
      setParsedData(data);
    }
  };

  // Import data to database
  const handleImport = async () => {
    if (!parsedData.length) return;
    
    try {
      setIsUploading(true);
      
      // Transform data to match YouthRecord structure
      const formattedData = parsedData.map(record => {
        // Default values for required fields
        const formattedRecord: any = {
          name: record.name || '',
          age: record.age?.toString() || '',
          sex: record.sex || 'MALE',
          barangay: record.barangay || '',
          youth_classification: record.youth_classification || 'ISY',
          youth_age_group: record.youth_age_group || 'CORE YOUTH (18-24)',
          birthday: record.birthday ? new Date(record.birthday) : new Date(),
          civil_status: record.civil_status || 'SINGLE',
          email_address: record.email_address || '',
          contact_number: record.contact_number || '',
          home_address: record.home_address || '',
          region: record.region || '',
          province: record.province || '',
          city_municipality: record.city_municipality || '',
          highest_education: record.highest_education || '',
          work_status: record.work_status || '',
          registered_voter: record.registered_voter || 'NO',
          voted_last_election: record.voted_last_election || 'NO',
          attended_kk_assembly: record.attended_kk_assembly || 'NO',
          kk_assemblies_attended: parseInt(record.kk_assemblies_attended) || 0
        };
        
        return formattedRecord;
      });
      
      // Upload the data
      await pbClient.youth.createMany(formattedData);
      
      onImportSuccess();
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import data');
    } finally {
      setIsUploading(false);
    }
  };

  // Create and download beautiful template file
  const downloadTemplate = () => {
    // Get template data from schema
    const { headers, sampleRow } = generateTemplateData();
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([sampleRow]);
    
    // Set column widths
    const colWidths = [
      {wch: 20}, // name
      {wch: 5},  // age
      {wch: 12}, // birthday
      {wch: 8},  // sex
      {wch: 12}, // civil_status
      {wch: 15}, // barangay
      {wch: 15}, // region
      {wch: 15}, // province
      {wch: 18}, // city_municipality
      {wch: 10}, // youth_classification
      {wch: 20}, // youth_age_group
      {wch: 25}, // email_address
      {wch: 15}, // contact_number
      {wch: 20}, // home_address
      {wch: 20}, // highest_education
      {wch: 15}, // work_status
      {wch: 15}, // registered_voter
      {wch: 15}, // voted_last_election
      {wch: 15}, // attended_kk_assembly
      {wch: 15}  // kk_assemblies_attended
    ];
    ws['!cols'] = colWidths;

    // Apply styling and formatting
    const range = XLSX.utils.decode_range(ws['!ref'] || "A1:T2");
    
    // Create styles for different cell types
    const headerStyle = {
      fill: { fgColor: { rgb: "8B5CF6" } }, // Header background (Purple)
      font: { color: { rgb: "FFFFFF" }, bold: true, sz: 12 },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "D3D3D3" } },
        bottom: { style: "thin", color: { rgb: "D3D3D3" } },
        left: { style: "thin", color: { rgb: "D3D3D3" } },
        right: { style: "thin", color: { rgb: "D3D3D3" } }
      }
    };
    
    const requiredFieldStyle = {
      fill: { fgColor: { rgb: "F2FCE2" } }, // Light green for required fields
      font: { color: { rgb: "000000" } },
      border: {
        top: { style: "thin", color: { rgb: "D3D3D3" } },
        bottom: { style: "thin", color: { rgb: "D3D3D3" } },
        left: { style: "thin", color: { rgb: "D3D3D3" } },
        right: { style: "thin", color: { rgb: "D3D3D3" } }
      }
    };
    
    const optionalFieldStyle = {
      fill: { fgColor: { rgb: "F1F0FB" } }, // Light purple for optional fields
      font: { color: { rgb: "000000" } },
      border: {
        top: { style: "thin", color: { rgb: "D3D3D3" } },
        bottom: { style: "thin", color: { rgb: "D3D3D3" } },
        left: { style: "thin", color: { rgb: "D3D3D3" } },
        right: { style: "thin", color: { rgb: "D3D3D3" } }
      }
    };
    
    // Required fields
    const requiredFields = ['name', 'age', 'sex', 'barangay', 'youth_classification', 'youth_age_group'];
    
    // Apply styles to each cell
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;
        
        // Apply appropriate styles
        if (R === 0) {
          // Header row
          ws[cellAddress].s = headerStyle;
        } else {
          // Data row - check if it's a required field
          const columnHeader = headers[C];
          if (requiredFields.includes(columnHeader)) {
            ws[cellAddress].s = requiredFieldStyle;
          } else {
            ws[cellAddress].s = optionalFieldStyle;
          }
        }
      }
    }
    
    // Add instructions sheet
    const instructionsData = [
      ["Youth Census Data Import Template Instructions"],
      [""],
      ["1. Required Fields (highlighted in light green)"],
      ["   - name: Full name of the youth"],
      ["   - age: Numeric age (15-30)"],
      ["   - sex: Must be one of: MALE, FEMALE"],
      ["   - barangay: Must be one of the valid barangays"],
      ["   - youth_classification: Must be one of: ISY, OSY, WY, YSN"],
      ["   - youth_age_group: Must be one of: CHILD YOUTH (15-17), CORE YOUTH (18-24), YOUNG ADULT (25-30)"],
      [""],
      ["2. Optional Fields (highlighted in light purple)"],
      ["   - birthday: Date in YYYY-MM-DD format"],
      ["   - civil_status: Must be one of: SINGLE, MARRIED, LIVED-IN, WIDOWED"],
      ["   - email_address: Valid email address"],
      ["   - contact_number: Phone number"],
      ["   - home_address: Home address details"],
      ["   - region: Geographic region"],
      ["   - province: Province name"],
      ["   - city_municipality: City or municipality name"],
      ["   - highest_education: Educational attainment"],
      ["   - work_status: Employment status"],
      ["   - registered_voter: YES or NO"],
      ["   - voted_last_election: YES or NO"],
      ["   - attended_kk_assembly: YES or NO"],
      ["   - kk_assemblies_attended: Number of assemblies attended (0 or more)"],
      [""],
      ["3. Valid Barangay Values:"],
      ["   Aplaya, Bobontugan, Corrales, Danao, Jampason, Kimaya, Lower Jasaan (Pob.), Luz Banzon,"],
      ["   Natubo, San Antonio, San Isidro, San Nicolas, Upper Jasaan (Pob.), I. S. Cruz"],
    ];
    
    const instructionsWs = XLSX.utils.aoa_to_sheet(instructionsData);
    
    // Style the instructions sheet
    const instructionsRange = XLSX.utils.decode_range(instructionsWs['!ref'] || "A1:A30");
    
    const titleStyle = {
      font: { bold: true, sz: 14, color: { rgb: "8B5CF6" } },
      alignment: { horizontal: "left" }
    };
    
    const headingStyle = {
      font: { bold: true, sz: 12, color: { rgb: "000000" } },
      alignment: { horizontal: "left" }
    };
    
    const textStyle = {
      font: { sz: 11, color: { rgb: "333333" } },
      alignment: { horizontal: "left" }
    };
    
    // Apply styles to instructions sheet
    for (let R = instructionsRange.s.r; R <= instructionsRange.e.r; R++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: 0 });
      if (!instructionsWs[cellAddress]) continue;
      
      if (R === 0) {
        instructionsWs[cellAddress].s = titleStyle; // Title
      } else if ([2, 11, 26].includes(R)) {
        instructionsWs[cellAddress].s = headingStyle; // Section headings
      } else {
        instructionsWs[cellAddress].s = textStyle; // Regular text
      }
    }
    
    // Set column widths for instructions
    instructionsWs['!cols'] = [{ wch: 100 }];
    
    // Add both sheets to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.utils.book_append_sheet(wb, instructionsWs, "Instructions");
    
    // Generate file and trigger download
    XLSX.writeFile(wb, "youth_census_template.xlsx", { bookType: "xlsx", bookSST: false, type: "binary" });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Youth Records</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file with youth census data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              File must include required fields: name, age, sex, barangay, youth classification and age group
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadTemplate}
              className="ml-auto flex items-center gap-2"
            >
              <Download size={14} />
              Template
            </Button>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv, .xlsx, .xls"
            onChange={handleFileChange}
            className="hidden"
          />

          <div 
            className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file.size > 1024 * 1024
                    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                    : `${(file.size / 1024).toFixed(2)} KB`}
                </p>
                <Badge variant={parseErrors.length ? "destructive" : "secondary"}>
                  {parseErrors.length 
                    ? `${parseErrors.length} errors` 
                    : `${parsedData.length} records ready`}
                </Badge>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <FileUp className="h-10 w-10 text-muted-foreground" />
                <p className="font-medium">Click to upload</p>
                <p className="text-xs text-muted-foreground">
                  CSV or Excel files only
                </p>
              </div>
            )}
          </div>
          
          {parseErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Errors</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4 text-sm mt-2 max-h-[100px] overflow-y-auto">
                  {parseErrors.slice(0, 5).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {parseErrors.length > 5 && (
                    <li>...and {parseErrors.length - 5} more errors</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={parsedData.length === 0 || isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              'Import Data'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
