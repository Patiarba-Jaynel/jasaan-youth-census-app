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
import { FileText, File, Edit, Trash2, Search, Filter } from "lucide-react";
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
  SelectValue
} from "@/components/ui/select";
import { formSchema } from "@/lib/schema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

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
  
  // Filter states
  const [selectedBarangays, setSelectedBarangays] = useState<string[]>([]);
  const [selectedClassifications, setSelectedClassifications] = useState<string[]>([]);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);
  const [selectedWorkStatus, setSelectedWorkStatus] = useState<string[]>([]);
  
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
    attendedAssembly: [] as string[]
  });

  // Apply filters to data
  const filteredData = data.filter(record => {
    // Search term filter
    const matchesSearch = searchTerm === "" ||
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.barangay.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.youth_classification.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Dropdown filters
    const matchesBarangay = selectedBarangays.length === 0 || selectedBarangays.includes(record.barangay);
    const matchesClassification = selectedClassifications.length === 0 || selectedClassifications.includes(record.youth_classification);
    const matchesAgeGroup = selectedAgeGroups.length === 0 || selectedAgeGroups.includes(record.youth_age_group);
    const matchesWorkStatus = selectedWorkStatus.length === 0 || selectedWorkStatus.includes(record.work_status);
    
    return matchesSearch && matchesBarangay && matchesClassification && matchesAgeGroup && matchesWorkStatus;
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  // Reset pagination when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBarangays, selectedClassifications, selectedAgeGroups, selectedWorkStatus]);

  // Handle opening edit dialog
  const handleEdit = (record: YouthRecord) => {
    setSelectedRecord(record);
    setEditFormData({
      name: record.name,
      age: record.age,
      sex: record.sex,
      barangay: record.barangay,
      youth_classification: record.youth_classification,
      youth_age_group: record.youth_age_group,
      registered_voter: record.registered_voter,
    });
    setIsEditDialogOpen(true);
  };

  // Handle opening delete dialog
  const handleDelete = (record: YouthRecord) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  // Handle input change for edit form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select change for dropdowns
  const handleSelectChange = (value: string, fieldName: string) => {
    setEditFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  // Handle save edited record
  const handleSaveEdit = async () => {
    if (!selectedRecord) return;
    
    try {
      await pbClient.youth.update(selectedRecord.id, editFormData);
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
  const toggleFilter = (value: string, filterType: 'barangays' | 'classifications' | 'ageGroups' | 'workStatus') => {
    switch (filterType) {
      case 'barangays':
        setSelectedBarangays(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'classifications':
        setSelectedClassifications(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'ageGroups':
        setSelectedAgeGroups(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'workStatus':
        setSelectedWorkStatus(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
    }
  };

  // Toggle export filter selection
  const toggleExportFilter = (value: string, filterType: keyof typeof exportFilters) => {
    setExportFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value) 
        ? prev[filterType].filter(item => item !== value) 
        : [...prev[filterType], value]
    }));
  };

  // Filter data for export
  const getExportData = () => {
    return data.filter(record => {
      const matchesBarangay = exportFilters.barangays.length === 0 || exportFilters.barangays.includes(record.barangay);
      const matchesClassification = exportFilters.classifications.length === 0 || exportFilters.classifications.includes(record.youth_classification);
      const matchesAgeGroup = exportFilters.ageGroups.length === 0 || exportFilters.ageGroups.includes(record.youth_age_group);
      const matchesWorkStatus = exportFilters.workStatus.length === 0 || exportFilters.workStatus.includes(record.work_status);
      const matchesEducation = exportFilters.education.length === 0 || exportFilters.education.includes(record.highest_education);
      const matchesSex = exportFilters.sex.length === 0 || exportFilters.sex.includes(record.sex);
      const matchesCivilStatus = exportFilters.civilStatus.length === 0 || exportFilters.civilStatus.includes(record.civil_status);
      const matchesRegisteredVoter = exportFilters.registeredVoter.length === 0 || exportFilters.registeredVoter.includes(record.registered_voter);
      const matchesVotedLastElection = exportFilters.votedLastElection.length === 0 || exportFilters.votedLastElection.includes(record.voted_last_election);
      const matchesAttendedAssembly = exportFilters.attendedAssembly.length === 0 || exportFilters.attendedAssembly.includes(record.attended_kk_assembly);
      
      return matchesBarangay && matchesClassification && matchesAgeGroup && 
             matchesWorkStatus && matchesEducation && matchesSex && 
             matchesCivilStatus && matchesRegisteredVoter && 
             matchesVotedLastElection && matchesAttendedAssembly;
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
    toast.info(`PDF export for ${dataToExport.length} records would be implemented here`);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBarangays([]);
    setSelectedClassifications([]);
    setSelectedAgeGroups([]);
    setSelectedWorkStatus([]);
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
      attendedAssembly: []
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
            {/* Barangay filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter size={14} />
                  Barangay
                  {selectedBarangays.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedBarangays.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-0" align="start">
                <div className="p-4">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Barangay</h4>
                    <div className="grid gap-2 max-h-[200px] overflow-auto">
                      {barangayOptions.map((barangay) => (
                        <div key={barangay} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`barangay-${barangay}`}
                            checked={selectedBarangays.includes(barangay)}
                            onCheckedChange={() => toggleFilter(barangay, 'barangays')}
                          />
                          <label
                            htmlFor={`barangay-${barangay}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {barangay}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Classification filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter size={14} />
                  Classification
                  {selectedClassifications.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedClassifications.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-0" align="start">
                <div className="p-4">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Classification</h4>
                    <div className="grid gap-2">
                      {youthClassificationOptions.map((classification) => (
                        <div key={classification} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`classification-${classification}`}
                            checked={selectedClassifications.includes(classification)}
                            onCheckedChange={() => toggleFilter(classification, 'classifications')}
                          />
                          <label
                            htmlFor={`classification-${classification}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {classification}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Age Group filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter size={14} />
                  Age Group
                  {selectedAgeGroups.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedAgeGroups.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-0" align="start">
                <div className="p-4">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Age Group</h4>
                    <div className="grid gap-2">
                      {youthAgeGroupOptions.map((ageGroup) => (
                        <div key={ageGroup} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`age-group-${ageGroup}`}
                            checked={selectedAgeGroups.includes(ageGroup)}
                            onCheckedChange={() => toggleFilter(ageGroup, 'ageGroups')}
                          />
                          <label
                            htmlFor={`age-group-${ageGroup}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {ageGroup}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Work Status filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter size={14} />
                  Work Status
                  {selectedWorkStatus.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedWorkStatus.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-0" align="start">
                <div className="p-4">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Work Status</h4>
                    <div className="grid gap-2">
                      {workStatusOptions.map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`work-status-${status}`}
                            checked={selectedWorkStatus.includes(status)}
                            onCheckedChange={() => toggleFilter(status, 'workStatus')}
                          />
                          <label
                            htmlFor={`work-status-${status}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {status}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Clear filters button */}
            {(selectedBarangays.length > 0 || selectedClassifications.length > 0 || 
              selectedAgeGroups.length > 0 || selectedWorkStatus.length > 0 || searchTerm) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        
        {/* Active filters display */}
        {(selectedBarangays.length > 0 || selectedClassifications.length > 0 || 
          selectedAgeGroups.length > 0 || selectedWorkStatus.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {selectedBarangays.map(barangay => (
              <Badge key={`badge-barangay-${barangay}`} variant="outline" className="px-3 py-1">
                {barangay}
                <button 
                  className="ml-2 text-muted-foreground hover:text-foreground" 
                  onClick={() => toggleFilter(barangay, 'barangays')}
                >
                  ×
                </button>
              </Badge>
            ))}
            {selectedClassifications.map(classification => (
              <Badge key={`badge-class-${classification}`} variant="outline" className="px-3 py-1">
                {classification}
                <button 
                  className="ml-2 text-muted-foreground hover:text-foreground" 
                  onClick={() => toggleFilter(classification, 'classifications')}
                >
                  ×
                </button>
              </Badge>
            ))}
            {selectedAgeGroups.map(ageGroup => (
              <Badge key={`badge-age-${ageGroup}`} variant="outline" className="px-3 py-1">
                {ageGroup}
                <button 
                  className="ml-2 text-muted-foreground hover:text-foreground" 
                  onClick={() => toggleFilter(ageGroup, 'ageGroups')}
                >
                  ×
                </button>
              </Badge>
            ))}
            {selectedWorkStatus.map(status => (
              <Badge key={`badge-work-${status}`} variant="outline" className="px-3 py-1">
                {status}
                <button 
                  className="ml-2 text-muted-foreground hover:text-foreground" 
                  onClick={() => toggleFilter(status, 'workStatus')}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Sex</TableHead>
              <TableHead>Barangay</TableHead>
              <TableHead>Classification</TableHead>
              <TableHead>Age Group</TableHead>
              <TableHead>Registered Voter</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.name}</TableCell>
                  <TableCell>{record.age}</TableCell>
                  <TableCell>{record.sex}</TableCell>
                  <TableCell>{record.barangay}</TableCell>
                  <TableCell>{record.youth_classification}</TableCell>
                  <TableCell>{record.youth_age_group}</TableCell>
                  <TableCell>{record.registered_voter}</TableCell>
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
                <TableCell colSpan={8} className="text-center py-4">
                  {filteredData.length === 0 && data.length > 0 ? (
                    "No records match the current filters"
                  ) : (
                    "No records found"
                  )}
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
          {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} records
          {data.length !== filteredData.length && ` (filtered from ${data.length} total)`}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Youth Record</DialogTitle>
            <DialogDescription>
              Update the information for this youth record.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={editFormData.name || ""}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age" className="text-right">
                Age
              </Label>
              <Input
                id="age"
                name="age"
                value={editFormData.age || ""}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sex" className="text-right">
                Sex
              </Label>
              <Input
                id="sex"
                name="sex"
                value={editFormData.sex || ""}
                onChange={handleInputChange}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="barangay" className="text-right">
                Barangay
              </Label>
              <div className="col-span-3">
                <Select
                  value={editFormData.barangay || ""}
                  onValueChange={(value) => handleSelectChange(value, "barangay")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select barangay" />
                  </SelectTrigger>
                  <SelectContent>
                    {barangayOptions.map((barangay) => (
                      <SelectItem key={barangay} value={barangay}>
                        {barangay}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="classification" className="text-right">
                Classification
              </Label>
              <div className="col-span-3">
                <Select
                  value={editFormData.youth_classification || ""}
                  onValueChange={(value) => handleSelectChange(value, "youth_classification")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent>
                    {youthClassificationOptions.map((classification) => (
                      <SelectItem key={classification} value={classification}>
                        {classification}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Export Filter Dialog */}
      <Dialog open={isExportFilterDialogOpen} onOpenChange={setIsExportFilterDialogOpen}>
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
                  <div key={`export-barangay-${barangay}`} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`export-barangay-${barangay}`}
                      checked={exportFilters.barangays.includes(barangay)}
                      onCheckedChange={() => toggleExportFilter(barangay, 'barangays')}
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
                  <div key={`export-class-${classification}`} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`export-class-${classification}`}
                      checked={exportFilters.classifications.includes(classification)}
                      onCheckedChange={() => toggleExportFilter(classification, 'classifications')}
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
