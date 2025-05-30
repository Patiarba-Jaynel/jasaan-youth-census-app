
import { useEffect, useState } from "react";
import { Control, useWatch } from "react-hook-form";
import { FormValues } from "@/lib/schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PersonalInfoSectionProps {
  control: Control<FormValues>;
}

export const PersonalInfoSection = ({ control }: PersonalInfoSectionProps) => {
  const birthday = useWatch({ control, name: "birthday" });
  const [calculatedAge, setCalculatedAge] = useState<number | undefined>();

  useEffect(() => {
    if (birthday) {
      const today = new Date();
      const birthDate = new Date(birthday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setCalculatedAge(age);
    }
  }, [birthday]);

  return (
    <div className="md:col-span-2">
      <h3 className="text-lg font-medium mb-4">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Juan Dela Cruz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Age Display (calculated from birthday) */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium leading-none">Age</label>
          <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
            {calculatedAge !== undefined ? `${calculatedAge} years old` : "Select birthday to calculate age"}
          </div>
        </div>

        {/* Date of Birth */}
        <FormField
          control={control}
          name="birthday"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value ? field.value.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const dateValue = e.target.value ? new Date(e.target.value) : null;
                    field.onChange(dateValue);
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  min="1980-01-01"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sex */}
        <FormField
          control={control}
          name="sex"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Sex</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="MALE" />
                    </FormControl>
                    <FormLabel className="font-normal">Male</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="FEMALE" />
                    </FormControl>
                    <FormLabel className="font-normal">Female</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Civil Status */}
        <FormField
          control={control}
          name="civil_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Civil Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SINGLE">Single</SelectItem>
                  <SelectItem value="MARRIED">Married</SelectItem>
                  <SelectItem value="LIVED-IN">Lived-In</SelectItem>
                  <SelectItem value="WIDOWED">Widowed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Youth Classification */}
        <FormField
          control={control}
          name="youth_classification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Youth Classification</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ISY">In-School Youth (ISY)</SelectItem>
                  <SelectItem value="OSY">Out-of-School Youth (OSY)</SelectItem>
                  <SelectItem value="WY">Working Youth (WY)</SelectItem>
                  <SelectItem value="YSN">
                    Youth with Special Needs (YSN)
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Youth Age Group */}
        <FormField
          control={control}
          name="youth_age_group"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Youth Age Group</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CHILD YOUTH (15-17)">
                    Child Youth (15-17)
                  </SelectItem>
                  <SelectItem value="CORE YOUTH (18-24)">
                    Core Youth (18-24)
                  </SelectItem>
                  <SelectItem value="YOUNG ADULT (25-30)">
                    Young Adult (25-30)
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
