
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
import { ScrollArea } from "@/components/ui/scroll-area";
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

export function ConsolidatedDataTable({ data = [], onRecordUpdate }: ConsolidatedDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBarangay, setFilterBarangay] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingRecord, setEditingRecord] = useState<ConsolidatedData | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<ConsolidatedData | null>(null);

  // Ensure data is always an array to prevent crashes
  const safeData = Array.isArray(data) ? data : [];

  // Get unique values for filters - filter out empty strings and ensure values exist
  const uniqueBarangays = useMemo(() => {
    const barangays = safeData
      .map(record => record?.barangay)
      .filter(b => b && typeof b === 'string' && b.trim() !== "");
    return [...new Set(barangays)].sort();
  }, [safeData]);
  
  const uniqueYears = useMemo(() => {
    const years = safeData
      .map(record => record?.year)
      .filter(y => y && !isNaN(Number(y)));
    return [...new Set(years)].sort((a, b) => Number(b) - Number(a));
  }, [safeData]);

  const uniqueMonths = useMemo(() => {
    const months = safeData
      .map(record => record?.month)
      .filter(m => m && typeof m === 'string' && m.trim() !== "");
    return [...new Set(months)];
  }, [safeData]);

  // Filter and search data with safety checks
  const filteredData = useMemo(() => {
    return safeData.filter(record => {
      if (!record) return false;
      
      const matchesSearch = 
        (record.barangay || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.age_bracket || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.gender || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.month || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBarangay = !filterBarangay || filterBarangay === "all-barangays" || record.barangay === filterBarangay;
      const matchesGender = !filterGender || filterGender === "all-genders" || record.gender === filterGender;
      const matchesYear = !filterYear || filterYear === "all-years" || String(record.year) === filterYear;
      const matchesMonth = !filterMonth || filterMonth === "all-months" || record.month === filterMonth;
      
      return matchesSearch && matchesBarangay && matchesGender && matchesYear && matchesMonth;
    });
  }, [safeData, searchTerm, filterBarangay, filterGender, filterYear, filterMonth]);

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
    if (record && record.id) {
      setEditingRecord(record);
    }
  };

  const handleDelete = (record: ConsolidatedData) => {
    if (record && record.id) {
      setDeletingRecord(record);
    }
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

  // Show loading state if data is not ready
  if (!safeData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading data...</p>
      </div>
    );
  }

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
          <SelectContent className="bg-white">
            <ScrollArea className="h-[200px]">
              <SelectItem value="all-barangays">All Barangays</SelectItem>
              {uniqueBarangays.map(barangay => (
                <SelectItem key={barangay} value={barangay}>{barangay}</SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>

        <Select value={filterGender} onValueChange={setFilterGender}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by Gender" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all-genders">All Genders</SelectItem>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <ScrollArea className="h-[200px]">
              <SelectItem value="all-years">All Years</SelectItem>
              {uniqueYears.map(year => (
                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>

        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <ScrollArea className="h-[200px]">
              <SelectItem value="all-months">All Months</SelectItem>
              {uniqueMonths.map(month => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </ScrollArea>
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
                  {safeData.length === 0 ? "No data available" : "No records found"}
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.barangay || 'N/A'}</TableCell>
                  <TableCell>{record.age_bracket || 'N/A'}</TableCell>
                  <TableCell>{record.gender || 'N/A'}</TableCell>
                  <TableCell>{record.year || 'N/A'}</TableCell>
                  <TableCell>{record.month || 'N/A'}</TableCell>
                  <TableCell className="font-semibold">{record.count || 0}</TableCell>
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
      {safeData.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={safeData.length}
          filteredRecords={filteredData.length}
          indexOfFirstItem={indexOfFirstItem}
          indexOfLastItem={indexOfLastItem}
          onPageChange={handlePageChange}
        />
      )}

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
