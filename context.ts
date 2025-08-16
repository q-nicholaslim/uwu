import fs from "fs";
import path from "path";
import os from "os";

export interface ContextConfig {
  enabled?: boolean;
  maxHistoryCommands?: number;
}

export const DEFAULT_CONTEXT_CONFIG: ContextConfig = {
  enabled: false,
  maxHistoryCommands: 10,
};

// Shell history parsing functions
function getHistoryFilePath(): string | null {
  const shell = process.env.SHELL || "";
  const home = os.homedir();

  if (shell.includes("zsh")) {
    return process.env.HISTFILE || path.join(home, ".zsh_history");
  } else if (shell.includes("bash")) {
    return process.env.HISTFILE || path.join(home, ".bash_history");
  } else if (shell.includes("fish")) {
    return path.join(home, ".local", "share", "fish", "fish_history");
  }

  // Try common paths as fallback
  const commonPaths = [
    path.join(home, ".zsh_history"),
    path.join(home, ".bash_history"),
    path.join(home, ".local", "share", "fish", "fish_history"),
  ];

  for (const histPath of commonPaths) {
    if (fs.existsSync(histPath)) {
      return histPath;
    }
  }

  return null;
}

function parseShellHistory(historyPath: string, maxCommands: number): string[] {
  try {
    const content = fs.readFileSync(historyPath, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim());
    const commands: string[] = [];

    // Detect shell type from path or content
    if (historyPath.includes("zsh")) {
      // zsh format: : timestamp:0;command
      for (const line of lines) {
        const match = line.match(/^:\s*\d+:\d+;(.*)$/);
        if (match && match[1]) {
          commands.push(match[1]);
        } else if (!line.startsWith(":")) {
          // Multi-line commands continuation
          if (commands.length > 0) {
            commands[commands.length - 1] += "\n" + line;
          }
        }
      }
    } else if (historyPath.includes("fish")) {
      // fish format: - cmd: command
      for (let i = 0; i < lines.length; i++) {
        const lineMatch = lines[i]?.match(/^- cmd:\s*(.*)$/);
        if (lineMatch && lineMatch[1]) {
          let cmd = lineMatch[1];
          // Handle multi-line commands in fish
          while (i + 1 < lines.length && lines[i + 1]?.startsWith("  ")) {
            i++;
            const nextLine = lines[i];
            if (nextLine) {
              cmd += "\n" + nextLine.substring(2);
            }
          }
          commands.push(cmd);
        }
      }
    } else {
      // bash format: plain commands, skip lines starting with #
      for (const line of lines) {
        if (!line.startsWith("#") && line.trim()) {
          commands.push(line);
        }
      }
    }

    // Return the last N commands
    return commands.slice(-maxCommands);
  } catch (error) {
    // Fail gracefully - history is optional
    return [];
  }
}

function getRecentCommands(maxCommands: number): string[] {
  const historyPath = getHistoryFilePath();
  if (!historyPath) {
    return [];
  }

  return parseShellHistory(historyPath, maxCommands);
}

export function buildContextHistory(contextConfig: ContextConfig): string {
  let historyContext = "";

  if (contextConfig.enabled === true) {
    // Get recent commands
    const recentCommands = getRecentCommands(
      contextConfig.maxHistoryCommands ||
        DEFAULT_CONTEXT_CONFIG.maxHistoryCommands!
    );
    if (recentCommands.length > 0) {
      historyContext += "\n--- RECENT COMMANDS ---\n";
      historyContext += "Recent shell commands (most recent last):\n";
      recentCommands.forEach((cmd, idx) => {
        historyContext += `${idx + 1}. ${cmd}\n`;
      });
      historyContext += "--- END COMMAND HISTORY ---\n";
    }
  }

  return historyContext;
}
