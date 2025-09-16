import React, { useState, useEffect } from "react";
import  ConsultationComment  from "@/entities/ConsultationComment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  MessageSquareText, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Upload,
  BarChart3,
  PieChart,
  Download
} from "lucide-react";

import SentimentChart from "../components/dashboard/SentimentChart";
import RecentComments from "../components/dashboard/RecentComments";
import KeyMetrics from "../components/dashboard/KeyMetrics";

export default function Dashboard() {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    positive: 0,
    negative: 0,
    neutral: 0
  });

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setIsLoading(true);
    const data = await ConsultationComment.list("-created_date");
    setComments(data);
    
    const stats = {
      total: data.length,
      processed: data.filter(c => c.processed).length,
      positive: data.filter(c => c.sentiment === "positive").length,
      negative: data.filter(c => c.sentiment === "negative").length,
      neutral: data.filter(c => c.sentiment === "neutral").length
    };
    setStats(stats);
    setIsLoading(false);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              e-Consultation Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              AI-powered analysis of public consultation feedback
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
            <Link to={createPageUrl("Upload")}>
              <Button className="text-white bg-blue-600 hover:bg-blue-700 gap-2">
                <Upload className="w-4 h-4" />
                Upload Comments
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <KeyMetrics stats={stats} isLoading={isLoading} />

        {/* Charts and Analysis */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SentimentChart stats={stats} isLoading={isLoading} />
          </div>
          
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  Sentiment Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Positive", count: stats.positive, sentiment: "positive" },
                  { label: "Neutral", count: stats.neutral, sentiment: "neutral" },
                  { label: "Negative", count: stats.negative, sentiment: "negative" }
                ].map(({ label, count, sentiment }) => (
                  <div key={sentiment} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getSentimentIcon(sentiment)}
                      <span className="font-medium text-gray-700">{label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-900">{count}</span>
                      <Badge className={`${getSentimentColor(sentiment)} border`}>
                        {stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to={createPageUrl("Summary")} className="block">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <MessageSquareText className="w-4 h-4" />
                    Summary
                  </Button>
                </Link>
                <Link to={createPageUrl("WordCloud")} className="block">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <PieChart className="w-4 h-4" />
                    Generate Word Cloud
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Comments */}
        <RecentComments comments={comments.slice(0, 5)} isLoading={isLoading} />
      </div>
    </div>
  );
}