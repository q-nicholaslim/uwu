import OpenAI from 'openai';
import { $ } from "bun";
import os from "os";
import fs from "fs";
import path from "path";
import envPaths from "env-paths";

interface Config {
  apiKey?: string;
  model: string;
  baseURL?: string;
}

const DEFAULT_CONFIG: Config = {
  model: "gpt-4.1",
};

function getConfig(): Config {
  const paths = envPaths('uwu', { suffix: '' });
  const configPath = path.join(paths.config, "config.json");

  if (!fs.existsSync(configPath)) {
    // If the config file doesn't exist, we'll use defaults.
    // We'll check for the API key from the environment as a fallback.
    return {
      ...DEFAULT_CONFIG,
      apiKey: process.env.OPENAI_API_KEY,
    };
  }

  try {
    const rawConfig = fs.readFileSync(configPath, "utf-8");
    const userConfig = JSON.parse(rawConfig);

    // Merge user config with defaults, and also check env for API key as a fallback.
    return {
      ...DEFAULT_CONFIG,
      ...userConfig,
      apiKey: userConfig.apiKey || process.env.OPENAI_API_KEY,
    };
  } catch (error) {
    console.error("Error reading or parsing the configuration file at:", configPath);
    console.error("Please ensure it is a valid JSON file.");
    process.exit(1);
  }
}

const config = getConfig();

// The rest of the arguments are the command description
const commandDescription = process.argv.slice(2).join(' ').trim();

if (!commandDescription) {
  console.error("Error: No command description provided.");
  console.error("Usage: uwu <command description>");
  process.exit(1);
}

// Only require API key if no base URL is provided
if (!config.apiKey && !config.baseURL) {
  console.error("Error: API key not provided.");
  console.error("Please provide an API key in your config.json file or by setting the OPENAI_API_KEY environment variable.");
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
  apiKey: config.apiKey,
  baseURL: config.baseURL,
});

const response = await openai.chat.completions.create({
  model: config.model,
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