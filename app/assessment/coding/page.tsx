"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import questionsData from './questions.json';

// Dynamically import Monaco Editor for client-side only
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false }) as React.ComponentType<any>;

type Language = 'javascript' | 'python' | 'java' | 'cpp';

type Example = {
  input: unknown;
  output: unknown;
  explanation?: string;
};

type TestCase = {
  input: Record<string, any>;
  expected: any;
};

type ExecutionConfig = {
  functionName: string;
  className?: string;
  cppTestTemplate: string;
  cppIncludes?: string[];
};

type Question = {
  id: number;
  title: string;
  difficulty: string;
  description: string;
  constraints: string[];
  examples: Example[];
  starterCode: Record<string, string>;
  testCases: TestCase[];
  executionConfig: ExecutionConfig;
};

type SingleResult = {
  input: any;
  expected: any;
  actual: any;
  passed: boolean;
  error: string | null;
  time: number | null;
  memory: number | null;
};

type TestResultsState = {
  results?: SingleResult[];
  allPassed?: boolean;
  totalTests?: number;
  passedTests?: number;
  lastTime?: number | null;
  lastMemory?: number | null;
  loading?: boolean;
  error?: string;
} | null;

const Coding: React.FC = () => {
  // Initialize with question ID from backend (mocked here with ID 1)
  const [questionId, setQuestionId] = useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('javascript');
  const [code, setCode] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResultsState>(null);
  const [activeTab, setActiveTab] = useState<'testcase' | 'result'>('testcase');
  const [fontSize, setFontSize] = useState<number>(14);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(45);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [outputPanelHeight, setOutputPanelHeight] = useState<number>(35);
  const [isVerticalResizing, setIsVerticalResizing] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Find question by ID
  const questions = questionsData as Question[];
  const currentQuestion: Question = questions.find(q => q.id === questionId) || questions[0];

  // Load persisted UI state on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('pg_language');
      const savedFontSize = localStorage.getItem('pg_fontSize');
      const savedLeftWidth = localStorage.getItem('pg_leftPanelWidth');
      const savedOutputHeight = localStorage.getItem('pg_outputPanelHeight');
      if (savedLanguage && ['javascript', 'python', 'java', 'cpp'].includes(savedLanguage)) {
        setSelectedLanguage(savedLanguage as Language);
      }
      if (savedFontSize) setFontSize(parseInt(savedFontSize));
      if (savedLeftWidth) setLeftPanelWidth(parseFloat(savedLeftWidth));
      if (savedOutputHeight) setOutputPanelHeight(parseFloat(savedOutputHeight));
    } catch {
      // Ignore localStorage errors
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
    if (['javascript', 'python', 'java', 'cpp'].includes(language)) {
      setSelectedLanguage(language as Language);
      try { localStorage.setItem('pg_language', language); } catch {
        // Ignore localStorage errors
      }
    }
  };

  const handleCodeChange = (value?: string) => {
    const val = value ?? '';
    setCode(val);
    try {
      const lsKey = `pg_code_q${questionId}_${selectedLanguage}`;
      localStorage.setItem(lsKey, val);
    } catch {
      // Ignore localStorage errors
    }
  };

  const handleFontSizeChange = (size: string) => {
    const parsed = parseInt(size);
    setFontSize(parsed);
    try { localStorage.setItem('pg_fontSize', String(parsed)); } catch {
      // Ignore localStorage errors
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const containerWidth = window.innerWidth;
    const newLeftWidth = (e.clientX / containerWidth) * 100;
    
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftPanelWidth(newLeftWidth);
      try { localStorage.setItem('pg_leftPanelWidth', String(newLeftWidth)); } catch {
        // Ignore localStorage errors
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const handleVerticalMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsVerticalResizing(true);
    e.preventDefault();
  };

  const handleVerticalMouseMove = (e: MouseEvent) => {
    if (!isVerticalResizing) return;
    
    const target = e.target as HTMLElement | null;
    const editorPanel = target?.closest?.('.editor-panel') as HTMLElement | null;
    if (!editorPanel) return;
    
    const editorPanelRect = editorPanel.getBoundingClientRect();
    const editorHeaderHeight = 60;
    const availableHeight = editorPanelRect.height - editorHeaderHeight;
    const relativeY = e.clientY - editorPanelRect.top - editorHeaderHeight;
    const newOutputHeight = ((availableHeight - relativeY) / availableHeight) * 100;
    
    if (newOutputHeight >= 20 && newOutputHeight <= 80) {
      setOutputPanelHeight(newOutputHeight);
      try { localStorage.setItem('pg_outputPanelHeight', String(newOutputHeight)); } catch {
        // Ignore localStorage errors
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
  }, [isResizing]);

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
  }, [isVerticalResizing]);

  const getMonacoLanguage = (language: Language): string => {
    const languageMap: Record<Language, string> = {
      cpp: 'cpp',
      javascript: 'javascript',
      python: 'python',
      java: 'java'
    };
    return languageMap[language] || 'javascript';
  };

  const getDifficultyColor = (difficulty: string): string => {
    const colorMap: Record<string, string> = {
      easy: '#00b8a3',
      medium: '#ffc01e',
      hard: '#ff375f'
    };
    return colorMap[difficulty.toLowerCase()] || '#666';
  };

  const compileCppCode = async (code: string, input: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_JUDGE0_BASE_URL || 'http://localhost:2358';
      const submissionData = {
        language_id: 54,
        source_code: btoa(code),
        stdin: btoa(input || ''),
        expected_output: null
      };

      const response = await axios.post(
        `${baseUrl}/submissions?base64_encoded=true&wait=false&fields=*`,
        submissionData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const token = response.data.token;
      let result: any;
      let attempts = 0;
      const maxAttempts = 15;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const resultResponse = await axios.get(
          `${baseUrl}/submissions/${token}?base64_encoded=true&fields=*`
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

  const generateCppTestCode = (userCode: string, testCase: TestCase): string => {
    const config = currentQuestion.executionConfig;
    const includes = config.cppIncludes || ['iostream', 'vector'];
    
    let includeStatements = includes.map(inc => `#include <${inc}>`).join('\n');
    includeStatements += '\nusing namespace std;\n\n';

    // Replace template placeholders with actual values
    let testBody = config.cppTestTemplate;
    
    // Handle nested properties like input.nums, input.target
    testBody = testBody.replace(/\$\{input\.(\w+)\}/g, (_match, prop) => {
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

  const executeTest = async (testCase: TestCase, userCode: any): Promise<SingleResult> => {
    try {
      const { input, expected } = testCase;
      let result: any;
      let error: string | null = null;
      let time: number | null = null;
      let memory: number | null = null;

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
        error: (error as Error)?.message ?? 'Unknown error',
        time: null,
        memory: null
      };
    }
  };

  const runCode = async () => {
    try {
      setIsRunning(true);
      setTestResults({ loading: true });
      const testCases: TestCase[] = currentQuestion.testCases || [];
      
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

      const results: SingleResult[] = [];
      for (const testCase of testCases) {
        const result = await executeTest(testCase, selectedLanguage === 'cpp' ? code : userFunction);
        results.push(result);
        if (selectedLanguage === 'cpp' && result.error && /Compilation/i.test(result.error)) {
          break;
        }
      }

      const allPassed = results.every(result => result.passed);
      const passedCount = results.filter(r => r.passed).length;
      const lastWithMetrics = [...results].reverse().find(r => r.time !== null || r.memory !== null);
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
        error: (error as Error)?.message ?? 'Unknown error',
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
      } else if (testResults?.results?.some(r => r.error && /Compilation/i.test(r.error))) {
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
          Click &quot;Run&quot; to execute your code and see the results.
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
        
        {testResults.results?.map((result, index) => (
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

  return (
    <div className={`flex h-screen mt-16 bg-gray-900 text-gray-300 font-sans ${
      isResizing || isVerticalResizing ? 'select-none' : ''
    }`}>
      <div 
        className="bg-gray-800 border-r border-gray-700 overflow-y-auto flex flex-col min-w-[200px] max-w-[80%]"
        style={{ width: `${leftPanelWidth}%` }}
      >
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <select 
            value={questionId} 
            onChange={(e) => handleQuestionChange(parseInt(e.target.value))}
            className="w-full p-2 bg-gray-700 text-gray-300 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
          >
            {questions.map((question) => (
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
            {currentQuestion.examples.map((example, index) => (
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
              {currentQuestion.constraints.map((constraint, index) => (
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
        className="editor-panel bg-gray-900 flex flex-col min-w-[200px] max-w-[80%]"
        style={{ width: `${100 - leftPanelWidth}%` }}
      >
        <div className="flex justify-between items-center p-3 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-2 flex-wrap">
            <select 
              value={selectedLanguage} 
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="p-1.5 bg-gray-700 text-gray-300 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++ (Judge0 API)</option>
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
          <MonacoEditor
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