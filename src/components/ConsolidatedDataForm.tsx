
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { enumOptions } from "@/lib/schema";

interface ConsolidatedData {
  id?: string;
  barangay: string;
  age_bracket: string;
  gender: string;
  year: number;
  month: string;
  count: number;
}

interface ConsolidatedDataFormProps {
  initialData?: ConsolidatedData;
  onSubmit: (data: Omit<ConsolidatedData, 'id'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const AGE_BRACKETS = [
  "UNDER 1", "1-4", "5-9", "10-14", "15-19", "20-24", "25-29", 
  "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", 
  "60-64", "65-69", "70-74", "75-79", "80+"
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function ConsolidatedDataForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isEditing = false 
}: ConsolidatedDataFormProps) {
  const [formData, setFormData] = useState<Omit<ConsolidatedData, 'id'>>({
    barangay: initialData?.barangay || "",
    age_bracket: initialData?.age_bracket || "",
    gender: initialData?.gender || "",
    year: initialData?.year || new Date().getFullYear(),
    month: initialData?.month || "",
    count: initialData?.count || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit' : 'Add'} Consolidated Record</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="barangay">Barangay</Label>
            <Select value={formData.barangay} onValueChange={(value) => handleChange('barangay', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select barangay" />
              </SelectTrigger>
              <SelectContent>
                {enumOptions.barangay.map((barangay) => (
                  <SelectItem key={barangay} value={barangay}>
                    {barangay}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="age_bracket">Age Bracket</Label>
            <Select value={formData.age_bracket} onValueChange={(value) => handleChange('age_bracket', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select age bracket" />
              </SelectTrigger>
              <SelectContent>
                {AGE_BRACKETS.map((bracket) => (
                  <SelectItem key={bracket} value={bracket}>
                    {bracket}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
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
              onChange={(e) => handleChange('year', parseInt(e.target.value))}
              min="2020"
              max="2030"
            />
          </div>

          <div>
            <Label htmlFor="month">Month</Label>
            <Select value={formData.month} onValueChange={(value) => handleChange('month', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
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
              onChange={(e) => handleChange('count', parseInt(e.target.value))}
              min="0"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {isEditing ? 'Update' : 'Add'} Record
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
