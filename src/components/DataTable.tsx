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
      const exportData = tableState.getExportData() as YouthRecord[];
      const recordsToUpdate = exportData.filter((record) => {
        return record.id && String(record[field as keyof YouthRecord]) === oldValue;
      });
      
      if (recordsToUpdate.length === 0) {
        toast.info("No matching records found to update");
        return;
      }
      
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

  // Enhanced data validation with duplicate detection
  const getDataIssues = () => {
    const issues: Array<{
      recordId: string;
      recordName: string;
      issue: string;
      severity: 'error' | 'warning';
      field?: string;
    }> = [];

    // Check for duplicates
    const nameMap = new Map<string, YouthRecord[]>();
    const emailMap = new Map<string, YouthRecord[]>();
    const contactMap = new Map<string, YouthRecord[]>();

    data.forEach(record => {
      // Group by name
      if (record.name) {
        const key = record.name.toLowerCase().trim();
        if (!nameMap.has(key)) nameMap.set(key, []);
        nameMap.get(key)!.push(record);
      }

      // Group by email
      if (record.email_address) {
        const key = record.email_address.toLowerCase().trim();
        if (!emailMap.has(key)) emailMap.set(key, []);
        emailMap.get(key)!.push(record);
      }

      // Group by contact number
      if (record.contact_number) {
        const key = record.contact_number.trim();
        if (!contactMap.has(key)) contactMap.set(key, []);
        contactMap.get(key)!.push(record);
      }
    });

    // Add duplicate issues
    nameMap.forEach((records, name) => {
      if (records.length > 1) {
        records.forEach(record => {
          issues.push({
            recordId: record.id,
            recordName: record.name,
            issue: `Duplicate name found: "${name}" (${records.length} records)`,
            severity: 'warning',
            field: 'name'
          });
        });
      }
    });

    emailMap.forEach((records, email) => {
      if (records.length > 1) {
        records.forEach(record => {
          issues.push({
            recordId: record.id,
            recordName: record.name,
            issue: `Duplicate email found: "${email}" (${records.length} records)`,
            severity: 'error',
            field: 'email_address'
          });
        });
      }
    });

    contactMap.forEach((records, contact) => {
      if (records.length > 1) {
        records.forEach(record => {
          issues.push({
            recordId: record.id,
            recordName: record.name,
            issue: `Duplicate contact number found: "${contact}" (${records.length} records)`,
            severity: 'warning',
            field: 'contact_number'
          });
        });
      }
    });

    // Existing validation logic
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
          severity: 'error',
          field: 'age'
        });
      }
      
      // Check for missing required fields
      if (!record.name || record.name.trim() === '') {
        issues.push({
          recordId: record.id,
          recordName: record.name || 'Unknown',
          issue: 'Missing name',
          severity: 'error',
          field: 'name'
        });
      }
      if (!record.age || record.age.trim() === '') {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Missing age',
          severity: 'error',
          field: 'age'
        });
      }
      if (!record.birthday) {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Missing birthday',
          severity: 'error',
          field: 'birthday'
        });
      }
      if (!record.sex) {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Missing sex/gender',
          severity: 'error',
          field: 'sex'
        });
      }
      if (!record.barangay || record.barangay.trim() === '') {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Missing barangay',
          severity: 'error',
          field: 'barangay'
        });
      }
      if (!record.youth_classification) {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Missing youth classification',
          severity: 'error',
          field: 'youth_classification'
        });
      }
      if (!record.youth_age_group) {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Missing age group',
          severity: 'error',
          field: 'youth_age_group'
        });
      }
      if (!record.highest_education) {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Missing education level',
          severity: 'warning',
          field: 'highest_education'
        });
      }
      if (!record.work_status) {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Missing work status',
          severity: 'warning',
          field: 'work_status'
        });
      }
      if (!record.civil_status) {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Missing civil status',
          severity: 'warning',
          field: 'civil_status'
        });
      }
      if (!record.registered_voter) {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Missing voter registration status',
          severity: 'warning',
          field: 'registered_voter'
        });
      }
      if (!record.voted_last_election) {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Missing voting history',
          severity: 'warning',
          field: 'voted_last_election'
        });
      }
      if (!record.attended_kk_assembly) {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Missing KK assembly attendance info',
          severity: 'warning',
          field: 'attended_kk_assembly'
        });
      }
      if (!record.home_address || record.home_address.trim() === '') {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Missing home address',
          severity: 'warning',
          field: 'home_address'
        });
      }
      if (!record.email_address || record.email_address.trim() === '') {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Missing email address',
          severity: 'warning',
          field: 'email_address'
        });
      }
      if (!record.contact_number || record.contact_number.trim() === '') {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Missing contact number',
          severity: 'warning',
          field: 'contact_number'
        });
      }
      
      // Check for invalid email format
      if (record.email_address && !record.email_address.includes('@')) {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Invalid email format',
          severity: 'warning',
          field: 'email_address'
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
        records={data}
      />
    </div>
  );
}
