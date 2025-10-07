import ExamProtectionWrapper from '@/lib/ExamProtectionWrapper';
import CountdownWrapper from '@/lib/CountdownWrapper'

export default function TestPage() {
  return (
    
    <ExamProtectionWrapper
      tabSwitchLimit={4}
      fullscreenExitLimit={4}
      countdownSeconds={15}
    >

      <CountdownWrapper startTime={new Date('2025-10-07T15:00:00')} durationMinutes={30}>
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Online Assessment</h1>
        <p>Answer the questions below carefully. Do not switch tabs or exit fullscreen.</p>
      </div>
      </CountdownWrapper>
    </ExamProtectionWrapper>
    

  );
}