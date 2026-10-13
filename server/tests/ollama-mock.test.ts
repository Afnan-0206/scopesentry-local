import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OllamaService } from '../src/services/ollama.service.js';

describe('OllamaService (Mocked Integration)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should parse valid JSON response from Ollama', async () => {
    const mockOutput = { primaryStatus: 'INCLUDED', shortSummary: 'Matches deliverables.' };
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: { content: JSON.stringify(mockOutput) }
      })
    } as any);

    const service = new OllamaService('http://127.0.0.1:11434', 'qwen2.5:7b', 5000);
    const result = await service.chatJson<{ primaryStatus: string }>('System', 'User');

    expect(result.primaryStatus).toBe('INCLUDED');
  });

  it('should strip markdown code fences if model wraps JSON', async () => {
    const mockOutput = { primaryStatus: 'POTENTIAL SCOPE CHANGE' };
    const wrappedContent = `\`\`\`json\n${JSON.stringify(mockOutput)}\n\`\`\``;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: { content: wrappedContent }
      })
    } as any);

    const service = new OllamaService('http://127.0.0.1:11434', 'qwen2.5:7b', 5000);
    const result = await service.chatJson<{ primaryStatus: string }>('System', 'User');

    expect(result.primaryStatus).toBe('POTENTIAL SCOPE CHANGE');
  });

  it('should throw clear error when model is not found (HTTP 404)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => 'model not found'
    } as any);

    const service = new OllamaService('http://127.0.0.1:11434', 'nonexistent-model', 5000);
    await expect(service.chatJson('System', 'User')).rejects.toThrow(/not found in Ollama/);
  });

  it('should report health and detect configured model availability', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith('/api/tags')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            models: [{ name: 'qwen2.5:7b' }, { name: 'llama3:8b' }]
          })
        });
      }
      if (url.endsWith('/api/version')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ version: '0.40.3' })
        });
      }
      return Promise.reject(new Error('Unknown url'));
    });

    const service = new OllamaService('http://127.0.0.1:11434', 'qwen2.5:7b', 5000);
    const health = await service.getHealth();

    expect(health.isRunning).toBe(true);
    expect(health.version).toBe('0.40.3');
    expect(health.isConfiguredModelInstalled).toBe(true);
    expect(health.availableModels).toContain('qwen2.5:7b');
  });

  it('should report unhealthy when connection is refused', async () => {
    const error: any = new Error('ECONNREFUSED');
    error.code = 'ECONNREFUSED';
    global.fetch = vi.fn().mockRejectedValue(error);

    const service = new OllamaService('http://127.0.0.1:11434', 'qwen2.5:7b', 5000);
    const health = await service.getHealth();

    expect(health.isRunning).toBe(false);
    expect(health.error).toContain('Connection refused');
  });
});
