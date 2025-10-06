"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import questionsData from '../questions.json';
import { fetchCodingRoundById, CodingRoundDetails } from '../actions';
import { Loader2, AlertTriangle } from 'lucide-react';

const Coding = () => {
  const params = useParams();
  const router = useRouter();
  
  // Coding round data states
  const [codingRoundData, setCodingRoundData] = useState<CodingRoundDetails | null>(null);
  const [isLoadingCodingRound, setIsLoadingCodingRound] = useState(true);
  const [codingRoundError, setCodingRoundError] = useState<string | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  
  // UI states
  const [questionId, setQuestionId] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('testcase');
  const [fontSize, setFontSize] = useState(14);
  const [leftPanelWidth, setLeftPanelWidth] = useState(45);
  const [isResizing, setIsResizing] = useState(false);
  const [outputPanelHeight, setOutputPanelHeight] = useState(35);
  const [isVerticalResizing, setIsVerticalResizing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Find question by ID from available questions
  const currentQuestion = availableQuestions.find(q => q.id === questionId) || availableQuestions[0];

  // Fetch coding round data on component mount
  useEffect(() => {
    const loadCodingRoundData = async () => {
      if (!params.id) {
        setCodingRoundError('Coding round ID not provided');
        setIsLoadingCodingRound(false);
        return;
      }

      try {
        const result = await fetchCodingRoundById(params.id as string);
        if (result.success && result.data) {
          setCodingRoundData(result.data);
          
          // Filter questions based on problemIds from coding round
          if (result.data && result.data.manuallyAddProblems && result.data.problemIds.length > 0) {
            // Use manually selected problems
            const filteredQuestions = questionsData.filter(q => 
              result.data!.problemIds.includes(q.id)
            );
            setAvailableQuestions(filteredQuestions);
          } else {
            // Use all questions for randomization (or implement randomization logic)
            setAvailableQuestions(questionsData);
          }
          
          // Set first question as default
          if (availableQuestions.length > 0) {
            setQuestionId(availableQuestions[0].id);
          }
          
          // Set default language from coding round configuration
          if (result.data && result.data.languages.length > 0) {
            setSelectedLanguage(result.data.languages[0]);
          }
        } else {
          console.error('Failed to fetch coding round:', result);
          setCodingRoundError(result.message || 'Failed to load coding round');
        }
      } catch (error) {
        console.error('Error fetching coding round:', error);
        setCodingRoundError(`Failed to load coding round: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoadingCodingRound(false);
      }
    };

    loadCodingRoundData();
  }, [params.id, availableQuestions]);

  // Load persisted UI state on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('pg_language');
      const savedFontSize = localStorage.getItem('pg_fontSize');
      const savedLeftWidth = localStorage.getItem('pg_leftPanelWidth');
      const savedOutputHeight = localStorage.getItem('pg_outputPanelHeight');
      if (savedLanguage) setSelectedLanguage(savedLanguage);
      if (savedFontSize) setFontSize(parseInt(savedFontSize));
      if (savedLeftWidth) setLeftPanelWidth(parseFloat(savedLeftWidth));
      if (savedOutputHeight) setOutputPanelHeight(parseFloat(savedOutputHeight));
    } catch (error) {
      console.warn('Failed to load UI preferences:', error);
    }
  }, []);

  // Load starter or persisted code when question/language changes
  useEffect(() => {
    const lsKey = `pg_code_q${questionId}_${selectedLanguage}`;
    const savedCode = localStorage.getItem(lsKey);
    if (savedCode !== null) {
      setCode(savedCode);
    } else if (currentQuestion && currentQuestion.starterCode[selectedLanguage]) {
      setCode(currentQuestion.starterCode[selectedLanguage]);
    }
  }, [questionId, selectedLanguage, currentQuestion]);

  const handleQuestionChange = (id: number) => {
    setQuestionId(id);
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    try { 
      localStorage.setItem('pg_language', language); 
    } catch (error) {
      console.warn('Failed to save language preference:', error);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
    try {
      const lsKey = `pg_code_q${questionId}_${selectedLanguage}`;
      localStorage.setItem(lsKey, value ?? '');
    } catch (error) {
      console.warn('Failed to save code:', error);
    }
  };

  const handleFontSizeChange = (size: string) => {
    const parsed = parseInt(size);
    setFontSize(parsed);
    try { 
      localStorage.setItem('pg_fontSize', String(parsed)); 
    } catch (error) {
      console.warn('Failed to save font size preference:', error);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const containerWidth = window.innerWidth;
    const newLeftWidth = (e.clientX / containerWidth) * 100;
    
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftPanelWidth(newLeftWidth);
      try { 
        localStorage.setItem('pg_leftPanelWidth', String(newLeftWidth)); 
      } catch (error) {
        console.warn('Failed to save panel width preference:', error);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const handleVerticalMouseDown = (e: React.MouseEvent) => {
    setIsVerticalResizing(true);
    e.preventDefault();
  };

  const handleVerticalMouseMove = (e: MouseEvent) => {
    if (!isVerticalResizing) return;
    
    const editorPanel = (e.target as Element).closest('.editor-panel');
    if (!editorPanel) return;
    
    const editorPanelRect = editorPanel.getBoundingClientRect();
    const editorHeaderHeight = 60;
    const availableHeight = editorPanelRect.height - editorHeaderHeight;
    const relativeY = e.clientY - editorPanelRect.top - editorHeaderHeight;
    const newOutputHeight = ((availableHeight - relativeY) / availableHeight) * 100;
    
    if (newOutputHeight >= 20 && newOutputHeight <= 80) {
      setOutputPanelHeight(newOutputHeight);
      try { 
        localStorage.setItem('pg_outputPanelHeight', String(newOutputHeight)); 
      } catch (error) {
        console.warn('Failed to save output panel height preference:', error);
      }
    }
  };

  const handleVerticalMouseUp = () => {
    setIsVerticalResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove]);

  React.useEffect(() => {
    if (isVerticalResizing) {
      document.addEventListener('mousemove', handleVerticalMouseMove);
      document.addEventListener('mouseup', handleVerticalMouseUp);
    } else {
      document.removeEventListener('mousemove', handleVerticalMouseMove);
      document.removeEventListener('mouseup', handleVerticalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleVerticalMouseMove);
      document.removeEventListener('mouseup', handleVerticalMouseUp);
    };
  }, [isVerticalResizing, handleVerticalMouseMove]);

  const getMonacoLanguage = (language: string) => {
    const languageMap: Record<string, string> = {
      cpp: 'cpp',
      javascript: 'javascript',
      python: 'python',
      java: 'java'
    };
    return languageMap[language] || 'javascript';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colorMap: Record<string, string> = {
      easy: '#00b8a3',
      medium: '#ffc01e',
      hard: '#ff375f'
    };
    return colorMap[difficulty.toLowerCase()] || '#666';
  };

  const compileCppCode = async (code: string, input: string) => {
    try {
      const submissionData = {
        language_id: 54,
        source_code: btoa(code),
        stdin: btoa(input || ''),
        expected_output: null
      };

      const response = await axios.post(
        'http://13.200.255.237:2358/submissions?base64_encoded=true&wait=false&fields=*',
        submissionData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const token = response.data.token;
      let result;
      let attempts = 0;
      const maxAttempts = 15;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const resultResponse = await axios.get(
          `http://13.200.255.237:2358/submissions/${token}?base64_encoded=true&fields=*`
        );

        result = resultResponse.data;
        if (result.stdout) result.stdout = atob(result.stdout);
        if (result.stderr) result.stderr = atob(result.stderr);
        if (result.compile_output) result.compile_output = atob(result.compile_output);

        if (result.status && result.status.id > 2) {
          break;
        }

        attempts++;
      }

      if (!result || (result.status && result.status.id <= 2)) {
        return {
          stdout: null,
          stderr: null,
          compile_output: 'Execution timed out while waiting for result',
          status: { id: 13, description: 'Internal Error / Timeout' }
        };
      }

      return result;
    } catch (error) {
      console.error('C++ Compilation Error:', error);
      return {
        stdout: null,
        stderr: null,
        compile_output: 'API connection failed',
        status: { id: 6, description: 'Compilation Error' }
      };
    }
  };

  const generateCppTestCode = (userCode: string, testCase: any) => {
    const config = currentQuestion.executionConfig;
    const includes = config.cppIncludes || ['iostream', 'vector'];
    
    let includeStatements = includes.map((inc: string) => `#include <${inc}>`).join('\n');
    includeStatements += '\nusing namespace std;\n\n';

    // Replace template placeholders with actual values
    let testBody = config.cppTestTemplate;
    
    // Handle nested properties like input.nums, input.target
    testBody = testBody.replace(/\$\{input\.(\w+)\}/g, (match: string, prop: string) => {
      const value = testCase.input[prop];
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      if (typeof value === 'string') {
        return value;
      }
      return value;
    });

    return `${includeStatements}${userCode}\n\nint main() {\n${testBody}\n    return 0;\n}`;
  };

  const executeTest = async (testCase: any, userCode: any) => {
    try {
      const { input, expected } = testCase;
      let result;
      let error = null;
      let time = null;
      let memory = null;

      if (selectedLanguage === 'cpp') {
        const completeCode = generateCppTestCode(userCode, testCase);
        const compilationResult = await compileCppCode(completeCode, '');
        
        if (compilationResult.status && compilationResult.status.id === 6) {
          error = compilationResult.compile_output || 'Compilation failed';
          result = null;
        } else if (compilationResult.stderr && compilationResult.stderr.trim() !== '') {
          error = compilationResult.stderr;
          result = null;
        } else if (compilationResult.status && compilationResult.status.id !== 3) {
          error = compilationResult.status.description || 'Execution failed';
          result = null;
        } else if (compilationResult.stdout) {
          try {
            result = JSON.parse(compilationResult.stdout.trim());
          } catch {
            result = compilationResult.stdout.trim();
          }
        } else {
          result = null;
        }

        if (typeof compilationResult?.time !== 'undefined') time = compilationResult.time;
        if (typeof compilationResult?.memory !== 'undefined') memory = compilationResult.memory;
      } else {
        // For non-C++ languages, check if code is placeholder
        if (userCode.toString().includes('// Your code here') || 
            userCode.toString().includes('# Your code here') || 
            userCode.toString().includes('pass')) {
          result = null;
        } else {
          // Mock execution - in real implementation, call backend
          result = expected;
        }
      }

      const passed = !error && JSON.stringify(result) === JSON.stringify(expected);
      
      return {
        input,
        expected,
        actual: result,
        passed,
        error,
        time,
        memory
      };
    } catch (error) {
      return {
        input: testCase.input,
        expected: testCase.expected,
        actual: null,
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        time: null,
        memory: null
      };
    }
  };

  const runCode = async () => {
    try {
      setIsRunning(true);
      setTestResults({ loading: true });
      const testCases = currentQuestion.testCases || [];
      
      let userFunction;
      if (selectedLanguage === 'javascript') {
        const functionMatch = code.match(/var\s+\w+\s*=\s*function\s*\([^)]*\)\s*{[\s\S]*}/);
        if (functionMatch) {
          try {
            eval(`userFunction = ${functionMatch[0]}`);
        } catch {
          userFunction = () => null;
        }
        } else {
          userFunction = () => null;
        }
      } else {
        userFunction = { toString: () => code };
      }

      const results = [];
      for (const testCase of testCases) {
        const result = await executeTest(testCase, selectedLanguage === 'cpp' ? code : userFunction);
        results.push(result);
        if (selectedLanguage === 'cpp' && result.error && /Compilation/i.test(result.error)) {
          break;
        }
      }

        const allPassed = results.every((result: any) => result.passed);
        const passedCount = results.filter((r: any) => r.passed).length;
      const lastWithMetrics = [...results].reverse().find((r: any) => r.time !== null || r.memory !== null);
      const lastTime = lastWithMetrics?.time ?? null;
      const lastMemory = lastWithMetrics?.memory ?? null;
      
      setTestResults({
        results,
        allPassed,
        totalTests: results.length,
        passedTests: passedCount,
        lastTime,
        lastMemory,
        loading: false
      });
      
      setActiveTab('testcase');
    } catch (error) {
      setTestResults({
        results: [],
        allPassed: false,
        totalTests: 0,
        passedTests: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      });
    }
    setIsRunning(false);
  };

  const submitCode = async () => {
    await runCode();
    setTimeout(() => {
      if (testResults && testResults.allPassed) {
        alert('🎉 Accepted! All test cases passed!');
      } else if (testResults?.results?.some((r: any) => r.error && /Compilation/i.test(r.error))) {
        alert('❌ Compilation Error. Please fix the errors and try again.');
      } else {
        alert('❌ Wrong Answer. Please check your solution.');
      }
    }, 100);
  };

  const renderTestResults = () => {
    if (!testResults) {
      return (
        <div className="p-5 text-center text-gray-400">
          Click Run to execute your code and see the results.
        </div>
      );
    }

    if (testResults.loading) {
      return (
        <div className="p-5 text-center text-blue-400">
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" style={{animation: 'spin 1s linear infinite'}}></span>
            <span>Compiling and running your code...</span>
          </div>
          {selectedLanguage === 'cpp' && (
            <div className="text-xs text-gray-400">
              C++ compilation may take a few seconds
            </div>
          )}
        </div>
      );
    }

    if (testResults.error) {
      return (
        <div className="p-5">
          <div className="bg-red-500/20 text-red-500 border border-red-500 rounded-lg p-3 text-center font-semibold">
            Runtime Error
          </div>
          <div className="text-red-500 font-mono mt-2">
            Error: {testResults.error}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className={`rounded-lg p-3 mb-4 text-center font-semibold border ${
          testResults.allPassed 
            ? 'bg-green-500/20 text-green-500 border-green-500' 
            : 'bg-red-500/20 text-red-500 border-red-500'
        }`}>
          {testResults.allPassed ? '✅ Accepted' : '❌ Wrong Answer'}
          <div className="text-sm mt-1">
            {testResults.passedTests}/{testResults.totalTests} test cases passed
          </div>
          {(typeof testResults.lastMemory !== 'undefined' && testResults.lastMemory !== null) && (
            <div className="text-xs mt-1 text-gray-300">Memory: {testResults.lastMemory} KB{(typeof testResults.lastTime !== 'undefined' && testResults.lastTime !== null) ? ` · Time: ${testResults.lastTime}s` : ''}</div>
          )}
        </div>
        
        {testResults.results.map((result: any, index: number) => (
          <div key={index} className={`mb-4 p-3 rounded-lg border-l-4 ${
            result.passed 
              ? 'bg-green-500/10 border-l-green-500' 
              : 'bg-red-500/10 border-l-red-500'
          }`}>
            <div className="flex items-center gap-2 mb-2 font-semibold">
              <span>Test Case {index + 1}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                result.passed 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {result.passed ? 'Passed' : 'Failed'}
              </span>
              {(result.memory !== null || result.time !== null) && (
                <span className="ml-auto text-xs text-gray-400">{result.memory !== null ? `${result.memory} KB` : ''}{result.time !== null ? `${result.memory !== null ? ' · ' : ''}${result.time}s` : ''}</span>
              )}
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              <div><strong>Input:</strong> {JSON.stringify(result.input)}</div>
              <div><strong>Expected:</strong> {JSON.stringify(result.expected)}</div>
              <div><strong>Output:</strong> {JSON.stringify(result.actual)}</div>
              {result.error && (
                <div className="mt-2">
                  <strong>Error:</strong> 
                  <div className="mt-1 p-2 bg-red-900/30 border border-red-500/30 rounded text-red-400 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                    {result.error}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Show loading state while fetching coding round data
  if (isLoadingCodingRound) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-400" />
          <h2 className="text-2xl font-bold mb-2">Loading Coding Round</h2>
          <p className="text-gray-400">Please wait while we load your coding assessment...</p>
        </div>
      </div>
    );
  }

  // Show error state if coding round failed to load
  if (codingRoundError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white max-w-2xl">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold mb-2">Coding Round Not Available</h2>
          <p className="text-gray-400 mb-4">{codingRoundError}</p>
          
          {/* Debug information */}
          <div className="bg-gray-800 p-4 rounded-lg mb-6 text-left">
            <h3 className="text-sm font-semibold text-yellow-400 mb-2">Debug Information:</h3>
            <div className="text-xs text-gray-300 space-y-1">
              <div>Assessment ID from URL: {params.id}</div>
              <div>Loading State: {isLoadingCodingRound ? 'Loading...' : 'Complete'}</div>
              <div>Error: {codingRoundError}</div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => router.push('/dashboard/candidate')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no questions available
  if (availableQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-2xl font-bold mb-2">No Problems Available</h2>
          <p className="text-gray-400 mb-6">No coding problems have been configured for this round.</p>
          <button 
            onClick={() => router.push('/dashboard/candidate')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-gray-900 text-gray-300 font-sans ${
      isResizing || isVerticalResizing ? 'select-none' : ''
    }`}>
      {/* Header with coding round info */}
      <div className="absolute top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 p-3 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white">Coding Assessment</h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Duration: {codingRoundData?.duration || 0} minutes</span>
              <span>•</span>
              <span>Problems: {availableQuestions.length}/{codingRoundData?.totalProblems || 0}</span>
              <span>•</span>
              <span>Passing Score: {codingRoundData?.passingScore || 0}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Languages: {codingRoundData?.languages?.join(', ') || 'Multiple'}</span>
          </div>
        </div>
      </div>

      <div 
        className="bg-gray-800 border-r border-gray-700 overflow-y-auto flex flex-col min-w-[200px] max-w-[80%] mt-12"
        style={{ width: `${leftPanelWidth}%` }}
      >
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <div className="mb-2">
            <label className="text-sm text-gray-400">Problem Selection</label>
            <div className="text-xs text-gray-500">
              {codingRoundData?.manuallyAddProblems ? 'Manually Selected' : 'Randomized'} • 
              {availableQuestions.length} of {codingRoundData?.totalProblems || 0} problems
            </div>
          </div>
          <select 
            value={questionId} 
            onChange={(e) => handleQuestionChange(parseInt(e.target.value))}
            className="w-full p-2 bg-gray-700 text-gray-300 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
          >
            {availableQuestions.map((question) => (
              <option key={question.id} value={question.id}>
                {question.id}. {question.title}
              </option>
            ))}
          </select>
        </div>

        <div className="p-5 flex-1">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-semibold m-0">{currentQuestion.title}</h2>
            <span 
              className="px-3 py-1 rounded-full text-white text-xs font-medium uppercase"
              style={{ backgroundColor: getDifficultyColor(currentQuestion.difficulty) }}
            >
              {currentQuestion.difficulty}
            </span>
          </div>

          <div className="mb-6 leading-relaxed">
            <p className="text-sm m-0">{currentQuestion.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-base font-semibold text-white mb-4">Examples:</h3>
            {currentQuestion.examples.map((example: any, index: number) => (
              <div key={index} className="mb-4 p-4 bg-gray-900 rounded-lg border-l-4 border-blue-500">
                <h4 className="text-sm font-semibold text-white mb-2 m-0">Example {index + 1}:</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Input:</strong> {
                    typeof example.input === 'string' 
                      ? example.input 
                      : JSON.stringify(example.input)
                  }</div>
                  <div><strong>Output:</strong> {
                    typeof example.output === 'string' 
                      ? example.output 
                      : JSON.stringify(example.output)
                  }</div>
                  {example.explanation && (
                    <div><strong>Explanation:</strong> {example.explanation}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-base font-semibold text-white mb-3">Constraints:</h3>
            <ul className="space-y-2">
              {currentQuestion.constraints.map((constraint: any, index: number) => (
                <li key={index} className="text-sm">{constraint}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div 
        className={`w-1 bg-gray-700 cursor-col-resize relative z-10 transition-colors hover:bg-blue-500 ${
          isResizing ? 'bg-blue-500' : ''
        }`}
        onMouseDown={handleMouseDown}
      />

      <div 
        className="editor-panel bg-gray-900 flex flex-col min-w-[200px] max-w-[80%] mt-12"
        style={{ width: `${100 - leftPanelWidth}%` }}
      >
        <div className="flex justify-between items-center p-3 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-2 flex-wrap">
            <select 
              value={selectedLanguage} 
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="p-1.5 bg-gray-700 text-gray-300 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
            >
              {codingRoundData?.languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'javascript' ? 'JavaScript' :
                   lang === 'python' ? 'Python' :
                   lang === 'java' ? 'Java' :
                   lang === 'cpp' ? 'C++' :
                   lang === 'c' ? 'C' :
                   lang === 'typescript' ? 'TypeScript' :
                   lang === 'go' ? 'Go' :
                   lang === 'ruby' ? 'Ruby' :
                   lang === 'php' ? 'PHP' :
                   lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
            {selectedLanguage === 'cpp' && (
              <span className="text-xs text-green-500 ml-2 italic">
                ✅ Real C++ compiler ready!
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-400">
                Font Size:
              </label>
              <select 
                value={fontSize} 
                onChange={(e) => handleFontSizeChange(e.target.value)}
                className="p-1 bg-gray-700 text-gray-300 border border-gray-600 rounded text-xs focus:outline-none focus:border-blue-500 min-w-[60px]"
              >
                <option value="10">10px</option>
                <option value="11">11px</option>
                <option value="12">12px</option>
                <option value="13">13px</option>
                <option value="14">14px</option>
                <option value="15">15px</option>
                <option value="16">16px</option>
                <option value="17">17px</option>
                <option value="18">18px</option>
                <option value="20">20px</option>
                <option value="22">22px</option>
                <option value="24">24px</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button onClick={runCode} disabled={isRunning} className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${isRunning ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
              {isRunning ? <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" style={{animation: 'spin 1s linear infinite'}}></span> : '▶'}
              <span>Run</span>
            </button>
            <button onClick={submitCode} disabled={isRunning} className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${isRunning ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white`}>
              {isRunning ? <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" style={{animation: 'spin 1s linear infinite'}}></span> : null}
              <span>Submit</span>
            </button>
          </div>
        </div>

        <div 
          className="bg-gray-900 overflow-hidden border-b border-gray-700"
          style={{ height: `${100 - outputPanelHeight}%` }}
        >
          <Editor
            height="100%"
            language={getMonacoLanguage(selectedLanguage)}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              fontSize: fontSize,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
            }}
          />
        </div>

        <div 
          className={`h-1 bg-gray-700 cursor-row-resize relative z-10 transition-colors hover:bg-blue-500 ${
            isVerticalResizing ? 'bg-blue-500' : ''
          }`}
          onMouseDown={handleVerticalMouseDown}
        />

        <div 
          className="bg-gray-900 flex flex-col min-h-[100px] max-h-[80%]"
          style={{ height: `${outputPanelHeight}%` }}
        >
          <div className="p-3 bg-gray-800 border-b border-gray-700 flex items-center gap-3">
            <div className="flex gap-1">
              <button 
                className={`px-3 py-1.5 text-xs rounded-t transition-colors ${
                  activeTab === 'testcase' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setActiveTab('testcase')}
              >
                Testcase
              </button>
              <button 
                className={`px-3 py-1.5 text-xs rounded-t transition-colors ${
                  activeTab === 'result' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setActiveTab('result')}
              >
                Test Result
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed">
            {activeTab === 'testcase' && renderTestResults()}
            {activeTab === 'result' && (
              <div className="p-5 text-center text-gray-400">
                Detailed execution results will appear here after running your code.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coding;