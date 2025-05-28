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
      // Normalize all string fields to replace empty values with "N/A"
      const normalizedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          typeof value === 'string' && value.trim() === '' ? 'N/A' : value
        ])
      );

      await pbClient.youth.update(selectedRecord.id, normalizedData);
      toast.success("Record updated successfully");
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
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
      
      const exportData = tableState.getExportData() as YouthRecord[];
      console.log("Export data count:", exportData.length);
      console.log("Sample export data:", exportData.slice(0, 3));
      
      const recordsToUpdate = exportData.filter((record) => {
        const recordValue = String(record[field as keyof YouthRecord]);
        const matches = recordValue === oldValue;
        console.log(`Record ${record.id}: ${field}="${recordValue}" matches "${oldValue}"?`, matches);
        return record.id && matches;
      });
      
      console.log("Records to update:", recordsToUpdate.length);
      
      if (recordsToUpdate.length === 0) {
        console.log("No matching records found. Checking all civil status values in data:");
        data.forEach(record => {
          console.log(`Record ${record.id}: civil_status="${record.civil_status}"`);
        });
        toast.info("No matching records found to update");
        return;
      }
      
      let updatedCount = 0;
      for (const record of recordsToUpdate) {
        // Normalize the new value
        const normalizedValue = newValue.trim() === '' ? 'N/A' : newValue;
        await pbClient.youth.update(record.id, { [field]: normalizedValue });
        updatedCount++;
      }
      
      toast.success(`Updated ${updatedCount} records`);
      onDataChange();
    } catch (error) {
      console.error("Error during batch update:", error);
      toast.error("Failed to complete batch update");
    }
  };

  // Enhanced data validation with improved duplicate detection (only one report per duplicate group)
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

    // Check for duplicates (excluding N/A values) - only report once per duplicate group
    const nameMap = new Map<string, YouthRecord[]>();
    const emailMap = new Map<string, YouthRecord[]>();
    const contactMap = new Map<string, YouthRecord[]>();

    data.forEach(record => {
      // Group by name (exclude N/A)
      if (record.name && normalizeValue(record.name) !== "N/A") {
        const key = record.name.toLowerCase().trim();
        if (!nameMap.has(key)) nameMap.set(key, []);
        nameMap.get(key)!.push(record);
      }

      // Group by email (exclude N/A)
      if (record.email_address && normalizeValue(record.email_address) !== "N/A") {
        const key = record.email_address.toLowerCase().trim();
        if (!emailMap.has(key)) emailMap.set(key, []);
        emailMap.get(key)!.push(record);
      }

      // Group by contact number (exclude N/A)
      if (record.contact_number && normalizeValue(record.contact_number) !== "N/A") {
        const key = record.contact_number.trim();
        if (!contactMap.has(key)) contactMap.set(key, []);
        contactMap.get(key)!.push(record);
      }
    });

    // Add duplicate issues - only one report per duplicate group
    nameMap.forEach((records, name) => {
      if (records.length > 1) {
        issues.push({
          recordId: records[0].id, // Use first record as representative
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
          field: 'age',
          issueType: 'age_mismatch'
        });
      }

      // Check for invalid dropdown values
      Object.entries(validOptions).forEach(([field, options]) => {
        const value = record[field as keyof YouthRecord];
        if (value && normalizeValue(value) !== "N/A" && !options.includes(value as any)) {
          issues.push({
            recordId: record.id,
            recordName: record.name,
            issue: `Invalid ${field.replace('_', ' ')}: "${value}" (not in allowed options)`,
            severity: 'error',
            field: field,
            issueType: 'invalid_dropdown'
          });
        }
      });
      
      // Check for missing required fields
      const requiredFields = [
        { field: 'name', label: 'name' },
        { field: 'age', label: 'age' },
        { field: 'birthday', label: 'birthday' },
        { field: 'sex', label: 'sex/gender' },
        { field: 'barangay', label: 'barangay' },
        { field: 'youth_classification', label: 'youth classification' },
        { field: 'youth_age_group', label: 'age group' }
      ];

      const optionalFields = [
        { field: 'highest_education', label: 'education level' },
        { field: 'work_status', label: 'work status' },
        { field: 'civil_status', label: 'civil status' },
        { field: 'registered_voter', label: 'voter registration status' },
        { field: 'voted_last_election', label: 'voting history' },
        { field: 'attended_kk_assembly', label: 'KK assembly attendance info' },
        { field: 'home_address', label: 'home address' },
        { field: 'email_address', label: 'email address' },
        { field: 'contact_number', label: 'contact number' }
      ];

      requiredFields.forEach(({ field, label }) => {
        const value = record[field as keyof YouthRecord];
        if (!value || normalizeValue(value) === "N/A") {
          issues.push({
            recordId: record.id,
            recordName: record.name,
            issue: `Missing ${label}`,
            severity: 'error',
            field: field,
            issueType: 'missing_required'
          });
        }
      });

      optionalFields.forEach(({ field, label }) => {
        const value = record[field as keyof YouthRecord];
        if (!value || normalizeValue(value) === "N/A") {
          issues.push({
            recordId: record.id,
            recordName: record.name,
            issue: `Missing ${label}`,
            severity: 'warning',
            field: field,
            issueType: 'missing_optional'
          });
        }
      });
      
      // Check for invalid email format
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
