// import React from 'react';
// import RoleWrapper from '@/lib/RoleWrapper';
// import { getCandidateCodingEligibility } from './actions';
// import JobOpportunityModel from '@/models/jobOpportunity.model';

//   // Load persisted UI state on mount
//   useEffect(() => {
//     try {
//       const savedLanguage = localStorage.getItem('pg_language');
//       const savedFontSize = localStorage.getItem('pg_fontSize');
//       const savedLeftWidth = localStorage.getItem('pg_leftPanelWidth');
//       const savedOutputHeight = localStorage.getItem('pg_outputPanelHeight');
//       if (savedLanguage && ['javascript', 'python', 'java', 'cpp'].includes(savedLanguage)) {
//         setSelectedLanguage(savedLanguage as Language);
//       }
//       if (savedFontSize) setFontSize(parseInt(savedFontSize));
//       if (savedLeftWidth) setLeftPanelWidth(parseFloat(savedLeftWidth));
//       if (savedOutputHeight) setOutputPanelHeight(parseFloat(savedOutputHeight));
//     } catch {
//       // Ignore localStorage errors
//     }
//   }, []);

//   // Load starter or persisted code when question/language changes
//   useEffect(() => {
//     const lsKey = `pg_code_q${questionId}_${selectedLanguage}`;
//     const savedCode = localStorage.getItem(lsKey);
//     if (savedCode !== null) {
//       setCode(savedCode);
//     } else if (currentQuestion && currentQuestion.starterCode[selectedLanguage]) {
//       setCode(currentQuestion.starterCode[selectedLanguage]);
//     }
//   }, [questionId, selectedLanguage, currentQuestion]);

//   const handleQuestionChange = (id: number) => {
//     setQuestionId(id);
//   };

//   const handleLanguageChange = (language: string) => {
//     if (['javascript', 'python', 'java', 'cpp'].includes(language)) {
//       setSelectedLanguage(language as Language);
//       try { localStorage.setItem('pg_language', language); } catch {
//         // Ignore localStorage errors
//       }
//     }
//   };

//   const handleCodeChange = (value?: string) => {
//     const val = value ?? '';
//     setCode(val);
//     try {
//       const lsKey = `pg_code_q${questionId}_${selectedLanguage}`;
//       localStorage.setItem(lsKey, val);
//     } catch {
//       // Ignore localStorage errors
//     }
//   };

//   const handleFontSizeChange = (size: string) => {
//     const parsed = parseInt(size);
//     setFontSize(parsed);
//     try { localStorage.setItem('pg_fontSize', String(parsed)); } catch {
//       // Ignore localStorage errors
//     }
//   };

//   const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
//     setIsResizing(true);
//     e.preventDefault();
//   };

//   const handleMouseMove = useCallback((e: MouseEvent) => {
//     if (!isResizing) return;
    
//     const containerWidth = window.innerWidth;
//     const newLeftWidth = (e.clientX / containerWidth) * 100;
    
//     if (newLeftWidth >= 20 && newLeftWidth <= 80) {
//       setLeftPanelWidth(newLeftWidth);
//       try { localStorage.setItem('pg_leftPanelWidth', String(newLeftWidth)); } catch {
//         // Ignore localStorage errors
//       }
//     }
//   }, [isResizing]);

//   const handleMouseUp = useCallback(() => {
//     setIsResizing(false);
//   }, []);

//   const handleVerticalMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
//     setIsVerticalResizing(true);
//     e.preventDefault();
//   };

//   const handleVerticalMouseMove = useCallback((e: MouseEvent) => {
//     if (!isVerticalResizing) return;
    
//     const target = e.target as HTMLElement | null;
//     const editorPanel = target?.closest?.('.editor-panel') as HTMLElement | null;
//     if (!editorPanel) return;
    
//     const editorPanelRect = editorPanel.getBoundingClientRect();
//     const editorHeaderHeight = 60;
//     const availableHeight = editorPanelRect.height - editorHeaderHeight;
//     const relativeY = e.clientY - editorPanelRect.top - editorHeaderHeight;
//     const newOutputHeight = ((availableHeight - relativeY) / availableHeight) * 100;
    
//     if (newOutputHeight >= 20 && newOutputHeight <= 80) {
//       setOutputPanelHeight(newOutputHeight);
//       try { localStorage.setItem('pg_outputPanelHeight', String(newOutputHeight)); } catch {
//         // Ignore localStorage errors
//       }
//     }
//   }, [isVerticalResizing]);

//   const handleVerticalMouseUp = useCallback(() => {
//     setIsVerticalResizing(false);
//   }, []);

