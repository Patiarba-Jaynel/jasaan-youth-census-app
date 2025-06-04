
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, History, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  user_id: string;
  user_name: string;
  details: string;
  batch_id: string;
  timestamp: string;
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
      // Since activity logs don't exist, return empty arrays
      setActivityLogs([]);
      setBatchLogs([]);
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
      // Since activity logs don't exist, we can't actually delete batches
      toast.error("Batch deletion is not available - activity logging is disabled");
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
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Activity Logs Not Available</h3>
                <p className="text-muted-foreground">
                  Activity logging has been disabled as the activity_logs collection does not exist.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'batches' && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Batch Management Not Available</h3>
                <p className="text-muted-foreground">
                  Batch management has been disabled as the activity_logs collection does not exist.
                </p>
              </div>
            </div>
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
