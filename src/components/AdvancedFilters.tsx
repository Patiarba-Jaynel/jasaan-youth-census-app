
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Filter } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { formSchema } from "@/lib/schema";

interface AdvancedFiltersProps {
  selectedFilters: {
    ageRange: [number, number];
    gender: string[];
    votedLastElection: string[];
    attendedAssembly: string[];
    highestEducation: string[];
    barangays: string[];
    classifications: string[];
    workStatus: string[];
    civilStatus: string[];
    registeredVoter: string[];
  };
  onFilterChange: (filterType: string, value: any) => void;
  onClearFilters: () => void;
}

export function AdvancedFilters({
  selectedFilters,
  onFilterChange,
  onClearFilters
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toTitleCase = (str: string) =>
    str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const sexOptions = formSchema.shape.sex.options;
  const votedOptions = formSchema.shape.voted_last_election.options;
  const assemblyOptions = formSchema.shape.attended_kk_assembly.options;
  const educationOptions = formSchema.shape.highest_education.options;
  const classificationOptions = formSchema.shape.youth_classification.options;
  const workStatusOptions = formSchema.shape.work_status.options;
  const civilStatusOptions = formSchema.shape.civil_status.options;
  const registeredVoterOptions = formSchema.shape.registered_voter.options;

  const barangayOptions = [
    "Aplaya", "Bobontugan", "Corrales", "I.S. Cruz", "Danao", "Jampason", "Kimaya",
    "Lower Jasaan", "Luz Banzon", "Natubo", "San Antonio", "San Isidro",
    "San Nicolas", "Solana", "Upper Jasaan"
  ];

  const activeFilterCount =
    (selectedFilters.ageRange[0] !== 15 || selectedFilters.ageRange[1] !== 30 ? 1 : 0) +
    selectedFilters.gender.length +
    selectedFilters.votedLastElection.length +
    selectedFilters.attendedAssembly.length +
    selectedFilters.highestEducation.length +
    selectedFilters.barangays.length +
    selectedFilters.classifications.length +
    selectedFilters.workStatus.length +
    selectedFilters.civilStatus.length +
    selectedFilters.registeredVoter.length;

  const handleAgeRangeChange = (value: number[]) => {
    onFilterChange('ageRange', [value[0], value[1]]);
  };

  const toggleFilterSelection = (value: string, filterType: string) => {
    const currentValues = selectedFilters[filterType as keyof typeof selectedFilters] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];

    onFilterChange(filterType, newValues);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Filter size={14} />
          Advanced Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-4 max-h-[90vh] overflow-y-auto"
        align="start"
      >
        {/* Age Range */}
        <div className="space-y-2 mb-4">
          <h4 className="font-medium text-sm">Age Range</h4>
          <div className="pt-4 px-2">
            <Slider
              defaultValue={[15, 30]}
              min={15}
              max={30}
              step={1}
              value={[selectedFilters.ageRange[0], selectedFilters.ageRange[1]]}
              onValueChange={handleAgeRangeChange}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{selectedFilters.ageRange[0]} years</span>
              <span>{selectedFilters.ageRange[1]} years</span>
            </div>
          </div>
        </div>

        <Separator />

        <FilterGroup
          label="Gender"
          options={sexOptions}
          selected={selectedFilters.gender}
          onToggle={(value) => toggleFilterSelection(value, 'gender')}
          toTitleCase={true}
        />

        <Separator />

        <FilterGroup
          label="Barangay"
          options={barangayOptions}
          selected={selectedFilters.barangays}
          onToggle={(value) => toggleFilterSelection(value, 'barangays')}
        />

        <Separator />

        <FilterGroup
          label="Youth Classification"
          options={classificationOptions}
          selected={selectedFilters.classifications}
          onToggle={(value) => toggleFilterSelection(value, 'classifications')}
        />

        <Separator />

        <FilterGroup
          label="Work Status"
          options={workStatusOptions}
          selected={selectedFilters.workStatus}
          onToggle={(value) => toggleFilterSelection(value, 'workStatus')}
        />

        <Separator />

        <FilterGroup
          label="Civil Status"
          options={civilStatusOptions}
          selected={selectedFilters.civilStatus}
          onToggle={(value) => toggleFilterSelection(value, 'civilStatus')}
          toTitleCase={true}
        />

        <Separator />

        <FilterGroup
          label="Registered Voter"
          options={registeredVoterOptions}
          selected={selectedFilters.registeredVoter}
          onToggle={(value) => toggleFilterSelection(value, 'registeredVoter')}
        />

        <Separator />

        <FilterGroup
          label="Voted Last Election"
          options={votedOptions}
          selected={selectedFilters.votedLastElection}
          onToggle={(value) => toggleFilterSelection(value, 'votedLastElection')}
        />

        <Separator />

        <FilterGroup
          label="Assembly Attendance"
          options={assemblyOptions}
          selected={selectedFilters.attendedAssembly}
          onToggle={(value) => toggleFilterSelection(value, 'attendedAssembly')}
        />

        <Separator />

        <FilterGroup
          label="Highest Education"
          options={educationOptions}
          selected={selectedFilters.highestEducation}
          onToggle={(value) => toggleFilterSelection(value, 'highestEducation')}
        />

        {activeFilterCount > 0 && (
          <>
            <Separator />
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => {
                onClearFilters();
                setIsOpen(false);
              }}
            >
              Clear Advanced Filters
            </Button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Reusable group
function FilterGroup({
  label,
  options,
  selected,
  onToggle,
  toTitleCase = false
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  toTitleCase?: boolean;
}) {
  const formatLabel = (str: string) =>
    toTitleCase
      ? str
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : str;

  return (
    <div className="space-y-2 my-4">
      <h4 className="font-medium text-sm">{label}</h4>
      <div className="grid gap-2">
        {options.map((option) => (
          <div key={`${label}-${option}`} className="flex items-center space-x-2">
            <Checkbox
              id={`${label}-${option}`}
              checked={selected.includes(option)}
              onCheckedChange={() => onToggle(option)}
            />
            <Label htmlFor={`${label}-${option}`} className="text-sm">
              {formatLabel(option)}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
