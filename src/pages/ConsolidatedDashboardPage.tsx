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
import { ConsolidatedAnalytics } from "@/components/ConsolidatedAnalytics";
import { ConsolidatedDataForm } from "@/components/ConsolidatedDataForm";
import * as XLSX from 'xlsx';

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
  const [selectedRecord, setSelectedRecord] = useState<ConsolidatedData | null>(null);
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
        setConsolidatedData(records);
        setFilteredData(records);
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

    if (filters.barangay) {
      filtered = filtered.filter(item => 
        item.barangay.toLowerCase().includes(filters.barangay.toLowerCase())
      );
    }
    if (filters.ageBracket) {
      filtered = filtered.filter(item => 
        item.age_bracket.toLowerCase().includes(filters.ageBracket.toLowerCase())
      );
    }
    if (filters.gender) {
      filtered = filtered.filter(item => 
        item.gender.toLowerCase().includes(filters.gender.toLowerCase())
      );
    }
    if (filters.year) {
      filtered = filtered.filter(item => 
        item.year.toString().includes(filters.year)
      );
    }
    if (filters.month) {
      filtered = filtered.filter(item => 
        item.month.toLowerCase().includes(filters.month.toLowerCase())
      );
    }

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
      await pbClient.consolidated.create(data);
      toast.success("Record added successfully");
      setIsAddDialogOpen(false);
      // Refresh data
      const records = await pbClient.consolidated.getAll();
      setConsolidatedData(records);
      setFilteredData(records);
    } catch (error) {
      console.error("Error adding record:", error);
      toast.error("Failed to add record");
    }
  };

  const handleEditRecord = (record: ConsolidatedData) => {
    setSelectedRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleUpdateRecord = async (data: Omit<ConsolidatedData, 'id' | 'created' | 'updated'>) => {
    if (!selectedRecord) return;

    try {
      await pbClient.consolidated.update(selectedRecord.id, data);
      toast.success("Record updated successfully");
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
      // Refresh data
      const records = await pbClient.consolidated.getAll();
      setConsolidatedData(records);
      setFilteredData(records);
    } catch (error) {
      console.error("Error updating record:", error);
      toast.error("Failed to update record");
    }
  };

  const handleDeleteRecord = async (record: ConsolidatedData) => {
    if (confirm(`Are you sure you want to delete this record for ${record.barangay}?`)) {
      try {
        await pbClient.consolidated.delete(record.id);
        toast.success("Record deleted successfully");
        // Refresh data
        const records = await pbClient.consolidated.getAll();
        setConsolidatedData(records);
        setFilteredData(records);
      } catch (error) {
        console.error("Error deleting record:", error);
        toast.error("Failed to delete record");
      }
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData.map(record => ({
      Barangay: record.barangay,
      'Age Bracket': record.age_bracket,
      Gender: record.gender,
      Year: record.year,
      Month: record.month,
      Count: record.count,
      Created: new Date(record.created).toLocaleDateString(),
      Updated: new Date(record.updated).toLocaleDateString()
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Consolidated Data");

    XLSX.writeFile(workbook, `consolidated_data_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Data exported to Excel successfully");
  };

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log('Imported data:', jsonData);
        toast.info(`Imported ${jsonData.length} records. Processing...`);

        // Process and validate the imported data
        // This is a basic implementation - you might want to add more validation
        for (const row of jsonData as any[]) {
          if (row.Barangay && row['Age Bracket'] && row.Gender && row.Count) {
            await pbClient.consolidated.create({
              barangay: row.Barangay,
              age_bracket: row['Age Bracket'],
              gender: row.Gender,
              year: row.Year || new Date().getFullYear(),
              month: row.Month || 'January',
              count: parseInt(row.Count) || 0
            });
          }
        }

        // Refresh data
        const records = await pbClient.consolidated.getAll();
        setConsolidatedData(records);
        setFilteredData(records);
        toast.success("Data imported successfully");
      } catch (error) {
        console.error("Error importing data:", error);
        toast.error("Failed to import data");
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Reset input
    event.target.value = '';
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
                Demographics and analytics for consolidated youth census data
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
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
              <Button
                onClick={() => {
                  pbClient.auth.logout();
                  document.dispatchEvent(new CustomEvent("auth-change"));
                  toast.success("Logged out successfully");
                  navigate("/");
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
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
              {/* Filters Section */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Filters & Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Barangay</label>
                      <Input
                        placeholder="Filter by barangay..."
                        value={filters.barangay}
                        onChange={(e) => handleFilterChange("barangay", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Age Bracket</label>
                      <Input
                        placeholder="e.g., 0-4, 5-9..."
                        value={filters.ageBracket}
                        onChange={(e) => handleFilterChange("ageBracket", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Gender</label>
                      <Input
                        placeholder="Male/Female"
                        value={filters.gender}
                        onChange={(e) => handleFilterChange("gender", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Year</label>
                      <Input
                        placeholder="e.g., 2025"
                        value={filters.year}
                        onChange={(e) => handleFilterChange("year", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Month</label>
                      <Input
                        placeholder="e.g., Jan, Feb..."
                        value={filters.month}
                        onChange={(e) => handleFilterChange("month", e.target.value)}
                      />
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
                    <Button variant="outline" onClick={exportToExcel} className="flex items-center gap-2">
                      <Download size={16} />
                      Export Excel
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2" asChild>
                      <label htmlFor="excel-import">
                        <Upload size={16} />
                        Import Excel
                        <input
                          id="excel-import"
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleImportExcel}
                          className="hidden"
                        />
                      </label>
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ConsolidatedDashboardPage;
