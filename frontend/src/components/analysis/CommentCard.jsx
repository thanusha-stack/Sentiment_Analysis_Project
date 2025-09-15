import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  User, 
  Building,
  HeartHandshake,
  Briefcase,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function CommentCard({ comment }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongComment = comment.comment_text.length > 400;

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "positive": return <TrendingUp className="w-4 h-4" />;
      case "negative": return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive": return "border-green-300 bg-green-50 text-green-800";
      case "negative": return "border-red-300 bg-red-50 text-red-800";
      default: return "border-amber-300 bg-amber-50 text-amber-800";
    }
  };

  const getStakeholderIcon = (type) => {
    switch (type) {
      case "individual": return <User className="w-4 h-4 text-blue-600"/>;
      case "organization": return <Building className="w-4 h-4 text-purple-600"/>;
      case "business": return <Briefcase className="w-4 h-4 text-green-600"/>;
      case "ngo": return <HeartHandshake className="w-4 h-4 text-pink-600"/>;
      default: return <User className="w-4 h-4 text-gray-600"/>;
    }
  };

  const displayedText = isLongComment && !isExpanded 
    ? `${comment.comment_text.substring(0, 400)}...`
    : comment.comment_text;

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 transition-all hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="pb-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
          <div className="flex items-center gap-3">
            {getStakeholderIcon(comment.stakeholder_type)}
            <div>
              <p className="font-semibold text-gray-900">
                {comment.stakeholder_name || "Anonymous"}
              </p>
              <p className="text-sm text-gray-600 capitalize">
                {comment.stakeholder_type}
                {comment.submission_date && ` • Submitted on ${format(new Date(comment.submission_date), "MMM d, yyyy")}`}
              </p>
            </div>
          </div>
          {comment.sentiment && (
            <Badge variant="outline" className={`${getSentimentColor(comment.sentiment)} gap-2 py-1 px-3 text-sm`}>
              {getSentimentIcon(comment.sentiment)}
              <span className="font-semibold capitalize">{comment.sentiment}</span>
              {comment.sentiment_confidence && (
                <span className="text-xs opacity-70">
                  ({Math.round(comment.sentiment_confidence * 100)}%)
                </span>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="py-6">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {displayedText}
        </p>
        {isLongComment && (
          <Button
            variant="link"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0 h-auto mt-2 text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? "Read Less" : "Read More"}
            {isExpanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </Button>
        )}
      </CardContent>
      {comment.keywords && comment.keywords.length > 0 && (
        <CardFooter className="pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-semibold text-gray-600 mr-2">Keywords:</span>
            {comment.keywords.map((keyword, i) => (
              <Badge key={i} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">
                {keyword}
              </Badge>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

CommentCard.Skeleton = function CommentCardSkeleton() {
  return (
    <Card className="bg-white/90">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="py-6 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter className="pt-4">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardFooter>
    </Card>
  );
};