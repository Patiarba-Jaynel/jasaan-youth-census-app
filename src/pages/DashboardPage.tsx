
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { StatCard } from "@/components/StatCard";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { pbClient, YouthRecord } from "@/lib/pb-client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Eye, Plus, LogOut, Table, Settings } from "lucide-react";

interface AnalyticsData {
  name: string;
  value: number;
}

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [youthRecords, setYouthRecords] = useState<YouthRecord[]>([]);
  const [barangayData, setBarangayData] = useState<AnalyticsData[]>([]);
  const [classificationData, setClassificationData] = useState<AnalyticsData[]>(
    []
  );
  const [ageGroupData, setAgeGroupData] = useState<AnalyticsData[]>([]);
  const [voterData, setVoterData] = useState<AnalyticsData[]>([]);
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
        const records = await pbClient.youth.getAll();
        setYouthRecords(records);

        // Process data for analytics
        processData(records);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const processData = (records: YouthRecord[]) => {
    // Group by barangay
    const barangayDistribution = records.reduce(
      (acc: { [key: string]: number }, record) => {
        if (!acc[record.barangay]) {
          acc[record.barangay] = 0;
        }
        acc[record.barangay]++;
        return acc;
      },
      {}
    );

    // Group by classification - Updated to use acronyms
    const classificationDistribution = records.reduce(
      (acc: { [key: string]: number }, record) => {
        if (!acc[record.youth_classification]) {
          acc[record.youth_classification] = 0;
        }
        acc[record.youth_classification]++;
        return acc;
      },
      {}
    );

    // Group by age group
    const ageGroupDistribution = records.reduce(
      (acc: { [key: string]: number }, record) => {
        if (!acc[record.youth_age_group]) {
          acc[record.youth_age_group] = 0;
        }
        acc[record.youth_age_group]++;
        return acc;
      },
      {}
    );

    // Group by voter status with normalization
    const voterDistribution = records.reduce(
      (acc: { [key: string]: number }, record) => {
        const normalizedValue = record.registered_voter?.toUpperCase() || "UNKNOWN";

        if (["YES", "NO"].includes(normalizedValue)) {
          if (!acc[normalizedValue]) {
            acc[normalizedValue] = 0;
          }
          acc[normalizedValue]++;
        }

        return acc;
      },
      {}
    );

    setBarangayData(
      Object.keys(barangayDistribution).map((key) => ({
        name: key,
        value: barangayDistribution[key],
      }))
    );

    setClassificationData(
      Object.keys(classificationDistribution).map((key) => {
        // Updated labels to show acronyms
        const labels: { [key: string]: string } = {
          ISY: "ISY (In-School Youth)",
          OSY: "OSY (Out-of-School Youth)", 
          WY: "WY (Working Youth)",
          YSN: "YSN (Youth Special Needs)",
        };

        return {
          name: labels[key] || key,
          value: classificationDistribution[key],
        };
      })
    );

    setAgeGroupData(
      Object.keys(ageGroupDistribution).map((key) => ({
        name: key,
        value: ageGroupDistribution[key],
      }))
    );

    setVoterData(
      Object.keys(voterDistribution).map((key) => ({
        name: key === "YES" ? "Yes" : "No",
        value: voterDistribution[key],
      }))
    );
  };

  const handleLogout = () => {
    pbClient.auth.logout();
    document.dispatchEvent(new CustomEvent("auth-change"));
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleAddYouth = () => {
    navigate("/dashboard/census");
  };

  const handleViewTable = () => {
    navigate("/dashboard/table");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <p className="text-lg">Loading dashboard data...</p>
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
              <h1 className="text-3xl font-bold">Census Dashboard</h1>
              <p className="text-muted-foreground">
                Analytics and insights from the Jasaan Youth Census data.
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
                onClick={() => navigate("/dashboard/table")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Table size={16} />
                View Table
              </Button>
              <Button
                onClick={() => navigate("/dashboard/census")}
                variant="default"
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Youth
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

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Respondents"
              value={youthRecords.length}
              description="Total youth census registrations"
              icon={<Eye />}
            />
            <StatCard
              title="Registered Voters"
              value={
                youthRecords.filter((r) => r.registered_voter === "Yes").length
              }
              description="Youth who are registered to vote"
              icon={<Eye />}
            />
            <StatCard
              title="In-School Youth"
              value={
                youthRecords.filter((r) => r.youth_classification === "ISY")
                  .length
              }
              description="Currently enrolled in school"
              icon={<Eye />}
            />
            <StatCard
              title="Employment Rate"
              value={`${Math.round(
                (youthRecords.filter(
                  (r) =>
                    r.work_status === "Employed" ||
                    r.work_status === "Self-Employed"
                ).length /
                  youthRecords.length) *
                  100
              )}%`}
              description="Youth who are employed or self-employed"
              icon={<Eye />}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <AnalyticsCard
              title="Distribution by Barangay"
              description="Number of youth respondents from each barangay"
              data={barangayData}
              type="bar"
              nameKey="name"
              dataKey="value"
            />
            <AnalyticsCard
              title="Youth Classification"
              description="ISY (In-School), OSY (Out-of-School), WY (Working), YSN (Special Needs)"
              data={classificationData}
              type="pie"
              nameKey="name"
              dataKey="value"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsCard
              title="Distribution by Age Group"
              description="Number of respondents in each age category"
              data={ageGroupData}
              type="bar"
              nameKey="name"
              dataKey="value"
            />
            <AnalyticsCard
              title="Voter Registration Status"
              description="Registered vs non-registered voters"
              data={voterData}
              type="pie"
              nameKey="name"
              dataKey="value"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
