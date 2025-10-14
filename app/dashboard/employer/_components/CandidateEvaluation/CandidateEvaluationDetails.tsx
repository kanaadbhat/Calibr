"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ClipboardCheck, 
  Code, 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  Star,
  XCircle,
  ArrowLeft,
  Download,
  CheckCircle2,
  Clock,
  Terminal,
  FileCode,
  PlayCircle
} from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  position: string;
  applicationStatus: 'applied' | 'under-review' | 'shortlisted' | 'interviewed' | 'rejected' | 'accepted' | 'withdrawn';
  rounds: {
    aptitude: 'pending' | 'shortlisted' | 'rejected' | 'completed';
    coding: 'pending' | 'shortlisted' | 'rejected' | 'completed';
    technicalInterview: 'pending' | 'shortlisted' | 'rejected' | 'completed';
    hrInterview: 'pending' | 'shortlisted' | 'rejected' | 'completed';
  };
  overallScore?: number;
  aptitudeScore?: number;
  codingScore?: number;
  technicalScore?: number;
  hrScore?: number;
  appliedDate: string;
  codingEvaluation?: {
    questionId: number;
    language: string;
    code: string;
    results?: any;
    passed?: boolean;
    codeRuns: Array<{
      problemId: number;
      code: string;
      language: string;
      timestamp: Date;
      results?: any;
      passed?: boolean;
    }>;
    codeSubmissions: Array<{
      problemId: number;
      code: string;
      language: string;
      timestamp: Date;
      results?: any;
      passed?: boolean;
    }>;
    problemStatus: { [problemId: number]: 'solved' | 'attempted' | 'not-attempted' };
    timeLeft: number;
    isSubmitted: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface CandidateEvaluationDetailsProps {
  candidate: Candidate;
  onBack: () => void;
}

export function CandidateEvaluationDetails({ candidate, onBack }: CandidateEvaluationDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'interviewed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'shortlisted': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'under-review': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'applied': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'accepted': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'withdrawn': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-white/10 text-white/60';
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-white/40';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProblemStatusColor = (status: string) => {
    switch (status) {
      case 'solved': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'attempted': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'not-attempted': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-white/10 text-white/60';
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 mt-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="text-white/80 bg-transparent border-white/20 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">{candidate.name}</h2>
            <p className="text-white/60 text-sm">{candidate.position}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Candidate Details Card */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Candidate Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-sm">Email</p>
              <p className="text-white">{candidate.email}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Applied Date</p>
              <p className="text-white">{new Date(candidate.appliedDate).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Overall Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(candidate.overallScore)}`}>
                  {candidate.overallScore || 'N/A'}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Aptitude</p>
                <p className={`text-2xl font-bold ${getScoreColor(candidate.aptitudeScore)}`}>
                  {candidate.aptitudeScore || 'N/A'}%
                </p>
              </div>
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Coding</p>
                <p className={`text-2xl font-bold ${getScoreColor(candidate.codingScore)}`}>
                  {candidate.codingScore || 'N/A'}%
                </p>
              </div>
              <Code className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Technical</p>
                <p className={`text-2xl font-bold ${getScoreColor(candidate.technicalScore)}`}>
                  {candidate.technicalScore || 'N/A'}%
                </p>
              </div>
              <ClipboardCheck className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">HR Round</p>
                <p className={`text-2xl font-bold ${getScoreColor(candidate.hrScore)}`}>
                  {candidate.hrScore || 'N/A'}%
                </p>
              </div>
              <MessageSquare className="w-6 h-6 text-rose-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Evaluation Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">Overview</TabsTrigger>
          <TabsTrigger value="aptitude" className="data-[state=active]:bg-white/10">Aptitude</TabsTrigger>
          <TabsTrigger value="coding" className="data-[state=active]:bg-white/10">Coding</TabsTrigger>
          <TabsTrigger value="technical" className="data-[state=active]:bg-white/10">Technical</TabsTrigger>
          <TabsTrigger value="hr" className="data-[state=active]:bg-white/10">HR Round</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Assessment Summary</CardTitle>
              <CardDescription className="text-white/60">
                Complete overview of candidate&apos;s performance across all rounds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span className="text-white">Aptitude Round</span>
                  </div>
                  <Badge className={getStatusColor(candidate.rounds.aptitude)}>
                    {candidate.rounds.aptitude}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Code className="w-5 h-5 text-blue-400" />
                    <span className="text-white">Coding Round</span>
                  </div>
                  <Badge className={getStatusColor(candidate.rounds.coding)}>
                    {candidate.rounds.coding}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="w-5 h-5 text-green-400" />
                    <span className="text-white">Technical Interview</span>
                  </div>
                  <Badge className={getStatusColor(candidate.rounds.technicalInterview)}>
                    {candidate.rounds.technicalInterview}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-rose-400" />
                    <span className="text-white">HR Round</span>
                  </div>
                  <Badge className={getStatusColor(candidate.rounds.hrInterview)}>
                    {candidate.rounds.hrInterview}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aptitude" className="mt-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Aptitude Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60">Detailed aptitude test results will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coding" className="mt-6">
          <div className="space-y-6">
            {candidate.codingEvaluation ? (
              <>
                {/* Overview Card */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Coding Assessment Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white/5 rounded-lg">
                        <p className="text-white/60 text-sm flex items-center gap-2">
                          <Terminal className="w-4 h-4" />
                          Language
                        </p>
                        <p className="text-white font-semibold">{candidate.codingEvaluation.language}</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg">
                        <p className="text-white/60 text-sm flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Time Left
                        </p>
                        <p className="text-white font-semibold">{formatTime(candidate.codingEvaluation.timeLeft)}</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg">
                        <p className="text-white/60 text-sm flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Submission Status
                        </p>
                        <Badge className={candidate.codingEvaluation.isSubmitted ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}>
                          {candidate.codingEvaluation.isSubmitted ? 'Submitted' : 'In Progress'}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-white/5 rounded-lg">
                      <p className="text-white/60 text-sm">Overall Result</p>
                      <div className="flex items-center gap-2 mt-1">
                        {candidate.codingEvaluation.passed !== undefined ? (
                          <>
                            {candidate.codingEvaluation.passed ? (
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Passed
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                                <XCircle className="w-4 h-4 mr-1" />
                                Failed
                              </Badge>
                            )}
                          </>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">
                            Not Evaluated
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-white/60 text-sm">Timestamps</p>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <p className="text-white/80 text-sm">Created: {formatDate(candidate.codingEvaluation.createdAt)}</p>
                        <p className="text-white/80 text-sm">Updated: {formatDate(candidate.codingEvaluation.updatedAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Problem Status */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Problem Status</CardTitle>
                    <CardDescription className="text-white/60">
                      Status of each problem attempted
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(candidate.codingEvaluation.problemStatus).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(candidate.codingEvaluation.problemStatus).map(([problemId, status]) => (
                          <div key={problemId} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-white">Problem #{problemId}</span>
                            <Badge className={getProblemStatusColor(status)}>
                              {status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/60">No problem status data available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Code Submissions */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileCode className="w-5 h-5" />
                      Code Submissions ({candidate.codingEvaluation.codeSubmissions.length})
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      All submitted code attempts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {candidate.codingEvaluation.codeSubmissions.length > 0 ? (
                      <div className="space-y-4">
                        {candidate.codingEvaluation.codeSubmissions.map((submission, index) => (
                          <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-4">
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                  Problem #{submission.problemId}
                                </Badge>
                                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                  {submission.language}
                                </Badge>
                                {submission.passed !== undefined && (
                                  <Badge className={submission.passed ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}>
                                    {submission.passed ? 'Passed' : 'Failed'}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-white/60 text-sm">{formatDate(submission.timestamp)}</p>
                            </div>
                            <div className="bg-black/30 p-3 rounded-md overflow-x-auto">
                              <pre className="text-white/80 text-sm whitespace-pre-wrap">
                                <code>{submission.code}</code>
                              </pre>
                            </div>
                            {submission.results && (
                              <div className="mt-3 p-3 bg-white/5 rounded-md">
                                <p className="text-white/60 text-sm mb-1">Results:</p>
                                <pre className="text-white/80 text-xs whitespace-pre-wrap">
                                  {JSON.stringify(submission.results, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/60">No code submissions yet</p>
                    )}
                  </CardContent>
                </Card>

                {/* Code Runs */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <PlayCircle className="w-5 h-5" />
                      Code Test Runs ({candidate.codingEvaluation.codeRuns.length})
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      All test run attempts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {candidate.codingEvaluation.codeRuns.length > 0 ? (
                      <div className="space-y-4">
                        {candidate.codingEvaluation.codeRuns.map((run, index) => (
                          <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-4">
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                  Problem #{run.problemId}
                                </Badge>
                                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                  {run.language}
                                </Badge>
                                {run.passed !== undefined && (
                                  <Badge className={run.passed ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}>
                                    {run.passed ? 'Passed' : 'Failed'}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-white/60 text-sm">{formatDate(run.timestamp)}</p>
                            </div>
                            <div className="bg-black/30 p-3 rounded-md overflow-x-auto">
                              <pre className="text-white/80 text-sm whitespace-pre-wrap">
                                <code>{run.code}</code>
                              </pre>
                            </div>
                            {run.results && (
                              <div className="mt-3 p-3 bg-white/5 rounded-md">
                                <p className="text-white/60 text-sm mb-1">Results:</p>
                                <pre className="text-white/80 text-xs whitespace-pre-wrap">
                                  {JSON.stringify(run.results, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/60">No test runs yet</p>
                    )}
                  </CardContent>
                </Card>

                {/* Current Code */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Current Code Solution</CardTitle>
                    <CardDescription className="text-white/60">
                      Latest code for Problem #{candidate.codingEvaluation.questionId}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-black/30 p-4 rounded-md overflow-x-auto">
                      <pre className="text-white/80 text-sm whitespace-pre-wrap">
                        <code>{candidate.codingEvaluation.code}</code>
                      </pre>
                    </div>
                    {candidate.codingEvaluation.results && (
                      <div className="mt-4 p-4 bg-white/5 rounded-md">
                        <p className="text-white/60 text-sm mb-2">Test Results:</p>
                        <pre className="text-white/80 text-xs whitespace-pre-wrap">
                          {JSON.stringify(candidate.codingEvaluation.results, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-8 text-center">
                  <Code className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">No coding evaluation data available for this candidate</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="technical" className="mt-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Technical Interview Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60">Technical interview feedback will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hr" className="mt-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">HR Round Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60">HR round feedback will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button 
          variant="outline" 
          className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Reject Candidate
        </Button>
        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
          <Star className="w-4 h-4 mr-2" />
          Select Candidate
        </Button>
      </div>
    </div>
  );
}
