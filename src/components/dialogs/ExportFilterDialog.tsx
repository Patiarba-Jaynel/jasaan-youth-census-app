
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/sonner";
import { ListFilter, Download } from "lucide-react";
import * as XLSX from "xlsx";

export type ExportFilter = {
  id: string;
  label: string;
  checked: boolean;
};

export type ExportFilterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: any[];
  exportFilters?: {
    barangays: string[];
    classifications: string[];
    ageGroups: string[];
    workStatus: string[];
    education: string[];
    sex: string[];
    civilStatus: string[];
    registeredVoter: string[];
    votedLastElection: string[];
    attendedAssembly: string[];
  };
  toggleFilter?: (value: string, filterType: keyof typeof exportFilters) => void;
  clearFilters?: () => void;
  getExportCount?: () => number;
  onApplyFilters?: () => void;
};

export function ExportFilterDialog({
  open,
  onOpenChange,
  data = [],
  exportFilters = {
    barangays: [],
    classifications: [],
    ageGroups: [],
    workStatus: [],
    education: [],
    sex: [],
    civilStatus: [],
    registeredVoter: [],
    votedLastElection: [],
    attendedAssembly: [],
  },
  toggleFilter = () => {},
  clearFilters = () => {},
  getExportCount = () => 0,
  onApplyFilters = () => {},
}: ExportFilterDialogProps) {
  const [filters, setFilters] = useState<ExportFilter[]>([
    { id: "firstName", label: "First Name", checked: true },
    { id: "lastName", label: "Last Name", checked: true },
    { id: "middleName", label: "Middle Name", checked: true },
    { id: "age", label: "Age", checked: true },
    { id: "gender", label: "Gender", checked: true },
    { id: "address", label: "Address", checked: true },
    { id: "email", label: "Email", checked: true },
    { id: "phoneNumber", label: "Phone Number", checked: true },
    { id: "education", label: "Education", checked: true },
  ]);

  const handleExport = () => {
    try {
      if (!data || data.length === 0) {
        toast.error("No data available to export");
        return;
      }

      const selectedFields = filters.filter((filter) => filter.checked).map((f) => f.id);
      
      if (selectedFields.length === 0) {
        toast.error("Please select at least one field to export");
        return;
      }

      const filteredData = data.map((row) => {
        const newRow: Record<string, any> = {};
        selectedFields.forEach((field) => {
          if (field in row) {
            newRow[filters.find(f => f.id === field)?.label || field] = row[field];
          }
        });
        return newRow;
      });

      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Youth Data");
      
      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `youth_data_export_${date}.xlsx`;
      
      XLSX.writeFile(workbook, filename);
      
      toast.success("Data exported successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    }
  };

  const toggleFilterItem = (id: string) => {
    setFilters((prevFilters) =>
      prevFilters.map((filter) =>
        filter.id === id ? { ...filter, checked: !filter.checked } : filter
      )
    );
  };

  const toggleAllFilters = (checked: boolean) => {
    setFilters((prevFilters) =>
      prevFilters.map((filter) => ({ ...filter, checked }))
    );
  };

  // Check if all filters are selected
  const allSelected = filters.every((filter) => filter.checked);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListFilter className="h-5 w-5" />
            <span>Export Options</span>
          </DialogTitle>
          <DialogDescription>
            Select the fields you want to include in your export
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4 flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={allSelected}
              onCheckedChange={(checked) => toggleAllFilters(!!checked)}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Select All
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filters.map((filter) => (
              <div key={filter.id} className="flex items-center space-x-2">
                <Checkbox
                  id={filter.id}
                  checked={filter.checked}
                  onCheckedChange={() => toggleFilterItem(filter.id)}
                />
                <label
                  htmlFor={filter.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {filter.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            className="gap-1"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ExportFilterDialog;
