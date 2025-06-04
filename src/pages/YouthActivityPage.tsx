
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft, History } from "lucide-react";
import { activityLogger, ActivityLog } from "@/lib/activity-logger";
import { pbClient } from "@/lib/pb-client";

const YouthActivityPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const navigate = useNavigate();

  const fetchActivityLogs = async () => {
    try {
      const response = await activityLogger.getActivityLogs();
      // Filter to show only youth data related activities
      const youthLogs = response.items.filter(log => 
        !log.action.toLowerCase().includes('consolidated')
      );
      setActivityLogs(youthLogs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      toast.error("Failed to load activity logs");
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = pbClient.auth.isLoggedIn();

      if (!isLoggedIn) {
        toast.error("Authentication required", {
          description: "Please log in to access activity logs.",
        });
        navigate("/login");
        return;
      }

      try {
        await fetchActivityLogs();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('CREATE') || action.includes('IMPORT')) return 'default';
    if (action.includes('UPDATE')) return 'secondary';
    if (action.includes('DELETE')) return 'destructive';
    return 'outline';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <p className="text-lg">Loading activity logs...</p>
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
                onClick={() => navigate("/dashboard/table")}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Table View
              </Button>
              <h1 className="text-3xl font-bold">Youth Data Activity & Batch Management</h1>
              <p className="text-muted-foreground">
                Track all youth data operations and batch imports
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Activity Logs
              </CardTitle>
              <CardDescription>
                Recent youth data operations and batch imports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityLogs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No youth data activities recorded yet.</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge variant={getActionBadgeVariant(log.action)}>
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.blame}</TableCell>
                          <TableCell>{formatDate(log.created)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default YouthActivityPage;
