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
import { enumOptions } from "@/lib/schema";
import { validateAgeConsistency, validateDropdownValue, validateRequiredFields } from "@/lib/validation";

interface DataTableProps {
  data: YouthRecord[];
  onDataChange: () => void;
}

// Normalize data to replace blank values with "N/A"
const normalizeValue = (value: any): string => {
  if (value === null || value === undefined || value === "" || (typeof value === 'string' && value.trim() === '')) {
    return "N/A";
  }
  return String(value);
};

// Helper function for consistent value comparison
const normalizeForComparison = (value: any): string => {
  if (value === null || value === undefined || value === "" || (typeof value === 'string' && value.trim() === '')) {
    return "N/A";
  }
  return String(value).trim();
};

export function DataTable({ data, onDataChange }: DataTableProps) {
  const tableState = useTableState(data);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBatchEditDialogOpen, setIsBatchEditDialogOpen] = useState(false);
  const [isDataProblemsDialogOpen, setIsDataProblemsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<YouthRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEdit = (record: YouthRecord) => {
    console.log("DataTable: Opening edit dialog for record:", record.id);
    setSelectedRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (record: YouthRecord) => {
    console.log("DataTable: Opening delete dialog for record:", record.id);
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveEdit = async (data: Partial<YouthRecord>) => {
    if (!selectedRecord) {
      console.error("DataTable: No selected record for edit");
      toast.error("No record selected for editing");
      return;
    }

    setIsProcessing(true);
    console.log("DataTable: Attempting to save edit for record:", selectedRecord.id, data);

    try {
      // Validate that we have a valid record ID
      if (!selectedRecord.id || selectedRecord.id.trim() === '') {
        throw new Error("Invalid record ID");
      }

      // Ensure critical fields are not empty
      const criticalFields = ['name', 'barangay'];
      const missingCritical = criticalFields.filter(field => {
        const value = data[field as keyof YouthRecord];
        return !value || value === 'N/A' || (typeof value === 'string' && value.trim() === '');
      });

      if (missingCritical.length > 0) {
        throw new Error(`Critical fields cannot be empty: ${missingCritical.join(', ')}`);
      }

      // Calculate age from birthday if birthday is provided
      let age = selectedRecord.age;
      if (data.birthday) {
        const today = new Date();
        const birthDate = new Date(data.birthday);
        const calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age = String(calculatedAge - 1);
        } else {
          age = String(calculatedAge);
        }
      }

      // Prepare the update data
      const updateData = {
        ...data,
        // Ensure numeric fields are properly converted
        kk_assemblies_attended: data.kk_assemblies_attended !== undefined ? Number(data.kk_assemblies_attended) : 0,
        age: age
      };

      console.log("DataTable: Sending update data:", updateData);

      await pbClient.youth.update(selectedRecord.id, updateData);
      
      console.log("DataTable: Record updated successfully");
      toast.success("Record updated successfully");
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
      onDataChange();
    } catch (error: any) {
      console.error("DataTable: Error updating record:", error);
      const errorMessage = error?.message || error?.data?.message || "Failed to update record";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRecord) {
      console.error("DataTable: No selected record for delete");
      toast.error("No record selected for deletion");
      return;
    }

    setIsProcessing(true);
    console.log("DataTable: Attempting to delete record:", selectedRecord.id);

    try {
      // Validate that we have a valid record ID
      if (!selectedRecord.id || selectedRecord.id.trim() === '') {
        throw new Error("Invalid record ID");
      }

      await pbClient.youth.delete(selectedRecord.id);
      
      console.log("DataTable: Record deleted successfully");
      toast.success("Record deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedRecord(null);
      onDataChange();
      return true;
    } catch (error: any) {
      console.error("DataTable: Error deleting record:", error);
      const errorMessage = error?.message || error?.data?.message || "Failed to delete record";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyExportFilters = () => {
    const count = tableState.getExportCount();
    toast.success(`Export filters applied (${count} records selected)`);
  };

  const handleBatchEdit = async (field: string, oldValue: string, newValue: string) => {
    try {
      console.log("DataTable: Batch edit starting:", { field, oldValue, newValue });
      
      const recordsToSearch = tableState.filteredData;
      console.log("DataTable: Records to search:", recordsToSearch.length);
      
      // Improved normalization function
      const normalizeForMatch = (value: any): string => {
        if (value === null || value === undefined || value === "") return "N/A";
        return String(value).trim().toLowerCase();
      };

      const normalizedOldValue = normalizeForMatch(oldValue);
      console.log("DataTable: Normalized old value:", normalizedOldValue);
      
      const recordsToUpdate = recordsToSearch.filter((record) => {
        const recordValue = normalizeForMatch(record[field as keyof YouthRecord]);
        
        // Try exact match first, then partial match
        const exactMatch = recordValue === normalizedOldValue;
        const partialMatch = recordValue.includes(normalizedOldValue) || normalizedOldValue.includes(recordValue);
        
        const matches = exactMatch || partialMatch;
        
        console.log(`DataTable: Record ${record.id}: ${field}="${record[field as keyof YouthRecord]}" -> normalized: "${recordValue}" vs "${normalizedOldValue}" - matches: ${matches}`);
        return record.id && matches;
      });
      
      console.log("DataTable: Records to update:", recordsToUpdate.length);
      
      if (recordsToUpdate.length === 0) {
        console.log("DataTable: No matching records found. Sample values for field:", field);
        recordsToSearch.slice(0, 5).forEach(record => {
          const value = record[field as keyof YouthRecord];
          console.log(`DataTable: Record ${record.id}: ${field}="${value}" (normalized: "${normalizeForMatch(value)}")`);
        });
        toast.info("No matching records found to update");
        return;
      }
      
      let updatedCount = 0;
      const errors = [];
      
      for (const record of recordsToUpdate) {
        try {
          if (!record.id || record.id.trim() === '') {
            console.error("DataTable: Invalid record ID for batch update:", record);
            continue;
          }

          const normalizedValue = newValue.trim() === '' ? 'N/A' : newValue;
          await pbClient.youth.update(record.id, { [field]: normalizedValue });
          updatedCount++;
          console.log(`DataTable: Successfully updated record ${record.id}`);
        } catch (error: any) {
          console.error(`DataTable: Error updating record ${record.id}:`, error);
          errors.push(`Failed to update ${record.name}: ${error?.message || error}`);
        }
      }
      
      if (errors.length > 0) {
        toast.error(`Updated ${updatedCount} records, but ${errors.length} failed`);
        console.error("DataTable: Batch update errors:", errors);
      } else {
        toast.success(`Successfully updated ${updatedCount} records`);
      }
      
      onDataChange();
    } catch (error: any) {
      console.error("DataTable: Error during batch update:", error);
      toast.error("Failed to complete batch update");
    }
  };

  // Enhanced data validation with improved duplicate detection
  const getDataIssues = () => {
    const issues: Array<{
      recordId: string;
      recordName: string;
      issue: string;
      severity: 'error' | 'warning';
      field?: string;
      issueType?: string;
      duplicateGroup?: string[];
    }> = [];

    // Get valid options from schema with proper typing
    const validOptions: Record<string, readonly string[]> = {
      sex: enumOptions.sex,
      civil_status: enumOptions.civil_status,
      youth_classification: enumOptions.youth_classification,
      youth_age_group: enumOptions.youth_age_group,
      highest_education: enumOptions.highest_education,
      work_status: enumOptions.work_status,
      registered_voter: enumOptions.registered_voter,
      voted_last_election: enumOptions.voted_last_election,
      attended_kk_assembly: enumOptions.attended_kk_assembly,
    };

    // Check for duplicates (excluding N/A values)
    const nameMap = new Map<string, YouthRecord[]>();
    const emailMap = new Map<string, YouthRecord[]>();
    const contactMap = new Map<string, YouthRecord[]>();

    data.forEach(record => {
      if (record.name && normalizeValue(record.name) !== "N/A") {
        const key = record.name.toLowerCase().trim();
        if (!nameMap.has(key)) nameMap.set(key, []);
        nameMap.get(key)!.push(record);
      }

      if (record.email_address && normalizeValue(record.email_address) !== "N/A") {
        const key = record.email_address.toLowerCase().trim();
        if (!emailMap.has(key)) emailMap.set(key, []);
        emailMap.get(key)!.push(record);
      }

      if (record.contact_number && normalizeValue(record.contact_number) !== "N/A") {
        const key = record.contact_number.trim();
        if (!contactMap.has(key)) contactMap.set(key, []);
        contactMap.get(key)!.push(record);
      }
    });

    // Add duplicate issues
    nameMap.forEach((records, name) => {
      if (records.length > 1) {
        issues.push({
          recordId: records[0].id,
          recordName: records[0].name,
          issue: `Duplicate name found: "${name}" (${records.length} records)`,
          severity: 'warning',
          field: 'name',
          issueType: 'duplicate_name',
          duplicateGroup: records.map(r => r.id)
        });
      }
    });

    emailMap.forEach((records, email) => {
      if (records.length > 1) {
        issues.push({
          recordId: records[0].id,
          recordName: records[0].name,
          issue: `Duplicate email found: "${email}" (${records.length} records)`,
          severity: 'error',
          field: 'email_address',
          issueType: 'duplicate_email',
          duplicateGroup: records.map(r => r.id)
        });
      }
    });

    contactMap.forEach((records, contact) => {
      if (records.length > 1) {
        issues.push({
          recordId: records[0].id,
          recordName: records[0].name,
          issue: `Duplicate contact number found: "${contact}" (${records.length} records)`,
          severity: 'warning',
          field: 'contact_number',
          issueType: 'duplicate_contact',
          duplicateGroup: records.map(r => r.id)
        });
      }
    });

    // Validate each record
    data.forEach(record => {
      const age = parseInt(record.age);
      const birthday = new Date(record.birthday);
      
      // Age/birthday consistency check
      const ageValidation = validateAgeConsistency(age, record.birthday.toString(), record.youth_age_group);
      ageValidation.errors.forEach(error => {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: error,
          severity: 'error',
          field: 'age',
          issueType: 'age_mismatch'
        });
      });

      // Invalid dropdown values
      Object.entries(validOptions).forEach(([field, options]) => {
        const value = record[field as keyof YouthRecord];
        const validation = validateDropdownValue(String(value), options, field);
        validation.errors.forEach(error => {
          issues.push({
            recordId: record.id,
            recordName: record.name,
            issue: error,
            severity: 'error',
            field: field,
            issueType: 'invalid_dropdown'
          });
        });
      });
      
      // Required field validation
      const fieldValidation = validateRequiredFields(record);
      fieldValidation.errors.forEach(error => {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: error,
          severity: 'error',
          issueType: 'missing_required'
        });
      });

      fieldValidation.warnings.forEach(warning => {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: warning,
          severity: 'warning',
          issueType: 'missing_optional'
        });
      });
      
      // Invalid email format
      if (record.email_address && normalizeValue(record.email_address) !== "N/A" && !record.email_address.includes('@')) {
        issues.push({
          recordId: record.id,
          recordName: record.name,
          issue: 'Invalid email format',
          severity: 'warning',
          field: 'email_address',
          issueType: 'invalid_email'
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
          {/* Only show "See Problems" when there are actual issues */}
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
        selectedRecords={tableState.filteredData}
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
