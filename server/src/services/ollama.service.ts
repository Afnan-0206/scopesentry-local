import { CONFIG } from '../config.js';

export interface OllamaHealthStatus {
  isRunning: boolean;
  version?: string;
  configuredModel: string;
  isConfiguredModelInstalled: boolean;
  availableModels: string[];
  error?: string;
}

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OllamaService {
  private baseUrl: string;
  private configuredModel: string;
  private timeoutMs: number;

  constructor(
    baseUrl: string = CONFIG.OLLAMA_BASE_URL,
    configuredModel: string = CONFIG.OLLAMA_MODEL,
    timeoutMs: number = CONFIG.OLLAMA_TIMEOUT_MS
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.configuredModel = configuredModel;
    this.timeoutMs = timeoutMs;
  }

  /**
   * Check connection and model availability
   */
  public async getHealth(): Promise<OllamaHealthStatus> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        return {
          isRunning: false,
          configuredModel: this.configuredModel,
          isConfiguredModelInstalled: false,
          availableModels: [],
          error: `Ollama returned HTTP ${res.status}: ${res.statusText}`,
        };
      }

      const data = (await res.json()) as { models?: Array<{ name: string }> };
      const availableModels = (data.models || []).map((m) => m.name);

      // Check version
      let version: string | undefined;
      try {
        const vRes = await fetch(`${this.baseUrl}/api/version`, { signal: AbortSignal.timeout(3000) });
        if (vRes.ok) {
          const vData = (await vRes.json()) as { version?: string };
          version = vData.version;
        }
      } catch {
        // version endpoint optional
      }

      const isConfiguredModelInstalled = availableModels.some(
        (m) => m === this.configuredModel || m.startsWith(`${this.configuredModel}:`) || this.configuredModel.startsWith(`${m}:`)
      );

      return {
        isRunning: true,
        version,
        configuredModel: this.configuredModel,
        isConfiguredModelInstalled,
        availableModels,
      };
    } catch (err: any) {
      const message = err.name === 'AbortError' 
        ? 'Connection timed out trying to reach Ollama.'
        : err.code === 'ECONNREFUSED'
        ? `Connection refused at ${this.baseUrl}. Is the Ollama daemon running?`
        : err.message || 'Unknown Ollama connection error.';

      return {
        isRunning: false,
        configuredModel: this.configuredModel,
        isConfiguredModelInstalled: false,
        availableModels: [],
        error: message,
      };
    }
  }

  /**
   * List all available models installed in Ollama
   */
  public async listModels(): Promise<{ models: string[]; configured: string; isConfiguredAvailable: boolean }> {
    const health = await this.getHealth();
    return {
      models: health.availableModels,
      configured: this.configuredModel,
      isConfiguredAvailable: health.isConfiguredModelInstalled,
    };
  }

  /**
   * Sends a structured chat completion request to Ollama.
   * Uses format: "json" for broad compatibility (Ollama 0.4.x+ through 0.5.x+).
   */
  public async chatJson<T>(
    systemPrompt: string,
    userPrompt: string,
    overrideModel?: string
  ): Promise<T> {
    const modelToUse = overrideModel || this.configuredModel;

    const messages: OllamaChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const body = {
      model: modelToUse,
      messages,
      stream: false,
      format: 'json',
      options: {
        temperature: 0.1, // low temperature for deterministic, consistent extraction
      },
    };

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (err: any) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        throw new Error(
          `Ollama inference timed out after ${this.timeoutMs / 1000}s. Try a smaller model or increase OLLAMA_TIMEOUT_MS.`
        );
      }
      if (err.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to Ollama at ${this.baseUrl}. Please verify Ollama is running.`);
      }
      throw new Error(`Ollama request failed: ${err.message}`);
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      if (response.status === 404) {
        throw new Error(
          `Model "${modelToUse}" not found in Ollama. Run "ollama pull ${modelToUse}" to install it, or select an available model.`
        );
      }
      throw new Error(`Ollama API error (${response.status}): ${errText || response.statusText}`);
    }

    let rawData: any;
    try {
      rawData = await response.json();
    } catch (e: any) {
      throw new Error(`Invalid JSON received from Ollama API: ${e.message}`);
    }

    const content = rawData?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error('Ollama returned empty response message content.');
    }

    try {
      const parsed = JSON.parse(content.trim());
      return parsed as T;
    } catch (jsonErr: any) {
      // In case the model wrapped the JSON in markdown code blocks: ```json ... ```
      const cleaned = content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      try {
        const parsed = JSON.parse(cleaned);
        return parsed as T;
      } catch {
        throw new Error(
          `Failed to parse model output as valid JSON: ${jsonErr.message}. Output was: ${content.substring(0, 200)}...`
        );
      }
    }
  }
}

export const defaultOllamaService = new OllamaService();
