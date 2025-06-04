
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Settings, Table, Trash2, Download, RefreshCw } from "lucide-react";
import { pbClient } from "@/lib/pb-client";
import { activityLogger, ActivityLog } from "@/lib/activity-logger";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

const ConsolidatedActivityPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [consolidatedLogs, setConsolidatedLogs] = useState<ActivityLog[]>([]);
  const [batchLogs, setBatchLogs] = useState<ActivityLog[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const navigate = useNavigate();

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

      await loadLogs();
    };

    checkAuth();
  }, [navigate]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const [consolidated, batch] = await Promise.all([
        activityLogger.getConsolidatedLogs(),
        activityLogger.getBatchLogs()
      ]);
      
      // Filter batch logs to only show consolidated data batches
      const consolidatedBatchLogs = batch.filter(log => 
        log.entity_type === 'consolidated' || 
        (log.details && log.details.includes('consolidated'))
      );
      
      setConsolidatedLogs(consolidated);
      setBatchLogs(consolidatedBatchLogs);
    } catch (error) {
      console.error("Error loading activity logs:", error);
      toast.error("Failed to load activity logs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    setSelectedBatchId(batchId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteBatch = async () => {
    if (!selectedBatchId) return;

    try {
      // Get current user data for logging
      const authData = pbClient.auth.getAuthData();
      if (!authData?.record) {
        toast.error("Authentication required");
        return;
      }

      // Delete all consolidated records in this batch
      const batchRecords = await pbClient.collection('consolidated_data').getFullList({
        filter: `batch_id = "${selectedBatchId}"`
      });

      for (const record of batchRecords) {
        await pbClient.consolidated.delete(record.id);
      }

      // Log the batch deletion with proper user information
      await activityLogger.log({
        action: 'DELETE',
        entity_type: 'consolidated',
        entity_id: selectedBatchId,
        entity_name: `Consolidated Batch ${selectedBatchId}`,
        user_id: authData.record.id,
        user_name: authData.record.name || authData.record.email,
        details: `Deleted batch with ${batchRecords.length} consolidated records`,
        batch_id: selectedBatchId
      });

      toast.success(`Successfully deleted batch with ${batchRecords.length} records`);
      setDeleteDialogOpen(false);
      setSelectedBatchId("");
      await loadLogs();
    } catch (error) {
      console.error("Error deleting batch:", error);
      toast.error("Failed to delete batch");
    }
  };

  const exportLogs = () => {
    const logs = [...consolidatedLogs, ...batchLogs].sort((a, b) => 
      new Date(b.created).getTime() - new Date(a.created).getTime()
    );
    
    const csvContent = [
      ['Date', 'Action', 'Entity', 'User', 'Details'].join(','),
      ...logs.map(log => [
        format(new Date(log.created), 'yyyy-MM-dd HH:mm:ss'),
        log.action,
        log.entity_name,
        log.user_name,
        log.details.replace(/,/g, ';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consolidated_activity_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Activity logs exported successfully");
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'IMPORT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Consolidated Data Activity</h1>
              <p className="text-muted-foreground">
                Activity logs and batch management for consolidated data
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
              <Button
                onClick={loadLogs}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh
              </Button>
              <Button
                onClick={exportLogs}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export CSV
              </Button>
              <Button
                onClick={() => navigate("/dashboard/consolidated")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Table size={16} />
                Back to Dashboard
              </Button>
            </div>
          </div>

          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="activity">Individual Activities</TabsTrigger>
              <TabsTrigger value="batches">Batch Operations</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Consolidated Data Activities</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="border rounded-md">
                    <UITable>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Record</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {consolidatedLogs.length > 0 ? (
                          consolidatedLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="text-sm">
                                {format(new Date(log.created), 'MMM dd, yyyy HH:mm')}
                              </TableCell>
                              <TableCell>
                                <Badge className={getActionBadgeColor(log.action)}>
                                  {log.action}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{log.entity_name}</TableCell>
                              <TableCell>{log.user_name}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {log.details}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              No consolidated data activities found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </UITable>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="batches" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Consolidated Data Batch Operations</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="border rounded-md">
                    <UITable>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Batch ID</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {batchLogs.length > 0 ? (
                          batchLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="text-sm">
                                {format(new Date(log.created), 'MMM dd, yyyy HH:mm')}
                              </TableCell>
                              <TableCell>
                                <Badge className={getActionBadgeColor(log.action)}>
                                  {log.action}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{log.batch_id}</TableCell>
                              <TableCell>{log.user_name}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {log.details}
                              </TableCell>
                              <TableCell className="text-right">
                                {log.action === 'IMPORT' && log.batch_id && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteBatch(log.batch_id!)}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
                                  >
                                    <Trash2 size={16} />
                                    <span className="sr-only">Delete Batch</span>
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              No batch operations found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </UITable>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Delete Batch Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <DialogTitle className="text-center">Delete Batch</DialogTitle>
                <div className="text-center text-sm text-muted-foreground">
                  Are you sure you want to delete this entire batch?
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <strong>Batch ID:</strong> {selectedBatchId}
                  </div>
                  This will permanently delete all consolidated records in this batch. This action cannot be undone.
                </div>
              </DialogHeader>
              <div className="flex justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setSelectedBatchId("");
                  }}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteBatch}>
                  Delete Batch
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ConsolidatedActivityPage;
