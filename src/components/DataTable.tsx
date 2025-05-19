
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
import { Button } from "@/components/ui/button";
import { Search, Replace } from "lucide-react";

interface DataTableProps {
  data: YouthRecord[];
  onDataChange: () => void;
}

export function DataTable({ data, onDataChange }: DataTableProps) {
  const tableState = useTableState(data);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBatchEditDialogOpen, setIsBatchEditDialogOpen] = useState(false);
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
      // with the id field which is required for the update operation
      const exportData = tableState.getExportData();
      const recordsToUpdate = exportData.filter((record): record is YouthRecord => {
        return 'id' in record && String(record[field as keyof YouthRecord]) === oldValue;
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

  return (
    <div className="w-full">
      <div className="flex justify-end mb-2">
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
        selectedRecords={tableState.getExportData()}
        onSave={handleBatchEdit}
      />
    </div>
  );
}
