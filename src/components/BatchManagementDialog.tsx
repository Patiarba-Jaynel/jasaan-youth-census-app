/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, History, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { activityLogger, ActivityLog } from "@/lib/activity-logger";

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
      const [activity, batches] = await Promise.all([
        activityLogger.getActivityLogs(50),
        activityLogger.getBatchLogs()
      ]);
      
      // Convert PocketBase records to ActivityLog format
      const activityItems = (activity.items || []).map((item: any) => ({
        id: item.id,
        action: item.action,
        entity_type: item.entity_type,
        entity_id: item.entity_id,
        entity_name: item.entity_name,
        user_id: item.user_id,
        user_name: item.user_name,
        details: item.details,
        batch_id: item.batch_id,
        timestamp: item.timestamp,
        created: item.created,
        updated: item.updated
      })) as ActivityLog[];

      const batchItems = (batches || []).map((item: any) => ({
        id: item.id,
        action: item.action,
        entity_type: item.entity_type,
        entity_id: item.entity_id,
        entity_name: item.entity_name,
        user_id: item.user_id,
        user_name: item.user_name,
        details: item.details,
        batch_id: item.batch_id,
        timestamp: item.timestamp,
        created: item.created,
        updated: item.updated
      })) as ActivityLog[];

      setActivityLogs(activityItems);
      setBatchLogs(batchItems);
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
      const result = await activityLogger.deleteBatch(batchId);
      
      if (result.success) {
        toast.success(`Successfully deleted batch with ${result.deletedCount} records`);
        await fetchLogs();
        onDataChange();
      } else {
        toast.error("Failed to delete batch");
      }
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
                  <TableHead>Entity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge className={getActionBadgeColor(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.entity_name}</div>
                        <div className="text-sm text-muted-foreground">{log.entity_type}</div>
                      </div>
                    </TableCell>
                    <TableCell>{log.user_name}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={log.details}>
                        {log.details}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(log.created || log.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {activeTab === 'batches' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Import Date</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniqueBatches.map((batchId) => {
                  const { importLog, deleteLog, isDeleted } = getBatchInfo(batchId);
                  const recordCount = importLog?.details.match(/\d+/)?.[0] || '0';
                  
                  return (
                    <TableRow key={batchId}>
                      <TableCell className="font-mono text-sm">{batchId}</TableCell>
                      <TableCell>
                        {importLog ? formatDate(importLog.created || importLog.timestamp) : 'N/A'}
                      </TableCell>
                      <TableCell>{recordCount} records</TableCell>
                      <TableCell>{importLog?.user_name || 'Unknown'}</TableCell>
                      <TableCell>
                        {isDeleted ? (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Deleted
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!isDeleted && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteBatch(batchId)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
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
