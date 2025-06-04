
import { Control } from "react-hook-form";
import { FormValues } from "@/lib/schema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EducationSectionProps {
  control: Control<FormValues>;
}

export const EducationSection = ({ control }: EducationSectionProps) => {
  const educationLevels = [
    "Elementary Undergraduate",
    "Elementary Graduate", 
    "High School Undergraduate",
    "High School Graduate",
    "Vocational Undergraduate",
    "Vocational Graduate",
    "College Undergraduate",
    "College Graduate",
    "Masteral Undergraduate",
    "Masteral Graduate",
    "Doctoral Undergraduate",
    "Doctoral Graduate"
  ];

  return (
    <div className="md:col-span-2">
      <h3 className="text-lg font-medium mb-4">Education and Employment</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="highest_education"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Highest Educational Attainment</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {educationLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="work_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Employed">Employed</SelectItem>
                  <SelectItem value="Unemployed">Unemployed</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Self-Employed">Self-Employed</SelectItem>
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
