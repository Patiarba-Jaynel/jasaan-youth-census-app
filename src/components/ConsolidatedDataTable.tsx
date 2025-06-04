
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TablePagination } from "@/components/table/TablePagination";
import { EditConsolidatedDialog } from "@/components/dialogs/EditConsolidatedDialog";
import { DeleteConsolidatedDialog } from "@/components/dialogs/DeleteConsolidatedDialog";
import { Edit, Trash2, Search } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface ConsolidatedData {
  id: string;
  barangay: string;
  age_bracket: string;
  gender: string;
  year: number;
  month: string;
  count: number;
}

interface ConsolidatedDataTableProps {
  data: ConsolidatedData[];
  onRecordUpdate: () => void;
}

export function ConsolidatedDataTable({ data, onRecordUpdate }: ConsolidatedDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBarangay, setFilterBarangay] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingRecord, setEditingRecord] = useState<ConsolidatedData | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<ConsolidatedData | null>(null);

  // Get unique values for filters - filter out empty strings
  const uniqueBarangays = useMemo(() => 
    [...new Set(data.map(record => record.barangay).filter(b => b && b.trim() !== ""))].sort(), 
    [data]
  );
  
  const uniqueYears = useMemo(() => 
    [...new Set(data.map(record => record.year).filter(y => y && !isNaN(y)))].sort((a, b) => b - a), 
    [data]
  );

  const uniqueMonths = useMemo(() => 
    [...new Set(data.map(record => record.month).filter(m => m && m.trim() !== ""))].sort(), 
    [data]
  );

  // Filter and search data
  const filteredData = useMemo(() => {
    return data.filter(record => {
      const matchesSearch = 
        record.barangay.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.age_bracket.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.month.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBarangay = !filterBarangay || record.barangay === filterBarangay;
      const matchesGender = !filterGender || record.gender === filterGender;
      const matchesYear = !filterYear || record.year.toString() === filterYear;
      const matchesMonth = !filterMonth || record.month === filterMonth;
      
      return matchesSearch && matchesBarangay && matchesGender && matchesYear && matchesMonth;
    });
  }, [data, searchTerm, filterBarangay, filterGender, filterYear, filterMonth]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterBarangay("");
    setFilterGender("");
    setFilterYear("");
    setFilterMonth("");
    setCurrentPage(1);
  };

  const handleEdit = (record: ConsolidatedData) => {
    setEditingRecord(record);
  };

  const handleDelete = (record: ConsolidatedData) => {
    setDeletingRecord(record);
  };

  const handleEditSave = () => {
    setEditingRecord(null);
    onRecordUpdate();
    toast.success("Record updated successfully");
  };

  const handleDeleteConfirm = () => {
    setDeletingRecord(null);
    onRecordUpdate();
    toast.success("Record deleted successfully");
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterBarangay} onValueChange={setFilterBarangay}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Barangay" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Barangays</SelectItem>
            {uniqueBarangays.map(barangay => (
              <SelectItem key={barangay} value={barangay}>{barangay}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterGender} onValueChange={setFilterGender}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Genders</SelectItem>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Years</SelectItem>
            {uniqueYears.map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Months</SelectItem>
            {uniqueMonths.map(month => (
              <SelectItem key={month} value={month}>{month}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Barangay</TableHead>
              <TableHead>Age Bracket</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.barangay}</TableCell>
                  <TableCell>{record.age_bracket}</TableCell>
                  <TableCell>{record.gender}</TableCell>
                  <TableCell>{record.year}</TableCell>
                  <TableCell>{record.month}</TableCell>
                  <TableCell className="font-semibold">{record.count}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(record)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={data.length}
        filteredRecords={filteredData.length}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        onPageChange={handlePageChange}
      />

      {/* Edit Dialog */}
      {editingRecord && (
        <EditConsolidatedDialog
          record={editingRecord}
          open={!!editingRecord}
          onOpenChange={(open) => !open && setEditingRecord(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Delete Dialog */}
      {deletingRecord && (
        <DeleteConsolidatedDialog
          record={deletingRecord}
          open={!!deletingRecord}
          onOpenChange={(open) => !open && setDeletingRecord(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
