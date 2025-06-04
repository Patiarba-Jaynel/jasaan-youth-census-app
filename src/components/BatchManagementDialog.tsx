
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, History } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { activityLogger } from "@/lib/activity-logger";
import { pbClient } from "@/lib/pb-client";

interface ActivityLog {
  id: string;
  action: string;
  blame: string;
  entity_type?: string;
  entity_id?: string;
  details?: string;
  batch_id?: string;
  created: string;
  updated: string;
}

interface BatchManagementDialogProps {
  open: boolean;
  onClose: () => void;
  onDataChange: () => void;
}

export function BatchManagementDialog({ open, onClose, onDataChange }: BatchManagementDialogProps) {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [batchLogs, setBatchLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'activity' | 'batches'>('activity');

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const logsResult = await activityLogger.getActivityLogs();
      const logs = logsResult.items as ActivityLog[];
      
      setActivityLogs(logs);
      
      // Filter batch-related logs
      const batchRelatedLogs = logs.filter(log => 
        log.action === 'IMPORT' || log.batch_id
      );
      setBatchLogs(batchRelatedLogs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to load activity logs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm(`Are you sure you want to delete this entire batch? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Get all records with this batch_id
      const youthRecords = await pbClient.youth.getAll();
      const recordsToDelete = youthRecords.filter(record => record.batch_id === batchId);
      
      // Delete each record
      for (const record of recordsToDelete) {
        await pbClient.youth.delete(record.id);
      }
      
      toast.success(`Successfully deleted batch with ${recordsToDelete.length} records`);
      onDataChange();
      fetchLogs(); // Refresh logs
    } catch (error) {
      console.error("Error deleting batch:", error);
      toast.error("Failed to delete batch");
    } finally {
      setIsLoading(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'IMPORT':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getBatchInfo = (batchId: string) => {
    const importLog = batchLogs.find(log => log.batch_id === batchId && log.action === 'IMPORT');
    const deleteLog = batchLogs.find(log => log.batch_id === batchId && log.action === 'DELETE' && log.entity_id === batchId);
    return { importLog, deleteLog, isDeleted: !!deleteLog };
  };

  useEffect(() => {
    if (open) {
      fetchLogs();
    }
  }, [open]);

  // Get unique batches from logs
  const uniqueBatches = [...new Set(batchLogs.map(log => log.batch_id))].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Activity & Batch Management
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'activity' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('activity')}
          >
            Activity Log
          </Button>
          <Button
            variant={activeTab === 'batches' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('batches')}
          >
            Batch Management
          </Button>
        </div>

        <ScrollArea className="max-h-[60vh]">
          {activeTab === 'activity' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No activity logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  activityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge className={getActionBadgeColor(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{log.blame}</TableCell>
                      <TableCell>{log.entity_type || 'N/A'}</TableCell>
                      <TableCell className="max-w-xs truncate">{log.details || 'N/A'}</TableCell>
                      <TableCell>{formatDate(log.created)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {activeTab === 'batches' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Imported By</TableHead>
                  <TableHead>Import Date</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniqueBatches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No batch imports found
                    </TableCell>
                  </TableRow>
                ) : (
                  uniqueBatches.map((batchId) => {
                    const { importLog, isDeleted } = getBatchInfo(batchId);
                    
                    return (
                      <TableRow key={batchId}>
                        <TableCell className="font-mono text-xs">{batchId}</TableCell>
                        <TableCell>{importLog?.blame || 'Unknown'}</TableCell>
                        <TableCell>{importLog ? formatDate(importLog.created) : 'N/A'}</TableCell>
                        <TableCell>{importLog?.details || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={isDeleted ? "destructive" : "default"}>
                            {isDeleted ? "Deleted" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {!isDeleted && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteBatch(batchId)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </ScrollArea>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
