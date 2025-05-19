import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Columns2 } from "lucide-react";

interface ColumnVisibilityToggleProps {
  columns: {
    key: string;
    title: string;
    visible: boolean;
  }[];
  onToggleColumn: (key: string) => void;
}

export function ColumnVisibilityToggle({ 
  columns, 
  onToggleColumn 
}: ColumnVisibilityToggleProps) {
  // Count visible columns
  const visibleCount = columns.filter(col => col.visible).length;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Columns2 size={16} />
          <span className="hidden md:inline">Columns</span> ({visibleCount})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.key}
            checked={column.visible}
            onCheckedChange={() => onToggleColumn(column.key)}
            disabled={visibleCount <= 1 && column.visible}
          >
            {column.title}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}