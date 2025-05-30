
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Plus, LogOut, Settings, Table, Edit, Trash2 } from "lucide-react";
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
        const records = await pbClient.collection('consolidated_data').getFullList<ConsolidatedData>();
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

  const handleAddRecord = () => {
    // Navigate to add form or open modal
    toast.info("Add record functionality to be implemented");
  };

  const handleEditRecord = (record: ConsolidatedData) => {
    // Open edit modal
    toast.info("Edit record functionality to be implemented");
  };

  const handleDeleteRecord = (record: ConsolidatedData) => {
    // Open delete confirmation
    toast.info("Delete record functionality to be implemented");
  };

  const exportToCSV = () => {
    toast.info("CSV export functionality to be implemented");
  };

  const exportToXLSX = () => {
    toast.info("XLSX export functionality to be implemented");
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
              <h1 className="text-3xl font-bold">Admin Panel - Data Table View</h1>
              <p className="text-muted-foreground">
                Consolidated youth census data by barangay, age bracket, and demographics
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

          {/* Filters Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button onClick={handleAddRecord} className="flex items-center gap-2">
                  <Plus size={16} />
                  Add Record
                </Button>
                <Button variant="outline" onClick={exportToCSV}>
                  Import CSV
                </Button>
                <Button variant="outline" onClick={exportToXLSX}>
                  Export XLSX
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
                      <TableHead className="text-right">Edit/Delete</TableHead>
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ConsolidatedDashboardPage;
