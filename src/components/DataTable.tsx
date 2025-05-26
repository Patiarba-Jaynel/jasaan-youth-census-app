
import { useState } from "react";
import { YouthRecord, pbClient } from "@/lib/pb-client";
import { toast } from "@/components/ui/sonner";
import { useTableState } from "@/hooks/use-table-state";
import { TableHeader } from "@/components/table/TableHeader";
import { YouthTable } from "@/components/table/YouthTable";
import { TablePagination } from "@/components/table/TablePagination";
import { EditRecordDialog } from "@/components/dialogs/EditRecordDialog";
import { DeleteRecordDialog } from "@/components/dialogs/DeleteRecordDialog";
import { ExportFilterDialog } from "@/components/dialogs/ExportFilterDialog";
import { BatchEditDialog } from "@/components/dialogs/BatchEditDialog";
import { DataProblemsDialog } from "@/components/dialogs/DataProblemsDialog";
import { Button } from "@/components/ui/button";
import { Search, Replace, AlertTriangle } from "lucide-react";

interface DataTableProps {
  data: YouthRecord[];
  onDataChange: () => void;
}

export function DataTable({ data, onDataChange }: DataTableProps) {
  const tableState = useTableState(data);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBatchEditDialogOpen, setIsBatchEditDialogOpen] = useState(false);
  const [isDataProblemsDialogOpen, setIsDataProblemsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<YouthRecord | null>(null);

  const handleEdit = (record: YouthRecord) => {
    setSelectedRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (record: YouthRecord) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveEdit = async (data: Partial<YouthRecord>) => {
    if (!selectedRecord) return;

    try {
      await pbClient.youth.update(selectedRecord.id, data);
      toast.success("Record updated successfully");
      setIsEditDialogOpen(false);
      onDataChange();
    } catch (error) {
      console.error("Error updating record:", error);
      toast.error("Failed to update record");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRecord) return;

    try {
      await pbClient.youth.delete(selectedRecord.id);
      toast.success("Record deleted successfully");
      setIsDeleteDialogOpen(false);
      onDataChange();
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
    }
  };

  const handleApplyExportFilters = () => {
    toast.success(`Export filters applied (${tableState.getExportCount()} records selected)`);
  };

  const handleBatchEdit = async (field: string, oldValue: string, newValue: string) => {
    try {
      // Get all records that need to be updated and ensure they are valid YouthRecords
      const exportData = tableState.getExportData() as YouthRecord[];
      const recordsToUpdate = exportData.filter((record) => {
        return record.id && String(record[field as keyof YouthRecord]) === oldValue;
      });
      
      if (recordsToUpdate.length === 0) {
        toast.info("No matching records found to update");
        return;
      }
      
      // Update each record
      let updatedCount = 0;
      for (const record of recordsToUpdate) {
        await pbClient.youth.update(record.id, { [field]: newValue });
        updatedCount++;
      }
      
      toast.success(`Updated ${updatedCount} records`);
      onDataChange();
    } catch (error) {
      console.error("Error during batch update:", error);
      toast.error("Failed to complete batch update");
    }
  };

  // Get data validation issues with detailed information
  const getDataIssues = () => {
    const issues: Array<{
      recordId: string;
      recordName: string;
      issue: string;
      severity: 'error' | 'warning';
    }> = [];

    data.forEach(record => {
      const age = parseInt(record.age);
      const birthday = new Date(record.birthday);
      const currentYear = new Date().getFullYear();
      const birthYear = birthday.getFullYear();
      const calculatedAge = currentYear - birthYear;
      
      // Check for age/birthday mismatch
      if (Math.abs(age - calculatedAge) > 1) {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: `Age (${age}) doesn't match birthday (calculated age: ${calculatedAge})`,
          severity: 'error'
        });
      }
      
      // Check for missing required fields
      if (!record.name) {
        issues.push({
          recordId: record.id,
          recordName: record.name || 'Unknown',
          issue: 'Missing name',
          severity: 'error'
        });
      }
      if (!record.age) {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Missing age',
          severity: 'error'
        });
      }
      if (!record.birthday) {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Missing birthday',
          severity: 'error'
        });
      }
      if (!record.sex) {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Missing sex/gender',
          severity: 'error'
        });
      }
      
      // Check for invalid email format
      if (record.email_address && !record.email_address.includes('@')) {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Invalid email format',
          severity: 'warning'
        });
      }
    });
    
    return issues;
  };

  const dataIssues = getDataIssues();

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <div className="flex items-center gap-2">
          {dataIssues.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
              onClick={() => setIsDataProblemsDialogOpen(true)}
            >
              <AlertTriangle size={16} />
              See Problems ({dataIssues.length})
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsBatchEditDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Replace size={16} />
            Find & Replace
          </Button>
        </div>
      </div>

      {/* Header with search/filter/column toggles */}
      <TableHeader 
        searchTerm={tableState.searchTerm}
        onSearchChange={tableState.setSearchTerm}
        selectedFilters={tableState.advancedFilters}
        onFilterChange={tableState.handleAdvancedFilterChange}
        onClearFilters={tableState.clearAllFilters}
        columns={tableState.columns}
        onToggleColumn={tableState.toggleColumnVisibility}
        onExportDialogOpen={() => tableState.setIsExportFilterDialogOpen(true)}
        data={data}
        getExportCount={tableState.getExportCount}
        exportToCSV={tableState.exportToCSV}
        hasActiveFilters={tableState.hasActiveFilters}
      />

      {/* Youth Table */}
      <YouthTable 
        columns={tableState.columns}
        records={tableState.currentItems}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      <TablePagination 
        currentPage={tableState.currentPage}
        totalPages={tableState.totalPages}
        totalRecords={data.length}
        filteredRecords={tableState.filteredData.length}
        indexOfFirstItem={tableState.indexOfFirstItem}
        indexOfLastItem={tableState.indexOfLastItem}
        onPageChange={tableState.setCurrentPage}
      />

      {/* Edit Dialog */}
      <EditRecordDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedRecord={selectedRecord}
        onSave={handleSaveEdit}
      />

      {/* Delete Dialog */}
      <DeleteRecordDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Export Filter Dialog */}
      <ExportFilterDialog 
        open={tableState.isExportFilterDialogOpen}
        onOpenChange={tableState.setIsExportFilterDialogOpen}
        exportFilters={tableState.exportFilters}
        toggleFilter={tableState.toggleExportFilter}
        clearFilters={tableState.clearExportFilters}
        getExportCount={tableState.getExportCount}
        onApplyFilters={handleApplyExportFilters}
      />

      {/* Batch Edit Dialog */}
      <BatchEditDialog
        open={isBatchEditDialogOpen}
        onOpenChange={setIsBatchEditDialogOpen}
        selectedRecords={tableState.getExportData() as YouthRecord[]}
        onSave={handleBatchEdit}
      />

      {/* Data Problems Dialog */}
      <DataProblemsDialog
        open={isDataProblemsDialogOpen}
        onOpenChange={setIsDataProblemsDialogOpen}
        issues={dataIssues}
        onEditRecord={handleEdit}
      />
    </div>
  );
}
