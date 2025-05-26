
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ColumnVisibilityToggle } from "@/components/ColumnVisibilityToggle";
import { AdvancedFilters } from "@/components/AdvancedFilters";
import { Badge } from "@/components/ui/badge";

interface TableHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
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
  columns: {
    key: string;
    title: string;
    visible: boolean;
  }[];
  onToggleColumn: (key: string) => void;
  onExportDialogOpen: () => void;
  data: any[];
  getExportCount: () => number;
  exportToCSV: () => void;
  hasActiveFilters: boolean;
}

export function TableHeader({
  searchTerm,
  onSearchChange,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  columns,
  onToggleColumn,
  onExportDialogOpen,
  data,
  getExportCount,
  exportToCSV,
  hasActiveFilters,
}: TableHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Youth Census Records</h2>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText size={16} />
                Export Options
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Export Options</h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Selected records: {getExportCount()} of {data.length}
                  </p>
                  <Button
                    variant="link"
                    className="text-xs h-auto p-0"
                    onClick={onExportDialogOpen}
                  >
                    Filter Data
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={exportToCSV}
                    className="flex-1 flex items-center gap-2 justify-center"
                    size="sm"
                  >
                    <FileText size={16} />
                    CSV
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, barangay, classification, age, birthday..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          {/* Advanced filters */}
          <AdvancedFilters
            selectedFilters={selectedFilters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
          />

          {/* Column visibility */}
          <ColumnVisibilityToggle
            columns={columns}
            onToggleColumn={onToggleColumn}
          />

          {/* Clear filters button */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Clear All Filters
            </Button>
          )}
        </div>
      </div>

      {/* Active filters display */}
      <div className="flex flex-wrap gap-2">
        {/* Age range badge */}
        {(selectedFilters.ageRange[0] !== 15 || selectedFilters.ageRange[1] !== 30) && (
          <Badge variant="outline" className="px-3 py-1">
            Age: {selectedFilters.ageRange[0]}-{selectedFilters.ageRange[1]}
            <button
              className="ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => onFilterChange('ageRange', [15, 30] as [number, number])}
            >
              ×
            </button>
          </Badge>
        )}

        {/* Gender badges */}
        {selectedFilters.gender.map((gender) => (
          <Badge key={`badge-gender-${gender}`} variant="outline" className="px-3 py-1">
            {gender}
            <button
              className="ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                const newGenders = selectedFilters.gender.filter(g => g !== gender);
                onFilterChange('gender', newGenders);
              }}
            >
              ×
            </button>
          </Badge>
        ))}

        {/* Barangay badges */}
        {selectedFilters.barangays.map((barangay) => (
          <Badge key={`badge-barangay-${barangay}`} variant="outline" className="px-3 py-1">
            Barangay: {barangay}
            <button
              className="ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                const newBarangays = selectedFilters.barangays.filter(b => b !== barangay);
                onFilterChange('barangays', newBarangays);
              }}
            >
              ×
            </button>
          </Badge>
        ))}

        {/* Classification badges */}
        {selectedFilters.classifications.map((classification) => (
          <Badge key={`badge-classification-${classification}`} variant="outline" className="px-3 py-1">
            Class: {classification}
            <button
              className="ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                const newClassifications = selectedFilters.classifications.filter(c => c !== classification);
                onFilterChange('classifications', newClassifications);
              }}
            >
              ×
            </button>
          </Badge>
        ))}

        {/* Work Status badges */}
        {selectedFilters.workStatus.map((status) => (
          <Badge key={`badge-work-${status}`} variant="outline" className="px-3 py-1">
            Work: {status}
            <button
              className="ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                const newStatuses = selectedFilters.workStatus.filter(s => s !== status);
                onFilterChange('workStatus', newStatuses);
              }}
            >
              ×
            </button>
          </Badge>
        ))}

        {/* Civil Status badges */}
        {selectedFilters.civilStatus.map((status) => (
          <Badge key={`badge-civil-${status}`} variant="outline" className="px-3 py-1">
            Civil: {status}
            <button
              className="ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                const newStatuses = selectedFilters.civilStatus.filter(s => s !== status);
                onFilterChange('civilStatus', newStatuses);
              }}
            >
              ×
            </button>
          </Badge>
        ))}

        {/* Registered Voter badges */}
        {selectedFilters.registeredVoter.map((status) => (
          <Badge key={`badge-voter-${status}`} variant="outline" className="px-3 py-1">
            Voter: {status}
            <button
              className="ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                const newStatuses = selectedFilters.registeredVoter.filter(s => s !== status);
                onFilterChange('registeredVoter', newStatuses);
              }}
            >
              ×
            </button>
          </Badge>
        ))}

        {/* Keep existing badges */}
        {selectedFilters.votedLastElection.map((value) => (
          <Badge key={`badge-voted-${value}`} variant="outline" className="px-3 py-1">
            Voted: {value}
            <button
              className="ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                const newValues = selectedFilters.votedLastElection.filter(v => v !== value);
                onFilterChange('votedLastElection', newValues);
              }}
            >
              ×
            </button>
          </Badge>
        ))}

        {selectedFilters.attendedAssembly.map((value) => (
          <Badge key={`badge-assembly-${value}`} variant="outline" className="px-3 py-1">
            Assembly: {value}
            <button
              className="ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                const newValues = selectedFilters.attendedAssembly.filter(v => v !== value);
                onFilterChange('attendedAssembly', newValues);
              }}
            >
              ×
            </button>
          </Badge>
        ))}

        {selectedFilters.highestEducation.map((value) => (
          <Badge key={`badge-edu-${value}`} variant="outline" className="px-3 py-1">
            Education: {value}
            <button
              className="ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                const newValues = selectedFilters.highestEducation.filter(v => v !== value);
                onFilterChange('highestEducation', newValues);
              }}
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
