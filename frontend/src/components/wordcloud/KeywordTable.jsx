import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";

export default function KeywordTable({ keywords, isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Keyword Frequency Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(10).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "positive": return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "negative": return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-amber-600" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive": return "bg-green-100 text-green-800 border-green-200";
      case "negative": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  const maxFrequency = Math.max(...keywords.map(k => k.value), 1);

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Keyword Frequency Analysis
        </CardTitle>
        <p className="text-gray-600">
          Detailed breakdown of keyword frequency and sentiment distribution
        </p>
      </CardHeader>
      <CardContent>
        {keywords.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Keywords Found</h3>
            <p className="text-gray-500">
              Try adjusting your filters to see keyword data.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Keyword</TableHead>
                  <TableHead className="font-semibold">Frequency</TableHead>
                  <TableHead className="font-semibold">Relative Size</TableHead>
                  <TableHead className="font-semibold">Positive</TableHead>
                  <TableHead className="font-semibold">Neutral</TableHead>
                  <TableHead className="font-semibold">Negative</TableHead>
                  <TableHead className="font-semibold">Dominant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywords.map((keyword, index) => (
                  <TableRow key={keyword.text} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">#{index + 1}</span>
                        <span className="font-medium capitalize">{keyword.text}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xl font-bold text-gray-900">{keyword.value}</span>
                    </TableCell>
                    <TableCell className="w-32">
                      <Progress 
                        value={(keyword.value / maxFrequency) * 100} 
                        className="h-2"
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-green-700 font-medium">
                        {keyword.sentiments.positive}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-amber-700 font-medium">
                        {keyword.sentiments.neutral}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-red-700 font-medium">
                        {keyword.sentiments.negative}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${getSentimentColor(keyword.dominantSentiment)} gap-1`}
                      >
                        {getSentimentIcon(keyword.dominantSentiment)}
                        {keyword.dominantSentiment}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}