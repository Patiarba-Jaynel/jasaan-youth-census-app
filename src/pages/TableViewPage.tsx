
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { DataTable } from "@/components/DataTable";
import { pbClient, YouthRecord } from "@/lib/pb-client";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";

const TableViewPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [youthRecords, setYouthRecords] = useState<YouthRecord[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = pbClient.auth.isLoggedIn();
      
      if (!isLoggedIn) {
        toast.error("Authentication required", {
          description: "Please log in to access the data table.",
        });
        navigate("/login");
        return;
      }
      
      try {
        const records = await pbClient.youth.getAll();
        setYouthRecords(records);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load youth records");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Census Records</h1>
            <div>
              <button 
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard
              </button>
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
                <DataTable data={youthRecords} />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TableViewPage;
