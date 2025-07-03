
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

interface TicketFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterCounts?: {
    unassigned: number;
    assigned: number;
    all: number;
    archive: number;
  };
}

export function TicketFilters({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  filterCounts = { unassigned: 0, assigned: 0, all: 0, archive: 0 }
}: TicketFiltersProps) {
  const filters = [
    { id: "unassigned", label: "Unassigned", count: filterCounts.unassigned },
    { id: "assigned", label: "Assigned to me", count: filterCounts.assigned },
    { id: "all", label: "All tickets", count: filterCounts.all },
    { id: "archive", label: "Archive", count: filterCounts.archive },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeFilter === filter.id
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {filter.label}
              {filter.id === "unassigned" && filter.count > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {filter.count}
                </span>
              )}
              {filter.id !== "unassigned" && (
                <span className="ml-2 text-xs text-gray-500">
                  ({filter.count})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search tickets"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>
    </div>
  );
}
