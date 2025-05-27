
import { useState, useMemo } from "react";
import { YouthRecord } from "@/lib/pb-client";

export function useTableState(data: YouthRecord[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportFilterDialogOpen, setIsExportFilterDialogOpen] = useState(false);
  
  const [columns, setColumns] = useState([
    { key: "name", title: "Name", visible: true },
    { key: "age", title: "Age", visible: true },
    { key: "sex", title: "Sex", visible: true },
    { key: "barangay", title: "Barangay", visible: true },
    { key: "homeAddress", title: "Home Address", visible: false },
    { key: "classification", title: "Classification", visible: true },
    { key: "ageGroup", title: "Age Group", visible: false },
    { key: "education", title: "Education", visible: false },
    { key: "work", title: "Work Status", visible: false },
    { key: "registeredVoter", title: "Registered Voter", visible: false },
    { key: "votedLastElection", title: "Voted", visible: false },
    { key: "attendedAssembly", title: "Assembly", visible: false },
    { key: "assembliesAttended", title: "KK Assemblies", visible: false },
    { key: "civilStatus", title: "Civil Status", visible: false },
    { key: "birthday", title: "Birthday", visible: false },
    { key: "email", title: "Email", visible: false },
    { key: "contactNumber", title: "Contact Number", visible: false },
  ]);

  const [advancedFilters, setAdvancedFilters] = useState({
    ageRange: [15, 30] as [number, number],
    gender: [] as string[],
    votedLastElection: [] as string[],
    attendedAssembly: [] as string[],
    highestEducation: [] as string[],
    barangays: [] as string[],
    classifications: [] as string[],
    workStatus: [] as string[],
    civilStatus: [] as string[],
    registeredVoter: [] as string[],
  });

  const [exportFilters, setExportFilters] = useState({
    name: true,
    age: true,
    sex: true,
    barangay: true,
    homeAddress: true,
    classification: true,
    ageGroup: true,
    education: true,
    work: true,
    registeredVoter: true,
    votedLastElection: true,
    attendedAssembly: true,
    assembliesAttended: true,
    civilStatus: true,
    birthday: true,
    email: true,
    contactNumber: true,
  });

  const itemsPerPage = 25;

  const filteredData = useMemo(() => {
    return data.filter((record) => {
      const matchesSearch = Object.values(record).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesAge = 
        parseInt(record.age) >= advancedFilters.ageRange[0] &&
        parseInt(record.age) <= advancedFilters.ageRange[1];

      const matchesGender = 
        advancedFilters.gender.length === 0 || 
        advancedFilters.gender.includes(record.sex);

      const matchesVoted = 
        advancedFilters.votedLastElection.length === 0 || 
        advancedFilters.votedLastElection.includes(record.voted_last_election);

      const matchesAssembly = 
        advancedFilters.attendedAssembly.length === 0 || 
        advancedFilters.attendedAssembly.includes(record.attended_kk_assembly);

      const matchesEducation = 
        advancedFilters.highestEducation.length === 0 || 
        advancedFilters.highestEducation.includes(record.highest_education);

      const matchesBarangay = 
        advancedFilters.barangays.length === 0 || 
        advancedFilters.barangays.includes(record.barangay);

      const matchesClassification = 
        advancedFilters.classifications.length === 0 || 
        advancedFilters.classifications.includes(record.youth_classification);

      const matchesWorkStatus = 
        advancedFilters.workStatus.length === 0 || 
        advancedFilters.workStatus.includes(record.work_status);

      const matchesCivilStatus = 
        advancedFilters.civilStatus.length === 0 || 
        advancedFilters.civilStatus.includes(record.civil_status);

      const matchesRegisteredVoter = 
        advancedFilters.registeredVoter.length === 0 || 
        advancedFilters.registeredVoter.includes(record.registered_voter);

      return matchesSearch && matchesAge && matchesGender && matchesVoted && 
             matchesAssembly && matchesEducation && matchesBarangay && 
             matchesClassification && matchesWorkStatus && matchesCivilStatus && 
             matchesRegisteredVoter;
    });
  }, [data, searchTerm, advancedFilters]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const toggleColumnVisibility = (key: string) => {
    setColumns(prev => 
      prev.map(col => 
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleAdvancedFilterChange = (filterType: string, value: any) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setAdvancedFilters({
      ageRange: [15, 30],
      gender: [],
      votedLastElection: [],
      attendedAssembly: [],
      highestEducation: [],
      barangays: [],
      classifications: [],
      workStatus: [],
      civilStatus: [],
      registeredVoter: [],
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const hasActiveFilters = useMemo(() => {
    return searchTerm !== "" ||
           advancedFilters.ageRange[0] !== 15 ||
           advancedFilters.ageRange[1] !== 30 ||
           advancedFilters.gender.length > 0 ||
           advancedFilters.votedLastElection.length > 0 ||
           advancedFilters.attendedAssembly.length > 0 ||
           advancedFilters.highestEducation.length > 0 ||
           advancedFilters.barangays.length > 0 ||
           advancedFilters.classifications.length > 0 ||
           advancedFilters.workStatus.length > 0 ||
           advancedFilters.civilStatus.length > 0 ||
           advancedFilters.registeredVoter.length > 0;
  }, [searchTerm, advancedFilters]);

  const toggleExportFilter = (key: string) => {
    setExportFilters(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const clearExportFilters = () => {
    setExportFilters({
      name: false,
      age: false,
      sex: false,
      barangay: false,
      homeAddress: false,
      classification: false,
      ageGroup: false,
      education: false,
      work: false,
      registeredVoter: false,
      votedLastElection: false,
      attendedAssembly: false,
      assembliesAttended: false,
      civilStatus: false,
      birthday: false,
      email: false,
      contactNumber: false,
    });
  };

  const getExportData = () => {
    return filteredData.map(record => {
      const exportRecord: any = {};
      
      if (exportFilters.name) exportRecord.name = record.name;
      if (exportFilters.age) exportRecord.age = record.age;
      if (exportFilters.sex) exportRecord.sex = record.sex;
      if (exportFilters.barangay) exportRecord.barangay = record.barangay;
      if (exportFilters.homeAddress) exportRecord.home_address = record.home_address;
      if (exportFilters.classification) exportRecord.youth_classification = record.youth_classification;
      if (exportFilters.ageGroup) exportRecord.youth_age_group = record.youth_age_group;
      if (exportFilters.education) exportRecord.highest_education = record.highest_education;
      if (exportFilters.work) exportRecord.work_status = record.work_status;
      if (exportFilters.registeredVoter) exportRecord.registered_voter = record.registered_voter;
      if (exportFilters.votedLastElection) exportRecord.voted_last_election = record.voted_last_election;
      if (exportFilters.attendedAssembly) exportRecord.attended_kk_assembly = record.attended_kk_assembly;
      if (exportFilters.assembliesAttended) exportRecord.kk_assemblies_attended = record.kk_assemblies_attended;
      if (exportFilters.civilStatus) exportRecord.civil_status = record.civil_status;
      if (exportFilters.birthday) exportRecord.birthday = record.birthday;
      if (exportFilters.email) exportRecord.email_address = record.email_address;
      if (exportFilters.contactNumber) exportRecord.contact_number = record.contact_number;
      
      return exportRecord;
    });
  };

  const getExportCount = () => {
    const activeFilters = Object.values(exportFilters).filter(Boolean).length;
    return `${filteredData.length} records, ${activeFilters} fields`;
  };

  const exportToCSV = () => {
    const exportData = getExportData();
    if (exportData.length === 0) {
      return;
    }

    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'youth_census_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    // Data
    filteredData,
    currentItems,
    
    // Pagination
    currentPage,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    setCurrentPage,
    
    // Search
    searchTerm,
    setSearchTerm,
    
    // Columns
    columns,
    toggleColumnVisibility,
    
    // Advanced Filters
    advancedFilters,
    handleAdvancedFilterChange,
    clearAllFilters,
    hasActiveFilters,
    
    // Export
    exportFilters,
    toggleExportFilter,
    clearExportFilters,
    getExportData,
    getExportCount,
    exportToCSV,
    isExportFilterDialogOpen,
    setIsExportFilterDialogOpen,
  };
}
