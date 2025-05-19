import React from "react";
import { formSchema } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExportFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportFilters: {
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
  toggleFilter: (value: string, filterType: keyof ExportFilterDialogProps["exportFilters"]) => void;
  clearFilters: () => void;
  getExportCount: () => number;
  onApplyFilters: () => void;
}

export function ExportFilterDialog({
  open,
  onOpenChange,
  exportFilters,
  toggleFilter,
  clearFilters,
  getExportCount,
  onApplyFilters,
}: ExportFilterDialogProps) {
  const barangayOptions = formSchema.shape.barangay.options;
  const youthClassificationOptions = formSchema.shape.youth_classification.options;
  const youthAgeGroupOptions = formSchema.shape.youth_age_group.options;
  const workStatusOptions = formSchema.shape.work_status.options;
  const educationOptions = formSchema.shape.highest_education.options;
  const sexOptions = formSchema.shape.sex.options;
  const civilStatusOptions = formSchema.shape.civil_status.options;
  const voterOptions = formSchema.shape.registered_voter.options;
  const votedOptions = formSchema.shape.voted_last_election.options;
  const assemblyOptions = formSchema.shape.attended_kk_assembly.options;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Export Data</DialogTitle>
          <DialogDescription>
            Select which records to include in your export.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {/* Barangay filters */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Barangay</h4>
            <div className="grid grid-cols-2 gap-2">
              {barangayOptions.map((barangay) => (
                <div
                  key={`export-barangay-${barangay}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`export-barangay-${barangay}`}
                    checked={exportFilters.barangays.includes(barangay)}
                    onCheckedChange={() => toggleFilter(barangay, "barangays")}
                  />
                  <label
                    htmlFor={`export-barangay-${barangay}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {barangay}
                  </label>
                </div>
              ))}
            </div>
          </div>
          {/* Add other filter sections here */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={clearFilters}>
            Clear All Filters
          </Button>
          <Button
            onClick={() => {
              onApplyFilters();
              onOpenChange(false);
            }}
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}