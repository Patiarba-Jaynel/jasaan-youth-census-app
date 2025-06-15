
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
import { enumOptions } from "@/lib/schema";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (record) {
      console.log("EditConsolidatedDialog: Loading record data:", record);
      setFormData({
        barangay: record.barangay,
        age_bracket: record.age_bracket,
        gender: record.gender,
        year: record.year,
        month: record.month,
        count: record.count,
      });
      setError(null);
    }
  }, [record]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate required fields
      const requiredFields = ["barangay", "age_bracket", "gender", "month"];
      const missingFields = requiredFields.filter((field) => {
        const value = formData[field as keyof typeof formData];
        return !value || (typeof value === "string" && value.trim() === "");
      });

      if (missingFields.length > 0) {
        setError(`Required fields missing: ${missingFields.join(", ")}`);
        toast.error("Missing required fields", {
          description: `Please fill in: ${missingFields.join(", ")}`,
        });
        setIsLoading(false);
        return;
      }

      // Validate count is a number
      if (isNaN(formData.count) || formData.count < 0) {
        setError("Count must be a non-negative number");
        toast.error("Invalid count value", {
          description: "Count must be a non-negative number",
        });
        setIsLoading(false);
        return;
      }

      console.log(
        "EditConsolidatedDialog: Updating record with data:",
        formData
      );

      // Double check that we have a valid record ID
      if (!record || !record.id) {
        setError("Invalid record ID");
        toast.error("Cannot update record", {
          description: "Invalid record ID",
        });
        setIsLoading(false);
        return;
      }

      // Prepare data for update - ensuring proper types
      const updateData = {
        ...formData,
        year: Number(formData.year),
        count: Number(formData.count),
      };

      await pbClient.consolidated.update(record.id, updateData);

      console.log("EditConsolidatedDialog: Record updated successfully");
      toast.success("Record updated successfully");
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating record:", error);
      const errorMessage =
        error?.data?.message || error?.message || "Failed to update record";
      setError(errorMessage);
      toast.error("Update failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Use the same barangays as the youth census form
  const barangays = enumOptions.barangay.filter((b) => b && b.trim() !== "");

  const ageBrackets = [
    "0-4",
    "5-9",
    "10-14",
    "15-19",
    "20-24",
    "25-29",
    "30-34",
    "35-39",
    "40-44",
    "45-49",
    "50-54",
    "55-59",
    "60-64",
    "65-69",
    "70-74",
    "75-79",
    "80-84",
    "85+",
  ].filter((bracket) => bracket && bracket.trim() !== "");

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ].filter((month) => month && month.trim() !== "");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Consolidated Record</DialogTitle>
          <DialogDescription>
            Update the population data for this record.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="barangay">Barangay *</Label>
            <Select
              value={formData.barangay}
              onValueChange={(value) =>
                setFormData({ ...formData, barangay: value })
              }
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
            <Label htmlFor="age_bracket">Age Bracket *</Label>
            <Select
              value={formData.age_bracket}
              onValueChange={(value) =>
                setFormData({ ...formData, age_bracket: value })
              }
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
            <Label htmlFor="gender">Gender *</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) =>
                setFormData({ ...formData, gender: value })
              }
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
            <Label htmlFor="year">Year *</Label>
            <Select
              value={formData.year.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, year: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="month">Month *</Label>
            <Select
              value={formData.month}
              onValueChange={(value) =>
                setFormData({ ...formData, month: value })
              }
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
            <Label htmlFor="count">Count *</Label>
            <Input
              id="count"
              type="number"
              value={formData.count}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  count: parseInt(e.target.value) || 0,
                })
              }
              min="0"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
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
