/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { YouthRecord } from "@/lib/pb-client";
import { enumOptions } from "@/lib/schema";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRecord: YouthRecord | null;
  onSave: (data: any) => void;
}

// Updated schema to allow "Other" and custom values
const editFormSchema = z.object({
  // Critical fields - required for identification
  name: z.string().min(1, "Name is required for identification"),
  birthday: z.date({
    required_error: "Birthday is required",
  }),
  sex: z.string().min(1, "Sex is required"),
  barangay: z.string().min(1, "Barangay is required for location identification"),
  
  // Semi-important fields - can be N/A but should be filled when possible
  civil_status: z.string().optional().default("N/A"),
  youth_classification: z.string().optional().default("N/A"),
  youth_age_group: z.string().optional().default("N/A"),
  
  // Optional fields - can be N/A or blank, including "Other"
  highest_education: z.string().optional().default("N/A"),
  work_status: z.string().optional().default("N/A"),
  registered_voter: z.string().optional().default("N/A"),
  voted_last_election: z.string().optional().default("N/A"),
  attended_kk_assembly: z.string().optional().default("N/A"),
  kk_assemblies_attended: z.coerce.number().int().nonnegative().optional().default(0),
  home_address: z.string().optional().default("N/A"),
  email_address: z.string().optional().default("N/A"),
  contact_number: z.string().optional().default("N/A"),
  region: z.string().optional().default("N/A"),
  province: z.string().optional().default("N/A"),
  city_municipality: z.string().optional().default("N/A"),
});

type EditFormValues = z.infer<typeof editFormSchema>;

export function EditRecordDialog({
  open,
  onOpenChange,
  selectedRecord,
  onSave,
}: EditRecordDialogProps) {
  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: "",
      birthday: new Date(),
      sex: "Male",
      civil_status: "N/A",
      barangay: "",
      youth_classification: "N/A",
      youth_age_group: "N/A",
      highest_education: "N/A",
      work_status: "N/A",
      registered_voter: "N/A",
      voted_last_election: "N/A",
      attended_kk_assembly: "N/A",
      kk_assemblies_attended: 0,
      home_address: "N/A",
      email_address: "N/A",
      contact_number: "N/A",
      region: "N/A",
      province: "N/A",
      city_municipality: "N/A",
    },
  });

  useEffect(() => {
    if (selectedRecord) {
      console.log("EditRecordDialog: Loading selected record:", selectedRecord);
      form.reset({
        name: selectedRecord.name || "",
        birthday: selectedRecord.birthday ? new Date(selectedRecord.birthday) : new Date(),
        sex: selectedRecord.sex || "Male",
        civil_status: selectedRecord.civil_status || "N/A",
        barangay: selectedRecord.barangay || "",
        youth_classification: selectedRecord.youth_classification || "N/A",
        youth_age_group: selectedRecord.youth_age_group || "N/A",
        highest_education: selectedRecord.highest_education || "N/A",
        work_status: selectedRecord.work_status || "N/A",
        registered_voter: selectedRecord.registered_voter || "N/A",
        voted_last_election: selectedRecord.voted_last_election || "N/A",
        attended_kk_assembly: selectedRecord.attended_kk_assembly || "N/A",
        kk_assemblies_attended: selectedRecord.kk_assemblies_attended || 0,
        home_address: selectedRecord.home_address || "N/A",
        email_address: selectedRecord.email_address || "N/A",
        contact_number: selectedRecord.contact_number || "N/A",
        region: selectedRecord.region || "N/A",
        province: selectedRecord.province || "N/A",
        city_municipality: selectedRecord.city_municipality || "N/A",
      });
    }
  }, [selectedRecord, form]);

  const handleSubmit = (data: EditFormValues) => {
    console.log("EditRecordDialog: Form data being submitted:", data);
    
    // Ensure proper data formatting
    const formattedData = {
      ...data,
      // Ensure birthday is properly formatted
      birthday: data.birthday,
      // Ensure numbers are properly handled
      kk_assemblies_attended: Number(data.kk_assemblies_attended) || 0,
    };
    
    console.log("EditRecordDialog: Formatted data for submission:", formattedData);
    onSave(formattedData);
  };

  // Use the same barangays as the youth census form - sorted alphabetically
  const sortedBarangays = enumOptions.barangay
    .filter((b) => b && b.trim() !== "")
    .sort();

  // Helper function to capitalize only the first letter of the entire string
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Add "Other" to education and work status options
  const educationOptions = [...enumOptions.highest_education, "Other"];
  const workStatusOptions = [...enumOptions.work_status, "Other"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Youth Record</DialogTitle>
          <DialogDescription>
            Update the information for this youth record. Fields marked with * are required for identification. Other fields can be left as "N/A" if unknown.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value ? field.value.toISOString().slice(0, 10) : ''}
                            onChange={(e) => {
                              const dateValue = e.target.value ? new Date(e.target.value) : new Date();
                              field.onChange(dateValue);
                            }}
                            max={new Date().toISOString().slice(0, 10)}
                            min="1980-01-01"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sex *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sex" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {enumOptions.sex.filter(option => option && option.trim() !== "").map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="civil_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Civil Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select civil status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="N/A">N/A</SelectItem>
                            {enumOptions.civil_status.filter(option => option && option.trim() !== "").map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
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

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Location Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Region X or N/A" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Province</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Misamis Oriental or N/A" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city_municipality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City/Municipality</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Jasaan or N/A" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="barangay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Barangay *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select barangay" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sortedBarangays.map((barangay) => (
                              <SelectItem key={barangay} value={barangay}>
                                {capitalizeFirst(barangay)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="home_address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Home Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Complete home address or N/A" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Youth Classification */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Youth Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
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
                            <SelectItem value="N/A">N/A</SelectItem>
                            {enumOptions.youth_classification.filter(option => option && option.trim() !== "").map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="youth_age_group"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age Group</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select age group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="N/A">N/A</SelectItem>
                            {enumOptions.youth_age_group.filter(option => option && option.trim() !== "").map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
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

              {/* Education and Work */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Education & Work</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="highest_education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Highest Education</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select education level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="N/A">N/A</SelectItem>
                            {educationOptions.filter(option => option && option.trim() !== "").map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="work_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select work status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="N/A">N/A</SelectItem>
                            {workStatusOptions.filter(option => option && option.trim() !== "").map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
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

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="email@example.com or N/A" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Phone number or N/A" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Civic Participation */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Civic Participation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="registered_voter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registered Voter</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="N/A">N/A</SelectItem>
                            {enumOptions.registered_voter.filter(option => option && option.trim() !== "").map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="voted_last_election"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voted Last Election</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="N/A">N/A</SelectItem>
                            {enumOptions.voted_last_election.filter(option => option && option.trim() !== "").map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="attended_kk_assembly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attended KK Assembly</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (value === "No") {
                              form.setValue("kk_assemblies_attended", 0);
                            }
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="N/A">N/A</SelectItem>
                            {enumOptions.attended_kk_assembly.filter(option => option && option.trim() !== "").map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="kk_assemblies_attended"
                    render={({ field }) => {
                      const attendedKK = form.watch("attended_kk_assembly");
                      const isDisabled = attendedKK === "No";
                      return (
                        <FormItem>
                          <FormLabel>KK Assemblies Attended</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              disabled={isDisabled}
                              value={field.value || 0}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (!isDisabled) field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
