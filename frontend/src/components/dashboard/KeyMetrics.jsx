import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquareText, CheckCircle, Clock, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function KeyMetrics({ stats, isLoading }) {
  const metrics = [
    {
      title: "Total Comments",
      value: stats.total,
      icon: MessageSquareText,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      title: "Processed",
      value: stats.processed,
      icon: CheckCircle,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    },
    {
      title: "Pending Analysis",
      value: stats.total - stats.processed,
      icon: Clock,
      color: "bg-amber-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700"
    },
    {
      title: "Processing Rate",
      value: `${stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0}%`,
      icon: BarChart3,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {metric.title}
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                )}
              </div>
              <div className={`p-4 rounded-2xl ${metric.bgColor}`}>
                <metric.icon className={`w-6 h-6 ${metric.textColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}