import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { YouthRecord } from "@/lib/pb-client";


interface BatchEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRecords: YouthRecord[];
  onSave: (field: string, oldValue: string, newValue: string) => void;
}

export function BatchEditDialog({
  open,
  onOpenChange,
  selectedRecords,
  onSave,
}: BatchEditDialogProps) {
  const [field, setField] = useState("");
  const [oldValue, setOldValue] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleSave = () => {
    if (!field || !oldValue || !newValue) return;
    onSave(field, oldValue, newValue);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Batch Edit Records</DialogTitle>
          <DialogDescription>
            Update specific fields across {selectedRecords.length} selected records.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Field Selection */}
          <div>
            <label htmlFor="field" className="block text-sm font-medium">
              Field to Edit
            </label>
            <Select value={field} onValueChange={setField}>
              <SelectTrigger id="field">
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="age">Age</SelectItem>
                <SelectItem value="sex">Sex</SelectItem>
                <SelectItem value="barangay">Barangay</SelectItem>
                <SelectItem value="youth_classification">Classification</SelectItem>
                <SelectItem value="youth_age_group">Age Group</SelectItem>
                <SelectItem value="highest_education">Education</SelectItem>
                <SelectItem value="work_status">Work Status</SelectItem>
                <SelectItem value="registered_voter">Registered Voter</SelectItem>
                <SelectItem value="voted_last_election">Voted Last Election</SelectItem>
                <SelectItem value="attended_kk_assembly">Attended Assembly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Old Value Input */}
          <div>
            <label htmlFor="oldValue" className="block text-sm font-medium">
              Find
            </label>
            <Input
              id="oldValue"
              value={oldValue}
              onChange={(e) => setOldValue(e.target.value)}
              placeholder="Enter value to replace"
            />
          </div>

          {/* New Value Input */}
          <div>
            <label htmlFor="newValue" className="block text-sm font-medium">
              Replace With
            </label>
            <Input
              id="newValue"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Enter new value"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}