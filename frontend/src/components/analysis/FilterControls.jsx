import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, Search } from "lucide-react";

export default function FilterControls({
  filters,
  searchTerm,
  onFilterChange,
  onSearchChange,
  commentCount
}) {
  const sentimentOptions = ["all", "positive", "neutral", "negative"];
  const stakeholderOptions = ["all", "individual", "organization", "business", "ngo", "other"];

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search comments or stakeholders..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 text-base"
              />
            </div>
          </div>
          
          {/* Sentiment Filter */}
          <div>
            <Select 
              value={filters.sentiment} 
              onValueChange={(value) => onFilterChange('sentiment', value)}
            >
              <SelectTrigger className="text-base">
                <SelectValue placeholder="Filter by sentiment..." />
              </SelectTrigger>
              <SelectContent>
                {sentimentOptions.map(option => (
                  <SelectItem key={option} value={option} className="capitalize">
                    {option === 'all' ? 'All Sentiments' : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stakeholder Filter */}
          <div>
            <Select 
              value={filters.stakeholder_type} 
              onValueChange={(value) => onFilterChange('stakeholder_type', value)}
            >
              <SelectTrigger className="text-base">
                <SelectValue placeholder="Filter by stakeholder type..." />
              </SelectTrigger>
              <SelectContent>
                {stakeholderOptions.map(option => (
                  <SelectItem key={option} value={option} className="capitalize">
                    {option === 'all' ? 'All Stakeholders' : option.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600 font-medium">
          Showing {commentCount} matching comments
        </div>
      </CardContent>
    </Card>
  );
}