"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Map, List, Filter, X } from "lucide-react";

interface FilterBarProps {
  typeFilter: string;
  statusFilter: string;
  viewMode: "map" | "list";
  onTypeChange: (type: string) => void;
  onStatusChange: (status: string) => void;
  onViewModeChange: (mode: "map" | "list") => void;
  onClearFilters: () => void;
}

const issueTypes = [
  { value: "all", label: "All Types" },
  { value: "pothole", label: "Pothole" },
  { value: "noise", label: "Noise" },
  { value: "parking", label: "Parking" },
  { value: "graffiti", label: "Graffiti" },
  { value: "streetlight", label: "Streetlight" },
  { value: "sidewalk", label: "Sidewalk" },
  { value: "other", label: "Other" },
];

const statuses = [
  { value: "all", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

export function FilterBar({
  typeFilter,
  statusFilter,
  viewMode,
  onTypeChange,
  onStatusChange,
  onViewModeChange,
  onClearFilters,
}: FilterBarProps) {
  const hasFilters = typeFilter !== "all" || statusFilter !== "all";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* View Mode Toggle */}
      <div className="flex rounded-xl border border-slate-700 overflow-hidden bg-slate-800/50">
        <Button
          variant={viewMode === "map" ? "default" : "ghost"}
          size="sm"
          className={`rounded-none ${viewMode !== "map" ? "text-slate-300 hover:text-white hover:bg-slate-700" : ""}`}
          onClick={() => onViewModeChange("map")}
        >
          <Map className="w-4 h-4 mr-2" />
          Map
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "ghost"}
          size="sm"
          className={`rounded-none ${viewMode !== "list" ? "text-slate-300 hover:text-white hover:bg-slate-700" : ""}`}
          onClick={() => onViewModeChange("list")}
        >
          <List className="w-4 h-4 mr-2" />
          List
        </Button>
      </div>

      <div className="h-6 w-px bg-slate-700 hidden sm:block" />

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <Select value={typeFilter} onValueChange={onTypeChange}>
          <SelectTrigger className="w-[140px] bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="Issue Type" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {issueTypes.map((type) => (
              <SelectItem key={type.value} value={type.value} className="text-white hover:bg-slate-700">
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[140px] bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value} className="text-white hover:bg-slate-700">
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-slate-300 hover:text-white hover:bg-slate-700">
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
