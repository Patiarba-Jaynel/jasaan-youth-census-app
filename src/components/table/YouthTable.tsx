
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YouthRecord } from "@/lib/pb-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBirthday } from "@/lib/standardize";

interface YouthTableProps {
  columns: {
    key: string;
    title: string;
    visible: boolean;
  }[];
  records: YouthRecord[];
  onEdit: (record: YouthRecord) => void;
  onDelete: (record: YouthRecord) => void;
}

// Normalize data to replace blank values with "N/A"
const normalizeValue = (value: any): string => {
  if (value === null || value === undefined || value === "" || (typeof value === 'string' && value.trim() === '')) {
    return "N/A";
  }
  return String(value);
};

export function YouthTable({ columns, records, onEdit, onDelete }: YouthTableProps) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.find(col => col.key === "name")?.visible && (
              <TableHead>Name</TableHead>
            )}
            {columns.find(col => col.key === "age")?.visible && (
              <TableHead>Age</TableHead>
            )}
            {columns.find(col => col.key === "sex")?.visible && (
              <TableHead>Sex</TableHead>
            )}
            {columns.find(col => col.key === "barangay")?.visible && (
              <TableHead>Barangay</TableHead>
            )}
            {columns.find(col => col.key === "homeAddress")?.visible && (
              <TableHead>Home Address</TableHead>
            )}
            {columns.find(col => col.key === "classification")?.visible && (
              <TableHead>Classification</TableHead>
            )}
            {columns.find(col => col.key === "ageGroup")?.visible && (
              <TableHead>Age Group</TableHead>
            )}
            {columns.find(col => col.key === "education")?.visible && (
              <TableHead>Education</TableHead>
            )}
            {columns.find(col => col.key === "work")?.visible && (
              <TableHead>Work Status</TableHead>
            )}
            {columns.find(col => col.key === "registeredVoter")?.visible && (
              <TableHead>Registered Voter</TableHead>
            )}
            {columns.find(col => col.key === "votedLastElection")?.visible && (
              <TableHead>Voted</TableHead>
            )}
            {columns.find(col => col.key === "attendedAssembly")?.visible && (
              <TableHead>Assembly</TableHead>
            )}
            {columns.find(col => col.key === "assembliesAttended")?.visible && (
              <TableHead>KK Assemblies Attended</TableHead>
            )}
            {columns.find(col => col.key === "civilStatus")?.visible && (
              <TableHead>Civil Status</TableHead>
            )}
            {columns.find(col => col.key === "birthday")?.visible && (
              <TableHead>Birthday</TableHead>
            )}
            {columns.find(col => col.key === "email")?.visible && (
              <TableHead>Email</TableHead>
            )}
            {columns.find(col => col.key === "contactNumber")?.visible && (
              <TableHead>Contact Number</TableHead>
            )}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length > 0 ? (
            records.map((record) => (
              <TableRow key={record.id}>
                {columns.find(col => col.key === "name")?.visible && (
                  <TableCell className="font-medium">{normalizeValue(record.name)}</TableCell>
                )}
                {columns.find(col => col.key === "age")?.visible && (
                  <TableCell>{normalizeValue(record.age)}</TableCell>
                )}
                {columns.find(col => col.key === "sex")?.visible && (
                  <TableCell>{normalizeValue(record.sex)}</TableCell>
                )}
                {columns.find(col => col.key === "barangay")?.visible && (
                  <TableCell>{normalizeValue(record.barangay)}</TableCell>
                )}
                {columns.find(col => col.key === "homeAddress")?.visible && (
                  <TableCell>{normalizeValue(record.home_address)}</TableCell>
                )}
                {columns.find(col => col.key === "classification")?.visible && (
                  <TableCell>{normalizeValue(record.youth_classification)}</TableCell>
                )}
                {columns.find(col => col.key === "ageGroup")?.visible && (
                  <TableCell>{normalizeValue(record.youth_age_group)}</TableCell>
                )}
                {columns.find(col => col.key === "education")?.visible && (
                  <TableCell>{normalizeValue(record.highest_education)}</TableCell>
                )}
                {columns.find(col => col.key === "work")?.visible && (
                  <TableCell>{normalizeValue(record.work_status)}</TableCell>
                )}
                {columns.find(col => col.key === "registeredVoter")?.visible && (
                  <TableCell>{normalizeValue(record.registered_voter)}</TableCell>
                )}
                {columns.find(col => col.key === "votedLastElection")?.visible && (
                  <TableCell>{normalizeValue(record.voted_last_election)}</TableCell>
                )}
                {columns.find(col => col.key === "attendedAssembly")?.visible && (
                  <TableCell>{normalizeValue(record.attended_kk_assembly)}</TableCell>
                )}
                {columns.find(col => col.key === "assembliesAttended")?.visible && (
                  <TableCell>
                    {record.attended_kk_assembly === "Yes" 
                      ? normalizeValue(record.kk_assemblies_attended) || "0"
                      : "0"}
                  </TableCell>
                )}
                {columns.find(col => col.key === "civilStatus")?.visible && (
                  <TableCell>{normalizeValue(record.civil_status)}</TableCell>
                )}
                {columns.find(col => col.key === "birthday")?.visible && (
                  <TableCell>{formatBirthday(record.birthday?.toISOString?.() ?? String(record.birthday))}</TableCell>
                )}
                {columns.find(col => col.key === "email")?.visible && (
                  <TableCell>{normalizeValue(record.email_address)}</TableCell>
                )}
                {columns.find(col => col.key === "contactNumber")?.visible && (
                  <TableCell>{normalizeValue(record.contact_number)}</TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(record)}
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                    >
                      <Edit size={16} />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(record)}
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
              <TableCell colSpan={17} className="text-center py-4">
                No records found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
