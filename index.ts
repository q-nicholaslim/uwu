import OpenAI from 'openai';
import { $ } from "bun";
import os from "os";

// Parse command line arguments
let apiKey = process.env.OPENAI_API_KEY;
let model = "gpt-4.1";
let baseURL = undefined;
const commandArgs: string[] = [];

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--api-key" || arg === "-k") {
    if (i + 1 < args.length) {
      apiKey = args[++i];
    } else {
      console.error(`Error: Missing value for ${arg}`);
      process.exit(1);
    }
  } else if (arg === "--model" || arg === "-m") {
    if (i + 1 < args.length) {
      model = args[++i];
    } else {
      console.error(`Error: Missing value for ${arg}`);
      process.exit(1);
    }
  } else if (arg === "--base-url" || arg === "-b") {
    if (i + 1 < args.length) {
      baseURL = args[++i];
    } else {
      console.error(`Error: Missing value for ${arg}`);
      process.exit(1);
    }
  } else {
    commandArgs.push(arg);
  }
}

const commandDescription = commandArgs.join(' ').trim();

if (!commandDescription) {
  console.error("Error: No command description provided.");
  console.error("Usage: uwu-cli [--api-key <key>] [--model <model>] [--base-url <url>] <command description>");
  process.exit(1);
}

// Only require API key if no base URL is provided
if (!apiKey && !baseURL) {
  console.error("Error: API key not provided.");
  console.error("Please provide an API key using the --api-key flag or by setting the OPENAI_API_KEY environment variable, or provide a --base-url.");
  process.exit(1);
}

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

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: baseURL,
});

const response = await openai.chat.completions.create({
  model: model,
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

console.log(response?.choices[0]?.message?.content?.trim());