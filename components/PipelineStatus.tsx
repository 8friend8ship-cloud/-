import React from 'react';
import { PipelineStep, StepStatus, Language } from '../types';
import { CheckCircle2, Circle, Loader2, AlertCircle, Terminal } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

interface PipelineStatusProps {
  steps: PipelineStep[];
  lang: Language;
}

const PipelineStatus: React.FC<PipelineStatusProps> = ({ steps, lang }) => {
  const t = (key: keyof typeof TRANSLATIONS['en']) => TRANSLATIONS[lang][key];

  return (
    <div className="bg-dark-800 rounded-xl border border-gray-700 p-6 shadow-xl h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6 text-brand-500">
        <Terminal className="w-5 h-5" />
        <h2 className="text-lg font-semibold tracking-wide uppercase">{t('pipelineExecTitle')}</h2>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2">
        {steps.map((step, index) => (
          <div key={step.id} className="relative pl-8">
            {/* Connector Line */}
            {index !== steps.length - 1 && (
              <div 
                className={`absolute left-[11px] top-6 w-0.5 h-full transition-colors duration-300 ${
                  step.status === StepStatus.COMPLETED ? 'bg-brand-500/30' : 'bg-gray-800'
                }`} 
              />
            )}

            {/* Status Icon */}
            <div className="absolute left-0 top-0.5">
              {step.status === StepStatus.COMPLETED && <CheckCircle2 className="w-6 h-6 text-brand-500" />}
              {step.status === StepStatus.ACTIVE && <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />}
              {step.status === StepStatus.PENDING && <Circle className="w-6 h-6 text-gray-700" />}
              {step.status === StepStatus.ERROR && <AlertCircle className="w-6 h-6 text-red-500" />}
            </div>

            {/* Content */}
            <div className={`transition-opacity duration-300 ${step.status === StepStatus.PENDING ? 'opacity-40' : 'opacity-100'}`}>
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium text-gray-200">{step.label}</h3>
                <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                  step.status === StepStatus.ACTIVE ? 'bg-brand-900/50 text-brand-300' :
                  step.status === StepStatus.COMPLETED ? 'bg-gray-800 text-gray-400' :
                  'text-gray-600'
                }`}>
                  {step.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{step.description}</p>
              
              {/* Logs */}
              {step.logs.length > 0 && (
                <div className="bg-dark-950 rounded border border-gray-800 p-3 font-mono text-xs space-y-1">
                  {step.logs.map((log, i) => (
                    <div key={i} className="text-brand-100/70 border-l-2 border-brand-500/30 pl-2 break-all">
                      <span className="opacity-50 mr-2">{'>'}</span>{log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PipelineStatus;