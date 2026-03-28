import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AnalyticsFilters as FiltersType } from "@/hooks/useCertificationAnalytics";

interface AnalyticsFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
}

const certTypes = ["Foundations", "Performance", "Catcher", "Infield", "Outfield"];
const roles = ["Coach", "Director", "OrgAdmin", "VAULTHQ"];
const statuses = ["Active", "Expiring", "Expired", "Locked"];
const dateRanges = [
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
  { value: 365, label: "Last year" },
];

export const AnalyticsFilters = ({ filters, onFiltersChange }: AnalyticsFiltersProps) => {
  const handleReset = () => {
    onFiltersChange({
      dateRange: 90,
      teamId: undefined,
      role: undefined,
      certType: undefined,
      status: undefined,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-lg border border-border">
      <Select
        value={filters.role || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, role: value === "all" ? undefined : value })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          {roles.map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.certType || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, certType: value === "all" ? undefined : value })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Certification" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Certifications</SelectItem>
          {certTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, status: value === "all" ? undefined : value })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.dateRange.toString()}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, dateRange: parseInt(value) })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Date Range" />
        </SelectTrigger>
        <SelectContent>
          {dateRanges.map((range) => (
            <SelectItem key={range.value} value={range.value.toString()}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="ghost" size="sm" onClick={handleReset}>
        Reset
      </Button>
    </div>
  );
};
