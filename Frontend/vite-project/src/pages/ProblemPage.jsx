import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from '../components/SubmissionHistory';
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial'; // Import Editorial component

// Simple icon components using text/emojis
const ChevronDownIcon = ({ className }) => <span className={className}>▼</span>;
const CodeIcon = ({ className }) => <span className={className}>{"</>"}</span>;
const CheckCircleIcon = ({ className }) => <span className={className}>✓</span>;
const XCircleIcon = ({ className }) => <span className={className}>✗</span>;
const ClockIcon = ({ className }) => <span className={className}>⏱</span>;
const CpuChipIcon = ({ className }) => <span className={className}>⚡</span>;
const BeakerIcon = ({ className }) => <span className={className}>🧪</span>;
const DocumentTextIcon = ({ className }) => <span className={className}>📄</span>;
const BookOpenIcon = ({ className }) => <span className={className}>📚</span>;
const LightBulbIcon = ({ className }) => <span className={className}>💡</span>;
const FolderIcon = ({ className }) => <span className={className}>📁</span>;
const Cog6ToothIcon = ({ className }) => <span className={className}>⚙</span>;
const ArrowPathIcon = ({ className }) => <span className={className}>🔄</span>;
const CheckBadgeIcon = ({ className }) => <span className={className}>🏅</span>;
const ExclamationTriangleIcon = ({ className }) => <span className={className}>⚠</span>;
const ChatBubbleIcon = ({ className }) => <span className={className}>💬</span>;

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [fontSize, setFontSize] = useState(14);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [expandedTestCases, setExpandedTestCases] = useState({});
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [codeSize, setCodeSize] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  const editorRef = useRef(null);
  const languageDropdownRef = useRef(null);
  let { problemId } = useParams();

  const { handleSubmit } = useForm();

  // Language configuration with proper mapping - UPDATED
  const languageConfig = {
    javascript: { 
      name: 'JavaScript', 
      backendName: 'Javascript',
      monacoLang: 'javascript',
      icon: 'JS',
      version: 'ES6',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      fileExtension: '.js'
    },
    java: { 
      name: 'Java', 
      backendName: 'Java',
      monacoLang: 'java',
      icon: 'Java',
      version: 'JDK 11',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      fileExtension: '.java'
    },
    cpp: { 
      name: 'C++', 
      backendName: 'C++',
      monacoLang: 'cpp',
      icon: 'C++',
      version: 'C++17',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      fileExtension: '.cpp'
    }
  };

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setIsLanguageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch problem data - FIXED
  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        const problemData = response.data;
        
        setProblem(problemData);
        
        // Get the current language config
        const currentLangConfig = languageConfig[selectedLanguage];
        
        // Find starting code for the current language
        const startingCode = problemData.startCode?.find((sc) => {
          // Handle case-insensitive matching for JavaScript
          const backendLanguage = sc.language?.trim();
          const configLanguage = currentLangConfig.backendName?.trim();
          
          // Case-insensitive comparison
          return backendLanguage?.toLowerCase() === configLanguage?.toLowerCase();
        })?.initialCode || 
        // Fallback if no match found
        getDefaultStarterCode(selectedLanguage);
        
        setCode(startingCode);
        setCodeSize(new Blob([startingCode]).size);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Default starter codes in case backend doesn't provide them
  const getDefaultStarterCode = (language) => {
    switch(language) {
      case 'javascript':
        return `// JavaScript starter code
function solveProblem(input) {
    // Your code here
    return input;
}

// Main function - do not change this
function main() {
    // Your main logic here
    const result = solveProblem();
    console.log(result);
    return result;
}

// Export for testing (if needed)
module.exports = { solveProblem, main };`;
      case 'java':
        return `// Java starter code
import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Your code here
    }
}`;
      case 'cpp':
        return `// C++ starter code
#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    // Your code here
    return 0;
}`;
      default:
        return `// Starter code for ${languageConfig[selectedLanguage]?.name || 'selected language'}`;
    }
  };

  // Update code when language changes - FIXED
  useEffect(() => {
    if (problem) {
      const currentLangConfig = languageConfig[selectedLanguage];
      
      // Try to find the starting code for the selected language
      const foundCode = problem.startCode?.find(sc => {
        const backendLanguage = sc.language?.trim();
        const configLanguage = currentLangConfig.backendName?.trim();
        
        // Case-insensitive comparison
        return backendLanguage?.toLowerCase() === configLanguage?.toLowerCase();
      });
      
      if (foundCode) {
        setCode(foundCode.initialCode);
        setCodeSize(new Blob([foundCode.initialCode]).size);
      } else {
        // Use default starter code if not found
        const defaultCode = getDefaultStarterCode(selectedLanguage);
        setCode(defaultCode);
        setCodeSize(new Blob([defaultCode]).size);
      }
    }
  }, [selectedLanguage, problem]);

  // Get starter code for a specific language - FIXED
  const getStarterCodeForLanguage = (languageId) => {
    if (!problem || !problem.startCode) return getDefaultStarterCode(languageId);
    
    const langConfig = languageConfig[languageId];
    if (!langConfig) return getDefaultStarterCode(languageId);
    
    const foundCode = problem.startCode.find(sc => {
      const backendLanguage = sc.language?.trim();
      const configLanguage = langConfig.backendName?.trim();
      
      // Case-insensitive comparison
      return backendLanguage?.toLowerCase() === configLanguage?.toLowerCase();
    });
    
    return foundCode?.initialCode || getDefaultStarterCode(languageId);
  };

  const handleEditorChange = (value) => {
    setCode(value || '');
    setCodeSize(new Blob([value]).size);
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    
    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column
      });
    });
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setIsLanguageDropdownOpen(false);
  };

  const resetToStarterCode = () => {
    const starterCode = getStarterCodeForLanguage(selectedLanguage);
    setCode(starterCode);
    if (editorRef.current) {
      editorRef.current.setValue(starterCode);
    }
  };

  const toggleTestCase = (index) => {
    setExpandedTestCases(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleRun = async () => {
    if (isRunning || isSubmitting) return;
    
    setIsRunning(true);
    setRunResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

      setRunResult(response.data);
      setIsRunning(false);
      setActiveRightTab('testcase');
      
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: 'Internal server error'
      });
      setIsRunning(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    if (isSubmitting || isRunning) return;
    
    setIsSubmitting(true);
    setSubmitResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });
      
      setSubmitResult(response.data);
      setIsSubmitting(false);
      setActiveRightTab('result');
      
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({
        accepted: false,
        error: 'Submission failed. Please try again.'
      });
      setIsSubmitting(false);
      setActiveRightTab('result');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatRuntime = (runtime) => {
    if (!runtime) return 'N/A';
    const num = parseFloat(runtime);
    return num < 1 ? `${(num * 1000).toFixed(0)}ms` : `${num.toFixed(2)}s`;
  };

  const formatMemory = (memory) => {
    if (!memory) return 'N/A';
    const num = parseFloat(memory);
    return num < 1024 ? `${num}KB` : `${(num / 1024).toFixed(2)}MB`;
  };

  if (loading && !problem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-base-100 to-base-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading problem...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gradient-to-br from-base-100 to-base-200 dark:from-base-300 dark:to-base-400">
      {/* Mobile Top Navigation */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-base-100 dark:bg-base-200 dark:border-base-300">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${problem?.difficulty === 'easy' ? 'bg-green-500' : problem?.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
          <h1 className="font-bold truncate text-gray-900 dark:text-gray-100">{problem?.title}</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-sm btn-ghost">
            <DocumentTextIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button className="btn btn-sm btn-ghost">
            <CodeIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Left Panel - Problem Description */}
      <div className="lg:w-1/2 flex flex-col border-r border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-200">
        {/* Enhanced Left Tabs */}
        <div className="flex bg-base-200 dark:bg-base-300 px-4 pt-2 gap-1">
          <button 
            className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all ${activeLeftTab === 'description' ? 'bg-base-100 dark:bg-base-400 text-primary font-semibold border-t-2 border-primary' : 'hover:bg-base-300 dark:hover:bg-base-700 text-gray-700 dark:text-gray-300'}`}
            onClick={() => setActiveLeftTab('description')}
          >
            <DocumentTextIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Description</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all ${activeLeftTab === 'editorial' ? 'bg-base-100 dark:bg-base-400 text-primary font-semibold border-t-2 border-primary' : 'hover:bg-base-300 dark:hover:bg-base-700 text-gray-700 dark:text-gray-300'}`}
            onClick={() => setActiveLeftTab('editorial')}
          >
            <BookOpenIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Editorial</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all ${activeLeftTab === 'solutions' ? 'bg-base-100 dark:bg-base-400 text-primary font-semibold border-t-2 border-primary' : 'hover:bg-base-300 dark:hover:bg-base-700 text-gray-700 dark:text-gray-300'}`}
            onClick={() => setActiveLeftTab('solutions')}
          >
            <LightBulbIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Solutions</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all ${activeLeftTab === 'submissions' ? 'bg-base-100 dark:bg-base-400 text-primary font-semibold border-t-2 border-primary' : 'hover:bg-base-300 dark:hover:bg-base-700 text-gray-700 dark:text-gray-300'}`}
            onClick={() => setActiveLeftTab('submissions')}
          >
            <FolderIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Submissions</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all ${activeLeftTab === 'chatAI' ? 'bg-base-100 dark:bg-base-400 text-primary font-semibold border-t-2 border-primary' : 'hover:bg-base-300 dark:hover:bg-base-700 text-gray-700 dark:text-gray-300'}`}
            onClick={() => setActiveLeftTab('chatAI')}
          >
            <ChatBubbleIcon className="w-4 h-4" />
            <span className="hidden sm:inline">ChatAI</span>
          </button>
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div className="space-y-6">
                  {/* Problem Header */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">{problem.title}</h1>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap -2">
                      {problem.tags?.split(',').map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light rounded-full text-sm">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="prose prose-lg max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed bg-base-200 dark:bg-base-300 p-4 rounded-lg">
                      {problem.description}
                    </div>
                  </div>

                  {/* Examples Section */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <BeakerIcon className="w-5 h-5" />
                      Examples
                    </h3>
                    <div className="space-y-4">
                      {problem.visibleTestCases?.map((example, index) => (
                        <div key={index} className="bg-base-200 dark:bg-base-300 rounded-xl p-4 border border-base-300 dark:border-base-700">
                          <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Example {index + 1}</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Input:</span>
                              <code className="bg-base-300 dark:bg-base-400 px-3 py-2 rounded font-mono text-gray-900 dark:text-gray-100">
                                {example.input}
                              </code>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Output:</span>
                              <code className="bg-base-300 dark:bg-base-400 px-3 py-2 rounded font-mono text-gray-900 dark:text-gray-100">
                                {example.output}
                              </code>
                            </div>
                            {example.explanation && (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Explanation:</span>
                                <p className="text-gray-700 dark:text-gray-300 bg-base-300 dark:bg-base-400 px-3 py-2 rounded">
                                  {example.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <BookOpenIcon className="w-6 h-6" />
                    Editorial
                  </h2>
                  <div className="bg-base-200 dark:bg-base-300 p-6 rounded-xl">
                    <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                      <Editorial 
                        secureUrl={problem.secureUrl} 
                        thumbnailUrl={problem.thumbnailUrl} 
                        duration={problem.duration}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <LightBulbIcon className="w-6 h-6" />
                    Solutions
                  </h2>
                  <div className="space-y-4">
                    {problem.referenceSolution?.map((solution, index) => (
                      <div key={index} className="bg-base-200 dark:bg-base-300 border border-base-300 dark:border-base-700 rounded-xl overflow-hidden">
                        <div className="bg-base-300 dark:bg-base-400 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{solution?.language}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <CpuChipIcon className="w-4 h-4" />
                              <span>{solution?.timeComplexity || 'O(n)'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <pre className="bg-base-300 dark:bg-base-400 p-4 rounded-lg overflow-x-auto text-sm">
                            <code className="text-gray-900 dark:text-gray-100">{solution?.completeCode}</code>
                          </pre>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto text-gray-400 mb-4 flex items-center justify-center">
                          <LightBulbIcon className="w-8 h-8" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">Solutions will be available after you solve the problem.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <FolderIcon className="w-6 h-6" />
                      My Submissions
                    </h2>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Problem: {problem.title}
                    </div>
                  </div>
                  <div className="bg-base-200 dark:bg-base-300 p-4 md:p-6 rounded-xl">
                    <SubmissionHistory problemId={problemId} />
                  </div>
                </div>
              )}

              {activeLeftTab === 'chatAI' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <ChatBubbleIcon className="w-6 h-6" />
                    Chat with AI
                  </h2>
                  <div className="bg-base-200 dark:bg-base-300 p-4 md:p-6 rounded-xl">
                    <ChatAi problem={problem} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="lg:w-1/2 flex flex-col bg-base-100 dark:bg-base-200">
        {/* Enhanced Right Tabs */}
        <div className="flex bg-base-200 dark:bg-base-300 px-4 pt-2 gap-1">
          <button 
            className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all ${activeRightTab === 'code' ? 'bg-base-100 dark:bg-base-400 text-primary font-semibold border-t-2 border-primary' : 'hover:bg-base-300 dark:hover:bg-base-700 text-gray-700 dark:text-gray-300'}`}
            onClick={() => setActiveRightTab('code')}
          >
            <CodeIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Code</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all ${activeRightTab === 'testcase' ? 'bg-base-100 dark:bg-base-400 text-primary font-semibold border-t-2 border-primary' : 'hover:bg-base-300 dark:hover:bg-base-700 text-gray-700 dark:text-gray-300'}`}
            onClick={() => setActiveRightTab('testcase')}
          >
            <BeakerIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Test Cases</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all ${activeRightTab === 'result' ? 'bg-base-100 dark:bg-base-400 text-primary font-semibold border-t-2 border-primary' : 'hover:bg-base-300 dark:hover:bg-base-700 text-gray-700 dark:text-gray-300'}`}
            onClick={() => setActiveRightTab('result')}
          >
            <CheckBadgeIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Result</span>
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col">
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col">
              {/* Enhanced Language Selector */}
              <div className="p-4 border-b border-base-300 dark:border-base-700 bg-base-200 dark:bg-base-300">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Language Selector */}
                  <div className="relative" ref={languageDropdownRef}>
                    <button
                      className="flex items-center justify-between w-full md:w-64 px-4 py-3 bg-base-100 dark:bg-base-400 border border-base-300 dark:border-base-700 rounded-lg hover:bg-base-300 dark:hover:bg-base-700 transition-colors"
                      onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${languageConfig[selectedLanguage].bgColor}`}>
                          <span className={`font-bold ${languageConfig[selectedLanguage].color}`}>
                            {languageConfig[selectedLanguage].icon}
                          </span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{languageConfig[selectedLanguage].name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{languageConfig[selectedLanguage].version}</div>
                        </div>
                      </div>
                      <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isLanguageDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-full md:w-64 bg-base-100 dark:bg-base-400 border border-base-300 dark:border-base-700 rounded-lg shadow-lg z-50">
                        {Object.entries(languageConfig).map(([id, config]) => (
                          <button
                            key={id}
                            className={`flex items-center w-full px-4 py-3 hover:bg-base-300 dark:hover:bg-base-700 transition-colors ${selectedLanguage === id ? 'bg-primary/10 dark:bg-primary/20' : ''}`}
                            onClick={() => handleLanguageChange(id)}
                          >
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center mr-3 ${config.bgColor}`}>
                              <span className={`font-bold ${config.color}`}>
                                {config.icon}
                              </span>
                            </div>
                            <div className="text-left flex-1">
                              <div className="font-medium text-gray-900 dark:text-gray-100">{config.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{config.version}</div>
                            </div>
                            {selectedLanguage === id && (
                              <CheckCircleIcon className="w-5 h-5 text-primary" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Starter Code Preview */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Starting Code</span>
                      <button 
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                        onClick={resetToStarterCode}
                      >
                        <ArrowPathIcon className="w-3 h-3" />
                        Reset to Starter
                      </button>
                    </div>
                    <div className="bg-base-300 dark:bg-base-400 p-3 rounded-lg max-h-32 overflow-y-auto">
                      <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap">
                        {getStarterCodeForLanguage(selectedLanguage).split('\n').slice(0, 6).join('\n')}
                        {getStarterCodeForLanguage(selectedLanguage).split('\n').length > 6 && '...'}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editor Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-base-300 dark:border-base-700 bg-base-200 dark:bg-base-300">
                <div className="flex items-center gap-2">
                  <button className="btn btn-xs btn-ghost text-gray-700 dark:text-gray-300">
                    <Cog6ToothIcon className="w-4 h-4" />
                  </button>
                  <select 
                    className="select select-xs select-bordered bg-base-100 dark:bg-base-400 text-gray-900 dark:text-gray-100"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                  >
                    <option value={12}>12px</option>
                    <option value={14}>14px</option>
                    <option value={16}>16px</option>
                    <option value={18}>18px</option>
                  </select>
                  <select 
                    className="select select-xs select-bordered bg-base-100 dark:bg-base-400 text-gray-900 dark:text-gray-100"
                    value={editorTheme}
                    onChange={(e) => setEditorTheme(e.target.value)}
                  >
                    <option value="vs">Light</option>
                    <option value="vs-dark">Dark</option>
                    <option value="hc-black">High Contrast</option>
                  </select>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>Line {cursorPosition.line}:{cursorPosition.column}</span>
                  <span>{formatFileSize(codeSize)}</span>
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1">
                <Editor
                  height="100%"
                  language={languageConfig[selectedLanguage].monacoLang}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme={editorTheme}
                  options={{
                    fontSize: fontSize,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                    scrollbar: {
                      vertical: 'visible',
                      horizontal: 'visible',
                      useShadows: false
                    },
                    theme: editorTheme
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-base-300 dark:border-base-700 bg-base-200 dark:bg-base-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <CpuChipIcon className="w-4 h-4" />
                      <span>CPU: {problem?.timeLimit || '1s'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>Memory: {problem?.memoryLimit || '256MB'}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className={`btn btn-outline btn-md min-w-24 ${isRunning ? 'loading' : ''}`}
                      onClick={handleRun}
                      disabled={isRunning || isSubmitting}
                    >
                      {!isRunning && 'Run Code'}
                    </button>
                    <button
                      className={`btn btn-primary btn-md min-w-24 ${isSubmitting ? 'loading' : ''}`}
                      onClick={handleSubmitCode}
                      disabled={isSubmitting || isRunning}
                    >
                      {!isSubmitting && 'Submit'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <BeakerIcon className="w-5 h-5" />
                Test Results
              </h3>
              
              {runResult ? (
                <div className="space-y-6">
                  {/* Result Summary */}
                  <div className={`p-4 rounded-xl ${runResult.success ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {runResult.success ? (
                          <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                        )}
                        <div>
                          <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                            {runResult.success ? 'All Test Cases Passed!' : 'Test Cases Failed'}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {runResult.success ? 'Your code passed all example test cases.' : 'Some test cases did not pass.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Runtime</div>
                          <div className="font-bold text-gray-900 dark:text-gray-100">{formatRuntime(runResult.runtime)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Memory</div>
                          <div className="font-bold text-gray-900 dark:text-gray-100">{formatMemory(runResult.memory)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Test Cases Details */}
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100">Test Cases</h5>
                    {runResult.testCases?.map((tc, i) => (
                      <div key={i} className="border border-base-300 dark:border-base-700 rounded-lg overflow-hidden">
                        <button
                          className="w-full p-4 bg-base-200 dark:bg-base-400 hover:bg-base-300 dark:hover:bg-base-700 transition-colors flex items-center justify-between"
                          onClick={() => toggleTestCase(i)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${tc.status_id === 3 ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'}`}>
                              {tc.status_id === 3 ? (
                                <CheckCircleIcon className="w-4 h-4" />
                              ) : (
                                <XCircleIcon className="w-4 h-4" />
                              )}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">Test Case {i + 1}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${tc.status_id === 3 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                              {tc.status_id === 3 ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                          <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${expandedTestCases[i] ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {expandedTestCases[i] && (
                          <div className="p-4 bg-base-100 dark:bg-base-300 border-t border-base-300 dark:border-base-700">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Input</div>
                                <pre className="bg-base-300 dark:bg-base-400 p-3 rounded font-mono text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                                  {tc.stdin}
                                </pre>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Expected Output</div>
                                <pre className="bg-base-300 dark:bg-base-400 p-3 rounded font-mono text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                                  {tc.expected_output}
                                </pre>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Your Output</div>
                                <pre className={`p-3 rounded font-mono whitespace-pre-wrap ${tc.status_id === 3 ? 'bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-300'}`}>
                                  {tc.stdout || 'No output'}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto text-gray-400 mb-4 flex items-center justify-center">
                    <BeakerIcon className="w-12 h-12" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No test results yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Click "Run Code" to test your solution</p>
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <CheckBadgeIcon className="w-5 h-5" />
                Submission Result
              </h3>
              
              {submitResult ? (
                <div className="space-y-6">
                  {/* Main Result Card */}
                  <div className={`p-6 rounded-xl ${submitResult.accepted ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'}`}>
                    <div className="flex items-center gap-4 mb-6">
                      {submitResult.accepted ? (
                        <CheckCircleIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
                      ) : (
                        <ExclamationTriangleIcon className="w-12 h-12 text-red-600 dark:text-red-400" />
                      )}
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {submitResult.accepted ? '🎉 Accepted!' : '❌ Not Accepted'}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {submitResult.accepted ? 'Your solution passed all test cases!' : submitResult.error || 'Some test cases failed.'}
                        </p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white dark:bg-base-400 p-4 rounded-lg border border-base-300 dark:border-base-700 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {submitResult.passedTestCases}/{submitResult.totalTestCases}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Test Cases</div>
                      </div>
                      <div className="bg-white dark:bg-base-400 p-4 rounded-lg border border-base-300 dark:border-base-700 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {formatRuntime(submitResult.runtime)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Runtime</div>
                      </div>
                      <div className="bg-white dark:bg-base-400 p-4 rounded-lg border border-base-300 dark:border-base-700 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {formatMemory(submitResult.memory)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Memory</div>
                      </div>
                      <div className="bg-white dark:bg-base-400 p-4 rounded-lg border border-base-300 dark:border-base-700 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {submitResult.score || '100'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Test Cases Progress</span>
                        <span>{submitResult.passedTestCases}/{submitResult.totalTestCases}</span>
                      </div>
                      <div className="w-full bg-base-300 dark:bg-base-500 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${submitResult.accepted ? 'bg-green-600 dark:bg-green-500' : 'bg-red-600 dark:bg-red-500'}`}
                          style={{ width: `${(submitResult.passedTestCases / submitResult.totalTestCases) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-base-200 dark:bg-base-300 p-6 rounded-xl">
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Next Steps</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        className="btn btn-outline btn-block dark:border-base-700 dark:text-gray-300 dark:hover:bg-base-700"
                        onClick={() => setActiveRightTab('code')}
                      >
                        Edit Code
                      </button>
                      <button 
                        className="btn btn-primary btn-block"
                        onClick={() => setActiveLeftTab('solutions')}
                      >
                        View Solutions
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto text-gray-400 mb-4 flex items-center justify-center">
                    <CheckBadgeIcon className="w-12 h-12" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No submission result yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Click "Submit" to submit your solution for evaluation</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100 dark:bg-base-200 border-t border-base-300 dark:border-base-700">
        <div className="flex justify-around py-3">
          <button 
            className={`flex flex-col items-center p-2 ${activeLeftTab === 'description' ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`}
            onClick={() => setActiveLeftTab('description')}
          >
            <DocumentTextIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Problem</span>
          </button>
          <button 
            className={`flex flex-col items-center p-2 ${activeLeftTab === 'chatAI' ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`}
            onClick={() => setActiveLeftTab('chatAI')}
          >
            <ChatBubbleIcon className="w-6 h-6" />
            <span className="text-xs mt-1">ChatAI</span>
          </button>
          <button 
            className={`flex flex-col items-center p-2 ${activeRightTab === 'code' ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`}
            onClick={() => setActiveRightTab('code')}
          >
            <CodeIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Code</span>
          </button>
          <button 
            className={`flex flex-col items-center p-2 ${activeRightTab === 'testcase' ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`}
            onClick={() => setActiveRightTab('testcase')}
          >
            <BeakerIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Tests</span>
          </button>
          <button 
            className={`flex flex-col items-center p-2 ${activeRightTab === 'result' ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`}
            onClick={() => setActiveRightTab('result')}
          >
            <CheckBadgeIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Result</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;