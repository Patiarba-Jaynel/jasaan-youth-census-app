
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Edit } from "lucide-react";
import { YouthRecord } from "@/lib/pb-client";

interface DataIssue {
  recordId: string;
  recordName: string;
  issue: string;
  severity: 'error' | 'warning';
  field?: string; // Added to help with highlighting
}

interface DataProblemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issues: DataIssue[];
  onEditRecord: (record: YouthRecord) => void;
  records: YouthRecord[]; // Added to find records by ID
}

export function DataProblemsDialog({ open, onOpenChange, issues, onEditRecord, records }: DataProblemsDialogProps) {
  const errorCount = issues.filter(issue => issue.severity === 'error').length;
  const warningCount = issues.filter(issue => issue.severity === 'warning').length;

  const handleEditRecord = (recordId: string) => {
    const record = records.find(r => r.id === recordId);
    if (record) {
      onEditRecord(record);
      onOpenChange(false);
    }
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

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-3">
            {issues.map((issue, index) => (
              <div
                key={`${issue.recordId}-${index}`}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
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
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditRecord(issue.recordId)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Fix
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
