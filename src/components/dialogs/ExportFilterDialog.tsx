
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Filter,
  Users,
  Bookmark,
  CheckCircle2,
  CheckSquare,
} from "lucide-react";

type ExportFilter = {
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
  toggleFilter?: (value: string, filterType: keyof typeof defaultExportFilters) => void;
  clearFilters?: () => void;
  getExportCount?: () => number;
  onApplyFilters?: () => void;
};

// Default export filters to avoid using it directly in the type
const defaultExportFilters = {
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
};

export function ExportFilterDialog({
  open,
  onOpenChange,
  data = [],
  exportFilters = defaultExportFilters,
  toggleFilter = () => {},
  clearFilters = () => {},
  getExportCount = () => 0,
  onApplyFilters = () => {},
}: ExportFilterDialogProps) {
  const [filters, setFilters] = useState<ExportFilter[]>([
    { id: "firstName", label: "First Name", checked: true },
    { id: "lastName", label: "Last Name", checked: true },
    { id: "age", label: "Age", checked: true },
    { id: "birthday", label: "Birthday", checked: true },
    { id: "gender", label: "Gender", checked: true },
    { id: "civilStatus", label: "Civil Status", checked: true },
    { id: "barangay", label: "Barangay", checked: true },
    { id: "education", label: "Education", checked: true },
    { id: "workStatus", label: "Work Status", checked: true },
    { id: "registeredVoter", label: "Registered Voter", checked: true },
    { id: "votedLastElection", label: "Voted in Last Election", checked: true },
    { id: "assembly", label: "Attended Assembly", checked: true },
  ]);

  // Filter categories
  const [activeTab, setActiveTab] = useState("columns");

  // Filter options for each category
  const filterOptions = {
    barangay: [
      "Aplaya",
      "Bobontugan",
      "Corrales",
      "Jampason",
      "Kimaya",
      "Luz Banzon",
      "Lower Jasaan",
      "Solana",
      "San Antonio",
      "San Nicolas",
      "Upper Jasaan",
    ],
    classification: ["In-School Youth", "Out-of-School Youth", "Working Youth"],
    ageGroup: ["15-17", "18-24", "25-30"],
    workStatus: ["Employed", "Self-Employed", "Unemployed", "Student"],
  };

  // Select or deselect all filters
  const toggleAll = (checked: boolean) => {
    if (checked) {
      setFilters((prevFilters) =>
        prevFilters.map((filter) => ({ ...filter, checked: true }))
      );
    } else {
      setFilters((prevFilters) =>
        prevFilters.map((filter) => ({ ...filter, checked: false }))
      );
    }
  };

  const toggleFilterItem = (id: string) => {
    setFilters((prevFilters) =>
      prevFilters.map((filter) =>
        filter.id === id ? { ...filter, checked: !filter.checked } : filter
      )
    );
  };

  const handleExport = () => {
    // Get selected filters
    const selectedFilters = filters
      .filter((filter) => filter.checked)
      .map((filter) => filter.id);

    // Close dialog
    onOpenChange(false);
  };

  const allSelected = filters.every((filter) => filter.checked);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={18} />
            Export Records
          </DialogTitle>
          <DialogDescription>
            Choose which data to include in your export
          </DialogDescription>
        </DialogHeader>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full">
            <TabsTrigger value="columns" className="flex-1">
              Columns
            </TabsTrigger>
            <TabsTrigger value="filters" className="flex-1">
              Records
            </TabsTrigger>
          </TabsList>
          <TabsContent value="columns" className="pt-4">
            <div className="flex items-center mb-4">
              <Checkbox
                id="selectAll"
                checked={allSelected}
                onCheckedChange={toggleAll}
              />
              <label htmlFor="selectAll" className="ml-2">
                Select All
              </label>
            </div>
            <ScrollArea className="h-72">
              <div className="space-y-4">
                {filters.map((filter) => (
                  <div key={filter.id} className="flex items-center">
                    <Checkbox
                      id={filter.id}
                      checked={filter.checked}
                      onCheckedChange={() => toggleFilterItem(filter.id)}
                    />
                    <label
                      htmlFor={filter.id}
                      className="ml-2 text-sm cursor-pointer"
                    >
                      {filter.label}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="filters" className="pt-4">
            <ScrollArea className="h-72">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <Users size={16} /> Barangay
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {filterOptions.barangay.map((barangay) => (
                      <div key={barangay} className="flex items-center">
                        <Checkbox
                          id={`barangay-${barangay}`}
                          checked={exportFilters.barangays.includes(barangay)}
                          onCheckedChange={() =>
                            toggleFilter(barangay, "barangays")
                          }
                        />
                        <label
                          htmlFor={`barangay-${barangay}`}
                          className="ml-2 text-sm cursor-pointer"
                        >
                          {barangay}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <Bookmark size={16} /> Classification
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {filterOptions.classification.map((classification) => (
                      <div key={classification} className="flex items-center">
                        <Checkbox
                          id={`classification-${classification}`}
                          checked={exportFilters.classifications.includes(
                            classification
                          )}
                          onCheckedChange={() =>
                            toggleFilter(classification, "classifications")
                          }
                        />
                        <label
                          htmlFor={`classification-${classification}`}
                          className="ml-2 text-sm cursor-pointer"
                        >
                          {classification}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <CheckCircle2 size={16} /> Work Status
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {filterOptions.workStatus.map((status) => (
                      <div key={status} className="flex items-center">
                        <Checkbox
                          id={`workStatus-${status}`}
                          checked={exportFilters.workStatus.includes(status)}
                          onCheckedChange={() =>
                            toggleFilter(status, "workStatus")
                          }
                        />
                        <label
                          htmlFor={`workStatus-${status}`}
                          className="ml-2 text-sm cursor-pointer"
                        >
                          {status}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <CheckSquare size={16} /> Attendance
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center">
                      <Checkbox
                        id="voted-yes"
                        checked={exportFilters.votedLastElection.includes("Yes")}
                        onCheckedChange={() =>
                          toggleFilter("Yes", "votedLastElection")
                        }
                      />
                      <label
                        htmlFor="voted-yes"
                        className="ml-2 text-sm cursor-pointer"
                      >
                        Voted in Last Election
                      </label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="assembly-yes"
                        checked={exportFilters.attendedAssembly.includes("Yes")}
                        onCheckedChange={() =>
                          toggleFilter("Yes", "attendedAssembly")
                        }
                      />
                      <label
                        htmlFor="assembly-yes"
                        className="ml-2 text-sm cursor-pointer"
                      >
                        Attended KK Assembly
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <div className="text-sm mt-2">
          Selected records: {getExportCount()} of {data.length}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={clearFilters}>
            Clear Selection
          </Button>
          <Button
            onClick={() => {
              onApplyFilters();
              onOpenChange(false);
            }}
            className="gap-1"
          >
            <FileText size={16} />
            Export to CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