//   React.useEffect(() => {
//     if (isResizing) {
//       document.addEventListener('mousemove', handleMouseMove);
//       document.addEventListener('mouseup', handleMouseUp);
//     } else {
//       document.removeEventListener('mousemove', handleMouseMove);
//       document.removeEventListener('mouseup', handleMouseUp);
//     }

//     return () => {
//       document.removeEventListener('mousemove', handleMouseMove);
//       document.removeEventListener('mouseup', handleMouseUp);
//     };
//   }, [isResizing, handleMouseMove, handleMouseUp]);

//   React.useEffect(() => {
//     if (isVerticalResizing) {
//       document.addEventListener('mousemove', handleVerticalMouseMove);
//       document.addEventListener('mouseup', handleVerticalMouseUp);
//     } else {
//       document.removeEventListener('mousemove', handleVerticalMouseMove);
//       document.removeEventListener('mouseup', handleVerticalMouseUp);
//     }

//     return () => {
//       document.removeEventListener('mousemove', handleVerticalMouseMove);
//       document.removeEventListener('mouseup', handleVerticalMouseUp);
//     };
//   }, [isVerticalResizing, handleVerticalMouseMove, handleVerticalMouseUp]);

//   const getMonacoLanguage = (language: Language): string => {
//     const languageMap: Record<Language, string> = {
//       cpp: 'cpp',
//       javascript: 'javascript',
//       python: 'python',
//       java: 'java'
//     };
//     return languageMap[language] || 'javascript';
//   };

//   const getDifficultyColor = (difficulty: string): string => {
//     const colorMap: Record<string, string> = {
//       easy: '#00b8a3',
//       medium: '#ffc01e',
//       hard: '#ff375f'
//     };
//     return colorMap[difficulty.toLowerCase()] || '#666';
//   };

//   const compileCppCode = async (code: string, input: string) => {
//     try {
//       const baseUrl = process.env.NEXT_PUBLIC_JUDGE0_BASE_URL || 'http://localhost:2358';
//       const submissionData = {
//         language_id: 54,
//         source_code: btoa(code),
//         stdin: btoa(input || ''),
//         expected_output: null
//       };

//       const response = await axios.post(
//         `${baseUrl}/submissions?base64_encoded=true&wait=false&fields=*`,
//         submissionData,
//         { headers: { 'Content-Type': 'application/json' } }
//       );

//       const token = response.data.token;
//       let result: any;
//       let attempts = 0;
//       const maxAttempts = 15;

//       while (attempts < maxAttempts) {
//         await new Promise(resolve => setTimeout(resolve, 1000));

//         const resultResponse = await axios.get(
//           `${baseUrl}/submissions/${token}?base64_encoded=true&fields=*`
//         );

//         result = resultResponse.data;
//         if (result.stdout) result.stdout = atob(result.stdout);
//         if (result.stderr) result.stderr = atob(result.stderr);
//         if (result.compile_output) result.compile_output = atob(result.compile_output);

//         if (result.status && result.status.id > 2) {
//           break;
//         }

//         attempts++;
//       }

//       if (!result || (result.status && result.status.id <= 2)) {
//         return {
//           stdout: null,
//           stderr: null,
//           compile_output: 'Execution timed out while waiting for result',
//           status: { id: 13, description: 'Internal Error / Timeout' }
//         };
//       }

//       return result;
//     } catch (error) {
//       console.error('C++ Compilation Error:', error);
//       return {
//         stdout: null,
//         stderr: null,
//         compile_output: 'API connection failed',
//         status: { id: 6, description: 'Compilation Error' }
//       };
//     }
//   };

//   const generateCppTestCode = (userCode: string, testCase: TestCase): string => {
//     const config = currentQuestion.executionConfig;
//     const includes = config.cppIncludes || ['iostream', 'vector'];
    
//     let includeStatements = includes.map(inc => `#include <${inc}>`).join('\n');
//     includeStatements += '\nusing namespace std;\n\n';

//     // Replace template placeholders with actual values
//     let testBody = config.cppTestTemplate;
    
//     // Handle nested properties like input.nums, input.target
//     testBody = testBody.replace(/\$\{input\.(\w+)\}/g, (_match, prop) => {
//       const value = testCase.input[prop];
//       if (Array.isArray(value)) {
//         return value.join(', ');
//       }
//       if (typeof value === 'string') {
//         return value;
//       }
//       return value;
//     });

//     return `${includeStatements}${userCode}\n\nint main() {\n${testBody}\n    return 0;\n}`;
//   };

