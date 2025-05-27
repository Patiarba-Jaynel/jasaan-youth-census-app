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

const editFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.string().min(1, "Age is required"),
  birthday: z.date({
    required_error: "Birthday is required",
  }),
  sex: z.enum(["MALE", "FEMALE"]),
  civil_status: z.enum(["SINGLE", "MARRIED", "LIVED-IN", "WIDOWED"]),
  barangay: z.string().min(1, "Barangay is required"),
  youth_classification: z.enum(["ISY", "OSY", "WY", "YSN"]),
  youth_age_group: z.enum(["CORE YOUTH (18-24)", "CHILD YOUTH (15-17)", "YOUNG ADULT (25-30)"]),
  highest_education: z.string().min(1, "Education is required"),
  work_status: z.string().min(1, "Work status is required"),
  registered_voter: z.enum(["Yes", "No"]),
  voted_last_election: z.enum(["Yes", "No"]),
  attended_kk_assembly: z.enum(["Yes", "No"]),
  kk_assemblies_attended: z.coerce.number().int().nonnegative(),
  home_address: z.string().min(1, "Address is required"),
  email_address: z.string().email("Invalid email address"),
  contact_number: z.string().min(7, "Contact number must be at least 7 characters"),
  region: z.string().optional(),
  province: z.string().optional(),
  city_municipality: z.string().optional(),
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
      civil_status: "SINGLE",
      barangay: "",
      youth_classification: "ISY",
      youth_age_group: "CORE YOUTH (18-24)",
      highest_education: "",
      work_status: "",
      registered_voter: "Yes",
      voted_last_election: "Yes",
      attended_kk_assembly: "Yes",
      kk_assemblies_attended: 0,
      home_address: "",
      email_address: "",
      contact_number: "",
      region: "",
      province: "",
      city_municipality: "",
    },
  });

  useEffect(() => {
    if (selectedRecord) {
      form.reset({
        name: selectedRecord.name || "",
        age: selectedRecord.age || "",
        birthday: selectedRecord.birthday ? new Date(selectedRecord.birthday) : new Date(),
        sex: (selectedRecord.sex as any) || "MALE",
        civil_status: (selectedRecord.civil_status as any) || "SINGLE",
        barangay: selectedRecord.barangay || "",
        youth_classification: (selectedRecord.youth_classification as any) || "ISY",
        youth_age_group: (selectedRecord.youth_age_group as any) || "CORE YOUTH (18-24)",
        highest_education: selectedRecord.highest_education || "",
        work_status: selectedRecord.work_status || "",
        registered_voter: (selectedRecord.registered_voter as any) || "Yes",
        voted_last_election: (selectedRecord.voted_last_election as any) || "Yes",
        attended_kk_assembly: (selectedRecord.attended_kk_assembly as any) || "Yes",
        kk_assemblies_attended: selectedRecord.kk_assemblies_attended || 0,
        home_address: selectedRecord.home_address || "",
        email_address: selectedRecord.email_address || "",
        contact_number: selectedRecord.contact_number || "",
        region: selectedRecord.region || "",
        province: selectedRecord.province || "",
        city_municipality: selectedRecord.city_municipality || "",
      });
    }
  }, [selectedRecord, form]);

  const handleSubmit = (data: EditFormValues) => {
    console.log("Form data being submitted:", data);
    onSave(data);
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
            Update the information for this youth record. All fields can be edited.
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
                        <FormLabel>Full Name</FormLabel>
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
                        <FormLabel>Age</FormLabel>
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
                        <FormLabel>Birthday</FormLabel>
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
                        <FormLabel>Sex</FormLabel>
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
                          <Input {...field} placeholder="e.g., Region X" />
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
                          <Input {...field} placeholder="e.g., Misamis Oriental" />
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
                          <Input {...field} placeholder="e.g., Jasaan" />
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
                        <FormLabel>Barangay</FormLabel>
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
                          <Input {...field} placeholder="Complete home address" />
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
                          <Input {...field} type="email" />
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
                          <Input {...field} />
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
