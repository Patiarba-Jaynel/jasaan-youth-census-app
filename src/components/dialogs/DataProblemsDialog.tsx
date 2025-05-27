
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Edit, UserX, Users } from "lucide-react";
import { YouthRecord, pbClient } from "@/lib/pb-client";
import { toast } from "@/components/ui/sonner";
import { useState } from "react";

interface DataIssue {
  recordId: string;
  recordName: string;
  issue: string;
  severity: 'error' | 'warning';
  field?: string;
  issueType?: string;
  duplicateGroup?: string[];
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

  // Group issues by issue type for batch operations
  const groupedIssues = issues.reduce((acc, issue) => {
    const key = issue.issueType || 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(issue);
    return acc;
  }, {} as Record<string, DataIssue[]>);

  const findRecord = (recordId: string) => {
    return records.find(r => r.id === recordId);
  };

  const isDuplicateIssue = (issue: DataIssue) => {
    return issue.issueType?.startsWith('duplicate_') || false;
  };

  const getDuplicateRecords = (issue: DataIssue) => {
    if (!isDuplicateIssue(issue) || !issue.duplicateGroup) return [];
    
    return records.filter(record => issue.duplicateGroup?.includes(record.id));
  };

  const handleEditRecord = async (recordId: string) => {
    const record = findRecord(recordId);
    if (record) {
      onEditRecord(record);
      onOpenChange(false);
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

  const handleBatchFixIssueType = async (issueType: string) => {
    const issuesOfType = groupedIssues[issueType];
    if (!issuesOfType) return;

    try {
      if (issueType.startsWith('duplicate_')) {
        // Handle all duplicates of this type
        for (const issue of issuesOfType) {
          await handleBulkDeleteDuplicates(issue);
        }
      } else {
        toast.info(`Batch fix for ${issueType} not implemented yet. Please fix individually.`);
      }
    } catch (error) {
      console.error("Error during batch fix:", error);
      toast.error("Failed to complete batch fix");
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
          </div>
          {duplicateRecords.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkDeleteDuplicates(issue)}
              className="flex items-center gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <UserX className="h-3 w-3" />
              Delete Duplicates (Keep 1)
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

  const renderBatchActions = () => {
    return (
      <div className="mb-4 p-4 border rounded-lg bg-blue-50">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Batch Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(groupedIssues).map(([issueType, issueList]) => (
            <div key={issueType} className="flex items-center justify-between p-2 bg-white rounded border">
              <span className="text-sm">
                {issueType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} ({issueList.length})
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchFixIssueType(issueType)}
                className="text-xs"
              >
                Fix All
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
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
          {Object.keys(groupedIssues).length > 1 && renderBatchActions()}
          
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
