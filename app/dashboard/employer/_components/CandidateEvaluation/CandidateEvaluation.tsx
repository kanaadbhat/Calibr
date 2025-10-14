"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ClipboardCheck, 
  Code, 
  Brain, 
  MessageSquare, 
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Search
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFetchEmployerJobOpportunities, useFetchShortlistedCandidates } from "../../hooks";
import { CandidateEvaluationDetails } from "./CandidateEvaluationDetails";

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
}

// interface EvaluationDetails {
//   candidate: Candidate;
//   aptitude?: {
//     totalQuestions: number;
//     correctAnswers: number;
//     score: number;
//     timeTaken: number;
//     sections: {
//       name: string;
//       score: number;
//       percentage: number;
//     }[];
//   };
//   coding?: {
//     totalProblems: number;
//     solved: number;
//     score: number;
//     timeTaken: number;
//     problems: {
//       title: string;
//       difficulty: 'easy' | 'medium' | 'hard';
//       status: 'solved' | 'partial' | 'unsolved';
//       score: number;
//     }[];
//   };
//   technical?: {
//     score: number;
//     interviewer: string;
//     feedback: string;
//     strengths: string[];
//     improvements: string[];
//   };
//   hr?: {
//     score: number;
//     interviewer: string;
//     feedback: string;
//     cultureFit: number;
//     communication: number;
//   };
// }

// Helper function to get round status icon and color
function getRoundStatusIcon(status: 'pending' | 'shortlisted' | 'rejected' | 'completed') {
  switch (status) {
    case 'completed':
      return { icon: CheckCircle2, color: 'text-green-400', bgColor: 'bg-green-500/20' };
    case 'shortlisted':
      return { icon: Star, color: 'text-blue-400', bgColor: 'bg-blue-500/20' };
    case 'rejected':
      return { icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-500/20' };
    case 'pending':
      return { icon: Clock, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    default:
      return { icon: AlertCircle, color: 'text-white/40', bgColor: 'bg-white/5' };
  }
}

export function CandidateEvaluation() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('score');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  
  // Fetch job opportunities
  const { jobs: jobOpportunities, loading: jobsLoading } = useFetchEmployerJobOpportunities();
  
  // Fetch shortlisted candidates based on selected job
  const { candidates, loading: candidatesLoading, error } = useFetchShortlistedCandidates(
    selectedJobId === 'all' ? undefined : selectedJobId
  );

  console.log(error)

  const filteredCandidates = candidates.filter((c: Candidate) => {
    const matchesStatus = statusFilter === 'all' || c.applicationStatus === statusFilter;
    const matchesSearch = searchQuery === '' || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'interviewed': return <CheckCircle2 className="w-4 h-4" />;
      case 'shortlisted': return <Star className="w-4 h-4" />;
      case 'under-review': return <Clock className="w-4 h-4" />;
      case 'applied': return <AlertCircle className="w-4 h-4" />;
      case 'accepted': return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'withdrawn': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (selectedCandidate) {
    return <CandidateEvaluationDetails candidate={selectedCandidate} onBack={() => setSelectedCandidate(null)} />;
  }

  return (
    <div className="space-y-6 mt-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Candidate Evaluation</h1>
        <p className="text-white/60">Review and evaluate candidate performance across all assessment rounds</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <Input
            placeholder="Search by candidate name, email, or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 h-11"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedJobId} onValueChange={setSelectedJobId} disabled={jobsLoading}>
            <SelectTrigger className="w-full sm:w-[250px] bg-white/5 border-white/10 text-white">
              <SelectValue placeholder={jobsLoading ? "Loading jobs..." : "Filter by job opportunity"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Job Opportunities</SelectItem>
              {jobOpportunities.map((job) => (
                <SelectItem key={job._id} value={job._id}>
                  {job.title} - {job.position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="under-review">Under Review</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="interviewed">Interviewed</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Overall Score</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="date">Application Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="text-white/60 text-sm">
          {candidatesLoading ? (
            'Loading candidates...'
          ) : (
            <>
              Showing {filteredCandidates.length} of {candidates.length} candidates
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedJobId !== 'all' && ` for selected job`}
            </>
          )}
        </div>
      </div>

      {/* Candidates List */}
      <div className="grid gap-4">
        {candidatesLoading ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-12 text-center">
              <p className="text-white/60">Loading candidates...</p>
            </CardContent>
          </Card>
        ) : filteredCandidates.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">No candidates found</p>
              <p className="text-white/40 text-sm mt-2">
                {searchQuery || statusFilter !== 'all' || selectedJobId !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'No shortlisted candidates yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCandidates.map((candidate: Candidate) => {
            const aptitudeStatus = getRoundStatusIcon(candidate.rounds.aptitude);
            const codingStatus = getRoundStatusIcon(candidate.rounds.coding);
            const technicalStatus = getRoundStatusIcon(candidate.rounds.technicalInterview);
            const hrStatus = getRoundStatusIcon(candidate.rounds.hrInterview);

            return (
              <Card 
                key={candidate.id} 
                className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => setSelectedCandidate(candidate)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{candidate.name}</h3>
                        <Badge className={getStatusColor(candidate.applicationStatus)}>
                          {getStatusIcon(candidate.applicationStatus)}
                          <span className="ml-1 capitalize">{candidate.applicationStatus.replace('-', ' ')}</span>
                        </Badge>
                      </div>
                      <p className="text-white/60">{candidate.position}</p>
                      <div className="flex gap-4 mt-2 text-sm text-white/50">
                        <span>{candidate.email}</span>
                        <span>•</span>
                        <span>Applied: {new Date(candidate.appliedDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Overall Score */}
                      <div className="text-center">
                        <p className="text-white/60 text-sm mb-1">Overall Score</p>
                        <p className={`text-3xl font-bold ${getScoreColor(candidate.overallScore)}`}>
                          {candidate.overallScore || 'N/A'}
                        </p>
                      </div>

                      {/* Round Status Icons */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <div className={`p-2 rounded-lg ${aptitudeStatus.bgColor} mb-1 mx-auto inline-block`}>
                            <Brain className={`w-5 h-5 ${aptitudeStatus.color}`} />
                          </div>
                          <p className="text-xs text-white/60">Aptitude</p>
                          <p className={`text-xs font-medium ${aptitudeStatus.color} capitalize`}>
                            {candidate.rounds.aptitude}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className={`p-2 rounded-lg ${codingStatus.bgColor} mb-1 mx-auto inline-block`}>
                            <Code className={`w-5 h-5 ${codingStatus.color}`} />
                          </div>
                          <p className="text-xs text-white/60">Coding</p>
                          <p className={`text-xs font-medium ${codingStatus.color} capitalize`}>
                            {candidate.rounds.coding}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className={`p-2 rounded-lg ${technicalStatus.bgColor} mb-1 mx-auto inline-block`}>
                            <ClipboardCheck className={`w-5 h-5 ${technicalStatus.color}`} />
                          </div>
                          <p className="text-xs text-white/60">Technical</p>
                          <p className={`text-xs font-medium ${technicalStatus.color} capitalize`}>
                            {candidate.rounds.technicalInterview}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className={`p-2 rounded-lg ${hrStatus.bgColor} mb-1 mx-auto inline-block`}>
                            <MessageSquare className={`w-5 h-5 ${hrStatus.color}`} />
                          </div>
                          <p className="text-xs text-white/60">HR</p>
                          <p className={`text-xs font-medium ${hrStatus.color} capitalize`}>
                            {candidate.rounds.hrInterview}
                          </p>
                        </div>
                      </div>

                      <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
