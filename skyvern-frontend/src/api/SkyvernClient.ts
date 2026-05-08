import axios, { AxiosInstance } from 'axios';

/**
 * TypeScript interfaces based on Skyvern Python schemas
 */

export type TaskV2Status = 'created' | 'queued' | 'running' | 'failed' | 'terminated' | 'canceled' | 'timed_out' | 'completed';

export interface ProxyLocation {
  location?: string;
  [key: string]: any;
}

export interface TaskV2Request {
  user_prompt: string;
  url?: string;
  browser_session_id?: string;
  webhook_callback_url?: string;
  totp_verification_url?: string;
  totp_identifier?: string;
  proxy_location?: ProxyLocation | string;
  publish_workflow?: boolean;
  extracted_information_schema?: any;
  error_code_mapping?: Record<string, string>;
  workflow_system_prompt?: string;
  max_screenshot_scrolls?: number;
  extra_http_headers?: Record<string, string>;
  browser_address?: string;
  run_with?: string;
  ai_fallback?: boolean;
}

export interface TaskV2Response {
  task_id: string;
  status: TaskV2Status;
  organization_id: string;
  workflow_run_id?: string;
  output?: any;
  failure_reason?: string;
}

export type SdkActionType =
  | 'ai_click'
  | 'ai_input_text'
  | 'ai_select_option'
  | 'ai_upload_file'
  | 'ai_act'
  | 'extract'
  | 'locate_element'
  | 'validate'
  | 'prompt';

export interface SdkAction {
  type: SdkActionType;
  selector?: string;
  intention?: string;
  value?: string;
  data?: any;
  timeout?: number;
  file_url?: string;
  prompt?: string;
  extract_schema?: any;
  error_code_mapping?: Record<string, string>;
  model?: any;
  response_schema?: any;
}

export interface RunSdkActionRequest {
  url: string;
  browser_session_id?: string;
  browser_address?: string;
  workflow_run_id?: string;
  action: SdkAction;
}

export interface RunSdkActionResponse {
  workflow_run_id: string;
  result?: any;
}

export class SkyvernClient {
  private client: AxiosInstance;

  constructor(baseUrl: string, apiKey: string) {
    // Normalize baseUrl to strip trailing /api/v1 if present for v2 calls
    const base = baseUrl.replace(/\/api\/v1\/?$/, '');

    this.client = axios.create({
      baseURL: base,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'x-user-agent': 'auotobot-ui',
      },
    });
  }

  /**
   * Starts an autonomous task (Task V2)
   */
  async runTask(request: TaskV2Request): Promise<TaskV2Response> {
    const response = await this.client.post<TaskV2Response>('/api/v2/tasks', request);
    return response.data;
  }

  /**
   * Executes a single SDK action
   */
  async runAction(request: RunSdkActionRequest): Promise<RunSdkActionResponse> {
    const response = await this.client.post<RunSdkActionResponse>('/v1/sdk/run_action', request);
    return response.data;
  }

  /**
   * Gets the status of a specific Task V2
   */
  async getTaskStatus(taskId: string): Promise<TaskV2Response> {
    const response = await this.client.get<TaskV2Response>(`/api/v2/tasks/${taskId}`);
    return response.data;
  }
}
