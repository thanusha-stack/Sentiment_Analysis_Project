import React, { useState, useEffect, useMemo } from "react";
import  ConsultationComment  from "@/entities/ConsultationComment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Cloud, 
  Download, 
  Filter,
  BarChart3,
  RefreshCw
} from "lucide-react";

import WordCloudViz from "../components/wordcloud/WordCloudViz";
import KeywordTable from "../components/wordcloud/KeywordTable";
import CloudFilters from "../components/wordcloud/CloudFilters";
import { Skeleton } from "@/components/ui/skeleton";

export default function WordCloudPage() {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    sentiment: "all",
    stakeholder_type: "all",
    consultation: "all"
  });
  const [minFrequency, setMinFrequency] = useState(2);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setIsLoading(true);
    const data = await ConsultationComment.list("-created_date");
    setComments(data);
    setIsLoading(false);
  };

  const filteredComments = useMemo(() => {
    return comments.filter(comment => {
      const sentimentMatch = filters.sentiment === 'all' || comment.sentiment === filters.sentiment;
      const stakeholderMatch = filters.stakeholder_type === 'all' || comment.stakeholder_type === filters.stakeholder_type;
      const consultationMatch = filters.consultation === 'all' || comment.consultation_title === filters.consultation;
      
      return sentimentMatch && stakeholderMatch && consultationMatch && comment.keywords;
    });
  }, [comments, filters]);

  const keywordData = useMemo(() => {
    const keywordCount = {};
    const keywordSentiments = {};
    
    filteredComments.forEach(comment => {
      if (comment.keywords && Array.isArray(comment.keywords)) {
        comment.keywords.forEach(keyword => {
          const normalizedKeyword = keyword.toLowerCase().trim();
          if (normalizedKeyword.length > 2) { 
            keywordCount[normalizedKeyword] = (keywordCount[normalizedKeyword] || 0) + 1;
            
            if (!keywordSentiments[normalizedKeyword]) {
              keywordSentiments[normalizedKeyword] = { positive: 0, negative: 0, neutral: 0 };
            }
            if (comment.sentiment) {
              keywordSentiments[normalizedKeyword][comment.sentiment]++;
            }
          }
        });
      }
    });

    return Object.entries(keywordCount)
      .filter(([_, count]) => count >= minFrequency)
      .map(([keyword, count]) => ({
        text: keyword,
        value: count,
        sentiments: keywordSentiments[keyword],
        dominantSentiment: getDominantSentiment(keywordSentiments[keyword])
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredComments, minFrequency]);

  const getDominantSentiment = (sentiments) => {
    if (!sentiments) return 'neutral';
    const max = Math.max(sentiments.positive, sentiments.negative, sentiments.neutral);
    if (sentiments.positive === max) return 'positive';
    if (sentiments.negative === max) return 'negative';
    return 'neutral';
  };

  const consultationOptions = useMemo(() => {
    const consultations = [...new Set(comments.map(c => c.consultation_title).filter(Boolean))];
    return consultations;
  }, [comments]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const exportData = () => {
    const csvContent = [
      ['Keyword', 'Frequency', 'Positive', 'Neutral', 'Negative', 'Dominant Sentiment'],
      ...keywordData.map(item => [
        item.text,
        item.value,
        item.sentiments.positive,
        item.sentiments.neutral,
        item.sentiments.negative,
        item.dominantSentiment
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'keyword-analysis.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Keyword Analysis
            </h1>
            <p className="text-lg text-gray-600">
              Visual representation of key themes and topics from consultation feedback
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={loadComments}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              onClick={exportData}
              disabled={keywordData.length === 0}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Filters */}
        <CloudFilters 
          filters={filters}
          consultationOptions={consultationOptions}
          minFrequency={minFrequency}
          onFilterChange={handleFilterChange}
          onMinFrequencyChange={setMinFrequency}
          keywordCount={keywordData.length}
        />

        {/* Main Content */}
        <Tabs defaultValue="cloud" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <TabsTrigger value="cloud" className="gap-2">
              <Cloud className="w-4 h-4" />
              Word Cloud
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Data Table
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cloud">
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Cloud className="w-6 h-6 text-blue-600" />
                  Interactive Word Cloud
                </CardTitle>
                <p className="text-gray-600">
                  Larger words indicate higher frequency. Colors represent dominant sentiment.
                </p>
              </CardHeader>
              <CardContent className="p-8">
                {isLoading ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="space-y-4 text-center">
                      <Cloud className="w-16 h-16 text-gray-400 mx-auto animate-pulse" />
                      <Skeleton className="h-4 w-48 mx-auto" />
                      <Skeleton className="h-4 w-32 mx-auto" />
                    </div>
                  </div>
                ) : keywordData.length === 0 ? (
                  <div className="h-96 flex items-center justify-center text-center">
                    <div>
                      <Cloud className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No Keywords Found
                      </h3>
                      <p className="text-gray-600">
                        Try adjusting your filters or lowering the minimum frequency threshold.
                      </p>
                    </div>
                  </div>
                ) : (
                  <WordCloudViz keywords={keywordData} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="table">
            <KeywordTable keywords={keywordData} isLoading={isLoading} />
          </TabsContent>
        </Tabs>

        {/* Legend */}
        {!isLoading && keywordData.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-700">Predominantly Positive Sentiment</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-amber-500 rounded"></div>
                  <span className="text-sm text-gray-700">Predominantly Neutral Sentiment</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-700">Predominantly Negative Sentiment</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}