refs > heimport { AnalysisProgress } from '../AnalysisProgress'
import { useState } from 'react'

export default function AnalysisProgressExample() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(65);

  const handleStart = () => {
    console.log('Análisis iniciado');
    setIsRunning(true);
  };

  const handleStop = () => {
    console.log('Análisis pausado');
    setIsRunning(false);
  };

  const handleRefresh = () => {
    console.log('Datos actualizados');
    setProgress(Math.min(100, progress + 10));
  };

  return (
    <div className="p-4 max-w-lg">
      <AnalysisProgress 
        isRunning={isRunning}
        progress={progress}
        status={isRunning ? "Procesando correos..." : "En espera"}
        emailsProcessed={1234}
        totalEmails={1890}
        onStart={handleStart}
        onStop={handleStop}
        onRefresh={handleRefresh}
      />
    </div>
  )
}