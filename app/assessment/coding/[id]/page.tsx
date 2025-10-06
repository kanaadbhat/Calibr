// "use client";

// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import dynamic from 'next/dynamic';
// import questions from '../questions.json';
// import { saveCodingSubmission, fetchCodingRoundById } from '../actions';
// import { useRouter } from 'next/navigation';

// const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false }) as React.ComponentType<any>;

// type Language = 'javascript' | 'python' | 'java' | 'cpp';

// type TestCase = { input: Record<string, any>; expected: any };
// type Question = {
//   id: number; title: string; difficulty: string; description: string; constraints: string[];
//   examples: Array<{ input: unknown; output: unknown; explanation?: string }>;
//   starterCode: Record<string, string>;
//   testCases: TestCase[];
//   executionConfig: { functionName: string; className?: string; cppTestTemplate: string; cppIncludes?: string[] };
// };

// type SingleResult = { input: any; expected: any; actual: any; passed: boolean; error: string | null; time: number | null; memory: number | null };

// export default function CodingRoundClient({ params }: { params: { id: string } }) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [roundMeta, setRoundMeta] = useState<{ id: string; duration: number; jobId: string; assessmentId: string | null } | null>(null);

//   const [questionId, setQuestionId] = useState<number>(1);
//   const [selectedLanguage, setSelectedLanguage] = useState<Language>('javascript');
//   const [code, setCode] = useState<string>('');
//   const [isRunning, setIsRunning] = useState(false);
//   const [testResults, setTestResults] = useState<SingleResult[] | null>(null);
//   const [leftPanelWidth, setLeftPanelWidth] = useState<number>(45);
//   const [outputPanelHeight, setOutputPanelHeight] = useState<number>(35);
//   const [isResizing, setIsResizing] = useState(false);
//   const [isVerticalResizing, setIsVerticalResizing] = useState(false);
//   const [fontSize, setFontSize] = useState(14);

//   const allQuestions = useMemo(() => questions as Question[], []);
//   const currentQuestion = useMemo(() => allQuestions.find(q => q.id === questionId) || allQuestions[0], [allQuestions, questionId]);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetchCodingRoundById(params.id);
//         if (!res.success) {
//           setError(res.message || 'Failed to load round');
//           setLoading(false);
//           return;
//         }
//         const round = res.data as any;
//         setRoundMeta({ id: params.id, duration: round.duration || 60, jobId: (round as any).assessmentId ? '' : '', assessmentId: (round as any).assessmentId || null });
//       } catch (e: any) {
//         setError(e?.message || 'Failed to load round');
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [params.id]);

//   useEffect(() => {
//     const lsKey = `pg_code_q${questionId}_${selectedLanguage}`;
//     const saved = typeof window !== 'undefined' ? localStorage.getItem(lsKey) : null;
//     if (saved !== null) setCode(saved);
//     else if (currentQuestion?.starterCode?.[selectedLanguage]) setCode(currentQuestion.starterCode[selectedLanguage]);
//   }, [questionId, selectedLanguage, currentQuestion]);

//   const handleMouseDown = () => setIsResizing(true);
//   const handleMouseMove = useCallback((e: MouseEvent) => {
//     if (!isResizing) return;
//     const containerWidth = window.innerWidth;
//     const newLeftWidth = (e.clientX / containerWidth) * 100;
//     if (newLeftWidth >= 20 && newLeftWidth <= 80) setLeftPanelWidth(newLeftWidth);
//   }, [isResizing]);
//   const handleMouseUp = useCallback(() => setIsResizing(false), []);
//   const handleVerticalMouseDown = () => setIsVerticalResizing(true);
//   const handleVerticalMouseMove = useCallback((e: MouseEvent) => {
//     if (!isVerticalResizing) return;
//     const panel = document.querySelector('.editor-panel') as HTMLElement | null;
//     if (!panel) return;
//     const rect = panel.getBoundingClientRect();
//     const header = 60;
//     const available = rect.height - header;
//     const relativeY = e.clientY - rect.top - header;
//     const newHeight = ((available - relativeY) / available) * 100;
//     if (newHeight >= 20 && newHeight <= 80) setOutputPanelHeight(newHeight);
//   }, [isVerticalResizing]);
//   const handleVerticalMouseUp = useCallback(() => setIsVerticalResizing(false), []);

//   useEffect(() => {
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

//   useEffect(() => {
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

