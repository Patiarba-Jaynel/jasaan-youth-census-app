/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { 
  Plus, LogOut, Settings, Table, Edit, Trash2, Download, Upload, 
  BarChart3, Eye, FileSpreadsheet 
} from "lucide-react";
import { pbClient } from "@/lib/pb-client";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConsolidatedAnalytics } from "@/components/ConsolidatedAnalytics";
import { ConsolidatedDataForm } from "@/components/ConsolidatedDataForm";
import { ConsolidatedImportDialog } from "@/components/ConsolidatedImportDialog";
import * as XLSX from 'xlsx';
import { enumOptions } from "@/lib/schema";

interface ConsolidatedData {
  id: string;
  barangay: string;
  age_bracket: string;
  gender: string;
  year: number;
  month: string;
  count: number;
  created: string;
  updated: string;
}

// Define months array locally since it's not in enumOptions
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ConsolidatedDashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [consolidatedData, setConsolidatedData] = useState<ConsolidatedData[]>([]);
  const [filteredData, setFilteredData] = useState<ConsolidatedData[]>([]);
  const [filters, setFilters] = useState({
    barangay: "",
    ageBracket: "",
    gender: "",
    year: "",
    month: ""
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ConsolidatedData | null>(null);
  const [exportFilters, setExportFilters] = useState({
    year: new Date().getFullYear().toString(),
    month: "All"
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<ConsolidatedData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = pbClient.auth.isLoggedIn();

      if (!isLoggedIn) {
        toast.error("Authentication required", {
          description: "Please log in to access the dashboard.",
        });
        navigate("/login");
        return;
      }

      try {
        const records = await pbClient.consolidated.getAll();
        // Sort records alphabetically by barangay
        const sortedRecords = records.sort((a, b) => a.barangay.localeCompare(b.barangay));
        setConsolidatedData(sortedRecords);
        setFilteredData(sortedRecords);
      } catch (error) {
        console.error("Error fetching consolidated data:", error);
        toast.error("Failed to load consolidated data");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    let filtered = consolidatedData;

    if (filters.barangay && filters.barangay !== "All") {
      filtered = filtered.filter(item => 
        item.barangay.toLowerCase().includes(filters.barangay.toLowerCase())
      );
    }
    if (filters.ageBracket && filters.ageBracket !== "All") {
      filtered = filtered.filter(item => 
        item.age_bracket.toLowerCase().includes(filters.ageBracket.toLowerCase())
      );
    }
    if (filters.gender && filters.gender !== "All") {
      filtered = filtered.filter(item => 
        item.gender.toLowerCase().includes(filters.gender.toLowerCase())
      );
    }
    if (filters.year && filters.year !== "All") {
      filtered = filtered.filter(item => 
        item.year.toString().includes(filters.year)
      );
    }
    if (filters.month && filters.month !== "All") {
      filtered = filtered.filter(item => 
        item.month.toLowerCase().includes(filters.month.toLowerCase())
      );
    }

    // Sort filtered data alphabetically by barangay
    filtered.sort((a, b) => a.barangay.localeCompare(b.barangay));
    setFilteredData(filtered);
  }, [filters, consolidatedData]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      barangay: "",
      ageBracket: "",
      gender: "",
      year: "",
      month: ""
    });
  };

  const handleAddRecord = async (data: Omit<ConsolidatedData, 'id' | 'created' | 'updated'>) => {
    try {
      console.log('Adding new consolidated record:', data);
      await pbClient.consolidated.create(data);
      toast.success("Record added successfully");
      setIsAddDialogOpen(false);
      
      // Refresh data
      const records = await pbClient.consolidated.getAll();
      const sortedRecords = records.sort((a, b) => a.barangay.localeCompare(b.barangay));
      setConsolidatedData(sortedRecords);
      setFilteredData(sortedRecords);
    } catch (error) {
      console.error("Error adding record:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to add record: ${errorMessage}`);
    }
  };

  const handleEditRecord = (record: ConsolidatedData) => {
    console.log('Editing record:', record);
    setSelectedRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleUpdateRecord = async (data: Omit<ConsolidatedData, 'id' | 'created' | 'updated'>) => {
    if (!selectedRecord) {
      console.error('No record selected for update');
      return;
    }

    try {
      console.log('Updating consolidated record:', selectedRecord.id, 'with data:', data);
      await pbClient.consolidated.update(selectedRecord.id, data);
      toast.success("Record updated successfully");
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
      
      // Refresh data
      const records = await pbClient.consolidated.getAll();
      const sortedRecords = records.sort((a, b) => a.barangay.localeCompare(b.barangay));
      setConsolidatedData(sortedRecords);
      setFilteredData(sortedRecords);
    } catch (error) {
      console.error("Error updating record:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to update record: ${errorMessage}`);
    }
  };

  const handleDeleteRecord = async (record: ConsolidatedData) => {
    console.log('Preparing to delete record:', record);
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) {
      console.error('No record selected for deletion');
      return;
    }

    try {
      console.log('Deleting consolidated record:', recordToDelete.id);
      await pbClient.consolidated.delete(recordToDelete.id);
      toast.success("Record deleted successfully");
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
      
      // Refresh data
      const records = await pbClient.consolidated.getAll();
      const sortedRecords = records.sort((a, b) => a.barangay.localeCompare(b.barangay));
      setConsolidatedData(sortedRecords);
      setFilteredData(sortedRecords);
    } catch (error) {
      console.error("Error deleting record:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to delete record: ${errorMessage}`);
    }
  };

  const downloadTemplate = () => {
    // Create template with proper format matching the image
    const template = [{
      BARANGAY: "APLAYA",
      "UNDER 1 M": 0,
      "UNDER 1 F": 0,
      "UNDER 1 TOTAL": 0,
      "1-4 M": 0,
      "1-4 F": 0,
      "1-4 TOTAL": 0,
      "5-9 M": 0,
      "5-9 F": 0,
      "5-9 TOTAL": 0,
      "10-14 M": 0,
      "10-14 F": 0,
      "10-14 TOTAL": 0,
      "15-19 M": 0,
      "15-19 F": 0,
      "15-19 TOTAL": 0,
      "20-24 M": 0,
      "20-24 F": 0,
      "20-24 TOTAL": 0,
      "25-29 M": 0,
      "25-29 F": 0,
      "25-29 TOTAL": 0,
      "TOTAL M": 0,
      "TOTAL F": 0,
      "TOTAL": 0
    }];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Consolidated Data Template");

    XLSX.writeFile(workbook, "consolidated_data_template.xlsx");
    toast.success("Template downloaded successfully");
  };

  const exportToExcel = () => {
    // Filter data based on export filters
    let dataToExport = consolidatedData;
    
    if (exportFilters.year !== "All") {
      dataToExport = dataToExport.filter(record => 
        record.year.toString() === exportFilters.year
      );
    }
    
    if (exportFilters.month !== "All") {
      dataToExport = dataToExport.filter(record => 
        record.month === exportFilters.month
      );
    }

    // Transform data to match the format in the image
    const barangayData = new Map();
    
    // Initialize all barangays with zero counts
    enumOptions.barangay.forEach(barangay => {
      barangayData.set(barangay, {
        BARANGAY: barangay,
        "UNDER 1 M": 0,
        "UNDER 1 F": 0,
        "1-4 M": 0,
        "1-4 F": 0,
        "5-9 M": 0,
        "5-9 F": 0,
        "10-14 M": 0,
        "10-14 F": 0,
        "15-19 M": 0,
        "15-19 F": 0,
        "20-24 M": 0,
        "20-24 F": 0,
        "25-29 M": 0,
        "25-29 F": 0,
      });
    });

    // Populate data from filtered consolidated data
    dataToExport.forEach(record => {
      const barangayRow = barangayData.get(record.barangay);
      if (barangayRow) {
        const genderSuffix = record.gender === "Male" ? " M" : " F";
        const ageKey = record.age_bracket + genderSuffix;
        if (barangayRow[ageKey] !== undefined) {
          barangayRow[ageKey] += record.count;
        }
      }
    });

    // Calculate totals for each row
    const exportData = Array.from(barangayData.values()).map(row => {
      const under1Total = row["UNDER 1 M"] + row["UNDER 1 F"];
      const age1to4Total = row["1-4 M"] + row["1-4 F"];
      const age5to9Total = row["5-9 M"] + row["5-9 F"];
      const age10to14Total = row["10-14 M"] + row["10-14 F"];
      const age15to19Total = row["15-19 M"] + row["15-19 F"];
      const age20to24Total = row["20-24 M"] + row["20-24 F"];
      const age25to29Total = row["25-29 M"] + row["25-29 F"];
      
      const totalM = row["UNDER 1 M"] + row["1-4 M"] + row["5-9 M"] + row["10-14 M"] + 
                     row["15-19 M"] + row["20-24 M"] + row["25-29 M"];
      const totalF = row["UNDER 1 F"] + row["1-4 F"] + row["5-9 F"] + row["10-14 F"] + 
                     row["15-19 F"] + row["20-24 F"] + row["25-29 F"];

      return {
        ...row,
        "UNDER 1 TOTAL": under1Total,
        "1-4 TOTAL": age1to4Total,
        "5-9 TOTAL": age5to9Total,
        "10-14 TOTAL": age10to14Total,
        "15-19 TOTAL": age15to19Total,
        "20-24 TOTAL": age20to24Total,
        "25-29 TOTAL": age25to29Total,
        "TOTAL M": totalM,
        "TOTAL F": totalF,
        "TOTAL": totalM + totalF
      };
    });

    // Calculate grand totals
    const grandTotals = {
      BARANGAY: "GRAND TOTAL",
      "UNDER 1 M": exportData.reduce((sum, row) => sum + row["UNDER 1 M"], 0),
      "UNDER 1 F": exportData.reduce((sum, row) => sum + row["UNDER 1 F"], 0),
      "UNDER 1 TOTAL": exportData.reduce((sum, row) => sum + row["UNDER 1 TOTAL"], 0),
      "1-4 M": exportData.reduce((sum, row) => sum + row["1-4 M"], 0),
      "1-4 F": exportData.reduce((sum, row) => sum + row["1-4 F"], 0),
      "1-4 TOTAL": exportData.reduce((sum, row) => sum + row["1-4 TOTAL"], 0),
      "5-9 M": exportData.reduce((sum, row) => sum + row["5-9 M"], 0),
      "5-9 F": exportData.reduce((sum, row) => sum + row["5-9 F"], 0),
      "5-9 TOTAL": exportData.reduce((sum, row) => sum + row["5-9 TOTAL"], 0),
      "10-14 M": exportData.reduce((sum, row) => sum + row["10-14 M"], 0),
      "10-14 F": exportData.reduce((sum, row) => sum + row["10-14 F"], 0),
      "10-14 TOTAL": exportData.reduce((sum, row) => sum + row["10-14 TOTAL"], 0),
      "15-19 M": exportData.reduce((sum, row) => sum + row["15-19 M"], 0),
      "15-19 F": exportData.reduce((sum, row) => sum + row["15-19 F"], 0),
      "15-19 TOTAL": exportData.reduce((sum, row) => sum + row["15-19 TOTAL"], 0),
      "20-24 M": exportData.reduce((sum, row) => sum + row["20-24 M"], 0),
      "20-24 F": exportData.reduce((sum, row) => sum + row["20-24 F"], 0),
      "20-24 TOTAL": exportData.reduce((sum, row) => sum + row["20-24 TOTAL"], 0),
      "25-29 M": exportData.reduce((sum, row) => sum + row["25-29 M"], 0),
      "25-29 F": exportData.reduce((sum, row) => sum + row["25-29 F"], 0),
      "25-29 TOTAL": exportData.reduce((sum, row) => sum + row["25-29 TOTAL"], 0),
      "TOTAL M": exportData.reduce((sum, row) => sum + row["TOTAL M"], 0),
      "TOTAL F": exportData.reduce((sum, row) => sum + row["TOTAL F"], 0),
      "TOTAL": exportData.reduce((sum, row) => sum + row["TOTAL"], 0)
    };

    // Add grand totals row
    exportData.push(grandTotals);

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([]);

    // Improved header design
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const yearText = exportFilters.year === "All" ? "All Years" : exportFilters.year;
    const monthText = exportFilters.month === "All" ? "All Months" : exportFilters.month;
    
    // Create header section with better spacing and formatting
    const headerData = [
      ["YOUTH CENSUS DATA REPORT"],
      [`Municipality of Jasaan, Misamis Oriental`],
      [``],
      [`Report Period: ${monthText} ${yearText}`],
      [`Generated: ${currentDate}`],
      [`Total Records: ${dataToExport.length} entries`],
      [``],
      [``]
    ];

    // Add header to worksheet
    XLSX.utils.sheet_add_aoa(worksheet, headerData, { origin: 'A1' });

    // Add main data starting from row 9
    XLSX.utils.sheet_add_json(worksheet, exportData, { 
      origin: 'A9',
      skipHeader: false 
    });

    // Enhanced column formatting
    const colWidths = [
      { wch: 18 }, // BARANGAY (wider for readability)
      { wch: 10 }, { wch: 10 }, { wch: 12 }, // UNDER 1
      { wch: 10 }, { wch: 10 }, { wch: 12 }, // 1-4
      { wch: 10 }, { wch: 10 }, { wch: 12 }, // 5-9
      { wch: 10 }, { wch: 10 }, { wch: 12 }, // 10-14
      { wch: 10 }, { wch: 10 }, { wch: 12 }, // 15-19
      { wch: 10 }, { wch: 10 }, { wch: 12 }, // 20-24
      { wch: 10 }, { wch: 10 }, { wch: 12 }, // 25-29
      { wch: 12 }, { wch: 12 }, { wch: 14 }  // TOTALS (wider)
    ];
    worksheet['!cols'] = colWidths;

    // Merge cells for title and subtitle
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push(
      { s: { r: 0, c: 0 }, e: { r: 0, c: 24 } }, // Title row
      { s: { r: 1, c: 0 }, e: { r: 1, c: 24 } }, // Subtitle row
      { s: { r: 3, c: 0 }, e: { r: 3, c: 24 } }, // Period row
      { s: { r: 4, c: 0 }, e: { r: 4, c: 24 } }, // Generated row
      { s: { r: 5, c: 0 }, e: { r: 5, c: 24 } }  // Total records row
    );

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Youth Census Data");

    // Generate improved filename
    const yearPart = exportFilters.year === "All" ? "AllYears" : exportFilters.year;
    const monthPart = exportFilters.month === "All" ? "AllMonths" : exportFilters.month.replace(/\s+/g, "");
    const datePart = new Date().toISOString().split('T')[0];
    const fileName = `YouthCensus_${yearPart}_${monthPart}_${datePart}.xlsx`;

    // Write file
    XLSX.writeFile(workbook, fileName);
    
    toast.success(`Excel report exported: ${fileName}`, {
      description: `Data for ${monthText} ${yearText} has been successfully exported.`
    });
  };

  const handleImportData = async (importedData: any[]) => {
    try {
      console.log("Processing imported data:", importedData);
      let totalRecordsAdded = 0;
      
      for (const row of importedData) {
        // Process each age group and gender combination
        const ageGroups = ["UNDER 1", "1-4", "5-9", "10-14", "15-19", "20-24", "25-29"];
        
        for (const ageGroup of ageGroups) {
          const maleKey = `${ageGroup} M`;
          const femaleKey = `${ageGroup} F`;
          
          const maleCount = parseInt(row[maleKey]) || 0;
          const femaleCount = parseInt(row[femaleKey]) || 0;

          // Create records for male count if > 0
          if (maleCount > 0) {
            await pbClient.consolidated.create({
              barangay: row.BARANGAY,
              age_bracket: ageGroup,
              gender: "Male",
              year: new Date().getFullYear(),
              month: "January",
              count: maleCount
            });
            totalRecordsAdded++;
          }

          // Create records for female count if > 0
          if (femaleCount > 0) {
            await pbClient.consolidated.create({
              barangay: row.BARANGAY,
              age_bracket: ageGroup,
              gender: "Female",
              year: new Date().getFullYear(),
              month: "January",
              count: femaleCount
            });
            totalRecordsAdded++;
          }
        }
      }

      // Refresh data
      const records = await pbClient.consolidated.getAll();
      const sortedRecords = records.sort((a, b) => a.barangay.localeCompare(b.barangay));
      setConsolidatedData(sortedRecords);
      setFilteredData(sortedRecords);
      toast.success(`Successfully imported ${totalRecordsAdded} records from ${importedData.length} barangays`);
    } catch (error) {
      console.error("Error importing data:", error);
      toast.error(`Failed to import data: ${error.message || 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <p className="text-lg">Loading consolidated data...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Consolidated Data Dashboard</h1>
              <p className="text-muted-foreground">
                Demographics and analytics for consolidated population census data
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
              <Button
                onClick={() => navigate("/dashboard/consolidated/activity")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings size={16} />
                Activity & Batch Management
              </Button>
              <Button
                onClick={() => navigate("/dashboard/settings")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings size={16} />
                Settings
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Table size={16} />
                Main Dashboard
              </Button>
            </div>
          </div>

          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 size={16} />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Eye size={16} />
                Data Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="mt-6">
              <ConsolidatedAnalytics data={consolidatedData} />
            </TabsContent>

            <TabsContent value="data" className="mt-6">
              {/* Export Controls */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Export Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Export Year</label>
                      <Select 
                        value={exportFilters.year} 
                        onValueChange={(value) => setExportFilters(prev => ({ ...prev, year: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Years</SelectItem>
                          {Array.from(new Set(consolidatedData.map(d => d.year.toString()))).sort().map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                          {/* Add future years dynamically */}
                          {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i + 1).map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Export Month</label>
                      <Select 
                        value={exportFilters.month} 
                        onValueChange={(value) => setExportFilters(prev => ({ ...prev, month: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Months</SelectItem>
                          {months.map(month => (
                            <SelectItem key={month} value={month}>{month}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={exportToExcel} className="flex items-center gap-2 w-full">
                        <Download size={16} />
                        Export Excel
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {exportFilters.year === "All" && exportFilters.month === "All" 
                      ? `Exporting all ${consolidatedData.length} records`
                      : `Exporting filtered data for ${exportFilters.month === "All" ? "all months" : exportFilters.month} ${exportFilters.year === "All" ? "all years" : exportFilters.year}`
                    }
                  </div>
                </CardContent>
              </Card>

              {/* Filters Section */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Data Filters & Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Barangay</label>
                      <Select value={filters.barangay} onValueChange={(value) => handleFilterChange("barangay", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select barangay" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Barangays</SelectItem>
                          {enumOptions.barangay.map((barangay) => (
                            <SelectItem key={barangay} value={barangay}>
                              {barangay}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Age Bracket</label>
                      <Select value={filters.ageBracket} onValueChange={(value) => handleFilterChange("ageBracket", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select age bracket" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Age Brackets</SelectItem>
                          {["UNDER 1", "1-4", "5-9", "10-14", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75-79", "80+"].map((bracket) => (
                            <SelectItem key={bracket} value={bracket}>
                              {bracket}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Gender</label>
                      <Select value={filters.gender} onValueChange={(value) => handleFilterChange("gender", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Genders</SelectItem>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Year</label>
                      <Select value={filters.year} onValueChange={(value) => handleFilterChange("year", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Years</SelectItem>
                          {Array.from(new Set(consolidatedData.map(d => d.year.toString()))).sort().map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Month</label>
                      <Select value={filters.month} onValueChange={(value) => handleFilterChange("month", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Months</SelectItem>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                    <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
                      <Plus size={16} />
                      Add Record
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsImportDialogOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Upload size={16} />
                      Import Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Active Filters */}
              {Object.values(filters).some(filter => filter !== "") && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(filters).map(([key, value]) => 
                    value && (
                      <Badge key={key} variant="outline" className="px-3 py-1">
                        {key}: {value}
                        <button
                          className="ml-2 text-muted-foreground hover:text-foreground"
                          onClick={() => handleFilterChange(key, "")}
                        >
                          ×
                        </button>
                      </Badge>
                    )
                  )}
                </div>
              )}

              {/* Data Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="border rounded-md">
                    <UITable>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Barangay</TableHead>
                          <TableHead>Age Bracket</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Year</TableHead>
                          <TableHead>Month</TableHead>
                          <TableHead>Count</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.length > 0 ? (
                          filteredData.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell className="font-medium">{record.barangay}</TableCell>
                              <TableCell>{record.age_bracket}</TableCell>
                              <TableCell>{record.gender}</TableCell>
                              <TableCell>{record.year}</TableCell>
                              <TableCell>{record.month}</TableCell>
                              <TableCell className="font-semibold">{record.count}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditRecord(record)}
                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                                  >
                                    <Edit size={16} />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteRecord(record)}
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
                            <TableCell colSpan={7} className="text-center py-8">
                              No records found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </UITable>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <div className="mt-6 text-sm text-muted-foreground">
                Showing {filteredData.length} of {consolidatedData.length} records
              </div>
            </TabsContent>
          </Tabs>

          {/* Add Record Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Record</DialogTitle>
              </DialogHeader>
              <ConsolidatedDataForm
                onSubmit={handleAddRecord}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {/* Edit Record Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Record</DialogTitle>
              </DialogHeader>
              {selectedRecord && (
                <ConsolidatedDataForm
                  initialData={selectedRecord}
                  onSubmit={handleUpdateRecord}
                  onCancel={() => {
                    setIsEditDialogOpen(false);
                    setSelectedRecord(null);
                  }}
                  isEditing
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <DialogTitle className="text-center">Delete Record</DialogTitle>
                <div className="text-center text-sm text-muted-foreground">
                  Are you sure you want to delete this record?
                  {recordToDelete && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <strong>{recordToDelete.barangay}</strong> - {recordToDelete.age_bracket} - {recordToDelete.gender}<br/>
                      {recordToDelete.month} {recordToDelete.year} - Count: {recordToDelete.count}
                    </div>
                  )}
                  This action cannot be undone.
                </div>
              </DialogHeader>
              <div className="flex justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setRecordToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Import Dialog */}
          <ConsolidatedImportDialog
            open={isImportDialogOpen}
            onClose={() => setIsImportDialogOpen(false)}
            onImport={handleImportData}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ConsolidatedDashboardPage;
