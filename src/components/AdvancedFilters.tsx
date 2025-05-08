
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
  
  // Get options from schema
  const sexOptions = formSchema.shape.sex.options;
  const votedOptions = formSchema.shape.voted_last_election.options;
  const assemblyOptions = formSchema.shape.attended_kk_assembly.options;
  const educationOptions = formSchema.shape.highest_education.options;
  
  // Calculate active filters count
  const activeFilterCount = 
    (selectedFilters.ageRange[0] !== 15 || selectedFilters.ageRange[1] !== 30 ? 1 : 0) +
    selectedFilters.gender.length +
    selectedFilters.votedLastElection.length +
    selectedFilters.attendedAssembly.length +
    selectedFilters.highestEducation.length;
  
  // Handle age range change
  const handleAgeRangeChange = (value: number[]) => {
    onFilterChange('ageRange', [value[0], value[1]]);
  };
  
  // Toggle filter selection
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
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
        >
          <Filter size={14} />
          Advanced Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
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
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Gender</h4>
            <div className="grid gap-2">
              {sexOptions.map((gender) => (
                <div key={`gender-${gender}`} className="flex items-center space-x-2">
                  <Checkbox
                    id={`gender-${gender}`}
                    checked={selectedFilters.gender.includes(gender)}
                    onCheckedChange={() => toggleFilterSelection(gender, 'gender')}
                  />
                  <Label htmlFor={`gender-${gender}`} className="text-sm">
                    {gender}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Voted Last Election</h4>
            <div className="grid gap-2">
              {votedOptions.map((option) => (
                <div key={`voted-${option}`} className="flex items-center space-x-2">
                  <Checkbox
                    id={`voted-${option}`}
                    checked={selectedFilters.votedLastElection.includes(option)}
                    onCheckedChange={() => toggleFilterSelection(option, 'votedLastElection')}
                  />
                  <Label htmlFor={`voted-${option}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Assembly Attendance</h4>
            <div className="grid gap-2">
              {assemblyOptions.map((option) => (
                <div key={`assembly-${option}`} className="flex items-center space-x-2">
                  <Checkbox
                    id={`assembly-${option}`}
                    checked={selectedFilters.attendedAssembly.includes(option)}
                    onCheckedChange={() => toggleFilterSelection(option, 'attendedAssembly')}
                  />
                  <Label htmlFor={`assembly-${option}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Highest Education</h4>
            <div className="grid gap-2 max-h-[150px] overflow-y-auto">
              {educationOptions.map((education) => (
                <div key={`edu-${education}`} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edu-${education}`}
                    checked={selectedFilters.highestEducation.includes(education)}
                    onCheckedChange={() => toggleFilterSelection(education, 'highestEducation')}
                  />
                  <Label htmlFor={`edu-${education}`} className="text-sm">
                    {education}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {activeFilterCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={() => {
                onClearFilters();
                setIsOpen(false);
              }}
            >
              Clear Advanced Filters
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
