
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { FormValues } from "@/lib/schema";

interface LocationSectionProps {
  control: Control<FormValues>;
}

export const LocationSection = ({ control }: LocationSectionProps) => {
  const barangays = [
    "Aplaya", "Bobontugan", "Corrales", "Danao", "Jampason", "Kimaya",
    "Lower Jasaan (Pob.)", "Luz Banzon", "Natubo", "San Antonio", 
    "San Isidro", "San Nicolas", "Upper Jasaan (Pob.)", "I. S. Cruz",
  ];

  return (
    <div className="md:col-span-2">
      <h3 className="text-lg font-medium mb-4">Location Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="province"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Province</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="city_municipality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City/Municipality</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="barangay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Barangay</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select barangay" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {barangays.map((barangay) => (
                    <SelectItem key={barangay} value={barangay}>
                      {barangay}
                    </SelectItem>
                  ))}
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
