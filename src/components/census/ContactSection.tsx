
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { FormValues } from "@/lib/schema";

interface ContactSectionProps {
  control: Control<FormValues>;
}

export const ContactSection = ({ control }: ContactSectionProps) => {
  return (
    <div className="md:col-span-2">
      <h3 className="text-lg font-medium mb-4">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="email_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your email address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="contact_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your contact number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="home_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complete Home Address</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter complete home address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
