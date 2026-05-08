import React, { useState } from 'react';
import { useSkyvernTask } from '../../hooks/useSkyvernTask';
import { apiBaseUrl, getRuntimeApiKey } from '../../util/env';

export const AuotobotDashboard: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [url, setUrl] = useState('');

  const { runTask, loading, status, result, error } = useSkyvernTask({
    baseUrl: apiBaseUrl,
    apiKey: getRuntimeApiKey() || ''
  });

  const handleRun = () => {
    if (!prompt) return;
    runTask({
      user_prompt: prompt,
      url: url || undefined
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Auotobot Autonomous Engine</h1>
        <p className="text-slate-400">Powered by Skyvern. Enter a goal and let the agent handle the rest.</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Target URL (Optional)</label>
          <input
            type="text"
            placeholder="https://example.com"
            className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">What should Auotobot do?</label>
          <textarea
            placeholder="e.g. Find the price of the latest iPhone on Amazon and let me know."
            className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white h-32"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <button
          onClick={handleRun}
          disabled={loading || !prompt}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {loading ? `Executing: ${status}...` : 'Launch Autonomous Agent'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900 text-red-400 p-4 rounded-lg mb-8">
          <p className="font-bold">Error encountered:</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Live Execution Results</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Task ID:</span>
              <span className="font-mono text-blue-400">{result.task_id}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Current Status:</span>
              <span className={`font-bold ${status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                {status?.toUpperCase()}
              </span>
            </div>
            {result.output && (
              <div className="mt-4">
                <p className="text-slate-400 mb-2">Extracted Data / Output:</p>
                <pre className="bg-black p-4 rounded border border-slate-800 overflow-x-auto text-sm text-green-500">
                  {JSON.stringify(result.output, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
