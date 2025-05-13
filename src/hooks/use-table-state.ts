
import { useState, useEffect } from 'react';
import { YouthRecord } from '@/lib/pb-client';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';

export function useTableState(data: YouthRecord[]) {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // State for column visibility
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

  // State for filter dialogs
  const [isExportFilterDialogOpen, setIsExportFilterDialogOpen] = useState(false);

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBarangays, setSelectedBarangays] = useState<string[]>([]);
  const [selectedClassifications, setSelectedClassifications] = useState<string[]>([]);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);
  const [selectedWorkStatus, setSelectedWorkStatus] = useState<string[]>([]);

  // Advanced filter states
  const [advancedFilters, setAdvancedFilters] = useState({
    ageRange: [15, 30] as [number, number],
    gender: [] as string[],
    votedLastElection: [] as string[],
    attendedAssembly: [] as string[],
    highestEducation: [] as string[],
  });

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

  // Handle advanced filter changes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // Toggle column visibility
  const toggleColumnVisibility = (key: string) => {
    setColumns(cols => cols.map(col => 
      col.key === key ? { ...col, visible: !col.visible } : col
    ));
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
    toast.info(
      `PDF export for ${dataToExport.length} records would be implemented here`
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
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
    return getExportData().length;
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      selectedBarangays.length > 0 ||
      selectedClassifications.length > 0 ||
      selectedAgeGroups.length > 0 ||
      selectedWorkStatus.length > 0 ||
      searchTerm.length > 0 ||
      advancedFilters.gender.length > 0 ||
      advancedFilters.votedLastElection.length > 0 ||
      advancedFilters.attendedAssembly.length > 0 ||
      advancedFilters.highestEducation.length > 0 ||
      advancedFilters.ageRange[0] !== 15 ||
      advancedFilters.ageRange[1] !== 30
    );
  };

  return {
    // Pagination
    currentPage,
    setCurrentPage,
    itemsPerPage,
    indexOfFirstItem,
    indexOfLastItem,
    totalPages,

    // Data
    filteredData,
    currentItems,

    // Column visibility
    columns,
    toggleColumnVisibility,

    // Search and filters
    searchTerm,
    setSearchTerm,
    selectedBarangays,
    selectedClassifications,
    selectedAgeGroups,
    selectedWorkStatus,
    toggleFilter,

    // Advanced filters
    advancedFilters,
    handleAdvancedFilterChange,
    clearAdvancedFilters,
    hasActiveFilters: hasActiveFilters(),
    clearAllFilters,

    // Export filters
    exportFilters,
    toggleExportFilter,
    clearExportFilters,
    isExportFilterDialogOpen,
    setIsExportFilterDialogOpen,
    getExportCount,
    getExportData,
    exportToCSV,
    exportToPDF,
  };
}
