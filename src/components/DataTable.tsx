
import { useState, useEffect } from "react";
import { YouthRecord } from "@/lib/pb-client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, File, Edit, Trash2, Search } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { pbClient } from "@/lib/pb-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formSchema } from "@/lib/schema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ColumnVisibilityToggle } from "./ColumnVisibilityToggle";
import { AdvancedFilters } from "./AdvancedFilters";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface DataTableProps {
  data: YouthRecord[];
  onDataChange: () => void; // Callback to refresh data after edit/delete
}

export function DataTable({ data, onDataChange }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExportFilterDialogOpen, setIsExportFilterDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<YouthRecord | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<YouthRecord>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

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
  const homeAddressOptions = formSchema.shape.home_address.options;

  // Filter states
  const [selectedBarangays, setSelectedBarangays] = useState<string[]>([]);
  const [selectedClassifications, setSelectedClassifications] = useState<string[]>([]);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);
  const [selectedWorkStatus, setSelectedWorkStatus] = useState<string[]>([]);

  // Advanced filter states - Fix the ageRange to be a tuple of [number, number]
  const [advancedFilters, setAdvancedFilters] = useState({
    ageRange: [15, 30] as [number, number],
    gender: [] as string[],
    votedLastElection: [] as string[],
    attendedAssembly: [] as string[],
    highestEducation: [] as string[],
  });

  // Column visibility
  const [columns, setColumns] = useState([
    { key: "name", title: "Name", visible: true },
    { key: "age", title: "Age", visible: true },
    { key: "sex", title: "Sex/Gender", visible: true },
    { key: "barangay", title: "Barangay", visible: true },
    { key: "classification", title: "Classification", visible: true },
    { key: "ageGroup", title: "Age Group", visible: true },
    { key: "education", title: "Highest Education", visible: false },
    { key: "work", title: "Work Status", visible: false },
    { key: "registeredVoter", title: "Registered Voter", visible: true },
    { key: "votedLastElection", title: "Voted Last Election", visible: false },
    { key: "attendedAssembly", title: "Attended Assembly", visible: false },
    { key: "civilStatus", title: "Civil Status", visible: false },
  ]);

  // Toggle column visibility
  const toggleColumnVisibility = (key: string) => {
    setColumns(cols => cols.map(col => 
      col.key === key ? { ...col, visible: !col.visible } : col
    ));
  };

  // Export filter states
  const [exportFilters, setExportFilters] = useState({
    barangays: [] as string[],
    classifications: [] as string[],
    ageGroups: [] as string[],
    workStatus: [] as string[],
    education: [] as string[],
    sex: [] as string[],
    civilStatus: [] as string[],
    registeredVoter: [] as string[],
    votedLastElection: [] as string[],
    attendedAssembly: [] as string[],
  });

  // Handle advanced filter changes
  const handleAdvancedFilterChange = (filterType: string, value: any) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Clear advanced filters
  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      ageRange: [15, 30] as [number, number],
      gender: [],
      votedLastElection: [],
      attendedAssembly: [],
      highestEducation: [],
    });
  };

  // Apply filters to data
  const filteredData = data.filter((record) => {
    // Search term filter
    const matchesSearch =
      searchTerm === "" ||
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.barangay.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.youth_classification
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    // Basic Dropdown filters
    const matchesBarangay =
      selectedBarangays.length === 0 ||
      selectedBarangays.includes(record.barangay);
    const matchesClassification =
      selectedClassifications.length === 0 ||
      selectedClassifications.includes(record.youth_classification);
    const matchesAgeGroup =
      selectedAgeGroups.length === 0 ||
      selectedAgeGroups.includes(record.youth_age_group);
    const matchesWorkStatus =
      selectedWorkStatus.length === 0 ||
      selectedWorkStatus.includes(record.work_status);
      
    // Advanced filters
    const age = parseInt(record.age);
    const matchesAgeRange = 
      isNaN(age) || 
      (age >= advancedFilters.ageRange[0] && age <= advancedFilters.ageRange[1]);
      
    const matchesGender = 
      advancedFilters.gender.length === 0 ||
      advancedFilters.gender.includes(record.sex);
      
    const matchesVotedLastElection =
      advancedFilters.votedLastElection.length === 0 ||
      advancedFilters.votedLastElection.includes(record.voted_last_election);
      
    const matchesAttendedAssembly =
      advancedFilters.attendedAssembly.length === 0 ||
      advancedFilters.attendedAssembly.includes(record.attended_kk_assembly);
      
    const matchesEducation =
      advancedFilters.highestEducation.length === 0 ||
      advancedFilters.highestEducation.includes(record.highest_education);

    return (
      matchesSearch &&
      matchesBarangay &&
      matchesClassification &&
      matchesAgeGroup &&
      matchesWorkStatus &&
      matchesAgeRange &&
      matchesGender &&
      matchesVotedLastElection &&
      matchesAttendedAssembly &&
      matchesEducation
    );
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset pagination when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedBarangays,
    selectedClassifications,
    selectedAgeGroups,
    selectedWorkStatus,
    advancedFilters
  ]);

  // Create a zod schema specifically for the edit form
  const editFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    age: z.string().min(1, "Age is required"),
    birthday: z.date({
      required_error: "Birthday is required",
    }),
    sex: z.enum(sexOptions),
    civil_status: z.enum(civilStatusOptions),
    barangay: z.enum(barangayOptions),
    youth_classification: z.enum(youthClassificationOptions),
    youth_age_group: z.enum(youthAgeGroupOptions),
    highest_education: z.enum(educationOptions),
    work_status: z.enum(workStatusOptions),
    registered_voter: z.enum(voterOptions),
    voted_last_election: z.enum(votedOptions),
    attended_kk_assembly: z.enum(assemblyOptions),
    home_address: z.enum(homeAddressOptions),
    email_address: z.string().email("Invalid email address"),
    contact_number: z.string().min(7, "Contact number must be at least 7 characters"),
    kk_assemblies_attended: z.coerce.number().int().nonnegative()
  });

  type EditFormValues = z.infer<typeof editFormSchema>;
  
  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: "",
      age: "",
      birthday: new Date(),
      sex: "MALE",
      civil_status: "SINGLE",
      barangay: "Aplaya",
      youth_classification: "ISY",
      youth_age_group: "CORE YOUTH (18-24)",
      highest_education: "High School",
      work_status: "Employed",
      registered_voter: "Yes",
      voted_last_election: "Yes",
      attended_kk_assembly: "Yes",
      home_address: "ZONE 1",
      email_address: "",
      contact_number: "",
      kk_assemblies_attended: 0
    }
  });

  // Handle opening edit dialog
  const handleEdit = (record: YouthRecord) => {
    setSelectedRecord(record);
    
    // Set default values for form
    form.reset({
      name: record.name,
      age: record.age,
      birthday: new Date(record.birthday),
      sex: record.sex,
      civil_status: record.civil_status,
      barangay: record.barangay,
      youth_classification: record.youth_classification,
      youth_age_group: record.youth_age_group,
      highest_education: record.highest_education,
      work_status: record.work_status,
      registered_voter: record.registered_voter,
      voted_last_election: record.voted_last_election,
      attended_kk_assembly: record.attended_kk_assembly,
      home_address: record.home_address,
      email_address: record.email_address,
      contact_number: record.contact_number,
      kk_assemblies_attended: record.kk_assemblies_attended
    });
    
    setIsEditDialogOpen(true);
  };

  // Handle opening delete dialog
  const handleDelete = (record: YouthRecord) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  // Handle save edited record
  const handleSaveEdit = async (data: EditFormValues) => {
    if (!selectedRecord) return;

    try {
      await pbClient.youth.update(selectedRecord.id, data);
      toast.success("Record updated successfully");
      setIsEditDialogOpen(false);
      onDataChange(); // Refresh data after update
    } catch (error) {
      console.error("Error updating record:", error);
      toast.error("Failed to update record");
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedRecord) return;

    try {
      await pbClient.youth.delete(selectedRecord.id);
      toast.success("Record deleted successfully");
      setIsDeleteDialogOpen(false);
      onDataChange(); // Refresh data after delete
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
    }
  };

  // Toggle filter selection
  const toggleFilter = (
    value: string,
    filterType: "barangays" | "classifications" | "ageGroups" | "workStatus"
  ) => {
    switch (filterType) {
      case "barangays":
        setSelectedBarangays((prev) =>
          prev.includes(value)
            ? prev.filter((item) => item !== value)
            : [...prev, value]
        );
        break;
      case "classifications":
        setSelectedClassifications((prev) =>
          prev.includes(value)
            ? prev.filter((item) => item !== value)
            : [...prev, value]
        );
        break;
      case "ageGroups":
        setSelectedAgeGroups((prev) =>
          prev.includes(value)
            ? prev.filter((item) => item !== value)
            : [...prev, value]
        );
        break;
      case "workStatus":
        setSelectedWorkStatus((prev) =>
          prev.includes(value)
            ? prev.filter((item) => item !== value)
            : [...prev, value]
        );
        break;
    }
  };

  // Toggle export filter selection
  const toggleExportFilter = (
    value: string,
    filterType: keyof typeof exportFilters
  ) => {
    setExportFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((item) => item !== value)
        : [...prev[filterType], value],
    }));
  };

  // Filter data for export
  const getExportData = () => {
    return data.filter((record) => {
      const matchesBarangay =
        exportFilters.barangays.length === 0 ||
        exportFilters.barangays.includes(record.barangay);
      const matchesClassification =
        exportFilters.classifications.length === 0 ||
        exportFilters.classifications.includes(record.youth_classification);
      const matchesAgeGroup =
        exportFilters.ageGroups.length === 0 ||
        exportFilters.ageGroups.includes(record.youth_age_group);
      const matchesWorkStatus =
        exportFilters.workStatus.length === 0 ||
        exportFilters.workStatus.includes(record.work_status);
      const matchesEducation =
        exportFilters.education.length === 0 ||
        exportFilters.education.includes(record.highest_education);
      const matchesSex =
        exportFilters.sex.length === 0 ||
        exportFilters.sex.includes(record.sex);
      const matchesCivilStatus =
        exportFilters.civilStatus.length === 0 ||
        exportFilters.civilStatus.includes(record.civil_status);
      const matchesRegisteredVoter =
        exportFilters.registeredVoter.length === 0 ||
        exportFilters.registeredVoter.includes(record.registered_voter);
      const matchesVotedLastElection =
        exportFilters.votedLastElection.length === 0 ||
        exportFilters.votedLastElection.includes(record.voted_last_election);
      const matchesAttendedAssembly =
        exportFilters.attendedAssembly.length === 0 ||
        exportFilters.attendedAssembly.includes(record.attended_kk_assembly);

      return (
        matchesBarangay &&
        matchesClassification &&
        matchesAgeGroup &&
        matchesWorkStatus &&
        matchesEducation &&
        matchesSex &&
        matchesCivilStatus &&
        matchesRegisteredVoter &&
        matchesVotedLastElection &&
        matchesAttendedAssembly
      );
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    const dataToExport = getExportData();

    const headers = [
      "Name",
      "Age",
      "Birthday",
      "Sex",
      "Civil Status",
      "Barangay",
      "Classification",
      "Age Group",
      "Work Status",
      "Highest Education",
      "Registered Voter",
      "Voted Last Election",
      "Attended KK Assembly",
    ];

    const rows = dataToExport.map((item) => [
      item.name,
      item.age,
      format(new Date(item.birthday), "yyyy-MM-dd"),
      item.sex,
      item.civil_status,
      item.barangay,
      item.youth_classification,
      item.youth_age_group,
      item.work_status,
      item.highest_education,
      item.registered_voter,
      item.voted_last_election,
      item.attended_kk_assembly,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "youth_census_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show toast with export count
    toast.success(`Exported ${dataToExport.length} records to CSV`);
  };

  // Export to PDF
  const exportToPDF = () => {
    const dataToExport = getExportData();
    // This is a placeholder for PDF export functionality
    // In a real implementation, you would use a library like jspdf
    toast.info(
      `PDF export for ${dataToExport.length} records would be implemented here`
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBarangays([]);
    setSelectedClassifications([]);
    setSelectedAgeGroups([]);
    setSelectedWorkStatus([]);
    clearAdvancedFilters();
  };

  // Clear export filters
  const clearExportFilters = () => {
    setExportFilters({
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
    });
  };

  // Get counts for export filters
  const getExportCount = () => {
    const count = getExportData().length;
    return count;
  };

  return (
    <div className="w-full">
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
                      onClick={() => setIsExportFilterDialogOpen(true)}
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
                    <Button
                      variant="secondary"
                      onClick={exportToPDF}
                      className="flex-1 flex items-center gap-2 justify-center"
                      size="sm"
                    >
                      <File size={16} />
                      PDF
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
              placeholder="Search by name, barangay, classification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            {/* Advanced filters */}
            <AdvancedFilters
              selectedFilters={advancedFilters}
              onFilterChange={handleAdvancedFilterChange}
              onClearFilters={clearAdvancedFilters}
            />
            
            {/* Column visibility */}
            <ColumnVisibilityToggle
              columns={columns}
              onToggleColumn={toggleColumnVisibility}
            />

            {/* Clear filters button */}
            {(selectedBarangays.length > 0 ||
              selectedClassifications.length > 0 ||
              selectedAgeGroups.length > 0 ||
              selectedWorkStatus.length > 0 ||
              searchTerm ||
              advancedFilters.gender.length > 0 ||
              advancedFilters.votedLastElection.length > 0 ||
              advancedFilters.attendedAssembly.length > 0 ||
              advancedFilters.highestEducation.length > 0 ||
              advancedFilters.ageRange[0] !== 15 ||
              advancedFilters.ageRange[1] !== 30) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        </div>

        {/* Active filters display */}
        <div className="flex flex-wrap gap-2">
          {/* Age range badge */}
          {(advancedFilters.ageRange[0] !== 15 || advancedFilters.ageRange[1] !== 30) && (
            <Badge variant="outline" className="px-3 py-1">
              Age: {advancedFilters.ageRange[0]}-{advancedFilters.ageRange[1]}
              <button
                className="ml-2 text-muted-foreground hover:text-foreground"
                onClick={() => handleAdvancedFilterChange('ageRange', [15, 30] as [number, number])}
              >
                ×
              </button>
            </Badge>
          )}
          
          {/* Gender badges */}
          {advancedFilters.gender.map((gender) => (
            <Badge key={`badge-gender-${gender}`} variant="outline" className="px-3 py-1">
              {gender}
              <button
                className="ml-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  const newGenders = advancedFilters.gender.filter(g => g !== gender);
                  handleAdvancedFilterChange('gender', newGenders);
                }}
              >
                ×
              </button>
            </Badge>
          ))}
          
          {/* Voted badges */}
          {advancedFilters.votedLastElection.map((value) => (
            <Badge key={`badge-voted-${value}`} variant="outline" className="px-3 py-1">
              Voted: {value}
              <button
                className="ml-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  const newValues = advancedFilters.votedLastElection.filter(v => v !== value);
                  handleAdvancedFilterChange('votedLastElection', newValues);
                }}
              >
                ×
              </button>
            </Badge>
          ))}
          
          {/* Assembly badges */}
          {advancedFilters.attendedAssembly.map((value) => (
            <Badge key={`badge-assembly-${value}`} variant="outline" className="px-3 py-1">
              Assembly: {value}
              <button
                className="ml-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  const newValues = advancedFilters.attendedAssembly.filter(v => v !== value);
                  handleAdvancedFilterChange('attendedAssembly', newValues);
                }}
              >
                ×
              </button>
            </Badge>
          ))}
          
          {/* Education badges */}
          {advancedFilters.highestEducation.map((value) => (
            <Badge key={`badge-edu-${value}`} variant="outline" className="px-3 py-1">
              Education: {value}
              <button
                className="ml-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  const newValues = advancedFilters.highestEducation.filter(v => v !== value);
                  handleAdvancedFilterChange('highestEducation', newValues);
                }}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.find(col => col.key === "name")?.visible && (
                <TableHead>Name</TableHead>
              )}
              {columns.find(col => col.key === "age")?.visible && (
                <TableHead>Age</TableHead>
              )}
              {columns.find(col => col.key === "sex")?.visible && (
                <TableHead>Sex</TableHead>
              )}
              {columns.find(col => col.key === "barangay")?.visible && (
                <TableHead>Barangay</TableHead>
              )}
              {columns.find(col => col.key === "classification")?.visible && (
                <TableHead>Classification</TableHead>
              )}
              {columns.find(col => col.key === "ageGroup")?.visible && (
                <TableHead>Age Group</TableHead>
              )}
              {columns.find(col => col.key === "education")?.visible && (
                <TableHead>Education</TableHead>
              )}
              {columns.find(col => col.key === "work")?.visible && (
                <TableHead>Work Status</TableHead>
              )}
              {columns.find(col => col.key === "registeredVoter")?.visible && (
                <TableHead>Registered Voter</TableHead>
              )}
              {columns.find(col => col.key === "votedLastElection")?.visible && (
                <TableHead>Voted</TableHead>
              )}
              {columns.find(col => col.key === "attendedAssembly")?.visible && (
                <TableHead>Assembly</TableHead>
              )}
              {columns.find(col => col.key === "civilStatus")?.visible && (
                <TableHead>Civil Status</TableHead>
              )}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((record) => (
                <TableRow key={record.id}>
                  {columns.find(col => col.key === "name")?.visible && (
                    <TableCell className="font-medium">{record.name}</TableCell>
                  )}
                  {columns.find(col => col.key === "age")?.visible && (
                    <TableCell>{record.age}</TableCell>
                  )}
                  {columns.find(col => col.key === "sex")?.visible && (
                    <TableCell>{record.sex}</TableCell>
                  )}
                  {columns.find(col => col.key === "barangay")?.visible && (
                    <TableCell>{record.barangay}</TableCell>
                  )}
                  {columns.find(col => col.key === "classification")?.visible && (
                    <TableCell>{record.youth_classification}</TableCell>
                  )}
                  {columns.find(col => col.key === "ageGroup")?.visible && (
                    <TableCell>{record.youth_age_group}</TableCell>
                  )}
                  {columns.find(col => col.key === "education")?.visible && (
                    <TableCell>{record.highest_education}</TableCell>
                  )}
                  {columns.find(col => col.key === "work")?.visible && (
                    <TableCell>{record.work_status}</TableCell>
                  )}
                  {columns.find(col => col.key === "registeredVoter")?.visible && (
                    <TableCell>{record.registered_voter}</TableCell>
                  )}
                  {columns.find(col => col.key === "votedLastElection")?.visible && (
                    <TableCell>{record.voted_last_election}</TableCell>
                  )}
                  {columns.find(col => col.key === "attendedAssembly")?.visible && (
                    <TableCell>{record.attended_kk_assembly}</TableCell>
                  )}
                  {columns.find(col => col.key === "civilStatus")?.visible && (
                    <TableCell>{record.civil_status}</TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(record)}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      >
                        <Edit size={16} />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(record)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-4">
                  {filteredData.length === 0 && data.length > 0
                    ? "No records match the current filters"
                    : "No records found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {filteredData.length > 0 ? indexOfFirstItem + 1 : 0}-
          {Math.min(indexOfLastItem, filteredData.length)} of{" "}
          {filteredData.length} records
          {data.length !== filteredData.length &&
            ` (filtered from ${data.length} total)`}
        </div>
        {totalPages > 1 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Youth Record</DialogTitle>
            <DialogDescription>
              Update the information for this youth record. All fields can be edited.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] pr-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSaveEdit)} className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information Section */}
                  <div className="space-y-4 col-span-2">
                    <h3 className="text-lg font-medium border-b pb-2">Personal Information</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="sex"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sex</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sex" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {sexOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="civil_status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Civil Status</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select civil status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {civilStatusOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="birthday"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Birthday</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={`w-full justify-start text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="youth_age_group"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Youth Age Group</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select age group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {youthAgeGroupOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Location Information */}
                  <div className="space-y-4 col-span-2">
                    <h3 className="text-lg font-medium border-b pb-2">Location Information</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="barangay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Barangay</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select barangay" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {barangayOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="home_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Home Address</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select zone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {homeAddressOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Contact Information */}
                  <div className="space-y-4 col-span-2">
                    <h3 className="text-lg font-medium border-b pb-2">Contact Information</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="contact_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Education and Work */}
                  <div className="space-y-4 col-span-2">
                    <h3 className="text-lg font-medium border-b pb-2">Education & Work</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="youth_classification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Youth Classification</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select classification" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {youthClassificationOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="highest_education"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Highest Education</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select education level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {educationOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="work_status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Status</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select work status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {workStatusOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Civic Engagement */}
                  <div className="space-y-4 col-span-2">
                    <h3 className="text-lg font-medium border-b pb-2">Civic Engagement</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="registered_voter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registered Voter</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {voterOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="voted_last_election"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Voted Last Election</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {votedOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="attended_kk_assembly"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attended KK Assembly</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {assemblyOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="kk_assemblies_attended"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of KK Assemblies Attended</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                                value={field.value.toString()}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this record? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Filter Dialog */}
      <Dialog
        open={isExportFilterDialogOpen}
        onOpenChange={setIsExportFilterDialogOpen}
      >
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
                      onCheckedChange={() =>
                        toggleExportFilter(barangay, "barangays")
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
                      checked={exportFilters.classifications.includes(
                        classification
                      )}
                      onCheckedChange={() =>
                        toggleExportFilter(classification, "classifications")
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
                      checked={exportFilters.ageGroups.includes(ageGroup)}
                      onCheckedChange={() =>
                        toggleExportFilter(ageGroup, "ageGroups")
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
                      checked={exportFilters.workStatus.includes(status)}
                      onCheckedChange={() =>
                        toggleExportFilter(status, "workStatus")
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
                      checked={exportFilters.education.includes(education)}
                      onCheckedChange={() =>
                        toggleExportFilter(education, "education")
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
                      checked={exportFilters.sex.includes(sex)}
                      onCheckedChange={() => toggleExportFilter(sex, "sex")}
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
                      checked={exportFilters.civilStatus.includes(status)}
                      onCheckedChange={() =>
                        toggleExportFilter(status, "civilStatus")
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
                      checked={exportFilters.registeredVoter.includes(option)}
                      onCheckedChange={() =>
                        toggleExportFilter(option, "registeredVoter")
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
                      checked={exportFilters.votedLastElection.includes(option)}
                      onCheckedChange={() =>
                        toggleExportFilter(option, "votedLastElection")
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
                      checked={exportFilters.attendedAssembly.includes(option)}
                      onCheckedChange={() =>
                        toggleExportFilter(option, "attendedAssembly")
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
              onClick={clearExportFilters}
              className="w-full mt-4"
            >
              Clear All Filters
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportFilterDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsExportFilterDialogOpen(false);
                toast.success(
                  `Export filters applied (${getExportCount()} records selected)`
                );
              }}
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
