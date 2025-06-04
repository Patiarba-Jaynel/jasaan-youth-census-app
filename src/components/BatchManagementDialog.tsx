
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { activityLogger, ActivityLog } from "@/lib/activity-logger";

interface BatchManagementDialogProps {
  open: boolean;
  onClose: () => void;
  onDataChange: () => void;
}

export function BatchManagementDialog({ open, onClose, onDataChange }: BatchManagementDialogProps) {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const logsResult = await activityLogger.getActivityLogs();
      setActivityLogs(logsResult.items);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to load activity logs");
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

  useEffect(() => {
    if (open) {
      fetchLogs();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Activity Log
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
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
                    <TableCell>{formatDate(log.created)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
