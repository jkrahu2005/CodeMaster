import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Code, 
  Eye, 
  Copy, 
  ExternalLink,
  AlertTriangle,
  Cpu,
  MemoryStick,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileCode
} from 'lucide-react';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        console.log("answer")
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        console.log(response)
        
        // Handle different response formats
        let submissionsData = [];
        
        if (Array.isArray(response.data)) {
          submissionsData = response.data;
        } else if (response.data && response.data.submissions) {
          submissionsData = response.data.submissions;
        } else if (response.data && Array.isArray(response.data.data)) {
          submissionsData = response.data.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          // If it's a single object, wrap it in an array
          submissionsData = [response.data];
        }
        
        // Ensure we have an array
        if (!Array.isArray(submissionsData)) {
          submissionsData = [];
        }
        
        // Sort by date (newest first)
        submissionsData.sort((a, b) => new Date(b.createdAt || b.submittedAt) - new Date(a.createdAt || a.submittedAt));
        
        setSubmissions(submissionsData);
        setError(null);
      } catch (err) {
        console.error('API Error:', err.response?.data || err.message);
        setError('Failed to fetch submission history. Please try again.');
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  const getStatusInfo = (status) => {
    const statusLower = (status || '').toLowerCase();
    
    switch (statusLower) {
      case 'accepted':
      case 'success':
      case 'passed':
        return {
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <CheckCircle className="h-4 w-4 text-emerald-600" />,
          text: 'Accepted'
        };
      case 'rejected':
      case 'wrong answer':
      case 'failed':
        return {
          color: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: <XCircle className="h-4 w-4 text-rose-600" />,
          text: 'Rejected'
        };
      case 'error':
      case 'runtime error':
      case 'compile error':
        return {
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
          text: 'Error'
        };
      case 'pending':
      case 'processing':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <Clock className="h-4 w-4 text-blue-600" />,
          text: 'Pending'
        };
      default:
        return {
          color: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: <Clock className="h-4 w-4 text-slate-600" />,
          text: status || 'Unknown'
        };
    }
  };

  const getLanguageInfo = (language) => {
    const lang = (language || '').toLowerCase();
    
    switch (lang) {
      case 'javascript':
      case 'js':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          name: 'JavaScript'
        };
      case 'java':
        return {
          color: 'bg-red-100 text-red-800 border-red-300',
          name: 'Java'
        };
      case 'cpp':
      case 'c++':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          name: 'C++'
        };
      default:
        return {
          color: 'bg-slate-100 text-slate-800 border-slate-300',
          name: language || 'Unknown'
        };
    }
  };

  const formatMemory = (memory) => {
    if (!memory) return 'N/A';
    const num = parseFloat(memory);
    if (isNaN(num)) return 'N/A';
    return num < 1024 ? `${num} kB` : `${(num / 1024).toFixed(1)} MB`;
  };

  const formatRuntime = (runtime) => {
    if (!runtime) return 'N/A';
    const num = parseFloat(runtime);
    if (isNaN(num)) return 'N/A';
    return num < 1 ? `${(num * 1000).toFixed(0)} ms` : `${num.toFixed(2)} s`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Invalid date';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading submission history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="font-bold text-red-800 mb-2">Error Loading Submissions</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-sm bg-red-600 hover:bg-red-700 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!Array.isArray(submissions) || submissions.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto text-slate-400 mb-4 flex items-center justify-center">
          <FileCode className="h-8 w-8" />
        </div>
        <h3 className="font-bold text-slate-700 mb-2">No Submissions Yet</h3>
        <p className="text-slate-600 mb-4">Submit your solution to see your submission history here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Submission History</h3>
          <p className="text-sm text-gray-600">
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Latest first
        </div>
      </div>

      <div className="space-y-3">
        {submissions.map((submission, index) => {
          const statusInfo = getStatusInfo(submission.status);
          const langInfo = getLanguageInfo(submission.language);
          const isExpanded = expandedRow === submission._id;

          return (
            <div key={submission._id || index} className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              {/* Main Row */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`badge ${langInfo.color} font-medium`}>
                        {langInfo.name}
                      </div>
                      <div className={`badge ${statusInfo.color} gap-1`}>
                        {statusInfo.icon}
                        {statusInfo.text}
                      </div>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Cpu className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{formatRuntime(submission.runtime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MemoryStick className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{formatMemory(submission.memory)}</span>
                      </div>
                      {submission.testCasesPassed !== undefined && submission.testCasesTotal !== undefined && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">
                            {submission.testCasesPassed}/{submission.testCasesTotal}
                          </span>
                          <span className="text-gray-500">tests</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(submission.createdAt || submission.submittedAt)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="btn btn-sm btn-outline border-slate-300 hover:bg-slate-50 text-slate-700 gap-1"
                        title="View Code"
                      >
                        <Code className="h-4 w-4" />
                        <span className="hidden sm:inline">Code</span>
                      </button>
                      
                      <button
                        onClick={() => setExpandedRow(isExpanded ? null : submission._id)}
                        className="btn btn-sm btn-ghost"
                        title={isExpanded ? "Show less" : "Show more"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="md:hidden mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Cpu className="h-4 w-4 text-gray-400" />
                        <span>{formatRuntime(submission.runtime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MemoryStick className="h-4 w-4 text-gray-400" />
                        <span>{formatMemory(submission.memory)}</span>
                      </div>
                    </div>
                    <div className="text-gray-500">
                      {formatDate(submission.createdAt || submission.submittedAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Submission Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Submission ID:</span>
                          <code className="text-gray-800 font-mono">
                            {submission._id?.slice(-8) || 'N/A'}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Language:</span>
                          <span className="font-medium">{langInfo.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-medium">{statusInfo.text}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Runtime:</span>
                          <span className="font-medium">{formatRuntime(submission.runtime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Memory:</span>
                          <span className="font-medium">{formatMemory(submission.memory)}</span>
                        </div>
                        {submission.testCasesPassed !== undefined && submission.testCasesTotal !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Test Cases:</span>
                            <span className="font-medium">
                              {submission.testCasesPassed} / {submission.testCasesTotal} passed
                              {submission.testCasesTotal > 0 && (
                                <span className="text-gray-500 ml-2">
                                  ({Math.round((submission.testCasesPassed / submission.testCasesTotal) * 100)}%)
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {submission.errorMessage && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-semibold text-red-700 mb-1">Error Message</h5>
                          <pre className="text-red-600 text-sm whitespace-pre-wrap">
                            {submission.errorMessage}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Code View Modal */}
      {selectedSubmission && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl bg-white border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Submission Code</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`badge ${getLanguageInfo(selectedSubmission.language).color}`}>
                    {getLanguageInfo(selectedSubmission.language).name}
                  </div>
                  <div className={`badge ${getStatusInfo(selectedSubmission.status).color} gap-1`}>
                    {getStatusInfo(selectedSubmission.status).icon}
                    {getStatusInfo(selectedSubmission.status).text}
                  </div>
                </div>
              </div>
              
              <button 
                className="btn btn-sm btn-circle btn-outline border-slate-300 hover:bg-slate-50"
                onClick={() => setSelectedSubmission(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Runtime</div>
                <div className="font-bold text-gray-900">{formatRuntime(selectedSubmission.runtime)}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Memory</div>
                <div className="font-bold text-gray-900">{formatMemory(selectedSubmission.memory)}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Test Cases</div>
                <div className="font-bold text-gray-900">
                  {selectedSubmission.testCasesPassed || 0}/{selectedSubmission.testCasesTotal || 0}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Submitted</div>
                <div className="font-bold text-gray-900 text-sm">
                  {formatDate(selectedSubmission.createdAt || selectedSubmission.submittedAt)}
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() => copyToClipboard(selectedSubmission.code)}
                  className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                  Copy Code
                </button>
              </div>
              
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto max-h-96">
                <code className="font-mono text-sm">{selectedSubmission.code || 'No code available'}</code>
              </pre>
            </div>
            
            {selectedSubmission.errorMessage && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">Error Details</h4>
                    <pre className="text-red-700 text-sm whitespace-pre-wrap">
                      {selectedSubmission.errorMessage}
                    </pre>
                  </div>
                </div>
              </div>
            )}
            
            <div className="modal-action">
              <button 
                className="btn btn-outline border-slate-300 hover:bg-slate-50 text-slate-700"
                onClick={() => setSelectedSubmission(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;