
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft, Plus, Download, History } from "lucide-react";
import { pbClient } from "@/lib/pb-client";
import { ConsolidatedAnalytics } from "@/components/ConsolidatedAnalytics";
import { ConsolidatedDataForm } from "@/components/ConsolidatedDataForm";
import { ConsolidatedImportDialog } from "@/components/ConsolidatedImportDialog";

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
  const navigate = useNavigate();

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
        const records = await pbClient.consolidated.getAll();
        setConsolidatedData(records);
      } catch (error) {
        console.error("Error fetching consolidated data:", error);
        toast.error("Failed to load consolidated data");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleFormSubmit = async () => {
    setShowForm(false);
    // Refresh data
    try {
      const records = await pbClient.consolidated.getAll();
      setConsolidatedData(records);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleImport = async (records: any[]) => {
    try {
      setIsLoading(true);
      
      // Generate a unique batch ID
      const batchId = `consolidated_batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Import records with batch tracking
      await pbClient.consolidated.createMany(records, batchId);
      
      toast.success(`Successfully imported ${records.length} consolidated records (Batch: ${batchId})`);
      
      // Refresh data
      const updatedRecords = await pbClient.consolidated.getAll();
      setConsolidatedData(updatedRecords);
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

    const csvContent = [
      ['Barangay', 'Age Bracket', 'Gender', 'Year', 'Month', 'Count'].join(','),
      ...consolidatedData.map(record => [
        record.barangay,
        record.age_bracket,
        record.gender,
        record.year,
        record.month,
        record.count
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consolidated_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Data exported successfully");
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
            <ConsolidatedAnalytics data={consolidatedData} />
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
