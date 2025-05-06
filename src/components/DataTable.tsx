
import { useState } from "react";
import { YouthRecord } from "@/lib/pb-client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, File, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { pbClient } from "@/lib/pb-client";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { formSchema } from "@/lib/schema";

interface DataTableProps {
  data: YouthRecord[];
  onDataChange: () => void; // Callback to refresh data after edit/delete
}

export function DataTable({ data, onDataChange }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<YouthRecord | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<YouthRecord>>({});
  const itemsPerPage = 10;
  
  // Get barangays and youth classifications from schema
  const barangayOptions = formSchema.shape.barangay.options;
  const youthClassificationOptions = formSchema.shape.youth_classification.options;

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Handle opening edit dialog
  const handleEdit = (record: YouthRecord) => {
    setSelectedRecord(record);
    setEditFormData({
      name: record.name,
      age: record.age,
      sex: record.sex,
      barangay: record.barangay,
      youth_classification: record.youth_classification,
      youth_age_group: record.youth_age_group,
      registered_voter: record.registered_voter,
    });
    setIsEditDialogOpen(true);
  };

  // Handle opening delete dialog
  const handleDelete = (record: YouthRecord) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  // Handle input change for edit form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select change for dropdowns
  const handleSelectChange = (value: string, fieldName: string) => {
    setEditFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  // Handle save edited record
  const handleSaveEdit = async () => {
    if (!selectedRecord) return;
    
    try {
      await pbClient.youth.update(selectedRecord.id, editFormData);
      toast.success("Record updated successfully");
      setIsEditDialogOpen(false);
      onDataChange(); // Refresh data after update
    } catch (error) {
      console.error("Error updating record:", error);
      toast.error("Failed to update record");
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedRecord) return;
    
    try {
      await pbClient.youth.delete(selectedRecord.id);
      toast.success("Record deleted successfully");
      setIsDeleteDialogOpen(false);
      onDataChange(); // Refresh data after delete
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Name",
      "Age",
      "Birthday",
      "Sex",
      "Barangay",
      "Classification",
      "Age Group",
      "Work Status",
      "Registered Voter",
    ];

    const rows = data.map((item) => [
      item.name,
      item.age,
      format(new Date(item.birthday), "yyyy-MM-dd"),
      item.sex,
      item.barangay,
      item.youth_classification,
      item.youth_age_group,
      item.work_status,
      item.registered_voter,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "youth_census_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const exportToPDF = () => {
    // This is a placeholder for PDF export functionality
    // In a real implementation, you would use a library like jspdf
    // But for now we'll just show an alert
    alert(
      "PDF export functionality would be implemented here using a library like jspdf"
    );
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Youth Census Records</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <FileText size={16} />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={exportToPDF}
            className="flex items-center gap-2"
          >
            <File size={16} />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Sex</TableHead>
              <TableHead>Barangay</TableHead>
              <TableHead>Classification</TableHead>
              <TableHead>Age Group</TableHead>
              <TableHead>Registered Voter</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.name}</TableCell>
                  <TableCell>{record.age}</TableCell>
                  <TableCell>{record.sex}</TableCell>
                  <TableCell>{record.barangay}</TableCell>
                  <TableCell>{record.youth_classification}</TableCell>
                  <TableCell>{record.youth_age_group}</TableCell>
                  <TableCell>{record.registered_voter}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(record)}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      >
                        <Edit size={16} />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(record)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, data.length)} of {data.length} records
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Youth Record</DialogTitle>
            <DialogDescription>
              Update the information for this youth record.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={editFormData.name || ""}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age" className="text-right">
                Age
              </Label>
              <Input
                id="age"
                name="age"
                value={editFormData.age || ""}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sex" className="text-right">
                Sex
              </Label>
              <Input
                id="sex"
                name="sex"
                value={editFormData.sex || ""}
                onChange={handleInputChange}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="barangay" className="text-right">
                Barangay
              </Label>
              <div className="col-span-3">
                <Select
                  value={editFormData.barangay || ""}
                  onValueChange={(value) => handleSelectChange(value, "barangay")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select barangay" />
                  </SelectTrigger>
                  <SelectContent>
                    {barangayOptions.map((barangay) => (
                      <SelectItem key={barangay} value={barangay}>
                        {barangay}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="classification" className="text-right">
                Classification
              </Label>
              <div className="col-span-3">
                <Select
                  value={editFormData.youth_classification || ""}
                  onValueChange={(value) => handleSelectChange(value, "youth_classification")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent>
                    {youthClassificationOptions.map((classification) => (
                      <SelectItem key={classification} value={classification}>
                        {classification}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