//   const executeTest = async (testCase: TestCase, userCode: any): Promise<SingleResult> => {
//     try {
//       const { input, expected } = testCase;
//       let result: any;
//       let error: string | null = null;
//       let time: number | null = null;
//       let memory: number | null = null;

//       if (selectedLanguage === 'cpp') {
//         const completeCode = generateCppTestCode(userCode, testCase);
//         const compilationResult = await compileCppCode(completeCode, '');
        
//         if (compilationResult.status && compilationResult.status.id === 6) {
//           error = compilationResult.compile_output || 'Compilation failed';
//           result = null;
//         } else if (compilationResult.stderr && compilationResult.stderr.trim() !== '') {
//           error = compilationResult.stderr;
//           result = null;
//         } else if (compilationResult.status && compilationResult.status.id !== 3) {
//           error = compilationResult.status.description || 'Execution failed';
//           result = null;
//         } else if (compilationResult.stdout) {
//           try {
//             result = JSON.parse(compilationResult.stdout.trim());
//           } catch {
//             result = compilationResult.stdout.trim();
//           }
//         } else {
//           result = null;
//         }

//         if (typeof compilationResult?.time !== 'undefined') time = compilationResult.time;
//         if (typeof compilationResult?.memory !== 'undefined') memory = compilationResult.memory;
//       } else {
//         // For non-C++ languages, check if code is placeholder
//         if (userCode.toString().includes('// Your code here') || 
//             userCode.toString().includes('# Your code here') || 
//             userCode.toString().includes('pass')) {
//           result = null;
//         } else {
//           // Mock execution - in real implementation, call backend
//           result = expected;
//         }
//       }

//       const passed = !error && JSON.stringify(result) === JSON.stringify(expected);
      
//       return {
//         input,
//         expected,
//         actual: result,
//         passed,
//         error,
//         time,
//         memory
//       };
//     } catch (error) {
//       return {
//         input: testCase.input,
//         expected: testCase.expected,
//         actual: null,
//         passed: false,
//         error: (error as Error)?.message ?? 'Unknown error',
//         time: null,
//         memory: null
//       };
//     }
//   };

//   const runCode = async () => {
//     try {
//       setIsRunning(true);
//       setTestResults({ loading: true });
//       const testCases: TestCase[] = currentQuestion.testCases || [];
      
//       let userFunction;
//       if (selectedLanguage === 'javascript') {
//         const functionMatch = code.match(/var\s+\w+\s*=\s*function\s*\([^)]*\)\s*{[\s\S]*}/);
//         if (functionMatch) {
//           try {
//             // eslint-disable-next-line no-eval
//             eval(`userFunction = ${functionMatch[0]}`);
//           } catch {
//             userFunction = () => null;
//           }
//         } else {
//           userFunction = () => null;
//         }
//       } else {
//         userFunction = { toString: () => code };
//       }

//       const results: SingleResult[] = [];
//       for (const testCase of testCases) {
//         const result = await executeTest(testCase, selectedLanguage === 'cpp' ? code : userFunction);
//         results.push(result);
//         if (selectedLanguage === 'cpp' && result.error && /Compilation/i.test(result.error)) {
//           break;
//         }
//       }

//       const allPassed = results.every(result => result.passed);
//       const passedCount = results.filter(r => r.passed).length;
//       const lastWithMetrics = [...results].reverse().find(r => r.time !== null || r.memory !== null);
//       const lastTime = lastWithMetrics?.time ?? null;
//       const lastMemory = lastWithMetrics?.memory ?? null;
      
//       setTestResults({
//         results,
//         allPassed,
//         totalTests: results.length,
//         passedTests: passedCount,
//         lastTime,
//         lastMemory,
//         loading: false
//       });
      
//       setActiveTab('testcase');
//     } catch (error) {
//       setTestResults({
//         results: [],
//         allPassed: false,
//         totalTests: 0,
//         passedTests: 0,
//         error: (error as Error)?.message ?? 'Unknown error',
//         loading: false
//       });
//     }
//     setIsRunning(false);
//   };

//   const submitCode = async () => {
//     await runCode();
//     setTimeout(() => {
//       if (testResults && testResults.allPassed) {
//         alert('🎉 Accepted! All test cases passed!');
//       } else if (testResults?.results?.some(r => r.error && /Compilation/i.test(r.error))) {
//         alert('❌ Compilation Error. Please fix the errors and try again.');
//       } else {
//         alert('❌ Wrong Answer. Please check your solution.');
//       }
//     }, 100);
//   };

//   const renderTestResults = () => {
//     if (!testResults) {
//       return (
//         <div className="p-5 text-center text-gray-400">
//           Click &quot;Run&quot; to execute your code and see the results.
//         </div>
//       );
//     }