//   const getMonacoLanguage = (language: Language) => ({ cpp: 'cpp', javascript: 'javascript', python: 'python', java: 'java' }[language] || 'javascript');

//   const runCpp = async (userCode: string, tc: TestCase) => {
//     // For simplicity, skip real compilation here; integrate Judge0 as needed
//     return { result: tc.expected, time: null, memory: null, error: null };
//   };

//   const runAll = async () => {
//     if (!currentQuestion) return;
//     setIsRunning(true);
//     const results: SingleResult[] = [];
//     for (const tc of currentQuestion.testCases) {
//       try {
//         let actual: any = null; let error: string | null = null; let time: number | null = null; let memory: number | null = null;
//         if (selectedLanguage === 'javascript') {
//           const m = code.match(/var\s+\w+\s*=\s*function\s*\([^)]*\)\s*{[\s\S]*}/);
//           let fn: any = () => null;
//           if (m) { try { eval(`fn = ${m[0]}`); } catch { fn = () => null; } }
//           actual = fn(tc.input.nums ?? tc.input.s ?? tc.input.arr, tc.input.target ?? tc.input.k);
//         } else if (selectedLanguage === 'cpp') {
//           const r = await runCpp(code, tc); actual = r.result; time = r.time; memory = r.memory; error = r.error;
//         } else {
//           // mock
//           actual = tc.expected;
//         }
//         const passed = !error && JSON.stringify(actual) === JSON.stringify(tc.expected);
//         results.push({ input: tc.input, expected: tc.expected, actual, passed, error, time, memory });
//       } catch (e: any) {
//         results.push({ input: tc.input, expected: tc.expected, actual: null, passed: false, error: e?.message || 'Error', time: null, memory: null });
//       }
//     }
//     setTestResults(results);
//     setIsRunning(false);
//   };

//   const submit = async () => {
//     if (!roundMeta || !currentQuestion) return;
//     await runAll();
//     const passed = (testResults || []).every(r => r.passed);
//     const res = await saveCodingSubmission({
//       jobId: roundMeta.jobId,
//       codingRoundId: roundMeta.id,
//       assessmentId: roundMeta.assessmentId,
//       questionId: currentQuestion.id,
//       language: selectedLanguage,
//       code,
//       results: testResults,
//       passed
//     });
//     if (!res.success) alert(res.message || 'Failed to save'); else alert('Submission saved');
//   };

//   if (loading) return <div className="mt-24 text-center text-white">Loading...</div>;
//   if (error) return <div className="mt-24 text-center text-red-500">{error}</div>;

//   return (
//     <div className={`flex h-screen mt-16 bg-gray-900 text-gray-300 font-sans ${isResizing || isVerticalResizing ? 'select-none' : ''}`}>
//       <div className="bg-gray-800 border-r border-gray-700 overflow-y-auto flex flex-col min-w-[200px] max-w-[80%]" style={{ width: `${leftPanelWidth}%` }}>
//         <div className="p-4 border-b border-gray-700 bg-gray-800">
//           <select value={questionId} onChange={e => setQuestionId(parseInt(e.target.value))} className="w-full p-2 bg-gray-700 text-gray-300 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500">
//             {(allQuestions).map(q => <option key={q.id} value={q.id}>{q.id}. {q.title}</option>)}
//           </select>
//         </div>
//         <div className="p-5 flex-1">
//           <div className="flex items-center gap-3 mb-5">
//             <h2 className="text-xl font-semibold m-0">{currentQuestion.title}</h2>
//             <span className="px-3 py-1 rounded-full text-white text-xs font-medium uppercase" style={{ backgroundColor: { easy: '#00b8a3', medium: '#ffc01e', hard: '#ff375f' }[currentQuestion.difficulty.toLowerCase()] || '#666' }}>{currentQuestion.difficulty}</span>
//           </div>
//           <div className="mb-6 leading-relaxed"><p className="text-sm m-0">{currentQuestion.description}</p></div>
//           <div className="mb-6">
//             <h3 className="text-base font-semibold text-white mb-4">Examples:</h3>
//             {currentQuestion.examples.map((ex, i) => (
//               <div key={i} className="mb-4 p-4 bg-gray-900 rounded-lg border-l-4 border-blue-500">
//                 <h4 className="text-sm font-semibold text-white mb-2 m-0">Example {i + 1}:</h4>
//                 <div className="text-sm space-y-1">
//                   <div><strong>Input:</strong> {typeof ex.input === 'string' ? ex.input : JSON.stringify(ex.input)}</div>
//                   <div><strong>Output:</strong> {typeof ex.output === 'string' ? ex.output : JSON.stringify(ex.output)}</div>
//                   {ex.explanation && <div><strong>Explanation:</strong> {ex.explanation}</div>}
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div>
//             <h3 className="text-base font-semibold text-white mb-3">Constraints:</h3>
//             <ul className="space-y-2">{currentQuestion.constraints.map((c, i) => <li key={i} className="text-sm">{c}</li>)}</ul>
//           </div>
//         </div>
//       </div>

