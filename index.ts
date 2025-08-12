import OpenAI from 'openai';
import { configSchema } from './config';
import fetch from 'node-fetch';
import { $ } from "bun";
import os from "os";

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Error: No command description provided.");
  console.error("Usage: ./bin <command description>");
  process.exit(1);
}

const commandDescription = args.join(' ').trim();
if (!commandDescription) {
  console.error("Error: Command description cannot be empty.");
  process.exit(1);
}

// Read config from environment variables
const config = configSchema.parse({
  provider: process.env.UWU_PROVIDER || 'openai',
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4.1',
  },
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'gemma3:4b',
  },
});

// Build the environment context
const envContext = `
Operating System: ${os.type()} ${os.release()} (${os.platform()} - ${os.arch()})
Node.js Version: ${process.version}
Shell: ${process.env.SHELL || "unknown"}
Current Working Directory: ${process.cwd()}
Home Directory: ${os.homedir()}
CPU Info: ${os.cpus()[0]?.model} (${os.cpus().length} cores)
Total Memory: ${(os.totalmem() / 1024 / 1024).toFixed(0)} MB
Free Memory: ${(os.freemem() / 1024 / 1024).toFixed(0)} MB
`;

// Get `ls -l` output (handle potential errors)
let lsResult = "";
try {
  lsResult = await $`ls`.text();
} catch (error) {
  console.error("Error getting directory listing:", error);
  // If ls fails, provide fallback information
  lsResult = "Unable to get directory listing";
}

// System prompt
const systemPrompt = `
You live in a developer's CLI, helping them convert natural language into CLI commands. 
Based on the description of the command given, generate the command. Output only the command and nothing else. 
Make sure to escape characters when appropriate. The result of \`ls -l\` is given with the command. 
This may be helpful depending on the description given. Do not include any other text in your response, except for the command.
Do not wrap the command in quotes.

--- ENVIRONMENT CONTEXT ---
${envContext}
--- END ENVIRONMENT CONTEXT ---

Result of \`ls -l\` in working directory:
${lsResult}
`;

// User prompt
const userPrompt = (commandDescription: string) => `
Command description:
${commandDescription}
`;

async function getCommandFromProvider() {
  if (config.provider === 'openai') {
    const openai = new OpenAI({
      apiKey: config.openai?.apiKey,
    });
    const response = await openai.chat.completions.create({
      model: config.openai?.model || 'gpt-4.1',
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt(commandDescription),
        },
      ],
    });
    return response?.choices[0]?.message?.content?.trim();
  } else if (config.provider === 'ollama') {
    // Ollama API expects a POST to /api/chat with { model, messages }
    const res = await fetch(`${config.ollama?.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ollama?.model || 'llama3',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt(commandDescription) },
        ],
        stream: false,
      }),
    });
    const rawText = await res.text();
    if (!res.ok) {
      throw new Error(`Ollama API error: ${res.status} ${rawText}`);
    }
    const data = JSON.parse(rawText) as { message?: { content?: string } };
    return data.message?.content?.trim();
  } else {
    throw new Error(`Unknown provider: ${config.provider}`);
  }
}

getCommandFromProvider()
  .then(cmd => console.log(cmd))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });