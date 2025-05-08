
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink,
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  filteredRecords: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalRecords,
  filteredRecords,
  indexOfFirstItem,
  indexOfLastItem,
  onPageChange,
}: TablePaginationProps) {
  // Function to generate page numbers with ellipsis for better UX
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Current page neighborhood
    const beforeCurrent = Math.max(2, currentPage - 1);
    const afterCurrent = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis after first page if needed
    if (beforeCurrent > 2) {
      pageNumbers.push("ellipsis1");
    }
    
    // Add pages around current
    for (let i = beforeCurrent; i <= afterCurrent; i++) {
      if (i !== 1 && i !== totalPages) {
        pageNumbers.push(i);
      }
    }
    
    // Add ellipsis before last page if needed
    if (afterCurrent < totalPages - 1) {
      pageNumbers.push("ellipsis2");
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 mt-4">
      <div className="text-sm text-muted-foreground">
        Showing {filteredRecords > 0 ? indexOfFirstItem + 1 : 0}-
        {Math.min(indexOfLastItem, filteredRecords)} of {filteredRecords} records
        {totalRecords !== filteredRecords &&
          ` (filtered from ${totalRecords} total)`}
      </div>
      
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {getPageNumbers().map((page, index) => {
              if (page === "ellipsis1" || page === "ellipsis2") {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              
              return (
                <PaginationItem key={`page-${page}`}>
                  <PaginationLink 
                    isActive={currentPage === page}
                    onClick={() => onPageChange(page as number)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext 
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
