
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
import { Replace, Search } from "lucide-react";

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
  
  const fieldOptions = [
    { value: "name", label: "Name" },
    { value: "age", label: "Age" },
    { value: "sex", label: "Sex" },
    { value: "barangay", label: "Barangay" },
    { value: "youth_classification", label: "Classification" },
    { value: "youth_age_group", label: "Age Group" },
    { value: "highest_education", label: "Education" },
    { value: "work_status", label: "Work Status" },
    { value: "registered_voter", label: "Registered Voter" },
    { value: "voted_last_election", label: "Voted Last Election" },
    { value: "attended_kk_assembly", label: "Attended Assembly" },
    { value: "kk_assemblies_attended", label: "KK Assemblies Attended" },
    { value: "civil_status", label: "Civil Status" },
    { value: "home_address", label: "Home Address" },
  ];

  const handleSave = () => {
    if (!field || !oldValue || !newValue) return;
    onSave(field, oldValue, newValue);
    onOpenChange(false);
  };
  
  const resetForm = () => {
    setField("");
    setOldValue("");
    setNewValue("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };
  
  // Count occurrences of the search term in the selected field
  const getMatchCount = () => {
    if (!field || !oldValue) return 0;
    
    return selectedRecords.filter(record => 
      String(record[field as keyof YouthRecord]) === oldValue
    ).length;
  };
  
  const matchCount = getMatchCount();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Find and Replace</DialogTitle>
          <DialogDescription>
            Update values across multiple records at once.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Field Selection */}
          <div>
            <label htmlFor="field" className="block text-sm font-medium">
              Field to Edit
            </label>
            <Select value={field} onValueChange={setField}>
              <SelectTrigger id="field" className="w-full">
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {fieldOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Find Value Input */}
          <div>
            <label htmlFor="oldValue" className="block text-sm font-medium flex items-center gap-2">
              <Search size={16} />
              Find
            </label>
            <Input
              id="oldValue"
              value={oldValue}
              onChange={(e) => setOldValue(e.target.value)}
              placeholder="Enter value to find"
              className="w-full"
            />
            {field && oldValue && (
              <p className="text-xs mt-1 text-muted-foreground">
                {matchCount} {matchCount === 1 ? 'match' : 'matches'} found
              </p>
            )}
          </div>

          {/* Replace Value Input */}
          <div>
            <label htmlFor="newValue" className="block text-sm font-medium flex items-center gap-2">
              <Replace size={16} />
              Replace With
            </label>
            <Input
              id="newValue"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Enter new value"
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {field && oldValue && `${matchCount} ${matchCount === 1 ? 'record' : 'records'} will be updated`}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!field || !oldValue || !newValue || matchCount === 0}
            >
              Replace All
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
