import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function WordCloudViz({ keywords }) {
  const [hoveredKeyword, setHoveredKeyword] = useState(null);
  
  if (!keywords || keywords.length === 0) return null;

  const maxCount = Math.max(...keywords.map(k => k.value));
  const minCount = Math.min(...keywords.map(k => k.value));

  const getFontSize = (count) => {
    const ratio = (count - minCount) / (maxCount - minCount);
    return Math.max(14, Math.min(48, 14 + ratio * 34));
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive": return "text-green-600 hover:text-green-800";
      case "negative": return "text-red-600 hover:text-red-800";
      default: return "text-amber-600 hover:text-amber-800";
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "positive": return <TrendingUp className="w-3 h-3" />;
      case "negative": return <TrendingDown className="w-3 h-3" />;
      default: return <Minus className="w-3 h-3" />;
    }
  };

  return (
    <div className="relative min-h-96">
      {/* Word Cloud Display */}
      <div 
        className="flex flex-wrap items-center justify-center gap-4 p-8 min-h-96"
        style={{ 
          background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.05) 0%, transparent 70%)'
        }}
      >
        {keywords.map((keyword, index) => (
          <span
            key={keyword.text}
            className={`font-bold cursor-pointer transition-all duration-200 hover:scale-110 select-none ${getSentimentColor(keyword.dominantSentiment)}`}
            style={{ 
              fontSize: `${getFontSize(keyword.value)}px`,
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              transform: `rotate(${(index % 4 - 1) * 5}deg)`,
              margin: '8px'
            }}
            onMouseEnter={() => setHoveredKeyword(keyword)}
            onMouseLeave={() => setHoveredKeyword(null)}
          >
            {keyword.text}
          </span>
        ))}
      </div>

      {/* Hover Details */}
      {hoveredKeyword && (
        <Card className="absolute top-4 right-4 z-10 shadow-xl border-2 border-blue-200 bg-white/95 backdrop-blur-sm max-w-sm">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 capitalize">
                  {hoveredKeyword.text}
                </h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {hoveredKeyword.value} mentions
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Sentiment Breakdown:</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-green-700">
                    <TrendingUp className="w-3 h-3" />
                    <span>{hoveredKeyword.sentiments.positive}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-700">
                    <Minus className="w-3 h-3" />
                    <span>{hoveredKeyword.sentiments.neutral}</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-700">
                    <TrendingDown className="w-3 h-3" />
                    <span>{hoveredKeyword.sentiments.negative}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                <span className="text-xs font-medium text-gray-600">Dominant:</span>
                <Badge 
                  variant="outline" 
                  className={`gap-1 ${
                    hoveredKeyword.dominantSentiment === 'positive' ? 'bg-green-50 text-green-700 border-green-200' :
                    hoveredKeyword.dominantSentiment === 'negative' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {getSentimentIcon(hoveredKeyword.dominantSentiment)}
                  {hoveredKeyword.dominantSentiment}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Size Guide */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
        <div className="text-xs font-semibold text-gray-600 mb-2">Size = Frequency</div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Less</span>
          <div className="flex items-center gap-1">
            <span style={{ fontSize: '12px' }}>word</span>
            <span style={{ fontSize: '16px' }}>word</span>
            <span style={{ fontSize: '24px' }}>word</span>
            <span style={{ fontSize: '32px' }}>word</span>
          </div>
          <span className="text-sm text-gray-500">More</span>
        </div>
      </div>
    </div>
  );
}