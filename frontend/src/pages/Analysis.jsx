import React, { useState, useEffect, useMemo } from "react";
import  ConsultationComment  from "@/entities/ConsultationComment";
import { Button } from "@/components/ui/button";
import { 
  MessageSquareText, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Search
} from "lucide-react";

import CommentCard from "../components/analysis/CommentCard";
import FilterControls from "../components/analysis/FilterControls.jsx";
import { Skeleton } from "@/components/ui/skeleton";

const COMMENTS_PER_PAGE = 10;

export default function AnalysisPage() {
  const [allComments, setAllComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    sentiment: "all",
    stakeholder_type: "all"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setIsLoading(true);
    const data = await ConsultationComment.list("-submission_date");
    setAllComments(data);
    setIsLoading(false);
  };

  const filteredComments = useMemo(() => {
    return allComments.filter(comment => {
      const sentimentMatch = filters.sentiment === 'all' || comment.sentiment === filters.sentiment;
      const stakeholderMatch = filters.stakeholder_type === 'all' || comment.stakeholder_type === filters.stakeholder_type;
      const searchMatch = searchTerm === '' || 
        comment.comment_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comment.stakeholder_name && comment.stakeholder_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return sentimentMatch && stakeholderMatch && searchMatch;
    });
  }, [allComments, filters, searchTerm]);

  const totalPages = Math.ceil(filteredComments.length / COMMENTS_PER_PAGE);
  const paginatedComments = filteredComments.slice(
    (currentPage - 1) * COMMENTS_PER_PAGE,
    currentPage * COMMENTS_PER_PAGE
  );

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Comment Analysis
            </h1>
            <p className="text-lg text-gray-600">
              Detailed review of all stakeholder submissions
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <FilterControls 
          filters={filters} 
          searchTerm={searchTerm}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          commentCount={filteredComments.length}
        />

        {/* Comment List */}
        <div className="space-y-6">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <CommentCard.Skeleton key={i} />)
          ) : paginatedComments.length > 0 ? (
            paginatedComments.map(comment => (
              <CommentCard key={comment.id} comment={comment} />
            ))
          ) : (
            <div className="text-center py-24 bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Comments Found
              </h3>
              <p className="text-gray-600">
                No comments match your current search and filter criteria.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}