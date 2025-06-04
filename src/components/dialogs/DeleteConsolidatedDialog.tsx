
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { pbClient } from "@/lib/pb-client";
import { toast } from "@/components/ui/sonner";

interface ConsolidatedData {
  id: string;
  barangay: string;
  age_bracket: string;
  gender: string;
  year: number;
  month: string;
  count: number;
}

interface DeleteConsolidatedDialogProps {
  record: ConsolidatedData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteConsolidatedDialog({
  record,
  open,
  onOpenChange,
  onConfirm,
}: DeleteConsolidatedDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      
      await pbClient.consolidated.delete(record.id);
      
      toast.success("Record deleted successfully");
      onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Consolidated Record</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this record? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg">
            <p><strong>Barangay:</strong> {record.barangay}</p>
            <p><strong>Age Bracket:</strong> {record.age_bracket}</p>
            <p><strong>Gender:</strong> {record.gender}</p>
            <p><strong>Year:</strong> {record.year}</p>
            <p><strong>Month:</strong> {record.month}</p>
            <p><strong>Count:</strong> {record.count}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
