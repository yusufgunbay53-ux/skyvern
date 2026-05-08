# Skyvern UI Integration Bridge for Auotobot

This directory contains the necessary components to integrate the **Auotobot** UI with the **Skyvern** autonomous browser engine.

## Components

### 1. `SkyvernClient.ts`
A TypeScript client that maps to Skyvern's API endpoints. It includes:
- `runTask`: Starts an autonomous task (Task V2).
- `runAction`: Executes a single AI-driven action (Click, Type, etc.).
- `getTaskStatus`: Polls for the status of a running task.

### 2. `useSkyvernTask.ts`
A React-compatible hook for managing the asynchronous lifecycle of a task. It provides:
- `runTask`: A function to trigger the task.
- `loading`: A boolean indicating if the task is in progress.
- `status`: The current state of the task (`running`, `completed`, `failed`, etc.).
- `result`: The output or response from Skyvern.
- `error`: Any error messages encountered during execution.

## How to Integrate

### Autonomous Workflow Integration
To connect an "Execute" button in Auotobot to Skyvern's autonomous engine:

```tsx
import { useSkyvernTask } from './auotobot-integration/useSkyvernTask';

const AuotobotPanel = () => {
  const { runTask, loading, status, result, error } = useSkyvernTask({
    baseUrl: 'https://your-skyvern-instance.com',
    apiKey: 'your-api-key'
  });

  const handleExecute = () => {
    runTask({
      user_prompt: "Login to GitHub and check my notifications",
      url: "https://github.com/login"
    });
  };

  return (
    <div>
      <button onClick={handleExecute} disabled={loading}>
        {loading ? `Running (${status})` : 'Start Automation'}
      </button>
      {error && <p className="error">{error}</p>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
};
```

### Single Action Integration
For interactive buttons (like "Click here" or "Fill this") that should use Skyvern's AI logic:

```tsx
import { SkyvernClient } from './auotobot-integration/SkyvernClient';

const client = new SkyvernClient('https://your-skyvern-instance.com', 'your-api-key');

const handleAiClick = async (selector: string, goal: string) => {
  const response = await client.runAction({
    url: window.location.href,
    action: {
      type: 'ai_click',
      selector: selector,
      intention: goal
    }
  });
  console.log('Action initiated:', response.workflow_run_id);
};
```

## Notes
- Ensure that the `baseUrl` and `apiKey` are correctly configured in your environment variables.
- The `useSkyvernTask` hook uses a 3-second polling interval by default, which can be customized in the options.
