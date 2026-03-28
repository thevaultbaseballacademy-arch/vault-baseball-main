import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type Category = "all" | "flagship" | "entry" | "featured" | "bundles" | "coaching";
export type PriceRange = "all" | "under100" | "100to300" | "300to500" | "over500";

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  category: Category;
  onCategoryChange: (category: Category) => void;
  priceRange: PriceRange;
  onPriceRangeChange: (range: PriceRange) => void;
  resultCount: number;
}

const categories: { value: Category; label: string }[] = [
  { value: "all", label: "All Products" },
  { value: "flagship", label: "Flagship Programs" },
  { value: "entry", label: "Entry Points" },
  { value: "featured", label: "Featured Products" },
  { value: "bundles", label: "Value Bundles" },
  { value: "coaching", label: "For Coaches" },
];

const priceRanges: { value: PriceRange; label: string }[] = [
  { value: "all", label: "Any Price" },
  { value: "under100", label: "Under $100" },
  { value: "100to300", label: "$100 - $300" },
  { value: "300to500", label: "$300 - $500" },
  { value: "over500", label: "$500+" },
];

const ProductFilters = ({
  searchQuery,
  onSearchChange,
  category,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  resultCount,
}: ProductFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const hasActiveFilters = category !== "all" || priceRange !== "all" || searchQuery.length > 0;

  const clearFilters = () => {
    onSearchChange("");
    onCategoryChange("all");
    onPriceRangeChange("all");
  };

  const FilterControls = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
        <Select value={category} onValueChange={(v) => onCategoryChange(v as Category)}>
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border">
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Price Range</label>
        <Select value={priceRange} onValueChange={(v) => onPriceRangeChange(v as PriceRange)}>
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Select price range" />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border">
            {priceRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="sticky top-20 z-40 bg-background/95 backdrop-blur-sm border-b border-border py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-muted/50 border-border"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex items-center gap-3">
            <Select value={category} onValueChange={(v) => onCategoryChange(v as Category)}>
              <SelectTrigger className="w-[180px] bg-muted/50 border-border">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border">
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={(v) => onPriceRangeChange(v as PriceRange)}>
              <SelectTrigger className="w-[150px] bg-muted/50 border-border">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border">
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Mobile Filter Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[50vh]">
              <SheetHeader>
                <SheetTitle>Filter Products</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterControls />
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="flex-1" onClick={clearFilters}>
                    Clear All
                  </Button>
                  <Button className="flex-1" onClick={() => setIsOpen(false)}>
                    Show Results
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters & Result Count */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 flex-wrap">
            {category !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {categories.find((c) => c.value === category)?.label}
                <button onClick={() => onCategoryChange("all")}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {priceRange !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {priceRanges.find((r) => r.value === priceRange)?.label}
                <button onClick={() => onPriceRangeChange("all")}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                "{searchQuery}"
                <button onClick={() => onSearchChange("")}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {resultCount} {resultCount === 1 ? "product" : "products"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
