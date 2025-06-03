
import { useFormContext, Control } from "react-hook-form";
import { FormValues } from "@/lib/schema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CivicSectionProps {
  control: Control<FormValues>;
}

export const CivicSection = ({ control }: CivicSectionProps) => {
  const { watch } = useFormContext<FormValues>();
  const watchAttendedAssembly = watch("attended_kk_assembly");

  return (
    <div className="md:col-span-2">
      <h3 className="text-lg font-medium mb-4">Civic Participation</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="registered_voter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Are you a registered voter?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select answer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="YES">Yes</SelectItem>
                  <SelectItem value="NO">No</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="voted_last_election"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Did you vote in the last election?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select answer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="YES">Yes</SelectItem>
                  <SelectItem value="NO">No</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="attended_kk_assembly"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Have you attended any KK assemblies?</FormLabel>
              <Select onValueChange={(value) => {
                field.onChange(value);
                // Reset assemblies count to 0 if changing to "NO"
                if (value === "NO") {
                  const kk_assemblies_field = document.querySelector('[name="kk_assemblies_attended"]') as HTMLInputElement;
                  if (kk_assemblies_field) {
                    kk_assemblies_field.value = "0";
                  }
                }
              }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select answer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="YES">Yes</SelectItem>
                  <SelectItem value="NO">No</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="kk_assemblies_attended"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How many KK assemblies have you attended?</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={0} 
                  {...field}
                  disabled={watchAttendedAssembly !== "YES"}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    field.onChange(isNaN(value) ? 0 : value);
                  }}
                  defaultValue={watchAttendedAssembly === "YES" ? field.value || "0" : "0"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
