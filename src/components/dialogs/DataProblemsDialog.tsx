import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Edit, Trash2, UserX } from "lucide-react";
import { YouthRecord, pbClient } from "@/lib/pb-client";
import { toast } from "@/components/ui/sonner";
import { useState } from "react";

interface DataIssue {
  recordId: string;
  recordName: string;
  issue: string;
  severity: 'error' | 'warning';
  field?: string;
}

interface DataProblemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issues: DataIssue[];
  onEditRecord: (record: YouthRecord) => void;
  records: YouthRecord[];
}

export function DataProblemsDialog({ open, onOpenChange, issues, onEditRecord, records }: DataProblemsDialogProps) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  
  const errorCount = issues.filter(issue => issue.severity === 'error').length;
  const warningCount = issues.filter(issue => issue.severity === 'warning').length;

  const findRecord = (recordId: string) => {
    return records.find(r => r.id === recordId);
  };

  const isDuplicateIssue = (issue: DataIssue) => {
    return issue.issue.toLowerCase().includes('duplicate');
  };

  const getDuplicateRecords = (issue: DataIssue) => {
    if (!isDuplicateIssue(issue)) return [];
    
    const field = issue.field;
    const currentRecord = findRecord(issue.recordId);
    if (!currentRecord || !field) return [];

    const fieldValue = currentRecord[field as keyof YouthRecord];
    if (!fieldValue) return [];

    return records.filter(record => {
      const recordValue = record[field as keyof YouthRecord];
      if (field === 'name') {
        return recordValue?.toString().toLowerCase().trim() === fieldValue.toString().toLowerCase().trim();
      }
      if (field === 'email_address') {
        return recordValue?.toString().toLowerCase().trim() === fieldValue.toString().toLowerCase().trim();
      }
      if (field === 'contact_number') {
        return recordValue?.toString().trim() === fieldValue.toString().trim();
      }
      return recordValue === fieldValue;
    });
  };

  const handleEditRecord = async (recordId: string) => {
    const record = findRecord(recordId);
    if (record) {
      onEditRecord(record);
      onOpenChange(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (processingIds.has(recordId)) return;
    
    setProcessingIds(prev => new Set(prev).add(recordId));
    
    try {
      await pbClient.youth.delete(recordId);
      toast.success("Record deleted successfully");
      window.location.reload(); // Refresh to update the data
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(recordId);
        return newSet;
      });
    }
  };

  const handleBulkDeleteDuplicates = async (issue: DataIssue) => {
    const duplicateRecords = getDuplicateRecords(issue);
    if (duplicateRecords.length <= 1) return;

    // Keep the first record, delete the rest
    const recordsToDelete = duplicateRecords.slice(1);
    
    try {
      for (const record of recordsToDelete) {
        if (!processingIds.has(record.id)) {
          setProcessingIds(prev => new Set(prev).add(record.id));
          await pbClient.youth.delete(record.id);
        }
      }
      toast.success(`Deleted ${recordsToDelete.length} duplicate records`);
      window.location.reload();
    } catch (error) {
      console.error("Error during bulk delete:", error);
      toast.error("Failed to delete some duplicate records");
    }
  };

  const renderIssueActions = (issue: DataIssue) => {
    const record = findRecord(issue.recordId);
    if (!record) return null;

    const isProcessing = processingIds.has(issue.recordId);

    if (isDuplicateIssue(issue)) {
      const duplicateRecords = getDuplicateRecords(issue);
      
      return (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditRecord(issue.recordId)}
              className="flex items-center gap-1"
              disabled={isProcessing}
            >
              <Edit className="h-3 w-3" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteRecord(issue.recordId)}
              className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
              disabled={isProcessing}
            >
              <Trash2 className="h-3 w-3" />
              Delete This
            </Button>
          </div>
          {duplicateRecords.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkDeleteDuplicates(issue)}
              className="flex items-center gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <UserX className="h-3 w-3" />
              Delete All Duplicates (Keep 1)
            </Button>
          )}
        </div>
      );
    }

    // For non-duplicate issues, show edit button
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEditRecord(issue.recordId)}
        className="flex items-center gap-1"
        disabled={isProcessing}
      >
        <Edit className="h-3 w-3" />
        Fix
      </Button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Data Validation Issues
          </DialogTitle>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              {errorCount} Errors
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {warningCount} Warnings
            </span>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-4 scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <div className="space-y-3">
            {issues.map((issue, index) => {
              const record = findRecord(issue.recordId);
              const isProcessing = processingIds.has(issue.recordId);
              
              return (
                <div
                  key={`${issue.recordId}-${index}`}
                  className={`border rounded-lg p-4 space-y-2 ${isProcessing ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={issue.severity === 'error' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {issue.severity === 'error' ? (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          {issue.severity.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{issue.recordName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.issue}</p>
                      {isDuplicateIssue(issue) && (
                        <div className="text-xs text-blue-600">
                          Found {getDuplicateRecords(issue).length} records with the same {issue.field?.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {renderIssueActions(issue)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
