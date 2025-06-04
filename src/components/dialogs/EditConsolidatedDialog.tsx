
import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface EditConsolidatedDialogProps {
  record: ConsolidatedData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function EditConsolidatedDialog({
  record,
  open,
  onOpenChange,
  onSave,
}: EditConsolidatedDialogProps) {
  const [formData, setFormData] = useState({
    barangay: "",
    age_bracket: "",
    gender: "",
    year: new Date().getFullYear(),
    month: "",
    count: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({
        barangay: record.barangay,
        age_bracket: record.age_bracket,
        gender: record.gender,
        year: record.year,
        month: record.month,
        count: record.count,
      });
    }
  }, [record]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      await pbClient.consolidated.update(record.id, formData);
      
      toast.success("Record updated successfully");
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating record:", error);
      toast.error("Failed to update record");
    } finally {
      setIsLoading(false);
    }
  };

  const barangays = [
    "Aplaya", "Bobuntugan", "Jasaan Proper", "Kinuguitan", "Luz Banzon",
    "Natubo", "Pontanar", "San Antonio", "Solana", "Upper Jasaan"
  ].filter(b => b && b.trim() !== "");

  const ageBrackets = [
    "0-4", "5-9", "10-14", "15-19", "20-24", "25-29", "30-34", "35-39",
    "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74",
    "75-79", "80-84", "85+"
  ].filter(bracket => bracket && bracket.trim() !== "");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ].filter(month => month && month.trim() !== "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Consolidated Record</DialogTitle>
          <DialogDescription>
            Update the population data for this record.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="barangay">Barangay</Label>
            <Select 
              value={formData.barangay} 
              onValueChange={(value) => setFormData({ ...formData, barangay: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select barangay" />
              </SelectTrigger>
              <SelectContent>
                {barangays.map((barangay) => (
                  <SelectItem key={barangay} value={barangay}>
                    {barangay}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="age_bracket">Age Bracket</Label>
            <Select 
              value={formData.age_bracket} 
              onValueChange={(value) => setFormData({ ...formData, age_bracket: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select age bracket" />
              </SelectTrigger>
              <SelectContent>
                {ageBrackets.map((bracket) => (
                  <SelectItem key={bracket} value={bracket}>
                    {bracket}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select 
              value={formData.gender} 
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
              min="2020"
              max="2030"
            />
          </div>

          <div>
            <Label htmlFor="month">Month</Label>
            <Select 
              value={formData.month} 
              onValueChange={(value) => setFormData({ ...formData, month: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="count">Count</Label>
            <Input
              id="count"
              type="number"
              value={formData.count}
              onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