//       <div className={`w-1 bg-gray-700 cursor-col-resize relative z-10 transition-colors hover:bg-blue-500 ${isResizing ? 'bg-blue-500' : ''}`} onMouseDown={handleMouseDown} />

//       <div className="editor-panel bg-gray-900 flex flex-col min-w-[200px] max-w-[80%]" style={{ width: `${100 - leftPanelWidth}%` }}>
//         <div className="flex justify-between items-center p-3 bg-gray-800 border-b border-gray-700">
//           <div className="flex items-center gap-2 flex-wrap">
//             <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value as Language)} className="p-1.5 bg-gray-700 text-gray-300 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500">
//               <option value="javascript">JavaScript</option>
//               <option value="python">Python</option>
//               <option value="java">Java</option>
//               <option value="cpp">C++</option>
//             </select>
//           </div>
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-1.5">
//               <label className="text-xs text-gray-400">Font Size:</label>
//               <select value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="p-1 bg-gray-700 text-gray-300 border border-gray-600 rounded text-xs focus:outline-none focus:border-blue-500 min-w-[60px]">
//                 {[10,11,12,13,14,15,16,17,18,20,22,24].map(v => <option key={v} value={v}>{v}px</option>)}
//               </select>
//             </div>
//           </div>
//           <div className="flex gap-3">
//             <button onClick={runAll} disabled={isRunning} className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${isRunning ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
//               <span>Run</span>
//             </button>
//             <button onClick={submit} disabled={isRunning} className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${isRunning ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white`}>
//               <span>Submit</span>
//             </button>
//           </div>
//         </div>

//         <div className="bg-gray-900 overflow-hidden border-b border-gray-700" style={{ height: `${100 - outputPanelHeight}%` }}>
//           <MonacoEditor height="100%" language={getMonacoLanguage(selectedLanguage)} value={code} onChange={(v: string) => setCode(v || '')} theme="vs-dark" options={{ fontSize, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true, tabSize: 2, insertSpaces: true }} />
//         </div>

//         <div className={`h-1 bg-gray-700 cursor-row-resize relative z-10 transition-colors hover:bg-blue-500 ${isVerticalResizing ? 'bg-blue-500' : ''}`} onMouseDown={handleVerticalMouseDown} />

//         <div className="bg-gray-900 flex flex-col min-h-[100px] max-h-[80%]" style={{ height: `${outputPanelHeight}%` }}>
//           <div className="p-3 bg-gray-800 border-b border-gray-700">Test Results</div>
//           <div className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed">
//             {!testResults && <div className="p-5 text-center text-gray-400">Click "Run" to execute your code.</div>}
//             {testResults && testResults.map((r, i) => (
//               <div key={i} className={`mb-4 p-3 rounded-lg border-l-4 ${r.passed ? 'bg-green-500/10 border-l-green-500' : 'bg-red-500/10 border-l-red-500'}`}>
//                 <div className="flex items-center gap-2 mb-2 font-semibold">
//                   <span>Test Case {i + 1}</span>
//                   <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${r.passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{r.passed ? 'Passed' : 'Failed'}</span>
//                 </div>
//                 <div className="text-sm text-gray-300 space-y-1">
//                   <div><strong>Input:</strong> {JSON.stringify(r.input)}</div>
//                   <div><strong>Expected:</strong> {JSON.stringify(r.expected)}</div>
//                   <div><strong>Output:</strong> {JSON.stringify(r.actual)}</div>
//                   {r.error && <div className="mt-2"><strong>Error:</strong> <div className="mt-1 p-2 bg-red-900/30 border border-red-500/30 rounded text-red-400 font-mono text-xs whitespace-pre-wrap overflow-x-auto">{r.error}</div></div>}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



