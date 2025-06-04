
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { DataTable } from "@/components/DataTable";
import { pbClient, YouthRecord } from "@/lib/pb-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Import, History, Trash2, Activity } from "lucide-react";
import { ImportDialog } from "@/components/ImportDialog";
import { BatchManagementDialog } from "@/components/BatchManagementDialog";

const TableViewPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [youthRecords, setYouthRecords] = useState<YouthRecord[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isBatchManagementOpen, setIsBatchManagementOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    console.log("TableViewPage: Starting fetchData");
    try {
      setIsLoading(true);
      setError(null);
      console.log("TableViewPage: Calling pbClient.youth.getAll()");
      const records = await pbClient.youth.getAll();
      console.log("TableViewPage: Retrieved records:", records?.length);

      // Ensure kk_assemblies_attended is always a number
      const processedRecords = records.map(record => ({
        ...record,
        kk_assemblies_attended: typeof record.kk_assemblies_attended === "number"
          ? record.kk_assemblies_attended
          : Number(record.kk_assemblies_attended) || 0,
        // Normalize barangay data - if "SOLANA" is misspelled or in different case
        barangay: record.barangay === "Solana" || record.barangay?.toUpperCase() === "SOLANA" 
          ? "SOLANA" 
          : record.barangay
      }));

      console.log("TableViewPage: Processed records:", processedRecords?.length);
      setYouthRecords(processedRecords);
    } catch (error) {
      console.error("TableViewPage: Error fetching data:", error);
      setError(error?.message || "Failed to load youth records");
      toast.error("Failed to load youth records");
    } finally {
      setIsLoading(false);
      console.log("TableViewPage: fetchData completed");
    }
  };

  const handleImport = async (records: any[]) => {
    try {
      setIsLoading(true);
      
      // Generate a unique batch ID
      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Ensure each record has kk_assemblies_attended as a number
      const processedRecords = records.map(record => ({
        ...record,
        kk_assemblies_attended: typeof record.kk_assemblies_attended === "number"
          ? record.kk_assemblies_attended
          : Number(record.kk_assemblies_attended) || 0,
        // Normalize barangay data - if "SOLANA" is misspelled or in different case
        barangay: record.barangay === "Solana" || record.barangay?.toUpperCase() === "SOLANA" 
          ? "SOLANA" 
          : record.barangay
      }));
      
      // Import records with batch tracking
      await pbClient.youth.createMany(processedRecords, batchId);
      
      toast.success(`Successfully imported ${records.length} records (Batch: ${batchId})`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error importing records:", error);
      toast.error("Failed to import records");
    } finally {
      setIsImportDialogOpen(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("TableViewPage: useEffect triggered");
    const checkAuth = async () => {
      console.log("TableViewPage: Checking authentication");
      const isLoggedIn = pbClient.auth.isLoggedIn();
      console.log("TableViewPage: Is logged in:", isLoggedIn);

      if (!isLoggedIn) {
        toast.error("Authentication required", {
          description: "Please log in to access the data table.",
        });
        navigate("/login");
        return;
      }

      await fetchData();
    };

    checkAuth();
  }, [navigate]);

  console.log("TableViewPage: Rendering - isLoading:", isLoading, "error:", error, "records:", youthRecords?.length);

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Census Records</h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard/youth/activity")}
                className="flex items-center gap-2"
              >
                <Activity size={16} />
                Activity Logs
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setIsBatchManagementOpen(true)}
                className="flex items-center gap-2"
              >
                <History size={16} />
                Batch Management
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setIsImportDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Import size={16} />
                Import Data
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <p className="text-lg">Loading records...</p>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <DataTable data={youthRecords} onDataChange={fetchData} />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />

      <ImportDialog 
        open={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImport}
      />

      <BatchManagementDialog
        open={isBatchManagementOpen}
        onClose={() => setIsBatchManagementOpen(false)}
        onDataChange={fetchData}
      />
    </div>
  );
};

export default TableViewPage;
