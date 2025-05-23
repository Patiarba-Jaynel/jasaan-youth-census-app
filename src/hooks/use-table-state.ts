import { useState, useEffect } from 'react';
import { YouthRecord } from '@/lib/pb-client';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';
import { standardizeRecordFields } from "@/lib/standardize";

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
    { key: "assembliesAttended", title: "KK Assemblies Attended", visible: false },
    { key: "civilStatus", title: "Civil Status", visible: false },
    { key: "homeAddress", title: "Home Address", visible: false },
    { key: "birthday", title: "Birthday", visible: false },
  ]);

  // Export filter dialog state
  const [isExportFilterDialogOpen, setIsExportFilterDialogOpen] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBarangays, setSelectedBarangays] = useState<string[]>([]);
  const [selectedClassifications, setSelectedClassifications] = useState<string[]>([]);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);
  const [selectedWorkStatus, setSelectedWorkStatus] = useState<string[]>([]);

  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState({
    ageRange: [15, 30] as [number, number],
    gender: [] as string[],
    votedLastElection: [] as string[],
    attendedAssembly: [] as string[],
    highestEducation: [] as string[],
  });

  // Export filters state
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

  // Selected records state
  const [selectedRecords, setSelectedRecords] = useState<YouthRecord[]>([]);

  // Filtered data based on search and filters
  const filteredData = data.filter((record) => {
    // Search through all columns if searchTerm is not empty
    const matchesSearch = searchTerm === "" || Object.entries(record).some(([key, value]) => {
      // Exclude id and other non-searchable fields
      if (key === 'id' || value === null || value === undefined) return false;
      
      // Convert value to string and check if it includes the search term
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });

    const matchesBarangay =
      selectedBarangays.length === 0 || selectedBarangays.includes(record.barangay);

    const matchesClassification =
      selectedClassifications.length === 0 || selectedClassifications.includes(record.youth_classification);

    const matchesAgeGroup =
      selectedAgeGroups.length === 0 || selectedAgeGroups.includes(record.youth_age_group);

    const matchesWorkStatus =
      selectedWorkStatus.length === 0 || selectedWorkStatus.includes(record.work_status);

    const age = parseInt(record.age);
    const matchesAgeRange =
      isNaN(age) || (age >= advancedFilters.ageRange[0] && age <= advancedFilters.ageRange[1]);

    const matchesGender =
      advancedFilters.gender.length === 0 || advancedFilters.gender.includes(record.sex);

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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedBarangays,
    selectedClassifications,
    selectedAgeGroups,
    selectedWorkStatus,
    advancedFilters,
  ]);

  // Handle advanced filter changes
  type AdvancedFilterKey = keyof typeof advancedFilters;
  type AdvancedFilterValue = number[] | [number, number] | string[];
  const handleAdvancedFilterChange = (filterType: AdvancedFilterKey, value: AdvancedFilterValue) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Clear advanced filters
  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      ageRange: [15, 30],
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

  // Toggle basic filters
  const toggleFilter = (value: string, filterType: "barangays" | "classifications" | "ageGroups" | "workStatus") => {
    switch (filterType) {
      case "barangays":
        setSelectedBarangays(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
        break;
      case "classifications":
        setSelectedClassifications(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
        break;
      case "ageGroups":
        setSelectedAgeGroups(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
        break;
      case "workStatus":
        setSelectedWorkStatus(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
        break;
    }
  };

  // Toggle export filters
  const toggleExportFilter = (value: string, filterType: keyof typeof exportFilters) => {
    setExportFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value],
    }));
  };

  // Get export data
  const getExportData = () => {
    // Standardize the data before filtering
    const standardizedData = data.map(record => standardizeRecordFields(record));
    return standardizedData.filter((record) => {
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

  // Export to CSV with SOLANA barangay added
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
      "Home Address",
      "Registered Voter",
      "Voted Last Election",
      "Attended KK Assembly",
      "KK Assemblies Attended"
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
      item.home_address || "", // ✅ NEW FIELD
      item.registered_voter,
      item.voted_last_election,
      item.attended_kk_assembly,
      item.attended_kk_assembly === "Yes" ? (item.kk_assemblies_attended || "0") : "0"
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(",")),
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
    toast.success(`Exported ${dataToExport.length} records to CSV`);
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

  // Get export count
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
    currentPage,
    setCurrentPage,
    itemsPerPage,
    indexOfFirstItem,
    indexOfLastItem,
    totalPages,
    filteredData,
    currentItems,
    columns,
    toggleColumnVisibility,
    searchTerm,
    setSearchTerm,
    selectedBarangays,
    selectedClassifications,
    selectedAgeGroups,
    selectedWorkStatus,
    toggleFilter,
    advancedFilters,
    handleAdvancedFilterChange,
    clearAdvancedFilters,
    hasActiveFilters: hasActiveFilters(),
    clearAllFilters,
    exportFilters,
    toggleExportFilter,
    clearExportFilters,
    isExportFilterDialogOpen,
    setIsExportFilterDialogOpen,
    getExportCount,
    getExportData,
    exportToCSV,
    selectedRecords,
    setSelectedRecords,
  };
}
