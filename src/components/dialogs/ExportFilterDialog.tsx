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
  toggleFilter: (value: string, filterType: keyof typeof exportFilters) => void;
  clearFilters: () => void;
  getExportCount: () => number;
  onApplyFilters: () => void;
}

export function ExportFilterDialog({
  open,
  onOpenChange,
  exportFilters: filters, // Rename destructured variable
  toggleFilter,
  clearFilters,
  getExportCount,
  onApplyFilters,
}: ExportFilterDialogProps) {
  // Get options from schema
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
                    checked={filters.barangays.includes(barangay)} // Use 'filters'
                    onCheckedChange={() =>
                      toggleFilter(barangay, "barangays")
                    }
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

          {/* Classification filters */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Classification</h4>
            <div className="grid grid-cols-2 gap-2">
              {youthClassificationOptions.map((classification) => (
                <div
                  key={`export-class-${classification}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`export-class-${classification}`}
                    checked={filters.classifications.includes(classification)} // Use 'filters'
                    onCheckedChange={() =>
                      toggleFilter(classification, "classifications")
                    }
                  />
                  <label
                    htmlFor={`export-class-${classification}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {classification}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Age Group filters */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Age Group</h4>
            <div className="grid grid-cols-2 gap-2">
              {youthAgeGroupOptions.map((ageGroup) => (
                <div
                  key={`export-age-${ageGroup}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`export-age-${ageGroup}`}
                    checked={filters.ageGroups.includes(ageGroup)} // Use 'filters'
                    onCheckedChange={() =>
                      toggleFilter(ageGroup, "ageGroups")
                    }
                  />
                  <label
                    htmlFor={`export-age-${ageGroup}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {ageGroup}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Work Status filters */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Work Status</h4>
            <div className="grid grid-cols-2 gap-2">
              {workStatusOptions.map((status) => (
                <div
                  key={`export-work-${status}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`export-work-${status}`}
                    checked={filters.workStatus.includes(status)} // Use 'filters'
                    onCheckedChange={() =>
                      toggleFilter(status, "workStatus")
                    }
                  />
                  <label
                    htmlFor={`export-work-${status}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {status}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Education filters */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Highest Education</h4>
            <div className="grid grid-cols-2 gap-2">
              {educationOptions.map((education) => (
                <div
                  key={`export-edu-${education}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`export-edu-${education}`}
                    checked={filters.education.includes(education)} // Use 'filters'
                    onCheckedChange={() =>
                      toggleFilter(education, "education")
                    }
                  />
                  <label
                    htmlFor={`export-edu-${education}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {education}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Sex filters */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Sex</h4>
            <div className="grid grid-cols-2 gap-2">
              {sexOptions.map((sex) => (
                <div
                  key={`export-sex-${sex}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`export-sex-${sex}`}
                    checked={filters.sex.includes(sex)} // Use 'filters'
                    onCheckedChange={() => toggleFilter(sex, "sex")}
                  />
                  <label
                    htmlFor={`export-sex-${sex}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {sex}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Civil Status filters */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Civil Status</h4>
            <div className="grid grid-cols-2 gap-2">
              {civilStatusOptions.map((status) => (
                <div
                  key={`export-civil-${status}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`export-civil-${status}`}
                    checked={filters.civilStatus.includes(status)} // Use 'filters'
                    onCheckedChange={() =>
                      toggleFilter(status, "civilStatus")
                    }
                  />
                  <label
                    htmlFor={`export-civil-${status}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {status}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Registered Voter filters */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Registered Voter</h4>
            <div className="grid grid-cols-2 gap-2">
              {voterOptions.map((option) => (
                <div
                  key={`export-voter-${option}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`export-voter-${option}`}
                    checked={filters.registeredVoter.includes(option)} // Use 'filters'
                    onCheckedChange={() =>
                      toggleFilter(option, "registeredVoter")
                    }
                  />
                  <label
                    htmlFor={`export-voter-${option}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Voted Last Election filters */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Voted Last Election</h4>
            <div className="grid grid-cols-2 gap-2">
              {votedOptions.map((option) => (
                <div
                  key={`export-voted-${option}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`export-voted-${option}`}
                    checked={filters.votedLastElection.includes(option)} // Use 'filters'
                    onCheckedChange={() =>
                      toggleFilter(option, "votedLastElection")
                    }
                  />
                  <label
                    htmlFor={`export-voted-${option}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Attended KK Assembly filters */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Attended KK Assembly</h4>
            <div className="grid grid-cols-2 gap-2">
              {assemblyOptions.map((option) => (
                <div
                  key={`export-assembly-${option}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`export-assembly-${option}`}
                    checked={filters.attendedAssembly.includes(option)} // Use 'filters'
                    onCheckedChange={() =>
                      toggleFilter(option, "attendedAssembly")
                    }
                  />
                  <label
                    htmlFor={`export-assembly-${option}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Clear Export Filters button */}
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full mt-4"
          >
            Clear All Filters
          </Button>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
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