import { useState, useCallback, useRef } from 'react';
import { SkyvernClient, TaskV2Request, TaskV2Response, TaskV2Status } from './SkyvernClient';

interface UseSkyvernTaskOptions {
  baseUrl: string;
  apiKey: string;
  pollingInterval?: number; // in milliseconds
}

export function useSkyvernTask(options: UseSkyvernTaskOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TaskV2Response | null>(null);
  const [status, setStatus] = useState<TaskV2Status | null>(null);

  const clientRef = useRef(new SkyvernClient(options.baseUrl, options.apiKey));
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(async (taskId: string) => {
    stopPolling();

    pollingTimerRef.current = setInterval(async () => {
      try {
        const taskResponse = await clientRef.current.getTaskStatus(taskId);
        setStatus(taskResponse.status);
        setResult(taskResponse);

        if (taskResponse.status === 'completed' || taskResponse.status === 'failed' ||
            taskResponse.status === 'terminated' || taskResponse.status === 'canceled' ||
            taskResponse.status === 'timed_out') {
          stopPolling();
          setLoading(false);

          if (taskResponse.status === 'failed' || taskResponse.status === 'terminated') {
            setError(taskResponse.failure_reason || 'Task failed without a specific reason.');
          }
        }
      } catch (err: any) {
        stopPolling();
        setLoading(false);
        setError(`Polling error: ${err.message}`);
      }
    }, options.pollingInterval || 3000);
  }, [options.pollingInterval, stopPolling]);

  const runTask = useCallback(async (request: TaskV2Request) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setStatus('created');

    try {
      const initialResponse = await clientRef.current.runTask(request);
      setResult(initialResponse);
      setStatus(initialResponse.status);

      if (initialResponse.task_id) {
        pollStatus(initialResponse.task_id);
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      setLoading(false);
      setError(`Execution error: ${err.message}`);
    }
  }, [pollStatus]);

  return {
    runTask,
    loading,
    error,
    result,
    status,
    stopPolling
  };
}
