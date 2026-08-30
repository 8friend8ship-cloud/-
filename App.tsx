import React from 'react';
import { Activity, AlertTriangle, CheckCircle2, Database, GitBranch, ShieldCheck } from 'lucide-react';

type Gate = {
  name: string;
  state: 'READY' | 'HOLD';
  detail: string;
};

const gates: Gate[] = [
  { name: 'Source identity', state: 'READY', detail: 'GitHub source is registered. No Production runtime is inferred from source presence.' },
  { name: 'Central state adapter', state: 'HOLD', detail: 'Read-only central status adapter is not connected yet.' },
  { name: 'Media source', state: 'HOLD', detail: 'No verified local/Drive media receipt is attached.' },
  { name: 'Metadata / transcript', state: 'HOLD', detail: 'No verified backend result is available. Synthetic metadata and transcripts are disabled.' },
  { name: 'Render / publish', state: 'HOLD', detail: 'No render or publishing target is approved. No simulated completion is allowed.' },
  { name: 'Auth / provider actions', state: 'HOLD', detail: 'Browser OAuth, API keys, comments and provider writes are disabled until an approved server-side contract exists.' },
];

const App: React.FC = () => {
  return (
    <main className="min-h-screen bg-dark-900 text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="border border-gray-800 bg-dark-950 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20">
              <Activity className="w-7 h-7 text-brand-400" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-mono text-brand-400">P11_CLIPSTREAM · READONLY_SOURCE_HARDENING</p>
              <h1 className="text-2xl md:text-3xl font-bold">ClipStream Pipeline Status</h1>
              <p className="text-sm text-gray-400 max-w-3xl">
                This surface reports verified pipeline gates only. It does not invent metadata, transcripts, comments, downloads, renders, logins, or successful provider actions.
              </p>
            </div>
          </div>
        </header>

        <section className="grid md:grid-cols-3 gap-4">
          <div className="bg-dark-950 border border-gray-800 rounded-xl p-5">
            <GitBranch className="w-5 h-5 text-gray-400 mb-3" />
            <p className="text-xs text-gray-500">SOURCE MODE</p>
            <p className="font-semibold mt-1">GitHub / non-production</p>
          </div>
          <div className="bg-dark-950 border border-gray-800 rounded-xl p-5">
            <Database className="w-5 h-5 text-gray-400 mb-3" />
            <p className="text-xs text-gray-500">RUNTIME MODE</p>
            <p className="font-semibold mt-1">Not connected</p>
          </div>
          <div className="bg-dark-950 border border-gray-800 rounded-xl p-5">
            <ShieldCheck className="w-5 h-5 text-gray-400 mb-3" />
            <p className="text-xs text-gray-500">WRITE POLICY</p>
            <p className="font-semibold mt-1">Fail closed / no provider writes</p>
          </div>
        </section>

        <section className="bg-dark-950 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="font-semibold">Verification gates</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {gates.map((gate) => (
              <div key={gate.name} className="p-5 flex gap-4 items-start">
                {gate.state === 'READY' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{gate.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300">{gate.state}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{gate.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="text-xs text-gray-500 text-center">
          A gate may become READY only after matching source/runtime evidence is read back. Source code or a build alone is not runtime verification.
        </p>
      </div>
    </main>
  );
};

export default App;
