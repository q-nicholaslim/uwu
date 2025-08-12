import { z } from 'zod';

export const configSchema = z.object({
  provider: z.enum(['openai', 'ollama']),
  openai: z.object({
    apiKey: z.string().optional(),
    model: z.string().default('gpt-4.1'),
  }).optional(),
  ollama: z.object({
    baseUrl: z.string().default('http://localhost:11434'),
    model: z.string().default('llama3'),
  }).optional(),
});

export type Config = z.infer<typeof configSchema>;
