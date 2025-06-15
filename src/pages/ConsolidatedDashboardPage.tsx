
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft, Plus, Download, History } from "lucide-react";
import { pbClient } from "@/lib/pb-client";
import { ConsolidatedAnalytics } from "@/components/ConsolidatedAnalytics";
import { ConsolidatedDataForm } from "@/components/ConsolidatedDataForm";
import { ConsolidatedImportDialog } from "@/components/ConsolidatedImportDialog";
import { ConsolidatedDataTable } from "@/components/ConsolidatedDataTable";

interface ConsolidatedData {
  id: string;
  barangay: string;
  age_bracket: string;
  gender: string;
  year: number;
  month: string;
  count: number;
}

const ConsolidatedDashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [consolidatedData, setConsolidatedData] = useState<ConsolidatedData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("analytics");
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const records = await pbClient.consolidated.getAll();
      setConsolidatedData(records);
    } catch (error) {
      console.error("Error fetching consolidated data:", error);
      toast.error("Failed to load consolidated data");
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = pbClient.auth.isLoggedIn();

      if (!isLoggedIn) {
        toast.error("Authentication required", {
          description: "Please log in to access the consolidated dashboard.",
        });
        navigate("/login");
        return;
      }

      try {
        await fetchData();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleFormSubmit = async (data: Omit<ConsolidatedData, 'id'>) => {
    try {
      console.log("Creating new consolidated record:", data);
      await pbClient.consolidated.create(data);
      toast.success("Record added successfully");
      setShowForm(false);
      await fetchData();
    } catch (error) {
      console.error("Error creating record:", error);
      toast.error("Failed to add record");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleImport = async (records: any[]) => {
    try {
      setIsLoading(true);
      
      await pbClient.consolidated.createMany(records);
      
      toast.success(`Successfully imported ${records.length} consolidated records`);
      
      await fetchData();
    } catch (error) {
      console.error("Error importing records:", error);
      toast.error("Failed to import records");
    } finally {
      setIsImportDialogOpen(false);
      setIsLoading(false);
    }
  };

  const exportData = () => {
    if (consolidatedData.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Create CSV content with proper escaping to prevent Excel from converting age brackets to dates
    const headers = ['Barangay', 'Age Bracket', 'Gender', 'Year', 'Month', 'Count'];
    const csvRows = [
      headers.join(','),
      ...consolidatedData.map(record => [
        `"${record.barangay}"`,
        `"${record.age_bracket.replace(/"/g, '""')}"`, // Escape quotes and force text format
        `"${record.gender}"`,
        record.year, // Year as number
        `"${record.month}"`,
        record.count // Count as number
      ].join(','))
    ];

    const csvContent = '\uFEFF' + csvRows.join('\n'); // Add BOM for proper UTF-8 encoding
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consolidated_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Data exported successfully");
  };

  const handleRecordUpdate = async () => {
    await fetchData();
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
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div>
              <Button 
                variant="outline" 
                onClick={() => navigate("/dashboard")}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold">Consolidated Data Dashboard</h1>
              <p className="text-muted-foreground">
                Population data analytics and management for Jasaan Municipality
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
              <Button
                onClick={() => navigate("/dashboard/consolidated/activity")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <History size={16} />
                Activity & Batch Management
              </Button>
              <Button
                onClick={() => setIsImportDialogOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Import Data
              </Button>
              <Button
                onClick={exportData}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export CSV
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                variant="default"
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Data
              </Button>
            </div>
          </div>

          {showForm ? (
            <ConsolidatedDataForm 
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="data-management">Data Management</TabsTrigger>
              </TabsList>
              <TabsContent value="analytics" className="mt-6">
                <ConsolidatedAnalytics data={consolidatedData} />
              </TabsContent>
              <TabsContent value="data-management" className="mt-6">
                <ConsolidatedDataTable 
                  data={consolidatedData} 
                  onRecordUpdate={handleRecordUpdate}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />

      <ConsolidatedImportDialog 
        open={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
};

export default ConsolidatedDashboardPage;
