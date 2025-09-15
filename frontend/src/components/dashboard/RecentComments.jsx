import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquareText, TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function RecentComments({ comments, isLoading }) {
  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "positive": return <TrendingUp className="w-3 h-3 text-green-600" />;
      case "negative": return <TrendingDown className="w-3 h-3 text-red-600" />;
      default: return <Minus className="w-3 h-3 text-amber-600" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive": return "bg-green-100 text-green-800 border-green-200";
      case "negative": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <MessageSquareText className="w-6 h-6 text-blue-600" />
            Recent Comments
          </CardTitle>
          <Link to={createPageUrl("Analysis")}>
            <Button variant="outline" size="sm" className="gap-2">
              View All
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <p className="text-gray-600">
          Latest consultation feedback with AI sentiment analysis
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquareText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
            <p className="text-gray-500 mb-6">Start by uploading consultation comments for analysis</p>
            <Link to={createPageUrl("Upload")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Upload Comments
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div key={comment.id} className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-500">
                      #{comments.length - index}
                    </span>
                    <span className="text-sm text-gray-600">
                      {comment.stakeholder_name || "Anonymous"}
                    </span>
                    {comment.submission_date && (
                      <span className="text-xs text-gray-500">
                        {format(new Date(comment.submission_date), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                  {comment.sentiment && (
                    <Badge className={`${getSentimentColor(comment.sentiment)} border gap-1`}>
                      {getSentimentIcon(comment.sentiment)}
                      {comment.sentiment}
                    </Badge>
                  )}
                </div>
                
                <p className="text-gray-700 text-sm leading-relaxed">
                  {comment.comment_text.length > 200 
                    ? `${comment.comment_text.substring(0, 200)}...`
                    : comment.comment_text
                  }
                </p>
                
                {comment.keywords && comment.keywords.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {comment.keywords.slice(0, 5).map((keyword, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}