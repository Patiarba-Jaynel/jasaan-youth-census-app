
import React from "react";
import { enumOptions } from "@/lib/schema";
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
  const barangayOptions = [
    "Aplaya", "Bobontugan", "Corrales", "Danao", "Jampason", "Kimaya",
    "Lower Jasaan (Pob.)", "Luz Banzon", "Natubo", "San Antonio", 
    "San Isidro", "San Nicolas", "Solana", "Upper Jasaan (Pob.)", "I. S. Cruz",
  ];
  const youthClassificationOptions = enumOptions.youth_classification;
  const youthAgeGroupOptions = enumOptions.youth_age_group;
  const workStatusOptions = enumOptions.work_status;
  const educationOptions = enumOptions.highest_education;
  const sexOptions = enumOptions.sex;
  const civilStatusOptions = enumOptions.civil_status;
  const voterOptions = enumOptions.registered_voter;
  const votedOptions = enumOptions.voted_last_election;
  const assemblyOptions = enumOptions.attended_kk_assembly;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Export Data</DialogTitle>
          <DialogDescription>
            Select which records to include in your export. {getExportCount()} records will be exported.
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

          {/* Youth Classification filters */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Youth Classification</h4>
            <div className="grid grid-cols-2 gap-2">
              {youthClassificationOptions.map((classification) => (
                <div
                  key={`export-classification-${classification}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`export-classification-${classification}`}
                    checked={exportFilters.classifications.includes(classification)}
                    onCheckedChange={() => toggleFilter(classification, "classifications")}
                  />
                  <label
                    htmlFor={`export-classification-${classification}`}
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
            <div className="grid grid-cols-1 gap-2">
              {youthAgeGroupOptions.map((ageGroup) => (
                <div
                  key={`export-agegroup-${ageGroup}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`export-agegroup-${ageGroup}`}
                    checked={exportFilters.ageGroups.includes(ageGroup)}
                    onCheckedChange={() => toggleFilter(ageGroup, "ageGroups")}
                  />
                  <label
                    htmlFor={`export-agegroup-${ageGroup}`}
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
            <div className="grid grid-cols-1 gap-2">
              {workStatusOptions.map((status) => (
                <div
                  key={`export-workstatus-${status}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`export-workstatus-${status}`}
                    checked={exportFilters.workStatus.includes(status)}
                    onCheckedChange={() => toggleFilter(status, "workStatus")}
                  />
                  <label
                    htmlFor={`export-workstatus-${status}`}
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
            <h4 className="text-sm font-medium">Education Level</h4>
            <div className="grid grid-cols-1 gap-2">
              {educationOptions.map((education) => (
                <div
                  key={`export-education-${education}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`export-education-${education}`}
                    checked={exportFilters.education.includes(education)}
                    onCheckedChange={() => toggleFilter(education, "education")}
                  />
                  <label
                    htmlFor={`export-education-${education}`}
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
                    checked={exportFilters.sex.includes(sex)}
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
                  key={`export-civilstatus-${status}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`export-civilstatus-${status}`}
                    checked={exportFilters.civilStatus.includes(status)}
                    onCheckedChange={() => toggleFilter(status, "civilStatus")}
                  />
                  <label
                    htmlFor={`export-civilstatus-${status}`}
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
              {voterOptions.map((voter) => (
                <div
                  key={`export-voter-${voter}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`export-voter-${voter}`}
                    checked={exportFilters.registeredVoter.includes(voter)}
                    onCheckedChange={() => toggleFilter(voter, "registeredVoter")}
                  />
                  <label
                    htmlFor={`export-voter-${voter}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {voter}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Voted Last Election filters */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Voted Last Election</h4>
            <div className="grid grid-cols-2 gap-2">
              {votedOptions.map((voted) => (
                <div
                  key={`export-voted-${voted}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`export-voted-${voted}`}
                    checked={exportFilters.votedLastElection.includes(voted)}
                    onCheckedChange={() => toggleFilter(voted, "votedLastElection")}
                  />
                  <label
                    htmlFor={`export-voted-${voted}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {voted}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Attended Assembly filters */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Attended KK Assembly</h4>
            <div className="grid grid-cols-2 gap-2">
              {assemblyOptions.map((assembly) => (
                <div
                  key={`export-assembly-${assembly}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`export-assembly-${assembly}`}
                    checked={exportFilters.attendedAssembly.includes(assembly)}
                    onCheckedChange={() => toggleFilter(assembly, "attendedAssembly")}
                  />
                  <label
                    htmlFor={`export-assembly-${assembly}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {assembly}
                  </label>
                </div>
              ))}
            </div>
          </div>
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
            Apply Filters ({getExportCount()} records)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
