
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
import { formSchema } from "@/lib/schema";
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
      // Allow N/A for non-critical fields, but normalize empty strings
      const normalizedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => {
          // Critical fields cannot be N/A or empty
          const criticalFields = ['name', 'age', 'birthday', 'sex', 'barangay'];
          if (criticalFields.includes(key) && (!value || value === 'N/A' || (typeof value === 'string' && value.trim() === ''))) {
            throw new Error(`${key} is required and cannot be empty`);
          }
          
          return [
            key,
            typeof value === 'string' && value.trim() === '' ? 'N/A' : value
          ];
        })
      );

      await pbClient.youth.update(selectedRecord.id, normalizedData);
      toast.success("Record updated successfully");
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
      onDataChange();
    } catch (error: any) {
      console.error("Error updating record:", error);
      toast.error(error.message || "Failed to update record");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRecord) return;

    try {
      await pbClient.youth.delete(selectedRecord.id);
      toast.success("Record deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedRecord(null);
      onDataChange();
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
    }
  };

  const handleApplyExportFilters = () => {
    const count = tableState.getExportCount();
    toast.success(`Export filters applied (${count} records selected)`);
  };

  const handleBatchEdit = async (field: string, oldValue: string, newValue: string) => {
    try {
      console.log("Batch edit starting:", { field, oldValue, newValue });
      
      const recordsToSearch = tableState.filteredData;
      console.log("Records to search:", recordsToSearch.length);
      
      const fieldMapping: { [key: string]: string } = {
        "civil_status": "civil_status",
        "name": "name",
        "age": "age",
        "sex": "sex",
        "barangay": "barangay",
        "youth_classification": "youth_classification",
        "youth_age_group": "youth_age_group",
        "highest_education": "highest_education",
        "work_status": "work_status",
        "registered_voter": "registered_voter",
        "voted_last_election": "voted_last_election",
        "attended_kk_assembly": "attended_kk_assembly",
        "kk_assemblies_attended": "kk_assemblies_attended",
        "home_address": "home_address"
      };

      const actualFieldName = fieldMapping[field] || field;
      console.log("Field mapping:", field, "->", actualFieldName);
      
      const recordsToUpdate = recordsToSearch.filter((record) => {
        const recordValue = normalizeForComparison(record[actualFieldName as keyof YouthRecord]);
        const normalizedOldValue = normalizeForComparison(oldValue);
        
        const exactMatch = recordValue === normalizedOldValue;
        const caseInsensitiveMatch = recordValue.toLowerCase() === normalizedOldValue.toLowerCase();
        const upperCaseMatch = recordValue.toUpperCase() === normalizedOldValue.toUpperCase();
        
        const matches = exactMatch || caseInsensitiveMatch || upperCaseMatch;
        
        console.log(`Record ${record.id}: ${actualFieldName}="${recordValue}" vs "${normalizedOldValue}" - matches: ${matches}`);
        return record.id && matches;
      });
      
      console.log("Records to update:", recordsToUpdate.length);
      
      if (recordsToUpdate.length === 0) {
        console.log("No matching records found. Sample values for field:", actualFieldName);
        recordsToSearch.slice(0, 5).forEach(record => {
          const value = record[actualFieldName as keyof YouthRecord];
          console.log(`Record ${record.id}: ${actualFieldName}="${value}" (normalized: "${normalizeForComparison(value)}")`);
        });
        toast.info("No matching records found to update");
        return;
      }
      
      let updatedCount = 0;
      for (const record of recordsToUpdate) {
        const normalizedValue = newValue.trim() === '' ? 'N/A' : newValue;
        await pbClient.youth.update(record.id, { [actualFieldName]: normalizedValue });
        updatedCount++;
      }
      
      toast.success(`Updated ${updatedCount} records`);
      onDataChange();
    } catch (error) {
      console.error("Error during batch update:", error);
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
      sex: formSchema.shape.sex.options,
      civil_status: formSchema.shape.civil_status.options,
      youth_classification: formSchema.shape.youth_classification.options,
      youth_age_group: formSchema.shape.youth_age_group.options,
      highest_education: formSchema.shape.highest_education.options,
      work_status: formSchema.shape.work_status.options,
      registered_voter: formSchema.shape.registered_voter.options,
      voted_last_election: formSchema.shape.voted_last_election.options,
      attended_kk_assembly: formSchema.shape.attended_kk_assembly.options,
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