//     if (testResults.loading) {
//       return (
//         <div className="p-5 text-center text-blue-400">
//           <div className="mb-2 flex items-center justify-center gap-2">
//             <span className="inline-block w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" style={{animation: 'spin 1s linear infinite'}}></span>
//             <span>Compiling and running your code...</span>
//           </div>
//           {selectedLanguage === 'cpp' && (
//             <div className="text-xs text-gray-400">
//               C++ compilation may take a few seconds
//             </div>
//           )}
//         </div>
//       );
//     }

//     if (testResults.error) {
//       return (
//         <div className="p-5">
//           <div className="bg-red-500/20 text-red-500 border border-red-500 rounded-lg p-3 text-center font-semibold">
//             Runtime Error
//           </div>
//           <div className="text-red-500 font-mono mt-2">
//             Error: {testResults.error}
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div>
//         <div className={`rounded-lg p-3 mb-4 text-center font-semibold border ${
//           testResults.allPassed 
//             ? 'bg-green-500/20 text-green-500 border-green-500' 
//             : 'bg-red-500/20 text-red-500 border-red-500'
//         }`}>
//           {testResults.allPassed ? '✅ Accepted' : '❌ Wrong Answer'}
//           <div className="text-sm mt-1">
//             {testResults.passedTests}/{testResults.totalTests} test cases passed
//           </div>
//           {(typeof testResults.lastMemory !== 'undefined' && testResults.lastMemory !== null) && (
//             <div className="text-xs mt-1 text-gray-300">Memory: {testResults.lastMemory} KB{(typeof testResults.lastTime !== 'undefined' && testResults.lastTime !== null) ? ` · Time: ${testResults.lastTime}s` : ''}</div>
//           )}
//         </div>
        
//         {testResults.results?.map((result, index) => (
//           <div key={index} className={`mb-4 p-3 rounded-lg border-l-4 ${
//             result.passed 
//               ? 'bg-green-500/10 border-l-green-500' 
//               : 'bg-red-500/10 border-l-red-500'
//           }`}>
//             <div className="flex items-center gap-2 mb-2 font-semibold">
//               <span>Test Case {index + 1}</span>
//               <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
//                 result.passed 
//                   ? 'bg-green-500 text-white' 
//                   : 'bg-red-500 text-white'
//               }`}>
//                 {result.passed ? 'Passed' : 'Failed'}
//               </span>
//               {(result.memory !== null || result.time !== null) && (
//                 <span className="ml-auto text-xs text-gray-400">{result.memory !== null ? `${result.memory} KB` : ''}{result.time !== null ? `${result.memory !== null ? ' · ' : ''}${result.time}s` : ''}</span>
//               )}
//             </div>
//             <div className="text-sm text-gray-300 space-y-1">
//               <div><strong>Input:</strong> {JSON.stringify(result.input)}</div>
//               <div><strong>Expected:</strong> {JSON.stringify(result.expected)}</div>
//               <div><strong>Output:</strong> {JSON.stringify(result.actual)}</div>
//               {result.error && (
//                 <div className="mt-2">
//                   <strong>Error:</strong> 
//                   <div className="mt-1 p-2 bg-red-900/30 border border-red-500/30 rounded text-red-400 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
//                     {result.error}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   };

// export default async function CodingStartPage() {
//   const eligibility = await getCandidateCodingEligibility();
//   if (!eligibility.success) {
//     return (
//       <RoleWrapper role="candidate">
//         <div className="mt-24 max-w-2xl mx-auto text-center text-white">
//           <h1 className="text-2xl font-semibold">No coding round available</h1>
//           <p className="text-white/70 mt-2">{eligibility.message || 'You are not shortlisted for any coding round currently.'}</p>
//         </div>
//       </RoleWrapper>
//     );
//   }

//   const job = await JobOpportunityModel.findById(eligibility.data!.jobId).lean();

//   return (
//     <RoleWrapper role="candidate">
//       <div className="mt-24 max-w-3xl mx-auto text-white">
//         <h1 className="text-3xl font-bold">Coding Round</h1>
//         <div className="mt-3 text-white/80">
//           This is a coding round for <span className="font-semibold">{(job as any)?.title || 'Job'}</span>.
//         </div>
//         <div className="mt-6">
//           <a href={`/assessment/coding/${eligibility.data!.codingRoundId}`} className="inline-flex items-center px-4 py-2 rounded bg-blue-600 hover:bg-blue-700">Start</a>
//         </div>
//       </div>
//     </RoleWrapper>
//   );
// }