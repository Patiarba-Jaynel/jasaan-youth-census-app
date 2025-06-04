
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Table } from "lucide-react";

const YouthActivityPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      // Since activity_logs doesn't exist, redirect to table view
      toast.error("Activity logs not available", {
        description: "Activity logging collection does not exist.",
      });
      navigate("/dashboard/table");
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Activity Logs Not Available</h1>
              <p className="text-muted-foreground mb-6">
                The activity_logs collection does not exist in the database.
              </p>
              <Button
                onClick={() => navigate("/dashboard/table")}
                className="flex items-center gap-2"
              >
                <Table size={16} />
                Go to Table View
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default YouthActivityPage;
