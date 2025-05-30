
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { YouthRecord } from "@/lib/pb-client";
import { formSchema } from "@/lib/schema";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface EditRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRecord: YouthRecord | null;
  onSave: (data: any) => void;
}

// Updated schema to allow N/A or blank for non-critical fields
const editFormSchema = z.object({
  // Critical fields - required for identification
  name: z.string().min(1, "Name is required for identification"),
  age: z.string().min(1, "Age is required"),
  birthday: z.date({
    required_error: "Birthday is required",
  }),
  sex: z.enum(["MALE", "FEMALE"]),
  barangay: z.string().min(1, "Barangay is required for location identification"),
  
  // Semi-important fields - can be N/A but should be filled when possible
  civil_status: z.string().optional().default("N/A"),
  youth_classification: z.string().optional().default("N/A"),
  youth_age_group: z.string().optional().default("N/A"),
  
  // Optional fields - can be N/A or blank
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
      age: "",
      birthday: new Date(),
      sex: "MALE",
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
      form.reset({
        name: selectedRecord.name || "",
        age: selectedRecord.age || "",
        birthday: selectedRecord.birthday ? new Date(selectedRecord.birthday) : new Date(),
        sex: (selectedRecord.sex as any) || "MALE",
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
    console.log("Form data being submitted:", data);
    
    // Check for critical missing fields and suggest deletion if necessary
    const criticalFields = ['name', 'age', 'barangay'];
    const missingCritical = criticalFields.filter(field => {
      const value = data[field as keyof EditFormValues];
      return !value || value === 'N/A' || (typeof value === 'string' && value.trim() === '');
    });
    
    if (missingCritical.length > 0) {
      if (confirm(`Missing critical identification fields: ${missingCritical.join(', ')}. This record may not be useful without this information. Do you want to continue saving or consider deleting this record instead?`)) {
        onSave(data);
      }
    } else {
      onSave(data);
    }
  };

  // Get options from schema
  const barangayOptions = [
    "Aplaya", "Bobontugan", "Corrales", "Jampason", "Kimaya",
    "Lower Jasaan (Pob.)", "Luz Banzon", "San Antonio", 
    "San Nicolas", "Solana", "Upper Jasaan (Pob.)"
  ];

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
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age *</FormLabel>
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
                      <FormItem className="flex flex-col">
                        <FormLabel>Birthday *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
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
                            {formSchema.shape.sex.options.map((option) => (
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
                            {formSchema.shape.civil_status.options.map((option) => (
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
                            {barangayOptions.map((option) => (
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
                            {formSchema.shape.youth_classification.options.map((option) => (
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
                            {formSchema.shape.youth_age_group.options.map((option) => (
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
                            {formSchema.shape.highest_education.options.map((option) => (
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
                            {formSchema.shape.work_status.options.map((option) => (
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
                          <Input {...field} type="email" placeholder="email@example.com or N/A" />
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
                            {formSchema.shape.registered_voter.options.map((option) => (
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
                            {formSchema.shape.voted_last_election.options.map((option) => (
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
                            {formSchema.shape.attended_kk_assembly.options.map((option) => (
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
