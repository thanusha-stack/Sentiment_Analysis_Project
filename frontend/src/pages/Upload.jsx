import React, { useState, useRef } from "react";
import  ConsultationComment  from "@/entities/ConsultationComment";
import { UploadFile, ExtractDataFromUploadedFile, InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Upload as UploadIcon, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Brain,
  ArrowRight,
  Loader2,
  File,
  FileSpreadsheet
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [consultationTitle, setConsultationTitle] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentFile, setCurrentFile] = useState("");

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === "application/pdf" || 
              file.type === "text/plain" || 
              file.type === "text/csv" ||
              file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
              file.name.toLowerCase().endsWith('.pdf') ||
              file.name.toLowerCase().endsWith('.txt') ||
              file.name.toLowerCase().endsWith('.csv') ||
              file.name.toLowerCase().endsWith('.docx')
    );
    
    if (droppedFiles.length === 0) {
      setError("Please upload PDF, DOCX, TXT, or CSV files only");
      return;
    }
    
    setFiles(droppedFiles);
    setError(null);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setError(null);
  };

  const getFileType = (file) => {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.csv')) return 'csv';
    if (fileName.endsWith('.pdf')) return 'pdf';
    if (fileName.endsWith('.docx')) return 'docx';
    if (fileName.endsWith('.txt')) return 'txt';
    return 'unknown';
  };

  const getFileIcon = (file) => {
    const type = getFileType(file);
    switch (type) {
      case 'csv': return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      case 'pdf': return <FileText className="w-5 h-5 text-red-600" />;
      case 'docx': return <File className="w-5 h-5 text-blue-600" />;
      case 'txt': return <FileText className="w-5 h-5 text-gray-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const processStructuredFile = async (file_url) => {
    // For CSV files - use the original structured approach
    const extractResult = await ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          comments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                comment_text: { type: "string" },
                stakeholder_name: { type: "string" },
                stakeholder_type: { type: "string" },
                submission_date: { type: "string" }
              }
            }
          }
        }
      }
    });

    if (extractResult.status === "success" && extractResult.output.comments) {
      return extractResult.output.comments;
    }
    return [];
  };

  const processUnstructuredFile = async (file_url) => {
    // For PDF, DOCX, TXT files - extract text and parse with AI
    const extractResult = await ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          full_text: {
            type: "string",
            description: "The complete text content of the document"
          }
        }
      }
    });

    if (extractResult.status === "success" && extractResult.output.full_text) {
      // Use AI to parse the text into individual comments
      const parseResult = await InvokeLLM({
        prompt: `Parse this consultation document text and extract individual comments/feedback. Each comment should include the comment text and try to identify stakeholder information if available:

Text: "${extractResult.output.full_text}"

Please extract individual comments, feedback, or submissions. For each comment, try to identify:
1. The actual comment/feedback text
2. Stakeholder name (if mentioned)
3. Stakeholder type (individual, organization, business, ngo, other - best guess if not explicit)

If no specific stakeholder information is available, use "Anonymous" and "individual" as defaults.`,
        response_json_schema: {
          type: "object",
          properties: {
            comments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  comment_text: { type: "string" },
                  stakeholder_name: { type: "string" },
                  stakeholder_type: { 
                    type: "string",
                    enum: ["individual", "organization", "business", "ngo", "other"]
                  }
                }
              }
            }
          }
        }
      });

      if (parseResult.comments) {
        return parseResult.comments.map(comment => ({
          ...comment,
          submission_date: new Date().toISOString().split('T')[0] // Use today's date as default
        }));
      }
    }
    return [];
  };

  const processCommentsWithAI = async (comments) => {
    const processedComments = [];
    
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      setProgress(((i + 1) / comments.length) * 90); // Reserve 10% for final steps
      
      try {
        // Analyze sentiment and extract keywords
        const analysisResult = await InvokeLLM({
          prompt: `Analyze this consultation comment for sentiment and extract key topics/keywords:
          
          Comment: "${comment.comment_text}"
          
          Please provide:
          1. Sentiment classification (positive, negative, or neutral)
          2. Confidence score (0-1)
          3. Key topics/keywords (5-10 most important terms)`,
          response_json_schema: {
            type: "object",
            properties: {
              sentiment: {
                type: "string",
                enum: ["positive", "negative", "neutral"]
              },
              confidence: {
                type: "number",
                minimum: 0,
                maximum: 1
              },
              keywords: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        });
        
        processedComments.push({
          ...comment,
          sentiment: analysisResult.sentiment,
          sentiment_confidence: analysisResult.confidence,
          keywords: analysisResult.keywords,
          processed: true
        });
        
      } catch (err) {
        console.error("Error processing comment:", err);
        processedComments.push({
          ...comment,
          processed: false
        });
      }
    }
    
    return processedComments;
  };

  const handleUpload = async () => {
    if (files.length === 0 || !consultationTitle.trim()) {
      setError("Please provide a consultation title and select files to upload.");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setError(null);
    setSuccess(null);

    try {
      let allComments = [];

      // Process each file
      for (const file of files) {
        setCurrentFile(file.name);
        const { file_url } = await UploadFile({ file });
        
        const fileType = getFileType(file);
        let extractedComments = [];
        
        if (fileType === 'csv') {
          extractedComments = await processStructuredFile(file_url);
        } else {
          extractedComments = await processUnstructuredFile(file_url);
        }

        if (extractedComments.length > 0) {
          allComments.push(...extractedComments.map(comment => ({
            ...comment,
            consultation_title: consultationTitle
          })));
        }
      }

      if (allComments.length === 0) {
        setError("No comments could be extracted from the uploaded files.");
        return;
      }

      setCurrentFile("Processing with AI...");
      // Process comments with AI
      const processedComments = await processCommentsWithAI(allComments);
      
      setProgress(95);
      setCurrentFile("Saving to database...");
      
      // Save to database
      await ConsultationComment.bulkCreate(processedComments);
      
      setProgress(100);
      setSuccess(`Successfully processed ${processedComments.length} comments with AI analysis!`);
      setTimeout(() => navigate(createPageUrl("Dashboard")), 2000);
      
    } catch (err) {
      setError("Error processing files. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setProcessing(false);
      setProgress(0);
      setCurrentFile("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upload Consultation Comments
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload files containing public consultation feedback for AI-powered sentiment analysis and keyword extraction.
          </p>
        </div>

        {/* Upload Form */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UploadIcon className="w-6 h-6 text-blue-600" />
              Document Upload & Processing
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <FileSpreadsheet className="w-3 h-3 mr-1" />
                CSV
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <FileText className="w-3 h-3 mr-1" />
                PDF
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <File className="w-3 h-3 mr-1" />
                DOCX
              </Badge>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                <FileText className="w-3 h-3 mr-1" />
                TXT
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Consultation Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                Consultation Title
              </Label>
              <Input
                id="title"
                value={consultationTitle}
                onChange={(e) => setConsultationTitle(e.target.value)}
                placeholder="e.g., Proposed Public Transport Bill"
                className="text-lg"
              />
            </div>

            {/* File Upload Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive 
                  ? "border-blue-400 bg-blue-50" 
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".csv,.txt,.pdf,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload Comment Files
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your files here, or click to browse
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="gap-2"
                  >
                    <UploadIcon className="w-4 h-4" />
                    Choose Files
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500">
                  Supported formats: CSV (structured), PDF, DOCX, TXT (AI-parsed)
                </p>
              </div>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Selected Files:</h4>
                <div className="space-y-2">
                  {Array.from(files).map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file)}
                        <span className="font-medium">{file.name}</span>
                        <span className="text-sm text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getFileType(file).toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Processing Progress */}
            {processing && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-blue-600">
                  <Brain className="w-5 h-5 animate-pulse" />
                  <span className="font-medium">AI Processing Comments...</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-gray-600">
                  {currentFile && `Processing: ${currentFile}`}
                </p>
              </div>
            )}

            {/* Alerts */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={processing || files.length === 0 || !consultationTitle.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 gap-3"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing with AI...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Process with AI Analysis
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>

            {/* File Format Guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">File Format Guide:</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <FileSpreadsheet className="w-4 h-4 mt-0.5 text-green-600" />
                  <span><strong>CSV:</strong> Structured data with columns: comment_text, stakeholder_name, stakeholder_type, submission_date</span>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 mt-0.5 text-red-600" />
                  <span><strong>PDF/DOCX/TXT:</strong> Unstructured text that AI will parse to extract individual comments and stakeholder information</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}